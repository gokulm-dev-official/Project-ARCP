package com.smartambulance.service;

import com.smartambulance.model.Hospital;
import com.smartambulance.model.Location;
import com.smartambulance.repository.HospitalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class HospitalService {

    @Autowired
    HospitalRepository hospitalRepository;

    public List<Hospital> getNearbyHospitals(Location location, double radiusKm) {
        // In a real application, we would query MongoDB using geospatial queries ($nearSphere).
        // Since we don't have geospatial indexes setup here automatically, we mock or return all.
        List<Hospital> hospitals = hospitalRepository.findAll();
        
        if (hospitals.isEmpty()) {
            // Seed some data for demo
            hospitals.add(new Hospital(null, "Government Mohan Kumaramangalam", "Government", new Location(13.0827, 80.2707), 5.2, "12 min"));
            hospitals.add(new Hospital(null, "Apollo Hospital", "Private", new Location(13.0604, 80.2496), 8.1, "18 min"));
            hospitals.add(new Hospital(null, "Fortis Malar Hospital", "Private", new Location(13.0116, 80.2565), 9.4, "20 min"));
            hospitals.add(new Hospital(null, "Kauvery Hospital", "Private", new Location(13.0336, 80.2599), 12.7, "25 min"));
            hospitalRepository.saveAll(hospitals);
        }

        // Mock distance calculation for UI simulation
        hospitals.forEach(h -> {
             if (h.getDistance() == 0.0) {
                 h.setDistance(Math.round(Math.random() * 15 * 10.0) / 10.0 + 1.0); // Random distance between 1-16km
                 h.setEta((int)(h.getDistance() * 2) + " min");
             }
        });

        hospitals.sort((h1, h2) -> Double.compare(h1.getDistance(), h2.getDistance()));

        return hospitals;
    }
}
