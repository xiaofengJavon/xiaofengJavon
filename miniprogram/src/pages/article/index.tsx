import { View, Text, ScrollView, Button, RichText, Canvas } from '@tarojs/components';
import { useState, useRef, useMemo } from 'react';
import Taro, { useRouter, useLoad } from '@tarojs/taro';
import { useAppContext } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { Article, SubscriptionTier } from '../../types';
import AIWindow from '../../components/AIWindow';
import './index.css';

const ArticleDetail = () => {
  const router = useRouter();
  const { id } = router.params;
  const { user, handleSubscribeVIP, categories } = useAppContext();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const aiWindowRef = useRef<any>(null);

  useLoad(async () => {
    if (id) {
      try {
        const data = await ApiService.getArticle(id);
        setArticle(data as unknown as Article);
        // Record view in background
        ApiService.recordView(id).catch(() => {});
      } catch (e) {
        Taro.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        setLoading(false);
      }
    }
  });

  // 使用 useMemo 让这些值响应式地更新（必须在条件渲染之前）
  const isFavorited = useMemo(() => !!(article as any)?.isFavorited, [article]);
  const isLiked = useMemo(() => !!(article as any)?.isLiked, [article]);
  const hasAccess = useMemo(() => !!(article as any)?.hasAccess, [article]);
  const catConfig = useMemo(() => categories.find(c => c.name === article?.category), [categories, article]);
  const themeColor = catConfig ? catConfig.color : '#3b82f6';

  if (loading) return <View className="loading">加载中...</View>;
  if (!article) return <View className="error">文章不存在</View>;

  const handleFavorite = async () => {
    try {
      const res = await ApiService.toggleFavorite(article.id);
      setArticle(prev => prev ? ({ ...prev, isFavorited: res.isFavorited } as any) : null);
      Taro.showToast({ title: res.isFavorited ? '已收藏' : '取消收藏', icon: 'success' });
    } catch (e) {
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const handleLike = async () => {
    const newLiked = !isLiked;
    setArticle(prev => prev ? ({
      ...prev,
      isLiked: newLiked,
      likes: (prev.likes || 0) + (newLiked ? 1 : -1)
    } as any) : null);
    try {
      await ApiService.toggleLike(article.id);
      Taro.showToast({ title: newLiked ? '已点赞' : '已取消', icon: 'none' });
    } catch (e) {
      setArticle(prev => prev ? ({
        ...prev,
        isLiked: !newLiked,
        likes: (prev.likes || 0) - (newLiked ? 1 : -1)
      } as any) : null);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const handleUnlock = async () => {
      // 检查该分类是否为免费分类
      const isFreeCategory = catConfig && (!catConfig.priceMonthly || Number(catConfig.priceMonthly) === 0);
      
      if (isFreeCategory) {
          // 免费分类：直接调用免费订阅接口
          try {
              Taro.showLoading({ title: '订阅中...', mask: true });
              console.log('开始免费订阅:', article.category);
              
              await ApiService.freeSubscribe(article.category);
              console.log('免费订阅接口调用成功');
              
              // 刷新文章数据以更新访问权限
              const updatedArticle = await ApiService.getArticle(article.id);
              console.log('订阅后刷新的文章数据:', updatedArticle);
              console.log('hasAccess 值:', (updatedArticle as any).hasAccess);
              
              setArticle(updatedArticle as unknown as Article);
              
              Taro.hideLoading();
              Taro.showToast({ title: '订阅成功！', icon: 'success' });
          } catch (e: any) {
              Taro.hideLoading();
              console.error('订阅失败:', e);
              console.error('错误详情:', JSON.stringify(e));
              const errorMsg = e?.message || '订阅失败，请重试';
              Taro.showToast({ title: errorMsg, icon: 'none' });
          }
      } else {
          // 付费分类：显示订阅选项
          Taro.showActionSheet({
              itemList: ['月度订阅 (¥29)', '季度订阅 (¥78)', '年度订阅 (¥268)'],
              success: (res) => {
                  const tiers = [SubscriptionTier.MONTHLY, SubscriptionTier.QUARTERLY, SubscriptionTier.YEARLY];
                  handleSubscribeVIP(tiers[res.tapIndex], article.category);
              }
          });
      }
  };

  const handleShare = () => {
      Taro.showActionSheet({
          itemList: ['转发给好友', '生成分享海报'],
          success: (res) => {
              if (res.tapIndex === 0) {
                  // Simulate share
                  Taro.showToast({ title: '请点击右上角转发', icon: 'none' });
              } else {
                  generatePoster();
              }
          }
      });
  };

  const generatePoster = () => {
      Taro.showLoading({ title: '生成中...' });
      const ctx = Taro.createCanvasContext('posterCanvas');
      
      // Draw White Background
      ctx.setFillStyle('#ffffff');
      ctx.fillRect(0, 0, 375, 600);
      
      // Draw Gradient Header
      const grd = ctx.createLinearGradient(0, 0, 0, 200);
      grd.addColorStop(0, themeColor);
      grd.addColorStop(1, '#ffffff');
      ctx.setFillStyle(grd);
      ctx.fillRect(0, 0, 375, 200);
      
      // Draw Title
      ctx.setFillStyle('#000000');
      ctx.setFontSize(24);
      ctx.fillText(article.title.substring(0, 15) + (article.title.length > 15 ? '...' : ''), 20, 100);
      
      // Draw Summary
      ctx.setFontSize(14);
      ctx.setFillStyle('#666666');
      let summary = article.summary || '暂无摘要';
      if(summary.length > 50) summary = summary.substring(0, 50) + '...';
      ctx.fillText(summary, 20, 140);
      
      // Draw Invite Code
      ctx.setFillStyle('#333333');
      ctx.setFontSize(16);
      ctx.fillText(`邀请码: ${user.inviteCode || '暂无'}`, 20, 500);
      
      // Draw Footer
      ctx.setFontSize(12);
      ctx.setFillStyle('#999999');
      ctx.fillText('长按识别二维码阅读全文', 20, 530);
      
      // Draw Placeholder QR Code (Square)
      ctx.setFillStyle('#eee');
      ctx.fillRect(250, 480, 100, 100);
      ctx.setFillStyle('#000');
      ctx.setFontSize(12);
      ctx.fillText('QR Code', 275, 535);

      ctx.draw(false, () => {
          Taro.canvasToTempFilePath({
              canvasId: 'posterCanvas',
              success: (res) => {
                  Taro.hideLoading();
                  Taro.previewImage({ urls: [res.tempFilePath] });
              },
              fail: () => {
                  Taro.hideLoading();
                  Taro.showToast({ title: '生成失败', icon: 'none' });
              }
          });
      });
  };

  return (
    <View className="article-container">
      <ScrollView scrollY className="article-scroll">
        <View className="article-header" style={{ background: `linear-gradient(to bottom, ${themeColor}22, #ffffff)` }}>
           <View className="article-tag" style={{ backgroundColor: themeColor }}>{article.category}</View>
           <View className="article-title">{article.title}</View>
           <View className="article-meta">
             <Text>{new Date(article.date).toLocaleDateString()}</Text>
             <Text style={{marginLeft: '10px'}}>{article.viewCount} 阅读</Text>
             <Text style={{marginLeft: '10px'}}>{article.likes || 0} 点赞</Text>
           </View>
        </View>

        <View className="article-content">
           <View className="summary-box" style={{ borderLeftColor: themeColor }}>
             <Text className="summary-label" style={{ color: themeColor }}>摘要</Text>
             <Text>{article.summary}</Text>
           </View>

           {hasAccess ? (
             <View className="rich-content">
               <RichText nodes={article.content
                 .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')  // 粗体
                 .replace(/<img/g, '<img style="max-width:100%;height:auto;display:block;margin:20rpx 0;border-radius:8rpx;"')  // 图片样式
               } />
             </View>
           ) : (
             <View className="locked-content">
               <View className="blur-text">
                 <Text>这里是{catConfig && (!catConfig.priceMonthly || Number(catConfig.priceMonthly) === 0) ? '订阅' : '付费'}内容，订阅后可见...</Text>
                 <Text>深度解析固态电池技术突破...</Text>
                 <Text>产业链重构...</Text>
               </View>
               <View className="lock-overlay">
                 <View className="lock-icon">🔒</View>
                 <Text className="lock-text">订阅后阅读全文</Text>
                 <Button className="unlock-btn" style={{ background: themeColor }} onClick={handleUnlock}>
                   {catConfig && (!catConfig.priceMonthly || Number(catConfig.priceMonthly) === 0) ? '免费订阅' : '立即解锁'}
                 </Button>
               </View>
             </View>
           )}
        </View>
      </ScrollView>

      {/* Floating AI Window Component */}
      <AIWindow ref={aiWindowRef} />
      
      {/* Floating AI Trigger Button */}
      <View className="ai-float-btn" onClick={() => aiWindowRef.current?.open()}>
          <Text>🤖</Text>
      </View>

      <View className="bottom-bar-new">
         <View className="action-item" onClick={handleShare}>
             <Text className="action-icon">↗️</Text>
             <Text>分享</Text>
         </View>
         <View className="action-item" onClick={handleFavorite}>
             <Text className="action-icon">{isFavorited ? '❤️' : '🤍'}</Text>
             <Text>{isFavorited ? '已收藏' : '收藏'}</Text>
         </View>
         <View className="action-item" onClick={handleLike}>
             <Text className="action-icon" style={{color: isLiked ? '#f59e0b' : '#94a3b8'}}>👍</Text>
             <Text style={{color: isLiked ? '#f59e0b' : 'inherit'}}>{isLiked ? '已点赞' : '点赞'}</Text>
         </View>
      </View>

      {/* Hidden Canvas for Poster */}
      <Canvas canvasId="posterCanvas" className="poster-canvas" />
    </View>
  );
};

export default ArticleDetail;
