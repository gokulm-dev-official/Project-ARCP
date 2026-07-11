package com.smartambulance.service;

import com.smartambulance.document.LiveLocation;
import com.smartambulance.dto.alert.AlertMessage;
import com.smartambulance.dto.alert.AcknowledgementRequest;
import com.smartambulance.dto.alert.AcknowledgementResponse;
import com.smartambulance.entity.*;
import com.smartambulance.exception.ResourceNotFoundException;
import com.smartambulance.repository.jpa.AlertRepository;
import com.smartambulance.repository.jpa.AcknowledgementRepository;
import com.smartambulance.repository.jpa.MissionRepository;
import com.smartambulance.repository.jpa.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Alert service responsible for:
 * - Detecting nearby vehicles for active missions
 * - Computing direction, distance, ETA
 * - Broadcasting alerts via WebSocket
 * - Processing acknowledgements
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final LocationService locationService;
    private final GeoCalculationService geoCalc;
    private final AlertRepository alertRepository;
    private final AcknowledgementRepository ackRepository;
    private final MissionRepository missionRepository;
    private final VehicleRepository vehicleRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Check all active missions and broadcast alerts to nearby vehicles.
     * Called periodically by the scheduler.
     */
    public void processProximityAlerts() {
        List<Mission> activeMissions = missionRepository.findByStatus(MissionStatus.ACTIVE);

        for (Mission mission : activeMissions) {
            try {
                processAlertsForMission(mission);
            } catch (Exception e) {
                log.error("Error processing alerts for mission {}: {}", mission.getId(), e.getMessage());
            }
        }
    }

    private void processAlertsForMission(Mission mission) {
        // Get ambulance's current location
        LiveLocation ambulanceLoc;
        try {
            ambulanceLoc = findAmbulanceLocation(mission);
        } catch (Exception e) {
            log.debug("No location data for ambulance in mission {}", mission.getId());
            return;
        }

        if (ambulanceLoc == null || !ambulanceLoc.isOnline()) return;

        double alertRadius = mission.getAlertRadiusMeters() != null
                ? mission.getAlertRadiusMeters() : 500.0;

        // Find nearby vehicles
        List<LiveLocation> nearbyVehicles = locationService.findNearbyVehicles(
                ambulanceLoc.getLatitude(),
                ambulanceLoc.getLongitude(),
                alertRadius
        );

        for (LiveLocation vehicleLoc : nearbyVehicles) {
            sendAlertToVehicle(mission, ambulanceLoc, vehicleLoc);
        }

        // Send "ROAD CLEAR" to vehicles that left the radius
        // (handled by the frontend based on absence of new alerts)
    }

    private void sendAlertToVehicle(Mission mission, LiveLocation ambulanceLoc, LiveLocation vehicleLoc) {
        double distance = geoCalc.calculateDistanceMeters(
                ambulanceLoc.getLatitude(), ambulanceLoc.getLongitude(),
                vehicleLoc.getLatitude(), vehicleLoc.getLongitude()
        );

        double vehicleHeading = vehicleLoc.getHeading() != null ? vehicleLoc.getHeading() : 0.0;
        String direction = geoCalc.calculateRelativeDirection(
                vehicleLoc.getLatitude(), vehicleLoc.getLongitude(), vehicleHeading,
                ambulanceLoc.getLatitude(), ambulanceLoc.getLongitude()
        );

        double ambSpeed = ambulanceLoc.getSpeed() != null ? ambulanceLoc.getSpeed() : 0.0;
        double eta = geoCalc.calculateEtaSeconds(distance, ambSpeed);
        String instruction = geoCalc.generateInstruction(direction, distance);
        String severity = geoCalc.calculateSeverity(distance);

        // Build alert message
        AlertMessage alertMsg = AlertMessage.builder()
                .missionId(mission.getId())
                .ambulanceId(mission.getAmbulance().getId())
                .ambulanceNumber(mission.getAmbulance().getVehicleNumber())
                .ambulanceLat(ambulanceLoc.getLatitude())
                .ambulanceLng(ambulanceLoc.getLongitude())
                .ambulanceSpeed(ambSpeed)
                .ambulanceHeading(ambulanceLoc.getHeading())
                .distanceMeters(Math.round(distance * 100.0) / 100.0)
                .etaSeconds(Math.round(eta * 10.0) / 10.0)
                .direction(direction)
                .instruction(instruction)
                .severity(severity)
                .destinationLat(mission.getEndLat())
                .destinationLng(mission.getEndLng())
                .destinationName(mission.getDestinationName())
                .timestamp(System.currentTimeMillis())
                .build();

        // Save alert record
        Vehicle vehicle = vehicleRepository.findByDriverId(vehicleLoc.getUserId()).orElse(null);
        if (vehicle != null) {
            Alert alert = Alert.builder()
                    .mission(mission)
                    .vehicle(vehicle)
                    .direction(AlertDirection.valueOf(direction))
                    .distanceMeters(distance)
                    .etaSeconds(eta)
                    .ambulanceSpeedKmh(ambSpeed)
                    .build();
            Alert savedAlert = alertRepository.save(alert);
            alertMsg.setAlertId(savedAlert.getId());

            // Broadcast to vehicle via WebSocket
            messagingTemplate.convertAndSend("/topic/alerts/" + vehicleLoc.getUserId(), alertMsg);
            log.debug("Alert sent to vehicle user {} — distance: {}m, direction: {}",
                    vehicleLoc.getUserId(), Math.round(distance), direction);
        }
    }

    /**
     * Process acknowledgement from a vehicle driver.
     */
    public AcknowledgementResponse processAcknowledgement(AcknowledgementRequest request) {
        Alert alert = alertRepository.findById(request.getAlertId())
                .orElseThrow(() -> new ResourceNotFoundException("Alert", "id", request.getAlertId()));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", request.getVehicleId()));

        Mission mission = missionRepository.findById(request.getMissionId())
                .orElseThrow(() -> new ResourceNotFoundException("Mission", "id", request.getMissionId()));

        // Mark alert as acknowledged
        alert.setAcknowledged(true);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alertRepository.save(alert);

        // Save acknowledgement
        Acknowledgement ack = Acknowledgement.builder()
                .alert(alert)
                .vehicle(vehicle)
                .mission(mission)
                .message(request.getMessage() != null ? request.getMessage() : "I have given way")
                .build();
        Acknowledgement savedAck = ackRepository.save(ack);

        // Build response
        AcknowledgementResponse response = AcknowledgementResponse.builder()
                .acknowledgementId(savedAck.getId())
                .alertId(alert.getId())
                .missionId(mission.getId())
                .vehicleId(vehicle.getId())
                .vehicleNumber(vehicle.getVehicleNumber())
                .driverName(vehicle.getDriver().getName())
                .message(savedAck.getMessage())
                .timestamp(savedAck.getTimestamp())
                .build();

        // Broadcast acknowledgement to ambulance driver via WebSocket
        messagingTemplate.convertAndSend("/topic/acknowledgements/" + mission.getId(), response);
        log.info("Acknowledgement received from vehicle {} for mission {}",
                vehicle.getVehicleNumber(), mission.getId());

        return response;
    }

    private LiveLocation findAmbulanceLocation(Mission mission) {
        Long driverId = mission.getAmbulance().getDriver().getId();
        return locationService.findNearbyVehicles(0, 0, Double.MAX_VALUE).stream()
                .filter(loc -> loc.getUserId().equals(driverId))
                .findFirst()
                .orElse(null);
    }
}
