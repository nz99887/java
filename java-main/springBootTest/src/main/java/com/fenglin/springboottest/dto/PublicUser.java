package com.fenglin.springboottest.dto;

import com.fenglin.springboottest.entity.User;

import java.time.format.DateTimeFormatter;

/**
 * 对外暴露的用户信息（脱敏，不含密码哈希），对应前端 publicUser 字段。
 */
public record PublicUser(String username, String createdAt, String lastLogin, long loginCount) {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public static PublicUser of(User u) {
        if (u == null) {
            return null;
        }
        return new PublicUser(
                u.getUsername(),
                u.getCreatedAt() == null ? null : u.getCreatedAt().format(FMT),
                u.getLastLogin() == null ? null : u.getLastLogin().format(FMT),
                u.getLoginCount() == null ? 0L : u.getLoginCount());
    }
}
