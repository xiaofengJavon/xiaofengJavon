// API配置
export const API_CONFIG = {
  // 开发环境
  development: {
    baseURL: 'http://localhost:8080/api/v1',
    // 如果微信开发者工具无法访问localhost，请改为你的本机IP
    // baseURL: 'http://192.168.1.100:8080/api/v1',
  },
  // 生产环境
  production: {
    baseURL: 'https://your-domain.com/api/v1',
  },
}

// 获取当前环境的配置
export const getApiConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  return API_CONFIG[env as keyof typeof API_CONFIG] || API_CONFIG.development
}

// 导出BASE_URL
export const BASE_URL = getApiConfig().baseURL
