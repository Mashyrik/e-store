package com.estore.estore.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminTest() {
        return "✅ Admin endpoint работает! У вас есть права администратора.";
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public String getUsers() {
        return "Список пользователей (только для админов)";
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public String getStats() {
        return "Статистика магазина (только для админов)";
    }
}