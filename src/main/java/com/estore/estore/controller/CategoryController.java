package com.estore.estore.controller;

import com.estore.estore.dto.request.CategoryRequest;
import com.estore.estore.exception.BusinessException;
import com.estore.estore.exception.ResourceNotFoundException;
import com.estore.estore.model.Category;
import com.estore.estore.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Категории", description = "API для управления категориями товаров")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // Публичные GET методы
    @GetMapping
    @Operation(summary = "Получить все категории", description = "Возвращает список всех категорий")
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить категорию по ID", description = "Возвращает информацию о конкретной категории")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Защищенные методы (ADMIN)
    @PostMapping
    @Operation(summary = "Создать категорию", description = "Создание новой категории (только для администраторов)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryRequest categoryRequest) {
        try {
            Category category = categoryService.createCategory(categoryRequest);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            throw new BusinessException(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить категорию", description = "Обновление информации о категории (только для администраторов)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest categoryRequest) {
        try {
            Category updatedCategory = categoryService.updateCategory(id, categoryRequest);
            return ResponseEntity.ok(updatedCategory);
        } catch (RuntimeException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить категорию", description = "Удаление категории (только для администраторов)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }
    }
}