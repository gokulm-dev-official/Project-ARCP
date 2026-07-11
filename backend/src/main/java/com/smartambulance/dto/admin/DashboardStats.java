package com.smartambulance.dto.admin;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats {

    private long totalUsers;
    private long activeAmbulances;
    private long activeVehicles;
    private long onlineMissions;
    private long todayMissions;
    private long completedMissions;
    private long totalAlerts;
    private long todayAlerts;
    private long totalAcknowledgements;
    private Double averageResponseTimeSeconds;
    private long connectedUsers;
}
