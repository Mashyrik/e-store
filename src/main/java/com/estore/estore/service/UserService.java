package com.estore.estore.service;

import com.estore.estore.exception.ResourceNotFoundException;
import com.estore.estore.model.User;
import com.estore.estore.model.Role; // Импортируем Role
import com.estore.estore.repository.OrderRepository;
import com.estore.estore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.estore.estore.dto.response.UserProfileResponse;
import com.estore.estore.model.Order;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User createAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@estore.com");
            admin.setPassword("admin123");
            admin.setRole(Role.ROLE_ADMIN); // Используем отдельный enum
            return saveUser(admin);
        }
        return null;
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    public UserProfileResponse getCurrentUserProfile() {
        User user = getCurrentUser();

        // Получаем статистику заказов
        List<Order> userOrders = orderRepository.findByUserId(user.getId());
        int totalOrders = userOrders.size();
        double totalSpent = userOrders.stream()
                .mapToDouble(order -> order.getTotalAmount().doubleValue())
                .sum();

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().toString(),
                user.getCreatedAt(),
                totalOrders,
                totalSpent
        );
    }

    // Простая информация о пользователе
    public Map<String, Object> getCurrentUserInfo() {
        User user = getCurrentUser();

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("email", user.getEmail());
        userInfo.put("role", user.getRole().toString());
        userInfo.put("createdAt", user.getCreatedAt());

        return userInfo;
    }

    // Вспомогательный метод для получения текущего пользователя
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}