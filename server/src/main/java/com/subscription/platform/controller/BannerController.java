package com.subscription.platform.controller;

import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.dto.response.BannerResponse;
import com.subscription.platform.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    /**
     * 获取当前有效的轮播图（小程序端）
     */
    @GetMapping
    public ApiResponse<List<BannerResponse>> getActiveBanners() {
        return ApiResponse.ok(bannerService.getActiveBanners());
    }
}
