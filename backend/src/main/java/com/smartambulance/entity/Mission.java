package com.smartambulance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Emergency mission entity. Tracks an ambulance's active emergency trip.
 */
@Entity
@Table(name = "missions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ambulance_id", nullable = false)
    private Ambulance ambulance;

    // Start location
    private Double startLat;
    private Double startLng;

    // Destination location
    private Double endLat;
    private Double endLng;
    private String destinationName;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private MissionStatus status = MissionStatus.ACTIVE;

    @Builder.Default
    private Double alertRadiusMeters = 500.0;

    private Double distanceCoveredKm;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer totalAlertsTriggered;
    private Integer totalAcknowledgements;
}
