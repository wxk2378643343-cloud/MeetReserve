package com.meetreserve.module.room.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.meetreserve.common.exception.BusinessException;
import com.meetreserve.module.room.dto.RoomVO;
import com.meetreserve.module.room.entity.MeetingRoom;
import com.meetreserve.module.room.mapper.MeetingRoomMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MeetingRoomService extends ServiceImpl<MeetingRoomMapper, MeetingRoom> {

    public Page<RoomVO> pageRooms(int page, int size, String keyword) {
        LambdaQueryWrapper<MeetingRoom> wrapper = new LambdaQueryWrapper<MeetingRoom>()
                .like(keyword != null && !keyword.isEmpty(), MeetingRoom::getName, keyword)
                .orderByDesc(MeetingRoom::getId);
        Page<MeetingRoom> roomPage = page(new Page<>(page, size), wrapper);
        Page<RoomVO> result = new Page<>(page, size, roomPage.getTotal());
        result.setRecords(roomPage.getRecords().stream().map(this::toVO).collect(Collectors.toList()));
        return result;
    }

    public RoomVO getRoom(Long id) {
        MeetingRoom room = getById(id);
        if (room == null) {
            throw new BusinessException(404, "会议室不存在");
        }
        return toVO(room);
    }

    public RoomVO create(MeetingRoom room) {
        if (room.getCapacity() == null) {
            room.setCapacity(10);
        }
        if (room.getStatus() == null) {
            room.setStatus(1);
        }
        save(room);
        return toVO(room);
    }

    public RoomVO update(Long id, MeetingRoom update) {
        MeetingRoom room = getById(id);
        if (room == null) {
            throw new BusinessException(404, "会议室不存在");
        }
        if (update.getName() != null) room.setName(update.getName());
        if (update.getLocation() != null) room.setLocation(update.getLocation());
        if (update.getCapacity() != null) room.setCapacity(update.getCapacity());
        if (update.getEquipment() != null) room.setEquipment(update.getEquipment());
        if (update.getStatus() != null) room.setStatus(update.getStatus());
        if (update.getDescription() != null) room.setDescription(update.getDescription());
        updateById(room);
        return toVO(room);
    }

    public void deleteRoom(Long id) {
        if (!removeById(id)) {
            throw new BusinessException(404, "会议室不存在");
        }
    }

    public List<RoomVO> listAvailable() {
        return list(new LambdaQueryWrapper<MeetingRoom>()
                .eq(MeetingRoom::getStatus, 1)
                .orderByAsc(MeetingRoom::getId))
                .stream().map(this::toVO).collect(Collectors.toList());
    }

    public boolean existsByName(String name) {
        return count(new LambdaQueryWrapper<MeetingRoom>().eq(MeetingRoom::getName, name)) > 0;
    }

    private RoomVO toVO(MeetingRoom room) {
        RoomVO vo = new RoomVO();
        BeanUtils.copyProperties(room, vo);
        return vo;
    }
}
