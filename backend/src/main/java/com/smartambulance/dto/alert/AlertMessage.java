package com.smartambulance.dto.alert;

import lombok.*;

/**
 * Real-time alert message pushed to vehicles via WebSocket.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertMessage {

    private Long alertId;
    private Long missionId;
    private Long ambulanceId;
    private String ambulanceNumber;

    // Ambulance position
    private Double ambulanceLat;
    private Double ambulanceLng;
    private Double ambulanceSpeed;
    private Double ambulanceHeading;

    // Relative to vehicle
    private Double distanceMeters;
    private Double etaSeconds;
    private String direction;       // BEHIND, AHEAD, LEFT, RIGHT, APPROACHING
    private String instruction;     // "MOVE LEFT", "KEEP RIGHT", "STOP SAFELY", etc.

    // Alert severity
    private String severity;        // CRITICAL, WARNING, INFO, CLEAR

    // Mission destination
    private Double destinationLat;
    private Double destinationLng;
    private String destinationName;

    private long timestamp;
}
