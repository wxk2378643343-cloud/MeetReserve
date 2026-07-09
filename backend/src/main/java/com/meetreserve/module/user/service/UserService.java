package com.meetreserve.module.user.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.meetreserve.common.config.MeetReserveProperties;
import com.meetreserve.common.exception.BusinessException;
import com.meetreserve.module.user.dto.UserCreateRequest;
import com.meetreserve.module.user.dto.UserUpdateRequest;
import com.meetreserve.module.user.dto.UserVO;
import com.meetreserve.module.user.entity.SysUser;
import com.meetreserve.module.user.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService extends ServiceImpl<SysUserMapper, SysUser> {

    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final PasswordEncoder passwordEncoder;
    private final MeetReserveProperties properties;

    public Page<UserVO> pageUsers(int page, int size, String keyword, String role) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<SysUser>()
                .and(StringUtils.hasText(keyword), w -> w
                        .like(SysUser::getUsername, keyword)
                        .or()
                        .like(SysUser::getRealName, keyword))
                .eq(StringUtils.hasText(role), SysUser::getRole, role)
                .orderByDesc(SysUser::getId);
        Page<SysUser> userPage = page(new Page<>(page, size), wrapper);
        Page<UserVO> result = new Page<>(page, size, userPage.getTotal());
        result.setRecords(userPage.getRecords().stream().map(this::toVO).collect(Collectors.toList()));
        return result;
    }

    public UserVO getUser(Long id) {
        SysUser user = getById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        return toVO(user);
    }

    public UserVO createUser(UserCreateRequest request) {
        if (count(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, request.getUsername())) > 0) {
            throw new BusinessException(409, "用户名已存在");
        }
        validateRole(request.getRole());
        SysUser user = new SysUser();
        user.setUsername(request.getUsername());
        user.setRealName(request.getRealName());
        user.setRole(request.getRole());
        user.setStatus(1);
        String pwd = StringUtils.hasText(request.getPassword())
                ? request.getPassword()
                : properties.getUserImport().getDefaultPassword();
        user.setPassword(passwordEncoder.encode(pwd));
        save(user);
        return toVO(user);
    }

    public UserVO updateUser(Long id, UserUpdateRequest request) {
        SysUser user = getById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        if (request.getRealName() != null) user.setRealName(request.getRealName());
        if (request.getRole() != null) {
            validateRole(request.getRole());
            user.setRole(request.getRole());
        }
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        updateById(user);
        return toVO(user);
    }

    public void deleteUser(Long id) {
        SysUser user = getById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        if ("ADMIN".equals(user.getRole())) {
            long adminCount = count(new LambdaQueryWrapper<SysUser>()
                    .eq(SysUser::getRole, "ADMIN")
                    .eq(SysUser::getStatus, 1));
            if (adminCount <= 1) {
                throw new BusinessException(400, "至少保留一个管理员账号");
            }
        }
        removeById(id);
    }

    public void resetPassword(Long id) {
        SysUser user = getById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        user.setPassword(passwordEncoder.encode(properties.getUserImport().getDefaultPassword()));
        updateById(user);
    }

    public boolean existsUsername(String username) {
        return count(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, username)) > 0;
    }

    private void validateRole(String role) {
        if (!"ADMIN".equals(role) && !"USER".equals(role)) {
            throw new BusinessException(400, "角色只能为 USER 或 ADMIN");
        }
    }

    private UserVO toVO(SysUser user) {
        UserVO vo = new UserVO();
        BeanUtils.copyProperties(user, vo);
        if (user.getCreatedAt() != null) {
            vo.setCreatedAt(user.getCreatedAt().format(DT));
        }
        return vo;
    }
}
