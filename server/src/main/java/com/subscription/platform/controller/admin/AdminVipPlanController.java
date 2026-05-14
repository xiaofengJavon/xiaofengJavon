package com.subscription.platform.controller.admin;

import com.subscription.platform.dto.request.VipPlanConfigRequest;
import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.dto.response.VipPlanResponse;
import com.subscription.platform.service.VipPlanConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "管理端 - VIP套餐配置", description = "VIP套餐配置管理接口")
@RestController
@RequestMapping("/api/v1/admin/vip-plans")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminVipPlanController {

    private final VipPlanConfigService vipPlanConfigService;

    @Operation(summary = "获取所有VIP套餐（包括禁用的）")
    @GetMapping
    public ResponseEntity<ApiResponse<List<VipPlanResponse>>> getAllPlans() {
        List<VipPlanResponse> plans = vipPlanConfigService.getAllPlans();
        return ResponseEntity.ok(ApiResponse.ok(plans));
    }

    @Operation(summary = "根据ID获取VIP套餐详情")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VipPlanResponse>> getPlanById(@PathVariable String id) {
        VipPlanResponse plan = vipPlanConfigService.getPlanById(id);
        return ResponseEntity.ok(ApiResponse.ok(plan));
    }

    @Operation(summary = "创建VIP套餐")
    @PostMapping
    public ResponseEntity<ApiResponse<VipPlanResponse>> createPlan(
            @Valid @RequestBody VipPlanConfigRequest request) {
        VipPlanResponse plan = vipPlanConfigService.createPlan(request);
        return ResponseEntity.ok(ApiResponse.ok("创建成功", plan));
    }

    @Operation(summary = "更新VIP套餐")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VipPlanResponse>> updatePlan(
            @PathVariable String id,
            @Valid @RequestBody VipPlanConfigRequest request) {
        VipPlanResponse plan = vipPlanConfigService.updatePlan(id, request);
        return ResponseEntity.ok(ApiResponse.ok("更新成功", plan));
    }

    @Operation(summary = "删除VIP套餐")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deletePlan(@PathVariable String id) {
        vipPlanConfigService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.ok("删除成功", "success"));
    }

    @Operation(summary = "启用/禁用VIP套餐")
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<VipPlanResponse>> togglePlanStatus(@PathVariable String id) {
        VipPlanResponse plan = vipPlanConfigService.togglePlanStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("状态切换成功", plan));
    }
}
