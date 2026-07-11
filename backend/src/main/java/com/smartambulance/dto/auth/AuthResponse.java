package com.smartambulance.dto.auth;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String type;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private String vehicleNumber;

    public static AuthResponse of(String token, Long userId, String name, String email, String role, String vehicleNumber) {
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(userId)
                .name(name)
                .email(email)
                .role(role)
                .vehicleNumber(vehicleNumber)
                .build();
    }
}
