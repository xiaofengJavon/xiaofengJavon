package com.subscription.platform.service;

import com.subscription.platform.dto.response.OrderResponse;
import com.subscription.platform.dto.response.PageResponse;
import com.subscription.platform.dto.response.PaymentResponse;
import com.subscription.platform.entity.Order;
import com.subscription.platform.exception.BadRequestException;
import com.subscription.platform.exception.ResourceNotFoundException;
import com.subscription.platform.exception.UnauthorizedException;
import com.subscription.platform.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentService paymentService;

    public PageResponse<OrderResponse> getOrders(String status, String type,
                                                  LocalDate dateFrom, LocalDate dateTo,
                                                  int page, int pageSize) {
        LocalDateTime dtFrom = dateFrom != null ? dateFrom.atStartOfDay() : null;
        LocalDateTime dtTo = dateTo != null ? dateTo.atTime(LocalTime.MAX) : null;

        PageRequest pageable = PageRequest.of(page - 1, Math.min(pageSize, 100),
            Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Order> orderPage = orderRepository.findWithFilters(
            emptyToNull(status), emptyToNull(type), dtFrom, dtTo, pageable);

        Page<OrderResponse> responsePage = orderPage.map(this::toResponse);
        return PageResponse.of(responsePage);
    }

    public List<OrderResponse> exportOrders(String status, String type,
                                             LocalDate dateFrom, LocalDate dateTo) {
        LocalDateTime dtFrom = dateFrom != null ? dateFrom.atStartOfDay() : null;
        LocalDateTime dtTo = dateTo != null ? dateTo.atTime(LocalTime.MAX) : null;

        return orderRepository.findAllWithFilters(
            emptyToNull(status), emptyToNull(type), dtFrom, dtTo
        ).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public OrderResponse getOrderById(String orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        return toResponse(order);
    }

    @Transactional
    public void cancelOrder(String orderId, String userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        // 验证订单所有权
        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("无权操作此订单");
        }

        // 只有待支付的订单可以取消
        if (!Order.STATUS_PENDING.equals(order.getStatus())) {
            throw new BadRequestException("只能取消待支付的订单");
        }

        order.setStatus(Order.STATUS_CANCELLED);
        orderRepository.save(order);
        log.info("订单已取消: orderId={}, userId={}", orderId, userId);
    }

    @Transactional
    public PaymentResponse continuePayment(String orderId, String userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        // 验证订单所有权
        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("无权操作此订单");
        }

        // 只有待支付的订单可以继续支付
        if (!Order.STATUS_PENDING.equals(order.getStatus())) {
            throw new BadRequestException("订单状态不正确，无法支付");
        }

        // 检查订单是否已有prepayId，如果有则重新生成
        try {
            return paymentService.createPayment(order);
        } catch (Exception e) {
            log.error("创建支付失败: orderId={}, error={}", orderId, e.getMessage());
            throw new BadRequestException("创建支付失败: " + e.getMessage());
        }
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
            .id(order.getId())
            .userId(order.getUser().getId())
            .wxOpenid(order.getUser().getWxOpenid())
            .type(order.getType())
            .item(order.getItem())
            .amount(order.getAmount())
            .status(order.getStatus())
            .createdAt(order.getCreatedAt())
            .build();
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
