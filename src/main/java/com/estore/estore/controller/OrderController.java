package com.estore.estore.controller;

import com.estore.estore.dto.request.OrderRequest;
import com.estore.estore.dto.response.OrderResponse;
import com.estore.estore.model.Order;
import com.estore.estore.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Создать заказ из корзины
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        OrderResponse order = orderService.createOrderFromCart(orderRequest);
        return ResponseEntity.ok(order);
    }

    // Получить заказы текущего пользователя
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrders() {
        List<OrderResponse> orders = orderService.getUserOrders();
        return ResponseEntity.ok(orders);
    }

    // Получить конкретный заказ по ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    // Получить все заказы (только для админа)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')") // 👈 ИЗМЕНИТЬ ЗДЕСЬ
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    // Обновить статус заказа (только для админа)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')") // 👈 ИЗМЕНИТЬ ЗДЕСЬ
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam Order.OrderStatus status) {
        OrderResponse order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(order);
    }
}