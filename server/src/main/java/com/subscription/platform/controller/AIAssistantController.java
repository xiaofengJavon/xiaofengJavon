package com.subscription.platform.controller;

import com.subscription.platform.dto.request.ChatRequest;
import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.dto.response.ChatResponse;
import com.subscription.platform.exception.UnauthorizedException;
import com.subscription.platform.service.AIService;
import com.subscription.platform.util.SecurityContextUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "AI助手", description = "AI对话助手接口")
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AIAssistantController {

    private final AIService aiService;

    @Operation(summary = "发送消息给AI助手（消耗1积分）")
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @Valid @RequestBody ChatRequest request) {
        String userId = SecurityContextUtil.getCurrentUserId();
        if (userId == null) throw new UnauthorizedException("未登录");
        ChatResponse response = aiService.chat(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
