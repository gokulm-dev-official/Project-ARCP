package com.smartambulance.service;

import com.smartambulance.dto.auth.AuthResponse;
import com.smartambulance.dto.auth.LoginRequest;
import com.smartambulance.dto.auth.RegisterRequest;
import com.smartambulance.entity.*;
import com.smartambulance.exception.BadRequestException;
import com.smartambulance.repository.jpa.AmbulanceRepository;
import com.smartambulance.repository.jpa.UserRepository;
import com.smartambulance.repository.jpa.VehicleRepository;
import com.smartambulance.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Role role;
        try {
            role = Role.valueOf(request.getRole());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }

        // Create user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        String vehicleNumber = request.getVehicleNumber();

        // Create role-specific entity
        if (role == Role.AMBULANCE_DRIVER) {
            if (vehicleNumber != null && ambulanceRepository.existsByVehicleNumber(vehicleNumber)) {
                throw new BadRequestException("Ambulance number already registered");
            }
            Ambulance ambulance = Ambulance.builder()
                    .vehicleNumber(vehicleNumber != null ? vehicleNumber : "AMB-" + user.getId())
                    .driver(user)
                    .hospitalName(request.getHospitalName())
                    .status(AmbulanceStatus.AVAILABLE)
                    .build();
            ambulanceRepository.save(ambulance);
        } else if (role == Role.VEHICLE_DRIVER) {
            if (vehicleNumber != null && vehicleRepository.existsByVehicleNumber(vehicleNumber)) {
                throw new BadRequestException("Vehicle number already registered");
            }
            Vehicle vehicle = Vehicle.builder()
                    .vehicleNumber(vehicleNumber != null ? vehicleNumber : "VEH-" + user.getId())
                    .driver(user)
                    .vehicleType(request.getVehicleType())
                    .build();
            vehicleRepository.save(vehicle);
        }

        // Generate token
        String token = jwtUtils.generateToken(user.getEmail());

        log.info("User registered: {} ({})", user.getEmail(), role);

        return AuthResponse.of(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                role.name(),
                vehicleNumber
        );
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = jwtUtils.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String vehicleNumber = null;
        if (user.getRole() == Role.AMBULANCE_DRIVER) {
            vehicleNumber = ambulanceRepository.findByDriverId(user.getId())
                    .map(Ambulance::getVehicleNumber).orElse(null);
        } else if (user.getRole() == Role.VEHICLE_DRIVER) {
            vehicleNumber = vehicleRepository.findByDriverId(user.getId())
                    .map(Vehicle::getVehicleNumber).orElse(null);
        }

        log.info("User logged in: {} ({})", user.getEmail(), user.getRole());

        return AuthResponse.of(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                vehicleNumber
        );
    }

    public AuthResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        String vehicleNumber = null;
        if (user.getRole() == Role.AMBULANCE_DRIVER) {
            vehicleNumber = ambulanceRepository.findByDriverId(user.getId())
                    .map(Ambulance::getVehicleNumber).orElse(null);
        } else if (user.getRole() == Role.VEHICLE_DRIVER) {
            vehicleNumber = vehicleRepository.findByDriverId(user.getId())
                    .map(Vehicle::getVehicleNumber).orElse(null);
        }

        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .vehicleNumber(vehicleNumber)
                .build();
    }
}
