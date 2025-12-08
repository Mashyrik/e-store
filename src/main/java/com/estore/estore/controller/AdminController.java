package com.estore.estore.controller;

import com.estore.estore.model.User;
import com.estore.estore.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    // 👇 ЭТОТ МЕТОД УЖЕ ЕСТЬ И РАБОТАЕТ
    @GetMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminTest() {
        return "✅ Admin endpoint работает! У вас есть права администратора.";
    }

    // 👇 ИЗМЕНИТЬ ЭТОТ МЕТОД: был return "Список пользователей..."
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users); // ✅ Возвращаем JSON список пользователей
    }

    // 👇 ИЗМЕНИТЬ ЭТОТ МЕТОД: был return "Статистика магазина..."
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getStats() {
        // Возвращаем простую строку для примера
        return ResponseEntity.ok("Статистика магазина (только для админов)");
    }

    // 👇 ДОБАВИТЬ: Изменение роли пользователя
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserRole(
            @PathVariable Long id,
            @RequestParam String newRole) {
        User updatedUser = userService.updateUserRole(id, newRole);
        return ResponseEntity.ok(updatedUser);
    }

    // 👇 ДОБАВИТЬ: Удаление пользователя
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // 👇 ДОБАВИТЬ: Получение пользователя по ID
    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return ResponseEntity.ok(user);
    }
}