package com.subscription.platform.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalUsers;
    private long vipUsers;
    private long totalArticles;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long activeSubscriptions;
    private List<ArticleResponse> topArticles;
    private Map<String, Long> subscriptionByCategory;
}
