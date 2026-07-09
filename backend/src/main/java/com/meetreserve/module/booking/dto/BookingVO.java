package com.meetreserve.module.booking.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingVO {

    private Long id;
    private Long roomId;
    private String roomName;
    private Long userId;
    private String userName;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String title;
    private String status;
}
