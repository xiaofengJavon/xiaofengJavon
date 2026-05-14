package com.subscription.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscription",
    uniqueConstraints = @UniqueConstraint(name = "uk_subscription_user_category", columnNames = {"user_id", "category"}),
    indexes = {
        @Index(name = "idx_subscription_user_id", columnList = "user_id"),
        @Index(name = "idx_subscription_category", columnList = "category"),
        @Index(name = "idx_subscription_expiry", columnList = "expiry_date")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_subscription_user"))
    private User user;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
    }
}
