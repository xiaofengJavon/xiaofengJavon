-- =============================================================
-- V7: 替换占位分类为生产环境真实分类数据
--     来源：xxdy_mini_js 线上小程序（截图参考）
--     免费分类：政策通(15) + 产业情报(22) + 电子刊物(2)
--     付费分类：产业情报 > 工业机器人 (¥3/月)
-- =============================================================

SET NAMES utf8mb4;

-- 1. 清除所有占位分类（V2/V6 写入的测试数据）
DELETE FROM `category_config`;

-- 2. 政策通（免费，type='policy'）
INSERT INTO `category_config`
  (`id`,`name`,`color`,`price_monthly`,`price_quarterly`,`price_yearly`,`type`,`sort_order`,`settings_id`,`created_at`,`updated_at`)
VALUES
  (UUID(),'项目申报',   '#0ea5e9', 0.00, 0.00, 0.00, 'policy',  1, 'settings', NOW(), NOW()),
  (UUID(),'互联网经济', '#0ea5e9', 0.00, 0.00, 0.00, 'policy',  2, 'settings', NOW(), NOW()),
  (UUID(),'智能制造',   '#0ea5e9', 0.00, 0.00, 0.00, 'policy',  3, 'settings', NOW(), NOW()),
  (UUID(),'金融财税',   '#0ea5e9', 0.00, 0.00, 0.00, 'policy',  4, 'settings', NOW(), NOW()),
  (UUID(),'福州政策',   '#38bdf8', 0.00, 0.00, 0.00, 'policy',  5, 'settings', NOW(), NOW()),
  (UUID(),'厦门政策',   '#38bdf8', 0.00, 0.00, 0.00, 'policy',  6, 'settings', NOW(), NOW()),
  (UUID(),'莆田政策',   '#38bdf8', 0.00, 0.00, 0.00, 'policy',  7, 'settings', NOW(), NOW()),
  (UUID(),'三明政策',   '#38bdf8', 0.00, 0.00, 0.00, 'policy',  8, 'settings', NOW(), NOW()),
  (UUID(),'泉州政策',   '#38bdf8', 0.00, 0.00, 0.00, 'policy',  9, 'settings', NOW(), NOW()),
  (UUID(),'漳州政策',   '#38bdf8', 0.00, 0.00, 0.00, 'policy', 10, 'settings', NOW(), NOW()),
  (UUID(),'南平政策',   '#38bdf8', 0.00, 0.00, 0.00, 'policy', 11, 'settings', NOW(), NOW()),
  (UUID(),'龙岩政策',   '#38bdf8', 0.00, 0.00, 0.00, 'policy', 12, 'settings', NOW(), NOW()),
  (UUID(),'宁德政策',   '#38bdf8', 0.00, 0.00, 0.00, 'policy', 13, 'settings', NOW(), NOW()),
  (UUID(),'平潭政策',   '#38bdf8', 0.00, 0.00, 0.00, 'policy', 14, 'settings', NOW(), NOW()),
  (UUID(),'文旅政策',   '#0284c7', 0.00, 0.00, 0.00, 'policy', 15, 'settings', NOW(), NOW());

-- 3. 产业情报 · 免费（type='industry'，price=0）
INSERT INTO `category_config`
  (`id`,`name`,`color`,`price_monthly`,`price_quarterly`,`price_yearly`,`type`,`sort_order`,`settings_id`,`created_at`,`updated_at`)
VALUES
  (UUID(),'氟化工',       '#10b981', 0.00, 0.00, 0.00, 'industry', 20, 'settings', NOW(), NOW()),
  (UUID(),'石墨烯',       '#10b981', 0.00, 0.00, 0.00, 'industry', 21, 'settings', NOW(), NOW()),
  (UUID(),'轻合金',       '#10b981', 0.00, 0.00, 0.00, 'industry', 22, 'settings', NOW(), NOW()),
  (UUID(),'竹产业',       '#10b981', 0.00, 0.00, 0.00, 'industry', 23, 'settings', NOW(), NOW()),
  (UUID(),'绿色再制造',   '#34d399', 0.00, 0.00, 0.00, 'industry', 24, 'settings', NOW(), NOW()),
  (UUID(),'生物医药',     '#34d399', 0.00, 0.00, 0.00, 'industry', 25, 'settings', NOW(), NOW()),
  (UUID(),'高端纺织',     '#34d399', 0.00, 0.00, 0.00, 'industry', 26, 'settings', NOW(), NOW()),
  (UUID(),'稀土产业',     '#34d399', 0.00, 0.00, 0.00, 'industry', 27, 'settings', NOW(), NOW()),
  (UUID(),'林产业',       '#059669', 0.00, 0.00, 0.00, 'industry', 28, 'settings', NOW(), NOW()),
  (UUID(),'绿色铸锻',     '#059669', 0.00, 0.00, 0.00, 'industry', 29, 'settings', NOW(), NOW()),
  (UUID(),'新能源汽车',   '#059669', 0.00, 0.00, 0.00, 'industry', 30, 'settings', NOW(), NOW()),
  (UUID(),'锂电新能源',   '#059669', 0.00, 0.00, 0.00, 'industry', 31, 'settings', NOW(), NOW()),
  (UUID(),'不锈钢新材料', '#047857', 0.00, 0.00, 0.00, 'industry', 32, 'settings', NOW(), NOW()),
  (UUID(),'铜材料',       '#047857', 0.00, 0.00, 0.00, 'industry', 33, 'settings', NOW(), NOW()),
  (UUID(),'海洋渔业',     '#047857', 0.00, 0.00, 0.00, 'industry', 34, 'settings', NOW(), NOW()),
  (UUID(),'食用菌',       '#047857', 0.00, 0.00, 0.00, 'industry', 35, 'settings', NOW(), NOW()),
  (UUID(),'中药材',       '#6ee7b7', 0.00, 0.00, 0.00, 'industry', 36, 'settings', NOW(), NOW()),
  (UUID(),'茶产业',       '#6ee7b7', 0.00, 0.00, 0.00, 'industry', 37, 'settings', NOW(), NOW()),
  (UUID(),'机械产业专题', '#6ee7b7', 0.00, 0.00, 0.00, 'industry', 38, 'settings', NOW(), NOW()),
  (UUID(),'超精密机床',   '#6ee7b7', 0.00, 0.00, 0.00, 'industry', 39, 'settings', NOW(), NOW()),
  (UUID(),'专用车',       '#a7f3d0', 0.00, 0.00, 0.00, 'industry', 40, 'settings', NOW(), NOW()),
  (UUID(),'无人机',       '#a7f3d0', 0.00, 0.00, 0.00, 'industry', 41, 'settings', NOW(), NOW());

-- 4. 产业情报 · 付费（type='industry'，¥3/月）
INSERT INTO `category_config`
  (`id`,`name`,`color`,`price_monthly`,`price_quarterly`,`price_yearly`,`type`,`sort_order`,`settings_id`,`created_at`,`updated_at`)
VALUES
  (UUID(),'工业机器人', '#6366f1', 3.00, 8.00, 30.00, 'industry', 50, 'settings', NOW(), NOW());

-- 5. 电子刊物（免费，type='publication'）
INSERT INTO `category_config`
  (`id`,`name`,`color`,`price_monthly`,`price_quarterly`,`price_yearly`,`type`,`sort_order`,`settings_id`,`created_at`,`updated_at`)
VALUES
  (UUID(),'科技资讯月报', '#f59e0b', 0.00, 0.00, 0.00, 'publication', 60, 'settings', NOW(), NOW()),
  (UUID(),'科创快讯',     '#f59e0b', 0.00, 0.00, 0.00, 'publication', 61, 'settings', NOW(), NOW());
