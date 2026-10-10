package com.fenglin.springboottest;

import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.mapper.UserMapper;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpSession;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;

@Controller
@RequestMapping("/user")
public class UserController {
    private Log log = LogFactory.getLog(UserController.class);

    @Autowired
    private Environment environment;

    // ---------- 数据库支持（MyBatis-Plus） ----------
    @Autowired
    private UserMapper userMapper;

    /** 仅用于密码哈希/校验（BCrypt），不引入整套 Spring Security */
    private BCryptPasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        passwordEncoder = new BCryptPasswordEncoder();
        // 种子用户: 表为空时创建 admin/123，方便首次登录测试
        if (userMapper.selectCount(null) == 0) {
            userMapper.insert(new User("admin", passwordEncoder.encode("123")));
            log.info("已创建种子用户 admin（密码 123）");
        }
    }

    @RequestMapping("/to_login")
    public String toLogin(HttpSession session) {
        // 已登录用户直接进主页,无需重复登录
        if (session.getAttribute("loginUser") != null) {
            return "redirect:home";
        }
        return "user/login";
    }

    /**
     * 登录: 用户名 + 密码，密码在数据库中为 BCrypt 哈希存储。
     */
    @RequestMapping("login")
    public String login(@RequestParam("username") String username, String password, Model model,
                        HttpSession session) {
        if (password == null || password.isEmpty()) {
            model.addAttribute("msg", "请输入密码");
            return "forward:to_login";
        }

        User user = userMapper.findByUsername(username);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            model.addAttribute("msg", "用户名或密码错误");
            return "forward:to_login";
        }

        // 登录成功: 更新最后登录时间,写入 Session 保持会话
        user.setLastLogin(LocalDateTime.now());
        userMapper.updateById(user);
        session.setAttribute("loginUser", username);
        session.setMaxInactiveInterval(30 * 60); // 会话 30 分钟无活动过期
        log.info("用户登录成功: " + username);

        model.addAttribute("username", username);
        model.addAttribute("lastLogin", user.getLastLogin());
        return "user/main";
    }

    /**
     * 会话主页: 登录状态保持期间可直接访问,未登录则跳回登录页。
     */
    @RequestMapping("/home")
    public String home(HttpSession session, Model model) {
        String username = (String) session.getAttribute("loginUser");
        if (username == null) {
            model.addAttribute("msg", "请先登录");
            return "forward:to_login";
        }
        User user = userMapper.findByUsername(username);
        model.addAttribute("username", username);
        model.addAttribute("lastLogin", user != null ? user.getLastLogin() : null);
        return "user/main";
    }

    /**
     * 退出登录: 销毁会话后回到登录页。
     */
    @RequestMapping("/logout")
    public String logout(HttpSession session) {
        String username = (String) session.getAttribute("loginUser");
        session.invalidate();
        log.info("用户退出登录: " + username);
        return "redirect:to_login";
    }

    /**
     * 注册: 用户名 + 密码（6-15 位），密码 BCrypt 入库。
     */
    @RequestMapping("/register")
    public String register(@RequestParam("username") String username, String password, Model model) {
        if (username == null || !username.matches("[a-zA-Z0-9_]{3,20}")) {
            model.addAttribute("msg", "用户名只能含字母/数字/下划线，3-20 位");
            return "forward:to_login";
        }
        if (password == null || password.length() < 6 || password.length() > 15) {
            model.addAttribute("msg", "密码长度需为 6-15 位");
            return "forward:to_login";
        }
        if (userMapper.countByUsername(username) > 0) {
            model.addAttribute("msg", "该用户名已被注册");
            return "forward:to_login";
        }

        userMapper.insert(new User(username, passwordEncoder.encode(password)));
        log.info("新用户注册: " + username);
        model.addAttribute("msg", "注册成功，请登录");
        return "forward:to_login";
    }

    @RequestMapping("/to_index")
    public String toIndex() {
        return "redirect:/index.html";
    }

    /**
     * 测试接口: 展示环境配置 + 数据库中的用户数（顺带验证数据库连通性）。
     */
    @RequestMapping("/test")
    @ResponseBody
    public String test() {
        String ss = environment.getProperty("spring.application.name") + "   ";
        ss += environment.getProperty("server.port") + "   ";
        ss += "数据库用户数: " + userMapper.selectCount(null) + "   ";
        log.info("日志信息");
        log.error("日志信息");
        log.warn("日志信息");
        return ss;
    }

    /**
     * 数据库连通性检查: 直接返回数据库中所有用户名。
     */
    @RequestMapping("/db_users")
    @ResponseBody
    public String dbUsers() {
        StringBuilder sb = new StringBuilder("数据库用户列表: ");
        userMapper.selectList(null).forEach(u -> sb.append(u.getUsername()).append(" (")
                .append(u.getLastLogin() != null ? u.getLastLogin() : "从未登录").append("), "));
        return sb.toString();
    }
}
