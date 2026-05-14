import React, { useEffect, useState, useCallback } from 'react'
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  InputNumber,
  Switch,
  Select,
  Tag,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Descriptions,
  message,
  Tooltip,
  Avatar,
  Badge,
} from 'antd'
import {
  SearchOutlined,
  EditOutlined,
  UserOutlined,
  CrownOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { User, UserAdminUpdate } from '../../types'
import { getUsers, updateUser } from '../../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const tierColors: Record<string, string> = {
  NONE: 'default',
  MONTHLY: 'blue',
  QUARTERLY: 'cyan',
  YEARLY: 'gold',
}

const tierLabels: Record<string, string> = {
  NONE: '无',
  MONTHLY: '月度',
  QUARTERLY: '季度',
  YEARLY: '年度',
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editForm] = Form.useForm()
  const [saving, setSaving] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, pageSize }
      if (search) params.search = search
      const res = await getUsers(params)
      setUsers(res.data.data)
      setTotal(res.data.total)
    } catch {
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    editForm.setFieldsValue({
      isVip: user.isVip,
      subscriptionTier: user.subscriptionTier,
      credits: user.credits,
      vipExpiry: user.vipExpiry || '',
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = async (values: UserAdminUpdate) => {
    if (!selectedUser) return
    setSaving(true)
    try {
      await updateUser(selectedUser.id, values)
      message.success('用户信息更新成功')
      setEditModalOpen(false)
      fetchUsers()
    } catch {
      message.error('更新失败')
    } finally {
      setSaving(false)
    }
  }

  const columns: ColumnsType<User> = [
    {
      title: '用户',
      key: 'user',
      render: (_: unknown, record: User) => (
        <Space>
          <Badge
            count={record.isVip ? <CrownOutlined style={{ color: '#faad14' }} /> : 0}
            offset={[-5, 5]}
          >
            <Avatar
              src={record.avatarUrl}
              style={{ background: record.isVip ? '#faad14' : '#1677ff' }}
              icon={!record.avatarUrl && <UserOutlined />}
              size="large"
            />
          </Badge>
          <div>
            <Text strong>{record.nickname || '未设置昵称'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              邀请码: {record.inviteCode}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'VIP状态',
      key: 'vip',
      width: 100,
      render: (_: unknown, record: User) => (
        <Badge
          status={record.isVip ? 'warning' : 'default'}
          text={record.isVip ? 'VIP' : '普通'}
        />
      ),
    },
    {
      title: '订阅套餐',
      dataIndex: 'subscriptionTier',
      key: 'subscriptionTier',
      width: 100,
      render: (tier: string) => (
        <Tag color={tierColors[tier] || 'default'}>{tierLabels[tier] || tier}</Tag>
      ),
    },
    {
      title: 'VIP到期',
      dataIndex: 'vipExpiry',
      key: 'vipExpiry',
      width: 120,
      render: (date: string) => {
        if (!date) return <Text type="secondary">-</Text>
        const expired = dayjs(date).isBefore(dayjs())
        return (
          <Text type={expired ? 'danger' : 'success'}>
            {date}
          </Text>
        )
      },
    },
    {
      title: '积分',
      dataIndex: 'credits',
      key: 'credits',
      width: 80,
      sorter: (a: User, b: User) => a.credits - b.credits,
      render: (v: number) => <Text strong style={{ color: '#1677ff' }}>{v}</Text>,
    },
    {
      title: '邀请人数',
      dataIndex: 'invitedCount',
      key: 'invitedCount',
      width: 90,
      sorter: (a: User, b: User) => a.invitedCount - b.invitedCount,
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: unknown, record: User) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<UserOutlined />}
              onClick={() => {
                setSelectedUser(record)
                setDetailModalOpen(true)
              }}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>
          用户管理
        </Title>
        <Text type="secondary">共 {total} 位用户</Text>
      </div>

      <Card
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <Row gutter={12} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索OpenID或邀请码..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              allowClear
            />
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers} />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
          }}
        />
      </Card>

      {/* 编辑用户 Modal */}
      <Modal
        title="编辑用户信息"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        width={480}
      >
        <Form form={editForm} layout="vertical" onFinish={handleSaveEdit}>
          <Form.Item name="isVip" label="VIP状态" valuePropName="checked">
            <Switch checkedChildren="VIP" unCheckedChildren="普通" />
          </Form.Item>

          <Form.Item name="subscriptionTier" label="订阅套餐">
            <Select
              options={[
                { label: '无', value: 'NONE' },
                { label: '月度', value: 'MONTHLY' },
                { label: '季度', value: 'QUARTERLY' },
                { label: '年度', value: 'YEARLY' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="credits"
            label="积分余额"
            rules={[{ required: true, message: '请输入积分' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="vipExpiry" label="VIP到期日期（YYYY-MM-DD）">
            <Input placeholder="如: 2025-12-31" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 用户详情 Modal */}
      <Modal
        title="用户详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={
          <Button type="primary" onClick={() => {
            setDetailModalOpen(false)
            if (selectedUser) handleEdit(selectedUser)
          }}>
            编辑用户
          </Button>
        }
        width={560}
      >
        {selectedUser && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="头像" span={2}>
              <Space>
                <Badge
                  count={selectedUser.isVip ? <CrownOutlined style={{ color: '#faad14' }} /> : 0}
                  offset={[-8, 8]}
                >
                  <Avatar
                    src={selectedUser.avatarUrl}
                    style={{ background: selectedUser.isVip ? '#faad14' : '#1677ff' }}
                    icon={!selectedUser.avatarUrl && <UserOutlined />}
                    size={64}
                  />
                </Badge>
                <div>
                  <Text strong>{selectedUser.nickname || '未设置昵称'}</Text>
                  <br />
                  {selectedUser.avatarUrl && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <a href={selectedUser.avatarUrl} target="_blank" rel="noopener noreferrer">
                        查看原图
                      </a>
                    </Text>
                  )}
                </div>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="用户ID" span={2}>
              <Text copyable style={{ fontSize: 12 }}>{selectedUser.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="微信OpenID" span={2}>
              <Text copyable style={{ fontSize: 12 }}>{selectedUser.wxOpenid}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="手机号">
              {selectedUser.phone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="VIP状态">
              <Badge
                status={selectedUser.isVip ? 'warning' : 'default'}
                text={selectedUser.isVip ? 'VIP会员' : '普通用户'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="订阅套餐">
              <Tag color={tierColors[selectedUser.subscriptionTier]}>
                {tierLabels[selectedUser.subscriptionTier]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="VIP到期">
              {selectedUser.vipExpiry || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="积分">
              <Text strong style={{ color: '#1677ff' }}>{selectedUser.credits}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="邀请码">
              <Text copyable>{selectedUser.inviteCode}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="邀请人数">
              {selectedUser.invitedCount}
            </Descriptions.Item>
            <Descriptions.Item label="注册时间" span={2}>
              {dayjs(selectedUser.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default Users
