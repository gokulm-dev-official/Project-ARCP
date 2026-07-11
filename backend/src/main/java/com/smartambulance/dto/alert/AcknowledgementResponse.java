package com.smartambulance.dto.alert;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Acknowledgement response pushed back to ambulance via WebSocket.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcknowledgementResponse {

    private Long acknowledgementId;
    private Long alertId;
    private Long missionId;
    private Long vehicleId;
    private String vehicleNumber;
    private String driverName;
    private String message;
    private LocalDateTime timestamp;
}
