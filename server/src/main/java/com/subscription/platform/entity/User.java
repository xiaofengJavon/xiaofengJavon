package com.subscription.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user", indexes = {
    @Index(name = "idx_user_wx_openid", columnList = "wx_openid"),
    @Index(name = "idx_user_invite_code", columnList = "invite_code"),
    @Index(name = "idx_user_vip_expiry", columnList = "vip_expiry")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "wx_openid", unique = true, nullable = false, length = 100)
    private String wxOpenid;

    @Column(name = "is_vip")
    private Boolean isVip = false;

    @Column(name = "subscription_tier", length = 20)
    private String subscriptionTier = "NONE";

    private Integer credits = 10;

    @Column(length = 50)
    private String nickname;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(length = 20)
    private String phone;

    @Column(name = "invite_code", unique = true, length = 6)
    private String inviteCode;

    @Column(name = "invited_count")
    private Integer invitedCount = 0;

    @Column(name = "vip_expiry")
    private LocalDate vipExpiry;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Subscription> subscriptions;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Order> orders;

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
