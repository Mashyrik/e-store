package com.estore.estore.service;

import com.estore.estore.dto.request.ProductRequest;
import com.estore.estore.model.Category;
import com.estore.estore.model.Product;
import com.estore.estore.repository.CategoryRepository;
import com.estore.estore.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // Старый метод для обратной совместимости
    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByCreatedAtDesc();
    }

    // НОВЫЙ: Пагинация всех товаров
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    // НОВЫЙ: Пагинация с поиском
    public Page<Product> searchProducts(String query, Pageable pageable) {
        return productRepository.searchProductsPage(query, pageable);
    }

    // НОВЫЙ: Пагинация товаров по категории
    public Page<Product> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable);
    }

    // Существующие методы остаются
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
        if (productRepository.existsByModel(productRequest.getModel())) {
            throw new RuntimeException("Product with model '" + productRequest.getModel() + "' already exists");
        }

        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + productRequest.getCategoryId()));

        Product product = new Product();
        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setPrice(productRequest.getPrice());
        product.setModel(productRequest.getModel());
        product.setCategory(category);
        product.setStockQuantity(productRequest.getStockQuantity());

        return productRepository.save(product);
    }

    // Старый метод для обратной совместимости
    public Product createProduct(Product product) {
        if (productRepository.existsByModel(product.getModel())) {
            throw new RuntimeException("Product with model '" + product.getModel() + "' already exists");
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductRequest productRequest) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

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