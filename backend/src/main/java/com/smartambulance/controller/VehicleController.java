package com.smartambulance.controller;

import com.smartambulance.dto.alert.AcknowledgementRequest;
import com.smartambulance.dto.alert.AcknowledgementResponse;
import com.smartambulance.dto.common.ApiResponse;
import com.smartambulance.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicle")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VEHICLE_DRIVER')")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Vehicle", description = "Vehicle alert and acknowledgement operations")
public class VehicleController {

    private final AlertService alertService;

    @PostMapping("/acknowledge")
    @Operation(summary = "Acknowledge an emergency alert (I have given way)")
    public ResponseEntity<ApiResponse<AcknowledgementResponse>> acknowledge(
            @Valid @RequestBody AcknowledgementRequest request) {
        AcknowledgementResponse response = alertService.processAcknowledgement(request);
        return ResponseEntity.ok(ApiResponse.success("Acknowledgement sent", response));
    }
}
