package com.subscription.platform.controller;

import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.dto.response.VipPlanResponse;
import com.subscription.platform.service.VipPlanConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "VIP套餐", description = "VIP套餐配置查询接口（前端用户端）")
@RestController
@RequestMapping("/api/v1/vip-plans")
@RequiredArgsConstructor
public class VipPlanController {

    private final VipPlanConfigService vipPlanConfigService;

    @Operation(summary = "获取所有启用的VIP套餐")
    @GetMapping
    public ResponseEntity<ApiResponse<List<VipPlanResponse>>> getEnabledPlans() {
        List<VipPlanResponse> plans = vipPlanConfigService.getEnabledPlans();
        return ResponseEntity.ok(ApiResponse.ok(plans));
    }
}
