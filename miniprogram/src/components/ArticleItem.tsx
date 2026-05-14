import { View, Text } from '@tarojs/components';
import { Article } from '../types';
import './ArticleItem.css';

interface ArticleItemProps {
  article: Article;
  onClick: () => void;
  isRead: boolean;
  hasAccess: boolean;
  categoryColor?: string;
}

export const ArticleItem: React.FC<ArticleItemProps> = ({ 
  article, 
  onClick, 
  isRead, 
  hasAccess,
  categoryColor
}) => {
  // const gradientClass = getCategoryGradient(article.category, article.type);
  // Using dynamic inline color for leading bar
  
  return (
    <View 
      className={`article-item ${isRead ? 'is-read' : ''}`}
      onClick={onClick}
    >
      <View className="gradient-bar" style={{ background: categoryColor || '#3b82f6' }}></View>
      
      <View className="content">
        <View className="header">
          <View className="tags">
            {article.isSticky && <Text className="tag sticky" style={{backgroundColor: '#ef4444', color: 'white', marginRight: '6px'}}>置顶</Text>}
            <Text 
              className={`tag ${isRead ? 'faded' : ''}`} 
              style={{ color: categoryColor || '#4f46e5', backgroundColor: `${categoryColor}15` }}
            >
              {article.category}
            </Text>
            {hasAccess && (
                <Text className="tag subscribed">已订阅</Text>
            )}
            {!hasAccess && !article.isPremium && (
                <Text className="tag free-subscribe" style={{backgroundColor: '#10b981', color: 'white'}}>免费</Text>
            )}
          </View>
          {article.isPremium && !hasAccess && (
            <View className="vip-badge">
              <Text>VIP</Text>
            </View>
          )}
        </View>
        <View className={`title ${isRead ? 'read-title' : ''}`}>
          {article.title}
        </View>
        <View className={`summary ${isRead ? 'read-summary' : ''}`}>{article.summary}</View>
        <View className="footer">
          <View className="meta">
            <Text>{article.date}</Text>
            <Text className="dot">•</Text>
            <Text>{article.readTime} min</Text>
          </View>
          <View className="stats">
             <Text>{article.viewCount} 阅</Text>
             <Text style={{marginLeft: '10px'}}>{article.favoriteCount} 赞</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
