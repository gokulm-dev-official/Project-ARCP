package com.smartambulance.repository.mongo;

import com.smartambulance.document.LiveLocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LiveLocationRepository extends MongoRepository<LiveLocation, String> {

    Optional<LiveLocation> findByUserId(Long userId);

    List<LiveLocation> findByRole(String role);

    List<LiveLocation> findByOnlineTrue();

    List<LiveLocation> findByRoleAndOnlineTrue(String role);

    List<LiveLocation> findByMissionId(Long missionId);

    void deleteByUserId(Long userId);

    long countByOnlineTrue();

    long countByRoleAndOnlineTrue(String role);

    /**
     * Find locations near a point within a max distance (meters).
     * Uses MongoDB $nearSphere with 2dsphere index.
     */
    @Query("{ 'coordinates': { $nearSphere: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } }, 'role': ?3, 'online': true }")
    List<LiveLocation> findNearbyByRole(double longitude, double latitude, double maxDistanceMeters, String role);
}
