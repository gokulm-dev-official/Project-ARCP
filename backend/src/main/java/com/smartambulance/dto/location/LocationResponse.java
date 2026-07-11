package com.smartambulance.dto.location;

import lombok.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationResponse {

    private Long userId;
    private String userName;
    private String role;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private Double heading;
    private boolean online;
    private Instant lastUpdate;
}
