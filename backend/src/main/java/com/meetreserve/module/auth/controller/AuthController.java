package com.meetreserve.module.auth.controller;

import com.meetreserve.common.result.Result;
import com.meetreserve.common.util.SecurityUtils;
import com.meetreserve.module.auth.dto.LoginRequest;
import com.meetreserve.module.auth.dto.LoginResponse;
import com.meetreserve.module.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(authService.login(request));
    }

    @GetMapping("/me")
    public Result<LoginResponse.UserInfo> me() {
        return Result.success(authService.getCurrentUser(SecurityUtils.getCurrentUserId()));
    }
}
