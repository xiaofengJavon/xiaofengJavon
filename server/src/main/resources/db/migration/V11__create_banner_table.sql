-- =============================================================
-- V11: 创建轮播图管理表
-- =============================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `banner` (
  `id` VARCHAR(36) PRIMARY KEY COMMENT '轮播图ID',
  `title` VARCHAR(100) NOT NULL COMMENT '轮播图标题',
  `image_url` VARCHAR(500) NOT NULL COMMENT '图片URL',
  `link_url` VARCHAR(500) DEFAULT NULL COMMENT '跳转链接（可选）',
  `link_type` VARCHAR(20) DEFAULT 'none' COMMENT '链接类型: none-无链接, article-文章详情, external-外部链接, category-分类页',
  `link_target` VARCHAR(100) DEFAULT NULL COMMENT '链接目标: 文章ID/分类名称等',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序，数字越小越靠前',
  `is_enabled` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  `start_date` DATE DEFAULT NULL COMMENT '开始展示日期（可选）',
  `end_date` DATE DEFAULT NULL COMMENT '结束展示日期（可选）',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_sort_order` (`sort_order`),
  INDEX `idx_is_enabled` (`is_enabled`),
  INDEX `idx_dates` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='轮播图配置表';

-- 插入示例轮播图数据
INSERT INTO `banner` (`id`, `title`, `image_url`, `link_url`, `link_type`, `link_target`, `sort_order`, `is_enabled`, `start_date`, `end_date`)
VALUES
  (UUID(), '欢迎使用创新资料平台', 'https://picsum.photos/seed/cxzl1/750/300', NULL, 'none', NULL, 1, TRUE, NULL, NULL),
  (UUID(), '最新产业情报', 'https://picsum.photos/seed/cxzl2/750/300', NULL, 'none', NULL, 2, TRUE, NULL, NULL),
  (UUID(), '政策解读专题', 'https://picsum.photos/seed/cxzl3/750/300', NULL, 'none', NULL, 3, TRUE, NULL, NULL);
