package com.estore.estore.controller;

import com.estore.estore.dto.response.UserResponse;
import com.estore.estore.model.User;
import com.estore.estore.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Администрирование", description = "API для управления пользователями и статистикой (только для администраторов)")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/test")
    @Operation(summary = "Тестовый эндпоинт администратора", description = "Проверка доступа администратора")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminTest() {
        return "Admin endpoint работает! У вас есть права администратора.";
    }

    @GetMapping("/users")
    @Operation(summary = "Получить всех пользователей", description = "Возвращает список всех пользователей системы")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponse> userResponses = users.stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userResponses);
    }

    @GetMapping("/stats")
    @Operation(summary = "Получить статистику", description = "Возвращает статистику магазина")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getStats() {
        return ResponseEntity.ok("Статистика магазина (только для админов)");
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Изменить роль пользователя", description = "Обновление роли пользователя (USER/ADMIN)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserRole(
            @PathVariable Long id,
            @RequestParam String newRole) {
        User updatedUser = userService.updateUserRole(id, newRole);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Удалить пользователя", description = "Удаление пользователя из системы")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Получить пользователя по ID", description = "Возвращает информацию о конкретном пользователе")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Изменить статус пользователя", description = "Включение/отключение пользователя (enabled/disabled)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {
        User updatedUser = userService.updateUserStatus(id, enabled);
        return ResponseEntity.ok(UserResponse.fromUser(updatedUser));
    }
}