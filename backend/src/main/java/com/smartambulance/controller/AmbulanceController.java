package com.smartambulance.controller;

import com.smartambulance.dto.common.ApiResponse;
import com.smartambulance.dto.location.LocationResponse;
import com.smartambulance.dto.mission.MissionRequest;
import com.smartambulance.dto.mission.MissionResponse;
import com.smartambulance.service.LocationService;
import com.smartambulance.service.MissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ambulance")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AMBULANCE_DRIVER')")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Ambulance", description = "Ambulance mission and tracking operations")
public class AmbulanceController {

    private final MissionService missionService;
    private final LocationService locationService;

    @PostMapping("/mission/start")
    @Operation(summary = "Start an emergency mission")
    public ResponseEntity<ApiResponse<MissionResponse>> startMission(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody MissionRequest request) {
        MissionResponse response = missionService.startMission(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Mission started", response));
    }

    @PostMapping("/mission/stop")
    @Operation(summary = "Stop the active mission")
    public ResponseEntity<ApiResponse<MissionResponse>> stopMission(
            @RequestAttribute("userId") Long userId) {
        MissionResponse response = missionService.stopMission(userId);
        return ResponseEntity.ok(ApiResponse.success("Mission completed", response));
    }

    @GetMapping("/mission/active")
    @Operation(summary = "Get active mission details")
    public ResponseEntity<ApiResponse<MissionResponse>> getActiveMission(
            @RequestAttribute("userId") Long userId) {
        MissionResponse response = missionService.getActiveMission(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/mission/history")
    @Operation(summary = "Get mission history")
    public ResponseEntity<ApiResponse<List<MissionResponse>>> getMissionHistory(
            @RequestAttribute("userId") Long userId) {
        List<MissionResponse> history = missionService.getMissionHistory(userId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/nearby-vehicles")
    @Operation(summary = "Get nearby vehicle locations")
    public ResponseEntity<ApiResponse<List<LocationResponse>>> getNearbyVehicles(
            @RequestAttribute("userId") Long userId) {
        LocationResponse ambLoc = locationService.getLiveLocation(userId);
        List<LocationResponse> vehicles = locationService.getOnlineLocationsByRole("VEHICLE_DRIVER");
        return ResponseEntity.ok(ApiResponse.success(vehicles));
    }
}
