package com.smartambulance.controller;

import com.smartambulance.model.AmbulanceLocationMessage;
import com.smartambulance.model.Hospital;
import com.smartambulance.model.Location;
import com.smartambulance.service.HospitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ambulance")
public class AmbulanceController {

    @Autowired
    HospitalService hospitalService;

    @Autowired
    SimpMessagingTemplate messagingTemplate;

    @PostMapping("/hospitals")
    public ResponseEntity<List<Hospital>> getNearbyHospitals(@RequestBody Location location) {
        List<Hospital> hospitals = hospitalService.getNearbyHospitals(location, 30.0);
        return ResponseEntity.ok(hospitals);
    }

    @PostMapping("/location/update")
    public ResponseEntity<?> updateLocationRest(@RequestBody AmbulanceLocationMessage locationMessage) {
        // Broadcast location to vehicles
        messagingTemplate.convertAndSend("/topic/ambulance-location", locationMessage);
        return ResponseEntity.ok("Location broadcasted");
    }

    @MessageMapping("/update-location")
    @SendTo("/topic/ambulance-location")
    public AmbulanceLocationMessage updateLocationWs(AmbulanceLocationMessage locationMessage) {
        return locationMessage;
    }
}
