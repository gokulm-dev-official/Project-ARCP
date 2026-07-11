package com.smartambulance.repository.jpa;

import com.smartambulance.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByMissionId(Long missionId);

    List<Alert> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId);

    List<Alert> findByMissionIdAndAcknowledgedFalse(Long missionId);

    long countByMissionId(Long missionId);

    long countByCreatedAtAfter(LocalDateTime after);

    long countByAcknowledgedTrue();
}
