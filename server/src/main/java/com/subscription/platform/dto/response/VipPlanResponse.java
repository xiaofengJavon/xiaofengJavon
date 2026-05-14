package com.subscription.platform.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VipPlanResponse {

    private String id;

    @JsonProperty("key")
    private String planKey;

    private String label;

    private BigDecimal price;

    @JsonProperty("per")
    private String pricePerMonth;

    private String badge;

    private Integer durationDays;

    private List<VipFeature> features;

    private Boolean isEnabled;

    private Integer sortOrder;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VipFeature {
        private String icon;
        private String text;
    }
}
