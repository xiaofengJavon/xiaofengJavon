import { View, Text, ScrollView } from '@tarojs/components';
import { useState } from 'react';
import Taro, { useLoad, useDidShow } from '@tarojs/taro';
import { ApiService, ArticleData } from '../../services/api';

const MyFavorites = () => {
  const [favorites, setFavorites] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFavorites = async (p: number, reset = false) => {
    try {
      const res = await ApiService.getFavorites(p, 20);
      if (reset) {
        setFavorites(res.data);
      } else {
        setFavorites(prev => [...prev, ...res.data]);
      }
      setPage(p);
      setHasMore(p < res.totalPages);
    } catch (e: any) {
      if (e?.message !== 'UNAUTHORIZED') {
        Taro.showToast({ title: '加载失败', icon: 'none' });
      }
    } finally {
      setLoading(false);
    }
  };

  useLoad(() => { loadFavorites(1, true); });
  useDidShow(() => { loadFavorites(1, true); });

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadFavorites(page + 1);
    setLoadingMore(false);
  };

  const handleArticleClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/article/index?id=${id}` });
  };

  const handleUnfavorite = async (id: string) => {
    try {
      await ApiService.toggleFavorite(id);
      setFavorites(prev => prev.filter(a => a.id !== id));
      Taro.showToast({ title: '已取消收藏', icon: 'success' });
    } catch (e) {
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  return (
    <View className="page-container" style={{ padding: '20px' }}>
      <View className="page-title" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
        我的收藏
      </View>

      {loading ? (
        <View style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
          <Text>加载中...</Text>
        </View>
      ) : (
        <ScrollView scrollY onScrollToLower={handleLoadMore} lowerThreshold={80}>
          {favorites.length > 0 ? (
            favorites.map((article) => (
              <View
                key={article.id}
                style={{
                  background: '#fff', padding: '15px', borderRadius: '8px',
                  marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                }}
              >
                <View style={{ flex: 1 }} onClick={() => handleArticleClick(article.id)}>
                  <Text style={{ display: 'block', fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>
                    {article.title}
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#999' }}>
                    {article.date} · {article.category}
                  </Text>
                </View>
                <View
                  style={{ color: '#ef4444', fontSize: '20px', padding: '0 4px', marginLeft: '8px' }}
                  onClick={() => handleUnfavorite(article.id)}
                >
                  ❤️
                </View>
              </View>
            ))
          ) : (
            <View style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
              <Text>暂无收藏</Text>
            </View>
          )}
          {hasMore && (
            <View style={{ textAlign: 'center', padding: '10px', color: '#999' }}>
              <Text>{loadingMore ? '加载中...' : '上拉加载更多'}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default MyFavorites;
