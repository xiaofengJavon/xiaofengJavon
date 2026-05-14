package com.subscription.platform.service;

import cn.binarywang.wx.miniapp.api.WxMaService;
import cn.binarywang.wx.miniapp.bean.WxMaJscode2SessionResult;
import com.subscription.platform.dto.request.AdminLoginRequest;
import com.subscription.platform.dto.request.WechatLoginRequest;
import com.subscription.platform.dto.response.LoginResponse;
import com.subscription.platform.dto.response.UserResponse;
import com.subscription.platform.entity.AdminUser;
import com.subscription.platform.entity.User;
import com.subscription.platform.exception.BadRequestException;
import com.subscription.platform.exception.UnauthorizedException;
import com.subscription.platform.repository.AdminUserRepository;
import com.subscription.platform.repository.UserRepository;
import com.subscription.platform.security.JwtTokenProvider;
import com.subscription.platform.util.InviteCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final WxMaService wxMaService;
    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final ReferralService referralService;

    @Transactional
    public LoginResponse wechatLogin(WechatLoginRequest request) {
        String openid;
        try {
            WxMaJscode2SessionResult session = wxMaService.getUserService().getSessionInfo(request.getCode());
            openid = session.getOpenid();
        } catch (Exception e) {
            log.error("WeChat login failed: {}", e.getMessage());
            throw new UnauthorizedException("微信登录失败: " + e.getMessage());
        }

        User user = userRepository.findByWxOpenid(openid).orElseGet(() -> createUser(openid, request.getInviteCode()));

        String token = jwtTokenProvider.generateToken(user.getId(), user.getWxOpenid(), Boolean.TRUE.equals(user.getIsVip()), "USER");
        UserResponse userResponse = buildUserResponse(user);

        return LoginResponse.builder().token(token).user(userResponse).build();
    }

    @Transactional
    public LoginResponse adminLogin(AdminLoginRequest request) {
        AdminUser admin = adminUserRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new UnauthorizedException("用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new UnauthorizedException("用户名或密码错误");
        }

        String token = jwtTokenProvider.generateToken(admin.getId(), admin.getUsername(), false, "ADMIN");
        return LoginResponse.builder()
            .token(token)
            .user(UserResponse.builder()
                .id(admin.getId())
                .wxOpenid(admin.getUsername())
                .build())
            .build();
    }

    private User createUser(String openid, String inviteCode) {
        User user = new User();
        user.setWxOpenid(openid);
        user.setIsVip(false);
        user.setSubscriptionTier("NONE");
        user.setCredits(10);
        user.setInvitedCount(0);
        user.setInviteCode(generateUniqueInviteCode());
        user = userRepository.save(user);

        if (inviteCode != null && !inviteCode.isBlank()) {
            try {
                referralService.processReferral(user.getId(), inviteCode);
            } catch (Exception e) {
                log.warn("Referral processing failed for user {}: {}", user.getId(), e.getMessage());
            }
        }
        return user;
    }

    private String generateUniqueInviteCode() {
        String code;
        int attempts = 0;
        do {
            code = InviteCodeGenerator.generate();
            attempts++;
            if (attempts > 20) throw new RuntimeException("无法生成唯一邀请码");
        } while (userRepository.existsByInviteCode(code));
        return code;
    }

    private UserResponse buildUserResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .wxOpenid(user.getWxOpenid())
            .isVip(user.getIsVip())
            .subscriptionTier(user.getSubscriptionTier())
            .credits(user.getCredits())
            .inviteCode(user.getInviteCode())
            .invitedCount(user.getInvitedCount())
            .vipExpiry(user.getVipExpiry())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
