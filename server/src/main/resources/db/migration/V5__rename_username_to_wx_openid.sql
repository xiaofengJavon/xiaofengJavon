-- Rename column only if it still exists as 'username' (idempotent)
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'user'
      AND COLUMN_NAME  = 'username'
);
SET @sql_rename = IF(@col_exists > 0,
    'ALTER TABLE `user` RENAME COLUMN `username` TO `wx_openid`',
    'SELECT 1');
PREPARE s FROM @sql_rename;
EXECUTE s;
DEALLOCATE PREPARE s;

-- Create new unique index only if it does not already exist
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'user'
      AND INDEX_NAME   = 'idx_user_wx_openid'
);
SET @sql_index = IF(@idx_exists = 0,
    'CREATE UNIQUE INDEX `idx_user_wx_openid` ON `user` (`wx_openid`)',
    'SELECT 1');
PREPARE s2 FROM @sql_index;
EXECUTE s2;
DEALLOCATE PREPARE s2;
