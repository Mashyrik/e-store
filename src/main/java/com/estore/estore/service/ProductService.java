package com.estore.estore.service;

import com.estore.estore.dto.request.ProductRequest;
import com.estore.estore.model.Category;
import com.estore.estore.model.Product;
import com.estore.estore.repository.CategoryRepository;
import com.estore.estore.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> searchProducts(String query) {
        return productRepository.searchProducts(query);
    }

    public List<Product> getAvailableProducts() {
        return productRepository.findByStockQuantityGreaterThan(0);
    }

    public Product createProduct(ProductRequest productRequest) {
        // Проверяем, нет ли уже продукта с такой моделью
        if (productRepository.existsByModel(productRequest.getModel())) {
            throw new RuntimeException("Product with model '" + productRequest.getModel() + "' already exists");
        }

        // Находим категорию
        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + productRequest.getCategoryId()));

        // Создаем продукт из DTO
        Product product = new Product();
        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setPrice(productRequest.getPrice());
        product.setModel(productRequest.getModel());
        product.setCategory(category);
        product.setStockQuantity(productRequest.getStockQuantity());

        return productRepository.save(product);
    }

    // Старый метод для обратной совместимости (если нужен)
    public Product createProduct(Product product) {
        // Проверяем, нет ли уже продукта с такой моделью
        if (productRepository.existsByModel(product.getModel())) {
            throw new RuntimeException("Product with model '" + product.getModel() + "' already exists");
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductRequest productRequest) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        // Находим категорию если она изменилась
        if (!product.getCategory().getId().equals(productRequest.getCategoryId())) {
            Category category = categoryRepository.findById(productRequest.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + productRequest.getCategoryId()));
            product.setCategory(category);
        }

        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setPrice(productRequest.getPrice());
        product.setModel(productRequest.getModel());
        product.setStockQuantity(productRequest.getStockQuantity());

        return productRepository.save(product);
    }

    // Старый метод для обратной совместимости
    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setModel(productDetails.getModel());
        product.setStockQuantity(productDetails.getStockQuantity());

        if (productDetails.getCategory() != null) {
            product.setCategory(productDetails.getCategory());
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        productRepository.delete(product);
    }
}