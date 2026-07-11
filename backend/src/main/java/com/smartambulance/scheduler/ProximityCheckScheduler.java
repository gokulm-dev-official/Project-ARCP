package com.smartambulance.scheduler;

import com.smartambulance.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Periodic proximity check scheduler.
 * Runs every second to detect vehicles near active ambulances
 * and broadcast emergency alerts.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProximityCheckScheduler {

    private final AlertService alertService;

    @Scheduled(fixedRateString = "${app.alert.broadcast-interval-ms:1000}")
    public void checkProximity() {
        try {
            alertService.processProximityAlerts();
        } catch (Exception e) {
            log.error("Proximity check error: {}", e.getMessage());
        }
    }
}
