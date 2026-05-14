import { View, Text, ScrollView, Input } from '@tarojs/components';
import { useState, useCallback, useEffect } from 'react';
import Taro, { useLoad } from '@tarojs/taro';
import { ApiService, OrderItem } from '../../../services/api';
import './index.css';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PAID:      { label: '已支付', cls: 'status-paid' },
  PENDING:   { label: '待支付', cls: 'status-pending' },
  FAILED:    { label: '已失败', cls: 'status-failed' },
  REFUNDED:  { label: '已退款', cls: 'status-refunded' },
  CANCELLED: { label: '已取消', cls: 'status-cancelled' },
};

const TYPE_MAP: Record<string, string> = {
  VIP:      'VIP 会员',
  CATEGORY: '分类订阅',
};

const TAB_OPTIONS = [
  { key: 'ALL', label: '全部' },
  { key: 'PENDING', label: '待支付' },
  { key: 'PAID', label: '已支付' },
  { key: 'CANCELLED', label: '已取消' },
];

const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const load = useCallback(async (p = 1, reset = false) => {
    setLoading(true);
    try {
      const params: any = { page: p, pageSize: 20 };
      if (activeTab !== 'ALL') params.status = activeTab;
      if (searchKeyword) params.search = searchKeyword;
      if (dateRange) {
        params.startDate = dateRange[0];
        params.endDate = dateRange[1];
      }
      const res = await ApiService.getOrders(params);
      const list = res.data;
      setOrders(prev => reset ? list : [...prev, ...list]);
      setPage(p);
      setHasMore(p < res.totalPages);
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchKeyword, dateRange]);

  useLoad(() => { load(1, true); });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
    setOrders([]);
  };

  const handleDateRangeSelect = () => {
    Taro.showActionSheet({
      itemList: ['最近7天', '最近30天', '最近3个月', '自定义时间'],
      success: (res) => {
        const now = new Date();
        let start: Date;
        let end = now;
        
        switch (res.tapIndex) {
          case 0: // 最近7天
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 1: // 最近30天
            start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 2: // 最近3个月
            start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case 3: // 自定义时间
            // 这里可以扩展为日期选择器
            Taro.showToast({ title: '自定义时间功能开发中', icon: 'none' });
            return;
          default:
            return;
        }
        
        const formatDate = (d: Date) => {
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };
        
        setDateRange([formatDate(start), formatDate(end)]);
      }
    });
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setDateRange(null);
    setPage(1);
    setOrders([]);
  };

  const handleCancelOrder = async (orderId: string) => {
    Taro.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await ApiService.cancelOrder(orderId);
            Taro.showToast({ title: '订单已取消', icon: 'success' });
            load(1, true); // 重新加载订单列表
          } catch (error: any) {
            Taro.showToast({ 
              title: error.message || '取消失败', 
              icon: 'none' 
            });
          }
        }
      }
    });
  };

  const handlePayOrder = async (orderId: string) => {
    try {
      Taro.showLoading({ title: '正在拉起支付...' });
      const paymentParams = await ApiService.continuePayment(orderId);
      Taro.hideLoading();
      
      // 调用微信支付
      Taro.requestPayment({
        timeStamp: paymentParams.timestamp,
        nonceStr: paymentParams.nonceStr,
        package: paymentParams.packageValue,
        signType: paymentParams.signType as any,
        paySign: paymentParams.paySign,
        success: () => {
          Taro.showToast({ title: '支付成功', icon: 'success' });
          load(1, true); // 重新加载订单列表
        },
        fail: (err) => {
          if (err.errMsg.includes('cancel')) {
            Taro.showToast({ title: '支付已取消', icon: 'none' });
          } else {
            Taro.showToast({ title: '支付失败', icon: 'none' });
          }
        }
      });
    } catch (error: any) {
      Taro.hideLoading();
      Taro.showToast({ 
        title: error.message || '拉起支付失败', 
        icon: 'none' 
      });
    }
  };

  const formatDate = (dt: string) => {
    const d = new Date(dt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // 当筛选条件变化时重新加载
  useEffect(() => {
    load(1, true);
  }, [activeTab, searchKeyword, dateRange]);

  return (
    <View className="orders-wrap">
      <Text className="page-title">我的订单</Text>

      {/* 标签页 */}
      <View className="tabs-container">
        {TAB_OPTIONS.map(tab => (
          <View
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? 'tab-active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            <Text className="tab-text">{tab.label}</Text>
            {activeTab === tab.key && <View className="tab-indicator" />}
          </View>
        ))}
      </View>

      {/* 筛选栏 */}
      <View className="filter-bar">
        <View className="search-box">
          <Text className="search-icon">🔍</Text>
          <Input
            className="search-input"
            type="text"
            placeholder="搜索订阅内容"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
            onConfirm={() => load(1, true)}
          />
        </View>
        
        <View className="filter-btn" onClick={handleDateRangeSelect}>
          <Text className="filter-icon">�</Text>
          <Text className="filter-text">
            {dateRange ? '已筛选' : '时间'}
          </Text>
        </View>

        {(searchKeyword || dateRange) && (
          <View className="clear-btn" onClick={clearFilters}>
            <Text className="clear-text">清除</Text>
          </View>
        )}
      </View>

      {/* 筛选提示 */}
      {(searchKeyword || dateRange) && (
        <View className="filter-tips">
          {searchKeyword && (
            <View className="filter-tag">
              <Text className="filter-tag-text">关键词: {searchKeyword}</Text>
              <Text className="filter-tag-close" onClick={() => setSearchKeyword('')}>×</Text>
            </View>
          )}
          {dateRange && (
            <View className="filter-tag">
              <Text className="filter-tag-text">{dateRange[0]} 至 {dateRange[1]}</Text>
              <Text className="filter-tag-close" onClick={() => setDateRange(null)}>×</Text>
            </View>
          )}
        </View>
      )}

      <ScrollView
        scrollY
        className="orders-scroll"
        showScrollbar={false}
        onScrollToLower={() => hasMore && !loading && load(page + 1)}
        style={{ flex: 1 }}
      >
        {loading && orders.length === 0 ? (
          <View className="orders-loading">
            <View className="loading-dots">
              <View className="dot dot1" /><View className="dot dot2" /><View className="dot dot3" />
            </View>
            <Text className="loading-text">加载中…</Text>
          </View>
        ) : orders.length === 0 ? (
          <View className="orders-empty">
            <Text className="empty-icon">📋</Text>
            <Text className="empty-title">暂无订单记录</Text>
            <Text className="empty-sub">完成订阅后，订单将在此显示</Text>
          </View>
        ) : (
          <View className="orders-list">
            {orders.map((o, i) => {
              const st = STATUS_MAP[o.status] || { label: o.status, cls: 'status-pending' };
              return (
                <View key={o.id} className="order-card" style={{ animationDelay: `${i * 50}ms` }}>
                  <View className="order-card-top">
                    <View className="order-type-wrap">
                      <View className="order-type-icon">
                        <Text>{o.type === 'VIP' ? '✦' : '◈'}</Text>
                      </View>
                      <View>
                        <Text className="order-type-label">{TYPE_MAP[o.type] || o.type}</Text>
                        <Text className="order-item-name">{o.item}</Text>
                      </View>
                    </View>
                    <View className={`order-status ${st.cls}`}>
                      <Text className="status-text">{st.label}</Text>
                    </View>
                  </View>

                  <View className="order-divider" />

                  <View className="order-card-bottom">
                    <Text className="order-date">{formatDate(o.createdAt)}</Text>
                    <Text className="order-amount">¥{Number(o.amount).toFixed(2)}</Text>
                  </View>

                  {/* 待支付订单的操作按钮 */}
                  {o.status === 'PENDING' && (
                    <View className="order-actions">
                      <View 
                        className="action-btn cancel-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelOrder(o.id);
                        }}
                      >
                        <Text className="action-btn-text">取消订单</Text>
                      </View>
                      <View 
                        className="action-btn pay-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayOrder(o.id);
                        }}
                      >
                        <Text className="action-btn-text">去支付</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {hasMore ? (
              <View className="load-more" onClick={() => load(page + 1)}>
                <Text className="load-more-text">{loading ? '加载中…' : '加载更多'}</Text>
              </View>
            ) : orders.length > 0 ? (
              <Text className="list-end">— 已显示全部订单 —</Text>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default OrdersPage;
