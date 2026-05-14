package com.subscription.platform.service;

import com.subscription.platform.dto.request.BannerRequest;
import com.subscription.platform.dto.response.BannerResponse;
import com.subscription.platform.entity.Banner;
import com.subscription.platform.exception.ResourceNotFoundException;
import com.subscription.platform.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BannerService {

    private final BannerRepository bannerRepository;

    /**
     * 获取所有轮播图（管理端）
     */
    public List<BannerResponse> getAllBanners() {
        return bannerRepository.findAllByOrderBySortOrderAsc()
                .stream()
                .map(BannerResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 获取当前有效的轮播图（小程序端）
     */
    public List<BannerResponse> getActiveBanners() {
        LocalDate today = LocalDate.now();
        return bannerRepository.findActiveBanners(today)
                .stream()
                .map(BannerResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 根据ID获取轮播图
     */
    public BannerResponse getBannerById(String id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("轮播图不存在"));
        return BannerResponse.fromEntity(banner);
    }

    /**
     * 创建轮播图
     */
    @Transactional
    public BannerResponse createBanner(BannerRequest request) {
        Banner banner = new Banner();
        updateBannerFromRequest(banner, request);
        Banner saved = bannerRepository.save(banner);
        log.info("创建轮播图: {}", saved.getId());
        return BannerResponse.fromEntity(saved);
    }

    /**
     * 更新轮播图
     */
    @Transactional
    public BannerResponse updateBanner(String id, BannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("轮播图不存在"));
        updateBannerFromRequest(banner, request);
        Banner updated = bannerRepository.save(banner);
        log.info("更新轮播图: {}", id);
        return BannerResponse.fromEntity(updated);
    }

    /**
     * 删除轮播图
     */
    @Transactional
    public void deleteBanner(String id) {
        if (!bannerRepository.existsById(id)) {
            throw new ResourceNotFoundException("轮播图不存在");
        }
        bannerRepository.deleteById(id);
        log.info("删除轮播图: {}", id);
    }

    /**
     * 批量更新排序
     */
    @Transactional
    public void reorderBanners(List<String> bannerIds) {
        for (int i = 0; i < bannerIds.size(); i++) {
            String id = bannerIds.get(i);
            Banner banner = bannerRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("轮播图不存在: " + id));
            banner.setSortOrder(i);
            bannerRepository.save(banner);
        }
        log.info("批量更新轮播图排序，共 {} 个", bannerIds.size());
    }

    /**
     * 切换启用状态
     */
    @Transactional
    public BannerResponse toggleEnabled(String id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("轮播图不存在"));
        banner.setIsEnabled(!banner.getIsEnabled());
        Banner updated = bannerRepository.save(banner);
        log.info("切换轮播图启用状态: {} -> {}", id, updated.getIsEnabled());
        return BannerResponse.fromEntity(updated);
    }

    /**
     * 从请求更新实体
     */
    private void updateBannerFromRequest(Banner banner, BannerRequest request) {
        banner.setTitle(request.getTitle());
        banner.setImageUrl(request.getImageUrl());
        banner.setLinkUrl(request.getLinkUrl());
        banner.setLinkType(request.getLinkType());
        banner.setLinkTarget(request.getLinkTarget());
        banner.setSortOrder(request.getSortOrder());
        banner.setIsEnabled(request.getIsEnabled());
        banner.setStartDate(request.getStartDate());
        banner.setEndDate(request.getEndDate());
    }
}
