package com.subscription.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "category_config", indexes = {
    @Index(name = "idx_category_config_name", columnList = "name"),
    @Index(name = "idx_category_config_type", columnList = "type"),
    @Index(name = "idx_category_config_sort", columnList = "sort_order")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryConfig {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(length = 7)
    private String color = "#3b82f6";

    @Column(name = "price_monthly", precision = 10, scale = 2)
    private BigDecimal priceMonthly = new BigDecimal("2.00");

    @Column(name = "price_quarterly", precision = 10, scale = 2)
    private BigDecimal priceQuarterly = new BigDecimal("4.00");

    @Column(name = "price_yearly", precision = 10, scale = 2)
    private BigDecimal priceYearly = new BigDecimal("12.00");

    @Column(length = 20)
    private String type = "industry";

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "settings_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_category_config_settings"))
    private GlobalSettings settings;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
