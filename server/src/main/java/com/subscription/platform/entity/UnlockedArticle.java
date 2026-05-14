package com.subscription.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "unlocked_article", indexes = {
    @Index(name = "idx_unlocked_article_user_id", columnList = "user_id"),
    @Index(name = "idx_unlocked_article_article_id", columnList = "article_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnlockedArticle {

    @EmbeddedId
    private UnlockedArticleId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_unlocked_article_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("articleId")
    @JoinColumn(name = "article_id", foreignKey = @ForeignKey(name = "fk_unlocked_article_article"))
    private Article article;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
