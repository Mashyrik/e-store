package com.estore.estore.security;

import com.estore.estore.model.User;
import com.estore.estore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + username));

        System.out.println("🔍 UserDetailsService - Найден пользователь: " +
                username + ", роль в БД: " + user.getRole());

        UserDetails userDetails = UserPrincipal.create(user);

        System.out.println("🔍 UserDetailsService - Создан UserDetails с authorities: " +
                userDetails.getAuthorities());

        return userDetails;
    }
}