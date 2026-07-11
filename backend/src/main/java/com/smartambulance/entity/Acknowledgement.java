package com.smartambulance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Acknowledgement from a vehicle driver confirming they have given way.
 */
@Entity
@Table(name = "acknowledgements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Acknowledgement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alert_id", nullable = false)
    private Alert alert;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;

    @Builder.Default
    private String message = "I have given way";

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;
}
