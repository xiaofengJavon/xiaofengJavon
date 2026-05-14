package com.subscription.platform.controller;

import com.subscription.platform.dto.request.FreeSubscribeRequest;
import com.subscription.platform.dto.request.SubscriptionRequest;
import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.dto.response.PaymentResponse;
import com.subscription.platform.dto.response.SubscriptionResponse;
import com.subscription.platform.exception.UnauthorizedException;
import com.subscription.platform.service.PaymentService;
import com.subscription.platform.service.SubscriptionService;
import com.subscription.platform.util.SecurityContextUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "订阅", description = "订阅管理相关接口")
@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final PaymentService paymentService;
    private final HttpServletRequest httpRequest;

    @Operation(summary = "获取用户有效订阅列表")
    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionResponse>>> getSubscriptions() {
        String userId = getCurrentUserId();
        List<SubscriptionResponse> response = subscriptionService.getUserSubscriptions(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "发起VIP订阅支付")
    @PostMapping("/vip")
    public ResponseEntity<ApiResponse<PaymentResponse>> subscribeVip(
            @Valid @RequestBody SubscriptionRequest request) {
        String userId = getCurrentUserId();
        PaymentResponse response = paymentService.createVipOrder(userId, request, getClientIp());
        return ResponseEntity.ok(ApiResponse.ok("支付订单创建成功", response));
    }

    @Operation(summary = "免费分类订阅（仅适用于price=0的分类）")
    @PostMapping("/free")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> freeSubscribe(
            @RequestBody FreeSubscribeRequest request) {
        String userId = getCurrentUserId();
        SubscriptionResponse response = subscriptionService.freeSubscribe(userId, request.getCategory());
        return ResponseEntity.ok(ApiResponse.ok("订阅成功", response));
    }

    @Operation(summary = "测试支付（¥0.01，仅用于开发测试）")
    @PostMapping("/test")
    public ResponseEntity<ApiResponse<PaymentResponse>> testPay() {
        String userId = getCurrentUserId();
        PaymentResponse response = paymentService.createTestOrder(userId, getClientIp());
        return ResponseEntity.ok(ApiResponse.ok("测试订单创建成功", response));
    }

    @Operation(summary = "发起分类订阅支付")
    @PostMapping("/category")
    public ResponseEntity<ApiResponse<PaymentResponse>> subscribeCategory(
            @Valid @RequestBody SubscriptionRequest request) {
        String userId = getCurrentUserId();
        PaymentResponse response = paymentService.createCategoryOrder(userId, request, getClientIp());
        return ResponseEntity.ok(ApiResponse.ok("支付订单创建成功", response));
    }

    private String getCurrentUserId() {
        String userId = SecurityContextUtil.getCurrentUserId();
        if (userId == null) throw new UnauthorizedException("未登录");
        return userId;
    }

    private String getClientIp() {
        String ip = httpRequest.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = httpRequest.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = httpRequest.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return (ip != null && !ip.isBlank()) ? ip : "127.0.0.1";
    }
}
