package com.estore.estore.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test")
    public String test() {
        return "🚀 E-Store API работает! PostgreSQL подключен!";
    }

    @GetMapping("/api/hello")
    public String hello() {
        return "Привет! Магазин электроники готов к работе!";
    }

    @GetMapping("/api/status")
    public String status() {
        return "✅ Статус: Backend запущен, база данных подключена";
    }
}