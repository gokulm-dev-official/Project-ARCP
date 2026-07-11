package com.smartambulance.websocket;

import com.smartambulance.dto.alert.AcknowledgementRequest;
import com.smartambulance.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

/**
 * WebSocket handler for vehicle acknowledgements.
 * Clients send to /app/acknowledge, relayed to ambulance.
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class AcknowledgementWebSocketHandler {

    private final AlertService alertService;

    @MessageMapping("/acknowledge")
    public void handleAcknowledgement(@Payload AcknowledgementRequest request) {
        alertService.processAcknowledgement(request);
    }
}
