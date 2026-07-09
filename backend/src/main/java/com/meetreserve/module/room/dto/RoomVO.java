package com.meetreserve.module.room.dto;

import lombok.Data;

@Data
public class RoomVO {

    private Long id;
    private String name;
    private String location;
    private Integer capacity;
    private String equipment;
    private Integer status;
    private String description;
}
