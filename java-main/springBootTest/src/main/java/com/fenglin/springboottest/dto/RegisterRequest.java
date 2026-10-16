package com.fenglin.springboottest.dto;

/**
 * 注册请求体：{ username, password, captchaId, captchaInput }
 */
public record RegisterRequest(String username, String password, String captchaId, String captchaInput) {
}
