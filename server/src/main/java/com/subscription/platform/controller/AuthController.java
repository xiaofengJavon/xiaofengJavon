package com.subscription.platform.controller;

import com.subscription.platform.dto.request.AdminLoginRequest;
import com.subscription.platform.dto.request.WechatLoginRequest;
import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.dto.response.LoginResponse;
import com.subscription.platform.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "认证", description = "用户认证相关接口")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "微信小程序登录")
    @PostMapping("/wechat-login")
    public ResponseEntity<ApiResponse<LoginResponse>> wechatLogin(
            @Valid @RequestBody WechatLoginRequest request) {
        LoginResponse response = authService.wechatLogin(request);
        return ResponseEntity.ok(ApiResponse.ok("登录成功", response));
    }

    @Operation(summary = "管理员登录")
    @PostMapping("/admin-login")
    public ResponseEntity<ApiResponse<LoginResponse>> adminLogin(
            @Valid @RequestBody AdminLoginRequest request) {
        LoginResponse response = authService.adminLogin(request);
        return ResponseEntity.ok(ApiResponse.ok("登录成功", response));
    }
}
