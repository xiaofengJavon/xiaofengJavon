-- =============================================================
-- V9: 添加VIP套餐配置表
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- VIP套餐配置表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `vip_plan_config` (
    `id`               VARCHAR(36)     NOT NULL,
    `plan_key`         VARCHAR(20)     NOT NULL COMMENT '套餐标识: MONTHLY/QUARTERLY/YEARLY',
    `plan_label`       VARCHAR(50)     NOT NULL COMMENT '套餐名称: 月度/季度/年度',
    `price`            DECIMAL(10,2)   NOT NULL COMMENT '套餐价格',
    `price_per_month`  VARCHAR(20)     NOT NULL COMMENT '月均价格显示: ¥29/月',
    `badge`            VARCHAR(20)     COMMENT '角标文字: 推荐/最划算',
    `duration_days`    INT             NOT NULL COMMENT '有效天数',
    `features`         JSON            COMMENT '套餐特权列表',
    `is_enabled`       TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '是否启用',
    `sort_order`       INT             NOT NULL DEFAULT 0 COMMENT '排序顺序',
    `created_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_vip_plan_key` (`plan_key`),
    INDEX `idx_vip_plan_sort` (`sort_order`),
    INDEX `idx_vip_plan_enabled` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='VIP套餐配置表';

-- ----------------------------
-- 插入默认VIP套餐配置
-- ----------------------------
INSERT INTO `vip_plan_config` 
    (`id`, `plan_key`, `plan_label`, `price`, `price_per_month`, `badge`, `duration_days`, `features`, `is_enabled`, `sort_order`)
VALUES
    (UUID(), 'MONTHLY', '月度', 29.00, '¥29/月', NULL, 30, 
     JSON_ARRAY(
         JSON_OBJECT('icon', '📡', 'text', '全类目内容无限解锁'),
         JSON_OBJECT('icon', '🤖', 'text', 'AI 助手优先使用权'),
         JSON_OBJECT('icon', '⚡', 'text', '新文章实时推送通知'),
         JSON_OBJECT('icon', '🎯', 'text', '专属产业分析报告')
     ), 
     1, 1),
    (UUID(), 'QUARTERLY', '季度', 78.00, '¥26/月', '推荐', 90, 
     JSON_ARRAY(
         JSON_OBJECT('icon', '📡', 'text', '全类目内容无限解锁'),
         JSON_OBJECT('icon', '🤖', 'text', 'AI 助手优先使用权'),
         JSON_OBJECT('icon', '⚡', 'text', '新文章实时推送通知'),
         JSON_OBJECT('icon', '🎯', 'text', '专属产业分析报告')
     ), 
     1, 2),
    (UUID(), 'YEARLY', '年度', 268.00, '¥22/月', '最划算', 365, 
     JSON_ARRAY(
         JSON_OBJECT('icon', '📡', 'text', '全类目内容无限解锁'),
         JSON_OBJECT('icon', '🤖', 'text', 'AI 助手优先使用权'),
         JSON_OBJECT('icon', '⚡', 'text', '新文章实时推送通知'),
         JSON_OBJECT('icon', '🎯', 'text', '专属产业分析报告')
     ), 
     1, 3);

SET FOREIGN_KEY_CHECKS = 1;
