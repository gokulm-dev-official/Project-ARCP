package com.smartambulance.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI smartAmbulanceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Smart Ambulance Alert System API")
                        .description("Enterprise-grade real-time emergency traffic clearance platform")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Smart Ambulance Team")
                                .email("support@smartambulance.com")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .schemaRequirement("Bearer Authentication",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .bearerFormat("JWT")
                                .scheme("bearer")
                                .description("Enter JWT token"));
    }
}
