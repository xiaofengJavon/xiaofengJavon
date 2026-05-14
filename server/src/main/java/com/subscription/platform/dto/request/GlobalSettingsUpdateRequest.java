package com.subscription.platform.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class GlobalSettingsUpdateRequest {
    private Boolean popupEnabled;
    private String popupImage;
    private String popupLink;
    private LocalDate popupExpiryDate;
    private String categoryColors;
    private String categoryPrices;
    private String marketingRules;
}
