package com.smartambulance.dto.location;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationUpdate {

    @NotNull
    private Long userId;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private Double speed;     // km/h
    private Double heading;   // degrees 0-360
    private Double accuracy;  // meters
    private Long missionId;   // null if not on mission
}
