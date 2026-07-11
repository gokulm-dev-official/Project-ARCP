package com.smartambulance.controller;

import com.smartambulance.dto.common.ApiResponse;
import com.smartambulance.dto.location.LocationUpdate;
import com.smartambulance.dto.location.LocationResponse;
import com.smartambulance.service.LocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
@Tag(name = "Location", description = "GPS location updates")
public class LocationController {

    private final LocationService locationService;

    @PostMapping("/update")
    @Operation(summary = "Send a GPS location update")
    public ResponseEntity<ApiResponse<Void>> updateLocation(@Valid @RequestBody LocationUpdate update) {
        locationService.processLocationUpdate(update);
        return ResponseEntity.ok(ApiResponse.success("Location updated", null));
    }

    @GetMapping("/live/{userId}")
    @Operation(summary = "Get a user's live location")
    public ResponseEntity<ApiResponse<LocationResponse>> getLiveLocation(@PathVariable Long userId) {
        LocationResponse response = locationService.getLiveLocation(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/offline/{userId}")
    @Operation(summary = "Mark a user as offline")
    public ResponseEntity<ApiResponse<Void>> setOffline(@PathVariable Long userId) {
        locationService.setOffline(userId);
        return ResponseEntity.ok(ApiResponse.success("User marked offline", null));
    }
}
