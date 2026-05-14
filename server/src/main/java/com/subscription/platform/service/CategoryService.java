package com.subscription.platform.service;

import com.subscription.platform.dto.request.CategoryCreateRequest;
import com.subscription.platform.dto.request.CategoryUpdateRequest;
import com.subscription.platform.dto.response.CategoryResponse;
import com.subscription.platform.entity.CategoryConfig;
import com.subscription.platform.entity.GlobalSettings;
import com.subscription.platform.exception.BadRequestException;
import com.subscription.platform.exception.ResourceNotFoundException;
import com.subscription.platform.repository.ArticleRepository;
import com.subscription.platform.repository.CategoryConfigRepository;
import com.subscription.platform.repository.GlobalSettingsRepository;
import com.subscription.platform.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryConfigRepository categoryConfigRepository;
    private final GlobalSettingsRepository globalSettingsRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ArticleRepository articleRepository;

    @Cacheable("categories")
    public List<CategoryResponse> getAllCategories() {
        LocalDate today = LocalDate.now();
        return categoryConfigRepository.findAllByOrderBySortOrderAsc().stream()
            .map(c -> toResponse(c, today))
            .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        if (categoryConfigRepository.existsByName(request.getName())) {
            throw new BadRequestException("分类名称已存在: " + request.getName());
        }

        GlobalSettings settings = globalSettingsRepository.findById("settings")
            .orElseThrow(() -> new ResourceNotFoundException("GlobalSettings", "settings"));

        int maxSort = categoryConfigRepository.findAllByOrderBySortOrderAsc().stream()
            .mapToInt(c -> c.getSortOrder() != null ? c.getSortOrder() : 0)
            .max().orElse(0);

        CategoryConfig config = new CategoryConfig();
        config.setName(request.getName());
        config.setColor(request.getColor());
        config.setType(request.getType());
        config.setPriceMonthly(request.getPriceMonthly());
        config.setPriceQuarterly(request.getPriceQuarterly());
        config.setPriceYearly(request.getPriceYearly());
        config.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : maxSort + 1);
        config.setSettings(settings);

        config = categoryConfigRepository.save(config);
        return toResponse(config, LocalDate.now());
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse updateCategory(String id, CategoryUpdateRequest request) {
        CategoryConfig config = categoryConfigRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("CategoryConfig", id));

        if (request.getName() != null && !request.getName().equals(config.getName())) {
            if (categoryConfigRepository.existsByName(request.getName())) {
                throw new BadRequestException("分类名称已存在: " + request.getName());
            }
            config.setName(request.getName());
        }
        if (request.getColor() != null) config.setColor(request.getColor());
        if (request.getType() != null) config.setType(request.getType());
        if (request.getPriceMonthly() != null) config.setPriceMonthly(request.getPriceMonthly());
        if (request.getPriceQuarterly() != null) config.setPriceQuarterly(request.getPriceQuarterly());
        if (request.getPriceYearly() != null) config.setPriceYearly(request.getPriceYearly());
        if (request.getSortOrder() != null) config.setSortOrder(request.getSortOrder());

        config = categoryConfigRepository.save(config);
        return toResponse(config, LocalDate.now());
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(String id) {
        CategoryConfig config = categoryConfigRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("CategoryConfig", id));

        List<CategoryConfig> remaining = categoryConfigRepository.findAllByOrderBySortOrderAsc()
            .stream().filter(c -> !c.getId().equals(id)).collect(Collectors.toList());

        if (!remaining.isEmpty()) {
            CategoryConfig fallback = remaining.get(0);
            articleRepository.updateCategoryForAllArticles(config.getName(), fallback.getName());
        }

        categoryConfigRepository.delete(config);
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void reorderCategories(List<String> ids) {
        for (int i = 0; i < ids.size(); i++) {
            final int order = i;
            categoryConfigRepository.findById(ids.get(i)).ifPresent(c -> {
                c.setSortOrder(order);
                categoryConfigRepository.save(c);
            });
        }
    }

    private CategoryResponse toResponse(CategoryConfig config, LocalDate today) {
        long subscriberCount = subscriptionRepository.countActiveSubscribersByCategory(config.getName(), today);
        return CategoryResponse.builder()
            .id(config.getId())
            .name(config.getName())
            .color(config.getColor())
            .priceMonthly(config.getPriceMonthly())
            .priceQuarterly(config.getPriceQuarterly())
            .priceYearly(config.getPriceYearly())
            .type(config.getType())
            .sortOrder(config.getSortOrder())
            .subscriberCount(subscriberCount)
            .build();
    }
}
