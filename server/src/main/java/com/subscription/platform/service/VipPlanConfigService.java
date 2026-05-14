package com.subscription.platform.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.subscription.platform.dto.request.VipPlanConfigRequest;
import com.subscription.platform.dto.response.VipPlanResponse;
import com.subscription.platform.entity.VipPlanConfig;
import com.subscription.platform.exception.BadRequestException;
import com.subscription.platform.exception.ResourceNotFoundException;
import com.subscription.platform.repository.VipPlanConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VipPlanConfigService {

    private final VipPlanConfigRepository vipPlanConfigRepository;
    private final ObjectMapper objectMapper;

    /**
     * 获取所有启用的VIP套餐（前端用户端）
     */
    public List<VipPlanResponse> getEnabledPlans() {
        List<VipPlanConfig> configs = vipPlanConfigRepository.findByIsEnabledTrueOrderBySortOrderAsc();
        return configs.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取所有VIP套餐（管理端）
     */
    public List<VipPlanResponse> getAllPlans() {
        List<VipPlanConfig> configs = vipPlanConfigRepository.findAllByOrderBySortOrderAsc();
        return configs.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * 根据ID获取套餐
     */
    public VipPlanResponse getPlanById(String id) {
        VipPlanConfig config = vipPlanConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VIP套餐不存在"));
        return toResponse(config);
    }

    /**
     * 根据planKey获取套餐
     */
    public VipPlanConfig getPlanByKey(String planKey) {
        return vipPlanConfigRepository.findByPlanKey(planKey)
                .orElseThrow(() -> new ResourceNotFoundException("VIP套餐不存在: " + planKey));
    }

    /**
     * 创建VIP套餐
     */
    @Transactional
    public VipPlanResponse createPlan(VipPlanConfigRequest request) {
        // 检查planKey是否已存在
        if (vipPlanConfigRepository.findByPlanKey(request.getPlanKey()).isPresent()) {
            throw new BadRequestException("套餐标识已存在: " + request.getPlanKey());
        }

        VipPlanConfig config = VipPlanConfig.builder()
                .planKey(request.getPlanKey())
                .planLabel(request.getPlanLabel())
                .price(request.getPrice())
                .pricePerMonth(request.getPricePerMonth())
                .badge(request.getBadge())
                .durationDays(request.getDurationDays())
                .features(serializeFeatures(request.getFeatures()))
                .isEnabled(request.getIsEnabled())
                .sortOrder(request.getSortOrder())
                .build();

        config = vipPlanConfigRepository.save(config);
        log.info("创建VIP套餐: {}", config.getPlanKey());
        return toResponse(config);
    }

    /**
     * 更新VIP套餐
     */
    @Transactional
    public VipPlanResponse updatePlan(String id, VipPlanConfigRequest request) {
        VipPlanConfig config = vipPlanConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VIP套餐不存在"));

        // 如果修改了planKey，检查新的planKey是否已被其他套餐使用
        if (!config.getPlanKey().equals(request.getPlanKey())) {
            vipPlanConfigRepository.findByPlanKey(request.getPlanKey())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new BadRequestException("套餐标识已存在: " + request.getPlanKey());
                        }
                    });
        }

        config.setPlanKey(request.getPlanKey());
        config.setPlanLabel(request.getPlanLabel());
        config.setPrice(request.getPrice());
        config.setPricePerMonth(request.getPricePerMonth());
        config.setBadge(request.getBadge());
        config.setDurationDays(request.getDurationDays());
        config.setFeatures(serializeFeatures(request.getFeatures()));
        config.setIsEnabled(request.getIsEnabled());
        config.setSortOrder(request.getSortOrder());

        config = vipPlanConfigRepository.save(config);
        log.info("更新VIP套餐: {}", config.getPlanKey());
        return toResponse(config);
    }

    /**
     * 删除VIP套餐
     */
    @Transactional
    public void deletePlan(String id) {
        VipPlanConfig config = vipPlanConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VIP套餐不存在"));
        vipPlanConfigRepository.delete(config);
        log.info("删除VIP套餐: {}", config.getPlanKey());
    }

    /**
     * 启用/禁用套餐
     */
    @Transactional
    public VipPlanResponse togglePlanStatus(String id) {
        VipPlanConfig config = vipPlanConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VIP套餐不存在"));
        config.setIsEnabled(!config.getIsEnabled());
        config = vipPlanConfigRepository.save(config);
        log.info("切换VIP套餐状态: {} -> {}", config.getPlanKey(), config.getIsEnabled());
        return toResponse(config);
    }

    /**
     * 转换为响应DTO
     */
    private VipPlanResponse toResponse(VipPlanConfig config) {
        return VipPlanResponse.builder()
                .id(config.getId())
                .planKey(config.getPlanKey())
                .label(config.getPlanLabel())
                .price(config.getPrice())
                .pricePerMonth(config.getPricePerMonth())
                .badge(config.getBadge())
                .durationDays(config.getDurationDays())
                .features(deserializeFeatures(config.getFeatures()))
                .isEnabled(config.getIsEnabled())
                .sortOrder(config.getSortOrder())
                .build();
    }

    /**
     * 序列化特权列表为JSON字符串
     */
    private String serializeFeatures(List<VipPlanConfigRequest.VipFeatureRequest> features) {
        if (features == null || features.isEmpty()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(features);
        } catch (JsonProcessingException e) {
            log.error("序列化特权列表失败", e);
            return "[]";
        }
    }

    /**
     * 反序列化JSON字符串为特权列表
     */
    private List<VipPlanResponse.VipFeature> deserializeFeatures(String featuresJson) {
        if (featuresJson == null || featuresJson.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(featuresJson,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, VipPlanResponse.VipFeature.class));
        } catch (JsonProcessingException e) {
            log.error("反序列化特权列表失败", e);
            return new ArrayList<>();
        }
    }
}
