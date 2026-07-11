package com.smartambulance.service;

import com.smartambulance.document.LiveLocation;
import com.smartambulance.dto.location.LocationUpdate;
import com.smartambulance.dto.location.LocationResponse;
import com.smartambulance.repository.mongo.LiveLocationRepository;
import com.smartambulance.repository.mongo.GpsHistoryRepository;
import com.smartambulance.document.GpsHistory;
import com.smartambulance.entity.User;
import com.smartambulance.repository.jpa.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Manages real-time GPS location updates.
 * Stores in MongoDB, broadcasts via WebSocket, and records GPS history.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LocationService {

    private final LiveLocationRepository liveLocationRepository;
    private final GpsHistoryRepository gpsHistoryRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Process an incoming GPS update from a client.
     */
    public void processLocationUpdate(LocationUpdate update) {
        User user = userRepository.findById(update.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + update.getUserId()));

        // Upsert live location in MongoDB
        LiveLocation liveLocation = liveLocationRepository.findByUserId(update.getUserId())
                .orElse(LiveLocation.builder().userId(update.getUserId()).build());

        liveLocation.setLatitude(update.getLatitude());
        liveLocation.setLongitude(update.getLongitude());
        liveLocation.setCoordinates(new double[]{update.getLongitude(), update.getLatitude()});
        liveLocation.setSpeed(update.getSpeed());
        liveLocation.setHeading(update.getHeading());
        liveLocation.setAccuracy(update.getAccuracy());
        liveLocation.setRole(user.getRole().name());
        liveLocation.setMissionId(update.getMissionId());
        liveLocation.setTimestamp(Instant.now());
        liveLocation.setOnline(true);

        liveLocationRepository.save(liveLocation);

        // Append to GPS history if on a mission
        if (update.getMissionId() != null) {
            appendGpsHistory(update);
        }

        // Broadcast location via WebSocket
        LocationResponse response = toResponse(liveLocation, user.getName());
        messagingTemplate.convertAndSend("/topic/location/" + update.getUserId(), response);
        messagingTemplate.convertAndSend("/topic/admin/locations", response);

        log.debug("Location updated for user {} at [{}, {}]",
                update.getUserId(), update.getLatitude(), update.getLongitude());
    }

    /**
     * Find vehicles near a given point within radius.
     */
    public List<LiveLocation> findNearbyVehicles(double lat, double lng, double radiusMeters) {
        return liveLocationRepository.findNearbyByRole(lng, lat, radiusMeters, "VEHICLE_DRIVER");
    }

    /**
     * Get all online locations for a given role.
     */
    public List<LocationResponse> getOnlineLocationsByRole(String role) {
        return liveLocationRepository.findByRoleAndOnlineTrue(role).stream()
                .map(loc -> {
                    String name = userRepository.findById(loc.getUserId())
                            .map(User::getName).orElse("Unknown");
                    return toResponse(loc, name);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get a single user's live location.
     */
    public LocationResponse getLiveLocation(Long userId) {
        LiveLocation loc = liveLocationRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No location data for user: " + userId));
        String name = userRepository.findById(userId)
                .map(User::getName).orElse("Unknown");
        return toResponse(loc, name);
    }

    /**
     * Mark a user as offline.
     */
    public void setOffline(Long userId) {
        liveLocationRepository.findByUserId(userId).ifPresent(loc -> {
            loc.setOnline(false);
            liveLocationRepository.save(loc);
        });
    }

    private void appendGpsHistory(LocationUpdate update) {
        GpsHistory history = gpsHistoryRepository
                .findByUserIdAndMissionId(update.getUserId(), update.getMissionId())
                .orElseGet(() -> GpsHistory.builder()
                        .userId(update.getUserId())
                        .missionId(update.getMissionId())
                        .startTime(Instant.now())
                        .build());

        history.getPoints().add(GpsHistory.GpsPoint.builder()
                .latitude(update.getLatitude())
                .longitude(update.getLongitude())
                .speed(update.getSpeed())
                .heading(update.getHeading())
                .timestamp(Instant.now())
                .build());

        gpsHistoryRepository.save(history);
    }

    private LocationResponse toResponse(LiveLocation loc, String userName) {
        return LocationResponse.builder()
                .userId(loc.getUserId())
                .userName(userName)
                .role(loc.getRole())
                .latitude(loc.getLatitude())
                .longitude(loc.getLongitude())
                .speed(loc.getSpeed())
                .heading(loc.getHeading())
                .online(loc.isOnline())
                .lastUpdate(loc.getTimestamp())
                .build();
    }
}
