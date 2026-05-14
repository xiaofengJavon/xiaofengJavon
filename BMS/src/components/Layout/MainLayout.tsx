import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Typography, theme, Button } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  CrownOutlined,
  PictureOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppSelector'
import { logout } from '../../store/authSlice'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '数据概览' },
  { key: '/articles', icon: <FileTextOutlined />, label: '文章管理' },
  { key: '/users', icon: <UserOutlined />, label: '用户管理' },
  { key: '/subscriptions', icon: <TeamOutlined />, label: '订阅管理' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '订单管理' },
  { key: '/categories', icon: <AppstoreOutlined />, label: '分类管理' },
  { key: '/vip-plans', icon: <CrownOutlined />, label: 'VIP套餐' },
  { key: '/banners', icon: <PictureOutlined />, label: '轮播图管理' },
  { key: '/images', icon: <PictureOutlined />, label: '图片管理' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
]

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const { token } = theme.useToken()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  const selectedKey =
    menuItems.find((item) => location.pathname.startsWith(item.key))?.key || '/dashboard'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          background: '#001529',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}
        >
          {collapsed ? (
            <AppstoreOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          ) : (
            <Text
              style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              📋 订阅平台后台
            </Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 40, height: 40 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button type="text" icon={<BellOutlined />} style={{ fontSize: 16 }} />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: token.borderRadius,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = token.colorBgTextHover
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <Avatar
                  size="small"
                  style={{ background: token.colorPrimary }}
                  icon={<UserOutlined />}
                />
                <Text style={{ fontSize: 14 }}>{user?.username || '管理员'}</Text>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px',
            minHeight: 'calc(100vh - 64px - 48px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
