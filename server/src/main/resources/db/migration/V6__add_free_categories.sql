-- =============================================================
-- V6: 新增免费订阅分类（priceMonthly = 0）
-- =============================================================

SET NAMES utf8mb4;

INSERT IGNORE INTO `category_config` (`id`, `name`, `color`, `price_monthly`, `price_quarterly`,
    `price_yearly`, `type`, `sort_order`, `settings_id`, `created_at`, `updated_at`)
VALUES
    (UUID(), '政策速递', '#10b981', 0.00, 0.00, 0.00, 'policy', 10, 'settings', NOW(), NOW()),
    (UUID(), '监管动态', '#06b6d4', 0.00, 0.00, 0.00, 'policy', 11, 'settings', NOW(), NOW());
