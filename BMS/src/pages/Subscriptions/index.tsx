import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Modal,
  InputNumber,
  message,
  Popconfirm,
  Card,
  Statistic,
  Row,
  Col,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ReloadOutlined,
  ClockCircleOutlined,
  StopOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import {
  getSubscriptions,
  extendSubscription,
  cancelSubscription,
  deleteSubscription,
  getCategories,
} from '../../services/api'
import type { Subscription, Category } from '../../types'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select

const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>()
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>()
  
  // 延长订阅模态框
  const [extendModalVisible, setExtendModalVisible] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [extendDays, setExtendDays] = useState(30)

  // 统计数据
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadSubscriptions()
  }, [page, pageSize, search, categoryFilter, activeFilter])

  const loadCategories = async () => {
    try {
      const res = await getCategories()
      setCategories(res.data)
    } catch (error) {
      console.error('加载分类失败', error)
    }
  }

  const loadSubscriptions = async () => {
    setLoading(true)
    try {
      const res = await getSubscriptions({
        page,
        pageSize,
        search,
        category: categoryFilter,
        activeOnly: activeFilter,
      })
      setSubscriptions(res.data.data)
      setTotal(res.data.total)
      
      // 计算统计数据
      const active = res.data.data.filter((s: Subscription) => s.isActive).length
      const expiringSoon = res.data.data.filter(
        (s: Subscription) => s.isActive && s.daysRemaining <= 7
      ).length
      setStats({
        total: res.data.total,
        active,
        expiringSoon,
      })
    } catch (error: any) {
      message.error(error.response?.data?.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleExtend = (record: Subscription) => {
    setSelectedSubscription(record)
    setExtendDays(30)
    setExtendModalVisible(true)
  }

  const handleExtendConfirm = async () => {
    if (!selectedSubscription) return
    try {
      await extendSubscription(selectedSubscription.id, extendDays)
      message.success('订阅期限已延长')
      setExtendModalVisible(false)
      loadSubscriptions()
    } catch (error: any) {
      message.error(error.response?.data?.message || '延长失败')
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await cancelSubscription(id)
      message.success('订阅已取消')
      loadSubscriptions()
    } catch (error: any) {
      message.error(error.response?.data?.message || '取消失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscription(id)
      message.success('订阅已删除')
      loadSubscriptions()
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除失败')
    }
  }

  const columns: ColumnsType<Subscription> = [
    {
      title: '用户',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div>
          <div>{record.userNickname || '未设置昵称'}</div>
          {record.userPhone && (
            <div style={{ fontSize: 12, color: '#999' }}>{record.userPhone}</div>
          )}
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => {
        const cat = categories.find((c) => c.name === category)
        return (
          <Tag color={cat?.color || 'blue'} style={{ borderRadius: 4 }}>
            {category}
          </Tag>
        )
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={record.isActive ? 'success' : 'default'}>
          {record.isActive ? '活跃' : '已过期'}
        </Tag>
      ),
    },
    {
      title: '剩余天数',
      dataIndex: 'daysRemaining',
      key: 'daysRemaining',
      width: 100,
      render: (days: number, record) => {
        if (!record.isActive) return <span style={{ color: '#999' }}>-</span>
        const color = days <= 3 ? 'red' : days <= 7 ? 'orange' : 'green'
        return <span style={{ color, fontWeight: 'bold' }}>{days} 天</span>
      },
    },
    {
      title: '到期时间',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleExtend(record)}
          >
            延长
          </Button>
          {record.isActive && (
            <Popconfirm
              title="确定要取消此订阅吗？"
              onConfirm={() => handleCancel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<StopOutlined />}>
                取消
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="确定要删除此订阅记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>订阅管理</h2>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="总订阅数" value={stats.total} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="活跃订阅"
              value={stats.active}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="即将过期（7天内）"
              value={stats.expiringSoon}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <Search
            placeholder="搜索用户昵称或手机号"
            allowClear
            style={{ width: 250 }}
            onSearch={(value) => {
              setSearch(value)
              setPage(1)
            }}
          />
          <Select
            placeholder="选择分类"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => {
              setCategoryFilter(value)
              setPage(1)
            }}
          >
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.name}>
                {cat.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="订阅状态"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => {
              setActiveFilter(value)
              setPage(1)
            }}
          >
            <Option value={true}>活跃</Option>
            <Option value={false}>已过期</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={loadSubscriptions}>
            刷新
          </Button>
        </Space>
      </Card>

      {/* 订阅列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={subscriptions}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page)
              setPageSize(pageSize)
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 延长订阅模态框 */}
      <Modal
        title="延长订阅期限"
        open={extendModalVisible}
        onOk={handleExtendConfirm}
        onCancel={() => setExtendModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        {selectedSubscription && (
          <div>
            <p>
              <strong>用户：</strong>
              {selectedSubscription.userNickname || '未设置昵称'}
            </p>
            <p>
              <strong>分类：</strong>
              {selectedSubscription.category}
            </p>
            <p>
              <strong>当前到期时间：</strong>
              {dayjs(selectedSubscription.expiryDate).format('YYYY-MM-DD')}
            </p>
            <div style={{ marginTop: 16 }}>
              <label>延长天数：</label>
              <InputNumber
                min={1}
                max={3650}
                value={extendDays}
                onChange={(value) => setExtendDays(value || 30)}
                style={{ width: '100%', marginTop: 8 }}
                addonAfter="天"
              />
              <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                延长后到期时间：
                {dayjs(selectedSubscription.expiryDate)
                  .add(extendDays, 'day')
                  .format('YYYY-MM-DD')}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SubscriptionsPage
