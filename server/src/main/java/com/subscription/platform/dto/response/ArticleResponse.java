package com.subscription.platform.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ArticleResponse {
    private String id;
    private String title;
    private String summary;
    private String content;
    private String category;
    private String type;
    private LocalDate date;
    private Boolean isPremium;
    private Integer readTime;
    private Integer viewCount;
    private Integer favoriteCount;
    private Integer likes;
    private Integer shareCount;
    private Boolean isSticky;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isFavorited;
    private Boolean isLiked;
    private Boolean hasAccess;
    private String moduleType; // industry or policy
}
