package com.meetreserve.module.booking.dto;

import com.meetreserve.module.room.dto.RoomVO;
import lombok.Data;

import java.util.List;

@Data
public class ScheduleVO {

    private String date;
    private TimeRange timeRange;
    private List<RoomVO> rooms;
    private List<BookingVO> bookings;

    @Data
    public static class TimeRange {
        private String start;
        private String end;
        private int slotMinutes;
    }
}
