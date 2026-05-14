-- =============================================================
-- V2: 初始化基础数据
-- =============================================================

SET NAMES utf8mb4;

-- ----------------------------
-- 初始化全局设置（单例）
-- ----------------------------
INSERT IGNORE INTO `global_settings` (`id`, `popup_enabled`, `popup_image`, `popup_link`,
    `category_colors`, `category_prices`, `marketing_rules`, `created_at`, `updated_at`)
VALUES (
    'settings',
    1,
    '',
    '',
    '{"行业资讯":"#3b82f6","政策资讯":"#10b981"}',
    '{"行业资讯":{"monthly":2,"quarterly":4,"yearly":12},"政策资讯":{"monthly":2,"quarterly":4,"yearly":12}}',
    '{"referral_reward":10,"share_unlock":true}',
    NOW(),
    NOW()
);

-- ----------------------------
-- 初始化默认分类
-- ----------------------------
INSERT IGNORE INTO `category_config` (`id`, `name`, `color`, `price_monthly`, `price_quarterly`,
    `price_yearly`, `type`, `sort_order`, `settings_id`, `created_at`, `updated_at`)
VALUES
    (UUID(), '新能源汽车', '#3b82f6', 2.00, 4.00, 12.00, 'industry', 1, 'settings', NOW(), NOW()),
    (UUID(), '人工智能', '#8b5cf6', 2.00, 4.00, 12.00, 'industry', 2, 'settings', NOW(), NOW()),
    (UUID(), '医疗健康', '#ef4444', 2.00, 4.00, 12.00, 'industry', 3, 'settings', NOW(), NOW()),
    (UUID(), '金融科技', '#f59e0b', 2.00, 4.00, 12.00, 'industry', 4, 'settings', NOW(), NOW()),
    (UUID(), '产业政策', '#10b981', 2.00, 4.00, 12.00, 'policy', 5, 'settings', NOW(), NOW()),
    (UUID(), '监管法规', '#6366f1', 2.00, 4.00, 12.00, 'policy', 6, 'settings', NOW(), NOW());

-- 注意: 默认管理员账号由 DataInitializer 在应用启动时自动创建
-- 默认账号: admin / Admin@2024  (请上线后立即修改)
