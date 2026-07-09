package com.meetreserve.common.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.meetreserve.module.room.entity.MeetingRoom;
import com.meetreserve.module.room.mapper.MeetingRoomMapper;
import com.meetreserve.module.user.entity.SysUser;
import com.meetreserve.module.user.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SysUserMapper sysUserMapper;
    private final MeetingRoomMapper meetingRoomMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (sysUserMapper.selectCount(null) == 0) {
            log.info("Initializing default users...");
            createUser("admin", "系统管理员", "ADMIN", "admin123");
            createUser("user", "测试用户", "USER", "user123");
        }
        if (meetingRoomMapper.selectCount(new LambdaQueryWrapper<MeetingRoom>()) == 0) {
            log.info("Initializing sample meeting rooms...");
            createRoom("301会议室", "3楼东侧", 20, "投影仪、白板、视频会议");
            createRoom("302会议室", "3楼西侧", 10, "白板");
            createRoom("401会议室", "4楼", 30, "投影仪、视频会议");
        }
    }

    private void createUser(String username, String realName, String role, String password) {
        SysUser user = new SysUser();
        user.setUsername(username);
        user.setRealName(realName);
        user.setRole(role);
        user.setStatus(1);
        user.setPassword(passwordEncoder.encode(password));
        sysUserMapper.insert(user);
    }

    private void createRoom(String name, String location, int capacity, String equipment) {
        MeetingRoom room = new MeetingRoom();
        room.setName(name);
        room.setLocation(location);
        room.setCapacity(capacity);
        room.setEquipment(equipment);
        room.setStatus(1);
        meetingRoomMapper.insert(room);
    }
}
