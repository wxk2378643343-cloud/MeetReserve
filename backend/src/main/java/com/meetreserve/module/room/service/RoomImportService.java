package com.meetreserve.module.room.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.meetreserve.common.config.MeetReserveProperties;
import com.meetreserve.common.exception.BusinessException;
import com.meetreserve.module.room.entity.MeetingRoom;
import com.meetreserve.module.room.mapper.MeetingRoomMapper;
import com.meetreserve.module.user.dto.ImportResult;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
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
public class RoomImportService {

    private final MeetingRoomService meetingRoomService;
    private final MeetReserveProperties properties;

    public void downloadTemplate(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String fileName = URLEncoder.encode("会议室导入模板.xlsx", StandardCharsets.UTF_8.name());
        response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + fileName);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("会议室");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("名称");
            header.createCell(1).setCellValue("位置");
            header.createCell(2).setCellValue("容量");
            header.createCell(3).setCellValue("设备");
            header.createCell(4).setCellValue("状态");
            header.createCell(5).setCellValue("备注");

            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue("301会议室");
            sample.createCell(1).setCellValue("3楼东侧");
            sample.createCell(2).setCellValue("20");
            sample.createCell(3).setCellValue("投影仪、白板");
            sample.createCell(4).setCellValue("1");
            sample.createCell(5).setCellValue("");

            workbook.write(response.getOutputStream());
        }
    }

    public ImportResult importRooms(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(400, "请上传文件");
        }
        String name = file.getOriginalFilename();
        if (name == null || (!name.endsWith(".xlsx") && !name.endsWith(".xls"))) {
            throw new BusinessException(400, "仅支持 .xlsx / .xls 文件");
        }

        ImportResult result = new ImportResult();
        Set<String> fileNames = new HashSet<>();
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

                String roomName = cellString(row.getCell(0), formatter);
                String location = cellString(row.getCell(1), formatter);
                String capacityStr = cellString(row.getCell(2), formatter);
                String equipment = cellString(row.getCell(3), formatter);
                String statusStr = cellString(row.getCell(4), formatter);
                String description = cellString(row.getCell(5), formatter);

                if (!StringUtils.hasText(roomName)) {
                    result.addError(excelRow, roomName, "会议室名称不能为空");
                    continue;
                }
                if (!fileNames.add(roomName)) {
                    result.addError(excelRow, roomName, "文件中会议室名称重复");
                    continue;
                }
                if (meetingRoomService.existsByName(roomName)) {
                    result.addError(excelRow, roomName, "会议室名称已存在");
                    continue;
                }

                int capacity = 10;
                if (StringUtils.hasText(capacityStr)) {
                    try {
                        capacity = Integer.parseInt(capacityStr);
                        if (capacity < 1) {
                            result.addError(excelRow, roomName, "容量须大于 0");
                            continue;
                        }
                    } catch (NumberFormatException e) {
                        result.addError(excelRow, roomName, "容量须为整数");
                        continue;
                    }
                }

                int status = 1;
                if (StringUtils.hasText(statusStr)) {
                    if (!"0".equals(statusStr) && !"1".equals(statusStr)) {
                        result.addError(excelRow, roomName, "状态只能为 0 或 1");
                        continue;
                    }
                    status = Integer.parseInt(statusStr);
                }

                MeetingRoom room = new MeetingRoom();
                room.setName(roomName);
                room.setLocation(location);
                room.setCapacity(capacity);
                room.setEquipment(equipment);
                room.setStatus(status);
                room.setDescription(description);
                meetingRoomService.create(room);
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
