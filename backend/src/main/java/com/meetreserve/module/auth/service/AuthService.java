package com.meetreserve.module.auth.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.meetreserve.module.auth.dto.LoginRequest;
import com.meetreserve.module.auth.dto.LoginResponse;
import com.meetreserve.module.user.entity.SysUser;
import com.meetreserve.module.user.mapper.SysUserMapper;
import com.meetreserve.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final SysUserMapper sysUserMapper;

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (AuthenticationException e) {
            throw new org.springframework.security.authentication.BadCredentialsException("用户名或密码错误");
        }

        SysUser user = sysUserMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, request.getUsername()));
        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                user.getId(), user.getUsername(), user.getRealName(), user.getRole());
        return new LoginResponse(token, userInfo);
    }

    public LoginResponse.UserInfo getCurrentUser(Long userId) {
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new com.meetreserve.common.exception.BusinessException(404, "用户不存在");
        }
        return new LoginResponse.UserInfo(user.getId(), user.getUsername(), user.getRealName(), user.getRole());
    }
}
