export interface User {
  id: string
  wxOpenid: string
  nickname?: string
  avatarUrl?: string
  phone?: string
  isVip: boolean
  subscriptionTier: 'NONE' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  credits: number
  inviteCode: string
  invitedCount: number
  vipExpiry?: string
  createdAt: string
  updatedAt?: string
}

export interface Article {
  id: string
  title: string
  summary: string
  content?: string
  category: string
  type: 'industry' | 'policy' | 'publication'
  moduleType?: 'industry' | 'policy' | 'publication'
  date: string
  isPremium: boolean
  readTime: number
  viewCount: number
  favoriteCount: number
  likes: number
  shareCount: number
  isSticky: boolean
  createdAt: string
  updatedAt: string
  canAccess?: boolean
}

export interface Category {
  id: string
  name: string
  color: string
  type: 'industry' | 'policy'
  sortOrder: number
  priceMonthly: number
  priceQuarterly: number
  priceYearly: number
  subscriberCount?: number
}

export interface Order {
  id: string
  userId: string
  wxOpenid: string
  type: 'VIP' | 'CATEGORY'
  item: string
  amount: number
  status: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED'
  createdAt: string
}

export interface GlobalSettings {
  id?: number
  popupEnabled: boolean
  popupImageUrl?: string
  popupLinkUrl?: string
  popupExpiryDate?: string
  monthlyBonusDays: number
  quarterlyBonusDays: number
  yearlyBonusDays: number
}

export interface DashboardStats {
  totalUsers: number
  vipUsers: number
  totalArticles: number
  totalOrders: number
  totalRevenue: number
  activeSubscriptions: number
  topArticles: { id: string; title: string; viewCount: number }[]
  subscriptionByCategory: Record<string, number>
}

export interface PageResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    username: string
    role: string
  }
}

export interface ArticleFormData {
  title: string
  category: string
  type: 'industry' | 'policy' | 'publication'
  isPremium: boolean
  isSticky: boolean
  content: string
  date?: string
}

export interface CategoryFormData {
  name: string
  color: string
  type: 'industry' | 'policy'
  priceMonthly: number
  priceQuarterly: number
  priceYearly: number
}

export interface UserAdminUpdate {
  isVip?: boolean
  subscriptionTier?: string
  credits?: number
  vipExpiry?: string
}

export interface VipFeature {
  icon: string
  text: string
}

export interface VipPlan {
  id?: string
  key: string
  label: string
  price: number
  per: string
  badge?: string
  durationDays: number
  features: VipFeature[]
  isEnabled?: boolean
  sortOrder?: number
}

export interface VipPlanFormData {
  planKey: string
  planLabel: string
  price: number
  pricePerMonth: string
  badge?: string
  durationDays: number
  features: VipFeature[]
  isEnabled: boolean
  sortOrder: number
}

export interface Banner {
  id: string
  title: string
  imageUrl: string
  linkUrl?: string
  linkType: 'none' | 'article' | 'external' | 'category'
  linkTarget?: string
  sortOrder: number
  isEnabled: boolean
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export interface BannerFormData {
  title: string
  imageUrl: string
  linkUrl?: string
  linkType: 'none' | 'article' | 'external' | 'category'
  linkTarget?: string
  sortOrder: number
  isEnabled: boolean
  startDate?: string
  endDate?: string
}

export interface Subscription {
  id: string
  userId: string
  userNickname?: string
  userPhone?: string
  category: string
  expiryDate: string
  createdAt: string
  isActive: boolean
  daysRemaining: number
}
