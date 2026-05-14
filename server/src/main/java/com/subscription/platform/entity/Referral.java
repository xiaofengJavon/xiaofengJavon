package com.subscription.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "referral", indexes = {
    @Index(name = "idx_referral_referrer_id", columnList = "referrer_id"),
    @Index(name = "idx_referral_referred_id", columnList = "referred_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Referral {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referrer_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_referral_referrer"))
    private User referrer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_id", nullable = false, unique = true,
        foreignKey = @ForeignKey(name = "fk_referral_referred"))
    private User referred;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false)
    private Integer reward;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
    }
}
