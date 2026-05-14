package com.subscription.platform.controller;

import com.subscription.platform.dto.request.RedeemCodeRequest;
import cn.binarywang.wx.miniapp.api.WxMaService;
import cn.binarywang.wx.miniapp.bean.WxMaPhoneNumberInfo;
import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.dto.response.ArticleResponse;
import com.subscription.platform.dto.response.OrderResponse;
import com.subscription.platform.dto.response.PageResponse;
import com.subscription.platform.dto.response.UserResponse;
import com.subscription.platform.entity.Favorite;
import com.subscription.platform.entity.Order;
import com.subscription.platform.entity.ReadArticle;
import com.subscription.platform.exception.UnauthorizedException;
import com.subscription.platform.repository.ArticleRepository;
import com.subscription.platform.repository.FavoriteRepository;
import com.subscription.platform.repository.OrderRepository;
import com.subscription.platform.repository.ReadArticleRepository;
import com.subscription.platform.service.ArticleService;
import com.subscription.platform.service.ReferralService;
import com.subscription.platform.service.UserService;
import com.subscription.platform.util.SecurityContextUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tag(name = "用户", description = "用户资料相关接口")
@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;
    private final ReferralService referralService;
    private final FavoriteRepository favoriteRepository;
    private final OrderRepository orderRepository;
    private final ReadArticleRepository readArticleRepository;
    private final ArticleService articleService;
    private final WxMaService wxMaService;

    @Operation(summary = "获取当前用户资料")
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        String userId = getCurrentUserId();
        UserResponse response = userService.getUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "更新用户昵称和头像")
    @PutMapping("/update-profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestBody Map<String, String> body) {
        String userId = getCurrentUserId();
        UserResponse updated = userService.updateProfile(userId, body.get("nickname"), body.get("avatarUrl"));
        return ResponseEntity.ok(ApiResponse.ok(updated));
    }

    @Operation(summary = "绑定手机号（通过微信授权code）")
    @PostMapping("/update-phone")
    public ResponseEntity<ApiResponse<UserResponse>> updatePhone(
            @RequestBody Map<String, String> body) {
        String userId = getCurrentUserId();
        String code = body.get("code");
        try {
            WxMaPhoneNumberInfo phoneInfo = wxMaService.getUserService().getPhoneNoInfo(code);
            UserResponse updated = userService.updatePhone(userId, phoneInfo.getPhoneNumber());
            return ResponseEntity.ok(ApiResponse.ok(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("PHONE_ERROR", "获取手机号失败: " + e.getMessage()));
        }
    }

    @Operation(summary = "使用邀请码（首次注册时使用）")
    @PostMapping("/redeem-code")
    public ResponseEntity<ApiResponse<Map<String, Object>>> redeemCode(
            @Valid @RequestBody RedeemCodeRequest request) {
        String userId = getCurrentUserId();
        try {
            referralService.processReferral(userId, request.getCode());
            return ResponseEntity.ok(ApiResponse.ok("邀请码使用成功",
                Map.of("success", true, "message", "邀请码使用成功，推荐人已获得积分奖励")));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.ok("邀请码处理失败",
                Map.of("success", false, "message", e.getMessage())));
        }
    }

    @Operation(summary = "获取用户收藏的文章列表")
    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<PageResponse<ArticleResponse>>> getFavorites(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        String userId = getCurrentUserId();
        PageRequest pageable = PageRequest.of(page - 1, Math.min(pageSize, 50),
            Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Favorite> favPage = favoriteRepository.findByUserId(userId, pageable);
        List<ArticleResponse> articles = favPage.getContent().stream()
            .map(f -> articleService.getArticleById(f.getId().getArticleId(), userId))
            .collect(Collectors.toList());
        PageResponse<ArticleResponse> response = PageResponse.<ArticleResponse>builder()
            .data(articles)
            .total(favPage.getTotalElements())
            .page(page)
            .pageSize(pageSize)
            .totalPages(favPage.getTotalPages())
            .build();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "获取用户订单列表")
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        String userId = getCurrentUserId();
        PageRequest pageable = PageRequest.of(page - 1, Math.min(pageSize, 50),
            Sort.by(Sort.Direction.DESC, "createdAt"));
        
        // 解析日期参数
        java.time.LocalDateTime dateFrom = null;
        java.time.LocalDateTime dateTo = null;
        if (startDate != null && !startDate.isEmpty()) {
            try {
                dateFrom = java.time.LocalDate.parse(startDate).atStartOfDay();
            } catch (Exception e) {
                // 忽略解析错误
            }
        }
        if (endDate != null && !endDate.isEmpty()) {
            try {
                dateTo = java.time.LocalDate.parse(endDate).atTime(23, 59, 59);
            } catch (Exception e) {
                // 忽略解析错误
            }
        }
        
        Page<Order> orderPage = orderRepository.findByUserIdWithFilters(
            userId, status, search, dateFrom, dateTo, pageable);
        List<OrderResponse> orders = orderPage.getContent().stream()
            .map(o -> OrderResponse.builder()
                .id(o.getId())
                .type(o.getType())
                .item(o.getItem())
                .amount(o.getAmount())
                .status(o.getStatus())
                .createdAt(o.getCreatedAt())
                .build())
            .collect(Collectors.toList());
        PageResponse<OrderResponse> response = PageResponse.<OrderResponse>builder()
            .data(orders)
            .total(orderPage.getTotalElements())
            .page(page)
            .pageSize(pageSize)
            .totalPages(orderPage.getTotalPages())
            .build();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "获取用户浏览历史")
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PageResponse<ArticleResponse>>> getHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        String userId = getCurrentUserId();
        PageRequest pageable = PageRequest.of(page - 1, Math.min(pageSize, 50),
            Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ReadArticle> histPage = readArticleRepository.findByUserId(userId, pageable);
        List<ArticleResponse> articles = histPage.getContent().stream()
            .map(ra -> articleService.getArticleById(ra.getId().getArticleId(), userId))
            .collect(Collectors.toList());
        PageResponse<ArticleResponse> response = PageResponse.<ArticleResponse>builder()
            .data(articles)
            .total(histPage.getTotalElements())
            .page(page)
            .pageSize(pageSize)
            .totalPages(histPage.getTotalPages())
            .build();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    private String getCurrentUserId() {
        String userId = SecurityContextUtil.getCurrentUserId();
        if (userId == null) throw new UnauthorizedException("未登录");
        return userId;
    }
}
