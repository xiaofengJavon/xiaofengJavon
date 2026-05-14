package com.subscription.platform.controller;

import com.github.binarywang.wxpay.bean.notify.WxPayOrderNotifyResult;
import com.github.binarywang.wxpay.exception.WxPayException;
import com.github.binarywang.wxpay.service.WxPayService;
import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.dto.response.OrderResponse;
import com.subscription.platform.service.OrderService;
import com.subscription.platform.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Tag(name = "支付", description = "微信支付相关接口")
@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;
    private final WxPayService wxPayService;

    @Operation(summary = "微信支付回调（供微信服务器调用）")
    @PostMapping("/callback")
    public ResponseEntity<String> paymentCallback(@RequestBody String xmlData) {
        try {
            WxPayOrderNotifyResult result = wxPayService.parseOrderNotifyResult(xmlData);
            paymentService.handlePaymentCallback(result);
            return ResponseEntity.ok("<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>");
        } catch (WxPayException e) {
            log.error("Payment callback error: {}", e.getMessage());
            return ResponseEntity.ok("<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[ERROR]]></return_msg></xml>");
        }
    }

    @Operation(summary = "查询订单状态")
    @GetMapping("/query/{orderId}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<OrderResponse>> queryOrder(@PathVariable String orderId) {
        OrderResponse response = orderService.getOrderById(orderId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
