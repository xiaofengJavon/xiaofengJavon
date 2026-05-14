package com.subscription.platform.dto.response;

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
public class SubscriptionManageResponse {
    private String id;
    private String userId;
    private String userNickname;
    private String userPhone;
    private String category;
    private LocalDate expiryDate;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private Integer daysRemaining;
}
