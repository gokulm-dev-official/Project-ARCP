package com.smartambulance.controller;

import com.smartambulance.dto.admin.DashboardStats;
import com.smartambulance.dto.common.ApiResponse;
import com.smartambulance.dto.location.LocationResponse;
import com.smartambulance.dto.mission.MissionResponse;
import com.smartambulance.service.AdminService;
import com.smartambulance.service.LocationService;
import com.smartambulance.service.MissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Admin", description = "Admin dashboard and system management")
public class AdminController {

    private final AdminService adminService;
    private final LocationService locationService;
    private final MissionService missionService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboard() {
        DashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/live-ambulances")
    @Operation(summary = "Get all online ambulance locations")
    public ResponseEntity<ApiResponse<List<LocationResponse>>> getLiveAmbulances() {
        List<LocationResponse> locations = locationService.getOnlineLocationsByRole("AMBULANCE_DRIVER");
        return ResponseEntity.ok(ApiResponse.success(locations));
    }

    @GetMapping("/live-vehicles")
    @Operation(summary = "Get all online vehicle locations")
    public ResponseEntity<ApiResponse<List<LocationResponse>>> getLiveVehicles() {
        List<LocationResponse> locations = locationService.getOnlineLocationsByRole("VEHICLE_DRIVER");
        return ResponseEntity.ok(ApiResponse.success(locations));
    }

    @GetMapping("/missions/active")
    @Operation(summary = "Get all active missions")
    public ResponseEntity<ApiResponse<List<MissionResponse>>> getActiveMissions() {
        List<MissionResponse> missions = missionService.getAllActiveMissions();
        return ResponseEntity.ok(ApiResponse.success(missions));
    }
}
