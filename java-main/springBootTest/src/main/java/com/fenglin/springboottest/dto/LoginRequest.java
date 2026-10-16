package com.fenglin.springboottest.dto;

/**
 * 登录请求体：{ username, password, remember }
 */
public record LoginRequest(String username, String password, Boolean remember) {
}
