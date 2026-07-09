package com.meetreserve.module.room.dto;

import lombok.Data;

import java.util.List;

@Data
public class RecommendResult {

    private boolean available;
    private List<RoomVO> rooms;
    private String message;

    public static RecommendResult of(List<RoomVO> rooms) {
        RecommendResult result = new RecommendResult();
        if (rooms == null || rooms.isEmpty()) {
            result.setAvailable(false);
            result.setRooms(rooms);
            result.setMessage("暂时没有空闲会议室，请修改其他时间");
        } else {
            result.setAvailable(true);
            result.setRooms(rooms);
            result.setMessage(null);
        }
        return result;
    }
}
