import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Space } from 'antd'
import { UserOutlined, LockOutlined, AppstoreOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/useAppSelector'
import { setCredentials } from '../../store/authSlice'
import { adminLogin } from '../../services/api'

const { Title, Text } = Typography

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const res = await adminLogin(values.username, values.password)
      dispatch(
        setCredentials({
          id: res.data.user.id,
          username: res.data.user.username,
          role: res.data.user.role,
          token: res.data.token,
        })
      )
      message.success('登录成功')
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      message.error(error.response?.data?.message || '用户名或密码错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #001529 0%, #003a70 50%, #0050b3 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          borderRadius: 16,
          border: 'none',
        }}
        bodyStyle={{ padding: '48px 40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Space direction="vertical" size={8}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #1677ff, #0050b3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: '0 8px 24px rgba(22,119,255,0.3)',
              }}
            >
              <AppstoreOutlined style={{ fontSize: 32, color: '#fff' }} />
            </div>
            <Title level={3} style={{ margin: 0, color: '#1a1a1a' }}>
              订阅平台管理后台
            </Title>
            <Text type="secondary">请登录您的管理员账号</Text>
          </Space>
        </div>

        <Form layout="vertical" onFinish={handleLogin} size="large" autoComplete="off">
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="管理员用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="登录密码"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 48,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1677ff, #0050b3)',
                border: 'none',
              }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            默认账号: admin / Admin@2024
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login
