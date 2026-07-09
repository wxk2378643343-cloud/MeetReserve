package com.meetreserve.module.booking.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingCreateRequest {

    @NotNull(message = "会议室不能为空")
    private Long roomId;

    @NotNull(message = "预约日期不能为空")
    private LocalDate bookingDate;

    @NotNull(message = "开始时间不能为空")
    private LocalTime startTime;

    @NotNull(message = "结束时间不能为空")
    private LocalTime endTime;

    @NotBlank(message = "会议主题不能为空")
    private String title;
}
