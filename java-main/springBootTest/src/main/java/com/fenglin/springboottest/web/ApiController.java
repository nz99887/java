package com.fenglin.springboottest.web;

import com.fenglin.springboottest.dto.ChangePasswordRequest;
import com.fenglin.springboottest.dto.LoginRequest;
import com.fenglin.springboottest.dto.PublicUser;
import com.fenglin.springboottest.dto.RegisterRequest;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.mapper.UserMapper;
import com.fenglin.springboottest.service.CaptchaService;
import com.fenglin.springboottest.service.SessionService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * 前端（genshin-login-vue）对接的 JSON 接口层。
 * 接口路径与原版 Node server.js 完全一致：/api/captcha、/api/register、
 * /api/login、/api/logout、/api/me、/api/change-password、/api/health。
 * 数据层使用 MyBatis-Plus 操作 MySQL（root/123456，库 springboottest）。
 */
@RestController
@RequestMapping("/api")
public class ApiController {

    private final UserMapper userMapper;
    private final CaptchaService captchaService;
    private final SessionService sessionService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private static final Pattern USERNAME_RE = Pattern.compile("^[a-zA-Z0-9_]{3,20}$");

    public ApiController(UserMapper userMapper, CaptchaService captchaService, SessionService sessionService) {
        this.userMapper = userMapper;
        this.captchaService = captchaService;
        this.sessionService = sessionService;
    }

    /** 健康检查：前端用它确认后端在线 */
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("ok", true, "time", System.currentTimeMillis());
    }

    /** 获取图形验证码 { id, code } */
    @GetMapping("/captcha")
    public Map<String, String> captcha() {
        return captchaService.create();
    }

    /** 注册：{ username, password, captchaId, captchaInput } */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        String username = req.username() == null ? null : req.username().trim();
        String password = req.password();
        if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
            return bad(HttpStatus.BAD_REQUEST, "用户名和密码不能为空");
        }
        if (!USERNAME_RE.matcher(username).matches()) {
            return bad(HttpStatus.BAD_REQUEST, "用户名只能含字母/数字/下划线，3-20 位");
        }
        if (password.length() < 6 || password.length() > 15) {
            return bad(HttpStatus.BAD_REQUEST, "密码长度需为 6-15 位");
        }
        if (!captchaService.verify(req.captchaId(), req.captchaInput())) {
            return bad(HttpStatus.BAD_REQUEST, "验证码错误或已失效，请刷新重试");
        }
        if (userMapper.countByUsername(username) > 0) {
            return bad(HttpStatus.CONFLICT, "该用户名已被注册");
        }

        User user = new User(username, passwordEncoder.encode(password));
        user.setLoginCount(0L);
        userMapper.insert(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "注册成功，请登录"));
    }

    /** 登录：{ username, password, remember }，成功后写 HttpOnly Cookie(sid) */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletResponse response) {
        String username = req.username() == null ? null : req.username().trim();
        String password = req.password();
        boolean remember = Boolean.TRUE.equals(req.remember());

        User user = username == null ? null : userMapper.findByUsername(username);
        if (user == null || !passwordEncoder.matches(password == null ? "" : password, user.getPassword())) {
            return bad(HttpStatus.UNAUTHORIZED, "用户名或密码错误");
        }

        // 更新最后登录时间与累计登录次数
        user.setLastLogin(LocalDateTime.now());
        user.setLoginCount((user.getLoginCount() == null ? 0L : user.getLoginCount()) + 1);
        userMapper.updateById(user);

        String sid = sessionService.create(username, remember);
        ResponseCookie cookie = ResponseCookie.from(SessionService.COOKIE_NAME, sid)
                .httpOnly(true)
                .path("/")
                .maxAge(sessionService.getMaxAge(remember))
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(Map.of("message", "登录成功", "user", PublicUser.of(user)));
    }

    /** 退出登录：清除 sid 会话与 Cookie */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        sessionService.remove(readCookie(request, SessionService.COOKIE_NAME));
        ResponseCookie cookie = ResponseCookie.from(SessionService.COOKIE_NAME, "")
                .httpOnly(true).path("/").maxAge(0).sameSite("Lax").build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(Map.of("message", "已退出登录"));
    }

    /** 当前登录用户（未登录返回 401） */
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        String username = sessionService.getUsername(readCookie(request, SessionService.COOKIE_NAME));
        if (username == null) {
            return bad(HttpStatus.UNAUTHORIZED, "未登录");
        }
        User user = userMapper.findByUsername(username);
        return ResponseEntity.ok(Map.of("user", PublicUser.of(user)));
    }

    /** 修改密码：{ current, next } */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req, HttpServletRequest request) {
        String username = sessionService.getUsername(readCookie(request, SessionService.COOKIE_NAME));
        if (username == null) {
            return bad(HttpStatus.UNAUTHORIZED, "未登录");
        }
        User user = userMapper.findByUsername(username);
        if (!passwordEncoder.matches(req.current() == null ? "" : req.current(), user.getPassword())) {
            return bad(HttpStatus.BAD_REQUEST, "当前密码不正确");
        }
        String next = req.next();
        if (next == null || next.length() < 6 || next.length() > 15) {
            return bad(HttpStatus.BAD_REQUEST, "新密码长度需为 6-15 位");
        }
        user.setPassword(passwordEncoder.encode(next));
        userMapper.updateById(user);
        return ResponseEntity.ok(Map.of("message", "密码修改成功，请重新登录"));
    }

    // ---------- 工具 ----------

    private String readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie c : request.getCookies()) {
            if (name.equals(c.getName())) {
                return c.getValue();
            }
        }
        return null;
    }

    private ResponseEntity<Map<String, Object>> bad(HttpStatus status, String error) {
        return ResponseEntity.status(status).body(Map.of("error", error));
    }
}
