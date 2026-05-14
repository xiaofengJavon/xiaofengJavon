package com.subscription.platform.controller;

import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.dto.response.PaymentResponse;
import com.subscription.platform.exception.BadRequestException;
import com.subscription.platform.exception.UnauthorizedException;
import com.subscription.platform.service.OrderService;
import com.subscription.platform.util.SecurityContextUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "订单", description = "订单管理相关接口")
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "取消订单")
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(@PathVariable String orderId) {
        String userId = getCurrentUserId();
        orderService.cancelOrder(orderId, userId);
        return ResponseEntity.ok(ApiResponse.ok("订单已取消", null));
    }

    @Operation(summary = "继续支付订单")
    @PostMapping("/{orderId}/pay")
    public ResponseEntity<ApiResponse<PaymentResponse>> continuePayment(@PathVariable String orderId) {
        String userId = getCurrentUserId();
        PaymentResponse paymentParams = orderService.continuePayment(orderId, userId);
        return ResponseEntity.ok(ApiResponse.ok(paymentParams));
    }

    private String getCurrentUserId() {
        String userId = SecurityContextUtil.getCurrentUserId();
        if (userId == null) throw new UnauthorizedException("未登录");
        return userId;
    }
}
