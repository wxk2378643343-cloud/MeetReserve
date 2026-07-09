package com.meetreserve.module.room.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("meeting_room")
public class MeetingRoom {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String location;
    private Integer capacity;
    private String equipment;
    private Integer status;
    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
