package com.subscription.platform.controller.admin;

import com.subscription.platform.dto.request.BannerRequest;
import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.dto.response.BannerResponse;
import com.subscription.platform.service.BannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/banners")
@RequiredArgsConstructor
public class AdminBannerController {

    private final BannerService bannerService;

    /**
     * 获取所有轮播图
     */
    @GetMapping
    public ApiResponse<List<BannerResponse>> getAllBanners() {
        return ApiResponse.ok(bannerService.getAllBanners());
    }

    /**
     * 根据ID获取轮播图
     */
    @GetMapping("/{id}")
    public ApiResponse<BannerResponse> getBannerById(@PathVariable String id) {
        return ApiResponse.ok(bannerService.getBannerById(id));
    }

    /**
     * 创建轮播图
     */
    @PostMapping
    public ApiResponse<BannerResponse> createBanner(@Valid @RequestBody BannerRequest request) {
        return ApiResponse.ok(bannerService.createBanner(request));
    }

    /**
     * 更新轮播图
     */
    @PutMapping("/{id}")
    public ApiResponse<BannerResponse> updateBanner(
            @PathVariable String id,
            @Valid @RequestBody BannerRequest request) {
        return ApiResponse.ok(bannerService.updateBanner(id, request));
    }

    /**
     * 删除轮播图
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBanner(@PathVariable String id) {
        bannerService.deleteBanner(id);
        return ApiResponse.ok(null);
    }

    /**
     * 批量更新排序
     */
    @PostMapping("/reorder")
    public ApiResponse<Void> reorderBanners(@RequestBody Map<String, List<String>> payload) {
        List<String> order = payload.get("order");
        bannerService.reorderBanners(order);
        return ApiResponse.ok(null);
    }

    /**
     * 切换启用状态
     */
    @PostMapping("/{id}/toggle")
    public ApiResponse<BannerResponse> toggleEnabled(@PathVariable String id) {
        return ApiResponse.ok(bannerService.toggleEnabled(id));
    }
}
