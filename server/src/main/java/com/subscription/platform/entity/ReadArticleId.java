package com.subscription.platform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadArticleId implements Serializable {

    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(name = "article_id", length = 36)
    private String articleId;
}
