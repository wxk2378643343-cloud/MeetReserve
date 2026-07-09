package com.meetreserve.module.booking.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.meetreserve.common.result.Result;
import com.meetreserve.module.booking.dto.*;
import com.meetreserve.module.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/api/schedule")
    public Result<ScheduleVO> schedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return Result.success(bookingService.getSchedule(date));
    }

    @GetMapping("/api/bookings/my")
    public Result<Page<BookingVO>> myBookings(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return Result.success(bookingService.myBookings(page, size, status));
    }

    @GetMapping("/api/bookings/{id}")
    public Result<BookingVO> detail(@PathVariable Long id) {
        return Result.success(bookingService.getDetail(id));
    }

    @PostMapping("/api/bookings")
    public Result<BookingVO> create(@Valid @RequestBody BookingCreateRequest request) {
        return Result.success(bookingService.create(request));
    }

    @PutMapping("/api/bookings/{id}")
    public Result<BookingVO> update(@PathVariable Long id, @RequestBody BookingUpdateRequest request) {
        return Result.success(bookingService.update(id, request));
    }

    @DeleteMapping("/api/bookings/{id}")
    public Result<Void> cancel(@PathVariable Long id) {
        bookingService.cancel(id);
        return Result.success();
    }
}
