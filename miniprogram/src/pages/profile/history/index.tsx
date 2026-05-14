import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useCallback } from 'react';
import Taro, { useLoad } from '@tarojs/taro';
import { ApiService, ArticleData } from '../../../services/api';
import './index.css';

const HistoryPage = () => {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (p = 1, reset = false) => {
    setLoading(true);
    try {
      const res = await ApiService.getHistory(p, 20);
      const list = res.data;
      setArticles(prev => reset ? list : [...prev, ...list]);
      setPage(p);
      setHasMore(p < res.totalPages);
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  }, []);

  useLoad(() => { load(1, true); });

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} 天前`;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <View className="history-wrap">
      <Text className="page-title">浏览历史</Text>

      <ScrollView
        scrollY
        className="history-scroll"
        showScrollbar={false}
        onScrollToLower={() => hasMore && !loading && load(page + 1)}
        style={{ flex: 1 }}
      >
        {loading && articles.length === 0 ? (
          <View className="history-loading">
            <View className="loading-dots">
              <View className="dot dot1" /><View className="dot dot2" /><View className="dot dot3" />
            </View>
            <Text className="loading-text">加载中…</Text>
          </View>
        ) : articles.length === 0 ? (
          <View className="history-empty">
            <Text className="empty-icon">🔍</Text>
            <Text className="empty-title">暂无浏览记录</Text>
            <Text className="empty-sub">阅读文章后，记录将在此显示</Text>
          </View>
        ) : (
          <View className="history-list">
            {articles.map((a, i) => (
              <View
                key={a.id}
                className="history-card"
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => Taro.navigateTo({ url: `/pages/article/index?id=${a.id}` })}
              >
                <View className="card-left">
                  <View className="cat-pill">
                    <Text className="cat-text">{a.category}</Text>
                  </View>
                  <Text className="article-title">{a.title}</Text>
                  <Text className="article-summary" numberOfLines={2}>{a.summary}</Text>
                  <View className="article-meta">
                    <Text className="meta-date">{formatDate(a.date)}</Text>
                    {a.readTime > 0 && (
                      <Text className="meta-read">· {a.readTime} 分钟阅读</Text>
                    )}
                    {a.isPremium && <View className="premium-badge"><Text className="premium-text">付费</Text></View>}
                  </View>
                </View>
                <Text className="card-arrow">›</Text>
              </View>
            ))}

            {hasMore ? (
              <View className="load-more" onClick={() => load(page + 1)}>
                <Text className="load-more-text">{loading ? '加载中…' : '加载更多'}</Text>
              </View>
            ) : articles.length > 0 ? (
              <Text className="list-end">— 已显示全部历史 —</Text>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HistoryPage;
