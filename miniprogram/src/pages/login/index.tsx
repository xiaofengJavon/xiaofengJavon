import { View, Text, Button, Image, Input } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { ApiService, getToken } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import './index.css';

const Login = () => {
  const { login, isLoggedIn } = useAppContext();
  const [step, setStep] = useState<'profile' | 'phone' | 'done'>('profile');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Ensure WeChat login completes before this page is used
  useEffect(() => {
    if (!getToken() && !isLoggedIn) {
      login().then(ok => {
        if (!ok) Taro.showToast({ title: '微信登录失败，请重试', icon: 'none' });
      });
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // WeChat avatar picker callback
  const onChooseAvatar = (e: any) => {
    const avatarUrl = e.detail?.avatarUrl;
    if (avatarUrl) setAvatar(avatarUrl);
  };

  // Submit profile (nickname + avatar)
  const handleSubmitProfile = async () => {
    if (!nickname.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      // Ensure token exists before calling API
      if (!getToken()) {
        const ok = await login();
        if (!ok) {
          Taro.showToast({ title: '登录失败，请重试', icon: 'none' });
          return;
        }
      }
      
      // Upload avatar to server if user selected one
      let serverAvatarUrl = '';
      if (avatar) {
        Taro.showLoading({ title: '上传头像中...' });
        try {
          serverAvatarUrl = await ApiService.uploadAvatar(avatar);
          Taro.hideLoading();
        } catch (uploadError) {
          Taro.hideLoading();
          Taro.showToast({ title: '头像上传失败，请重试', icon: 'none' });
          setSubmitting(false);
          return;
        }
      }
      
      await ApiService.updateProfile(nickname.trim(), serverAvatarUrl);
      setStep('phone');
    } catch (e) {
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  // WeChat phone number authorization callback
  const onGetPhoneNumber = async (e: any) => {
    // e.detail.code for new API (WeChat >= 2.21.2)
    const code = e.detail?.code;
    if (!code) {
      Taro.showToast({ title: '已拒绝手机号授权', icon: 'none' });
      goToMain();
      return;
    }
    setSubmitting(true);
    try {
      if (!getToken()) { await login(); }
      await ApiService.updatePhone(code);
      Taro.showToast({ title: '绑定成功', icon: 'success' });
    } catch (e) {
      Taro.showToast({ title: '绑定失败，可稍后在设置中绑定', icon: 'none' });
    } finally {
      setSubmitting(false);
      goToMain();
    }
  };

  const skipPhone = () => {
    goToMain();
  };

  const goToMain = () => {
    Taro.switchTab({ url: '/pages/index/index' });
  };

  return (
    <View className="login-page">
      {/* Logo区域 */}
      <View className="login-hero">
        <View className="login-logo">🔬</View>
        <Text className="login-app-name">创新情报</Text>
        <Text className="login-app-desc">专业产业情报 · AI深度解析</Text>
      </View>

      {step === 'profile' && (
        <View className="login-card">
          <Text className="card-title">完善你的资料</Text>
          <Text className="card-desc">请设置头像和昵称，让你的创新之旅更个性化</Text>

          {/* 微信头像选择按钮 */}
          <View className="avatar-section">
            <Button
              className="avatar-btn"
              openType="chooseAvatar"
              onChooseAvatar={onChooseAvatar}
            >
              {avatar
                ? <Image src={avatar} className="avatar-preview" />
                : <View className="avatar-placeholder"><Text>点击选择</Text><Text className="avatar-icon">📷</Text></View>
              }
            </Button>
            <Text className="avatar-hint">点击选择微信头像</Text>
          </View>

          {/* 微信昵称输入 */}
          <View className="input-group">
            <Text className="input-label">昵称</Text>
            <Input
              className="nickname-input"
              type="nickname"
              placeholder="点击填写微信昵称"
              value={nickname}
              onInput={e => setNickname(e.detail.value)}
            />
          </View>

          <Button
            className="primary-btn"
            loading={submitting}
            disabled={submitting}
            onClick={handleSubmitProfile}
          >
            下一步
          </Button>
        </View>
      )}

      {step === 'phone' && (
        <View className="login-card">
          <Text className="card-title">绑定手机号</Text>
          <Text className="card-desc">绑定手机号后可以找回账号，接收重要通知</Text>

          <View className="phone-icon-area">
            <Text className="phone-big-icon">📱</Text>
          </View>

          {/* 获取手机号按钮（微信原生授权） */}
          <Button
            className="primary-btn wechat-btn"
            openType="getPhoneNumber"
            onGetPhoneNumber={onGetPhoneNumber}
            loading={submitting}
            disabled={submitting}
          >
            <Text>微信一键绑定手机号</Text>
          </Button>

          <View className="skip-btn" onClick={skipPhone}>
            <Text className="skip-text">暂不绑定，直接进入</Text>
          </View>

          <Text className="privacy-hint">
            你的手机号仅用于账号安全，不会对外展示
          </Text>
        </View>
      )}
    </View>
  );
};

export default Login;
