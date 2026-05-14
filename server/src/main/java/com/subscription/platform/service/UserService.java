package com.subscription.platform.service;

import com.subscription.platform.dto.request.UserAdminUpdateRequest;
import com.subscription.platform.dto.response.SubscriptionResponse;
import com.subscription.platform.dto.response.UserResponse;
import com.subscription.platform.entity.Subscription;
import com.subscription.platform.entity.User;
import com.subscription.platform.exception.ResourceNotFoundException;
import com.subscription.platform.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ReadArticleRepository readArticleRepository;
    private final FavoriteRepository favoriteRepository;
    private final UnlockedArticleRepository unlockedArticleRepository;

    @Cacheable(value = "user", key = "#userId")
    public UserResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return buildFullUserResponse(user);
    }

    public User getUserById(String userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    @Transactional
    @CacheEvict(value = "user", key = "#userId")
    public UserResponse adminUpdateUser(String userId, UserAdminUpdateRequest request) {
        User user = getUserById(userId);

        if (request.getIsVip() != null) {
            user.setIsVip(request.getIsVip());
            if (!request.getIsVip()) {
                user.setSubscriptionTier("NONE");
                user.setVipExpiry(null);
            }
        }
        if (request.getSubscriptionTier() != null) {
            user.setSubscriptionTier(request.getSubscriptionTier());
        }
        if (request.getVipExpiry() != null) {
            user.setVipExpiry(request.getVipExpiry());
        }
        if (request.getCredits() != null) {
            user.setCredits(request.getCredits());
        }
        if (request.getCreditsAdjustment() != null) {
            int newCredits = Math.max(0, user.getCredits() + request.getCreditsAdjustment());
            user.setCredits(newCredits);
        }

        user = userRepository.save(user);
        return buildFullUserResponse(user);
    }

    @Transactional
    @CacheEvict(value = "user", key = "#userId")
    public UserResponse updateProfile(String userId, String nickname, String avatarUrl) {
        User user = getUserById(userId);
        if (nickname != null && !nickname.isBlank()) user.setNickname(nickname);
        if (avatarUrl != null && !avatarUrl.isBlank()) user.setAvatarUrl(avatarUrl);
        user = userRepository.save(user);
        return buildFullUserResponse(user);
    }

    @Transactional
    @CacheEvict(value = "user", key = "#userId")
    public UserResponse updatePhone(String userId, String phone) {
        User user = getUserById(userId);
        user.setPhone(phone);
        user = userRepository.save(user);
        return buildFullUserResponse(user);
    }

    @Transactional
    public void addCredits(String userId, int amount) {
        userRepository.addCredits(userId, amount);
    }

    @Transactional
    public boolean deductCredits(String userId, int amount) {
        int updated = userRepository.deductCredits(userId, amount);
        return updated > 0;
    }

    @Transactional
    @CacheEvict(value = "user", key = "#userId")
    public void updateVipStatus(String userId, boolean isVip, String tier, LocalDate expiry) {
        User user = getUserById(userId);
        user.setIsVip(isVip);
        user.setSubscriptionTier(tier);
        user.setVipExpiry(expiry);
        userRepository.save(user);
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void checkAndExpireSubscriptions() {
        log.info("Running subscription expiry check...");
        LocalDate today = LocalDate.now();
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (Boolean.TRUE.equals(user.getIsVip()) && user.getVipExpiry() != null
                && !today.isBefore(user.getVipExpiry())) {
                user.setIsVip(false);
                user.setSubscriptionTier("NONE");
                userRepository.save(user);
                log.info("VIP expired for user: {}", user.getId());
            }
        }
    }

    private UserResponse buildFullUserResponse(User user) {
        LocalDate today = LocalDate.now();
        List<Subscription> activeSubs = subscriptionRepository.findActiveSubscriptionsByUserId(user.getId(), today);

        List<SubscriptionResponse> subResponses = activeSubs.stream()
            .map(s -> SubscriptionResponse.builder()
                .id(s.getId())
                .category(s.getCategory())
                .expiryDate(s.getExpiryDate())
                .createdAt(s.getCreatedAt())
                .isActive(true)
                .build())
            .collect(Collectors.toList());

        long readCount = readArticleRepository.countByIdUserId(user.getId());
        long favCount = favoriteRepository.countByIdUserId(user.getId());
        long unlockedCount = unlockedArticleRepository.countByIdUserId(user.getId());

        return UserResponse.builder()
            .id(user.getId())
            .wxOpenid(user.getWxOpenid())
            .nickname(user.getNickname())
            .avatarUrl(user.getAvatarUrl())
            .phone(user.getPhone())
            .isVip(user.getIsVip())
            .subscriptionTier(user.getSubscriptionTier())
            .credits(user.getCredits())
            .inviteCode(user.getInviteCode())
            .invitedCount(user.getInvitedCount())
            .vipExpiry(user.getVipExpiry())
            .createdAt(user.getCreatedAt())
            .activeSubscriptions(subResponses)
            .readCount(Math.min(readCount, 10000))
            .favoriteCount(Math.min(favCount, 10000))
            .unlockedCount(Math.min(unlockedCount, 10000))
            .build();
    }
}
