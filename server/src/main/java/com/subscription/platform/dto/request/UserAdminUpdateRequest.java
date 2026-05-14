package com.subscription.platform.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UserAdminUpdateRequest {
    private Boolean isVip;
    private String subscriptionTier;
    private LocalDate vipExpiry;
    private Integer credits;
    private Integer creditsAdjustment;
}
