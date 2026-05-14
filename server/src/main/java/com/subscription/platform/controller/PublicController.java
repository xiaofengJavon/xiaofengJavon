package com.subscription.platform.controller;

import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.entity.GlobalSettings;
import com.subscription.platform.service.GlobalSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "公开接口", description = "无需认证的公开接口")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PublicController {

    private final GlobalSettingsService globalSettingsService;

    @Operation(summary = "获取公开全局设置（小程序弹窗配置等）")
    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<GlobalSettings>> getPublicSettings() {
        return ResponseEntity.ok(ApiResponse.ok(globalSettingsService.getSettings()));
    }
}
