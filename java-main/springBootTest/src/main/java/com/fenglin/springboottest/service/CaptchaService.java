package com.fenglin.springboottest.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 图形验证码（服务端生成 + 校验，一次性使用，5 分钟过期）。
 * 返回 { id, code }，前端拿 code 绘制，注册时回传 id + 输入内容校验。
 */
@Service
public class CaptchaService {

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 去掉易混淆字符
    private static final long TTL = 5L * 60 * 1000;

    private final Map<String, CaptchaInfo> store = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    private static class CaptchaInfo {
        String code;
        long expiresAt;
    }

    /** 生成验证码，返回 { id, code } */
    public Map<String, String> create() {
        String id = randomHex(8);
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 4; i++) {
            code.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        CaptchaInfo info = new CaptchaInfo();
        info.code = code.toString();
        info.expiresAt = System.currentTimeMillis() + TTL;
        store.put(id, info);
        return Map.of("id", id, "code", info.code);
    }

    /** 校验验证码（大小写不敏感，一次性） */
    public boolean verify(String id, String input) {
        if (id == null || input == null) {
            return false;
        }
        CaptchaInfo info = store.get(id);
        if (info == null) {
            return false;
        }
        if (System.currentTimeMillis() > info.expiresAt) {
            store.remove(id);
            return false;
        }
        boolean ok = info.code.equalsIgnoreCase(input.trim());
        if (ok) {
            store.remove(id); // 一次性，使用即失效
        }
        return ok;
    }

    private String randomHex(int bytes) {
        byte[] buf = new byte[bytes];
        random.nextBytes(buf);
        StringBuilder sb = new StringBuilder();
        for (byte b : buf) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
