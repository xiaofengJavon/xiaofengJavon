package com.subscription.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "`order`", indexes = {
    @Index(name = "idx_order_user_id", columnList = "user_id"),
    @Index(name = "idx_order_status", columnList = "status"),
    @Index(name = "idx_order_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    // 订单状态常量
    public static final String STATUS_PENDING = "PENDING";   // 待支付
    public static final String STATUS_PAID = "PAID";         // 已支付
    public static final String STATUS_FAILED = "FAILED";     // 支付失败
    public static final String STATUS_REFUNDED = "REFUNDED"; // 已退款
    public static final String STATUS_CANCELLED = "CANCELLED"; // 已取消

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_order_user"))
    private User user;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false, length = 50)
    private String item;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "wechat_prepay_id", length = 100)
    private String wechatPrepayId;

    @Column(name = "wechat_transaction_id", length = 100)
    private String wechatTransactionId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
    }
}
