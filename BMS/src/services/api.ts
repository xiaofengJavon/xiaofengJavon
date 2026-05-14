import request from '../utils/request'
import type {
  ApiResponse,
  LoginResponse,
  DashboardStats,
  Article,
  ArticleFormData,
  Category,
  CategoryFormData,
  Order,
  GlobalSettings,
  User,
  UserAdminUpdate,
  PageResponse,
  Banner,
  BannerFormData,
  VipPlan,
  VipPlanFormData,
  Subscription,
} from '../types'

// Auth
export const adminLogin = (username: string, password: string) =>
  request.post<never, ApiResponse<LoginResponse>>('/auth/admin-login', { username, password })

// Dashboard
export const getDashboard = () =>
  request.get<never, ApiResponse<DashboardStats>>('/admin/dashboard')

// Articles
export const getArticles = (params: Record<string, unknown>) =>
  request.get<never, ApiResponse<PageResponse<Article>>>('/articles', { params })

export const getArticleById = (id: string) =>
  request.get<never, ApiResponse<Article>>(`/articles/admin/${id}`)

export const createArticle = (data: ArticleFormData) =>
  request.post<never, ApiResponse<Article>>('/articles', data)

export const updateArticle = (id: string, data: Partial<ArticleFormData>) =>
  request.put<never, ApiResponse<Article>>(`/articles/${id}`, data)

export const deleteArticle = (id: string) =>
  request.delete<never, ApiResponse<void>>(`/articles/${id}`)

export const batchDeleteArticles = (ids: string[]) =>
  request.post<never, ApiResponse<void>>('/articles/batch-delete', { ids })

export const batchUpdateCategory = (ids: string[], category: string) =>
  request.post<never, ApiResponse<void>>('/articles/batch-category', { ids, category })

export const batchUpdateSticky = (ids: string[], isSticky: boolean) =>
  request.post<never, ApiResponse<void>>('/articles/batch-sticky', { ids, isSticky })

// Categories
export const getCategories = () =>
  request.get<never, ApiResponse<Category[]>>('/categories')

export const createCategory = (data: CategoryFormData) =>
  request.post<never, ApiResponse<Category>>('/categories', data)

export const updateCategory = (id: string, data: Partial<CategoryFormData>) =>
  request.put<never, ApiResponse<Category>>(`/categories/${id}`, data)

export const deleteCategory = (id: string) =>
  request.delete<never, ApiResponse<void>>(`/categories/${id}`)

export const reorderCategories = (order: string[]) =>
  request.post<never, ApiResponse<void>>('/categories/reorder', { order })

// Users
export const getUsers = (params: Record<string, unknown>) =>
  request.get<never, ApiResponse<PageResponse<User>>>('/admin/users', { params })

export const updateUser = (id: string, data: UserAdminUpdate) =>
  request.put<never, ApiResponse<User>>(`/admin/users/${id}`, data)

// Orders
export const getOrders = (params: Record<string, unknown>) =>
  request.get<never, ApiResponse<PageResponse<Order>>>('/admin/orders', { params })

export const exportOrders = (params: Record<string, unknown>) =>
  request.get('/admin/orders/export', {
    params,
    responseType: 'blob',
  })

// Settings
export const getSettings = () =>
  request.get<never, ApiResponse<GlobalSettings>>('/admin/settings')

export const updateSettings = (data: Partial<GlobalSettings>) =>
  request.put<never, ApiResponse<GlobalSettings>>('/admin/settings', data)

// VIP Plans
export const getVipPlans = () =>
  request.get<never, ApiResponse<VipPlan[]>>('/admin/vip-plans')

export const getVipPlanById = (id: string) =>
  request.get<never, ApiResponse<VipPlan>>(`/admin/vip-plans/${id}`)

export const createVipPlan = (data: VipPlanFormData) =>
  request.post<never, ApiResponse<VipPlan>>('/admin/vip-plans', data)

export const updateVipPlan = (id: string, data: Partial<VipPlanFormData>) =>
  request.put<never, ApiResponse<VipPlan>>(`/admin/vip-plans/${id}`, data)

export const deleteVipPlan = (id: string) =>
  request.delete<never, ApiResponse<string>>(`/admin/vip-plans/${id}`)

export const toggleVipPlanStatus = (id: string) =>
  request.patch<never, ApiResponse<VipPlan>>(`/admin/vip-plans/${id}/toggle`)

// Banners
export const getBanners = () =>
  request.get<never, ApiResponse<Banner[]>>('/admin/banners')

export const getBannerById = (id: string) =>
  request.get<never, ApiResponse<Banner>>(`/admin/banners/${id}`)

export const createBanner = (data: BannerFormData) =>
  request.post<never, ApiResponse<Banner>>('/admin/banners', data)

export const updateBanner = (id: string, data: Partial<BannerFormData>) =>
  request.put<never, ApiResponse<Banner>>(`/admin/banners/${id}`, data)

export const deleteBanner = (id: string) =>
  request.delete<never, ApiResponse<void>>(`/admin/banners/${id}`)

export const reorderBanners = (order: string[]) =>
  request.post<never, ApiResponse<void>>('/admin/banners/reorder', { order })

export const toggleBannerStatus = (id: string) =>
  request.post<never, ApiResponse<Banner>>(`/admin/banners/${id}/toggle`)

// Subscriptions
export const getSubscriptions = (params: Record<string, unknown>) =>
  request.get<never, ApiResponse<PageResponse<Subscription>>>('/admin/subscriptions', { params })

export const extendSubscription = (subscriptionId: string, days: number) =>
  request.post<never, ApiResponse<Subscription>>('/admin/subscriptions/extend', { subscriptionId, days })

export const cancelSubscription = (id: string) =>
  request.post<never, ApiResponse<void>>(`/admin/subscriptions/${id}/cancel`)

export const deleteSubscription = (id: string) =>
  request.delete<never, ApiResponse<void>>(`/admin/subscriptions/${id}`)

// File Upload
export interface UploadResponse {
  url: string
  filename: string
  size: number
  type?: string
}

/**
 * 上传图片（通用）
 * @param file 文件对象
 * @param type 图片类型：avatar, banner, article, category, poster, editor, other
 */
export const uploadImage = (file: File, type: string = 'other') => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<never, ApiResponse<UploadResponse>>(`/upload?type=${type}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 上传头像
 */
export const uploadAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<never, ApiResponse<UploadResponse>>('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 上传轮播图
 */
export const uploadBanner = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<never, ApiResponse<UploadResponse>>('/upload/banner', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 上传文章图片
 */
export const uploadArticleImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<never, ApiResponse<UploadResponse>>('/upload/article', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 上传编辑器图片
 */
export const uploadEditorImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<never, ApiResponse<UploadResponse>>('/upload/editor', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 删除图片
 */
export const deleteImage = (url: string) =>
  request.delete<never, ApiResponse<void>>(`/upload?url=${encodeURIComponent(url)}`)

/**
 * 获取图片列表
 */
export const getImageList = (type: string = 'all') =>
  request.get<never, ApiResponse<Array<{
    name: string
    url: string
    size: number
    type: string
    uploadTime: string
  }>>>(`/upload/list?type=${type}`)

