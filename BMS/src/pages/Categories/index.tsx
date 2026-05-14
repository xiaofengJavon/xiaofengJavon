import React, { useEffect, useState, useMemo } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Typography,
  Card,
  Tag,
  Popconfirm,
  message,
  Tooltip,
  ColorPicker,
  Badge,
  Row,
  Col,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HolderOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import type { Category, CategoryFormData } from '../../types'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../../services/api'

const { Title, Text } = Typography

// 可拖拽的表格行组件
interface DraggableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string
}

const DraggableRow: React.FC<DraggableRowProps> = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  })

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  }

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />
  )
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  
  // 搜索条件状态
  const [searchName, setSearchName] = useState('')
  const [filterType, setFilterType] = useState<string | undefined>(undefined)
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([null, null])
  const [subscriberRange, setSubscriberRange] = useState<[number | null, number | null]>([null, null])
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await getCategories()
      setCategories(res.data)
    } catch {
      message.error('获取分类失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ color: '#1677ff', type: 'industry' })
    setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditingId(cat.id)
    form.setFieldsValue({
      name: cat.name,
      color: cat.color,
      type: cat.type,
      priceMonthly: cat.priceMonthly,
      priceQuarterly: cat.priceQuarterly,
      priceYearly: cat.priceYearly,
    })
    setModalOpen(true)
  }

  const handleSave = async (values: CategoryFormData & { color: unknown }) => {
    setSaving(true)
    try {
      const colorVal =
        typeof values.color === 'string'
          ? values.color
          : (values.color as { toHexString?: () => string })?.toHexString?.() || '#1677ff'

      const payload = { ...values, color: colorVal }

      if (editingId) {
        await updateCategory(editingId, payload)
        message.success('分类更新成功')
      } else {
        await createCategory(payload)
        message.success('分类创建成功')
      }
      setModalOpen(false)
      fetchCategories()
    } catch (error: unknown) {
      // 提取后端返回的详细错误信息
      let errorMessage = editingId ? '更新失败' : '创建失败'
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; data?: Record<string, string> } } }
        const responseData = axiosError.response?.data
        
        if (responseData?.data && typeof responseData.data === 'object') {
          // 如果有验证错误（在data字段中），显示所有错误信息
          const errorMessages = Object.entries(responseData.data)
            .map(([field, msg]) => `${msg}`)
            .join('；')
          errorMessage = `${errorMessage}：${errorMessages}`
        } else if (responseData?.message) {
          // 如果有通用错误消息
          errorMessage = `${errorMessage}：${responseData.message}`
        }
      }
      
      message.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id)
      message.success('删除成功')
      fetchCategories()
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    // 在全局数据中查找索引
    const oldIndex = categories.findIndex((item) => item.id === active.id)
    const newIndex = categories.findIndex((item) => item.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const newCategories = arrayMove(categories, oldIndex, newIndex)
      setCategories(newCategories)

      try {
        await reorderCategories(newCategories.map((c) => c.id))
        message.success('排序已保存')
      } catch (error: unknown) {
        let errorMessage = '排序保存失败'
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { message?: string } } }
          if (axiosError.response?.data?.message) {
            errorMessage = `${errorMessage}：${axiosError.response.data.message}`
          }
        }
        message.error(errorMessage)
        fetchCategories()
      }
    }
  }

  // 高级搜索：过滤分类数据
  const filteredCategories = useMemo(() => {
    let result = [...categories]

    // 按名称搜索
    if (searchName.trim()) {
      const keyword = searchName.trim().toLowerCase()
      result = result.filter((cat) => cat.name.toLowerCase().includes(keyword))
    }

    // 按类型筛选
    if (filterType) {
      result = result.filter((cat) => cat.type === filterType)
    }

    // 按价格区间筛选（以月度价格为准）
    if (priceRange[0] !== null) {
      result = result.filter((cat) => cat.priceMonthly >= priceRange[0]!)
    }
    if (priceRange[1] !== null) {
      result = result.filter((cat) => cat.priceMonthly <= priceRange[1]!)
    }

    // 按订阅人数筛选
    if (subscriberRange[0] !== null) {
      result = result.filter((cat) => (cat.subscriberCount || 0) >= subscriberRange[0]!)
    }
    if (subscriberRange[1] !== null) {
      result = result.filter((cat) => (cat.subscriberCount || 0) <= subscriberRange[1]!)
    }

    // 筛选条件变化时重置到第一页
    if (currentPage > 1 && result.length <= (currentPage - 1) * pageSize) {
      setCurrentPage(1)
    }

    return result
  }, [categories, searchName, filterType, priceRange, subscriberRange, currentPage, pageSize])

  // 重置搜索条件
  const handleResetSearch = () => {
    setSearchName('')
    setFilterType(undefined)
    setPriceRange([null, null])
    setSubscriberRange([null, null])
    searchForm.resetFields()
    setCurrentPage(1)
    message.success('搜索条件已重置')
  }

  // 应用高级搜索
  const handleAdvancedSearch = (values: any) => {
    setFilterType(values.type)
    setPriceRange([values.priceMin || null, values.priceMax || null])
    setSubscriberRange([values.subscriberMin || null, values.subscriberMax || null])
    setCurrentPage(1)
    message.success('筛选条件已应用')
  }

  // 获取当前页的数据
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredCategories.slice(startIndex, endIndex)
  }, [filteredCategories, currentPage, pageSize])

  // 处理分页变化
  const handleTableChange = (page: number, newPageSize: number) => {
    setCurrentPage(page)
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize)
      setCurrentPage(1) // 改变每页数量时重置到第一页
    }
  }

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
            分类管理
          </Title>
          <Text type="secondary">拖拽行可调整显示顺序</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增分类
        </Button>
      </div>

      {/* 搜索区域 */}
      <Card
        style={{
          marginBottom: 16,
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* 基础搜索 */}
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Input
                placeholder="搜索分类名称..."
                prefix={<SearchOutlined />}
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value)
                  setCurrentPage(1)
                }}
                allowClear
                size="large"
              />
            </Col>
            <Col>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                size="large"
              >
                {showAdvancedSearch ? '收起筛选' : '高级筛选'}
              </Button>
            </Col>
            <Col>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetSearch}
                size="large"
              >
                重置
              </Button>
            </Col>
          </Row>

          {/* 高级搜索表单 */}
          {showAdvancedSearch && (
            <Card
              size="small"
              style={{
                background: '#fafafa',
                border: '1px solid #e8e8e8',
              }}
            >
              <Form
                form={searchForm}
                layout="vertical"
                onFinish={handleAdvancedSearch}
              >
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item name="type" label="资讯类型">
                      <Select
                        placeholder="全部类型"
                        allowClear
                        options={[
                          { label: '行业资讯', value: 'industry' },
                          { label: '政策资讯', value: 'policy' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={9}>
                    <Form.Item label="月度价格区间">
                      <Space.Compact style={{ width: '100%' }}>
                        <Form.Item name="priceMin" noStyle>
                          <InputNumber
                            placeholder="最低价格"
                            min={0}
                            precision={2}
                            prefix="¥"
                            style={{ width: '50%' }}
                          />
                        </Form.Item>
                        <Input
                          placeholder="~"
                          disabled
                          style={{
                            width: 30,
                            borderLeft: 0,
                            borderRight: 0,
                            pointerEvents: 'none',
                            textAlign: 'center',
                          }}
                        />
                        <Form.Item name="priceMax" noStyle>
                          <InputNumber
                            placeholder="最高价格"
                            min={0}
                            precision={2}
                            prefix="¥"
                            style={{ width: '50%' }}
                          />
                        </Form.Item>
                      </Space.Compact>
                    </Form.Item>
                  </Col>
                  <Col span={9}>
                    <Form.Item label="订阅人数区间">
                      <Space.Compact style={{ width: '100%' }}>
                        <Form.Item name="subscriberMin" noStyle>
                          <InputNumber
                            placeholder="最少人数"
                            min={0}
                            style={{ width: '50%' }}
                          />
                        </Form.Item>
                        <Input
                          placeholder="~"
                          disabled
                          style={{
                            width: 30,
                            borderLeft: 0,
                            borderRight: 0,
                            pointerEvents: 'none',
                            textAlign: 'center',
                          }}
                        />
                        <Form.Item name="subscriberMax" noStyle>
                          <InputNumber
                            placeholder="最多人数"
                            min={0}
                            style={{ width: '50%' }}
                          />
                        </Form.Item>
                      </Space.Compact>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Space>
                      <Button onClick={() => searchForm.resetFields()}>
                        清空
                      </Button>
                      <Button type="primary" htmlType="submit">
                        应用筛选
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Form>
            </Card>
          )}

          {/* 搜索结果统计 */}
          {(searchName || filterType || priceRange[0] !== null || priceRange[1] !== null || 
            subscriberRange[0] !== null || subscriberRange[1] !== null) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text type="secondary">
                找到 <Text strong style={{ color: '#1677ff' }}>{filteredCategories.length}</Text> 个分类
              </Text>
              {searchName && (
                <Tag closable onClose={() => setSearchName('')}>
                  名称: {searchName}
                </Tag>
              )}
              {filterType && (
                <Tag closable onClose={() => setFilterType(undefined)}>
                  类型: {filterType === 'industry' ? '行业' : '政策'}
                </Tag>
              )}
              {(priceRange[0] !== null || priceRange[1] !== null) && (
                <Tag closable onClose={() => setPriceRange([null, null])}>
                  价格: ¥{priceRange[0] || 0} ~ ¥{priceRange[1] || '∞'}
                </Tag>
              )}
              {(subscriberRange[0] !== null || subscriberRange[1] !== null) && (
                <Tag closable onClose={() => setSubscriberRange([null, null])}>
                  订阅: {subscriberRange[0] || 0} ~ {subscriberRange[1] || '∞'}人
                </Tag>
              )}
            </div>
          )}
        </Space>
      </Card>

      <Card
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={paginatedCategories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              loading={loading}
              dataSource={paginatedCategories}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredCategories.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
                pageSizeOptions: ['10', '20', '50', '100'],
                onChange: handleTableChange,
                onShowSizeChange: handleTableChange,
              }}
              components={{
                body: {
                  row: DraggableRow,
                },
              }}
              columns={[
                {
                  title: '',
                  key: 'drag',
                  width: 50,
                  align: 'center',
                  render: () => (
                    <HolderOutlined style={{ cursor: 'grab', color: '#999' }} />
                  ),
                },
                {
                  title: '分类名称',
                  key: 'name',
                  render: (_: unknown, record: Category) => (
                    <Space>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: record.color,
                        }}
                      />
                      <Text strong>{record.name}</Text>
                    </Space>
                  ),
                },
                {
                  title: '类型',
                  dataIndex: 'type',
                  key: 'type',
                  width: 100,
                  render: (type: string) => (
                    <Tag color={type === 'industry' ? 'cyan' : 'purple'}>
                      {type === 'industry' ? '行业' : '政策'}
                    </Tag>
                  ),
                },
                {
                  title: '月度价格',
                  dataIndex: 'priceMonthly',
                  key: 'priceMonthly',
                  width: 100,
                  render: (v: number) => `¥${(v || 0).toFixed(2)}`,
                },
                {
                  title: '季度价格',
                  dataIndex: 'priceQuarterly',
                  key: 'priceQuarterly',
                  width: 100,
                  render: (v: number) => `¥${(v || 0).toFixed(2)}`,
                },
                {
                  title: '年度价格',
                  dataIndex: 'priceYearly',
                  key: 'priceYearly',
                  width: 100,
                  render: (v: number) => `¥${(v || 0).toFixed(2)}`,
                },
                {
                  title: '订阅人数',
                  dataIndex: 'subscriberCount',
                  key: 'subscriberCount',
                  width: 90,
                  render: (v: number) => (
                    <Badge count={v || 0} showZero color="#1677ff" />
                  ),
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 100,
                  render: (_: unknown, record: Category) => (
                    <Space>
                      <Tooltip title="编辑">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => openEdit(record)}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="确认删除该分类？删除后该分类下的文章将移至默认分类。"
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
              ]}
            />
          </SortableContext>
        </DndContext>
      </Card>

      <Modal
        title={editingId ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="分类名称"
            rules={[
              { required: true, message: '请输入分类名称' },
              { min: 1, max: 50, message: '名称长度1-50字符' },
            ]}
          >
            <Input placeholder="请输入分类名称" showCount maxLength={50} />
          </Form.Item>

          <Form.Item name="type" label="资讯类型" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '行业资讯', value: 'industry' },
                { label: '政策资讯', value: 'policy' },
              ]}
            />
          </Form.Item>

          <Form.Item name="color" label="分类颜色">
            <ColorPicker format="hex" />
          </Form.Item>

          <Form.Item label="订阅价格" style={{ marginBottom: 0 }}>
            <Space>
              <Form.Item
                name="priceMonthly"
                label="月度"
                rules={[{ required: true, message: '必填' }]}
              >
                <InputNumber
                  min={0.01}
                  max={999999.99}
                  precision={2}
                  prefix="¥"
                  style={{ width: 120 }}
                />
              </Form.Item>
              <Form.Item
                name="priceQuarterly"
                label="季度"
                rules={[{ required: true, message: '必填' }]}
              >
                <InputNumber
                  min={0.01}
                  max={999999.99}
                  precision={2}
                  prefix="¥"
                  style={{ width: 120 }}
                />
              </Form.Item>
              <Form.Item
                name="priceYearly"
                label="年度"
                rules={[{ required: true, message: '必填' }]}
              >
                <InputNumber
                  min={0.01}
                  max={999999.99}
                  precision={2}
                  prefix="¥"
                  style={{ width: 120 }}
                />
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                {editingId ? '保存' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Categories
