# Design Document: 全栈订阅平台系统

## Overview

本文档描述了全栈订阅平台系统的技术设计,该系统包括:
- **后端**: Java Spring Boot 3.x + MySQL 8.0 + Redis
- **小程序前端**: Taro 3.6.20 + React 18.2 + TypeScript
- **后台管理系统**: React 18.x + TypeScript + Ant Design

系统提供行业资讯和政策资讯的订阅服务,支持VIP会员、分类订阅、积分系统、微信支付、AI助手等核心功能。

### 设计目标

1. **高性能**: 支持1000+并发用户,API响应时间<500ms
2. **可扩展**: 模块化设计,易于添加新功能
3. **安全性**: JWT认证、数据加密、防SQL注入
4. **可维护性**: 清晰的分层架构、完善的文档

### 技术选型理由

- **Java 17 + Spring Boot 3.x**: 成熟稳定的企业级框架,生态完善
- **MySQL 8.0**: 支持大规模数据、事务完整性、丰富的索引类型
- **Redis**: 高性能缓存,减轻数据库压力
- **Taro**: 跨平台小程序开发框架,一次编写多端运行
- **TypeScript**: 类型安全,提高代码质量

---

# Technical Design Document

## 1. System Architecture

### 1.1 High-Level Architecture

┌─────────────────────────────────────────────────────────────┐ │ Client Layer │ ├──────────────────────┬──────────────────────────────────────┤ │ WeChat Mini Program │ Admin Web Panel (React SPA) │ │ (Taro + React) │ (React + Ant Design) │ └──────────┬───────────┴──────────────┬───────────────────────┘ │ │ │ HTTPS/REST API │ │ │ ┌──────────▼──────────────────────────▼───────────────────────┐ │ Application Layer (Spring Boot) │ ├──────────────────────────────────────────────────────────────┤ │ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ │ │ │ Controllers │ │ Services │ │ Security │ │ │ │ (REST API) │ │ (Business) │ │ (JWT/Auth) │ │ │ └─────────────┘ └──────────────┘ └──────────────┘ │ │ │ │ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ │ │ │ Repositories│ │ Entities │ │ DTOs │ │ │ │ (JPA) │ │ (Models) │ │ (Transfer) │ │ │ └─────────────┘ └──────────────┘ └──────────────┘ │ └──────────┬──────────────────────────┬───────────────────────┘ │ │ ┌──────────▼──────────────┐ ┌────────▼──────────────────────┐ │ Data Layer (MySQL) │ │ External Services │ ├─────────────────────────┤ ├───────────────────────────────┤ │ • User │ │ • WeChat OAuth API │ │ • Article │ │ • WeChat Pay API │ │ • Subscription │ │ • Google Gemini API (AI) │ │ • Order │ │ • Google TTS API │ │ • Category Config │ │ • Redis Cache │ │ • Global Settings │ │ • File Storage │ └─────────────────────────┘ └───────────────────────────────┘


### 1.2 Technology Stack

#### Backend
- **Language**: Java 17
- **Framework**: Spring Boot 3.2.x
- **ORM**: Spring Data JPA + Hibernate
- **Security**: Spring Security + JWT
- **Database**: MySQL 8.0
- **Cache**: Redis 7.x
- **Build Tool**: Maven 3.9.x
- **API Documentation**: Swagger/OpenAPI 3.0

#### Frontend (Mini Program)
- **Framework**: Taro 3.6.20
- **UI Library**: React 18.2
- **Language**: TypeScript 4.1+
- **State Management**: React Context API
- **HTTP Client**: Taro.request

#### Admin Panel
- **Framework**: React 18.x
- **UI Library**: Ant Design 5.x
- **Language**: TypeScript 5.x
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Rich Text Editor**: React Quill

---

## 2. Database Design

### 2.1 Entity Relationship Diagram

参考已创建的 `数据库设计文档.md`，包含10个核心表：
- user
- article
- subscription
- order
- global_settings
- referral
- category_config
- read_article
- favorite
- unlocked_article

---

## 3. Backend Design (Java Spring Boot)

### 3.1 Project Structure

subscription-platform-backend/ 
├── src/ 
│ ├── main/ 
│ │ ├── java/ 
│ │ │ └── com/ 
│ │ │ └── subscription/ 
│ │ │ └── platform/ 
│ │ │ ├── SubscriptionPlatformApplication.java 
│ │ │ ├── config/ 
│ │ │ │ ├── SecurityConfig.java 
│ │ │ │ ├── JwtConfig.java 
│ │ │ │ ├── RedisConfig.java 
│ │ │ │ ├── SwaggerConfig.java 
│ │ │ │ └── CorsConfig.java 
│ │ │ ├── controller/ 
│ │ │ │ ├── AuthController.java 
│ │ │ │ ├── UserController.java 
│ │ │ │ ├── ArticleController.java 
│ │ │ │ ├── SubscriptionController.java 
│ │ │ │ ├── OrderController.java 
│ │ │ │ ├── CategoryController.java 
│ │ │ │ ├── PaymentController.java 
│ │ │ │ ├── AIAssistantController.java 
│ │ │ │ └── AdminController.java 
│ │ │ ├── service/ 
│ │ │ │ ├── AuthService.java 
│ │ │ │ ├── UserService.java 
│ │ │ │ ├── ArticleService.java 
│ │ │ │ ├── SubscriptionService.java 
│ │ │ │ ├── OrderService.java 
│ │ │ │ ├── CategoryService.java 
│ │ │ │ ├── PaymentService.java 
│ │ │ │ ├── AIService.java 
│ │ │ │ └── FileStorageService.java 
│ │ │ ├── repository/ 
│ │ │ │ ├── UserRepository.java 
│ │ │ │ ├── ArticleRepository.java 
│ │ │ │ ├── SubscriptionRepository.java 
│ │ │ │ ├── OrderRepository.java 
│ │ │ │ ├── CategoryConfigRepository.java 
│ │ │ │ ├── GlobalSettingsRepository.java 
│ │ │ │ ├── ReferralRepository.java 
│ │ │ │ ├── ReadArticleRepository.java 
│ │ │ │ ├── FavoriteRepository.java 
│ │ │ │ └── UnlockedArticleRepository.java 
│ │ │ ├── entity/ 
│ │ │ │ ├── User.java 
│ │ │ │ ├── Article.java 
│ │ │ │ ├── Subscription.java 
│ │ │ │ ├── Order.java 
│ │ │ │ ├── CategoryConfig.java 
│ │ │ │ ├── GlobalSettings.java 
│ │ │ │ ├── Referral.java 
│ │ │ │ ├── ReadArticle.java 
│ │ │ │ ├── Favorite.java 
│ │ │ │ └── UnlockedArticle.java 
│ │ │ ├── dto/ 
│ │ │ │ ├── request/ 
│ │ │ │ │ ├── LoginRequest.java 
│ │ │ │ │ ├── ArticleCreateRequest.java 
│ │ │ │ │ ├── SubscriptionRequest.java 
│ │ │ │ │ └── PaymentRequest.java 
│ │ │ │ └── response/ 
│ │ │ │ ├── UserResponse.java 
│ │ │ │ ├── ArticleResponse.java 
│ │ │ │ ├── SubscriptionResponse.java 
│ │ │ │ └── ApiResponse.java 
│ │ │ ├── security/ 
│ │ │ │ ├── JwtTokenProvider.java 
│ │ │ │ ├── JwtAuthenticationFilter.java 
│ │ │ │ └── CustomUserDetailsService.java 
│ │ │ ├── exception/ 
│ │ │ │ ├── GlobalExceptionHandler.java 
│ │ │ │ ├── ResourceNotFoundException.java 
│ │ │ │ ├── UnauthorizedException.java 
│ │ │ │ └── PaymentException.java 
│ │ │ └── util/ 
│ │ │ ├── InviteCodeGenerator.java 
│ │ │ ├── DateUtil.java 
│ │ │ └── EncryptionUtil.java 
│ │ └── resources/ 
│ │ ├── application.yml 
│ │ ├── application-dev.yml 
│ │ ├── application-prod.yml 
│ │ └── db/ 
│ │ └── migration/ 
│ └── test/ 
│ └── java/ 
│ └── com/ 
│ └── subscription/ 
│ └── platform/ 
│ ├── service/ 
│ ├── controller/ 
│ └── integration/ 
├── pom.xml 
└── README.md


### 3.2 Core Entity Classes

#### User Entity
```java
@Entity
@Table(name = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @Column(length = 36)
    private String id;
    
    @Column(unique = true, nullable = false, length = 100)
    private String username;
    
    @Column(name = "is_vip")
    private Boolean isVip = false;
    
    @Column(name = "subscription_tier", length = 20)
    private String subscriptionTier = "NONE";
    
    private Integer credits = 10;
    
    @Column(name = "invite_code", unique = true, length = 6)
    private String inviteCode;
    
    @Column(name = "invited_count")
    private Integer invitedCount = 0;
    
    @Column(name = "vip_expiry")
    private LocalDate vipExpiry;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Subscription> subscriptions;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders;
    
    @PrePersist
    protected void onCreate() {
        id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

Article Entity
@Entity
@Table(name = "article")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Article {
    @Id
    @Column(length = 36)
    private String id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(nullable = false, length = 500)
    private String summary;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(nullable = false, length = 50)
    private String category;
    
    @Column(nullable = false, length = 20)
    private String type;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(name = "is_premium")
    private Boolean isPremium = false;
    
    @Column(name = "read_time")
    private Integer readTime;
    
    @Column(name = "view_count")
    private Integer viewCount = 0;
    
    @Column(name = "favorite_count")
    private Integer favoriteCount = 0;
    
    private Integer likes = 0;
    
    @Column(name = "share_count")
    private Integer shareCount = 0;
    
    @Column(name = "is_sticky")
    private Boolean isSticky = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

3.3 RESTful API Endpoints
Authentication APIs

POST   /api/v1/auth/wechat-login
  Request: { code: string }
  Response: { token: string, user: UserResponse }

POST   /api/v1/auth/refresh-token
  Request: { refreshToken: string }
  Response: { token: string }

User APIs
GET    /api/v1/user/profile
  Response: UserResponse

PUT    /api/v1/user/profile
  Request: UserUpdateRequest
  Response: UserResponse

POST   /api/v1/user/redeem-code
  Request: { code: string }
  Response: { success: boolean, message: string }

Article APIs
GET    /api/v1/articles
  Query: page, pageSize, type, category, search, subscribedOnly
  Response: { data: Article[], total: number }

GET    /api/v1/articles/:id
  Response: ArticleResponse

POST   /api/v1/articles (Admin)
  Request: ArticleCreateRequest
  Response: ArticleResponse

PUT    /api/v1/articles/:id (Admin)
  Request: ArticleUpdateRequest
  Response: ArticleResponse

DELETE /api/v1/articles/:id (Admin)
  Response: { success: boolean }

POST   /api/v1/articles/batch-delete (Admin)
  Request: { ids: string[] }
  Response: { success: boolean }

POST   /api/v1/articles/batch-category (Admin)
  Request: { ids: string[], category: string }
  Response: { success: boolean }

POST   /api/v1/articles/batch-sticky (Admin)
  Request: { ids: string[], isSticky: boolean }
  Response: { success: boolean }

Subscription APIs
GET    /api/v1/subscriptions
  Response: SubscriptionResponse[]

POST   /api/v1/subscriptions/vip
  Request: { tier: string, durationMonths: number }
  Response: PaymentResponse

POST   /api/v1/subscriptions/category
  Request: { category: string, durationMonths: number }
  Response: PaymentResponse

Payment APIs
POST   /api/v1/payment/create-order
  Request: PaymentRequest
  Response: { prepayId: string, timestamp: string, nonce: string, signature: string }

POST   /api/v1/payment/callback
  Request: WeChat Payment Notification
  Response: { code: string, message: string }

GET    /api/v1/payment/query/:orderId
  Response: OrderResponse

Category APIs
GET    /api/v1/categories
  Response: CategoryConfig[]

POST   /api/v1/categories (Admin)
  Request: CategoryCreateRequest
  Response: CategoryConfig

PUT    /api/v1/categories/:id (Admin)
  Request: CategoryUpdateRequest
  Response: CategoryConfig

DELETE /api/v1/categories/:id (Admin)
  Response: { success: boolean }

POST   /api/v1/categories/reorder (Admin)
  Request: { order: string[] }
  Response: { success: boolean }

Order APIs
GET    /api/v1/orders (Admin)
  Query: page, pageSize, status, type, dateFrom, dateTo
  Response: { data: Order[], total: number }

GET    /api/v1/orders/export (Admin)
  Query: status, type, dateFrom, dateTo
  Response: CSV file

AI Assistant APIs
POST   /api/v1/ai/chat
  Request: { message: string, sessionId: string }
  Response: { reply: string, creditsRemaining: number }

GET    /api/v1/ai/history/:sessionId
  Response: ChatMessage[]

File Upload APIs
POST   /api/v1/upload
  Request: multipart/form-data (file)
  Response: { url: string }

Admin APIs
GET    /api/v1/admin/dashboard
  Response: DashboardStats

GET    /api/v1/admin/users
  Query: page, pageSize, search
  Response: { data: User[], total: number }

PUT    /api/v1/admin/users/:id
  Request: UserAdminUpdateRequest
  Response: UserResponse

GET    /api/v1/admin/settings
  Response: GlobalSettings

PUT    /api/v1/admin/settings
  Request: GlobalSettingsUpdateRequest
  Response: GlobalSettings

GET    /api/v1/admin/marketing
  Response: MarketingRule[]

PUT    /api/v1/admin/marketing
  Request: MarketingRule[]
  Response: { success: boolean }

3.4 Service Layer Design
UserService
@Service
public class UserService {
    public User createUser(String username);
    public User getUserById(String id);
    public User getUserByUsername(String username);
    public User getUserByInviteCode(String inviteCode);
    public User updateUser(String id, UserUpdateRequest request);
    public void addCredits(String userId, int amount);
    public void deductCredits(String userId, int amount);
    public void updateVipStatus(String userId, boolean isVip, String tier, LocalDate expiry);
    public List<Subscription> getActiveSubscriptions(String userId);
    public void checkAndExpireSubscriptions();
}

ArticleService
@Service
public class ArticleService {
    public Page<Article> getArticles(ArticleQueryRequest request);
    public Article getArticleById(String id);
    public Article createArticle(ArticleCreateRequest request);
    public Article updateArticle(String id, ArticleUpdateRequest request);
    public void deleteArticle(String id);
    public void batchDeleteArticles(List<String> ids);
    public void batchUpdateCategory(List<String> ids, String category);
    public void batchUpdateSticky(List<String> ids, boolean isSticky);
    public void incrementViewCount(String articleId);
    public boolean canUserAccessArticle(String userId, String articleId);
}

SubscriptionService
@Service
public class SubscriptionService {
    public Subscription createOrUpdateSubscription(String userId, String category, int durationMonths);
    public List<Subscription> getUserSubscriptions(String userId);
    public boolean hasActiveSubscription(String userId, String category);
    public void expireSubscription(String subscriptionId);
    public LocalDate calculateExpiryDate(LocalDate baseDate, int durationMonths);
}

PaymentService
@Service
public class PaymentService {
    public PaymentResponse createPaymentOrder(String userId, PaymentRequest request);
    public void handlePaymentCallback(WeChatPaymentNotification notification);
    public boolean verifyPaymentSignature(WeChatPaymentNotification notification);
    public Order getOrderById(String orderId);
    public void activateSubscription(String orderId);
}

3.5 Security Configuration
JWT Configuration
@Configuration
public class JwtConfig {
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration; // 7 days in milliseconds
    
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("username", user.getUsername());
        claims.put("isVip", user.getIsVip());
        
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(user.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secret).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

Security Filter Chain
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors()
            .and()
            .authorizeHttpRequests()
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/payment/callback").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}

3.6 Redis Caching Strategy
@Service
public class ArticleService {
    @Cacheable(value = "articles", key = "#articleId")
    public Article getArticleById(String articleId) {
        return articleRepository.findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
    }
    
    @CacheEvict(value = "articles", key = "#articleId")
    public Article updateArticle(String articleId, ArticleUpdateRequest request) {
        // Update logic
    }
    
    @Cacheable(value = "articleList", key = "#request.hashCode()")
    public Page<Article> getArticles(ArticleQueryRequest request) {
        // Query logic
    }
}

Cache Keys:

articles:{articleId} - Individual article cache (TTL: 1 hour)
articleList:{queryHash} - Article list cache (TTL: 5 minutes)
user:{userId} - User profile cache (TTL: 30 minutes)
categories - Category list cache (TTL: 1 hour)
————————————————————————————————————————————————————————————————
4. Frontend Design (Taro Mini Program)
4.1 Project Structure
miniprogram/
├── src/
│   ├── app.config.ts
│   ├── app.tsx
│   ├── app.css
│   ├── pages/
│   │   ├── index/              # 首页
│   │   │   ├── index.tsx
│   │   │   ├── index.config.ts
│   │   │   └── index.module.css
│   │   ├── article/            # 文章详情
│   │   │   ├── index.tsx
│   │   │   ├── index.config.ts
│   │   │   └── index.module.css
│   │   ├── ai/                 # AI助手
│   │   │   ├── index.tsx
│   │   │   ├── index.config.ts
│   │   │   └── index.module.css
│   │   ├── profile/            # 个人中心
│   │   │   ├── index.tsx
│   │   │   ├── subscriptions.tsx
│   │   │   ├── favorites.tsx
│   │   │   └── index.module.css
│   │   └── subscription/       # 订阅页面
│   │       ├── vip.tsx
│   │       ├── category.tsx
│   │       └── index.module.css
│   ├── components/
│   │   ├── ArticleCard/
│   │   ├── CategorySelector/
│   │   ├── PaymentModal/
│   │   ├── ShareModal/
│   │   └── Toast/
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── article.ts
│   │   ├── subscription.ts
│   │   └── payment.ts
│   ├── store/
│   │   ├── index.ts
│   │   ├── userContext.tsx
│   │   └── appContext.tsx
│   ├── utils/
│   │   ├── request.ts
│   │   ├── storage.ts
│   │   └── helpers.ts
│   ├── types/
│   │   └── index.ts
│   └── constants/
│       └── index.ts
├── config/
│   ├── index.js
│   ├── dev.js
│   └── prod.js
├── package.json
└── project.config.json

4.2 Core Components
ArticleCard Component
interface ArticleCardProps {
  article: Article;
  onPress: (id: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onPress }) => {
  return (
    <View className="article-card" onClick={() => onPress(article.id)}>
      <View className="article-header">
        <Text className="article-title">{article.title}</Text>
        {article.isPremium && <View className="premium-badge">VIP</View>}
      </View>
      <Text className="article-summary">{article.summary}</Text>
      <View className="article-meta">
        <Text className="category">{article.category}</Text>
        <Text className="date">{article.date}</Text>
        <Text className="read-time">{article.readTime}分钟</Text>
      </View>
    </View>
  );
};


PaymentModal Component
interface PaymentModalProps {
  visible: boolean;
  type: 'VIP' | 'CATEGORY';
  item: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  type,
  item,
  onClose,
  onSuccess
}) => {
  const handlePayment = async (duration: 'MONTHLY' | 'QUARTERLY' | 'YEARLY') => {
    try {
      const paymentParams = await PaymentService.createOrder({
        type,
        item,
        duration
      });
      
      await Taro.requestPayment(paymentParams);
      onSuccess();
    } catch (error) {
      Taro.showToast({ title: '支付失败', icon: 'none' });
    }
  };
  
  return (
    <Modal visible={visible} onClose={onClose}>
      {/* Payment options UI */}
    </Modal>
  );
};


4.3 API Service Layer
// services/api.ts
class ApiService {
  private baseURL = process.env.API_BASE_URL;
  
  async request<T>(config: RequestConfig): Promise<T> {
    const token = Taro.getStorageSync('token');
    
    const response = await Taro.request({
      url: `${this.baseURL}${config.url}`,
      method: config.method,
      data: config.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    if (response.statusCode === 401) {
      // Handle unauthorized
      Taro.redirectTo({ url: '/pages/login/index' });
      throw new Error('Unauthorized');
    }
    
    return response.data;
  }
  
  // Article APIs
  async getArticles(params: ArticleQueryParams): Promise<ArticleListResponse> {
    return this.request({
      url: '/api/v1/articles',
      method: 'GET',
      data: params
    });
  }
  
  async getArticleById(id: string): Promise<Article> {
    return this.request({
      url: `/api/v1/articles/${id}`,
      method: 'GET'
    });
  }
  
  // Subscription APIs
  async subscribeVIP(tier: string, durationMonths: number): Promise<PaymentResponse> {
    return this.request({
      url: '/api/v1/subscriptions/vip',
      method: 'POST',
      data: { tier, durationMonths }
    });
  }
  
  async subscribeCategory(category: string, durationMonths: number): Promise<PaymentResponse> {
    return this.request({
      url: '/api/v1/subscriptions/category',
      method: 'POST',
      data: { category, durationMonths }
    });
  }
}

export default new ApiService();


4.4 State Management
// store/userContext.tsx
interface UserContextType {
  user: User | null;
  isVip: boolean;
  credits: number;
  subscriptions: Subscription[];
  login: (code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (code: string) => {
    const response = await AuthService.wechatLogin(code);
    setUser(response.user);
    Taro.setStorageSync('token', response.token);
  };
  
  const logout = () => {
    setUser(null);
    Taro.removeStorageSync('token');
  };
  
  const refreshUser = async () => {
    const userData = await UserService.getProfile();
    setUser(userData);
  };
  
  return (
    <UserContext.Provider value={{
      user,
      isVip: user?.isVip || false,
      credits: user?.credits || 0,
      subscriptions: user?.subscriptions || [],
      login,
      logout,
      refreshUser
    }}>
      {children}
    </UserContext.Provider>
  );
};


5. Admin Panel Design (React)
5.1 Project Structure
admin-panel/
├── src/
│   ├── App.tsx
│   ├── index.tsx
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Articles/
│   │   │   ├── ArticleList.tsx
│   │   │   ├── ArticleEditor.tsx
│   │   │   └── ArticleDetail.tsx
│   │   ├── Users/
│   │   │   ├── UserList.tsx
│   │   │   └── UserDetail.tsx
│   │   ├── Orders/
│   │   │   └── OrderList.tsx
│   │   ├── Categories/
│   │   │   └── CategoryManager.tsx
│   │   ├── Settings/
│   │   │   ├── GlobalSettings.tsx
│   │   │   └── MarketingRules.tsx
│   │   └── Login/
│   │       └── Login.tsx
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── RichTextEditor/
│   │   │   └── RichTextEditor.tsx
│   │   ├── DataTable/
│   │   │   └── DataTable.tsx
│   │   └── Charts/
│   │       ├── LineChart.tsx
│   │       └── PieChart.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── article.ts
│   │   ├── user.ts
│   │   ├── order.ts
│   │   └── settings.ts
│   ├── store/
│   │   ├── index.ts
│   │   ├── authSlice.ts
│   │   ├── articleSlice.ts
│   │   └── userSlice.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTable.ts
│   │   └── useUpload.ts
│   ├── utils/
│   │   ├── request.ts
│   │   ├── storage.ts
│   │   └── validators.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── global.css
├── package.json
└── tsconfig.json

5.2 Core Components
ArticleEditor Component

import React, { useState } from 'react';
import { Form, Input, Select, Switch, Button, message } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ArticleEditorProps {
  article?: Article;
  onSave: (article: ArticleFormData) => Promise<void>;
  onCancel: () => void;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  article,
  onSave,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [content, setContent] = useState(article?.content || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await onSave({
        ...values,
        content
      });
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={article}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="title"
        label="标题"
        rules={[
          { required: true, message: '请输入标题' },
          { max: 200, message: '标题最多200字符' }
        ]}
      >
        <Input placeholder="请输入文章标题" />
      </Form.Item>

      <Form.Item
        name="category"
        label="分类"
        rules={[{ required: true, message: '请选择分类' }]}
      >
        <Select placeholder="请选择分类">
          {/* Categories from API */}
        </Select>
      </Form.Item>

      <Form.Item
        name="type"
        label="类型"
        rules={[{ required: true, message: '请选择类型' }]}
      >
        <Select>
          <Select.Option value="industry">行业资讯</Select.Option>
          <Select.Option value="policy">政策资讯</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="isPremium"
        label="付费内容"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="isSticky"
        label="置顶"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item label="内容">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          style={{ height: '400px', marginBottom: '50px' }}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          保存
        </Button>
        <Button onClick={onCancel} style={{ marginLeft: 8 }}>
          取消
        </Button>
      </Form.Item>
    </Form>
  );
};

DataTable Component
import React from 'react';
import { Table, Button, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface DataTableProps<T> {
  columns: ColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowSelection?: any;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  dataSource,
  loading,
  pagination,
  rowSelection,
  onEdit,
  onDelete
}: DataTableProps<T>) {
  const actionColumn: ColumnsType<T>[0] = {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 150,
    render: (_, record) => (
      <Space size="small">
        {onEdit && (
          <Button type="link" size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
        )}
        {onDelete && (
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => onDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        )}
      </Space>
    )
  };

  const finalColumns = onEdit || onDelete 
    ? [...columns, actionColumn] 
    : columns;

  return (
    <Table
      columns={finalColumns}
      dataSource={dataSource}
      loading={loading}
      rowKey="id"
      pagination={pagination}
      rowSelection={rowSelection}
      scroll={{ x: 1200 }}
    />
  );
}


5.3 Redux Store Configuration
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import articleReducer from './articleSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    article: articleReducer,
    user: userReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


// store/articleSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ArticleService } from '../services/article';

export const fetchArticles = createAsyncThunk(
  'article/fetchArticles',
  async (params: ArticleQueryParams) => {
    const response = await ArticleService.getArticles(params);
    return response;
  }
);

export const createArticle = createAsyncThunk(
  'article/createArticle',
  async (data: ArticleCreateRequest) => {
    const response = await ArticleService.createArticle(data);
    return response;
  }
);

const articleSlice = createSlice({
  name: 'article',
  initialState: {
    articles: [],
    total: 0,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default articleSlice.reducer;


6. Integration Design
6.1 WeChat OAuth Flow
┌─────────────┐                                    ┌─────────────┐
│ Mini Program│                                    │   Backend   │
└──────┬──────┘                                    └──────┬──────┘
       │                                                  │
       │ 1. wx.login() → code                            │
       ├─────────────────────────────────────────────────>
       │                                                  │
       │                    2. POST /api/v1/auth/wechat-login
       │                       { code }                   │
       │                                                  │
       │                                    3. Call WeChat API
       │                                       with code + secret
       │                                                  │
       │                                    4. Get openid + session_key
       │                                                  │
       │                                    5. Create/Get User
       │                                       Generate JWT token
       │                                                  │
       │ 6. Return { token, user }                       │
       <─────────────────────────────────────────────────┤
       │                                                  │
       │ 7. Store token in storage                       │
       │    Set Authorization header                     │
       │                                                  │

6.2 WeChat Payment Flow

┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ Mini Program│         │   Backend   │         │WeChat Server│
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                        │
       │ 1. Select subscription│                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │ 2. Create unified order│
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │ 3. Return prepay_id    │
       │                       <────────────────────────┤
       │                       │                        │
       │ 4. Return payment params                       │
       │    (prepay_id, signature, etc.)                │
       <───────────────────────┤                        │
       │                       │                        │
       │ 5. wx.requestPayment()│                        │
       ├───────────────────────┼───────────────────────>│
       │                       │                        │
       │                       │ 6. Payment notification│
       │                       <────────────────────────┤
       │                       │                        │
       │                       │ 7. Verify signature    │
       │                       │    Activate subscription
       │                       │    Create order record │
       │                       │                        │
       │                       │ 8. Return success      │
       │                       ├───────────────────────>│
       │                       │                        │
       │ 9. Payment result     │                        │
       <───────────────────────┤                        │
       │                       │                        │


6.3 AI Assistant Integration
@Service
public class AIService {
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.api.url}")
    private String apiUrl;
    
    private final RestTemplate restTemplate;
    private final UserService userService;
    
    public AIResponse chat(String userId, String message, String sessionId) {
        // Check user credits
        User user = userService.getUserById(userId);
        if (user.getCredits() <= 0) {
            throw new InsufficientCreditsException("积分不足");
        }
        
        // Deduct credits
        userService.deductCredits(userId, 1);
        
        // Call Gemini API
        GeminiRequest request = GeminiRequest.builder()
            .contents(List.of(
                Content.builder()
                    .parts(List.of(Part.builder().text(message).build()))
                    .build()
            ))
            .build();
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("x-goog-api-key", apiKey);
        
        HttpEntity<GeminiRequest> entity = new HttpEntity<>(request, headers);
        
        try {
            ResponseEntity<GeminiResponse> response = restTemplate.postForEntity(
                apiUrl,
                entity,
                GeminiResponse.class
            );
            
            String reply = response.getBody()
                .getCandidates()
                .get(0)
                .getContent()
                .getParts()
                .get(0)
                .getText();
            
            return AIResponse.builder()
                .reply(reply)
                .creditsRemaining(user.getCredits() - 1)
                .build();
                
        } catch (Exception e) {
            // Refund credits on error
            userService.addCredits(userId, 1);
            throw new AIServiceException("AI服务调用失败", e);
        }
    }
}


7. Deployment Architecture
7.1 Production Deployment

┌─────────────────────────────────────────────────────────────┐
│                         CDN (Static Assets)                  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                      Nginx (Load Balancer)                   │
│                    SSL Termination (HTTPS)                   │
└─────────────┬───────────────────────────┬───────────────────┘
              │                           │
    ┌─────────▼─────────┐       ┌────────▼────────┐
    │  Spring Boot App  │       │ Spring Boot App │
    │    (Instance 1)   │       │   (Instance 2)  │
    └─────────┬─────────┘       └────────┬────────┘
              │                           │
              └───────────┬───────────────┘
                          │
              ┌───────────▼───────────┐
              │   MySQL Master        │
              │   (Read/Write)        │
              └───────────┬───────────┘
                          │
              ┌───────────▼───────────┐
              │   MySQL Slave         │
              │   (Read Only)         │
              └───────────────────────┘
                          
┌─────────────────────────────────────────────────────────────┐
│                      Redis Cluster                           │
│                   (Cache + Session)                          │
└─────────────────────────────────────────────────────────────┘


7.2 Docker Configuration
Backend Dockerfile

FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/subscription-platform-*.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-Xms512m -Xmx2048m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]


docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: subscription_platform
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/subscription_platform
      SPRING_DATASOURCE_USERNAME: ${DB_USERNAME}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      SPRING_REDIS_HOST: redis
      JWT_SECRET: ${JWT_SECRET}
      WECHAT_APP_ID: ${WECHAT_APP_ID}
      WECHAT_APP_SECRET: ${WECHAT_APP_SECRET}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    depends_on:
      - mysql
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend

volumes:
  mysql_data:
  redis_data:


7.3 Application Configuration
application.yml
spring:
  application:
    name: subscription-platform
  
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
  
  redis:
    host: ${SPRING_REDIS_HOST:localhost}
    port: 6379
    timeout: 3000ms
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
  
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 10MB

jwt:
  secret: ${JWT_SECRET}
  expiration: 604800000  # 7 days

wechat:
  app-id: ${WECHAT_APP_ID}
  app-secret: ${WECHAT_APP_SECRET}
  mch-id: ${WECHAT_MCH_ID}
  api-key: ${WECHAT_API_KEY}

gemini:
  api:
    key: ${GEMINI_API_KEY}
    url: https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent

logging:
  level:
    root: INFO
    com.subscription.platform: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/application.log
    max-size: 10MB
    max-history: 30


8. Security Considerations
8.1 Authentication & Authorization
1、JWT Token Security
   ·Use strong secret key (256-bit minimum)
   ·Set appropriate expiration time (7 days)
   ·Implement token refresh mechanism
   ·Store tokens securely in client storage
2、Password Hashing (Admin accounts)
   ·Use BCrypt with work factor 12
   ·Salt passwords automatically

3、API Rate Limiting
@Configuration
public class RateLimitConfig {
    @Bean
    public RateLimiter rateLimiter() {
        return RateLimiter.create(100.0); // 100 requests per second
    }
}


8.2 Data Protection
1、Sensitive Data Encryption
   ·Encrypt payment information with AES-256
   ·Encrypt user personal data at rest
   ·Use HTTPS for all communications
2、SQL Injection Prevention
   ·Use JPA/Hibernate parameterized queries
   ·Validate all user inputs
   ·Sanitize HTML content
3、XSS Prevention
   ·Use Content Security Policy headers
   ·Escape user-generated content

8.3 CORS Configuration
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "https://miniprogram.domain.com",
                "https://admin.domain.com"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}


9. Performance Optimization
9.1 Database Optimization
1、Indexing Strategy
   ·Create indexes on frequently queried columns
   ·Use composite indexes for multi-column queries
   ·Monitor slow queries with MySQL slow query log
2、Query Optimization
   ·se pagination for large result sets
   ·Implement lazy loading for relationships
   ·Use database connection pooling (HikariCP)
3、Caching Strategy
   ·Cache frequently accessed data in Redis
   ·Implement cache invalidation on updates
   ·Use cache-aside pattern

9.2 API Optimization
1、Response Compression
server:
  compression:
    enabled: true
    mime-types: application/json,application/xml,text/html,text/xml,text/plain


2、Async Processing
@Async
public CompletableFuture<Void> sendNotification(String userId, String message) {
    // Async notification logic
    return CompletableFuture.completedFuture(null);
}

3、Database Connection Pooling
   ·Configure HikariCP for optimal performance
   ·Monitor connection pool metrics

9.3 Frontend Optimization
1、Mini Program
   ·Implement lazy loading for images
   ·Use pagination for article lists
   ·Cache API responses locally
   ·Minimize bundle size
2、Admin Panel
   ·Code splitting with React.lazy()
   ·Implement virtual scrolling for large lists
   ·Optimize bundle size with tree shaking

10. Monitoring & Logging
  10.1 Application Monitoring
    1、Health Check Endpoint
        @RestController
@RequestMapping("/actuator")
public class HealthController {
    @GetMapping("/health")
    public ResponseEntity<HealthStatus> health() {
        return ResponseEntity.ok(new HealthStatus("UP"));
    }
}

    2、Metrics Collection

   ·Use Spring Boot Actuator
   ·Monitor JVM metrics
   ·Track API response times
   ·Monitor database connection pool
  10.2 Logging Strategy
    1、Structured Logging
    @Slf4j
@Service
public class ArticleService {
    public Article createArticle(ArticleCreateRequest request) {
        log.info("Creating article: title={}, category={}", 
            request.getTitle(), request.getCategory());
        
        try {
            Article article = articleRepository.save(article);
            log.info("Article created successfully: id={}", article.getId());
            return article;
        } catch (Exception e) {
            log.error("Failed to create article: title={}", 
                request.getTitle(), e);
            throw e;
        }
    }
}


    2、Log Levels
        ·ERROR: System errors, exceptions
        ·WARN: Potential issues, deprecated usage
        ·INFO: Important business events
        ·DEBUG: Detailed debugging information
10.3 Error Tracking
    1、Global Exception Handler
    @RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
        ResourceNotFoundException ex
    ) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("INTERNAL_ERROR", "服务器错误"));
    }
}

11. Testing Strategy
11.1 Unit Testing

@SpringBootTest
class ArticleServiceTest {
    @Mock
    private ArticleRepository articleRepository;
    
    @InjectMocks
    private ArticleService articleService;
    
    @Test
    void testCreateArticle() {
        // Arrange
        ArticleCreateRequest request = new ArticleCreateRequest();
        request.setTitle("Test Article");
        request.setContent("Test Content");
        
        Article savedArticle = new Article();
        savedArticle.setId("test-id");
        
        when(articleRepository.save(any())).thenReturn(savedArticle);
        
        // Act
        Article result = articleService.createArticle(request);
        
        // Assert
        assertNotNull(result.getId());
        verify(articleRepository, times(1)).save(any());
    }
}


11.2 Integration Testing
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class ArticleControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testGetArticles() throws Exception {
        mockMvc.perform(get("/api/v1/articles")
                .param("page", "1")
                .param("pageSize", "20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.total").isNumber());
    }
}


11.3 E2E Testing
Use Selenium for admin panel testing
Use WeChat DevTools for mini program testing
Implement automated test suites for critical user flows
——————————————————————

12. Deployment Checklist
12.1 Pre-Deployment
 Run all unit tests
 Run integration tests
 Perform security audit
 Review database migrations
 Update environment variables
 Configure SSL certificates
 Set up monitoring and alerting
 Prepare rollback plan

12.2 Deployment Steps
Backup production database
Deploy database migrations
Deploy backend application
Deploy frontend applications
Run smoke tests
Monitor logs and metrics
Verify critical functionality

12.3 Post-Deployment
 Monitor error rates
 Check performance metrics
 Verify payment integration
 Test critical user flows
 Monitor database performance
 Review application logs
————————————————————
13. Maintenance & Support
13.1 Regular Maintenance
Weekly database backups
Monthly security updates
Quarterly performance reviews
Annual architecture reviews
13.2 Monitoring Alerts
API response time > 1 second
Error rate > 1%
Database connection pool > 80%
Disk usage > 85%
Memory usage > 90%
13.3 Incident Response
Detect issue via monitoring
Assess severity and impact
Implement fix or rollback
Verify resolution
Document incident and lessons learned