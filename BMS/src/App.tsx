import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import MainLayout from './components/Layout/MainLayout'
import AuthGuard from './components/AuthGuard'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ArticleList from './pages/Articles/ArticleList'
import ArticleEditor from './pages/Articles/ArticleEditor'
import Users from './pages/Users'
import Orders from './pages/Orders'
import Categories from './pages/Categories'
import VipPlans from './pages/VipPlans'
import Banners from './pages/Banners'
import Subscriptions from './pages/Subscriptions'
import Images from './pages/Images'
import Settings from './pages/Settings'

dayjs.locale('zh-cn')

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        },
        components: {
          Layout: {
            bodyBg: '#f0f2f5',
          },
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <MainLayout />
                </AuthGuard>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="articles" element={<ArticleList />} />
              <Route path="articles/new" element={<ArticleEditor />} />
              <Route path="articles/:id/edit" element={<ArticleEditor />} />
              <Route path="users" element={<Users />} />
              <Route path="orders" element={<Orders />} />
              <Route path="categories" element={<Categories />} />
              <Route path="vip-plans" element={<VipPlans />} />
              <Route path="banners" element={<Banners />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="images" element={<Images />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
