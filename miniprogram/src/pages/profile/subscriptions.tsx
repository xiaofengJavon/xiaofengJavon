import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useLoad, useDidShow } from '@tarojs/taro';
import { useAppContext } from '../../context/AppContext';
import { SubscriptionTier } from '../../types';
import './index.css';

const MySubscriptions = () => {
  const { user, refreshData, handleSubscribeVIP } = useAppContext();

  useLoad(() => { refreshData(); });
  useDidShow(() => { refreshData(); });

  const handleRenew = (category: string) => {
    const items = ['月度续订 (¥29)', '季度续订 (¥78)', '年度续订 (¥268)'];
    const tiers = [SubscriptionTier.MONTHLY, SubscriptionTier.QUARTERLY, SubscriptionTier.YEARLY];
    Taro.showActionSheet({
        itemList: items,
        success: async (res) => {
            await handleSubscribeVIP(tiers[res.tapIndex], category);
        }
    });
  };

  const subscriptions = user.subscriptions || [];

  return (
    <View className="page-container" style={{ padding: '20px' }}>
      <View className="page-title" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>我的订阅</View>

      {/* VIP Status */}
      {user.isVip && (
        <View style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '15px', borderRadius: '12px', marginBottom: '15px', color: '#fff'
        }}>
          <Text style={{ display: 'block', fontSize: '16px', fontWeight: 'bold' }}>✨ VIP 会员</Text>
          <Text style={{ fontSize: '13px', opacity: 0.85 }}>
            {user.vipExpiry ? `有效期至 ${new Date(user.vipExpiry).toLocaleDateString()}` : '长期有效'}
          </Text>
        </View>
      )}

      {/* Category Subscriptions */}
      <ScrollView scrollY>
        {subscriptions.length > 0 ? (
          subscriptions.map((sub, index) => (
            <View key={index} style={{
              background: '#fff', padding: '15px', borderRadius: '8px',
              marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <View>
                <Text style={{ display: 'block', fontWeight: 'bold', fontSize: '16px' }}>{sub.category}</Text>
                <Text style={{ fontSize: '12px', color: '#666' }}>有效期至: {sub.expiryDate}</Text>
              </View>
              <View
                style={{ color: '#4f46e5', fontSize: '14px', padding: '5px 10px' }}
                onClick={() => handleRenew(sub.category)}
              >
                续费
              </View>
            </View>
          ))
        ) : (
          !user.isVip && (
            <View style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
              <Text>暂无分类订阅</Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
};

export default MySubscriptions;
