package com.subscription.platform.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExtendSubscriptionRequest {
    @NotBlank(message = "订阅ID不能为空")
    private String subscriptionId;
    
    @Min(value = 1, message = "延长天数至少为1天")
    private Integer days;
}
