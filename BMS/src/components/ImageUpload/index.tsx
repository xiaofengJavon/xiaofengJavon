import React, { useState } from 'react'
import { Upload, message, Modal } from 'antd'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import { uploadImage, deleteImage } from '../../services/api'

interface ImageUploadProps {
  value?: string
  onChange?: (url: string) => void
  type?: 'avatar' | 'banner' | 'article' | 'category' | 'poster' | 'editor' | 'other'
  maxSize?: number // MB
  listType?: 'picture-card' | 'picture' | 'text'
  accept?: string
  disabled?: boolean
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  type = 'other',
  maxSize = 10,
  listType = 'picture-card',
  accept = 'image/*',
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options
    const uploadFile = file as File

    // 验证文件大小
    if (uploadFile.size > maxSize * 1024 * 1024) {
      message.error(`图片大小不能超过 ${maxSize}MB`)
      onError?.(new Error('文件过大'))
      return
    }

    // 验证文件类型
    if (!uploadFile.type.startsWith('image/')) {
      message.error('只能上传图片文件')
      onError?.(new Error('文件类型错误'))
      return
    }

    setLoading(true)
    try {
      const res = await uploadImage(uploadFile, type)
      const imageUrl = res.data.url
      onChange?.(imageUrl)
      onSuccess?.(imageUrl)
      message.success('上传成功')
    } catch (error: any) {
      console.error('上传失败:', error)
      message.error(error.response?.data?.message || '上传失败')
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (value) {
      try {
        await deleteImage(value)
        onChange?.('')
        message.success('删除成功')
      } catch (error) {
        console.error('删除失败:', error)
        // 即使删除失败也清空值
        onChange?.('')
      }
    }
  }

  const handlePreview = () => {
    setPreviewImage(value || '')
    setPreviewOpen(true)
  }

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  )

  const fileList: UploadFile[] = value
    ? [
        {
          uid: '-1',
          name: 'image',
          status: 'done',
          url: value,
        },
      ]
    : []

  return (
    <>
      <Upload
        listType={listType}
        fileList={fileList}
        customRequest={handleUpload}
        onRemove={handleRemove}
        onPreview={handlePreview}
        accept={accept}
        disabled={disabled}
        maxCount={1}
        showUploadList={{
          showPreviewIcon: true,
          showRemoveIcon: !disabled,
        }}
      >
        {!value && uploadButton}
      </Upload>
      <Modal
        open={previewOpen}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  )
}

export default ImageUpload
