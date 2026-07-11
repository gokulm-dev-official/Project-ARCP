package com.smartambulance.websocket;

import com.smartambulance.dto.location.LocationUpdate;
import com.smartambulance.service.LocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

/**
 * WebSocket message handler for real-time GPS location updates.
 * Clients send to /app/location.update, processed here.
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class LocationWebSocketHandler {

    private final LocationService locationService;

    @MessageMapping("/location.update")
    public void handleLocationUpdate(@Payload LocationUpdate update) {
        locationService.processLocationUpdate(update);
    }
}
