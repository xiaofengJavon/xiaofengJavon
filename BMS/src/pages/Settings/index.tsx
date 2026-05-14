import React, { useEffect, useState } from 'react'
import {
  Form,
  Input,
  Switch,
  InputNumber,
  Button,
  Card,
  Typography,
  Space,
  message,
  Spin,
  Divider,
  Row,
  Col,
  Alert,
  DatePicker,
} from 'antd'
import {
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  GiftOutlined,
  BellOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getSettings, updateSettings } from '../../services/api'
import type { GlobalSettings } from '../../types'

const { Title, Text } = Typography

const Settings: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [popupEnabled, setPopupEnabled] = useState(false)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await getSettings()
      const s = res.data
      form.setFieldsValue({
        popupEnabled: s.popupEnabled,
        popupImageUrl: s.popupImageUrl || '',
        popupLinkUrl: s.popupLinkUrl || '',
        popupExpiryDate: s.popupExpiryDate ? dayjs(s.popupExpiryDate) : null,
        monthlyBonusDays: s.monthlyBonusDays || 0,
        quarterlyBonusDays: s.quarterlyBonusDays || 0,
        yearlyBonusDays: s.yearlyBonusDays || 0,
      })
      setPopupEnabled(s.popupEnabled)
    } catch {
      message.error('获取设置失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async (values: GlobalSettings & { popupExpiryDate: dayjs.Dayjs | null }) => {
    setSaving(true)
    try {
      const payload: Partial<GlobalSettings> = {
        popupEnabled: values.popupEnabled,
        popupImageUrl: values.popupImageUrl,
        popupLinkUrl: values.popupLinkUrl,
        popupExpiryDate: values.popupExpiryDate?.format('YYYY-MM-DD') || '',
        monthlyBonusDays: values.monthlyBonusDays,
        quarterlyBonusDays: values.quarterlyBonusDays,
        yearlyBonusDays: values.yearlyBonusDays,
      }
      await updateSettings(payload)
      message.success('设置保存成功，立即生效')
    } catch {
      message.error('保存失败')
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
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            系统设置
          </Title>
          <Text type="secondary">配置平台全局参数，保存后立即生效</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchSettings}>
          刷新
        </Button>
      </div>

      <Alert
        message="修改设置后请点击「保存设置」按钮以持久化配置"
        type="info"
        showIcon
        style={{ marginBottom: 20, borderRadius: 8 }}
      />

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={24}>
          <Col xs={24} lg={14}>
            <Card
              title={
                <Space>
                  <BellOutlined style={{ color: '#1677ff' }} />
                  <span>促销弹窗配置</span>
                </Space>
              }
              style={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                marginBottom: 24,
              }}
            >
              <Form.Item name="popupEnabled" label="启用促销弹窗" valuePropName="checked">
                <Switch
                  checkedChildren="已启用"
                  unCheckedChildren="已禁用"
                  onChange={(v) => setPopupEnabled(v)}
                />
              </Form.Item>

              {popupEnabled && (
                <>
                  <Form.Item
                    name="popupImageUrl"
                    label="弹窗图片URL"
                    rules={[{ type: 'url', message: '请输入有效的URL' }]}
                  >
                    <Input placeholder="https://example.com/popup.jpg" />
                  </Form.Item>

                  <Form.Item
                    name="popupLinkUrl"
                    label="弹窗跳转链接"
                    rules={[{ type: 'url', message: '请输入有效的URL' }]}
                  >
                    <Input placeholder="https://example.com/promo" />
                  </Form.Item>

                  <Form.Item name="popupExpiryDate" label="弹窗过期时间">
                    <DatePicker
                      style={{ width: '100%' }}
                      disabledDate={(d) => d && d.isBefore(dayjs(), 'day')}
                    />
                  </Form.Item>
                </>
              )}
            </Card>

            <Card
              title={
                <Space>
                  <GiftOutlined style={{ color: '#52c41a' }} />
                  <span>订阅赠送天数配置</span>
                </Space>
              }
              style={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                marginBottom: 24,
              }}
            >
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                用户购买订阅时，在正常时长基础上额外赠送的天数（0 表示不赠送）
              </Text>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="monthlyBonusDays"
                    label="月度套餐赠送天数"
                    rules={[{ required: true, message: '请输入' }]}
                  >
                    <InputNumber
                      min={0}
                      max={365}
                      suffix="天"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="quarterlyBonusDays"
                    label="季度套餐赠送天数"
                    rules={[{ required: true, message: '请输入' }]}
                  >
                    <InputNumber
                      min={0}
                      max={365}
                      suffix="天"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="yearlyBonusDays"
                    label="年度套餐赠送天数"
                    rules={[{ required: true, message: '请输入' }]}
                  >
                    <InputNumber
                      min={0}
                      max={365}
                      suffix="天"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card
              title={
                <Space>
                  <SettingOutlined style={{ color: '#722ed1' }} />
                  <span>VIP订阅价格参考</span>
                </Space>
              }
              style={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                marginBottom: 24,
              }}
            >
              <div style={{ color: '#666', lineHeight: 2.2 }}>
                <div>📦 月度套餐：<Text strong>¥29.00</Text> / 30天</div>
                <div>📦 季度套餐：<Text strong>¥78.00</Text> / 90天</div>
                <div>📦 年度套餐：<Text strong>¥268.00</Text> / 365天</div>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                VIP价格在后端配置中设定，如需修改请联系开发人员更新配置。
              </Text>
            </Card>

            <Card
              style={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                  block
                  size="large"
                  style={{
                    borderRadius: 8,
                    height: 48,
                    fontWeight: 600,
                  }}
                >
                  保存设置
                </Button>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default Settings
