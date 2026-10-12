package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**
 * 用户数据访问层（MyBatis-Plus）。
 * 继承 BaseMapper 后自动拥有 insert/selectById/update/delete 等方法，
 * 复杂查询按需追加注解 SQL。
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

    /** 按用户名查询 */
    @Select("SELECT * FROM user WHERE username = #{username} LIMIT 1")
    User findByUsername(String username);

    /** 判断用户名是否已存在 */
    @Select("SELECT COUNT(*) FROM user WHERE username = #{username}")
    long countByUsername(String username);
}
