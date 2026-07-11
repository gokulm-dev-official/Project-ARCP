package com.smartambulance.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * GPS history for a user during a mission or session.
 */
@Document(collection = "gps_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GpsHistory {

    @Id
    private String id;

    @Indexed
    private Long userId;

    @Indexed
    private Long missionId;

    @Builder.Default
    private List<GpsPoint> points = new ArrayList<>();

    private Instant startTime;
    private Instant endTime;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GpsPoint {
        private Double latitude;
        private Double longitude;
        private Double speed;
        private Double heading;
        private Instant timestamp;
    }
}
