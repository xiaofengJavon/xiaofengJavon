import { View, Text, Input, Button, ScrollView } from '@tarojs/components';
import { useState, useRef } from 'react';
import { ChatMessage } from '../../types';
import { ApiService } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import './index.css';

const AIAssistant = () => {
  const { user, refreshData } = useAppContext();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null);
  const sessionIdRef = useRef<string | undefined>(undefined);

  const commonQuestions = [
    "最近的新能源政策有哪些？",
    "数字经济的发展趋势是什么？",
    "如何解读最新的智能制造标准？",
    "生物医药行业的投资热点在哪里？"
  ];

  const handleSend = async (text: string = input) => {
    if (!text.trim() || loading) return;
    if (user.credits <= 0) {
      import('@tarojs/taro').then(({ default: Taro }) =>
        Taro.showToast({ title: '积分不足，无法使用AI助手', icon: 'none' })
      );
      return;
    }
    const userMsg: ChatMessage = { role: 'user', text };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await ApiService.aiChat(text, sessionIdRef.current);
      sessionIdRef.current = res.sessionId;
      setCreditsLeft(res.creditsRemaining);
      setHistory(prev => [...prev, { role: 'model', text: res.reply || '抱歉，我需要思考一下。' }]);
      // Refresh user to sync credits
      refreshData();
    } catch (e: any) {
      const errMsg = e?.message === 'UNAUTHORIZED'
        ? '请先登录后使用AI助手'
        : '连接失败，请检查网络。';
      setHistory(prev => [...prev, { role: 'model', text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="ai-container">
      <View className="ai-header">
        <View className="ai-logo">🤖</View>
        <Text className="ai-title">AI 助手</Text>
        <Text className="ai-credits">
          积分: {creditsLeft !== null ? creditsLeft : user.credits}
        </Text>
      </View>

      <ScrollView scrollY className="chat-scroll">
        {history.length === 0 ? (
          <View className="welcome-box">
            <View className="welcome-icon">✨</View>
            <Text className="welcome-title">你好，我是您的创新助理</Text>
            <Text className="welcome-desc">我可以为您解答产业趋势、政策细节或生成行业简报。</Text>
            
            <View className="common-questions">
              <Text className="questions-label">常用提问</Text>
              {commonQuestions.map((q, i) => (
                <View 
                  key={i} 
                  className="question-btn"
                  onClick={() => handleSend(q)}
                >
                  <Text>{q}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="message-list">
             {history.map((msg, idx) => (
               <View key={idx} className={`message-row ${msg.role === 'user' ? 'message-user' : 'message-model'}`}>
                 <View className={`message-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-model'}`}>
                   <Text>{msg.text}</Text>
                 </View>
               </View>
             ))}
             {loading && (
                <View className="message-row message-model">
                 <View className="message-bubble bubble-model">
                   <Text>...</Text>
                 </View>
               </View>
             )}
          </View>
        )}
      </ScrollView>

      <View className="input-area">
         <Input 
            className="chat-input"
            value={input}
            onInput={(e) => setInput(e.detail.value)}
            onConfirm={() => handleSend()}
            placeholder="输入您的问题..." 
         />
         <Button 
            className="send-btn"
            onClick={() => handleSend()}
            disabled={loading}
          >
           发送
         </Button>
      </View>
    </View>
  );
};

export default AIAssistant;
