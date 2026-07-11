package com.smartambulance.repository.mongo;

import com.smartambulance.document.GpsHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GpsHistoryRepository extends MongoRepository<GpsHistory, String> {

    Optional<GpsHistory> findByUserIdAndMissionId(Long userId, Long missionId);

    List<GpsHistory> findByUserId(Long userId);

    List<GpsHistory> findByMissionId(Long missionId);
}
