package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 用户表实体（MyBatis-Plus），对应 MySQL 中的 user 表。
 * 表结构见 sql/springboottest.sql。
 */
@TableName("user")
public class User {

    /** 主键，数据库自增 */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户名，唯一 */
    @TableField("username")
    private String username;

    /** BCrypt 哈希后的密码，不存明文 */
    @TableField("password")
    private String password;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("last_login")
    private LocalDateTime lastLogin;

    public User() {
    }

    public User(String username, String passwordHash) {
        this.username = username;
        this.password = passwordHash;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    @Override
    public String toString() {
        return "User{id=" + id + ", username='" + username + "', createdAt=" + createdAt + "}";
    }
}
