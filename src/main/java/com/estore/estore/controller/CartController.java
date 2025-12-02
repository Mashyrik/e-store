package com.estore.estore.controller;

import com.estore.estore.dto.request.CartItemRequest;
import com.estore.estore.dto.response.CartItemResponse;
import com.estore.estore.dto.response.CartResponse;
import com.estore.estore.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    // ✅ Должен быть: GET /api/cart
    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        CartResponse cart = cartService.getCart();
        return ResponseEntity.ok(cart);
    }

    // ✅ Должен быть: POST /api/cart/items
    @PostMapping("/items")
    public ResponseEntity<CartItemResponse> addToCart(@Valid @RequestBody CartItemRequest request) {
        CartItemResponse item = cartService.addToCart(request);
        return ResponseEntity.ok(item);
    }

    // ✅ Должен быть: PUT /api/cart/items/{productId}?quantity=...
    @PutMapping("/items/{productId}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        CartItemResponse item = cartService.updateCartItem(productId, quantity);
        if (item == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(item);
    }

    // ✅ Должен быть: DELETE /api/cart/items/{productId}
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long productId) {
        cartService.removeFromCart(productId);
        return ResponseEntity.noContent().build();
    }

    // ✅ Должен быть: DELETE /api/cart
    @DeleteMapping
    public ResponseEntity<?> clearCart() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }
}