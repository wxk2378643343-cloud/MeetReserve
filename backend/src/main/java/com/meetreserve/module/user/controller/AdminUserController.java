package com.meetreserve.module.user.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.meetreserve.common.result.Result;
import com.meetreserve.module.user.dto.*;
import com.meetreserve.module.user.service.UserImportService;
import com.meetreserve.module.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.IOException;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;
    private final UserImportService userImportService;

    @GetMapping
    public Result<Page<UserVO>> page(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role) {
        return Result.success(userService.pageUsers(page, size, keyword, role));
    }

    @GetMapping("/{id}")
    public Result<UserVO> detail(@PathVariable Long id) {
        return Result.success(userService.getUser(id));
    }

    @PostMapping
    public Result<UserVO> create(@Valid @RequestBody UserCreateRequest request) {
        return Result.success(userService.createUser(request));
    }

    @PutMapping("/{id}")
    public Result<UserVO> update(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
        return Result.success(userService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success();
    }

    @PutMapping("/{id}/reset-password")
    public Result<Void> resetPassword(@PathVariable Long id) {
        userService.resetPassword(id);
        return Result.success();
    }

    @GetMapping("/import-template")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        userImportService.downloadTemplate(response);
    }

    @PostMapping("/import")
    public Result<ImportResult> importUsers(@RequestParam("file") MultipartFile file) throws IOException {
        return Result.success(userImportService.importUsers(file));
    }
}
