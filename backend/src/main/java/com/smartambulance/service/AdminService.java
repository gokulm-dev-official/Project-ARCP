package com.smartambulance.service;

import com.smartambulance.dto.admin.DashboardStats;
import com.smartambulance.entity.AmbulanceStatus;
import com.smartambulance.entity.MissionStatus;
import com.smartambulance.repository.jpa.*;
import com.smartambulance.repository.mongo.LiveLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final MissionRepository missionRepository;
    private final AlertRepository alertRepository;
    private final AcknowledgementRepository ackRepository;
    private final LiveLocationRepository liveLocationRepository;

    public DashboardStats getDashboardStats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        return DashboardStats.builder()
                .totalUsers(userRepository.countByEnabledTrue())
                .activeAmbulances(ambulanceRepository.countByStatus(AmbulanceStatus.ON_MISSION))
                .activeVehicles(liveLocationRepository.countByRoleAndOnlineTrue("VEHICLE_DRIVER"))
                .onlineMissions(missionRepository.countByStatus(MissionStatus.ACTIVE))
                .todayMissions(missionRepository.countTodayMissions(todayStart))
                .completedMissions(missionRepository.countByStatus(MissionStatus.COMPLETED))
                .totalAlerts(alertRepository.count())
                .todayAlerts(alertRepository.countByCreatedAtAfter(todayStart))
                .totalAcknowledgements(ackRepository.count())
                .averageResponseTimeSeconds(missionRepository.findAverageResponseTimeSeconds())
                .connectedUsers(liveLocationRepository.countByOnlineTrue())
                .build();
    }
}
