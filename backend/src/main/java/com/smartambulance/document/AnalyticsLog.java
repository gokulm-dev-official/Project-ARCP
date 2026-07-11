package com.smartambulance.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

/**
 * General analytics log entries stored in MongoDB.
 */
@Document(collection = "analytics_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsLog {

    @Id
    private String id;

    @Indexed
    private String type; // RESPONSE_TIME, ALERT_COVERAGE, MISSION_SUMMARY, etc.

    private Map<String, Object> data;

    @Indexed
    private Instant timestamp;
}
