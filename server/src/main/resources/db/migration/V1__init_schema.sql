-- =============================================================
-- V1: 初始化数据库表结构
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 用户表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user` (
    `id`                VARCHAR(36)  NOT NULL COMMENT '用户UUID',
    `username`          VARCHAR(100) NOT NULL COMMENT '微信openid',
    `is_vip`            TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否VIP',
    `subscription_tier` VARCHAR(20)  NOT NULL DEFAULT 'NONE' COMMENT 'VIP等级: NONE/MONTHLY/QUARTERLY/YEARLY',
    `credits`           INT          NOT NULL DEFAULT 10 COMMENT 'AI助手积分',
    `invite_code`       VARCHAR(6)   UNIQUE COMMENT '个人邀请码',
    `invited_count`     INT          NOT NULL DEFAULT 0 COMMENT '成功邀请人数',
    `vip_expiry`        DATE         COMMENT 'VIP到期日期',
    `created_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_username` (`username`),
    UNIQUE KEY `uk_user_invite_code` (`invite_code`),
    INDEX `idx_user_vip_expiry` (`vip_expiry`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ----------------------------
-- 文章表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `article` (
    `id`             VARCHAR(36)   NOT NULL COMMENT '文章UUID',
    `title`          VARCHAR(200)  NOT NULL COMMENT '文章标题',
    `summary`        VARCHAR(500)  NOT NULL COMMENT '文章摘要',
    `content`        TEXT          NOT NULL COMMENT '文章内容(HTML)',
    `category`       VARCHAR(50)   NOT NULL COMMENT '所属分类',
    `type`           VARCHAR(20)   NOT NULL COMMENT '类型: industry/policy',
    `date`           DATE          NOT NULL COMMENT '发布日期',
    `is_premium`     TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否付费文章',
    `read_time`      INT          COMMENT '预计阅读时长(分钟)',
    `view_count`     INT          NOT NULL DEFAULT 0 COMMENT '浏览量',
    `favorite_count` INT          NOT NULL DEFAULT 0 COMMENT '收藏量',
    `likes`          INT          NOT NULL DEFAULT 0 COMMENT '点赞数',
    `share_count`    INT          NOT NULL DEFAULT 0 COMMENT '分享解锁次数',
    `is_sticky`      TINYINT(1)  NOT NULL DEFAULT 0 COMMENT '是否置顶',
    `created_at`     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_article_category` (`category`),
    INDEX `idx_article_type` (`type`),
    INDEX `idx_article_date` (`date`),
    INDEX `idx_article_is_sticky` (`is_sticky`, `date`),
    FULLTEXT INDEX `ft_article_title` (`title`, `summary`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- ----------------------------
-- 全局设置表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `global_settings` (
    `id`                 VARCHAR(20)  NOT NULL DEFAULT 'settings',
    `popup_enabled`      TINYINT(1)  NOT NULL DEFAULT 1 COMMENT '弹窗开关',
    `popup_image`        VARCHAR(500) NOT NULL DEFAULT '' COMMENT '弹窗图片URL',
    `popup_link`         VARCHAR(500) NOT NULL DEFAULT '' COMMENT '弹窗跳转链接',
    `popup_expiry_date`  DATE         COMMENT '弹窗到期日期',
    `category_colors`    JSON         COMMENT '分类颜色配置',
    `category_prices`    JSON         COMMENT '分类价格配置',
    `marketing_rules`    JSON         COMMENT '营销规则配置',
    `created_at`         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='全局设置表';

-- ----------------------------
-- 分类配置表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `category_config` (
    `id`               VARCHAR(36)     NOT NULL,
    `name`             VARCHAR(50)     NOT NULL COMMENT '分类名称',
    `color`            VARCHAR(7)      NOT NULL DEFAULT '#3b82f6' COMMENT '分类颜色',
    `price_monthly`    DECIMAL(10,2)   NOT NULL DEFAULT 2.00 COMMENT '月度价格',
    `price_quarterly`  DECIMAL(10,2)   NOT NULL DEFAULT 4.00 COMMENT '季度价格',
    `price_yearly`     DECIMAL(10,2)   NOT NULL DEFAULT 12.00 COMMENT '年度价格',
    `type`             VARCHAR(20)     NOT NULL DEFAULT 'industry' COMMENT '类型: industry/policy',
    `sort_order`       INT             NOT NULL DEFAULT 0 COMMENT '排序顺序',
    `settings_id`      VARCHAR(20)     NOT NULL DEFAULT 'settings',
    `created_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_category_name` (`name`),
    INDEX `idx_category_type` (`type`),
    INDEX `idx_category_sort` (`sort_order`),
    CONSTRAINT `fk_category_config_settings` FOREIGN KEY (`settings_id`)
        REFERENCES `global_settings` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类配置表';

-- ----------------------------
-- 订阅表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `subscription` (
    `id`          VARCHAR(36) NOT NULL,
    `user_id`     VARCHAR(36) NOT NULL,
    `category`    VARCHAR(50) NOT NULL COMMENT '订阅分类',
    `expiry_date` DATE        NOT NULL COMMENT '到期日期',
    `created_at`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_subscription_user_category` (`user_id`, `category`),
    INDEX `idx_subscription_user_id` (`user_id`),
    INDEX `idx_subscription_category` (`category`),
    INDEX `idx_subscription_expiry` (`expiry_date`),
    CONSTRAINT `fk_subscription_user` FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订阅表';

-- ----------------------------
-- 订单表 (需用反引号转义保留字)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `order` (
    `id`                    VARCHAR(36)     NOT NULL,
    `user_id`               VARCHAR(36)     NOT NULL,
    `type`                  VARCHAR(20)     NOT NULL COMMENT '订单类型: VIP/CATEGORY',
    `item`                  VARCHAR(50)     NOT NULL COMMENT '订阅项目',
    `amount`                DECIMAL(10,2)   NOT NULL COMMENT '支付金额',
    `status`                VARCHAR(20)     NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/PAID/FAILED/REFUNDED',
    `wechat_prepay_id`      VARCHAR(100)    COMMENT '微信预支付ID',
    `wechat_transaction_id` VARCHAR(100)    COMMENT '微信交易流水号',
    `created_at`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_order_user_id` (`user_id`),
    INDEX `idx_order_status` (`status`),
    INDEX `idx_order_created_at` (`created_at`),
    CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ----------------------------
-- 邀请记录表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `referral` (
    `id`          VARCHAR(36) NOT NULL,
    `referrer_id` VARCHAR(36) NOT NULL COMMENT '邀请人ID',
    `referred_id` VARCHAR(36) NOT NULL COMMENT '被邀请人ID',
    `status`      VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    `reward`      INT         NOT NULL DEFAULT 10 COMMENT '奖励积分数',
    `created_at`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_referral_referred_id` (`referred_id`),
    INDEX `idx_referral_referrer_id` (`referrer_id`),
    CONSTRAINT `fk_referral_referrer` FOREIGN KEY (`referrer_id`)
        REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_referral_referred` FOREIGN KEY (`referred_id`)
        REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邀请记录表';

-- ----------------------------
-- 已读文章表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `read_article` (
    `user_id`    VARCHAR(36) NOT NULL,
    `article_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `article_id`),
    INDEX `idx_read_article_user_id` (`user_id`),
    INDEX `idx_read_article_article_id` (`article_id`),
    CONSTRAINT `fk_read_article_user` FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_read_article_article` FOREIGN KEY (`article_id`)
        REFERENCES `article` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='已读文章表';

-- ----------------------------
-- 收藏表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `favorite` (
    `user_id`    VARCHAR(36) NOT NULL,
    `article_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `article_id`),
    INDEX `idx_favorite_user_id` (`user_id`),
    INDEX `idx_favorite_article_id` (`article_id`),
    CONSTRAINT `fk_favorite_user` FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_favorite_article` FOREIGN KEY (`article_id`)
        REFERENCES `article` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- ----------------------------
-- 分享解锁文章表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `unlocked_article` (
    `user_id`    VARCHAR(36) NOT NULL,
    `article_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `article_id`),
    INDEX `idx_unlocked_article_user_id` (`user_id`),
    INDEX `idx_unlocked_article_article_id` (`article_id`),
    CONSTRAINT `fk_unlocked_article_user` FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_unlocked_article_article` FOREIGN KEY (`article_id`)
        REFERENCES `article` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分享解锁文章表';

-- ----------------------------
-- 管理员用户表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `admin_user` (
    `id`         VARCHAR(36)  NOT NULL,
    `username`   VARCHAR(50)  NOT NULL COMMENT '管理员用户名',
    `password`   VARCHAR(100) NOT NULL COMMENT 'BCrypt加密密码',
    `role`       VARCHAR(50)  NOT NULL DEFAULT 'ADMIN',
    `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员用户表';

SET FOREIGN_KEY_CHECKS = 1;
