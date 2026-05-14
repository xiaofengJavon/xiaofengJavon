import { View, Text, Button, ScrollView, Input } from '@tarojs/components';
import { useState, useImperativeHandle, forwardRef } from 'react';
import './AIWindow.css';

interface AIWindowProps {
  initialQuestion?: string;
}

const PRESET_QUESTIONS = [
  "这篇文章的核心观点是什么？",
  "这项技术有哪些商业落地场景？",
  "对相关产业链有何影响？",
  "相比传统方案有何优势？"
];

const ANIM_DURATION = 320;

const AIWindow = forwardRef((_props: AIWindowProps, ref) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([
    { role: 'ai', content: '你好，我是你的专属AI创新助理。关于这篇文章，你有什么想了解的吗？' }
  ]);
  const [inputVal, setInputVal] = useState('');

  const open = () => {
    setIsMounted(true);
    setTimeout(() => setIsVisible(true), 20);
  };

  const close = () => {
    setIsVisible(false);
    setTimeout(() => { setIsMounted(false); setIsFull(false); }, ANIM_DURATION);
  };

  useImperativeHandle(ref, () => ({ open }));

  const toggleFull = () => setIsFull(f => !f);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInputVal('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `针对"${text}"的分析：\n该领域目前正处于快速增长期，技术壁垒主要体现在材料研发与工艺控制方面...`
      }]);
    }, 1000);
  };

  if (!isMounted) return null;

  return (
    <View className={`ai-overlay ${isVisible ? 'overlay-in' : 'overlay-out'}`} onClick={close}>
      <View
        className={`ai-window ${isFull ? 'full' : 'half'} ${isVisible ? 'window-in' : 'window-out'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* drag handle */}
        <View className="drag-handle-wrap">
          <View className="drag-handle" />
        </View>

        <View className="ai-header">
          <View className="ai-header-left">
            <View className="ai-logo-dot" />
            <Text className="ai-title">AI 创新助理</Text>
          </View>
          <View className="ai-controls">
            <View className="control-btn" onClick={toggleFull}>
              <Text className="control-icon">{isFull ? '↓' : '↑'}</Text>
            </View>
            <View className="control-btn control-close" onClick={close}>
              <Text className="control-icon">×</Text>
            </View>
          </View>
        </View>

        <ScrollView scrollY className="ai-chat-area" showScrollbar={false}>
          {messages.map((msg, idx) => (
            <View key={idx} className={`msg-row ${msg.role === 'user' ? 'msg-row-user' : 'msg-row-ai'}`}>
              <View className={`chat-bubble ${msg.role}`}>
                <Text>{msg.content}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View className="ai-presets">
          <ScrollView scrollX className="presets-scroll" showScrollbar={false}>
            <View className="presets-row">
              {PRESET_QUESTIONS.map((q, i) => (
                <View key={i} className="preset-chip" onClick={() => sendMessage(q)}>
                  <Text>{q}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="ai-input-area">
          <Input
            className="ai-input"
            placeholder="输入你的问题…"
            value={inputVal}
            onInput={e => setInputVal(e.detail.value)}
            onConfirm={() => sendMessage(inputVal)}
          />
          <Button className="send-btn" onClick={() => sendMessage(inputVal)}>发送</Button>
        </View>
      </View>
    </View>
  );
});

export default AIWindow;
