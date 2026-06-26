package com.smartambulance.controller;

import com.smartambulance.model.Role;
import com.smartambulance.model.User;
import com.smartambulance.repository.UserRepository;
import com.smartambulance.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.Data;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow();

        return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getEmail(), user.getName(), user.getRole().name()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role(Role.valueOf(signUpRequest.getRole()))
                .build();

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }
}

@Data
class LoginRequest {
    private String email;
    private String password;
}

@Data
class SignupRequest {
    private String name;
    private String email;
    private String password;
    private String role; // AMBULANCE_DRIVER or TRAFFIC_USER
}

@Data
class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String email;
    private String name;
    private String role;

    public JwtResponse(String accessToken, String id, String email, String name, String role) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
    }
}
