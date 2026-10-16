package com.fenglin.springboottest.dto;

/**
 * 修改密码请求体：{ current, next }
 */
public record ChangePasswordRequest(String current, String next) {
}
