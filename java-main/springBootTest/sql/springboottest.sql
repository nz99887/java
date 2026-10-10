-- ============================================================
-- springBootTest 数据库初始化脚本
-- 数据库: springboottest (MySQL 8.0+, utf8mb4)
-- 账号  : root / 123456 (与 application.properties 一致)
--
-- 用法:
--   mysql -u root -p < sql/springboottest.sql
-- 或在 IDEA/Navicat 等工具中直接执行本文件。
--
-- 说明:
--   * 密码为 BCrypt 哈希,非明文。种子用户:
--       admin    / 123       (应用首次启动时自动创建的那个)
--       zhangsan / abc123456 (测试注册用户)
--   * 幂等: 重复执行会先 DROP 再建,数据会重置。
-- ============================================================

CREATE DATABASE IF NOT EXISTS `springboottest`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `springboottest`;

-- ---------- 用户表 ----------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username`   VARCHAR(20)  NOT NULL                COMMENT '用户名(唯一,字母/数字/下划线 3-20 位)',
  `password`   VARCHAR(100) NOT NULL                COMMENT 'BCrypt 密码哈希',
  `created_at` DATETIME(6)  DEFAULT NULL            COMMENT '注册时间',
  `last_login` DATETIME(6)  DEFAULT NULL            COMMENT '最后登录时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户表';

-- ---------- 种子数据 ----------
-- admin/123, zhangsan/abc123456 (BCrypt 哈希)
INSERT INTO `user` (`username`, `password`, `created_at`, `last_login`) VALUES
('admin', '$2a$10$0FBpttXisAFF8RT51E4oreONkXCdjJ7Y/V.Sw4RlDEeKQAoI1EkO.', NOW(), NULL),
('zhangsan', '$2a$10$cVUIC/UKTSZIsBPl4vfLEeG5nE1FQ3QokpFtLRMsq1s/0KTw91bNi', NOW(), NULL);

-- ---------- 验证 ----------
SELECT id, username, LEFT(password, 10) AS pw_prefix, created_at FROM `user`;
