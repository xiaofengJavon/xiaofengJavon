package com.subscription.platform.service;

import com.subscription.platform.dto.request.GlobalSettingsUpdateRequest;
import com.subscription.platform.entity.GlobalSettings;
import com.subscription.platform.exception.ResourceNotFoundException;
import com.subscription.platform.repository.GlobalSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GlobalSettingsService {

    private final GlobalSettingsRepository globalSettingsRepository;

    @Cacheable("settings")
    public GlobalSettings getSettings() {
        return globalSettingsRepository.findById("settings")
            .orElseThrow(() -> new ResourceNotFoundException("GlobalSettings", "settings"));
    }

    @Transactional
    @CacheEvict(value = "settings", allEntries = true)
    public GlobalSettings updateSettings(GlobalSettingsUpdateRequest request) {
        GlobalSettings settings = getSettings();

        if (request.getPopupEnabled() != null) settings.setPopupEnabled(request.getPopupEnabled());
        if (request.getPopupImage() != null) settings.setPopupImage(request.getPopupImage());
        if (request.getPopupLink() != null) settings.setPopupLink(request.getPopupLink());
        if (request.getPopupExpiryDate() != null) settings.setPopupExpiryDate(request.getPopupExpiryDate());
        if (request.getCategoryColors() != null) settings.setCategoryColors(request.getCategoryColors());
        if (request.getCategoryPrices() != null) settings.setCategoryPrices(request.getCategoryPrices());
        if (request.getMarketingRules() != null) settings.setMarketingRules(request.getMarketingRules());

        return globalSettingsRepository.save(settings);
    }
}
