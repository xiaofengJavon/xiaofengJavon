package com.subscription.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RedeemCodeRequest {
    @NotBlank(message = "邀请码不能为空")
    private String code;
}
