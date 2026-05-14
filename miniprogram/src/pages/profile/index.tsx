import { View, Text, Button } from '@tarojs/components';
import Taro, { useLoad, useDidShow } from '@tarojs/taro';
import { useAppContext } from '../../context/AppContext';
import { SUBSCRIPTION_NAMES } from '../../constants';
import { ApiService } from '../../services/api';
import { SubscriptionTier } from '../../types';
import './index.css';

const Profile = () => {
  const { user, refreshData, handleSubscribeVIP, isLoggedIn } = useAppContext();

  const goToLogin = () => Taro.navigateTo({ url: '/pages/login/index' });

  useLoad(() => { refreshData(); });
  useDidShow(() => { refreshData(); });

  const handleRedeem = () => {
    (Taro.showModal as any)({
        title: '兑换邀请码',
        editable: true,
        placeholderText: '请输入好友邀请码',
        success: async (res: any) => {
            if (res.confirm && res.content) {
                try {
                    await ApiService.redeemCode(res.content);
                    Taro.showToast({ title: '兑换成功', icon: 'success' });
                    refreshData();
                } catch (e) {
                    Taro.showToast({ title: '无效的邀请码', icon: 'none' });
                }
            }
        }
    });
  };

  const handleTestPay = async () => {
      Taro.showLoading({ title: '创建订单...' });
      try {
          const params = await ApiService.subscribeTest();
          Taro.hideLoading();
          Taro.showLoading({ title: '支付中...' });
          await new Promise<void>((resolve, reject) => {
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
          Taro.hideLoading();
          Taro.showToast({ title: '测试支付成功！', icon: 'success' });
      } catch (e: any) {
          Taro.hideLoading();
          const msg = e?.errMsg?.includes('cancel') ? '已取消支付' : '支付失败，请重试';
          Taro.showToast({ title: msg, icon: 'none' });
      }
  };

  const handleSubscribe = () => {
      const items = ['月度会员 (¥29)', '季度会员 (¥78)', '年度会员 (¥268)', '🧪 测试支付 (¥0.01)'];
      const tiers = [SubscriptionTier.MONTHLY, SubscriptionTier.QUARTERLY, SubscriptionTier.YEARLY];
      Taro.showActionSheet({
          itemList: items,
          success: async (res) => {
              if (res.tapIndex <= 2) {
                  await handleSubscribeVIP(tiers[res.tapIndex]);
              } else {
                  await handleTestPay();
              }
          }
      });
  };

  return (
    <View className="profile-container">
       <View className="profile-header">
          <View className="header-bg-circle"></View>
          
          {isLoggedIn ? (
            <View className="user-info">
              <View className="avatar">
                {user.avatar
                  ? <View className="avatar-img" style={{ backgroundImage: `url(${user.avatar})` }} />
                  : <Text>{(user.nickname || user.wxOpenid || '?').charAt(0).toUpperCase()}</Text>
                }
              </View>
              <View>
                <Text className="username">{user.nickname || '用户'}</Text>
                <Text className="user-role">{user.isVip ? `尊贵的 ${SUBSCRIPTION_NAMES[user.subscriptionTier]}` : '普通用户'}</Text>
              </View>
            </View>
          ) : (
            <View className="user-info" onClick={goToLogin}>
              <View className="avatar avatar-guest">
                <Text style={{ fontSize: '28px' }}>👤</Text>
              </View>
              <View>
                <Text className="username">点击登录</Text>
                <Text className="user-role">登录后享受完整功能</Text>
              </View>
              <Text style={{ color: '#c7d2fe', marginLeft: 'auto', fontSize: '18px' }}>›</Text>
            </View>
          )}
          
          <View className="vip-card">
             <View className="vip-bg-icon">✨</View>
             <View className="vip-content">
               <View className="vip-text">
                 <Text className="vip-title">
                   {user.isVip ? '会员权益生效中' : '开通创新助理会员'}
                 </Text>
                 <Text className="vip-desc">
                   {user.isVip && user.vipExpiry ? `有效期至 ${new Date(user.vipExpiry).toLocaleDateString()}` : '解锁全部产业情报与政策深度解读'}
                 </Text>
               </View>
               <Button className="vip-btn" onClick={handleSubscribe}>
                 {user.isVip ? '续费会员' : '立即开通'}
               </Button>
             </View>
          </View>

          <View className="action-grid">
            <Button className="action-btn blue" onClick={handleRedeem}>
              <Text>🎟 兑换邀请码</Text>
            </Button>
            <Button className="action-btn red" onClick={() => {
                Taro.showModal({
                    title: '您的专属邀请码',
                    content: user.inviteCode || '暂无邀请码',
                    showCancel: false,
                    confirmText: '复制',
                    success: (res) => {
                        if(res.confirm && user.inviteCode) {
                            Taro.setClipboardData({ data: user.inviteCode });
                        }
                    }
                });
            }}>
              <Text>🎁 邀请好友: {user.inviteCode || '获取中'}</Text>
            </Button>
          </View>
       </View>

       <View className="menu-list">
          <View className="menu-item" onClick={() => Taro.navigateTo({ url: '/pages/profile/subscriptions' })}>
              <View className="menu-left">
                <View className="icon-box green">✓</View>
                <Text>已订阅</Text>
              </View>
              <View className="menu-right">
                 <Text className="menu-info">{user.subscribedCategories?.length || 0} 个订阅</Text>
                 <Text className="arrow">{'>'}</Text>
              </View>
          </View>

          <View className="menu-item" onClick={() => Taro.navigateTo({ url: '/pages/profile/favorites' })}>
              <View className="menu-left">
                <View className="icon-box purple">★</View>
                <Text>我的收藏</Text>
              </View>
              <View className="menu-right">
                 <Text className="menu-info">{user.favoriteCount || 0} 篇</Text>
                 <Text className="arrow">{'>'}</Text>
              </View>
          </View>

          <View className="menu-item" onClick={() => Taro.navigateTo({ url: '/pages/profile/orders/index' })}>
              <View className="menu-left">
                <View className="icon-box orange">◈</View>
                <Text>我的订单</Text>
              </View>
              <View className="menu-right">
                 <Text className="arrow">{'>'}</Text>
              </View>
          </View>

          <View className="menu-item" onClick={() => Taro.navigateTo({ url: '/pages/profile/history/index' })}>
              <View className="menu-left">
                <View className="icon-box teal">◷</View>
                <Text>浏览历史</Text>
              </View>
              <View className="menu-right">
                 <Text className="menu-info">{user.readCount ? `${user.readCount} 篇` : ''}</Text>
                 <Text className="arrow">{'>'}</Text>
              </View>
          </View>

          <View className="menu-item">
              <View className="menu-left">
                <View className="icon-box blue">✦</View>
                <Text>AI 积分</Text>
              </View>
              <View className="menu-right">
                 <Text className="menu-info">{user.credits} 分</Text>
              </View>
          </View>
       </View>
    </View>
  );
};

export default Profile;
