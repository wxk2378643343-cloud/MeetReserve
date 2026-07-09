package com.meetreserve.module.booking.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.meetreserve.module.booking.entity.Booking;
import com.meetreserve.module.booking.mapper.BookingMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;

@Service
public class BookingConflictService extends ServiceImpl<BookingMapper, Booking> {

    public boolean hasConflict(Long roomId, LocalDate date, LocalTime start, LocalTime end, Long excludeId) {
        LambdaQueryWrapper<Booking> wrapper = new LambdaQueryWrapper<Booking>()
                .eq(Booking::getRoomId, roomId)
                .eq(Booking::getBookingDate, date)
                .eq(Booking::getStatus, "ACTIVE")
                .lt(Booking::getStartTime, end)
                .gt(Booking::getEndTime, start);
        if (excludeId != null) {
            wrapper.ne(Booking::getId, excludeId);
        }
        return count(wrapper) > 0;
    }
}
