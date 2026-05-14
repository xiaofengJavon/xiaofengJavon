# 全栈订阅平台 - 后端服务

基于 **Spring Boot 3.2.x + MySQL 8.0 + Redis** 构建的全栈订阅平台后端。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17 | 运行时 |
| Spring Boot | 3.2.3 | 主框架 |
| Spring Data JPA | - | ORM |
| Spring Security | - | 安全框架 |
| MySQL | 8.0 | 主数据库 |
| Redis | 7.x | 缓存 |
| JWT (JJWT) | 0.12.3 | 认证 |
| Flyway | - | 数据库迁移 |
| WxJava | 4.6.0 | 微信SDK |
| springdoc-openapi | 2.3.0 | API文档 |
| Lombok | - | 代码生成 |

## 项目结构

```
src/main/java/com/subscription/platform/
├── config/          # 配置类 (Security, Redis, CORS, Swagger, Wechat, DataInitializer)
├── controller/      # REST控制器
├── dto/
│   ├── request/     # 请求DTO
│   └── response/    # 响应DTO
├── entity/          # JPA实体类
├── exception/       # 异常类 + 全局异常处理
├── repository/      # Spring Data JPA接口
├── security/        # JWT过滤器 + UserPrincipal
├── service/         # 业务逻辑层
└── util/            # 工具类
```

## 快速开始

### 前提条件
- JDK 17+
- Maven 3.8+
- MySQL 8.0
- Redis 7.x

### 本地开发

1. **复制环境配置**
   ```bash
   cp ../.env.example ../.env
   # 编辑 .env 填写配置
   ```

2. **创建数据库**
   ```sql
   CREATE DATABASE subscription_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **配置 application-dev.yml**
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/subscription_platform?...
       username: root
       password: your_password
   ```

4. **运行项目**
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```

5. **验证运行**
   - 健康检查: http://localhost:8080/actuator/health
   - API文档: http://localhost:8080/swagger-ui.html

### Docker 部署

```bash
# 从项目根目录执行
docker-compose up -d

# 查看日志
docker-compose logs -f backend
```

## API 概览

| 分组 | 路径 | 说明 |
|------|------|------|
| 认证 | `POST /api/v1/auth/wechat-login` | 微信小程序登录 |
| 认证 | `POST /api/v1/auth/admin-login` | 管理员登录 |
| 用户 | `GET /api/v1/user/profile` | 获取用户资料 |
| 文章 | `GET /api/v1/articles` | 文章列表 |
| 文章 | `GET /api/v1/articles/{id}` | 文章详情 |
| 分类 | `GET /api/v1/categories` | 分类列表 |
| 订阅 | `POST /api/v1/subscriptions/vip` | 发起VIP支付 |
| 订阅 | `POST /api/v1/subscriptions/category` | 发起分类订阅支付 |
| 支付 | `POST /api/v1/payment/callback` | 微信支付回调 |
| AI | `POST /api/v1/ai/chat` | AI助手对话 |
| 管理 | `GET /api/v1/admin/dashboard` | 统计数据 |
| 管理 | `GET /api/v1/admin/users` | 用户列表 |
| 管理 | `GET /api/v1/admin/orders` | 订单列表 |

## 默认账号

首次启动时自动创建管理员账号：
- **用户名**: `admin`
- **密码**: `Admin@2024`

> ⚠️ **生产环境请立即修改默认密码！**

## 环境变量说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `DB_HOST` | ✅ | MySQL主机 |
| `DB_NAME` | ✅ | 数据库名 |
| `DB_USERNAME` | ✅ | 数据库用户名 |
| `DB_PASSWORD` | ✅ | 数据库密码 |
| `REDIS_HOST` | ✅ | Redis主机 |
| `REDIS_PASSWORD` | ✅ | Redis密码 |
| `JWT_SECRET` | ✅ | JWT密钥（≥256位） |
| `WECHAT_MINIAPP_APPID` | ✅ | 微信小程序AppID |
| `WECHAT_MINIAPP_SECRET` | ✅ | 微信小程序Secret |
| `WECHAT_PAY_APPID` | ✅ | 微信支付AppID |
| `WECHAT_PAY_MCHID` | ✅ | 微信商户号 |
| `WECHAT_PAY_MCH_KEY` | ✅ | 微信支付密钥 |
| `GEMINI_API_KEY` | ✅ | Google Gemini API密钥 |
