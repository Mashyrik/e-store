package com.estore.estore.service;

import com.estore.estore.dto.request.CartItemRequest;
import com.estore.estore.dto.response.CartItemResponse;
import com.estore.estore.dto.response.CartResponse;
import com.estore.estore.exception.BusinessException;
import com.estore.estore.exception.ResourceNotFoundException;
import com.estore.estore.model.CartItem;
import com.estore.estore.model.Product;
import com.estore.estore.model.User;
import com.estore.estore.repository.CartItemRepository;
import com.estore.estore.repository.ProductRepository;
import com.estore.estore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    // Получить текущего пользователя из SecurityContext
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    // Получить корзину пользователя
    public CartResponse getCart() {
        User user = getCurrentUser();
        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        List<CartItemResponse> items = cartItems.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return new CartResponse(items, totalAmount, totalItems);
    }

    // Добавить товар в корзину
    public CartItemResponse addToCart(CartItemRequest request) {
        User user = getCurrentUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        // Проверяем наличие товара
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BusinessException("Not enough stock for product: " + product.getName());
        }

        // Проверяем, есть ли уже этот товар в корзине
        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductId(user.getId(), product.getId());

        CartItem cartItem;
        if (existingItem.isPresent()) {
            // Обновляем количество если товар уже в корзине
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            // Создаем новый элемент корзины
            cartItem = new CartItem(user, product, request.getQuantity());
        }

        cartItemRepository.save(cartItem);
        return convertToResponse(cartItem);
    }

    // Обновить количество товара в корзине
    public CartItemResponse updateCartItem(Long productId, Integer quantity) {
        User user = getCurrentUser();
        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in cart: " + productId));

        Product product = cartItem.getProduct();

        // Проверяем наличие товара
        if (product.getStockQuantity() < quantity) {
            throw new BusinessException("Not enough stock for product: " + product.getName());
        }

        if (quantity <= 0) {
            // Если количество <= 0, удаляем товар из корзины
            cartItemRepository.delete(cartItem);
            return null;
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
        return convertToResponse(cartItem);
    }

    // Удалить товар из корзины
    public void removeFromCart(Long productId) {
        User user = getCurrentUser();
        cartItemRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    // Очистить корзину
    public void clearCart() {
        User user = getCurrentUser();
        cartItemRepository.deleteByUserId(user.getId());
    }

    // Вспомогательный метод для конвертации CartItem в CartItemResponse
    private CartItemResponse convertToResponse(CartItem cartItem) {
        Product product = cartItem.getProduct();
        return new CartItemResponse(
                cartItem.getId(),
                product.getId(),
                product.getName(),
                product.getPrice(),
                cartItem.getQuantity(),
                cartItem.getSubTotal(),
                cartItem.getAddedAt().toString()
        );
    }
}