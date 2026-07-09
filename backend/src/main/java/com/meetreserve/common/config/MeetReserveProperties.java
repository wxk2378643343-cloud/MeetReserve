package com.meetreserve.common.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "meet-reserve")
public class MeetReserveProperties {

    private Schedule schedule = new Schedule();
    private Booking booking = new Booking();
    private UserImport userImport = new UserImport();

    @Data
    public static class Schedule {
        private String startTime = "08:00";
        private String endTime = "20:00";
        private int slotMinutes = 30;
    }

    @Data
    public static class Booking {
        private int maxDurationHours = 4;
        private int advanceDays = 30;
    }

    @Data
    public static class UserImport {
        private int maxRows = 500;
        private String defaultPassword = "123456";
    }
}
