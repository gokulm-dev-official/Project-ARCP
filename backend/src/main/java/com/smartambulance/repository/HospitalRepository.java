package com.smartambulance.repository;

import com.smartambulance.model.Hospital;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface HospitalRepository extends MongoRepository<Hospital, String> {
}
