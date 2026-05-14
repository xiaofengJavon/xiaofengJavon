package com.subscription.platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private String id;
    private String userId;
    private String wxOpenid;
    private String type;
    private String item;
    private BigDecimal amount;
    private String status;
    private LocalDateTime createdAt;
}
