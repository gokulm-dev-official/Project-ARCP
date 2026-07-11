package com.smartambulance.dto.alert;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcknowledgementRequest {

    @NotNull
    private Long alertId;

    @NotNull
    private Long missionId;

    @NotNull
    private Long vehicleId;

    private String message; // defaults to "I have given way"
}
