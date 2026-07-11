package com.smartambulance.repository.mongo;

import com.smartambulance.document.MissionLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MissionLogRepository extends MongoRepository<MissionLog, String> {

    Optional<MissionLog> findByMissionId(Long missionId);
}
