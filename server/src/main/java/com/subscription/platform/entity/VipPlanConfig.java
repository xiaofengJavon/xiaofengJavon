package com.subscription.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vip_plan_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VipPlanConfig {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "plan_key", nullable = false, unique = true, length = 20)
    private String planKey; // MONTHLY, QUARTERLY, YEARLY

    @Column(name = "plan_label", nullable = false, length = 50)
    private String planLabel; // 月度, 季度, 年度

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "price_per_month", nullable = false, length = 20)
    private String pricePerMonth; // ¥29/月

    @Column(length = 20)
    private String badge; // 推荐, 最划算

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(columnDefinition = "JSON")
    private String features; // JSON array of {icon, text}

    @Builder.Default
    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = true;

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
