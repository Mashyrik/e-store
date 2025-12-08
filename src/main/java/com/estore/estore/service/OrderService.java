package com.estore.estore.service;

import com.estore.estore.dto.request.OrderRequest;
import com.estore.estore.dto.response.CartItemResponse;
import com.estore.estore.dto.response.CartResponse;
import com.estore.estore.dto.response.OrderResponse;
import com.estore.estore.exception.BusinessException;
import com.estore.estore.exception.ResourceNotFoundException;
import com.estore.estore.model.*;
import com.estore.estore.repository.OrderRepository;
import com.estore.estore.repository.ProductRepository;
import com.estore.estore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartService cartService;

    // Получить текущего пользователя
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    // Создать заказ из корзины
    public OrderResponse createOrderFromCart(OrderRequest orderRequest) {
        User user = getCurrentUser();

        // Получаем корзину пользователя
        CartResponse cart = cartService.getCart();

        if (cart.getTotalItems() == 0) {
            throw new BusinessException("Cart is empty. Cannot create order.");
        }

        // Проверяем наличие всех товаров
        for (CartItemResponse item : cart.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.getProductId()));

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new BusinessException("Not enough stock for product: " + product.getName() +
                        ". Available: " + product.getStockQuantity() + ", Requested: " + item.getQuantity());
            }
        }

        // Создаем заказ
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(orderRequest.getShippingAddress());
        order.setNotes(orderRequest.getNotes());
        order.setStatus(Order.OrderStatus.PENDING);

        // Добавляем товары из корзины в заказ
        for (CartItemResponse cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + cartItem.getProductId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice()); // Цена на момент заказа

            order.addOrderItem(orderItem);

            // Уменьшаем количество товара на складе
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // Рассчитываем общую сумму
        order.setTotalAmount(order.calculateTotalAmount());

        // Сохраняем заказ
        Order savedOrder = orderRepository.save(order);

        // Очищаем корзину после создания заказа
        cartService.clearCart();

        return OrderResponse.fromOrder(savedOrder);
    }

    // Получить все заказы текущего пользователя
    public List<OrderResponse> getUserOrders() {
        User user = getCurrentUser();
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);

        return orders.stream()
                .map(OrderResponse::fromOrder)
                .collect(Collectors.toList());
    }

    // Получить заказ по ID (только свой заказ)
    public OrderResponse getOrderById(Long orderId) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Проверяем, что заказ принадлежит пользователю
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException("You don't have permission to view this order");
        }

        return OrderResponse.fromOrder(order);
    }

    // Получить все заказы (для администратора)
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();

        return orders.stream()
                .map(OrderResponse::fromOrder)
                .collect(Collectors.toList());
    }

    // Обновить статус заказа (для администратора)
    public OrderResponse updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        return OrderResponse.fromOrder(updatedOrder);
    }

    // 👇 НОВЫЙ МЕТОД: ОТМЕНА ЗАКАЗА
    public OrderResponse cancelOrder(Long orderId) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Проверяем, что заказ принадлежит пользователю
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException("You can only cancel your own orders");
        }

        // Проверяем, что заказ еще не доставлен или отгружен
        if (order.getStatus() == Order.OrderStatus.SHIPPED ||
                order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new BusinessException("Cannot cancel order with status: " + order.getStatus());
        }

        // Проверяем, что заказ еще не отменен
        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new BusinessException("Order is already cancelled");
        }

        // Отменяем заказ
        order.setStatus(Order.OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);

        // Возвращаем товары на склад
        for (OrderItem orderItem : cancelledOrder.getOrderItems()) {
            Product product = orderItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() + orderItem.getQuantity());
            productRepository.save(product);
        }

        return OrderResponse.fromOrder(cancelledOrder);
    }
}