import React, { useEffect, useState, useRef, useMemo } from 'react'
import {
  Form,
  Input,
  Select,
  Switch,
  Button,
  Card,
  Space,
  Typography,
  message,
  Spin,
  DatePicker,
  Row,
  Col,
  Divider,
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import dayjs from 'dayjs'
import { getArticleById, createArticle, updateArticle, getCategories, uploadEditorImage } from '../../services/api'
import type { Category } from '../../types'

const { Title, Text } = Typography

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'align', 'link', 'image',
  'blockquote', 'code-block',
]

const ArticleEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const quillRef = useRef<ReactQuill>(null)
  const isEdit = !!id

  // 图片上传处理
  const imageHandler = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      // 验证文件大小（10MB）
      if (file.size > 10 * 1024 * 1024) {
        message.error('图片大小不能超过10MB')
        return
      }

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        message.error('只能上传图片文件')
        return
      }

      try {
        message.loading({ content: '图片上传中...', key: 'upload' })
        
        // 上传到服务器
        const res = await uploadEditorImage(file)
        const imageUrl = res.data.url

        // 插入图片到编辑器
        const quill = quillRef.current?.getEditor()
        if (quill) {
          const range = quill.getSelection()
          quill.insertEmbed(range?.index || 0, 'image', imageUrl)
          quill.setSelection((range?.index || 0) + 1, 0)
        }

        message.success({ content: '图片上传成功', key: 'upload' })
      } catch (error) {
        console.error('图片上传失败:', error)
        message.error({ content: '图片上传失败', key: 'upload' })
      }
    }
  }

  // Quill模块配置（使用useMemo避免重复创建）
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'image'],
        ['blockquote', 'code-block'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), [])

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getArticleById(id)
      .then((res) => {
        const article = res.data
        form.setFieldsValue({
          title: article.title,
          summary: article.summary,
          category: article.category,
          type: article.type,
          isPremium: article.isPremium,
          isSticky: article.isSticky,
          date: article.date ? dayjs(article.date) : dayjs(),
        })
        setContent(article.content || '')
      })
      .catch(() => message.error('获取文章失败'))
      .finally(() => setLoading(false))
  }, [id, form])

  const handleSave = async (values: Record<string, unknown>) => {
    if (!content || content === '<p><br></p>') {
      message.error('请输入文章内容')
      return
    }
    
    // 根据分类查找对应的type
    const selectedCategory = categories.find(c => c.name === values.category)
    if (!selectedCategory) {
      message.error('无效的分类')
      return
    }
    
    setSaving(true)
    try {
      const payload = {
        title: values.title as string,
        summary: values.summary as string,
        category: values.category as string,
        type: selectedCategory.type, // 自动设置为 industry/policy/publication
        isPremium: values.isPremium as boolean,
        isSticky: values.isSticky as boolean,
        date: values.date ? (values.date as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        content,
      }
      if (isEdit) {
        await updateArticle(id!, payload)
        message.success('文章更新成功')
      } else {
        await createArticle(payload)
        message.success('文章发布成功')
      }
      navigate('/articles')
    } catch (error: unknown) {
      // 提取后端返回的详细错误信息
      let errorMessage = isEdit ? '更新失败' : '发布失败'
      
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/articles')}
          type="text"
          size="large"
        />
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {isEdit ? '编辑文章' : '发布文章'}
          </Title>
          <Text type="secondary">{isEdit ? '修改文章内容' : '创建新文章'}</Text>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={24}>
          <Col xs={24} lg={17}>
            <Card
              style={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                marginBottom: 16,
              }}
            >
              <Form.Item
                name="title"
                label="文章标题"
                rules={[
                  { required: true, message: '请输入文章标题' },
                  { max: 200, message: '标题最多200字符' },
                ]}
              >
                <Input
                  placeholder="请输入文章标题（最多200字符）"
                  size="large"
                  showCount
                  maxLength={200}
                  style={{ fontSize: 16 }}
                />
              </Form.Item>

              <Form.Item
                name="summary"
                label="文章摘要"
                rules={[
                  { required: true, message: '请输入文章摘要' },
                  { max: 500, message: '摘要最多500字符' },
                ]}
                tooltip="摘要将显示在文章列表和详情页顶部，建议100-200字"
              >
                <Input.TextArea
                  placeholder="请输入文章摘要，简要概括文章核心内容（最多500字符）"
                  rows={4}
                  showCount
                  maxLength={500}
                  style={{ fontSize: 14 }}
                />
              </Form.Item>

              <Form.Item
                name="content"
                label="文章内容"
                style={{ marginBottom: 0 }}
                extra="提示：点击工具栏的图片按钮上传图片到服务器"
              >
                <div>
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    formats={quillFormats}
                    style={{ height: 480, marginBottom: 50 }}
                    placeholder="请输入文章内容..."
                  />
                </div>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={7}>
            <Card
              title="文章属性"
              style={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                marginBottom: 16,
              }}
            >
              <Form.Item
                name="category"
                label="文章分类"
                rules={[{ required: true, message: '请选择分类' }]}
                tooltip="选择分类后，文章类型(industry/policy)将自动设置"
              >
                <Select
                  placeholder="选择分类"
                  options={categories.map((c) => ({ 
                    label: `${c.name} (${c.type === 'industry' ? '产业' : c.type === 'policy' ? '政策' : '刊物'})`, 
                    value: c.name 
                  }))}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                name="date"
                label="发布日期"
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Divider style={{ margin: '12px 0' }} />

              <Form.Item
                name="isPremium"
                label="付费文章"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="付费" unCheckedChildren="免费" />
              </Form.Item>

              <Form.Item
                name="isSticky"
                label="置顶文章"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="置顶" unCheckedChildren="普通" />
              </Form.Item>
            </Card>

            <Card
              style={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                  block
                  size="large"
                >
                  {isEdit ? '保存修改' : '发布文章'}
                </Button>
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => navigate('/articles')}
                  block
                >
                  取消
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default ArticleEditor
