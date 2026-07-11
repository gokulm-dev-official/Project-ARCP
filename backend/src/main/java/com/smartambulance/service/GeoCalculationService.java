package com.smartambulance.service;

import org.springframework.stereotype.Service;

/**
 * Geospatial calculation utilities.
 * Haversine distance, bearing, relative direction, speed estimation.
 */
@Service
public class GeoCalculationService {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double EARTH_RADIUS_M = 6371000.0;

    /**
     * Calculate distance between two points using Haversine formula.
     * @return distance in meters
     */
    public double calculateDistanceMeters(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_M * c;
    }

    /**
     * Calculate bearing from point1 to point2.
     * @return bearing in degrees (0-360)
     */
    public double calculateBearing(double lat1, double lng1, double lat2, double lng2) {
        double dLng = Math.toRadians(lng2 - lng1);
        double y = Math.sin(dLng) * Math.cos(Math.toRadians(lat2));
        double x = Math.cos(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2))
                - Math.sin(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.cos(dLng);
        double bearing = Math.toDegrees(Math.atan2(y, x));
        return (bearing + 360) % 360;
    }

    /**
     * Determine the relative direction of the ambulance from the vehicle's perspective.
     * Uses the ambulance heading and the bearing from vehicle to ambulance.
     *
     * @param vehicleLat    Vehicle latitude
     * @param vehicleLng    Vehicle longitude
     * @param vehicleHeading Vehicle heading in degrees
     * @param ambulanceLat  Ambulance latitude
     * @param ambulanceLng  Ambulance longitude
     * @return Direction string: BEHIND, AHEAD, LEFT, RIGHT
     */
    public String calculateRelativeDirection(
            double vehicleLat, double vehicleLng, double vehicleHeading,
            double ambulanceLat, double ambulanceLng) {

        double bearingToAmbulance = calculateBearing(vehicleLat, vehicleLng, ambulanceLat, ambulanceLng);

        // Relative angle from vehicle's heading
        double relativeAngle = (bearingToAmbulance - vehicleHeading + 360) % 360;

        if (relativeAngle >= 315 || relativeAngle < 45) {
            return "AHEAD";
        } else if (relativeAngle >= 45 && relativeAngle < 135) {
            return "RIGHT";
        } else if (relativeAngle >= 135 && relativeAngle < 225) {
            return "BEHIND";
        } else {
            return "LEFT";
        }
    }

    /**
     * Generate a driver instruction based on relative direction.
     */
    public String generateInstruction(String direction, double distanceMeters) {
        if (distanceMeters < 50) {
            return "STOP SAFELY";
        }

        return switch (direction) {
            case "BEHIND" -> "MOVE LEFT — AMBULANCE BEHIND YOU";
            case "AHEAD" -> "KEEP RIGHT — AMBULANCE AHEAD";
            case "LEFT" -> "KEEP RIGHT — AMBULANCE ON YOUR LEFT";
            case "RIGHT" -> "KEEP LEFT — AMBULANCE ON YOUR RIGHT";
            default -> "AMBULANCE APPROACHING — GIVE WAY";
        };
    }

    /**
     * Calculate ETA in seconds based on distance and speed.
     */
    public double calculateEtaSeconds(double distanceMeters, double speedKmh) {
        if (speedKmh <= 0) {
            return -1; // Unknown
        }
        double speedMs = speedKmh / 3.6;
        return distanceMeters / speedMs;
    }

    /**
     * Determine alert severity based on distance.
     */
    public String calculateSeverity(double distanceMeters) {
        if (distanceMeters < 100) {
            return "CRITICAL";
        } else if (distanceMeters < 300) {
            return "WARNING";
        } else if (distanceMeters < 500) {
            return "INFO";
        } else {
            return "CLEAR";
        }
    }
}
