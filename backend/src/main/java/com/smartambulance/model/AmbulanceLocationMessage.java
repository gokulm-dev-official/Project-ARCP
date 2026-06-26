package com.smartambulance.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmbulanceLocationMessage {
    private String ambulanceId;
    private Location location;
    private String status; // "APPROACHING"
    private double distanceToUser;
    private String eta;
}
