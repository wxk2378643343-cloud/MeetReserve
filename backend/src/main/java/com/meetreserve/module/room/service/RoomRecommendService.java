package com.meetreserve.module.room.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.meetreserve.module.booking.service.BookingConflictService;
import com.meetreserve.module.room.dto.RecommendResult;
import com.meetreserve.module.room.dto.RoomVO;
import com.meetreserve.module.room.entity.MeetingRoom;
import com.meetreserve.module.room.mapper.MeetingRoomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomRecommendService {

    private final MeetingRoomMapper meetingRoomMapper;
    private final BookingConflictService bookingConflictService;

    public RecommendResult recommend(LocalDate date, LocalTime startTime, LocalTime endTime, Long excludeBookingId) {
        List<MeetingRoom> rooms = meetingRoomMapper.selectList(new LambdaQueryWrapper<MeetingRoom>()
                .eq(MeetingRoom::getStatus, 1)
                .orderByAsc(MeetingRoom::getCapacity)
                .orderByAsc(MeetingRoom::getId));

        List<RoomVO> available = rooms.stream()
                .filter(room -> !bookingConflictService.hasConflict(
                        room.getId(), date, startTime, endTime, excludeBookingId))
                .map(this::toVO)
                .collect(Collectors.toList());

        return RecommendResult.of(available);
    }

    private RoomVO toVO(MeetingRoom room) {
        RoomVO vo = new RoomVO();
        BeanUtils.copyProperties(room, vo);
        return vo;
    }
}
