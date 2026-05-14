package com.subscription.platform.dto.response;

import com.subscription.platform.entity.Banner;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BannerResponse {

    private String id;
    private String title;
    private String imageUrl;
    private String linkUrl;
    private String linkType;
    private String linkTarget;
    private Integer sortOrder;
    private Boolean isEnabled;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BannerResponse fromEntity(Banner banner) {
        BannerResponse response = new BannerResponse();
        response.setId(banner.getId());
        response.setTitle(banner.getTitle());
        response.setImageUrl(banner.getImageUrl());
        response.setLinkUrl(banner.getLinkUrl());
        response.setLinkType(banner.getLinkType());
        response.setLinkTarget(banner.getLinkTarget());
        response.setSortOrder(banner.getSortOrder());
        response.setIsEnabled(banner.getIsEnabled());
        response.setStartDate(banner.getStartDate());
        response.setEndDate(banner.getEndDate());
        response.setCreatedAt(banner.getCreatedAt());
        response.setUpdatedAt(banner.getUpdatedAt());
        return response;
    }
}
