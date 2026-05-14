import React, { useEffect, useState, useCallback } from 'react'
import {
  Table,
  Select,
  Button,
  DatePicker,
  Tag,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Tooltip,
} from 'antd'
import {
  DownloadOutlined,
  ReloadOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Order } from '../../types'
import { getOrders, exportOrders } from '../../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const statusColors: Record<string, string> = {
  PAID: 'success',
  PENDING: 'warning',
  FAILED: 'error',
  CANCELLED: 'default',
}

const statusLabels: Record<string, string> = {
  PAID: '已支付',
  PENDING: '待支付',
  FAILED: '支付失败',
  CANCELLED: '已取消',
}

const typeLabels: Record<string, string> = {
  VIP: 'VIP订阅',
  CATEGORY: '分类订阅',
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    pageSize: 20,
  })

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        pageSize: filters.pageSize,
      }
      if (filters.status) params.status = filters.status
      if (filters.type) params.type = filters.type
      if (filters.dateFrom) params.dateFrom = filters.dateFrom
      if (filters.dateTo) params.dateTo = filters.dateTo

      const res = await getOrders(params)
      setOrders(res.data.data)
      setTotal(res.data.total)

      const revenue = res.data.data
        .filter((o: Order) => o.status === 'PAID')
        .reduce((sum: number, o: Order) => sum + (o.amount || 0), 0)
      setTotalRevenue(revenue)
    } catch {
      message.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleExport = async () => {
    setExporting(true)
    try {
      const params: Record<string, unknown> = {}
      if (filters.status) params.status = filters.status
      if (filters.type) params.type = filters.type
      if (filters.dateFrom) params.dateFrom = filters.dateFrom
      if (filters.dateTo) params.dateTo = filters.dateTo

      const blob = await exportOrders(params)
      const url = URL.createObjectURL(blob as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders_${dayjs().format('YYYYMMDD')}.csv`
      a.click()
      URL.revokeObjectURL(url)
      message.success('导出成功')
    } catch {
      message.error('导出失败')
    } finally {
      setExporting(false)
    }
  }

  const columns: ColumnsType<Order> = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
      width: 180,
      render: (v: string) => (
        <Text copyable={{ text: v }} style={{ fontSize: 12 }}>
          {v.substring(0, 8)}...
        </Text>
      ),
    },
    {
      title: '用户',
      dataIndex: 'wxOpenid',
      key: 'wxOpenid',
      width: 140,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'VIP' ? 'gold' : 'blue'}>{typeLabels[type] || type}</Tag>
      ),
    },
    {
      title: '订阅项目',
      dataIndex: 'item',
      key: 'item',
      width: 120,
      render: (item: string) => <Tag>{item}</Tag>,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      sorter: (a: Order, b: Order) => a.amount - b.amount,
      render: (v: number) => (
        <Text strong style={{ color: '#f5222d' }}>
          ¥{(v || 0).toFixed(2)}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: (a: Order, b: Order) => a.createdAt.localeCompare(b.createdAt),
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            订单管理
          </Title>
          <Text type="secondary">共 {total} 条订单</Text>
        </div>
        <Tooltip title="导出当前筛选条件的订单为CSV">
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
          >
            导出 CSV
          </Button>
        </Tooltip>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card
            size="small"
            style={{
              borderRadius: 8,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Statistic
              title="本页订单数"
              value={orders.length}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            size="small"
            style={{
              borderRadius: 8,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Statistic
              title="本页已支付收入"
              value={totalRevenue}
              prefix={<RiseOutlined />}
              suffix="元"
              precision={2}
              valueStyle={{ fontSize: 20, color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="订单状态"
              value={filters.status || undefined}
              onChange={(v) => setFilters((f) => ({ ...f, status: v || '', page: 1 }))}
              allowClear
              style={{ width: '100%' }}
              options={[
                { label: '已支付', value: 'PAID' },
                { label: '待支付', value: 'PENDING' },
                { label: '支付失败', value: 'FAILED' },
                { label: '已取消', value: 'CANCELLED' },
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="订单类型"
              value={filters.type || undefined}
              onChange={(v) => setFilters((f) => ({ ...f, type: v || '', page: 1 }))}
              allowClear
              style={{ width: '100%' }}
              options={[
                { label: 'VIP订阅', value: 'VIP' },
                { label: '分类订阅', value: 'CATEGORY' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => {
                setFilters((f) => ({
                  ...f,
                  dateFrom: dates?.[0]?.format('YYYY-MM-DD') || '',
                  dateTo: dates?.[1]?.format('YYYY-MM-DD') || '',
                  page: 1,
                }))
              }}
            />
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchOrders} />
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, pageSize) =>
              setFilters((f) => ({ ...f, page, pageSize })),
          }}
        />
      </Card>
    </div>
  )
}

export default Orders
