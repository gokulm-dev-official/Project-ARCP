package com.smartambulance.service;

import com.smartambulance.document.LiveLocation;
import com.smartambulance.dto.mission.MissionRequest;
import com.smartambulance.dto.mission.MissionResponse;
import com.smartambulance.entity.*;
import com.smartambulance.exception.BadRequestException;
import com.smartambulance.exception.ResourceNotFoundException;
import com.smartambulance.repository.jpa.AmbulanceRepository;
import com.smartambulance.repository.jpa.MissionRepository;
import com.smartambulance.repository.jpa.AlertRepository;
import com.smartambulance.repository.jpa.AcknowledgementRepository;
import com.smartambulance.repository.mongo.LiveLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MissionService {

    private final MissionRepository missionRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final AlertRepository alertRepository;
    private final AcknowledgementRepository ackRepository;
    private final LiveLocationRepository liveLocationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MissionResponse startMission(Long userId, MissionRequest request) {
        Ambulance ambulance = ambulanceRepository.findByDriverId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance", "driverId", userId));

        // Check for existing active mission
        missionRepository.findByAmbulanceIdAndStatus(ambulance.getId(), MissionStatus.ACTIVE)
                .ifPresent(m -> {
                    throw new BadRequestException("Ambulance already has an active mission (ID: " + m.getId() + ")");
                });

        Mission mission = Mission.builder()
                .ambulance(ambulance)
                .startLat(request.getStartLat())
                .startLng(request.getStartLng())
                .endLat(request.getEndLat())
                .endLng(request.getEndLng())
                .destinationName(request.getDestinationName())
                .alertRadiusMeters(request.getAlertRadiusMeters() != null ? request.getAlertRadiusMeters() : 500.0)
                .status(MissionStatus.ACTIVE)
                .totalAlertsTriggered(0)
                .totalAcknowledgements(0)
                .build();

        mission = missionRepository.save(mission);

        // Update ambulance status
        ambulance.setStatus(AmbulanceStatus.ON_MISSION);
        ambulanceRepository.save(ambulance);

        MissionResponse response = toResponse(mission);

        // Broadcast mission start to admin
        messagingTemplate.convertAndSend("/topic/admin/missions", response);
        log.info("Mission {} started by ambulance {}", mission.getId(), ambulance.getVehicleNumber());

        return response;
    }

    @Transactional
    public MissionResponse stopMission(Long userId) {
        Ambulance ambulance = ambulanceRepository.findByDriverId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance", "driverId", userId));

        Mission mission = missionRepository.findByAmbulanceIdAndStatus(ambulance.getId(), MissionStatus.ACTIVE)
                .orElseThrow(() -> new BadRequestException("No active mission found"));

        mission.setStatus(MissionStatus.COMPLETED);
        mission.setEndTime(LocalDateTime.now());
        mission.setTotalAlertsTriggered((int) alertRepository.countByMissionId(mission.getId()));
        mission.setTotalAcknowledgements((int) ackRepository.countByMissionId(mission.getId()));

        mission = missionRepository.save(mission);

        // Update ambulance status
        ambulance.setStatus(AmbulanceStatus.AVAILABLE);
        ambulanceRepository.save(ambulance);

        MissionResponse response = toResponse(mission);

        // Broadcast "ROAD CLEAR" to all vehicles that were alerted
        messagingTemplate.convertAndSend("/topic/mission/" + mission.getId() + "/clear",
                "{\"status\": \"CLEARED\", \"missionId\": " + mission.getId() + "}");

        messagingTemplate.convertAndSend("/topic/admin/missions", response);
        log.info("Mission {} completed", mission.getId());

        return response;
    }

    public MissionResponse getActiveMission(Long userId) {
        Ambulance ambulance = ambulanceRepository.findByDriverId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance", "driverId", userId));

        Mission mission = missionRepository.findByAmbulanceIdAndStatus(ambulance.getId(), MissionStatus.ACTIVE)
                .orElse(null);

        if (mission == null) return null;

        MissionResponse response = toResponse(mission);

        // Count nearby vehicles
        LiveLocation ambLoc = liveLocationRepository.findByUserId(userId).orElse(null);
        if (ambLoc != null) {
            long nearbyCount = liveLocationRepository
                    .findNearbyByRole(ambLoc.getLongitude(), ambLoc.getLatitude(),
                            mission.getAlertRadiusMeters(), "VEHICLE_DRIVER").size();
            response.setNearbyVehicleCount((int) nearbyCount);
        }

        return response;
    }

    public List<MissionResponse> getMissionHistory(Long userId) {
        Ambulance ambulance = ambulanceRepository.findByDriverId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance", "driverId", userId));

        return missionRepository.findByAmbulanceIdOrderByStartTimeDesc(ambulance.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<MissionResponse> getAllActiveMissions() {
        return missionRepository.findByStatus(MissionStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private MissionResponse toResponse(Mission mission) {
        return MissionResponse.builder()
                .id(mission.getId())
                .ambulanceId(mission.getAmbulance().getId())
                .ambulanceNumber(mission.getAmbulance().getVehicleNumber())
                .driverName(mission.getAmbulance().getDriver().getName())
                .status(mission.getStatus().name())
                .startLat(mission.getStartLat())
                .startLng(mission.getStartLng())
                .endLat(mission.getEndLat())
                .endLng(mission.getEndLng())
                .destinationName(mission.getDestinationName())
                .alertRadiusMeters(mission.getAlertRadiusMeters())
                .distanceCoveredKm(mission.getDistanceCoveredKm())
                .startTime(mission.getStartTime())
                .endTime(mission.getEndTime())
                .totalAlertsTriggered(mission.getTotalAlertsTriggered())
                .totalAcknowledgements(mission.getTotalAcknowledgements())
                .build();
    }
}
