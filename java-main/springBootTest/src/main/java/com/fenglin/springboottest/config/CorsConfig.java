package com.fenglin.springboottest.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 允许 Vite 开发服务器（默认 5173）跨域调用 /api 接口。
 * 开发模式下前端通过 vite.config.js 的 proxy 把 /api 代理到本后端（同端口视为同源），
 * 此配置作为兜底，便于将前端构建产物（dist）直接托管到其它端口时也能携带 Cookie 调用。
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowCredentials(true);
    }
}
