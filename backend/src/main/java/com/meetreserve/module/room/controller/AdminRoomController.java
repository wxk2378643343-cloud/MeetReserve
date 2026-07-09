package com.meetreserve.module.room.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.meetreserve.common.result.Result;
import com.meetreserve.module.room.dto.RoomVO;
import com.meetreserve.module.room.entity.MeetingRoom;
import com.meetreserve.module.room.service.MeetingRoomService;
import com.meetreserve.module.room.service.RoomImportService;
import com.meetreserve.module.user.dto.ImportResult;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
@RequestMapping("/api/admin/rooms")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRoomController {

    private final MeetingRoomService meetingRoomService;
    private final RoomImportService roomImportService;

    @GetMapping
    public Result<Page<RoomVO>> page(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return Result.success(meetingRoomService.pageRooms(page, size, keyword));
    }

    @GetMapping("/import-template")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        roomImportService.downloadTemplate(response);
    }

    @PostMapping("/import")
    public Result<ImportResult> importRooms(@RequestParam("file") MultipartFile file) throws IOException {
        return Result.success(roomImportService.importRooms(file));
    }

    @GetMapping("/{id}")
    public Result<RoomVO> detail(@PathVariable Long id) {
        return Result.success(meetingRoomService.getRoom(id));
    }

    @PostMapping
    public Result<RoomVO> create(@RequestBody MeetingRoom room) {
        return Result.success(meetingRoomService.create(room));
    }

    @PutMapping("/{id}")
    public Result<RoomVO> update(@PathVariable Long id, @RequestBody MeetingRoom room) {
        return Result.success(meetingRoomService.update(id, room));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        meetingRoomService.deleteRoom(id);
        return Result.success();
    }
}
