export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/ai/index',
    'pages/subscribe/index',
    'pages/profile/index',
    'pages/article/index',
    'pages/profile/subscriptions',
    'pages/profile/favorites',
    'pages/profile/orders/index',
    'pages/profile/history/index',
    'pages/login/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#4f46e5',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/home.png',
        selectedIconPath: 'assets/home-active.png'
      },
      {
        pagePath: 'pages/ai/index',
        text: 'AI 助手',
        iconPath: 'assets/ai.png',
        selectedIconPath: 'assets/ai-active.png'
      },
      {
        pagePath: 'pages/subscribe/index',
        text: '订阅',
        iconPath: 'assets/subscribe.png',
        selectedIconPath: 'assets/subscribe-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/user.png',
        selectedIconPath: 'assets/user-active.png'
      }
    ]
  }
})
