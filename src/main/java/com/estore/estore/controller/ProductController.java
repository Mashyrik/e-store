package com.estore.estore.controller;

import com.estore.estore.dto.request.ProductRequest;
import com.estore.estore.exception.BusinessException;
import com.estore.estore.model.Product;
import com.estore.estore.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Товары", description = "API для управления товарами")
public class ProductController {

    @Autowired
    private ProductService productService;

    // --- Публичные GET методы ---
    @GetMapping
    @Operation(summary = "Получить все товары", description = "Возвращает список всех доступных товаров")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/page")
    public ResponseEntity<Page<Product>> getProductsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<Product> productsPage = productService.getAllProducts(pageable);
        return ResponseEntity.ok(productsPage);
    }


    @GetMapping("/{id}")
    @Operation(summary = "Получить товар по ID", description = "Возвращает информацию о конкретном товаре")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // --- Защищенные методы (ADMIN) ---
    @PostMapping
    @Operation(summary = "Создать товар", description = "Создание нового товара (только для администраторов)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductRequest productRequest) {
        try {
            Product product = productService.createProduct(productRequest);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            throw new BusinessException(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить товар", description = "Обновление информации о товаре (только для администраторов)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest productRequest) {
        try {
            Product updatedProduct = productService.updateProduct(id, productRequest);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            throw new BusinessException(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить товар", description = "Удаление товара (только для администраторов)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}