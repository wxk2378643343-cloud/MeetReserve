package com.meetreserve.module.user.service;

import com.meetreserve.common.config.MeetReserveProperties;
import com.meetreserve.common.exception.BusinessException;
import com.meetreserve.module.user.dto.ImportResult;
import com.meetreserve.module.user.dto.UserCreateRequest;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserImportService {

    private final UserService userService;
    private final MeetReserveProperties properties;

    public void downloadTemplate(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String fileName = URLEncoder.encode("用户导入模板.xlsx", StandardCharsets.UTF_8.name());
        response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + fileName);

        try (Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("用户");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("用户名");
            header.createCell(1).setCellValue("姓名");
            header.createCell(2).setCellValue("角色");
            header.createCell(3).setCellValue("初始密码");

            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue("zhangsan");
            sample.createCell(1).setCellValue("张三");
            sample.createCell(2).setCellValue("USER");
            sample.createCell(3).setCellValue("");

            workbook.write(response.getOutputStream());
        }
    }

    public ImportResult importUsers(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(400, "请上传文件");
        }
        String name = file.getOriginalFilename();
        if (name == null || (!name.endsWith(".xlsx") && !name.endsWith(".xls"))) {
            throw new BusinessException(400, "仅支持 .xlsx / .xls 文件");
        }

        ImportResult result = new ImportResult();
        Set<String> fileUsernames = new HashSet<>();

        DataFormatter formatter = new DataFormatter();

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            int lastRow = sheet.getLastRowNum();
            if (lastRow < 1) {
                throw new BusinessException(400, "文件中没有数据");
            }
            if (lastRow > properties.getUserImport().getMaxRows()) {
                throw new BusinessException(400, "单次导入不能超过 " + properties.getUserImport().getMaxRows() + " 行");
            }

            for (int i = 1; i <= lastRow; i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }
                result.setTotal(result.getTotal() + 1);
                int excelRow = i + 1;

                String username = cellString(row.getCell(0), formatter);
                String realName = cellString(row.getCell(1), formatter);
                String role = cellString(row.getCell(2), formatter);
                String password = cellString(row.getCell(3), formatter);

                if (!StringUtils.hasText(username)) {
                    result.addError(excelRow, username, "用户名不能为空");
                    continue;
                }
                if (!StringUtils.hasText(realName)) {
                    result.addError(excelRow, username, "姓名不能为空");
                    continue;
                }
                if (!StringUtils.hasText(role)) {
                    role = "USER";
                }
                if (!"USER".equals(role) && !"ADMIN".equals(role)) {
                    result.addError(excelRow, username, "角色只能为 USER 或 ADMIN");
                    continue;
                }
                if (!fileUsernames.add(username)) {
                    result.addError(excelRow, username, "文件中用户名重复");
                    continue;
                }
                if (userService.existsUsername(username)) {
                    result.addError(excelRow, username, "用户名已存在");
                    continue;
                }
                if (StringUtils.hasText(password) && (password.length() < 6 || password.length() > 20)) {
                    result.addError(excelRow, username, "密码长度须为 6-20 位");
                    continue;
                }

                UserCreateRequest req = new UserCreateRequest();
                req.setUsername(username);
                req.setRealName(realName);
                req.setRole(role);
                req.setPassword(StringUtils.hasText(password) ? password : null);
                userService.createUser(req);
                result.incrementSuccess();
            }
        }
        return result;
    }

    private String cellString(Cell cell, DataFormatter formatter) {
        if (cell == null) {
            return "";
        }
        String value = formatter.formatCellValue(cell);
        return value != null ? value.trim() : "";
    }
}
