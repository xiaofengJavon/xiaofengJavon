import { createContext, useContext } from 'react';
import { Article, User, ArticleType, Category, SubscriptionTier } from '../types';

export interface AppContextType {
  user: User;
  setUser: (user: User) => void;
  articles: Article[];
  activeModule: ArticleType;
  setActiveModule: (type: ArticleType) => void;
  isPromoActive: boolean;
  setIsPromoActive: (v: boolean) => void;
  handleSubscribeVIP: (tier: SubscriptionTier, category?: Category | null) => Promise<void>;
  categories: any[];
  refreshData: () => void;
  loadMoreArticles: (category?: string) => Promise<void>;
  loadArticlesByCategory: (category: string, moduleType: ArticleType) => Promise<void>;
  hasMoreArticles: boolean;
  isLoggedIn: boolean;
  login: () => Promise<boolean>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
