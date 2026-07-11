package com.smartambulance.dto.mission;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissionResponse {

    private Long id;
    private Long ambulanceId;
    private String ambulanceNumber;
    private String driverName;
    private String status;

    private Double startLat;
    private Double startLng;
    private Double endLat;
    private Double endLng;
    private String destinationName;

    private Double alertRadiusMeters;
    private Double distanceCoveredKm;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private Integer totalAlertsTriggered;
    private Integer totalAcknowledgements;
    private Integer nearbyVehicleCount;
}
