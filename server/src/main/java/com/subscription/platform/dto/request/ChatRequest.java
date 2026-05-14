package com.subscription.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChatRequest {
    @NotBlank(message = "消息不能为空")
    @Size(max = 2000, message = "消息最多2000字符")
    private String message;

    private String sessionId;
}
