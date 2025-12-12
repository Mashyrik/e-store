package com.estore.estore.controller;

import com.estore.estore.dto.request.CartItemRequest;
import com.estore.estore.dto.response.CartItemResponse;
import com.estore.estore.dto.response.CartResponse;
import com.estore.estore.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Корзина", description = "API для управления корзиной покупок")
@SecurityRequirement(name = "bearerAuth")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    @Operation(summary = "Получить корзину", description = "Возвращает содержимое корзины текущего пользователя")
    public ResponseEntity<CartResponse> getCart() {
        CartResponse cart = cartService.getCart();
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    @Operation(summary = "Добавить товар в корзину", description = "Добавление товара в корзину пользователя")
    public ResponseEntity<CartItemResponse> addToCart(@Valid @RequestBody CartItemRequest request) {
        CartItemResponse item = cartService.addToCart(request);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/items/{productId}")
    @Operation(summary = "Обновить количество товара", description = "Изменение количества товара в корзине")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        CartItemResponse item = cartService.updateCartItem(productId, quantity);
        if (item == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/items/{productId}")
    @Operation(summary = "Удалить товар из корзины", description = "Удаление товара из корзины")
    public ResponseEntity<?> removeFromCart(@PathVariable Long productId) {
        cartService.removeFromCart(productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @Operation(summary = "Очистить корзину", description = "Удаление всех товаров из корзины")
    public ResponseEntity<?> clearCart() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }
}