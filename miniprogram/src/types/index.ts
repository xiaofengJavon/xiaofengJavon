import { SubscriptionTier } from './enums';

export { SubscriptionTier };

export type ArticleType = 'industry' | 'policy';

export type Category = string;

export interface Subscription {
  id: string;
  category: string;
  expiryDate: string;
  isActive: boolean;
}

export interface Article {
  id: string;
  type: ArticleType;
  title: string;
  summary: string;
  content: string;
  category: Category;
  moduleType?: ArticleType; // 从后端返回的虚拟字段
  date: string;
  isPremium: boolean;
  readTime: number;
  viewCount: number;
  favoriteCount: number;
  likes?: number;
  shareCount?: number;
  isSticky?: boolean;
  // Backend-provided access & interaction flags
  isFavorited?: boolean;
  isLiked?: boolean;
  hasAccess?: boolean;
}

export interface User {
  id?: string;
  wxOpenid?: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  isVip: boolean;
  subscriptionTier: SubscriptionTier;
  credits: number;
  inviteCode?: string;
  invitedCount?: number;
  vipExpiry?: string;
  // Category subscriptions from backend
  subscriptions: Subscription[];
  // Counts (backend returns counts, not arrays)
  readCount?: number;
  favoriteCount?: number;
  unlockedCount?: number;
  // Legacy fields kept for component compatibility
  subscribedCategories: Category[];
  subscriptionExpiries: Record<string, string>;
  readArticleIds: string[];
  unlockedArticleIds: string[];
  favorites: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Banner {
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
