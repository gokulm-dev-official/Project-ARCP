package com.smartambulance.dto.mission;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissionRequest {

    @NotNull(message = "Start latitude is required")
    private Double startLat;

    @NotNull(message = "Start longitude is required")
    private Double startLng;

    private Double endLat;
    private Double endLng;
    private String destinationName;

    private Double alertRadiusMeters; // defaults to 500 if null
}
