import React, { useEffect, useState } from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Typography,
  Spin,
  Tag,
  Space,
  Alert,
} from 'antd'
import {
  UserOutlined,
  CrownOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { getDashboard } from '../../services/api'
import type { DashboardStats } from '../../types'

const { Title, Text } = Typography

const COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96']

const StatCard: React.FC<{
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  suffix?: string
  precision?: number
}> = ({ title, value, icon, color, suffix, precision }) => (
  <Card
    style={{
      borderRadius: 12,
      border: 'none',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}
    bodyStyle={{ padding: '20px 24px' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Statistic
        title={<Text style={{ fontSize: 14, color: '#666' }}>{title}</Text>}
        value={value}
        precision={precision}
        suffix={suffix}
        valueStyle={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a' }}
      />
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {React.cloneElement(icon as React.ReactElement, {
          style: { fontSize: 24, color },
        })}
      </div>
    </div>
  </Card>
)

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard()
        setStats(res.data)
      } catch {
        setError('获取数据失败，请刷新重试')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const topArticleColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => (
        <Tag
          color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'default'}
          style={{ borderRadius: 4 }}
        >
          #{index + 1}
        </Tag>
      ),
    },
    {
      title: '文章标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      render: (v: number) => (
        <Text strong style={{ color: '#1677ff' }}>
          {v.toLocaleString()}
        </Text>
      ),
    },
  ]

  const pieData = stats
    ? Object.entries(stats.subscriptionByCategory).map(([name, value]) => ({ name, value }))
    : []

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          数据概览
        </Title>
        <Text type="secondary">平台整体运营数据</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <StatCard
            title="总用户数"
            value={stats?.totalUsers || 0}
            icon={<UserOutlined />}
            color="#1677ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <StatCard
            title="VIP用户"
            value={stats?.vipUsers || 0}
            icon={<CrownOutlined />}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <StatCard
            title="文章总数"
            value={stats?.totalArticles || 0}
            icon={<FileTextOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <StatCard
            title="订单总数"
            value={stats?.totalOrders || 0}
            icon={<ShoppingCartOutlined />}
            color="#fa8c16"
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <StatCard
            title="总收入"
            value={stats?.totalRevenue || 0}
            icon={<RiseOutlined />}
            color="#f5222d"
            suffix="元"
            precision={2}
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <StatCard
            title="活跃订阅"
            value={stats?.activeSubscriptions || 0}
            icon={<TeamOutlined />}
            color="#722ed1"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="热门文章 TOP5"
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <Table
              columns={topArticleColumns}
              dataSource={stats?.topArticles || []}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title="分类订阅分布"
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} 人`, '订阅人数']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                <Space direction="vertical">
                  <TeamOutlined style={{ fontSize: 48 }} />
                  <Text type="secondary">暂无订阅数据</Text>
                </Space>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
