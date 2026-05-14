import { View, Text, Input, Button, ScrollView, Image, Swiper, SwiperItem } from '@tarojs/components';
import { useState, useMemo, useEffect, useRef } from 'react';
import Taro, { useLoad } from '@tarojs/taro';
import { useAppContext } from '../../context/AppContext';
import { ArticleItem } from '../../components/ArticleItem';
import { Category, SubscriptionTier, Banner } from '../../types';
import { ApiService } from '../../services/api';
import './index.css';

const Home = () => {
  const { articles, user, activeModule, setActiveModule, refreshData, handleSubscribeVIP, categories, loadMoreArticles, loadArticlesByCategory, hasMoreArticles } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | '全部'>('全部');
  const [showPromo, setShowPromo] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [topArticles, setTopArticles] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activateSearch = async () => {
    setIsSearchActive(true);
    setSearchResults([]);
    if (topArticles.length === 0) {
      try {
        const top = await ApiService.getTopArticles(10);
        setTopArticles(top);
      } catch {}
    }
  };

  const cancelSearch = () => {
    setIsSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    if (!isSearchActive) return;
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await ApiService.searchArticles(searchQuery.trim());
        setSearchResults(res.data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [searchQuery, isSearchActive]);

  const handleModuleSwitch = async (mod: 'industry' | 'policy') => {
    setActiveModule(mod);
    setSelectedCategory('全部');
    setIsCategoryExpanded(false);
    // 重新加载该模块的文章
    await loadArticlesByCategory('全部', mod);
  };

  const toggleCategoryExpand = () => {
    setIsCategoryExpanded(!isCategoryExpanded);
  };

  const handleCategorySelect = async (cat: Category | '全部') => {
    setSelectedCategory(cat);
    setIsCategoryExpanded(false);
    // 重新加载该分类的文章
    await loadArticlesByCategory(cat, activeModule);
  };

  useLoad(async () => {
    refreshData();
    try {
      const settingsRes = await ApiService.getSettings();
      setSettings(settingsRes);
      if (settingsRes?.popupEnabled &&
          (!settingsRes.popupExpiryDate || new Date(settingsRes.popupExpiryDate) > new Date())) {
        setTimeout(() => setShowPromo(true), 1000);
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    
    // 加载轮播图
    try {
      const bannersRes = await ApiService.getBanners();
      setBanners(bannersRes);
    } catch (e) {
      console.error('Failed to load banners', e);
    }
  });

  const handleSubscribeFromPromo = () => {
      const items = ['月度会员 (¥29)', '季度会员 (¥78)', '年度会员 (¥268)'];
      const tiers = [SubscriptionTier.MONTHLY, SubscriptionTier.QUARTERLY, SubscriptionTier.YEARLY];
      Taro.showActionSheet({
          itemList: items,
          success: async (res) => {
              const tier = tiers[res.tapIndex];
              try {
                  await handleSubscribeVIP(tier);
                  setShowPromo(false);
              } catch (e) {
                  // handled inside handleSubscribeVIP
              }
          }
      });
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.linkType === 'none') return;
    
    if (banner.linkType === 'article' && banner.linkTarget) {
      // 跳转到文章详情
      Taro.navigateTo({ url: `/pages/article-detail/index?id=${banner.linkTarget}` });
    } else if (banner.linkType === 'external' && banner.linkUrl) {
      // 复制外部链接到剪贴板
      Taro.setClipboardData({
        data: banner.linkUrl,
        success: () => {
          Taro.showToast({ title: '链接已复制', icon: 'success' });
        }
      });
    } else if (banner.linkType === 'category' && banner.linkTarget) {
      // 切换到对应分类
      const category = categories.find(c => c.name === banner.linkTarget);
      if (category) {
        setSelectedCategory(category.name);
        // 如果分类不在当前模块，切换模块
        if (category.type !== activeModule) {
          setActiveModule(category.type as 'industry' | 'policy');
        }
      }
    }
  };

  const handleLoadMore = async () => {
      if (loadingMore || !hasMoreArticles || searchQuery) return;
      setLoadingMore(true);
      try { 
        await loadMoreArticles(selectedCategory === '全部' ? undefined : selectedCategory); 
      } finally { 
        setLoadingMore(false); 
      }
  };

  const currentModuleCategories = useMemo(() => {
    // Filter categories by type (industry/policy)
    if (!Array.isArray(categories)) return [];
    return categories
        .filter(c => c.type === activeModule)
        .map(c => c.name);
  }, [activeModule, categories]);

  // 计算展开容器需要的实际高度
  const expandedContainerHeight = useMemo(() => {
    const totalItems = currentModuleCategories.length + 1; // +1 for "全部"
    const rows = Math.ceil(totalItems / 3); // 3列布局
    const itemHeight = 120; // 每个标签项的高度 (rpx) - 增加以确保完整显示
    const gap = 20; // 间距 (rpx)
    const paddingTop = 20; // 上内边距 (rpx)
    const paddingBottom = 28; // 下内边距 (rpx)
    const extraBuffer = 50; // 额外缓冲空间 (rpx)
    
    // 计算总高度：行数 × 单项高度 + (行数-1) × 间距 + 上下内边距 + 缓冲
    const totalHeight = rows * itemHeight + (rows - 1) * gap + paddingTop + paddingBottom + extraBuffer;
    return totalHeight;
  }, [currentModuleCategories]);

  const getCategoryColor = (catName: string) => {
      const cat = categories.find(c => c.name === catName);
      return cat ? cat.color : '#3b82f6';
  };

  const filteredArticles = useMemo(() => {
    console.log('=== Filtering Articles ===');
    console.log('Total articles:', articles.length);
    console.log('Active module:', activeModule);
    console.log('Selected category:', selectedCategory);
    
    // 后端已经按照 category 过滤了，前端只需要处理搜索
    let filtered = articles;
    
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.title.includes(searchQuery) || a.summary.includes(searchQuery)
      );
      console.log('After search filter:', filtered.length);
    }

    // Log some sample articles
    console.log('Sample filtered articles:', filtered.slice(0, 3).map(a => ({
      title: a.title,
      category: a.category,
      moduleType: a.moduleType,
      isPremium: a.isPremium,
      hasAccess: a.hasAccess
    })));

    // Sort: Sticky first, then date descending
    return filtered.sort((a, b) => {
        if (a.isSticky && !b.isSticky) return -1;
        if (!a.isSticky && b.isSticky) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [articles, activeModule, selectedCategory, searchQuery]);


  const handleArticleClick = (article: any) => {
     Taro.navigateTo({ url: `/pages/article/index?id=${article.id}` });
  };

  return (
    <View className="home-container">
      <View className="header-section">

        {/* ── Top bar: brand ↔ search crossfade ── */}
        <View className="header-top">
          {/* Normal state */}
          <View className={`top-bar ${isSearchActive ? 'top-bar-out' : ''}`}>
            <View className="brand">
              <View className="logo">创</View>
              <View>
                <Text className="app-name">创新助理</Text>
                <Text className="app-slogan">信息通+政策通</Text>
              </View>
            </View>
            <View className="search-icon-btn" onClick={activateSearch}>
              <Text className="search-icon-glyph">🔍</Text>
            </View>
          </View>

          {/* Search active state */}
          <View className={`search-full-bar ${isSearchActive ? 'search-bar-in' : ''}`}>
            <View className="search-input-wrap">
              <Text className="search-lead-icon">🔍</Text>
              <Input
                className="search-input"
                placeholder="搜索文章标题或内容…"
                value={searchQuery}
                focus={isSearchActive}
                onInput={e => setSearchQuery(e.detail.value)}
                onConfirm={e => setSearchQuery(e.detail.value)}
              />
              {searchQuery.length > 0 && (
                <View className="search-clear-btn" onClick={() => setSearchQuery('')}>
                  <Text className="search-clear-icon">✕</Text>
                </View>
              )}
            </View>
            <Text className="search-cancel-btn" onClick={cancelSearch}>取消</Text>
          </View>
        </View>

        {/* ── Banner + filter: collapse when searching ── */}
        <View className={`header-body ${isSearchActive ? 'header-body-hidden' : ''}`}>
          {/* Banner swiper */}
          {banners.length > 0 && (
            <Swiper
              className="banner-swiper"
              indicatorDots
              indicatorActiveColor="#4f46e5"
              indicatorColor="rgba(255,255,255,0.45)"
              autoplay
              interval={3500}
              circular
            >
              {banners.map((banner) => (
                <SwiperItem key={banner.id}>
                  <Image 
                    src={banner.imageUrl} 
                    className="banner-img" 
                    mode="aspectFill"
                    onClick={() => handleBannerClick(banner)}
                  />
                </SwiperItem>
              ))}
            </Swiper>
          )}

          {/* Filter row: module mini-switch (sticky left) + scrollable chips */}
          <View className="filter-row">
            <View className="module-mini-switch">
              <View
                className={`mini-btn ${activeModule === 'industry' ? 'mini-ind' : ''}`}
                onClick={() => handleModuleSwitch('industry')}
              >
                <Text className="mini-text">产业</Text>
              </View>
              <View
                className={`mini-btn ${activeModule === 'policy' ? 'mini-pol' : ''}`}
                onClick={() => handleModuleSwitch('policy')}
              >
                <Text className="mini-text">政策</Text>
              </View>
            </View>

            <ScrollView scrollX className="filter-scroll" showScrollbar={false}>
              <View className="filter-content">
                <View
                  className={`filter-chip ${selectedCategory === '全部' ? 'chip-selected' : ''}`}
                  onClick={() => handleCategorySelect('全部')}
                >
                  <Text>全部</Text>
                </View>
                {currentModuleCategories.slice(0, 3).map(cat => (
                  <View
                    key={cat}
                    className={`filter-chip ${selectedCategory === cat ? 'chip-selected' : ''}`}
                    onClick={() => handleCategorySelect(cat as Category)}
                  >
                    <Text>{cat}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* 展开/收起按钮 */}
            {currentModuleCategories.length > 3 && (
              <View className="expand-btn-wrapper">
                <View 
                  className={`expand-btn ${isCategoryExpanded ? 'expanded' : ''}`}
                  onClick={toggleCategoryExpand}
                >
                  <Text className="expand-icon">{isCategoryExpanded ? '▲' : '▼'}</Text>
                  <Text className="expand-text">
                    {isCategoryExpanded ? '收起' : (selectedCategory === '全部' ? '展开' : selectedCategory)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* 展开的类型选择容器 */}
          <View 
            className={`category-expand-container ${isCategoryExpanded ? 'container-expanded' : ''}`}
            style={{ maxHeight: isCategoryExpanded ? `${expandedContainerHeight}rpx` : '0' }}
          >
            <View className="category-grid">
              <View
                className={`category-grid-item ${selectedCategory === '全部' ? 'grid-item-selected' : ''}`}
                onClick={() => handleCategorySelect('全部')}
              >
                <Text className="grid-item-text">全部</Text>
              </View>
              {currentModuleCategories.map(cat => (
                <View
                  key={cat}
                  className={`category-grid-item ${selectedCategory === cat ? 'grid-item-selected' : ''}`}
                  onClick={() => handleCategorySelect(cat as Category)}
                >
                  <Text className="grid-item-text">{cat}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* ── Content ── */}
      {isSearchActive ? (
        <ScrollView scrollY className="content-scroll">
          {!searchQuery.trim() ? (
            /* 排行榜 */
            <View className="leaderboard">
              <Text className="leaderboard-title">🔥 热读榜 Top 10</Text>
              {topArticles.length === 0 ? (
                <View className="empty-state"><Text>加载中…</Text></View>
              ) : (
                topArticles.map((article, idx) => (
                  <View key={article.id} className="rank-item" onClick={() => handleArticleClick(article)}>
                    <Text className={`rank-num ${idx < 3 ? 'rank-top' : ''}`}>{idx + 1}</Text>
                    <View className="rank-info">
                      <Text className="rank-title">{article.title}</Text>
                      <View className="rank-meta">
                        <Text className="rank-category">{article.category}</Text>
                        <Text className="rank-views">👁 {article.viewCount ?? 0}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          ) : searchLoading ? (
            /* 搜索中 */
            <View className="empty-state"><Text>搜索中…</Text></View>
          ) : (
            /* 搜索结果 */
            <View className="article-list">
              <View className="search-result-bar">
                <Text className="search-result-text">"{searchQuery}" · {searchResults.length} 条结果</Text>
              </View>
              {searchResults.length === 0 ? (
                <View className="empty-state"><Text>未找到相关内容</Text></View>
              ) : (
                searchResults.map(article => (
                  <ArticleItem
                    key={article.id}
                    article={article}
                    isRead={false}
                    hasAccess={!!(article.hasAccess || user.isVip || user.subscribedCategories.includes(article.category))}
                    onClick={() => handleArticleClick(article)}
                    categoryColor={getCategoryColor(article.category)}
                  />
                ))
              )}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView scrollY className="content-scroll" onScrollToLower={handleLoadMore} lowerThreshold={100}>
          <View className="article-list">
            {filteredArticles.length === 0 ? (
              <View className="empty-state"><Text>暂无内容</Text></View>
            ) : (
              filteredArticles.map(article => (
                <ArticleItem
                  key={article.id}
                  article={article}
                  isRead={false}
                  hasAccess={!!(article.hasAccess || user.isVip || user.subscribedCategories.includes(article.category))}
                  onClick={() => handleArticleClick(article)}
                  categoryColor={getCategoryColor(article.category)}
                />
              ))
            )}
            {hasMoreArticles && selectedCategory === '全部' && (
              <View className="load-more">
                <Text>{loadingMore ? '加载中...' : '上拉加载更多'}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Promo Modal */}
      {showPromo && (
        <View className="promo-overlay">
          <View className="promo-modal">
            <View className="promo-close" onClick={() => setShowPromo(false)}>✕</View>
            {settings?.popupImage ? (
              <Image src={settings.popupImage} className="promo-image" mode="widthFix" style={{ width: '100%', marginBottom: '10px' }} />
            ) : (
              <View className="promo-icon">🎉</View>
            )}
            <View className="promo-content">
              <Button className="promo-btn" onClick={handleSubscribeFromPromo}>立即订阅</Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default Home;
