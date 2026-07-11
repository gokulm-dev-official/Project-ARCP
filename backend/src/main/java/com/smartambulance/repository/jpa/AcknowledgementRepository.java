package com.smartambulance.repository.jpa;

import com.smartambulance.entity.Acknowledgement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AcknowledgementRepository extends JpaRepository<Acknowledgement, Long> {

    List<Acknowledgement> findByMissionIdOrderByTimestampDesc(Long missionId);

    List<Acknowledgement> findByVehicleId(Long vehicleId);

    long countByMissionId(Long missionId);
}
