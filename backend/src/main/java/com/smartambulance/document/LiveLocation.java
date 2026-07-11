package com.smartambulance.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Real-time location stored in MongoDB for geospatial queries.
 * Updated every 1-2 seconds per connected user.
 */
@Document(collection = "live_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveLocation {

    @Id
    private String id;

    @Indexed
    private Long userId;

    private String role; // AMBULANCE_DRIVER or VEHICLE_DRIVER

    private Double latitude;
    private Double longitude;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private double[] coordinates; // [lng, lat] for MongoDB geospatial

    private Double speed;       // km/h
    private Double heading;     // degrees (0-360)
    private Double accuracy;    // meters

    @Indexed
    private Long missionId;     // null if no active mission

    @Indexed
    private Instant timestamp;

    private boolean online;
}
