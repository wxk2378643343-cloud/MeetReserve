package com.meetreserve.module.room.controller;

import com.meetreserve.common.result.Result;
import com.meetreserve.module.room.dto.RecommendResult;
import com.meetreserve.module.room.service.RoomRecommendService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomRecommendService roomRecommendService;

    @GetMapping("/recommend")
    public Result<RecommendResult> recommend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime startTime,
            @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime endTime,
            @RequestParam(required = false) Long excludeBookingId) {
        return Result.success(roomRecommendService.recommend(date, startTime, endTime, excludeBookingId));
    }
}
