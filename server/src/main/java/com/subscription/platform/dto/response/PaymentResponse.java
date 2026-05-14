package com.subscription.platform.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponse {
    private String orderId;
    private String prepayId;
    private String timestamp;
    private String nonceStr;
    private String packageValue;
    private String signType;
    private String paySign;
    private String appId;
}
