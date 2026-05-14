package com.subscription.platform.service;

import com.subscription.platform.dto.response.SubscriptionManageResponse;
import com.subscription.platform.dto.response.SubscriptionResponse;
import com.subscription.platform.entity.CategoryConfig;
import com.subscription.platform.entity.Subscription;
import com.subscription.platform.entity.User;
import com.subscription.platform.exception.BadRequestException;
import com.subscription.platform.exception.ResourceNotFoundException;
import com.subscription.platform.repository.CategoryConfigRepository;
import com.subscription.platform.repository.SubscriptionRepository;
import com.subscription.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final CategoryConfigRepository categoryConfigRepository;
    private final CacheManager cacheManager;

    public List<SubscriptionResponse> getUserSubscriptions(String userId) {
        LocalDate today = LocalDate.now();
        return subscriptionRepository.findActiveSubscriptionsByUserId(userId, today).stream()
            .map(s -> SubscriptionResponse.builder()
                .id(s.getId())
                .category(s.getCategory())
                .expiryDate(s.getExpiryDate())
                .createdAt(s.getCreatedAt())
                .isActive(true)
                .build())
            .collect(Collectors.toList());
    }

    @Transactional
    public Subscription createOrUpdateSubscription(String userId, String category, String duration) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        int days = parseDurationToDays(duration);
        LocalDate today = LocalDate.now();

        Optional<Subscription> existing = subscriptionRepository.findByUserIdAndCategory(userId, category);
        Subscription subscription;

        if (existing.isPresent()) {
            subscription = existing.get();
            LocalDate baseDate = subscription.getExpiryDate().isBefore(today) ? today : subscription.getExpiryDate();
            subscription.setExpiryDate(baseDate.plusDays(days));
        } else {
            subscription = new Subscription();
            subscription.setUser(user);
            subscription.setCategory(category);
            subscription.setExpiryDate(today.plusDays(days));
        }

        subscription = subscriptionRepository.save(subscription);
        
        // 清除该用户的所有文章缓存
        clearUserArticleCache(userId);
        
        return subscription;
    }

    @Transactional
    public void activateVip(String userId, String duration) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        int days = parseDurationToDays(duration);
        LocalDate today = LocalDate.now();
        LocalDate newExpiry;

        if (Boolean.TRUE.equals(user.getIsVip()) && user.getVipExpiry() != null
            && user.getVipExpiry().isAfter(today)) {
            newExpiry = user.getVipExpiry().plusDays(days);
        } else {
            newExpiry = today.plusDays(days);
        }

        String tier = durationToTier(duration);
        user.setIsVip(true);
        user.setSubscriptionTier(tier);
        user.setVipExpiry(newExpiry);
        userRepository.save(user);
        
        // 清除该用户的所有文章缓存
        clearUserArticleCache(userId);
        
        log.info("VIP activated for user {}: tier={}, expiry={}", userId, tier, newExpiry);
    }

    public boolean hasActiveVip(String userId) {
        return userRepository.findById(userId)
            .map(u -> Boolean.TRUE.equals(u.getIsVip()) && u.getVipExpiry() != null
                && LocalDate.now().isBefore(u.getVipExpiry()))
            .orElse(false);
    }

    @Transactional
    public SubscriptionResponse freeSubscribe(String userId, String category) {
        log.debug("免费订阅请求: userId={}, category={}", userId, category);
        
        CategoryConfig cat = categoryConfigRepository.findByName(category)
            .orElseThrow(() -> new BadRequestException("分类不存在: " + category));

        if (cat.getPriceMonthly().compareTo(java.math.BigDecimal.ZERO) != 0) {
            throw new BadRequestException("该分类需要付费订阅");
        }

        Subscription sub = createOrUpdateSubscription(userId, category, "MONTHLY");
        log.debug("免费订阅成功: subscriptionId={}, expiryDate={}", sub.getId(), sub.getExpiryDate());
        
        return SubscriptionResponse.builder()
            .id(sub.getId())
            .category(sub.getCategory())
            .expiryDate(sub.getExpiryDate())
            .createdAt(sub.getCreatedAt())
            .isActive(true)
            .build();
    }

    public boolean hasActiveSubscription(String userId, String category) {
        boolean result = subscriptionRepository.hasActiveSubscription(userId, category, LocalDate.now());
        log.debug("hasActiveSubscription: userId={}, category={}, today={}, result={}", 
            userId, category, LocalDate.now(), result);
        
        // 额外查询订阅记录用于调试
        Optional<Subscription> sub = subscriptionRepository.findByUserIdAndCategory(userId, category);
        if (sub.isPresent()) {
            log.debug("找到订阅记录: id={}, expiryDate={}, isActive={}", 
                sub.get().getId(), sub.get().getExpiryDate(), 
                sub.get().getExpiryDate().isAfter(LocalDate.now()) || sub.get().getExpiryDate().equals(LocalDate.now()));
        } else {
            log.debug("未找到订阅记录");
        }
        
        return result;
    }

    private int parseDurationToDays(String duration) {
        return switch (duration.toUpperCase()) {
            case "MONTHLY" -> 30;
            case "QUARTERLY" -> 90;
            case "YEARLY" -> 365;
            default -> throw new BadRequestException("无效的订阅时长: " + duration);
        };
    }

    private String durationToTier(String duration) {
        return switch (duration.toUpperCase()) {
            case "MONTHLY" -> "MONTHLY";
            case "QUARTERLY" -> "QUARTERLY";
            case "YEARLY" -> "YEARLY";
            default -> "NONE";
        };
    }

    // ========== 管理员功能 ==========

    public Page<SubscriptionManageResponse> getAllSubscriptions(String search, String category, 
                                                                 Boolean activeOnly, Pageable pageable) {
        LocalDate today = LocalDate.now();
        Page<Subscription> subscriptions = subscriptionRepository.findAll(pageable);
        
        return subscriptions.map(s -> toManageResponse(s, today));
    }

    @Transactional
    public SubscriptionManageResponse extendSubscription(String subscriptionId, int days) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription", subscriptionId));
        
        LocalDate today = LocalDate.now();
        LocalDate baseDate = subscription.getExpiryDate().isBefore(today) ? today : subscription.getExpiryDate();
        subscription.setExpiryDate(baseDate.plusDays(days));
        
        subscription = subscriptionRepository.save(subscription);
        log.info("订阅已延长: subscriptionId={}, newExpiryDate={}", subscriptionId, subscription.getExpiryDate());
        
        return toManageResponse(subscription, today);
    }

    @Transactional
    public void cancelSubscription(String subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription", subscriptionId));
        
        subscription.setExpiryDate(LocalDate.now().minusDays(1));
        subscriptionRepository.save(subscription);
        log.info("订阅已取消: subscriptionId={}", subscriptionId);
    }

    @Transactional
    public void deleteSubscription(String subscriptionId) {
        if (!subscriptionRepository.existsById(subscriptionId)) {
            throw new ResourceNotFoundException("Subscription", subscriptionId);
        }
        subscriptionRepository.deleteById(subscriptionId);
        log.info("订阅已删除: subscriptionId={}", subscriptionId);
    }

    private SubscriptionManageResponse toManageResponse(Subscription subscription, LocalDate today) {
        User user = subscription.getUser();
        boolean isActive = subscription.getExpiryDate().isAfter(today) || subscription.getExpiryDate().equals(today);
        long daysRemaining = isActive ? ChronoUnit.DAYS.between(today, subscription.getExpiryDate()) + 1 : 0;
        
        return SubscriptionManageResponse.builder()
            .id(subscription.getId())
            .userId(user.getId())
            .userNickname(user.getNickname())
            .userPhone(user.getPhone())
            .category(subscription.getCategory())
            .expiryDate(subscription.getExpiryDate())
            .createdAt(subscription.getCreatedAt())
            .isActive(isActive)
            .daysRemaining((int) daysRemaining)
            .build();
    }
    
    /**
     * 清除用户的所有文章缓存
     * 当用户订阅状态改变时调用
     */
    private void clearUserArticleCache(String userId) {
        try {
            // 清除文章缓存
            var articlesCache = cacheManager.getCache("articles");
            if (articlesCache != null) {
                articlesCache.clear();
                log.debug("已清除文章缓存（用户订阅状态变更）: userId={}", userId);
            }
            
            // 清除用户信息缓存
            var userCache = cacheManager.getCache("user");
            if (userCache != null) {
                userCache.evict(userId);
                log.debug("已清除用户缓存: userId={}", userId);
            }
        } catch (Exception e) {
            log.warn("清除缓存失败: userId={}, error={}", userId, e.getMessage());
        }
    }
}
