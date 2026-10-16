package com.fenglin.springboottest.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 内存会话管理（演示用，重启后失效，与原 Node server.js 行为一致）。
 * 登录成功后写入名为 sid 的 HttpOnly Cookie，/api/me、/api/change-password 据此识别登录用户。
 */
@Service
public class SessionService {

    public static final String COOKIE_NAME = "sid";

    private static final long SESSION_TTL = 24L * 3600 * 1000;
    private static final long REMEMBER_TTL = 30L * 24 * 3600 * 1000;

    private final Map<String, SessionInfo> store = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    private static class SessionInfo {
        String username;
        long expiresAt;
    }

    /** 创建会话，返回 sid */
    public String create(String username, boolean remember) {
        String sid = randomHex(32);
        SessionInfo info = new SessionInfo();
        info.username = username;
        info.expiresAt = System.currentTimeMillis() + (remember ? REMEMBER_TTL : SESSION_TTL);
        store.put(sid, info);
        return sid;
    }

    /** 返回用户名；会话不存在或已过期返回 null */
    public String getUsername(String sid) {
        if (sid == null) {
            return null;
        }
        SessionInfo info = store.get(sid);
        if (info == null) {
            return null;
        }
        if (System.currentTimeMillis() > info.expiresAt) {
            store.remove(sid);
            return null;
        }
        return info.username;
    }

    public void remove(String sid) {
        if (sid != null) {
            store.remove(sid);
        }
    }

    /** Cookie 最大存活秒数 */
    public int getMaxAge(boolean remember) {
        return (int) ((remember ? REMEMBER_TTL : SESSION_TTL) / 1000);
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
