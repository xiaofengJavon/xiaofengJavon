# Implementation Tasks

## Overview

本文档定义了全栈订阅平台系统的实现任务列表。任务按照依赖关系和优先级组织，采用增量开发方式，确保每个阶段都能交付可工作的功能。

---

## Phase 1: 项目基础设施搭建

### Task 1.1: 初始化Java后端项目
**Priority**: P0  
**Estimated Time**: 2 hours  
**Dependencies**: None

**Description**:
创建Spring Boot项目骨架，配置基础依赖和项目结构。

**Sub-tasks**:
1. 使用Spring Initializr创建Maven项目
2. 配置pom.xml依赖：
   - Spring Boot 3.2.x
   - Spring Data JPA
   - Spring Security
   - MySQL Connector
   - Redis
   - Lombok
   - Swagger/OpenAPI
3. 创建项目目录结构（controller, service, repository, entity, dto, config）
4. 配置application.yml（dev和prod环境）
5. 创建Application主类
6. 验证项目可以启动

**Acceptance Criteria**:
- [ ] 项目可以成功编译
- [ ] 应用可以启动并监听8080端口
- [ ] 访问 /actuator/health 返回 UP 状态

---

### Task 1.2: 配置数据库连接
**Priority**: P0  
**Estimated Time**: 1 hour  
**Dependencies**: Task 1.1

**Description**:
配置MySQL数据库连接和JPA设置。

**Sub-tasks**:
1. 配置HikariCP连接池参数
2. 配置JPA/Hibernate属性
3. 创建数据库连接测试
4. 配置数据库迁移工具（Flyway或Liquibase）

**Acceptance Criteria**:
- [ ] 应用可以成功连接到MySQL数据库
- [ ] JPA可以正常工作
- [ ] 连接池配置正确

---

### Task 1.3: 配置Redis缓存
**Priority**: P0  
**Estimated Time**: 1 hour  
**Dependencies**: Task 1.1

**Description**:
配置Redis连接和缓存策略。

**Sub-tasks**:
1. 添加Spring Data Redis依赖
2. 配置RedisTemplate和CacheManager
3. 配置缓存序列化器
4. 创建Redis连接测试

**Acceptance Criteria**:
- [ ] 应用可以成功连接到Redis
- [ ] 缓存注解可以正常工作
- [ ] 可以存储和读取缓存数据

---

### Task 1.4: 配置安全和JWT
**Priority**: P0  
**Estimated Time**: 3 hours  
**Dependencies**: Task 1.1

**Description**:
配置Spring Security和JWT认证机制。

**Sub-tasks**:
1. 创建SecurityConfig配置类
2. 实现JwtTokenProvider工具类
3. 实现JwtAuthenticationFilter过滤器
4. 配置CORS策略
5. 配置公开和受保护的端点

**Acceptance Criteria**:
- [ ] JWT token可以正常生成和验证
- [ ] 受保护的端点需要认证
- [ ] 公开端点可以直接访问
- [ ] CORS配置正确

---

### Task 1.5: 初始化Taro小程序项目
**Priority**: P0  
**Estimated Time**: 2 hours  
**Dependencies**: None

**Description**:
创建Taro小程序项目骨架。

**Sub-tasks**:
1. 使用Taro CLI创建项目
2. 配置TypeScript
3. 配置项目结构（pages, components, services, store, utils）
4. 配置app.config.ts（页面路由和tabBar）
5. 配置开发和生产环境变量
6. 创建基础布局组件

**Acceptance Criteria**:
- [ ] 项目可以成功编译
- [ ] 可以在微信开发者工具中预览
- [ ] TabBar显示正常

---

### Task 1.6: 初始化React后台管理项目
**Priority**: P1  
**Estimated Time**: 2 hours  
**Dependencies**: None

**Description**:
创建React后台管理系统项目。

**Sub-tasks**:
1. 使用Create React App + TypeScript创建项目
2. 安装Ant Design依赖
3. 配置项目结构（pages, components, services, store）
4. 配置React Router
5. 配置Redux Toolkit
6. 创建基础布局（Sidebar + Header）

**Acceptance Criteria**:
- [ ] 项目可以成功编译和运行
- [ ] 路由配置正常
- [ ] Ant Design组件可以正常使用
- [ ] 基础布局显示正常

---

## Phase 2: 核心实体和数据访问层

### Task 2.1: 创建User实体和Repository
**Priority**: P0  
**Estimated Time**: 2 hours  
**Dependencies**: Task 1.2

**Description**:
创建用户实体类和数据访问层。

**Sub-tasks**:
1. 创建User实体类（@Entity注解）
2. 配置字段映射和关系
3. 创建UserRepository接口
4. 添加自定义查询方法
5. 编写单元测试

**Acceptance Criteria**:
- [ ] User实体可以正确映射到数据库表
- [ ] Repository的CRUD操作正常
- [ ] 自定义查询方法工作正常
- [ ] 单元测试通过

---

### Task 2.2: 创建Article实体和Repository
**Priority**: P0  
**Estimated Time**: 2 hours  
**Dependencies**: Task 1.2

**Description**:
创建文章实体类和数据访问层。

**Sub-tasks**:
1. 创建Article实体类
2. 配置字段映射和索引
3. 创建ArticleRepository接口
4. 添加分页查询方法
5. 添加全文搜索方法
6. 编写单元测试

**Acceptance Criteria**:
- [ ] Article实体可以正确映射到数据库表
- [ ] 分页查询正常工作
- [ ] 搜索功能正常
- [ ] 单元测试通过

---

### Task 2.3: 创建Subscription实体和Repository
**Priority**: P0  
**Estimated Time**: 1.5 hours  
**Dependencies**: Task 1.2, Task 2.1

**Description**:
创建订阅实体类和数据访问层。

**Sub-tasks**:
1. 创建Subscription实体类
2. 配置与User的关系
3. 创建SubscriptionRepository接口
4. 添加查询活跃订阅的方法
5. 编写单元测试

**Acceptance Criteria**:
- [ ] Subscription实体映射正确
- [ ] 与User的关系配置正确
- [ ] 查询方法工作正常
- [ ] 单元测试通过

---

### Task 2.4: 创建Order实体和Repository
**Priority**: P0  
**Estimated Time**: 1.5 hours  
**Dependencies**: Task 1.2, Task 2.1

**Description**:
创建订单实体类和数据访问层。

**Sub-tasks**:
1. 创建Order实体类
2. 配置与User的关系
3. 创建OrderRepository接口
4. 添加按状态和日期查询的方法
5. 编写单元测试

**Acceptance Criteria**:
- [ ] Order实体映射正确
- [ ] 查询方法工作正常
- [ ] 单元测试通过

---

### Task 2.5: 创建其他实体和Repository
**Priority**: P1  
**Estimated Time**: 3 hours  
**Dependencies**: Task 1.2, Task 2.1, Task 2.2

**Description**:
创建剩余的实体类和数据访问层。

**Sub-tasks**:
1. 创建CategoryConfig实体和Repository
2. 创建GlobalSettings实体和Repository
3. 创建Referral实体和Repository
4. 创建ReadArticle实体和Repository
5. 创建Favorite实体和Repository
6. 创建UnlockedArticle实体和Repository
7. 编写单元测试

**Acceptance Criteria**:
- [ ] 所有实体映射正确
- [ ] Repository方法工作正常
- [ ] 单元测试通过

---

## Phase 3: 业务逻辑层（Service）

### Task 3.1: 实现AuthService
**Priority**: P0  
**Estimated Time**: 4 hours  
**Dependencies**: Task 2.1, Task 1.4

**Description**:
实现用户认证服务，包括微信登录和JWT token管理。

**Sub-tasks**:
1. 实现微信OAuth登录逻辑
2. 实现JWT token生成
3. 实现JWT token验证
4. 实现用户注册逻辑（自动创建用户）
5. 实现邀请码生成
6. 编写单元测试

**Acceptance Criteria**:
- [ ] 微信登录流程正常
- [ ] JWT token可以正确生成和验证
- [ ] 新用户自动创建
- [ ] 邀请码唯一性保证
- [ ] 单元测试通过

---

### Task 3.2: 实现UserService
**Priority**: P0  
**Estimated Time**: 3 hours  
**Dependencies**: Task 2.1, Task 2.3

**Description**:
实现用户管理服务。

**Sub-tasks**:
1. 实现获取用户信息
2. 实现更新用户信息
3. 实现积分管理（增加/扣除）
4. 实现VIP状态管理
5. 实现订阅过期检查
6. 编写单元测试

**Acceptance Criteria**:
- [ ] 用户信息CRUD正常
- [ ] 积分操作正确
- [ ] VIP状态更新正确
- [ ] 订阅过期检查正常
- [ ] 单元测试通过

---

### Task 3.3: 实现ArticleService
**Priority**: P0  
**Estimated Time**: 4 hours  
**Dependencies**: Task 2.2, Task 1.3

**Description**:
实现文章管理服务。

**Sub-tasks**:
1. 实现文章列表查询（分页、筛选、搜索）
2. 实现文章详情查询
3. 实现文章创建
4. 实现文章更新
5. 实现文章删除
6. 实现批量操作
7. 实现访问权限检查
8. 实现浏览计数
9. 配置Redis缓存
10. 编写单元测试

**Acceptance Criteria**:
- [ ] 文章CRUD操作正常
- [ ] 分页和搜索功能正常
- [ ] 访问权限检查正确
- [ ] 缓存策略有效
- [ ] 单元测试通过

---

### Task 3.4: 实现SubscriptionService
**Priority**: P0  
**Estimated Time**: 3 hours  
**Dependencies**: Task 2.3, Task 2.1

**Description**:
实现订阅管理服务。

**Sub-tasks**:
1. 实现创建/更新订阅
2. 实现订阅到期日期计算
3. 实现订阅续期逻辑
4. 实现订阅状态检查
5. 实现订阅列表查询
6. 编写单元测试

**Acceptance Criteria**:
- [ ] 订阅创建和更新正常
- [ ] 到期日期计算正确
- [ ] 续期逻辑正确
- [ ] 单元测试通过

---

### Task 3.5: 实现PaymentService
**Priority**: P0  
**Estimated Time**: 5 hours  
**Dependencies**: Task 2.4, Task 3.4

**Description**:
实现支付服务，集成微信支付。

**Sub-tasks**:
1. 集成微信支付SDK
2. 实现创建支付订单
3. 实现生成支付签名
4. 实现支付回调处理
5. 实现支付签名验证
6. 实现订单状态更新
7. 实现订阅激活逻辑
8. 编写单元测试

**Acceptance Criteria**:
- [ ] 可以创建微信支付订单
- [ ] 支付签名生成正确
- [ ] 支付回调处理正常
- [ ] 订阅自动激活
- [ ] 单元测试通过

---

### Task 3.6: 实现CategoryService
**Priority**: P1  
**Estimated Time**: 2 hours  
**Dependencies**: Task 2.5

**Description**:
实现分类管理服务。

**Sub-tasks**:
1. 实现分类CRUD操作
2. 实现分类排序
3. 实现分类订阅统计
4. 配置缓存
5. 编写单元测试

**Acceptance Criteria**:
- [ ] 分类CRUD正常
- [ ] 排序功能正常
- [ ] 统计数据准确
- [ ] 单元测试通过

---

### Task 3.7: 实现AIService
**Priority**: P1  
**Estimated Time**: 4 hours  
**Dependencies**: Task 3.2

**Description**:
实现AI助手服务，集成Google Gemini API。

**Sub-tasks**:
1. 集成Google Gemini API
2. 实现对话接口
3. 实现积分扣除逻辑
4. 实现错误处理和积分退还
5. 实现会话管理
6. 编写单元测试

**Acceptance Criteria**:
- [ ] 可以调用Gemini API
- [ ] 对话功能正常
- [ ] 积分扣除和退还正确
- [ ] 错误处理完善
- [ ] 单元测试通过

---

### Task 3.8: 实现FileStorageService
**Priority**: P1  
**Estimated Time**: 2 hours  
**Dependencies**: Task 1.1

**Description**:
实现文件上传和存储服务。

**Sub-tasks**:
1. 配置文件上传参数
2. 实现文件保存逻辑
3. 实现文件名生成（防冲突）
4. 实现文件类型验证
5. 实现文件大小验证
6. 编写单元测试

**Acceptance Criteria**:
- [ ] 文件可以成功上传
- [ ] 文件名唯一
- [ ] 文件验证正常
- [ ] 返回正确的文件URL
- [ ] 单元测试通过

---

## Phase 4: API控制器层

### Task 4.1: 实现AuthController
**Priority**: P0  
**Estimated Time**: 2 hours  
**Dependencies**: Task 3.1

**Description**:
实现认证相关的API端点。

**Sub-tasks**:
1. 实现POST /api/v1/auth/wechat-login
2. 实现POST /api/v1/auth/refresh-token
3. 添加请求验证
4. 添加错误处理
5. 编写集成测试

**Acceptance Criteria**:
- [ ] 登录接口正常工作
- [ ] Token刷新正常
- [ ] 错误处理完善
- [ ] 集成测试通过

---

### Task 4.2: 实现UserController
**Priority**: P0  
**Estimated Time**: 2 hours  
**Dependencies**: Task 3.2

**Description**:
实现用户相关的API端点。

**Sub-tasks**:
1. 实现GET /api/v1/user/profile
2. 实现PUT /api/v1/user/profile
3. 实现POST /api/v1/user/redeem-code
4. 添加认证拦截
5. 编写集成测试

**Acceptance Criteria**:
- [ ] 用户信息查询正常
- [ ] 用户信息更新正常
- [ ] 兑换码功能正常
- [ ] 需要认证才能访问
- [ ] 集成测试通过

---

### Task 4.3: 实现ArticleController
**Priority**: P0  
**Estimated Time**: 3 hours  
**Dependencies**: Task 3.3

**Description**:
实现文章相关的API端点。

**Sub-tasks**:
1. 实现GET /api/v1/articles（列表查询）
2. 实现GET /api/v1/articles/:id（详情查询）
3. 实现POST /api/v1/articles（创建，需要管理员权限）
4. 实现PUT /api/v1/articles/:id（更新，需要管理员权限）
5. 实现DELETE /api/v1/articles/:id（删除，需要管理员权限）
6. 实现批量操作接口
7. 添加权限控制
8. 编写集成测试

**Acceptance Criteria**:
- [ ] 所有接口正常工作
- [ ] 分页和筛选正常
- [ ] 权限控制正确
- [ ] 集成测试通过

---

### Task 4.4: 实现SubscriptionController
**Priority**: P0  
**Estimated Time**: 2 hours  
**Dependencies**: Task 3.4

**Description**:
实现订阅相关的API端点。

**Sub-tasks**:
1. 实现GET /api/v1/subscriptions
2. 实现POST /api/v1/subscriptions/vip
3. 实现POST /api/v1/subscriptions/category
4. 添加认证拦截
5. 编写集成测试

**Acceptance Criteria**:
- [ ] 订阅查询正常
- [ ] VIP订阅接口正常
- [ ] 分类订阅接口正常
- [ ] 集成测试通过

---

### Task 4.5: 实现PaymentController
**Priority**: P0  
**Estimated Time**: 3 hours  
**Dependencies**: Task 3.5

**Description**:
实现支付相关的API端点。

**Sub-tasks**:
1. 实现POST /api/v1/payment/create-order
2. 实现POST /api/v1/payment/callback（微信回调）
3. 实现GET /api/v1/payment/query/:orderId
4. 添加签名验证
5. 编写集成测试

**Acceptance Criteria**:
- [ ] 创建订单接口正常
- [ ] 支付回调处理正常
- [ ] 订单查询正常
- [ ] 签名验证正确
- [ ] 集成测试通过

---

### Task 4.6: 实现CategoryController
**Priority**: P1  
**Estimated Time**: 2 hours  
**Dependencies**: Task 3.6

**Description**:
实现分类管理的API端点。

**Sub-tasks**:
1. 实现GET /api/v1/categories
2. 实现POST /api/v1/categories（管理员）
3. 实现PUT /api/v1/categories/:id（管理员）
4. 实现DELETE /api/v1/categories/:id（管理员）
5. 实现POST /api/v1/categories/reorder（管理员）
6. 编写集成测试

**Acceptance Criteria**:
- [ ] 所有接口正常工作
- [ ] 权限控制正确
- [ ] 集成测试通过

---

### Task 4.7: 实现AIAssistantController
**Priority**: P1  
**Estimated Time**: 2 hours  
**Dependencies**: Task 3.7

**Description**:
实现AI助手的API端点。

**Sub-tasks**:
1. 实现POST /api/v1/ai/chat
2. 实现GET /api/v1/ai/history/:sessionId
3. 添加积分检查
4. 编写集成测试

**Acceptance Criteria**:
- [ ] 对话接口正常
- [ ] 历史记录查询正常
- [ ] 积分检查正确
- [ ] 集成测试通过

---

### Task 4.8: 实现AdminController
**Priority**: P1  
**Estimated Time**: 3 hours  
**Dependencies**: Task 3.2, Task 3.6

**Description**:
实现后台管理的API端点。

**Sub-tasks**:
1. 实现GET /api/v1/admin/dashboard
2. 实现GET /api/v1/admin/users
3. 实现PUT /api/v1/admin/users/:id
4. 实现GET /api/v1/admin/settings
5. 实现PUT /api/v1/admin/settings
6. 实现GET /api/v1/admin/marketing
7. 实现PUT /api/v1/admin/marketing
8. 添加管理员权限控制
9. 编写集成测试

**Acceptance Criteria**:
- [ ] 所有接口正常工作
- [ ] 只有管理员可以访问
- [ ] 集成测试通过

---

### Task 4.9: 实现FileUploadController
**Priority**: P1  
**Estimated Time**: 1 hour  
**Dependencies**: Task 3.8

**Description**:
实现文件上传的API端点。

**Sub-tasks**:
1. 实现POST /api/v1/upload
2. 配置multipart处理
3. 添加文件验证
4. 编写集成测试

**Acceptance Criteria**:
- [ ] 文件上传接口正常
- [ ] 返回正确的文件URL
- [ ] 文件验证正常
- [ ] 集成测试通过

---

## Phase 5: 小程序前端开发

### Task 5.1: 实现API Service层
**Priority**: P0  
**Estimated Time**: 3 hours  
**Dependencies**: Task 1.5

**Description**:
实现小程序的API调用封装。

**Sub-tasks**:
1. 创建request工具类
2. 实现token管理
3. 实现错误处理
4. 创建各个模块的API service
   - AuthService
   - UserService
   - ArticleService
   - SubscriptionService
   - PaymentService
   - AIService

**Acceptance Criteria**:
- [ ] API调用封装完整
- [ ] Token自动添加到请求头
- [ ] 错误处理完善
- [ ] 401自动跳转登录

---

### Task 5.2: 实现用户认证和状态管理
**Priority**: P0  
**Estimated Time**: 3 hours  
**Dependencies**: Task 5.1, Task 4.1

**Description**:
实现用户登录和全局状态管理。

**Sub-tasks**:
1. 创建UserContext
2. 实现微信登录逻辑
3. 实现token存储
4. 实现用户信息获取
5. 实现登录状态检查

**Acceptance Criteria**:
- [ ] 用户可以通过微信登录
- [ ] 用户信息全局可访问
- [ ] Token持久化存储
- [ ] 登录状态检查正常

---

### Task 5.3: 实现首页（文章列表）
**Priority**: P0  
**Estimated Time**: 4 hours  
**Dependencies**: Task 5.2, Task 4.3

**Description**:
实现小程序首页，展示文章列表。

**Sub-tasks**:
1. 创建ArticleCard组件
2. 实现文章列表页面
3. 实现下拉刷新
4. 实现上拉加载更多
5. 实现分类筛选
6. 实现搜索功能
7. 实现付费标识显示

**Acceptance Criteria**:
- [ ] 文章列表正常显示
- [ ] 分页加载正常
- [ ] 筛选和搜索功能正常
- [ ] 付费文章有明显标识
- [ ] UI美观流畅

---

### Task 5.4: 实现文章详情页
**Priority**: P0  
**Estimated Time**: 4 hours  
**Dependencies**: Task 5.3, Task 4.3

**Description**:
实现文章详情页面，包括访问控制。

**Sub-tasks**:
1. 创建文章详情页面
2. 实现富文本内容渲染
3. 实现访问权限检查
4. 实现付费墙（Paywall）
5. 实现收藏功能
6. 实现点赞功能
7. 实现分享解锁功能
8. 实现TTS功能（可选）

**Acceptance Criteria**:
- [ ] 文章内容正常显示
- [ ] 付费文章显示付费墙
- [ ] VIP用户可以访问所有内容
- [ ] 收藏和点赞功能正常
- [ ] 分享解锁功能正常

---

### Task 5.5: 实现订阅页面
**Priority**: P0  
**Estimated Time**: 4 hours  
**Dependencies**: Task 5.2, Task 4.4, Task 4.5

**Description**:
实现VIP和分类订阅页面。

**Sub-tasks**:
1. 创建VIP订阅页面
2. 创建分类订阅页面
3. 实现订阅选项展示
4. 实现支付流程
5. 实现支付结果处理
6. 创建PaymentModal组件

**Acceptance Criteria**:
- [ ] 订阅选项清晰展示
- [ ] 支付流程顺畅
- [ ] 支付成功后订阅立即生效
- [ ] 支付失败有明确提示

---

### Task 5.6: 实现个人中心页面
**Priority**: P0  
**Estimated Time**: 3 hours  
**Dependencies**: Task 5.2, Task 4.2

**Description**:
实现用户个人中心页面。

**Sub-tasks**:
1. 创建个人中心主页
2. 显示用户信息（VIP状态、积分、邀请码）
3. 实现我的订阅页面
4. 实现我的收藏页面
5. 实现邀请码分享功能
6. 实现兑换码功能

**Acceptance Criteria**:
- [ ] 用户信息正确显示
- [ ] 订阅列表正常
- [ ] 收藏列表正常
- [ ] 邀请码可以分享
- [ ] 兑换码功能正常

---

### Task 5.7: 实现AI助手页面
**Priority**: P1  
**Estimated Time**: 4 hours  
**Dependencies**: Task 5.2, Task 4.7

**Description**:
实现AI助手对话页面。

**Sub-tasks**:
1. 创建聊天界面
2. 实现消息发送
3. 实现消息接收和显示
4. 实现积分检查
5. 实现会话历史
6. 实现输入框和发送按钮

**Acceptance Criteria**:
- [ ] 聊天界面友好
- [ ] 消息发送和接收正常
- [ ] 积分不足时有提示
- [ ] 会话历史可以查看

---

### Task 5.8: 小程序UI优化和测试
**Priority**: P1  
**Estimated Time**: 3 hours  
**Dependencies**: Task 5.3, Task 5.4, Task 5.5, Task 5.6, Task 5.7

**Description**:
优化小程序UI和用户体验。

**Sub-tasks**:
1. 统一UI风格和颜色
2. 优化加载状态显示
3. 优化错误提示
4. 添加骨架屏
5. 优化图片加载
6. 进行真机测试
7. 修复发现的bug

**Acceptance Criteria**:
- [ ] UI风格统一美观
- [ ] 加载状态清晰
- [ ] 错误提示友好
- [ ] 真机运行流畅
- [ ] 无明显bug

---

## Phase 6: 后台管理系统开发

### Task 6.1: 实现登录和路由守卫
**Priority**: P1  
**Estimated Time**: 2 hours  
**Dependencies**: Task 1.6, Task 4.1

**Description**:
实现管理员登录和路由权限控制。

**Sub-tasks**:
1. 创建登录页面
2. 实现登录逻辑
3. 实现token存储
4. 实现路由守卫
5. 实现自动跳转

**Acceptance Criteria**:
- [ ] 管理员可以登录
- [ ] 未登录自动跳转登录页
- [ ] Token持久化存储
- [ ] 路由守卫正常工作

---

### Task 6.2: 实现Dashboard页面
首页Dashboard。

**Sub-tasks**:
1. 创建Dashboard页面布局
2. 实现关键指标卡片（用户数、文章数、订单数、收入）
3. 实现图表展示（用户增长、订阅分布）
4. 实现数据刷新
5. 对接后端API

**Acceptance Criteria**:
- [ ] Dashboard页面布局美观
- [ ] 关键指标正确显示
- [ ] 图表数据准确
- [ ] 数据可以刷新

---

### Task 6.3: 实现文章管理页面
**Priority**: P1  
**Estimated Time**: 5 hours  
**Dependencies**: Task 6.1, Task 4.3

**Description**:
实现文章的增删改查管理页面。

**Sub-tasks**:
1. 创建文章列表页面
2. 实现DataTable组件
3. 实现文章搜索和筛选
4. 创建文章编辑器页面
5. 集成富文本编辑器（React Quill）
6. 实现文章创建
7. 实现文章编辑
8. 实现文章删除
9. 实现批量操作（删除、分类、置顶）

**Acceptance Criteria**:
- [ ] 文章列表正常显示
- [ ] 搜索和筛选功能正常
- [ ] 富文本编辑器功能完整
- [ ] CRUD操作正常
- [ ] 批量操作正常

---

### Task 6.4: 实现用户管理页面
**Priority**: P1  
**Estimated Time**: 3 hours  
**Dependencies**: Task 6.1, Task 4.8

**Description**:
实现用户管理页面。

**Sub-tasks**:
1. 创建用户列表页面
2. 实现用户搜索
3. 实现用户详情查看
4. 实现用户信息编辑（VIP状态、积分）
5. 实现用户统计

**Acceptance Criteria**:
- [ ] 用户列表正常显示
- [ ] 搜索功能正常
- [ ] 可以查看用户详情
- [ ] 可以编辑用户信息
- [ ] 统计数据准确

---

### Task 6.5: 实现订单管理页面
**Priority**: P1  
**Estimated Time**: 3 hours  
**Dependencies**: Task 6.1, Task 4.8

**Description**:
实现订单管理页面。

**Sub-tasks**:
1. 创建订单列表页面
2. 实现订单筛选（状态、类型、日期）
3. 实现订单详情查看
4. 实现订单导出（CSV）
5. 实现收入统计

**Acceptance Criteria**:
- [ ] 订单列表正常显示
- [ ] 筛选功能正常
- [ ] 可以查看订单详情
- [ ] 可以导出订单数据
- [ ] 统计数据准确

---

### Task 6.6: 实现分类管理页面
**Priority**: P1  
**Estimated Time**: 3 hours  
**Dependencies**: Task 6.1, Task 4.6

**Description**:
实现分类管理页面。

**Sub-tasks**:
1. 创建分类列表页面
2. 实现分类创建
3. 实现分类编辑
4. 实现分类删除
5. 实现拖拽排序
6. 显示订阅统计

**Acceptance Criteria**:
- [ ] 分类列表正常显示
- [ ] CRUD操作正常
- [ ] 拖拽排序功能正常
- [ ] 订阅统计准确

---

### Task 6.7: 实现全局设置页面
**Priority**: P1  
**Estimated Time**: 3 hours  
**Dependencies**: Task 6.1, Task 4.8

**Description**:
实现全局设置管理页面。

**Sub-tasks**:
1. 创建设置页面
2. 实现弹窗配置
3. 实现营销规则配置
4. 实现分类价格配置
5. 实现设置保存

**Acceptance Criteria**:
- [ ] 设置页面布局清晰
- [ ] 所有配置项可以编辑
- [ ] 设置可以保存
- [ ] 保存后立即生效

---

### Task 6.8: 后台管理系统UI优化
**Priority**: P2  
**Estimated Time**: 2 hours  
**Dependencies**: Task 6.2, Task 6.3, Task 6.4, Task 6.5, Task 6.6, Task 6.7

**Description**:
优化后台管理系统的UI和用户体验。

**Sub-tasks**:
1. 统一UI风格
2. 优化响应式布局
3. 优化加载状态
4. 优化错误提示
5. 添加操作确认对话框
6. 进行浏览器兼容性测试

**Acceptance Criteria**:
- [ ] UI风格统一
- [ ] 响应式布局正常
- [ ] 加载状态清晰
- [ ] 错误提示友好
- [ ] 主流浏览器兼容

---

## Phase 7: 集成测试和优化

### Task 7.1: 端到端集成测试
**Priority**: P0  
**Estimated Time**: 4 hours  
**Dependencies**: Phase 5, Phase 6

**Description**:
进行完整的端到端测试。

**Sub-tasks**:
1. 测试用户注册和登录流程
2. 测试文章浏览和访问控制
3. 测试订阅购买流程
4. 测试支付流程（沙箱环境）
5. 测试AI助手功能
6. 测试后台管理功能
7. 记录和修复发现的bug

**Acceptance Criteria**:
- [ ] 所有核心流程测试通过
- [ ] 发现的bug已修复
- [ ] 测试报告已生成

---

### Task 7.2: 性能优化
**Priority**: P1  
**Estimated Time**: 3 hours  
**Dependencies**: Task 7.1

**Description**:
优化系统性能。

**Sub-tasks**:
1. 优化数据库查询（添加索引、优化SQL）
2. 配置Redis缓存策略
3. 优化API响应时间
4. 优化前端资源加载
5. 进行压力测试
6. 分析性能瓶颈

**Acceptance Criteria**:
- [ ] API响应时间符合要求（<500ms）
- [ ] 数据库查询优化
- [ ] 缓存命中率高
- [ ] 前端加载速度快

---

### Task 7.3: 安全加固
**Priority**: P0  
**Estimated Time**: 3 hours  
**Dependencies**: Task 7.1

**Description**:
加强系统安全性。

**Sub-tasks**:
1. 审查所有API的权限控制
2. 实现API限流
3. 加强输入验证
4. 配置HTTPS
5. 审查敏感数据加密
6. 进行安全测试

**Acceptance Criteria**:
- [ ] 所有API权限控制正确
- [ ] 限流机制有效
- [ ] 输入验证完善
- [ ] HTTPS配置正确
- [ ] 敏感数据已加密

---

### Task 7.4: 日志和监控配置
**Priority**: P1  
**Estimated Time**: 2 hours  
**Dependencies**: Task 7.1

**Description**:
配置日志和监控系统。

**Sub-tasks**:
1. 配置结构化日志
2. 配置日志级别
3. 配置日志轮转
4. 配置健康检查端点
5. 配置性能监控
6. 配置告警规则

**Acceptance Criteria**:
- [ ] 日志记录完整
- [ ] 日志格式统一
- [ ] 健康检查正常
- [ ] 监控指标准确
- [ ] 告警规则合理

---

## Phase 8: 部署和上线

### Task 8.1: 准备生产环境配置
**Priority**: P0  
**Estimated Time**: 2 hours  
**Dependencies**: Phase 7

**Description**:
准备生产环境的配置文件。

**Sub-tasks**:
1. 创建生产环境配置文件
2. 配置数据库连接
3. 配置Redis连接
4. 配置微信支付参数
5. 配置AI API密钥
6. 配置域名和SSL证书

**Acceptance Criteria**:
- [ ] 所有配置文件准备完毕
- [ ] 敏感信息使用环境变量
- [ ] 配置文件已审查

---

### Task 8.2: Docker容器化
**Priority**: P1  
**Estimated Time**: 3 hours  
**Dependencies**: Task 8.1

**Description**:
将应用容器化。

**Sub-tasks**:
1. 创建后端Dockerfile
2. 创建docker-compose.yml
3. 配置MySQL容器
4. 配置Redis容器
5. 配置Nginx容器
6. 测试容器启动

**Acceptance Criteria**:
- [ ] 所有服务可以通过Docker启动
- [ ] 容器间网络通信正常
- [ ] 数据持久化配置正确

---

### Task 8.3: 配置CI/CD
**Priority**: P2  
**Estimated Time**: 3 hours  
**Dependencies**: Task 8.2

**Description**:
配置持续集成和部署。

**Sub-tasks**:
1. 配置Git仓库
2. 配置CI流程（测试、构建）
3. 配置CD流程（部署）
4. 配置自动化测试
5. 配置部署脚本

**Acceptance Criteria**:
- [ ] 代码提交触发CI
- [ ] 测试自动运行
- [ ] 构建自动完成
- [ ] 部署流程顺畅

---

### Task 8.4: 数据库迁移和初始化
**Priority**: P0  
**Estimated Time**: 2 hours  
**Dependencies**: Task 8.1

**Description**:
执行数据库迁移和初始化数据。

**Sub-tasks**:
1. 执行数据库建表脚本
2. 创建索引
3. 插入初始数据（默认分类、全局设置）
4. 创建管理员账号
5. 验证数据完整性

**Acceptance Criteria**:
- [ ] 所有表创建成功
- [ ] 索引创建成功
- [ ] 初始数据插入成功
- [ ] 管理员可以登录

---

### Task 8.5: 小程序提审和发布
**Priority**: P0  
**Estimated Time**: 2 hours  
**Dependencies**: Task 7.1, Task 8.1

**Description**:
提交小程序审核并发布。

**Sub-tasks**:
1. 配置小程序信息
2. 上传小程序代码
3. 提交审核
4. 处理审核反馈
5. 发布上线

**Acceptance Criteria**:
- [ ] 小程序审核通过
- [ ] 小程序成功发布
- [ ] 用户可以正常使用

---

### Task 8.6: 后端服务部署
**Priority**: P0  
**Estimated Time**: 3 hours  
**Dependencies**: Task 8.2, Task 8.4

**Description**:
部署后端服务到生产环境。

**Sub-tasks**:
1. 准备服务器环境
2. 部署MySQL数据库
3. 部署Redis
4. 部署后端应用
5. 配置Nginx反向代理
6. 配置SSL证书
7. 验证服务可用性

**Acceptance Criteria**:
- [ ] 所有服务正常运行
- [ ] API可以正常访问
- [ ] HTTPS配置正确
- [ ] 健康检查通过

---

### Task 8.7: 后台管理系统部署
**Priority**: P1  
**Estimated Time**: 2 hours  
**Dependencies**: Task 8.6

**Description**:
部署后台管理系统。

**Sub-tasks**:
1. 构建生产版本
2. 上传到服务器
3. 配置Nginx
4. 配置域名
5. 验证访问

**Acceptance Criteria**:
- [ ] 后台管理系统可以访问
- [ ] 功能正常
- [ ] 性能良好

---

### Task 8.8: 生产环境验证
**Priority**: P0  
**Estimated Time**: 2 hours  
**Dependencies**: Task 8.5, Task 8.6, Task 8.7

**Description**:
验证生产环境的功能和性能。

**Sub-tasks**:
1. 测试小程序核心功能
2. 测试支付流程（真实环境）
3. 测试后台管理功能
4. 检查日志和监控
5. 进行压力测试
6. 验证数据备份

**Acceptance Criteria**:
- [ ] 所有核心功能正常
- [ ] 支付流程正常
- [ ] 性能符合要求
- [ ] 监控正常
- [ ] 备份策略有效

---

## Phase 9: 文档和培训

### Task 9.1: 编写API文档
**Priority**: P1  
**Estimated Time**: 3 hours  
**Dependencies**: Phase 4

**Description**:
编写完整的API文档。

**Sub-tasks**:
1. 配置Swagger/OpenAPI
2. 为所有API添加注解
3. 生成API文档
4. 添加使用示例
5. 发布API文档

**Acceptance Criteria**:
- [ ] API文档完整
- [ ] 包含所有端点
- [ ] 有清晰的示例
- [ ] 文档可以在线访问

---

### Task 9.2: 编写部署文档
**Priority**: P1  
**Estimated Time**: 2 hours  
**Dependencies**: Phase 8

**Description**:
编写部署和运维文档。

**Sub-tasks**:
1. 编写环境准备文档
2. 编写部署步骤文档
3. 编写配置说明文档
4. 编写故障排查文档
5. 编写备份恢复文档

**Acceptance Criteria**:
- [ ] 部署文档完整
- [ ] 步骤清晰
- [ ] 包含常见问题解决方案

---

### Task 9.3: 编写用户手册
**Priority**: P2  
**Estimated Time**: 2 hours  
**Dependencies**: Task 8.5

**Description**:
编写小程序用户使用手册。

**Sub-tasks**:
1. 编写功能介绍
2. 编写使用教程
3. 添加截图说明
4. 编写常见问题FAQ

**Acceptance Criteria**:
- [ ] 用户手册完整
- [ ] 图文并茂
- [ ] 易于理解

---

### Task 9.4: 管理员培训
**Priority**: P1  
**Estimated Time**: 2 hours  
**Dependencies**: Task 8.7

**Description**:
培训管理员使用后台管理系统。

**Sub-tasks**:
1. 准备培训材料
2. 演示后台功能
3. 讲解操作流程
4. 解答疑问
5. 提供操作手册

**Acceptance Criteria**:
- [ ] 管理员了解所有功能
- [ ] 管理员可以独立操作
- [ ] 操作手册已提供

---

## Phase 10: 维护和优化

### Task 10.1: 监控和日志分析
**Priority**: P1  
**Estimated Time**: Ongoing  
**Dependencies**: Task 8.8

**Description**:
持续监控系统运行状态。

**Sub-tasks**:
1. 每日检查系统健康状态
2. 分析错误日志
3. 监控性能指标
4. 处理告警
5. 生成运营报告

**Acceptance Criteria**:
- [ ] 系统稳定运行
- [ ] 问题及时发现和处理
- [ ] 定期生成报告

---

### Task 10.2: 用户反馈收集和处理
**Priority**: P1  
**Estimated Time**: Ongoing  
**Dependencies**: Task 8.5

**Description**:
收集和处理用户反馈。

**Sub-tasks**:
1. 建立反馈渠道
2. 收集用户反馈
3. 分类和优先级排序
4. 修复bug
5. 优化功能
6. 回复用户

**Acceptance Criteria**:
- [ ] 反馈渠道畅通
- [ ] 反馈及时处理
- [ ] 用户满意度提升

---

### Task 10.3: 性能持续优化
**Priority**: P2  
**Estimated Time**: Ongoing  
**Dependencies**: Task 8.8

**Description**:
持续优化系统性能。

**Sub-tasks**:
1. 分析性能瓶颈
2. 优化慢查询
3. 调整缓存策略
4. 优化代码
5. 升级依赖版本

**Acceptance Criteria**:
- [ ] 响应时间持续改善
- [ ] 系统吞吐量提升
- [ ] 资源利用率优化

---

### Task 10.4: 功能迭代和扩展
**Priority**: P2  
**Estimated Time**: Ongoing  
**Dependencies**: Task 10.2

**Description**:
根据用户需求迭代功能。

**Sub-tasks**:
1. 收集功能需求
2. 评估和排期
3. 设计新功能
4. 开发和测试
5. 发布上线

**Acceptance Criteria**:
- [ ] 新功能符合用户需求
- [ ] 功能稳定可用
- [ ] 用户体验良好

---

## Task Dependency Graph

Phase 1 (基础设施) ├─ Task 1.1 → Task 1.2, 1.3, 1.4 ├─ Task 1.5 (独立) └─ Task 1.6 (独立)

Phase 2 (实体层) ├─ Task 2.1 → Task 2.3, 2.4, 2.5 ├─ Task 2.2 → Task 2.5 └─ Task 2.3, 2.4, 2.5 (并行)

Phase 3 (服务层) ├─ Task 3.1 → Task 4.1 ├─ Task 3.2 → Task 3.4, 4.2 ├─ Task 3.3 → Task 4.3 ├─ Task 3.4 → Task 3.5, 4.4 ├─ Task 3.5 → Task 4.5 ├─ Task 3.6 → Task 4.6 ├─ Task 3.7 → Task 4.7 └─ Task 3.8 → Task 4.9

Phase 4 (控制器层) ├─ Task 4.1-4.9 (依赖对应的Service) └─ 可以并行开发

Phase 5 (小程序) ├─ Task 5.1 → Task 5.2 ├─ Task 5.2 → Task 5.3, 5.4, 5.5, 5.6, 5.7 └─ Task 5.8 (最后)

Phase 6 (后台管理) ├─ Task 6.1 → Task 6.2-6.7 └─ Task 6.8 (最后)

Phase 7 (测试优化) ├─ Task 7.1 → Task 7.2, 7.3, 7.4 └─ 可以并行进行

Phase 8 (部署) ├─ Task 8.1 → Task 8.2, 8.4 ├─ Task 8.2 → Task 8.6 ├─ Task 8.4 → Task 8.6 ├─ Task 8.6 → Task 8.7 └─ Task 8.5, 8.6, 8.7 → Task 8.8

Phase 9 (文档) ├─ Task 9.1-9.4 (可以并行) └─ 依赖对应的开发阶段

Phase 10 (维护) └─ Task 10.1-10.4 (持续进行)


---

## Estimated Timeline

- **Phase 1**: 2-3 days
- **Phase 2**: 2-3 days
- **Phase 3**: 5-6 days
- **Phase 4**: 4-5 days
- **Phase 5**: 6-7 days
- **Phase 6**: 5-6 days
- **Phase 7**: 2-3 days
- **Phase 8**: 3-4 days
- **Phase 9**: 2 days
- **Phase 10**: Ongoing

**Total Estimated Time**: 31-39 working days (约6-8周)

---

## Priority Legend

- **P0**: 必须完成，核心功能
- **P1**: 重要功能，应该完成
- **P2**: 优化功能，可以延后

---

## Notes

1. 任务可以根据实际情况调整优先级和顺序
2. 建议采用敏捷开发方式，每个Phase作为一个Sprint
3. 每完成一个Phase进行代码审查和测试
4. 保持与产品经理和设计师的沟通
5. 及时记录和解决技术债务
6. 定期进行团队回顾和改进

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-10  
**Author**: Development Team
