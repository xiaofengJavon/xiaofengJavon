package com.subscription.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WechatLoginRequest {
    @NotBlank(message = "微信code不能为空")
    private String code;

    private String inviteCode;
}
