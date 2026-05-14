import React, { useEffect, useState, useCallback } from 'react'
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
  Card,
  Row,
  Col,
  Dropdown,
  Badge,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  DownOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import type { Article } from '../../types'
import {
  getArticles,
  deleteArticle,
  batchDeleteArticles,
  batchUpdateCategory,
  batchUpdateSticky,
  getCategories,
} from '../../services/api'
import type { Category } from '../../types'

const { Title, Text } = Typography

const ArticleList: React.FC = () => {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [filters, setFilters] = useState({
    search: '',
    moduleType: '',
    category: '',
    isPremium: '',
    page: 1,
    pageSize: 20,
  })

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page: filters.page, pageSize: filters.pageSize }
      if (filters.search) params.search = filters.search
      if (filters.moduleType) params.type = filters.moduleType
      if (filters.category) params.category = filters.category
      if (filters.isPremium !== '') params.isPremium = filters.isPremium === 'true'

      const res = await getArticles(params)
      setArticles(res.data.data)
      setTotal(res.data.total)
    } catch {
      message.error('获取文章列表失败')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteArticle(id)
      message.success('删除成功')
      fetchArticles()
    } catch (error: unknown) {
      let errorMessage = '删除失败'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        if (axiosError.response?.data?.message) {
          errorMessage = `${errorMessage}：${axiosError.response.data.message}`
        }
      }
      message.error(errorMessage)
    }
  }

  const handleBatchDelete = async () => {
    try {
      await batchDeleteArticles(selectedRowKeys as string[])
      message.success(`成功删除 ${selectedRowKeys.length} 篇文章`)
      setSelectedRowKeys([])
      fetchArticles()
    } catch (error: unknown) {
      let errorMessage = '批量删除失败'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        if (axiosError.response?.data?.message) {
          errorMessage = `${errorMessage}：${axiosError.response.data.message}`
        }
      }
      message.error(errorMessage)
    }
  }

  const handleBatchSticky = async (isSticky: boolean) => {
    try {
      await batchUpdateSticky(selectedRowKeys as string[], isSticky)
      message.success('操作成功')
      setSelectedRowKeys([])
      fetchArticles()
    } catch (error: unknown) {
      let errorMessage = '操作失败'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        if (axiosError.response?.data?.message) {
          errorMessage = `${errorMessage}：${axiosError.response.data.message}`
        }
      }
      message.error(errorMessage)
    }
  }

  const handleBatchCategory = async (category: string) => {
    try {
      await batchUpdateCategory(selectedRowKeys as string[], category)
      message.success('分类更新成功')
      setSelectedRowKeys([])
      fetchArticles()
    } catch (error: unknown) {
      let errorMessage = '操作失败'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        if (axiosError.response?.data?.message) {
          errorMessage = `${errorMessage}：${axiosError.response.data.message}`
        }
      }
      message.error(errorMessage)
    }
  }

  const columns: ColumnsType<Article> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: Article) => (
        <Space>
          {record.isSticky && <Tag color="red">置顶</Tag>}
          <Text style={{ maxWidth: 300 }} ellipsis={{ tooltip: text }}>
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 110,
      render: (cat: string) => <Tag color="blue">{cat}</Tag>,
    },
    {
      title: '模块',
      dataIndex: 'moduleType',
      key: 'moduleType',
      width: 90,
      render: (moduleType: string) => (
        <Tag color={moduleType === 'industry' ? 'cyan' : moduleType === 'policy' ? 'purple' : 'orange'}>
          {moduleType === 'industry' ? '产业' : moduleType === 'policy' ? '政策' : '其他'}
        </Tag>
      ),
    },

    {
      title: '属性',
      dataIndex: 'isPremium',
      key: 'isPremium',
      width: 80,
      render: (isPremium: boolean) => (
        <Badge
          status={isPremium ? 'warning' : 'success'}
          text={isPremium ? '付费' : '免费'}
        />
      ),
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 90,
      sorter: (a: Article, b: Article) => a.viewCount - b.viewCount,
      render: (v: number) => (
        <Space size={4}>
          <EyeOutlined style={{ color: '#999' }} />
          <Text>{v}</Text>
        </Space>
      ),
    },
    {
      title: '发布日期',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      sorter: (a: Article, b: Article) => a.date.localeCompare(b.date),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: Article) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/articles/${record.id}/edit`)}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除该文章？"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const batchMenuItems = [
    {
      key: 'sticky',
      label: '设为置顶',
      onClick: () => handleBatchSticky(true),
    },
    {
      key: 'unsticky',
      label: '取消置顶',
      onClick: () => handleBatchSticky(false),
    },
    { type: 'divider' as const },
    ...categories.map((c) => ({
      key: `cat_${c.id}`,
      label: `移至: ${c.name}`,
      onClick: () => handleBatchCategory(c.name),
    })),
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
            文章管理
          </Title>
          <Text type="secondary">共 {total} 篇文章</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/articles/new')}
          size="large"
        >
          发布文章
        </Button>
      </div>

      <Card
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="搜索标题或摘要..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="所属模块"
              value={filters.moduleType || undefined}
              onChange={(v) => setFilters((f) => ({ ...f, moduleType: v || '', page: 1 }))}
              allowClear
              style={{ width: '100%' }}
              options={[
                { label: '产业情报', value: 'industry' },
                { label: '政策通', value: 'policy' },
                { label: '电子刊物', value: 'publication' },
              ]}
              suffixIcon={<FilterOutlined />}
            />
          </Col>

          <Col xs={12} sm={6} md={5} lg={4}>
            <Select
              placeholder="选择分类"
              value={filters.category || undefined}
              onChange={(v) => setFilters((f) => ({ ...f, category: v || '', page: 1 }))}
              allowClear
              style={{ width: '100%' }}
              options={categories.map((c) => ({ label: c.name, value: c.name }))}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="付费属性"
              value={filters.isPremium || undefined}
              onChange={(v) => setFilters((f) => ({ ...f, isPremium: v || '', page: 1 }))}
              allowClear
              style={{ width: '100%' }}
              options={[
                { label: '付费', value: 'true' },
                { label: '免费', value: 'false' },
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={3} lg={2}>
            <Button icon={<ReloadOutlined />} onClick={fetchArticles} block />
          </Col>
        </Row>

        {selectedRowKeys.length > 0 && (
          <div
            style={{
              marginBottom: 12,
              padding: '10px 16px',
              background: '#e6f4ff',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Text>已选 {selectedRowKeys.length} 篇</Text>
            <Popconfirm
              title={`确认删除 ${selectedRowKeys.length} 篇文章？`}
              onConfirm={handleBatchDelete}
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                批量删除
              </Button>
            </Popconfirm>
            <Dropdown menu={{ items: batchMenuItems }}>
              <Button size="small">
                批量操作 <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, pageSize) => setFilters((f) => ({ ...f, page, pageSize })),
          }}
        />
      </Card>
    </div>
  )
}

export default ArticleList
