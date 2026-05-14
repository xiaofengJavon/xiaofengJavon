import React, { useState, useEffect } from 'react'
import {
  Card,
  Upload,
  Button,
  Space,
  Typography,
  Image,
  message,
  Modal,
  Input,
  Tabs,
  Empty,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  CopyOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { UploadFile } from 'antd'
import { uploadImage, deleteImage, getImageList } from '../../services/api'

const { Title, Text, Paragraph } = Typography
const { Search } = Input
const { TabPane } = Tabs

interface ImageItem {
  name: string
  url: string
  size: number
  type: string
  uploadTime: string
}

const ImagesPage: React.FC = () => {
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [searchText, setSearchText] = useState('')

  const imageTypes = [
    { key: 'all', label: '全部图片', icon: '📁' },
    { key: 'avatars', label: '用户头像', icon: '👤' },
    { key: 'banners', label: '轮播图', icon: '🖼️' },
    { key: 'articles', label: '文章图片', icon: '📄' },
    { key: 'editor', label: '编辑器图片', icon: '✏️' },
    { key: 'categories', label: '分类图标', icon: '🏷️' },
    { key: 'posters', label: '分享海报', icon: '📱' },
    { key: 'others', label: '其他', icon: '📦' },
  ]

  // 加载图片列表
  useEffect(() => {
    loadImages()
  }, [activeTab])

  const loadImages = async () => {
    setLoading(true)
    try {
      const res = await getImageList(activeTab)
      setImages(res.data)
    } catch (error: any) {
      console.error('加载图片列表失败:', error)
      message.error('加载图片列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file: File, type: string) => {
    setUploading(true)
    try {
      const res = await uploadImage(file, type)
      message.success('上传成功')
      // 重新加载图片列表
      await loadImages()
    } catch (error: any) {
      message.error(error.response?.data?.message || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    message.success('图片URL已复制到剪贴板')
  }

  const handleDelete = async (url: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这张图片吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteImage(url)
          message.success('删除成功')
          // 重新加载图片列表
          await loadImages()
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  const filteredImages = images.filter((img) => {
    const matchType = activeTab === 'all' || img.type === activeTab
    const matchSearch = !searchText || img.name.toLowerCase().includes(searchText.toLowerCase())
    return matchType && matchSearch
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            图片管理
          </Title>
          <Text type="secondary">管理所有上传的图片资源</Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadImages}
            loading={loading}
          >
            刷新
          </Button>
          <Search
            placeholder="搜索图片名称"
            allowClear
            style={{ width: 250 }}
            onSearch={setSearchText}
            onChange={(e) => !e.target.value && setSearchText('')}
          />
        </Space>
      </div>

      <Card
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {imageTypes.map((type) => (
            <TabPane
              tab={
                <span>
                  {type.icon} {type.label}
                </span>
              }
              key={type.key}
            >
              <div style={{ marginBottom: 16 }}>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleUpload(file, type.key === 'all' ? 'other' : type.key)
                    return false
                  }}
                  disabled={uploading}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    loading={uploading}
                    disabled={type.key === 'all'}
                  >
                    {type.key === 'all' ? '请选择分类上传' : '上传图片'}
                  </Button>
                </Upload>
                {type.key === 'all' && (
                  <Text type="secondary" style={{ marginLeft: 12 }}>
                    提示：请切换到具体分类标签页上传图片
                  </Text>
                )}
              </div>

              {filteredImages.length === 0 ? (
                loading ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin size="large" tip="加载中..." />
                  </div>
                ) : (
                  <Empty description="暂无图片" style={{ padding: '60px 0' }} />
                )
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 16,
                  }}
                >
                  {filteredImages.map((img) => (
                    <Card
                      key={img.url}
                      hoverable
                      cover={
                        <div
                          style={{
                            height: 160,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f5f5f5',
                          }}
                        >
                          <Image
                            src={img.url}
                            alt={img.name}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            preview={{
                              mask: '预览',
                            }}
                          />
                        </div>
                      }
                      bodyStyle={{ padding: 12 }}
                    >
                      <Paragraph
                        ellipsis={{ rows: 1, tooltip: img.name }}
                        style={{ marginBottom: 8, fontSize: 13 }}
                      >
                        {img.name}
                      </Paragraph>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatFileSize(img.size)}
                      </Text>
                      <div style={{ marginTop: 12 }}>
                        <Space size="small">
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => handleCopyUrl(img.url)}
                          >
                            复制URL
                          </Button>
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(img.url)}
                          >
                            删除
                          </Button>
                        </Space>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <Card
        title="💡 使用提示"
        style={{
          marginTop: 16,
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <Space direction="vertical" size="small">
          <Text>• 支持的图片格式：JPG、PNG、GIF、WebP</Text>
          <Text>• 单个图片大小限制：10MB</Text>
          <Text>• 图片会按类型和日期自动分类存储</Text>
          <Text>• 点击"复制URL"可快速复制图片链接</Text>
          <Text>• 在文章编辑器中点击图片按钮可直接上传图片</Text>
        </Space>
      </Card>
    </div>
  )
}

export default ImagesPage
