import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  Typography,
  Card,
  Tag,
  Popconfirm,
  message,
  Image,
  DatePicker,
  Select,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HolderOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import type { ColumnsType } from 'antd/es/table'
import type { Banner, BannerFormData } from '../../types'
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
  toggleBannerStatus,
} from '../../services/api'
import ImageUpload from '../../components/ImageUpload'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

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

const Banners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const res = await getBanners()
      setBanners(res.data)
    } catch {
      message.error('获取轮播图列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({
      linkType: 'none',
      sortOrder: banners.length,
      isEnabled: true,
    })
    setModalOpen(true)
  }

  const handleEdit = (record: Banner) => {
    setEditingId(record.id)
    form.setFieldsValue({
      title: record.title,
      imageUrl: record.imageUrl,
      linkUrl: record.linkUrl,
      linkType: record.linkType,
      linkTarget: record.linkTarget,
      sortOrder: record.sortOrder,
      isEnabled: record.isEnabled,
      dateRange:
        record.startDate && record.endDate
          ? [dayjs(record.startDate), dayjs(record.endDate)]
          : undefined,
    })
    setModalOpen(true)
  }

  const handleSave = async (values: BannerFormData & { dateRange?: [dayjs.Dayjs, dayjs.Dayjs] }) => {
    setSaving(true)
    try {
      const payload: BannerFormData = {
        title: values.title,
        imageUrl: values.imageUrl,
        linkUrl: values.linkUrl,
        linkType: values.linkType,
        linkTarget: values.linkTarget,
        sortOrder: values.sortOrder,
        isEnabled: values.isEnabled,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
      }

      if (editingId) {
        await updateBanner(editingId, payload)
        message.success('轮播图更新成功')
      } else {
        await createBanner(payload)
        message.success('轮播图创建成功')
      }
      setModalOpen(false)
      fetchBanners()
    } catch (error: unknown) {
      let errorMessage = editingId ? '更新失败' : '创建失败'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; data?: Record<string, string> } } }
        const responseData = axiosError.response?.data
        if (responseData?.data && typeof responseData.data === 'object') {
          const errorMessages = Object.entries(responseData.data)
            .map(([, msg]) => `${msg}`)
            .join('；')
          errorMessage = `${errorMessage}：${errorMessages}`
        } else if (responseData?.message) {
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
      await deleteBanner(id)
      message.success('删除成功')
      fetchBanners()
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

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleBannerStatus(id)
      message.success('状态切换成功')
      fetchBanners()
    } catch (error: unknown) {
      let errorMessage = '状态切换失败'
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

    const oldIndex = banners.findIndex((item) => item.id === active.id)
    const newIndex = banners.findIndex((item) => item.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const newBanners = arrayMove(banners, oldIndex, newIndex)
      setBanners(newBanners)

      try {
        await reorderBanners(newBanners.map((b) => b.id))
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
        fetchBanners()
      }
    }
  }

  const columns: ColumnsType<Banner> = [
    {
      key: 'sort',
      width: 50,
      render: () => <HolderOutlined style={{ cursor: 'move', color: '#999' }} />,
    },
    {
      title: '预览',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 120,
      render: (url: string) => (
        <Image src={url} width={100} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} />
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '链接类型',
      dataIndex: 'linkType',
      key: 'linkType',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          none: { text: '无链接', color: 'default' },
          article: { text: '文章', color: 'blue' },
          external: { text: '外部链接', color: 'green' },
          category: { text: '分类', color: 'purple' },
        }
        const config = typeMap[type] || typeMap.none
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '展示期限',
      key: 'dateRange',
      width: 200,
      render: (_, record) => {
        if (!record.startDate && !record.endDate) {
          return <Text type="secondary">永久</Text>
        }
        return (
          <Text>
            {record.startDate || '不限'} ~ {record.endDate || '不限'}
          </Text>
        )
      },
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      width: 80,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'success' : 'default'}>{enabled ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record.isEnabled ? '禁用' : '启用'}>
            <Button
              type="text"
              icon={record.isEnabled ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => handleToggleStatus(record.id)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="确认删除该轮播图？"
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
            轮播图管理
          </Title>
          <Text type="secondary">共 {banners.length} 个轮播图</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
          添加轮播图
        </Button>
      </div>

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
          <SortableContext items={banners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <Table
              columns={columns}
              dataSource={banners}
              rowKey="id"
              loading={loading}
              pagination={false}
              components={{
                body: {
                  row: DraggableRow,
                },
              }}
            />
          </SortableContext>
        </DndContext>
      </Card>

      <Modal
        title={editingId ? '编辑轮播图' : '添加轮播图'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="title"
            label="轮播图标题"
            rules={[
              { required: true, message: '请输入标题' },
              { max: 100, message: '标题最多100个字符' },
            ]}
          >
            <Input placeholder="请输入轮播图标题" maxLength={100} showCount />
          </Form.Item>

          <Form.Item
            name="imageUrl"
            label="轮播图图片"
            rules={[{ required: true, message: '请上传轮播图图片' }]}
            extra="建议尺寸：750x300，支持 jpg、png、webp 格式，最大10MB"
          >
            <ImageUpload type="banner" />
          </Form.Item>

          <Form.Item
            name="linkType"
            label="链接类型"
            rules={[{ required: true, message: '请选择链接类型' }]}
          >
            <Select
              options={[
                { label: '无链接', value: 'none' },
                { label: '文章详情', value: 'article' },
                { label: '外部链接', value: 'external' },
                { label: '分类页面', value: 'category' },
              ]}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.linkType !== currentValues.linkType}
          >
            {({ getFieldValue }) => {
              const linkType = getFieldValue('linkType')
              if (linkType === 'none') return null

              return (
                <>
                  {linkType === 'external' && (
                    <Form.Item
                      name="linkUrl"
                      label="外部链接"
                      rules={[
                        { required: true, message: '请输入外部链接' },
                        { type: 'url', message: '请输入有效的URL' },
                      ]}
                    >
                      <Input placeholder="https://example.com" />
                    </Form.Item>
                  )}
                  {linkType === 'article' && (
                    <Form.Item
                      name="linkTarget"
                      label="文章ID"
                      rules={[{ required: true, message: '请输入文章ID' }]}
                    >
                      <Input placeholder="请输入文章ID" />
                    </Form.Item>
                  )}
                  {linkType === 'category' && (
                    <Form.Item
                      name="linkTarget"
                      label="分类名称"
                      rules={[{ required: true, message: '请输入分类名称' }]}
                    >
                      <Input placeholder="请输入分类名称" />
                    </Form.Item>
                  )}
                </>
              )
            }}
          </Form.Item>

          <Form.Item name="dateRange" label="展示期限" extra="不设置则永久展示">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="排序顺序"
            rules={[{ required: true, message: '请输入排序顺序' }]}
            extra="数字越小越靠前"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="isEnabled" label="启用状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Banners
