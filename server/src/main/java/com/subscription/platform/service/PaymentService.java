package com.subscription.platform.service;

import com.github.binarywang.wxpay.bean.notify.WxPayOrderNotifyResult;
import com.github.binarywang.wxpay.bean.order.WxPayMpOrderResult;
import com.github.binarywang.wxpay.bean.request.WxPayUnifiedOrderRequest;
import com.github.binarywang.wxpay.constant.WxPayConstants;
import com.github.binarywang.wxpay.exception.WxPayException;
import com.github.binarywang.wxpay.service.WxPayService;
import com.subscription.platform.dto.request.SubscriptionRequest;
import com.subscription.platform.dto.response.PaymentResponse;
import com.subscription.platform.entity.CategoryConfig;
import com.subscription.platform.entity.Order;
import com.subscription.platform.entity.User;
import com.subscription.platform.exception.BadRequestException;
import com.subscription.platform.exception.PaymentException;
import com.subscription.platform.exception.ResourceNotFoundException;
import com.subscription.platform.repository.CategoryConfigRepository;
import com.subscription.platform.repository.OrderRepository;
import com.subscription.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final BigDecimal VIP_MONTHLY_PRICE = new BigDecimal("29.00");
    private static final BigDecimal VIP_QUARTERLY_PRICE = new BigDecimal("78.00");
    private static final BigDecimal VIP_YEARLY_PRICE = new BigDecimal("268.00");

    private final WxPayService wxPayService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CategoryConfigRepository categoryConfigRepository;
    private final SubscriptionService subscriptionService;

    @Transactional
    public PaymentResponse createVipOrder(String userId, SubscriptionRequest request, String clientIp) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        BigDecimal amount = getVipPrice(request.getDuration());
        String description = "VIP订阅-" + request.getDuration();

        Order order = new Order();
        order.setUser(user);
        order.setType("VIP");
        order.setItem(request.getDuration());
        order.setAmount(amount);
        order.setStatus("PENDING");
        order = orderRepository.save(order);

        return buildPaymentResponse(order, description, amount, clientIp);
    }

    @Transactional
    public PaymentResponse createCategoryOrder(String userId, SubscriptionRequest request, String clientIp) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        CategoryConfig cat = categoryConfigRepository.findByName(request.getCategory())
            .orElseThrow(() -> new BadRequestException("分类不存在: " + request.getCategory()));

        BigDecimal amount = getCategoryPrice(cat, request.getDuration());
        String description = request.getCategory() + "订阅-" + request.getDuration();

        Order order = new Order();
        order.setUser(user);
        order.setType("CATEGORY");
        order.setItem(request.getCategory() + "_" + request.getDuration());
        order.setAmount(amount);
        order.setStatus("PENDING");
        order = orderRepository.save(order);

        return buildPaymentResponse(order, description, amount, clientIp);
    }

    @Transactional
    public PaymentResponse createTestOrder(String userId, String clientIp) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        BigDecimal amount = new BigDecimal("0.01");

        Order order = new Order();
        order.setUser(user);
        order.setType("TEST");
        order.setItem("TEST_PAYMENT");
        order.setAmount(amount);
        order.setStatus("PENDING");
        order = orderRepository.save(order);

        return buildPaymentResponse(order, "测试支付", amount, clientIp);
    }

    @Transactional
    public void handlePaymentCallback(WxPayOrderNotifyResult result) {
        String raw = result.getOutTradeNo();
        String outTradeNo = (raw != null && raw.length() == 32)
            ? raw.replaceAll("(\\w{8})(\\w{4})(\\w{4})(\\w{4})(\\w{12})", "$1-$2-$3-$4-$5")
            : raw;
        Order order = orderRepository.findById(outTradeNo)
            .orElseGet(() -> {
                log.warn("Order not found for outTradeNo: {}", outTradeNo);
                return null;
            });

        if (order == null) return;

        if ("SUCCESS".equals(result.getResultCode())) {
            order.setStatus("PAID");
            order.setWechatTransactionId(result.getTransactionId());
            orderRepository.save(order);
            activateSubscription(order);
            log.info("Payment successful for order: {}", order.getId());
        } else {
            order.setStatus("FAILED");
            orderRepository.save(order);
            log.warn("Payment failed for order: {}, reason: {}", order.getId(), result.getErrCodeDes());
        }
    }

    private void activateSubscription(Order order) {
        String userId = order.getUser().getId();
        if ("VIP".equals(order.getType())) {
            subscriptionService.activateVip(userId, order.getItem());
        } else if ("CATEGORY".equals(order.getType())) {
            String[] parts = order.getItem().split("_", 2);
            if (parts.length == 2) {
                subscriptionService.createOrUpdateSubscription(userId, parts[0], parts[1]);
            }
        }
    }

    @Transactional
    public PaymentResponse createPayment(Order order) {
        // 为已存在的订单重新创建支付
        String description = order.getType().equals("VIP") 
            ? "VIP订阅-" + order.getItem()
            : order.getItem().split("_")[0] + "订阅";
        
        // 使用默认IP（实际应该从请求中获取）
        String clientIp = "127.0.0.1";
        
        return buildPaymentResponse(order, description, order.getAmount(), clientIp);
    }

    private PaymentResponse buildPaymentResponse(Order order, String description, BigDecimal amount, String clientIp) {
        try {
            WxPayUnifiedOrderRequest unifiedOrderRequest = WxPayUnifiedOrderRequest.newBuilder()
                .body(description)
                .outTradeNo(order.getId().replace("-", ""))
                .totalFee(amount.multiply(BigDecimal.valueOf(100)).intValue())
                .tradeType(WxPayConstants.TradeType.JSAPI)
                .openid(order.getUser().getWxOpenid())
                .spbillCreateIp(clientIp)
                .build();

            WxPayMpOrderResult result = wxPayService.createOrder(unifiedOrderRequest);
            order.setWechatPrepayId(result.getPackageValue());
            orderRepository.save(order);

            return PaymentResponse.builder()
                .orderId(order.getId())
                .prepayId(result.getPackageValue())
                .timestamp(result.getTimeStamp())
                .nonceStr(result.getNonceStr())
                .packageValue(result.getPackageValue())
                .signType(result.getSignType())
                .paySign(result.getPaySign())
                .appId(result.getAppId())
                .build();
        } catch (WxPayException e) {
            order.setStatus("FAILED");
            orderRepository.save(order);
            log.error("Failed to create WeChat payment order: {}", e.getMessage());
            throw new PaymentException("创建支付订单失败: " + e.getMessage(), e);
        }
    }

    private BigDecimal getVipPrice(String duration) {
        return switch (duration.toUpperCase()) {
            case "MONTHLY" -> VIP_MONTHLY_PRICE;
            case "QUARTERLY" -> VIP_QUARTERLY_PRICE;
            case "YEARLY" -> VIP_YEARLY_PRICE;
            default -> throw new BadRequestException("无效的订阅时长: " + duration);
        };
    }

    private BigDecimal getCategoryPrice(CategoryConfig cat, String duration) {
        return switch (duration.toUpperCase()) {
            case "MONTHLY" -> cat.getPriceMonthly();
            case "QUARTERLY" -> cat.getPriceQuarterly();
            case "YEARLY" -> cat.getPriceYearly();
            default -> throw new BadRequestException("无效的订阅时长: " + duration);
        };
    }
}
