package com.subscription.platform.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CategoryCreateRequest {

    @NotBlank(message = "分类名称不能为空")
    @Size(min = 1, max = 50, message = "分类名称长度为1-50字符")
    private String name;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "颜色必须是十六进制格式如 #3b82f6")
    private String color = "#3b82f6";

    @NotBlank(message = "类型不能为空")
    @Pattern(regexp = "^(industry|policy)$", message = "类型必须是 industry 或 policy")
    private String type;

    @NotNull(message = "月度价格不能为空")
    @DecimalMin(value = "0.01", message = "价格最小为0.01")
    @DecimalMax(value = "999999.99", message = "价格最大为999999.99")
    private BigDecimal priceMonthly;

    @NotNull(message = "季度价格不能为空")
    @DecimalMin(value = "0.01", message = "价格最小为0.01")
    @DecimalMax(value = "999999.99", message = "价格最大为999999.99")
    private BigDecimal priceQuarterly;

    @NotNull(message = "年度价格不能为空")
    @DecimalMin(value = "0.01", message = "价格最小为0.01")
    @DecimalMax(value = "999999.99", message = "价格最大为999999.99")
    private BigDecimal priceYearly;

    private Integer sortOrder = 0;
}
