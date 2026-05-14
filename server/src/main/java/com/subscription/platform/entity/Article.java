package com.subscription.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "article", indexes = {
    @Index(name = "idx_article_category", columnList = "category"),
    @Index(name = "idx_article_type", columnList = "type"),
    @Index(name = "idx_article_date", columnList = "date"),
    @Index(name = "idx_article_is_sticky", columnList = "is_sticky, date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Article {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 500)
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "is_premium")
    private Boolean isPremium = false;

    @Column(name = "read_time")
    private Integer readTime;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "favorite_count")
    private Integer favoriteCount = 0;

    private Integer likes = 0;

    @Column(name = "share_count")
    private Integer shareCount = 0;

    @Column(name = "is_sticky")
    private Boolean isSticky = false;

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
