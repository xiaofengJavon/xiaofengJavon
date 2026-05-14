package com.subscription.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "global_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSettings {

    @Id
    @Column(length = 20)
    private String id;

    @Column(name = "popup_enabled")
    private Boolean popupEnabled = true;

    @Column(name = "popup_image", length = 500)
    private String popupImage = "";

    @Column(name = "popup_link", length = 500)
    private String popupLink = "";

    @Column(name = "popup_expiry_date")
    private LocalDate popupExpiryDate;

    @Column(name = "category_colors", columnDefinition = "JSON")
    private String categoryColors;

    @Column(name = "category_prices", columnDefinition = "JSON")
    private String categoryPrices;

    @Column(name = "marketing_rules", columnDefinition = "JSON")
    private String marketingRules;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
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
