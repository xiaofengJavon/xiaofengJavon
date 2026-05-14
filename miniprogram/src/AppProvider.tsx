import { useState, useEffect, useCallback, FC, ReactNode } from 'react';
import { AppContext } from './context/AppContext';
import { Article, User, ArticleType, Category, SubscriptionTier, Subscription } from './types';
import { MOCK_USER } from './constants';
import { ApiService, UserProfile, setToken, getToken, getCachedProfile, setCachedProfile, PaymentParams } from './services/api';
import Taro from '@tarojs/taro';

// Map backend UserProfile → frontend User
const mapUser = (profile: UserProfile): User => {
  const subscribedCategories = (profile.activeSubscriptions || []).map(s => s.category);
  const subscriptionExpiries: Record<string, string> = {};
  (profile.activeSubscriptions || []).forEach(s => {
    subscriptionExpiries[s.category] = s.expiryDate;
  });
  return {
    id: profile.id,
    wxOpenid: profile.wxOpenid,
    nickname: profile.nickname,
    avatar: profile.avatarUrl,
    phone: profile.phone,
    isVip: profile.isVip,
    subscriptionTier: profile.subscriptionTier as SubscriptionTier,
    credits: profile.credits,
    inviteCode: profile.inviteCode,
    invitedCount: profile.invitedCount,
    vipExpiry: profile.vipExpiry,
    subscriptions: (profile.activeSubscriptions || []) as Subscription[],
    readCount: profile.readCount,
    favoriteCount: profile.favoriteCount,
    unlockedCount: profile.unlockedCount,
    // Legacy fields
    subscribedCategories,
    subscriptionExpiries,
    readArticleIds: [],
    unlockedArticleIds: [],
    favorites: [],
  };
};

// Trigger WeChat payment and poll for order completion
const requestWechatPay = (params: PaymentParams): Promise<void> => {
  return new Promise((resolve, reject) => {
    Taro.requestPayment({
      timeStamp: params.timestamp,
      nonceStr: params.nonceStr,
      package: params.packageValue,
      signType: params.signType as any,
      paySign: params.paySign,
      success: () => resolve(),
      fail: (err: any) => reject(err),
    });
  });
};

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(MOCK_USER);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlePage, setArticlePage] = useState(1);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeModule, setActiveModule] = useState<ArticleType>('industry');
  const [isPromoActive, setIsPromoActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Navigate to login page if user hasn't set nickname
  const checkAndRedirectToLogin = useCallback((profile: UserProfile) => {
    if (!profile.nickname) {
      Taro.navigateTo({ url: '/pages/login/index' });
    }
  }, []);

  // Wechat login flow
  const login = useCallback(async () => {
    try {
      const loginRes = await Taro.login();
      const result = await ApiService.wechatLogin(loginRes.code);
      setToken(result.token);
      setCachedProfile(result.user);
      setUser(mapUser(result.user));
      setIsLoggedIn(true);
      checkAndRedirectToLogin(result.user);
      return true;
    } catch (e: any) {
      console.error('Login failed', e);
      if (e?.message !== 'UNAUTHORIZED') {
        Taro.showToast({ title: '登录失败，请重试', icon: 'none' });
      }
      return false;
    }
  }, [checkAndRedirectToLogin]);

  // Refresh user profile (after subscription etc.)
  const refreshUser = useCallback(async () => {
    try {
      const profile = await ApiService.getUserProfile();
      setCachedProfile(profile);
      setUser(mapUser(profile));
    } catch (e: any) {
      if (e?.message === 'UNAUTHORIZED') {
        setIsLoggedIn(false);
        await login();
      }
    }
  }, [login]);

  // Load articles with pagination
  const loadArticles = useCallback(async (page: number, reset = false, type?: string, category?: string) => {
    try {
      const params: any = { page, pageSize: 20 };
      if (type) params.type = type;
      if (category) params.category = category;
      
      const res = await ApiService.getArticles(params);
      const mapped: Article[] = res.data.map(a => ({
        ...a,
        type: (a.type || 'industry') as ArticleType,
      }));
      if (reset) {
        setArticles(mapped);
      } else {
        setArticles(prev => [...prev, ...mapped]);
      }
      setArticlePage(page);
      setHasMoreArticles(page < res.totalPages);
    } catch (e) {
      console.error('Failed to load articles', e);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      refreshUser(),
      loadArticles(1, true),
      ApiService.getCategories().then(setCategories).catch(console.error),
    ]);
  }, [refreshUser, loadArticles]);

  const loadMoreArticles = useCallback(async (category?: string) => {
    if (hasMoreArticles) {
      const cat = category && category !== '全部' ? category : undefined;
      await loadArticles(articlePage + 1, false, undefined, cat);
    }
  }, [hasMoreArticles, articlePage, loadArticles]);

  const loadArticlesByCategory = useCallback(async (category: string, moduleType: ArticleType) => {
    // 如果选择"全部"，只按模块类型加载
    if (category === '全部') {
      await loadArticles(1, true, moduleType);
    } else {
      // 否则按分类加载（后端会自动过滤模块类型）
      await loadArticles(1, true, undefined, category);
    }
  }, [loadArticles]);

  // On mount: restore cache immediately, then refresh from API
  useEffect(() => {
    const token = getToken();
    if (token) {
      const cached = getCachedProfile();
      if (cached) {
        setUser(mapUser(cached));
        setIsLoggedIn(true);
      }
      refreshUser().then(() => setIsLoggedIn(true)).catch(() => login());
    } else {
      login();
    }
    // Always load categories (public endpoint)
    ApiService.getCategories().then(setCategories).catch(console.error);
    loadArticles(1, true);
  }, []);

  const handleSubscribeVIP = async (tier: SubscriptionTier, category?: Category | null) => {
    Taro.showLoading({ title: '创建订单...' });
    try {
      let payParams: PaymentParams;
      if (category) {
        payParams = await ApiService.subscribeCategory(category as string, tier);
      } else {
        payParams = await ApiService.subscribeVip(tier);
      }
      Taro.hideLoading();

      // Invoke WeChat Pay
      Taro.showLoading({ title: '支付中...' });
      await requestWechatPay(payParams);
      Taro.hideLoading();

      Taro.showToast({ title: '订阅成功！', icon: 'success' });
      await refreshUser();
    } catch (e: any) {
      Taro.hideLoading();
      const msg = e?.errMsg?.includes('cancel') ? '已取消支付' : '支付失败，请重试';
      Taro.showToast({ title: msg, icon: 'none' });
    }
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      articles,
      categories,
      activeModule, setActiveModule,
      isPromoActive, setIsPromoActive,
      handleSubscribeVIP,
      refreshData,
      loadMoreArticles,
      loadArticlesByCategory,
      hasMoreArticles,
      isLoggedIn,
      login,
    }}>
      {children}
    </AppContext.Provider>
  );
};
