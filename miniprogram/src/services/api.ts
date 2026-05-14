import Taro from '@tarojs/taro';
import { BASE_URL as CONFIG_BASE_URL } from '../config';

// 使用配置文件中的BASE_URL
export const BASE_URL = CONFIG_BASE_URL;

const TOKEN_KEY = 'auth_token';
const PROFILE_KEY = 'user_profile';

// ---- Token helpers ----
export const getToken = (): string => {
  try { return Taro.getStorageSync(TOKEN_KEY) || ''; } catch { return ''; }
};
export const setToken = (token: string) => {
  Taro.setStorageSync(TOKEN_KEY, token);
};
export const removeToken = () => {
  try { Taro.removeStorageSync(TOKEN_KEY); } catch {}
};
export const getCachedProfile = (): UserProfile | null => {
  try { return Taro.getStorageSync(PROFILE_KEY) || null; } catch { return null; }
};
export const setCachedProfile = (profile: UserProfile) => {
  try { Taro.setStorageSync(PROFILE_KEY, profile); } catch {}
};
export const removeCachedProfile = () => {
  try { Taro.removeStorageSync(PROFILE_KEY); } catch {}
};

// ---- Generic request ----
async function request<T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: Record<string, unknown>
): Promise<T> {
  const token = getToken();
  const header: Record<string, string> = { 'content-type': 'application/json' };
  if (token) header['Authorization'] = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}${path}`,
      method,
      data,
      header,
      success(res) {
        if (res.statusCode === 401) {
          removeToken();
          reject(new Error('UNAUTHORIZED'));
          return;
        }
        if (res.statusCode >= 400) {
          reject(new Error((res.data as any)?.message || `HTTP ${res.statusCode}`));
          return;
        }
        const body = res.data as { success: boolean; data: T; message?: string };
        resolve(body.data);
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

// ---- Response types ----
export interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LoginResult {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  wxOpenid: string;
  nickname?: string;
  avatarUrl?: string;
  phone?: string;
  isVip: boolean;
  subscriptionTier: string;
  credits: number;
  inviteCode: string;
  invitedCount: number;
  vipExpiry?: string;
  activeSubscriptions: SubscriptionItem[];
  readCount: number;
  favoriteCount: number;
  unlockedCount: number;
}

export interface SubscriptionItem {
  id: string;
  category: string;
  expiryDate: string;
  isActive: boolean;
}

export interface ArticleData {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  type: string;
  date: string;
  isPremium: boolean;
  readTime: number;
  viewCount: number;
  favoriteCount: number;
  likes: number;
  shareCount: number;
  isSticky: boolean;
  isFavorited: boolean;
  isLiked: boolean;
  hasAccess: boolean;
}

export interface CategoryData {
  id: string;
  name: string;
  color: string;
  type: string;
  sortOrder: number;
  priceMonthly: number;
  priceQuarterly: number;
  priceYearly: number;
  subscriberCount: number;
}

export interface OrderItem {
  id: string;
  type: string;
  item: string;
  amount: string;
  status: string;
  createdAt: string;
}

export interface PublicSettings {
  id: string;
  popupEnabled: boolean;
  popupImage: string;
  popupLink: string;
  popupExpiryDate?: string;
  marketingRules?: string;
}

export interface PaymentParams {
  orderId: string;
  prepayId: string;
  timestamp: string;
  nonceStr: string;
  packageValue: string;
  signType: string;
  paySign: string;
  appId: string;
}

export interface VipPlanData {
  key: string;
  label: string;
  price: number;
  per: string;
  badge?: string;
  durationDays: number;
  features: VipFeature[];
}

export interface VipFeature {
  icon: string;
  text: string;
}

export interface BannerData {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  linkType: 'none' | 'article' | 'external' | 'category';
  linkTarget?: string;
  sortOrder: number;
  isEnabled: boolean;
  startDate?: string;
  endDate?: string;
}

// ---- API Service ----
export const ApiService = {
  // Auth
  async wechatLogin(code: string, inviteCode?: string): Promise<LoginResult> {
    return request<LoginResult>('/auth/wechat-login', 'POST', { code, inviteCode });
  },

  // User
  async getUserProfile(): Promise<UserProfile> {
    return request<UserProfile>('/user/profile');
  },

  async redeemCode(code: string): Promise<void> {
    return request<void>('/user/redeem-code', 'POST', { code });
  },

  async updateProfile(nickname: string, avatarUrl: string): Promise<UserProfile> {
    return request<UserProfile>('/user/update-profile', 'PUT', { nickname, avatarUrl });
  },

  async updatePhone(code: string): Promise<UserProfile> {
    return request<UserProfile>('/user/update-phone', 'POST', { code });
  },

  async getFavorites(page = 1, pageSize = 20): Promise<PageResult<ArticleData>> {
    return request<PageResult<ArticleData>>(`/user/favorites?page=${page}&pageSize=${pageSize}`);
  },

  // Articles
  async getArticles(params?: {
    type?: string; category?: string; search?: string;
    subscribedOnly?: boolean; page?: number; pageSize?: number;
  }): Promise<PageResult<ArticleData>> {
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    if (params?.subscribedOnly) qs.set('subscribedOnly', 'true');
    qs.set('page', String(params?.page || 1));
    qs.set('pageSize', String(params?.pageSize || 20));
    return request<PageResult<ArticleData>>(`/articles?${qs.toString()}`);
  },

  async getTopArticles(limit = 10): Promise<ArticleData[]> {
    return request<ArticleData[]>(`/articles/top?limit=${limit}`);
  },

  async searchArticles(keyword: string, page = 1, pageSize = 20): Promise<PageResult<ArticleData>> {
    return request<PageResult<ArticleData>>(
      `/articles?search=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`
    );
  },

  async getArticle(id: string): Promise<ArticleData> {
    return request<ArticleData>(`/articles/${id}`);
  },

  async recordView(id: string): Promise<void> {
    return request<void>(`/articles/${id}/view`, 'POST');
  },

  async toggleFavorite(id: string): Promise<{ isFavorited: boolean }> {
    return request<{ isFavorited: boolean }>(`/articles/${id}/favorite`, 'POST');
  },

  async toggleLike(id: string): Promise<void> {
    return request<void>(`/articles/${id}/like`, 'POST');
  },

  async unlockArticle(id: string): Promise<void> {
    return request<void>(`/articles/${id}/unlock`, 'POST');
  },

  // Categories
  async getCategories(): Promise<CategoryData[]> {
    return request<CategoryData[]>('/categories');
  },

  // Subscriptions
  async getSubscriptions(): Promise<SubscriptionItem[]> {
    return request<SubscriptionItem[]>('/subscriptions');
  },

  async subscribeVip(duration: string): Promise<PaymentParams> {
    return request<PaymentParams>('/subscriptions/vip', 'POST', { duration });
  },

  async subscribeCategory(category: string, duration: string): Promise<PaymentParams> {
    return request<PaymentParams>('/subscriptions/category', 'POST', { category, duration });
  },

  async subscribeTest(): Promise<PaymentParams> {
    return request<PaymentParams>('/subscriptions/test', 'POST');
  },

  async freeSubscribe(category: string): Promise<void> {
    return request<void>('/subscriptions/free', 'POST', { category });
  },

  async queryOrder(orderId: string): Promise<{ status: string }> {
    return request<{ status: string }>(`/payment/query/${orderId}`);
  },

  async getOrders(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PageResult<OrderItem>> {
    const qs = new URLSearchParams();
    qs.set('page', String(params?.page || 1));
    qs.set('pageSize', String(params?.pageSize || 20));
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    if (params?.startDate) qs.set('startDate', params.startDate);
    if (params?.endDate) qs.set('endDate', params.endDate);
    return request<PageResult<OrderItem>>(`/user/orders?${qs.toString()}`);
  },

  async cancelOrder(orderId: string): Promise<void> {
    return request<void>(`/orders/${orderId}/cancel`, 'POST');
  },

  async continuePayment(orderId: string): Promise<PaymentParams> {
    return request<PaymentParams>(`/orders/${orderId}/pay`, 'POST');
  },

  async getHistory(page = 1, pageSize = 20): Promise<PageResult<ArticleData>> {
    return request<PageResult<ArticleData>>(`/user/history?page=${page}&pageSize=${pageSize}`);
  },

  // Settings (public)
  async getSettings(): Promise<PublicSettings> {
    return request<PublicSettings>('/settings');
  },

  // VIP Plans
  async getVipPlans(): Promise<VipPlanData[]> {
    return request<VipPlanData[]>('/vip-plans');
  },

  // AI
  async aiChat(message: string, sessionId?: string): Promise<{ reply: string; creditsRemaining: number; sessionId: string }> {
    return request('/ai/chat', 'POST', { message, sessionId });
  },

  // Banners
  async getBanners(): Promise<BannerData[]> {
    return request<BannerData[]>('/banners');
  },

  // File Upload
  /**
   * 上传图片到服务器
   * @param filePath 本地文件路径
   * @param type 图片类型：avatar, banner, article, category, poster, editor, other
   */
  async uploadImage(filePath: string, type: string = 'other'): Promise<string> {
    const token = getToken();
    
    return new Promise((resolve, reject) => {
      Taro.uploadFile({
        url: `${BASE_URL}/upload?type=${type}`,
        filePath,
        name: 'file',
        header: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        success(res) {
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(res.data);
              if (data.success && data.data && data.data.url) {
                resolve(data.data.url);
              } else {
                reject(new Error(data.message || '上传失败'));
              }
            } catch (e) {
              reject(new Error('解析响应失败'));
            }
          } else if (res.statusCode === 401) {
            removeToken();
            reject(new Error('UNAUTHORIZED'));
          } else {
            reject(new Error(`上传失败: HTTP ${res.statusCode}`));
          }
        },
        fail(err) {
          reject(err);
        }
      });
    });
  },

  /**
   * 上传头像
   */
  async uploadAvatar(filePath: string): Promise<string> {
    return this.uploadImage(filePath, 'avatar');
  },

  /**
   * 选择并上传图片
   * @param type 图片类型
   * @param count 最多选择数量
   */
  async chooseAndUploadImage(type: string = 'other', count: number = 1): Promise<string[]> {
    try {
      const res = await Taro.chooseImage({
        count,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });

      const uploadPromises = res.tempFilePaths.map(filePath => 
        this.uploadImage(filePath, type)
      );

      return Promise.all(uploadPromises);
    } catch (error) {
      throw new Error('选择图片失败');
    }
  },
};
