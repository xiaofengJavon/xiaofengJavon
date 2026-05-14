package com.subscription.platform.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
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
public class VipPlanConfigRequest {

    @NotBlank(message = "套餐标识不能为空")
    @Pattern(regexp = "^(MONTHLY|QUARTERLY|YEARLY|CUSTOM)$", message = "套餐标识必须是 MONTHLY, QUARTERLY, YEARLY 或 CUSTOM")
    private String planKey;

    @NotBlank(message = "套餐名称不能为空")
    @Size(max = 50, message = "套餐名称不能超过50个字符")
    private String planLabel;

    @NotNull(message = "价格不能为空")
    @DecimalMin(value = "0.01", message = "价格必须大于0")
    @Digits(integer = 8, fraction = 2, message = "价格格式不正确")
    private BigDecimal price;

    @NotBlank(message = "月均价格显示不能为空")
    @Size(max = 20, message = "月均价格显示不能超过20个字符")
    private String pricePerMonth;

    @Size(max = 20, message = "角标文字不能超过20个字符")
    private String badge;

    @NotNull(message = "有效天数不能为空")
    @Min(value = 1, message = "有效天数必须大于0")
    private Integer durationDays;

    private List<VipFeatureRequest> features;

    @NotNull(message = "启用状态不能为空")
    private Boolean isEnabled;

    @NotNull(message = "排序顺序不能为空")
    @Min(value = 0, message = "排序顺序不能为负数")
    private Integer sortOrder;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VipFeatureRequest {
        @NotBlank(message = "特权图标不能为空")
        private String icon;

        @NotBlank(message = "特权描述不能为空")
        @Size(max = 100, message = "特权描述不能超过100个字符")
        private String text;
    }
}
