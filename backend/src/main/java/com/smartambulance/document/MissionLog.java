package com.smartambulance.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Mission event log stored in MongoDB for analytics and auditing.
 */
@Document(collection = "mission_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissionLog {

    @Id
    private String id;

    @Indexed
    private Long missionId;

    @Indexed
    private Long ambulanceId;

    @Builder.Default
    private List<MissionEvent> events = new ArrayList<>();

    private Map<String, Object> analytics;

    private Instant createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MissionEvent {
        private String eventType; // MISSION_STARTED, ALERT_SENT, ACK_RECEIVED, MISSION_ENDED
        private String description;
        private Map<String, Object> metadata;
        private Instant timestamp;
    }
}
