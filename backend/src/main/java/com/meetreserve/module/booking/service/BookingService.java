package com.meetreserve.module.booking.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.meetreserve.common.config.MeetReserveProperties;
import com.meetreserve.common.exception.BusinessException;
import com.meetreserve.common.util.SecurityUtils;
import com.meetreserve.module.booking.dto.*;
import com.meetreserve.module.booking.entity.Booking;
import com.meetreserve.module.booking.mapper.BookingMapper;
import com.meetreserve.module.room.dto.RecommendResult;
import com.meetreserve.module.room.dto.RoomVO;
import com.meetreserve.module.room.entity.MeetingRoom;
import com.meetreserve.module.room.mapper.MeetingRoomMapper;
import com.meetreserve.module.room.service.RoomRecommendService;
import com.meetreserve.module.user.entity.SysUser;
import com.meetreserve.module.user.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService extends ServiceImpl<BookingMapper, Booking> {

    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_CANCELLED = "CANCELLED";

    private final MeetReserveProperties properties;
    private final MeetingRoomMapper meetingRoomMapper;
    private final SysUserMapper sysUserMapper;
    private final BookingConflictService bookingConflictService;
    private final RoomRecommendService roomRecommendService;

    public ScheduleVO getSchedule(LocalDate date) {
        List<MeetingRoom> rooms = meetingRoomMapper.selectList(new LambdaQueryWrapper<MeetingRoom>()
                .eq(MeetingRoom::getStatus, 1)
                .orderByAsc(MeetingRoom::getId));

        List<Booking> bookings = list(new LambdaQueryWrapper<Booking>()
                .eq(Booking::getBookingDate, date)
                .eq(Booking::getStatus, STATUS_ACTIVE));

        Map<Long, String> roomNames = rooms.stream()
                .collect(Collectors.toMap(MeetingRoom::getId, MeetingRoom::getName));
        Map<Long, String> userNames = loadUserNames(bookings);

        ScheduleVO vo = new ScheduleVO();
        vo.setDate(date.toString());
        ScheduleVO.TimeRange range = new ScheduleVO.TimeRange();
        range.setStart(properties.getSchedule().getStartTime());
        range.setEnd(properties.getSchedule().getEndTime());
        range.setSlotMinutes(properties.getSchedule().getSlotMinutes());
        vo.setTimeRange(range);
        vo.setRooms(rooms.stream().map(this::toRoomVO).collect(Collectors.toList()));
        vo.setBookings(bookings.stream()
                .map(b -> toBookingVO(b, roomNames.get(b.getRoomId()), userNames.get(b.getUserId())))
                .collect(Collectors.toList()));
        return vo;
    }

    public Page<BookingVO> myBookings(int page, int size, String status) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<Booking> bookingPage = page(new Page<>(page, size), new LambdaQueryWrapper<Booking>()
                .eq(Booking::getUserId, userId)
                .eq(status != null && !status.isEmpty(), Booking::getStatus, status)
                .orderByDesc(Booking::getBookingDate)
                .orderByDesc(Booking::getStartTime));

        Map<Long, String> roomNames = meetingRoomMapper.selectBatchIds(
                bookingPage.getRecords().stream().map(Booking::getRoomId).distinct().collect(Collectors.toList())
        ).stream().collect(Collectors.toMap(MeetingRoom::getId, MeetingRoom::getName));

        SysUser user = sysUserMapper.selectById(userId);
        String userName = user != null ? user.getRealName() : "";

        Page<BookingVO> result = new Page<>(page, size, bookingPage.getTotal());
        result.setRecords(bookingPage.getRecords().stream()
                .map(b -> toBookingVO(b, roomNames.get(b.getRoomId()), userName))
                .collect(Collectors.toList()));
        return result;
    }

    public BookingVO getDetail(Long id) {
        Booking booking = getById(id);
        if (booking == null) {
            throw new BusinessException(404, "预约不存在");
        }
        MeetingRoom room = meetingRoomMapper.selectById(booking.getRoomId());
        SysUser user = sysUserMapper.selectById(booking.getUserId());
        return toBookingVO(booking,
                room != null ? room.getName() : null,
                user != null ? user.getRealName() : null);
    }

    @Transactional
    public BookingVO create(BookingCreateRequest request) {
        validateTimeRange(request.getBookingDate(), request.getStartTime(), request.getEndTime());
        MeetingRoom room = meetingRoomMapper.selectById(request.getRoomId());
        if (room == null || room.getStatus() != 1) {
            throw new BusinessException(400, "会议室不可用");
        }
        if (bookingConflictService.hasConflict(request.getRoomId(), request.getBookingDate(),
                request.getStartTime(), request.getEndTime(), null)) {
            RecommendResult recommend = roomRecommendService.recommend(
                    request.getBookingDate(), request.getStartTime(), request.getEndTime(), null);
            throw new BusinessException(409, "该时段所选会议室已被预约", recommend);
        }

        Booking booking = new Booking();
        booking.setRoomId(request.getRoomId());
        booking.setUserId(SecurityUtils.getCurrentUserId());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setTitle(request.getTitle());
        booking.setStatus(STATUS_ACTIVE);
        save(booking);

        SysUser user = sysUserMapper.selectById(booking.getUserId());
        return toBookingVO(booking, room.getName(), user.getRealName());
    }

    @Transactional
    public BookingVO update(Long id, BookingUpdateRequest request) {
        Booking booking = getById(id);
        if (booking == null) {
            throw new BusinessException(404, "预约不存在");
        }
        if (!booking.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new BusinessException(403, "只能修改自己的预约");
        }
        if (!STATUS_ACTIVE.equals(booking.getStatus())) {
            throw new BusinessException(400, "只能修改进行中的预约");
        }

        Long roomId = request.getRoomId() != null ? request.getRoomId() : booking.getRoomId();
        LocalDate date = request.getBookingDate() != null ? request.getBookingDate() : booking.getBookingDate();
        LocalTime start = request.getStartTime() != null ? request.getStartTime() : booking.getStartTime();
        LocalTime end = request.getEndTime() != null ? request.getEndTime() : booking.getEndTime();

        validateTimeRange(date, start, end);
        MeetingRoom room = meetingRoomMapper.selectById(roomId);
        if (room == null || room.getStatus() != 1) {
            throw new BusinessException(400, "会议室不可用");
        }
        if (bookingConflictService.hasConflict(roomId, date, start, end, id)) {
            RecommendResult recommend = roomRecommendService.recommend(date, start, end, id);
            throw new BusinessException(409, "该时段所选会议室已被预约", recommend);
        }

        if (request.getRoomId() != null) booking.setRoomId(request.getRoomId());
        if (request.getBookingDate() != null) booking.setBookingDate(request.getBookingDate());
        if (request.getStartTime() != null) booking.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) booking.setEndTime(request.getEndTime());
        if (request.getTitle() != null) booking.setTitle(request.getTitle());
        updateById(booking);

        SysUser user = sysUserMapper.selectById(booking.getUserId());
        return toBookingVO(booking, room.getName(), user.getRealName());
    }

    @Transactional
    public void cancel(Long id) {
        Booking booking = getById(id);
        if (booking == null) {
            throw new BusinessException(404, "预约不存在");
        }
        if (!booking.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new BusinessException(403, "只能取消自己的预约");
        }
        if (!STATUS_ACTIVE.equals(booking.getStatus())) {
            throw new BusinessException(400, "预约已取消");
        }
        booking.setStatus(STATUS_CANCELLED);
        updateById(booking);
    }

    private void validateTimeRange(LocalDate date, LocalTime start, LocalTime end) {
        LocalTime scheduleStart = LocalTime.parse(properties.getSchedule().getStartTime());
        LocalTime scheduleEnd = LocalTime.parse(properties.getSchedule().getEndTime());
        int slotMinutes = properties.getSchedule().getSlotMinutes();

        if (!start.isBefore(end)) {
            throw new BusinessException(400, "结束时间必须晚于开始时间");
        }
        if (start.isBefore(scheduleStart) || end.isAfter(scheduleEnd)) {
            throw new BusinessException(400, "预约时段须在 " + scheduleStart + " - " + scheduleEnd + " 之间");
        }
        if (start.getMinute() % slotMinutes != 0 || end.getMinute() % slotMinutes != 0) {
            throw new BusinessException(400, "时间须为 " + slotMinutes + " 分钟的整数倍");
        }
        long minutes = ChronoUnit.MINUTES.between(start, end);
        if (minutes < slotMinutes) {
            throw new BusinessException(400, "最短预约 " + slotMinutes + " 分钟");
        }
        if (minutes > properties.getBooking().getMaxDurationHours() * 60L) {
            throw new BusinessException(400, "最长预约 " + properties.getBooking().getMaxDurationHours() + " 小时");
        }
        if (date.isAfter(LocalDate.now().plusDays(properties.getBooking().getAdvanceDays()))) {
            throw new BusinessException(400, "最多提前 " + properties.getBooking().getAdvanceDays() + " 天预约");
        }
        if (date.isBefore(LocalDate.now())) {
            throw new BusinessException(400, "不能预约过去的日期");
        }
        if (date.equals(LocalDate.now())) {
            LocalDateTime slotEnd = LocalDateTime.of(date, end);
            if (slotEnd.isBefore(LocalDateTime.now())) {
                throw new BusinessException(400, "不能预约已过去的时段");
            }
        }
    }

    private Map<Long, String> loadUserNames(List<Booking> bookings) {
        List<Long> userIds = bookings.stream().map(Booking::getUserId).distinct().collect(Collectors.toList());
        if (userIds.isEmpty()) {
            return java.util.Collections.emptyMap();
        }
        return sysUserMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, SysUser::getRealName));
    }

    private RoomVO toRoomVO(MeetingRoom room) {
        RoomVO vo = new RoomVO();
        BeanUtils.copyProperties(room, vo);
        return vo;
    }

    private BookingVO toBookingVO(Booking booking, String roomName, String userName) {
        BookingVO vo = new BookingVO();
        BeanUtils.copyProperties(booking, vo);
        vo.setRoomName(roomName);
        vo.setUserName(userName);
        return vo;
    }
}
