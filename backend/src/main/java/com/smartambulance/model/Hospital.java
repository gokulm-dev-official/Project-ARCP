package com.smartambulance.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "hospitals")
public class Hospital {
    @Id
    private String id;
    private String name;
    private String type; // Government, Private
    private Location location;
    private double distance; // Can be transient, calculated during query
    private String eta;
}
