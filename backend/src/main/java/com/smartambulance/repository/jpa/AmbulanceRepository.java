package com.smartambulance.repository.jpa;

import com.smartambulance.entity.Ambulance;
import com.smartambulance.entity.AmbulanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AmbulanceRepository extends JpaRepository<Ambulance, Long> {

    Optional<Ambulance> findByDriverId(Long driverId);

    Optional<Ambulance> findByVehicleNumber(String vehicleNumber);

    List<Ambulance> findByStatus(AmbulanceStatus status);

    long countByStatus(AmbulanceStatus status);

    boolean existsByVehicleNumber(String vehicleNumber);
}
