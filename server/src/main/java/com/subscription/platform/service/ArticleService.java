package com.subscription.platform.service;

import com.subscription.platform.dto.request.ArticleCreateRequest;
import com.subscription.platform.dto.request.ArticleUpdateRequest;
import com.subscription.platform.dto.response.ArticleResponse;
import com.subscription.platform.dto.response.PageResponse;
import com.subscription.platform.entity.*;
import com.subscription.platform.exception.BadRequestException;
import com.subscription.platform.exception.ResourceNotFoundException;
import com.subscription.platform.repository.*;
import com.subscription.platform.util.HtmlUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArticleService {

    private static final String VIEW_KEY_PREFIX = "article:views:";
    private static final String USER_VIEW_PREFIX = "article:viewed:";

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final FavoriteRepository favoriteRepository;
    private final UnlockedArticleRepository unlockedArticleRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final ViewTrackingService viewTrackingService;
    private final CategoryConfigRepository categoryConfigRepository;

    public List<ArticleResponse> getTopArticles(int limit, String userId) {
        List<Article> articles = articleRepository.findTopByViewCount(
            PageRequest.of(0, Math.min(limit, 20)));
        return articles.stream()
            .map(a -> toListResponse(a, userId))
            .collect(Collectors.toList());
    }

    public PageResponse<ArticleResponse> getArticles(String type, String category, String search,
                                                      Boolean subscribedOnly, int page, int pageSize,
                                                      String userId) {
        Pageable pageable = PageRequest.of(page - 1, Math.min(pageSize, 100),
            Sort.by(Sort.Direction.DESC, "isSticky").and(Sort.by(Sort.Direction.DESC, "date")));

        Page<Article> articlePage;
        if (Boolean.TRUE.equals(subscribedOnly) && userId != null) {
            List<String> unlockedIds = unlockedArticleRepository.findArticleIdsByUserId(userId);
            articlePage = articleRepository.findAccessibleArticles(
                emptyToNull(type), emptyToNull(category), emptyToNull(search), unlockedIds, pageable);
        } else {
            articlePage = articleRepository.findWithFilters(
                emptyToNull(type), emptyToNull(category), emptyToNull(search), null, pageable);
        }

        Page<ArticleResponse> responsePage = articlePage.map(a -> toListResponse(a, userId));
        return PageResponse.of(responsePage);
    }

    @Cacheable(value = "articles", key = "#articleId + '_' + #userId")
    public ArticleResponse getArticleById(String articleId, String userId) {
        log.debug("getArticleById: articleId={}, userId={}", articleId, userId);
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article", articleId));
        ArticleResponse response = toDetailResponse(article, userId, false);
        log.debug("getArticleById result: hasAccess={}", response.getHasAccess());
        return response;
    }

    public ArticleResponse getArticleByIdForAdmin(String articleId) {
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article", articleId));
        return toDetailResponse(article, null, true);
    }

    @Transactional
    @CacheEvict(value = {"articles", "articleList"}, allEntries = true)
    public ArticleResponse createArticle(ArticleCreateRequest request) {
        String sanitizedContent = HtmlUtil.sanitize(request.getContent());
        String summary = HtmlUtil.generateSummary(sanitizedContent, 100);
        int readTime = HtmlUtil.calculateReadTime(sanitizedContent);

        Article article = new Article();
        article.setTitle(request.getTitle());
        article.setContent(sanitizedContent);
        article.setSummary(summary);
        article.setCategory(request.getCategory());
        article.setType(request.getType());
        article.setIsPremium(Boolean.TRUE.equals(request.getIsPremium()));
        article.setIsSticky(Boolean.TRUE.equals(request.getIsSticky()));
        article.setReadTime(readTime);
        article.setDate(request.getDate() != null ? request.getDate() : LocalDate.now());
        article = articleRepository.save(article);
        return toDetailResponse(article, null, true);
    }

    @Transactional
    @CacheEvict(value = "articles", allEntries = true)
    public ArticleResponse updateArticle(String articleId, ArticleUpdateRequest request) {
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article", articleId));

        if (request.getTitle() != null) article.setTitle(request.getTitle());
        if (request.getContent() != null) {
            String sanitized = HtmlUtil.sanitize(request.getContent());
            article.setContent(sanitized);
            article.setSummary(HtmlUtil.generateSummary(sanitized, 100));
            article.setReadTime(HtmlUtil.calculateReadTime(sanitized));
        }
        if (request.getCategory() != null) article.setCategory(request.getCategory());
        if (request.getType() != null) article.setType(request.getType());
        if (request.getIsPremium() != null) article.setIsPremium(request.getIsPremium());
        if (request.getIsSticky() != null) article.setIsSticky(request.getIsSticky());
        if (request.getDate() != null) article.setDate(request.getDate());

        article = articleRepository.save(article);
        return toDetailResponse(article, null, true);
    }

    @Transactional
    @CacheEvict(value = "articles", allEntries = true)
    public void deleteArticle(String articleId) {
        if (!articleRepository.existsById(articleId)) {
            throw new ResourceNotFoundException("Article", articleId);
        }
        articleRepository.deleteById(articleId);
    }

    @Transactional
    public void batchDelete(List<String> ids) {
        if (ids.size() > 100) throw new BadRequestException("批量操作最多100条");
        ids.forEach(id -> {
            if (articleRepository.existsById(id)) articleRepository.deleteById(id);
        });
    }

    @Transactional
    public void batchUpdateCategory(List<String> ids, String category) {
        if (ids.size() > 100) throw new BadRequestException("批量操作最多100条");
        ids.forEach(id -> articleRepository.findById(id).ifPresent(a -> {
            a.setCategory(category);
            articleRepository.save(a);
        }));
    }

    @Transactional
    public void batchUpdateSticky(List<String> ids, boolean isSticky) {
        if (ids.size() > 100) throw new BadRequestException("批量操作最多100条");
        ids.forEach(id -> articleRepository.findById(id).ifPresent(a -> {
            a.setIsSticky(isSticky);
            articleRepository.save(a);
        }));
    }

    public void recordView(String articleId, String userId) {
        // Buffer view count in Redis — avoids per-request DB write under high concurrency
        stringRedisTemplate.opsForValue().increment(VIEW_KEY_PREFIX + articleId);

        // Deduplicate per user within 1 hour, then save read history asynchronously
        if (userId != null) {
            String dedupKey = USER_VIEW_PREFIX + userId + ":" + articleId;
            Boolean isFirst = stringRedisTemplate.opsForValue()
                .setIfAbsent(dedupKey, "1", Duration.ofHours(1));
            if (Boolean.TRUE.equals(isFirst)) {
                viewTrackingService.saveReadHistory(articleId, userId);
            }
        }
    }

    /** Flush buffered view counts from Redis to MySQL every 5 minutes */
    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void flushViewCounts() {
        Set<String> keys = stringRedisTemplate.keys(VIEW_KEY_PREFIX + "*");
        if (keys == null || keys.isEmpty()) return;
        log.debug("Flushing view counts for {} articles", keys.size());
        for (String key : keys) {
            String articleId = key.substring(VIEW_KEY_PREFIX.length());
            String raw = stringRedisTemplate.opsForValue().get(key);
            if (raw == null) continue;
            stringRedisTemplate.delete(key);
            long delta;
            try { delta = Long.parseLong(raw); } catch (NumberFormatException ignored) { continue; }
            if (delta <= 0) continue;
            try {
                articleRepository.incrementViewCountBy(articleId, (int) delta);
            } catch (Exception e) {
                // Return delta to Redis if DB update fails
                stringRedisTemplate.opsForValue().increment(key, delta);
                log.error("Failed to flush view count for article {}: {}", articleId, e.getMessage());
            }
        }
    }

    @Transactional
    @CacheEvict(value = "user", key = "#userId")
    public boolean toggleFavorite(String articleId, String userId) {
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article", articleId));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        FavoriteId favId = new FavoriteId(userId, articleId);
        if (favoriteRepository.existsById(favId)) {
            favoriteRepository.deleteById(favId);
            articleRepository.decrementFavoriteCount(articleId);
            return false;
        } else {
            Favorite fav = new Favorite();
            fav.setId(favId);
            fav.setUser(user);
            fav.setArticle(article);
            favoriteRepository.save(fav);
            articleRepository.incrementFavoriteCount(articleId);
            return true;
        }
    }

    @Transactional
    public boolean toggleLike(String articleId) {
        if (!articleRepository.existsById(articleId)) {
            throw new ResourceNotFoundException("Article", articleId);
        }
        articleRepository.incrementLikes(articleId);
        return true;
    }

    @Transactional
    public void unlockArticle(String articleId, String userId) {
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article", articleId));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        UnlockedArticleId id = new UnlockedArticleId(userId, articleId);
        if (!unlockedArticleRepository.existsById(id)) {
            UnlockedArticle unlocked = new UnlockedArticle();
            unlocked.setId(id);
            unlocked.setUser(user);
            unlocked.setArticle(article);
            unlockedArticleRepository.save(unlocked);
            articleRepository.findById(articleId).ifPresent(a -> {
                a.setShareCount(a.getShareCount() + 1);
                articleRepository.save(a);
            });
        }
    }

    public boolean canUserAccessArticle(String userId, String articleId) {
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article", articleId));

        log.debug("检查用户 {} 对文章 {} (分类: {}) 的访问权限", userId, articleId, article.getCategory());

        // 未登录用户无法访问任何文章
        if (userId == null) {
            log.debug("用户未登录，无访问权限");
            return false;
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.debug("用户不存在，无访问权限");
            return false;
        }

        // VIP会员可以访问所有文章（包括付费和免费）
        if (Boolean.TRUE.equals(user.getIsVip()) && user.getVipExpiry() != null
            && LocalDate.now().isBefore(user.getVipExpiry())) {
            log.debug("用户是VIP会员，有访问权限");
            return true;
        }

        // 检查是否订阅了该文章所属的分类（包括免费订阅和付费订阅）
        boolean hasSubscription = subscriptionRepository.hasActiveSubscription(userId, article.getCategory(), LocalDate.now());
        log.debug("检查分类订阅: category={}, hasSubscription={}", article.getCategory(), hasSubscription);
        if (hasSubscription) {
            log.debug("用户已订阅该分类，有访问权限");
            return true;
        }

        // 对于付费文章，检查是否单篇解锁
        if (Boolean.TRUE.equals(article.getIsPremium())) {
            boolean unlocked = unlockedArticleRepository.existsByIdUserIdAndIdArticleId(userId, articleId);
            log.debug("付费文章单篇解锁检查: unlocked={}", unlocked);
            return unlocked;
        }

        // 免费文章如果没有订阅该分类，也无法访问
        log.debug("用户未订阅该分类，无访问权限");
        return false;
    }

    private ArticleResponse toListResponse(Article article, String userId) {
        boolean isFavorited = userId != null && favoriteRepository.existsByIdUserIdAndIdArticleId(userId, article.getId());
        boolean hasAccess = canUserAccessArticle(userId, article.getId());
        String moduleType = getModuleTypeByCategory(article.getCategory());

        return ArticleResponse.builder()
            .id(article.getId())
            .title(article.getTitle())
            .summary(article.getSummary())
            .category(article.getCategory())
            .type(article.getType())
            .date(article.getDate())
            .isPremium(article.getIsPremium())
            .readTime(article.getReadTime())
            .viewCount(article.getViewCount())
            .favoriteCount(article.getFavoriteCount())
            .likes(article.getLikes())
            .isSticky(article.getIsSticky())
            .isFavorited(isFavorited)
            .hasAccess(hasAccess)
            .moduleType(moduleType)
            .build();
    }

    private ArticleResponse toDetailResponse(Article article, String userId, boolean skipAccessCheck) {
        boolean hasAccess = skipAccessCheck || (userId != null && canUserAccessArticle(userId, article.getId()));
        boolean isFavorited = userId != null && favoriteRepository.existsByIdUserIdAndIdArticleId(userId, article.getId());
        String moduleType = getModuleTypeByCategory(article.getCategory());

        return ArticleResponse.builder()
            .id(article.getId())
            .title(article.getTitle())
            .summary(article.getSummary())
            .content(hasAccess ? article.getContent() : null)
            .category(article.getCategory())
            .type(article.getType())
            .date(article.getDate())
            .isPremium(article.getIsPremium())
            .readTime(article.getReadTime())
            .viewCount(article.getViewCount())
            .favoriteCount(article.getFavoriteCount())
            .likes(article.getLikes())
            .shareCount(article.getShareCount())
            .isSticky(article.getIsSticky())
            .createdAt(article.getCreatedAt())
            .updatedAt(article.getUpdatedAt())
            .isFavorited(isFavorited)
            .hasAccess(hasAccess)
            .moduleType(moduleType)
            .build();
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private String getModuleTypeByCategory(String categoryName) {
        return categoryConfigRepository.findByName(categoryName)
            .map(CategoryConfig::getType)
            .orElse("industry"); // default to industry if category not found
    }
}
