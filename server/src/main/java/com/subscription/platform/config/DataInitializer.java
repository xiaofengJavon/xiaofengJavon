package com.subscription.platform.config;

import com.subscription.platform.entity.AdminUser;
import com.subscription.platform.entity.GlobalSettings;
import com.subscription.platform.repository.AdminUserRepository;
import com.subscription.platform.repository.GlobalSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final AdminUserRepository adminUserRepository;
    private final GlobalSettingsRepository globalSettingsRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        initGlobalSettings();
        initDefaultAdmin();
    }

    private void initGlobalSettings() {
        if (!globalSettingsRepository.existsById("settings")) {
            GlobalSettings settings = new GlobalSettings();
            settings.setId("settings");
            settings.setPopupEnabled(true);
            settings.setPopupImage("");
            settings.setPopupLink("");
            settings.setCategoryColors("{\"行业资讯\":\"#3b82f6\",\"政策资讯\":\"#10b981\"}");
            settings.setCategoryPrices("{\"行业资讯\":{\"monthly\":2,\"quarterly\":4,\"yearly\":12}}");
            settings.setMarketingRules("{\"referral_reward\":10,\"share_unlock\":true}");
            globalSettingsRepository.save(settings);
            log.info("Global settings initialized.");
        }
    }

    private void initDefaultAdmin() {
        if (!adminUserRepository.existsByUsername("admin")) {
            AdminUser admin = new AdminUser();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("Admin@2024"));
            admin.setRole("ADMIN");
            adminUserRepository.save(admin);
            log.warn("Default admin account created. Username: admin, Password: Admin@2024. PLEASE CHANGE THE PASSWORD IMMEDIATELY!");
        }
    }
}
