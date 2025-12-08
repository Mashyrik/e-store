package com.estore.estore;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(
        info = @Info(
                title = "E-Store API Documentation",
                version = "1.0",
                description = "API для платформы электронной коммерции E-Store.",
                contact = @Contact(name = "E-Store Team")
        )
)
@SecurityScheme(
        name = "bearerAuth", // Имя схемы, которое будет использоваться в @SecurityRequirement
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class EStoreApplication { // Замени это имя на имя твоего класса

    public static void main(String[] args) {
        SpringApplication.run(EStoreApplication.class, args);
    }
}