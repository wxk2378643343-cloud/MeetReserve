package com.meetreserve.module.booking.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingUpdateRequest {

    private Long roomId;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String title;
}
