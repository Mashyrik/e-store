package com.estore.estore.service;

import com.estore.estore.dto.response.UserProfileResponse;
import com.estore.estore.exception.ResourceNotFoundException;
import com.estore.estore.model.Order;
import com.estore.estore.model.Role;
import com.estore.estore.model.User;
import com.estore.estore.repository.OrderRepository;
import com.estore.estore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    // ============ МЕТОДЫ ДЛЯ УПРАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯМИ (АДМИН) ============

    /**
     * Получить всех пользователей (для админа)
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Получить пользователя по ID (для админа)
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Удалить пользователя (для админа)
     */
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * Изменить роль пользователя (для админа)
     */
    public User updateUserRole(Long userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        try {
            Role role = Role.valueOf(newRole.toUpperCase());
            user.setRole(role);
            return userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + newRole);
        }
    }

    // ============ ОСНОВНЫЕ МЕТОДЫ ДЛЯ АУТЕНТИФИКАЦИИ ============

    /**
     * Получить пользователя по имени
     */
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Проверить существование пользователя по имени
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * Проверить существование пользователя по email
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Сохранить пользователя (с шифрованием пароля)
     */
    public User saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * Создать администратора (если не существует)
     */
    public User createAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@estore.com");
            admin.setPassword("admin123");
            admin.setRole(Role.ROLE_ADMIN);
            return saveUser(admin);
        }
        return null;
    }

    /**
     * Создать обычного пользователя (если не существует)
     */
    public User createRegularUser() {
        if (!userRepository.existsByUsername("user")) {
            User user = new User();
            user.setUsername("user");
            user.setEmail("user@estore.com");
            user.setPassword("user123");
            user.setRole(Role.ROLE_USER);
            return saveUser(user);
        }
        return null;
    }

    // ============ МЕТОДЫ ДЛЯ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ ============

    /**
     * Получить профиль текущего пользователя со статистикой
     */
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

    /**
     * Получить базовую информацию о текущем пользователе
     */
    public Map<String, Object> getCurrentUserInfo() {
        User user = getCurrentUser();

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("email", user.getEmail());
        userInfo.put("role", user.getRole().toString());
        userInfo.put("createdAt", user.getCreatedAt());
        userInfo.put("enabled", user.isEnabled());

        return userInfo;
    }

    // ============ ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ============

    /**
     * Получить текущего аутентифицированного пользователя
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}