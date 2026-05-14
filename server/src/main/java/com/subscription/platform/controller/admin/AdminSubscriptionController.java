package com.subscription.platform.controller.admin;

import com.subscription.platform.dto.request.ExtendSubscriptionRequest;
import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.dto.response.PageResponse;
import com.subscription.platform.dto.response.SubscriptionManageResponse;
import com.subscription.platform.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "管理员 - 订阅管理", description = "管理员订阅管理相关接口")
@RestController
@RequestMapping("/api/v1/admin/subscriptions")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AdminSubscriptionController {

    private final SubscriptionService subscriptionService;

    @Operation(summary = "获取所有订阅列表")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SubscriptionManageResponse>>> getAllSubscriptions(
            @Parameter(description = "搜索关键词（用户昵称/手机号）") @RequestParam(required = false) String search,
            @Parameter(description = "分类筛选") @RequestParam(required = false) String category,
            @Parameter(description = "仅显示活跃订阅") @RequestParam(required = false) Boolean activeOnly,
            @Parameter(description = "页码，从1开始") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "20") int pageSize) {
        
        Pageable pageable = PageRequest.of(page - 1, Math.min(pageSize, 100),
            Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Page<SubscriptionManageResponse> subscriptions = subscriptionService.getAllSubscriptions(
            search, category, activeOnly, pageable);
        
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.of(subscriptions)));
    }

    @Operation(summary = "延长订阅期限")
    @PostMapping("/extend")
    public ResponseEntity<ApiResponse<SubscriptionManageResponse>> extendSubscription(
            @Valid @RequestBody ExtendSubscriptionRequest request) {
        SubscriptionManageResponse response = subscriptionService.extendSubscription(
            request.getSubscriptionId(), request.getDays());
        return ResponseEntity.ok(ApiResponse.ok("订阅期限已延长", response));
    }

    @Operation(summary = "取消订阅（设置为已过期）")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelSubscription(@PathVariable String id) {
        subscriptionService.cancelSubscription(id);
        return ResponseEntity.ok(ApiResponse.ok("订阅已取消", null));
    }

    @Operation(summary = "删除订阅记录")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubscription(@PathVariable String id) {
        subscriptionService.deleteSubscription(id);
        return ResponseEntity.ok(ApiResponse.ok("订阅已删除", null));
    }
}
