package com.subscription.platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private String id;
    private String name;
    private String color;
    private BigDecimal priceMonthly;
    private BigDecimal priceQuarterly;
    private BigDecimal priceYearly;
    private String type;
    private Integer sortOrder;
    private Long subscriberCount;
}
