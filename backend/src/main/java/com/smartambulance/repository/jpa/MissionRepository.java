package com.smartambulance.repository.jpa;

import com.smartambulance.entity.Mission;
import com.smartambulance.entity.MissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MissionRepository extends JpaRepository<Mission, Long> {

    List<Mission> findByAmbulanceIdOrderByStartTimeDesc(Long ambulanceId);

    Optional<Mission> findByAmbulanceIdAndStatus(Long ambulanceId, MissionStatus status);

    List<Mission> findByStatus(MissionStatus status);

    long countByStatus(MissionStatus status);

    @Query("SELECT m FROM Mission m WHERE m.startTime >= :start AND m.startTime <= :end")
    List<Mission> findMissionsBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(m) FROM Mission m WHERE m.startTime >= :today")
    long countTodayMissions(LocalDateTime today);

    @Query("SELECT AVG(TIMESTAMPDIFF(SECOND, m.startTime, m.endTime)) FROM Mission m WHERE m.status = 'COMPLETED' AND m.endTime IS NOT NULL")
    Double findAverageResponseTimeSeconds();
}
