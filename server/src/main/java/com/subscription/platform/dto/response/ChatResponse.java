package com.subscription.platform.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatResponse {
    private String reply;
    private Integer creditsRemaining;
    private String sessionId;
}
