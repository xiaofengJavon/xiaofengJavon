package com.subscription.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubscriptionRequest {
    private String category;

    @NotBlank(message = "订阅时长不能为空")
    private String duration;
}
