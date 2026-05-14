import { View, Text, ScrollView, Input } from '@tarojs/components';
import { useState, useCallback, useMemo } from 'react';
import Taro, { useLoad, useDidShow } from '@tarojs/taro';
import { useAppContext } from '../../context/AppContext';
import { ApiService, CategoryData, SubscriptionItem, VipPlanData } from '../../services/api';
import { SubscriptionTier } from '../../types';
import './index.css';

type TabType = 'vip' | 'category';
type PlanType = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
type FilterType = 'all' | 'policy' | 'industry' | 'publication' | 'subscribed';

const CAT_FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',         label: '全部' },
  { key: 'policy',      label: '政策通' },
  { key: 'industry',    label: '产业情报' },
  { key: 'publication', label: '电子刊物' },
  { key: 'subscribed',  label: '已订阅' },
];

const SubscribePage = () => {
  const { user, handleSubscribeVIP, refreshData, categories, isLoggedIn } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('vip');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('QUARTERLY');
  const [loadingCat, setLoadingCat] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [catSearch, setCatSearch] = useState('');
  const [catFilter, setCatFilter] = useState<FilterType>('all');
  const [vipPlans, setVipPlans] = useState<VipPlanData[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const loadSubscriptions = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const subs = await ApiService.getSubscriptions();
      setSubscriptions(subs);
    } catch (_) {}
  }, [isLoggedIn]);

  const loadVipPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const plans = await ApiService.getVipPlans();
      setVipPlans(plans);
      // 设置默认选中的套餐（如果有推荐的就选推荐的，否则选第一个）
      const recommended = plans.find(p => p.badge === '推荐');
      if (recommended) {
        setSelectedPlan(recommended.key as PlanType);
      } else if (plans.length > 0) {
        setSelectedPlan(plans[0].key as PlanType);
      }
    } catch (error) {
      console.error('加载VIP套餐失败', error);
      Taro.showToast({ title: '加载套餐失败', icon: 'none' });
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useLoad(() => { 
    loadSubscriptions();
    loadVipPlans();
  });
  useDidShow(() => { loadSubscriptions(); });

  const isSubscribed = (catName: string) =>
    subscriptions.some(s => s.category === catName && s.isActive);

  const getExpiry = (catName: string): string | undefined => {
    const sub = subscriptions.find(s => s.category === catName);
    return sub?.expiryDate as unknown as string | undefined;
  };

  const handleVipSubscribe = async () => {
    if (!isLoggedIn) {
      Taro.navigateTo({ url: '/pages/login/index' });
      return;
    }
    await handleSubscribeVIP(selectedPlan as SubscriptionTier);
    await loadSubscriptions();
  };

  const handleCatSubscribe = async (cat: CategoryData) => {
    if (!isLoggedIn) {
      Taro.navigateTo({ url: '/pages/login/index' });
      return;
    }
    const isFree = !cat.priceMonthly || Number(cat.priceMonthly) === 0;
    setLoadingCat(cat.name);
    try {
      if (isFree) {
        await ApiService.freeSubscribe(cat.name);
        Taro.showToast({ title: '订阅成功！', icon: 'success' });
        await refreshData();
        await loadSubscriptions();
      } else {
        const plans = [
          `月度  ¥${cat.priceMonthly}`,
          `季度  ¥${cat.priceQuarterly}`,
          `年度  ¥${cat.priceYearly}`,
        ];
        const tiers: PlanType[] = ['MONTHLY', 'QUARTERLY', 'YEARLY'];
        Taro.showActionSheet({
          itemList: plans,
          success: async (res) => {
            try {
              await handleSubscribeVIP(tiers[res.tapIndex] as SubscriptionTier, cat.name);
              await loadSubscriptions();
            } catch (_) {}
          },
        });
      }
    } catch (_) {
      Taro.showToast({ title: '订阅失败，请重试', icon: 'none' });
    } finally {
      setLoadingCat(null);
    }
  };

  const policyCategories       = categories.filter((c: CategoryData) => c.type === 'policy');
  const industryCategories     = categories.filter((c: CategoryData) => c.type === 'industry');
  const publicationCategories  = categories.filter((c: CategoryData) => c.type === 'publication');

  const activePlan = vipPlans.find(p => p.key === selectedPlan);
  const vipFeatures = activePlan?.features || [];

  const isFiltering = catFilter !== 'all' || catSearch.trim() !== '';

  const filteredCategories = useMemo<CategoryData[]>(() => {
    let list: CategoryData[] = [...categories];
    if (catFilter === 'subscribed')    list = list.filter(c => isSubscribed(c.name));
    else if (catFilter !== 'all')      list = list.filter(c => c.type === catFilter);
    const q = catSearch.trim();
    if (q) list = list.filter(c => c.name.includes(q));
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, catFilter, catSearch, subscriptions]);

  const renderCategoryCard = (cat: CategoryData, idx: number) => {
    const subscribed = isSubscribed(cat.name);
    const expiry     = getExpiry(cat.name);
    const isFree     = !cat.priceMonthly || Number(cat.priceMonthly) === 0;
    const isLoading  = loadingCat === cat.name;

    return (
      <View
        key={cat.id}
        className={`cat-card ${subscribed ? 'cat-subscribed' : ''}`}
        style={{ animationDelay: `${idx * 60}ms` }}
      >
        <View className="cat-dot" style={{ backgroundColor: cat.color }} />
        <Text className="cat-name">{cat.name}</Text>

        {isFree ? (
          <View className="cat-price-tag free-tag">
            <Text className="tag-text">免费</Text>
          </View>
        ) : (
          <Text className="cat-price">¥{cat.priceMonthly}/月</Text>
        )}

        {subscribed ? (
          <View className="cat-sub-status">
            <View className="sub-check-row">
              <Text className="subscribed-check">✓ 已订阅</Text>
            </View>
            {expiry && (
              <Text className="expiry-text">
                {new Date(expiry).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', year: 'numeric' })} 到期
              </Text>
            )}
            <View
              className="renew-btn"
              onClick={() => !isLoading && handleCatSubscribe(cat)}
            >
              <Text className="renew-text">{isLoading ? '处理中…' : '续费'}</Text>
            </View>
          </View>
        ) : (
          <View
            className={`cat-btn ${isLoading ? 'cat-btn-loading' : ''}`}
            onClick={() => !isLoading && handleCatSubscribe(cat)}
          >
            <Text className="cat-btn-text">
              {isLoading ? '处理中…' : isFree ? '免费订阅' : '立即订阅'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="sub-wrap">
      {/* ── HERO ── */}
      <View className="sub-hero">
        <View className="hero-orb orb1" />
        <View className="hero-orb orb2" />
        <View className="hero-content">
          <Text className="hero-title">订阅中心</Text>
          <Text className="hero-sub">精准内容，实时送达</Text>
        </View>

        {/* Status strip */}
        <View className="status-strip">
          <View className="status-item">
            <Text className="status-icon">✦</Text>
            <View>
              <Text className="status-label">VIP 会员</Text>
              <Text className={`status-value ${user.isVip ? 'status-active' : ''}`}>
                {user.isVip && user.vipExpiry
                  ? `${new Date(user.vipExpiry).toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })} 到期`
                  : '未开通'}
              </Text>
            </View>
          </View>
          <View className="status-divider" />
          <View className="status-item">
            <Text className="status-icon">◈</Text>
            <View>
              <Text className="status-label">分类订阅</Text>
              <Text className={`status-value ${subscriptions.length > 0 ? 'status-active' : ''}`}>
                {subscriptions.length > 0 ? `${subscriptions.length} 个已订阅` : '暂无订阅'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── TAB BAR ── */}
      <View className="tab-bar">
        <View className="tab-track">
          <View className={`tab-indicator ${activeTab === 'category' ? 'tab-right' : ''}`} />
          <View
            className={`tab-item ${activeTab === 'vip' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('vip')}
          >
            <Text>VIP 会员</Text>
          </View>
          <View
            className={`tab-item ${activeTab === 'category' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('category')}
          >
            <Text>分类订阅</Text>
          </View>
        </View>
      </View>

      {/* ── SCROLL CONTENT ── */}
      <ScrollView scrollY className="sub-scroll" showScrollbar={false}>

        {/* VIP PANEL */}
        <View className={`panel ${activeTab === 'vip' ? 'panel-show' : 'panel-hide'}`}>
          <View className="vip-card">
            <View className="vip-glow" />

            <View className="vip-crown-row">
              <Text className="vip-crown">✦</Text>
              <Text className="vip-brand">创新助理会员</Text>
              <Text className="vip-crown">✦</Text>
            </View>
            <Text className="vip-tagline">一键解锁全平台内容</Text>

            {/* Feature list */}
            <View className="feature-list">
              {loadingPlans ? (
                <Text className="loading-text">加载中...</Text>
              ) : (
                vipFeatures.map((f, i) => (
                  <View key={i} className="feature-item" style={{ animationDelay: `${i * 80}ms` }}>
                    <Text className="feature-icon">{f.icon}</Text>
                    <Text className="feature-text">{f.text}</Text>
                  </View>
                ))
              )}
            </View>

            {/* Plan Selector */}
            <View className="plan-row">
              {loadingPlans ? (
                <Text className="loading-text">加载套餐中...</Text>
              ) : (
                vipPlans.map(p => (
                  <View
                    key={p.key}
                    className={`plan-card ${selectedPlan === p.key ? 'plan-selected' : ''}`}
                    onClick={() => setSelectedPlan(p.key as PlanType)}
                  >
                    {p.badge && <View className="plan-badge"><Text className="badge-text">{p.badge}</Text></View>}
                    <Text className="plan-label">{p.label}</Text>
                    <Text className="plan-price">¥{p.price}</Text>
                    <Text className="plan-per">{p.per}</Text>
                  </View>
                ))
              )}
            </View>

            {/* CTA */}
            <View className="vip-cta" onClick={handleVipSubscribe}>
              <Text className="vip-cta-text">
                {loadingPlans ? '加载中...' : (
                  user.isVip ? `续费会员 · ¥${activePlan?.price || 0}` : `立即开通 · ¥${activePlan?.price || 0}`
                )}
              </Text>
            </View>

            {user.isVip && user.vipExpiry && (
              <Text className="vip-expiry-hint">
                当前会员有效期至 {new Date(user.vipExpiry).toLocaleDateString('zh-CN')}
              </Text>
            )}
          </View>
        </View>

        {/* CATEGORY PANEL */}
        <View className={`panel ${activeTab === 'category' ? 'panel-show' : 'panel-hide'}`}>

          {/* ── Search + Filter ── */}
          <View className="cat-toolbar">
            {/* Search */}
            <View className="cat-search-wrap">
              <Text className="search-icon-text">🔍</Text>
              <Input
                className="cat-search-input"
                placeholder="搜索分类名称…"
                placeholderClass="cat-search-placeholder"
                value={catSearch}
                onInput={e => setCatSearch(e.detail.value)}
              />
              {catSearch.length > 0 && (
                <View className="search-clear" onClick={() => setCatSearch('')}>
                  <Text className="search-clear-text">✕</Text>
                </View>
              )}
            </View>

            {/* Filter Chips */}
            <ScrollView scrollX className="filter-chips-scroll" showScrollbar={false}>
              <View className="filter-chips-row">
                {CAT_FILTERS.map(f => (
                  <View
                    key={f.key}
                    className={`filter-chip ${catFilter === f.key ? 'chip-active' : ''}`}
                    onClick={() => setCatFilter(f.key)}
                  >
                    <Text className={`chip-text ${catFilter === f.key ? 'chip-text-active' : ''}`}>
                      {f.label}
                    </Text>
                    {f.key === 'subscribed' && subscriptions.length > 0 && (
                      <View className="chip-badge">
                        <Text className="chip-badge-text">{subscriptions.length}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ── Filtered flat grid ── */}
          {isFiltering ? (
            <View className="cat-section">
              {filteredCategories.length > 0 ? (
                <>
                  <Text className="filter-result-hint">{filteredCategories.length} 个分类</Text>
                  <View className="cat-grid">
                    {filteredCategories.map((cat: CategoryData, i: number) => renderCategoryCard(cat, i))}
                  </View>
                </>
              ) : (
                <View className="empty-state">
                  <Text className="empty-icon">◎</Text>
                  <Text className="empty-text">
                    {catSearch.trim() ? `未找到"${catSearch.trim()}"相关分类` : '暂无符合条件的分类'}
                  </Text>
                  {catSearch.trim() && (
                    <View className="clear-search-btn" onClick={() => { setCatSearch(''); setCatFilter('all'); }}>
                      <Text className="clear-search-text">清除搜索</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ) : (
            /* ── Default grouped view ── */
            <>
              {policyCategories.length > 0 && (
                <View className="cat-section">
                  <View className="section-header">
                    <View className="section-dot policy-dot" />
                    <Text className="section-title">政策通</Text>
                    <Text className="section-count">{policyCategories.length} 个分类</Text>
                  </View>
                  <View className="cat-grid">
                    {policyCategories.map((cat: CategoryData, i: number) => renderCategoryCard(cat, i))}
                  </View>
                </View>
              )}

              {industryCategories.length > 0 && (
                <View className="cat-section">
                  <View className="section-header">
                    <View className="section-dot industry-dot" />
                    <Text className="section-title">产业情报</Text>
                    <Text className="section-count">{industryCategories.length} 个分类</Text>
                  </View>
                  <View className="cat-grid">
                    {industryCategories.map((cat: CategoryData, i: number) => renderCategoryCard(cat, i))}
                  </View>
                </View>
              )}

              {publicationCategories.length > 0 && (
                <View className="cat-section">
                  <View className="section-header">
                    <View className="section-dot publication-dot" />
                    <Text className="section-title">电子刊物</Text>
                    <Text className="section-count">{publicationCategories.length} 个刊物</Text>
                  </View>
                  <View className="cat-grid">
                    {publicationCategories.map((cat: CategoryData, i: number) => renderCategoryCard(cat, i))}
                  </View>
                </View>
              )}

              {categories.length === 0 && (
                <View className="empty-state">
                  <Text className="empty-icon">◎</Text>
                  <Text className="empty-text">暂无可用分类</Text>
                </View>
              )}
            </>
          )}
        </View>

      </ScrollView>
    </View>
  );
};

export default SubscribePage;
