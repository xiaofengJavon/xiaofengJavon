package com.subscription.platform.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    private String id;
    private String wxOpenid;
    private String nickname;
    private String avatarUrl;
    private String phone;
    private Boolean isVip;
    private String subscriptionTier;
    private Integer credits;
    private String inviteCode;
    private Integer invitedCount;
    private LocalDate vipExpiry;
    private LocalDateTime createdAt;
    private List<SubscriptionResponse> activeSubscriptions;
    private Long readCount;
    private Long favoriteCount;
    private Long unlockedCount;
}
