package com.smartsearch.model;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * OOPJ: Product Entity Class
 * Demonstrates Encapsulation, Constructor Overloading, Immutability principles,
 * and standard Java Object methods (equals, hashCode, toString).
 */
public class Product implements Comparable<Product> {
    private final String id;
    private final String name;
    private final String brand;
    private final String category;
    private final double price;
    private final double rating;
    private final int reviewsCount;
    private final int stock;
    private final String description;
    private final Map<String, String> specs;
    private final String imageUrl;

    public Product(String id, String name, String brand, String category,
                   double price, double rating, int reviewsCount, int stock,
                   String description, Map<String, String> specs, String imageUrl) {
        this.id = Objects.requireNonNull(id, "Product ID cannot be null");
        this.name = Objects.requireNonNull(name, "Product Name cannot be null");
        this.brand = Objects.requireNonNull(brand, "Product Brand cannot be null");
        this.category = Objects.requireNonNull(category, "Product Category cannot be null");
        this.price = price;
        this.rating = rating;
        this.reviewsCount = reviewsCount;
        this.stock = stock;
        this.description = description != null ? description : "";
        this.specs = specs != null ? new HashMap<>(specs) : Collections.emptyMap();
        this.imageUrl = imageUrl != null ? imageUrl : "";
    }

    // Getters for Encapsulation
    public String getId() { return id; }
    public String getName() { return name; }
    public String getBrand() { return brand; }
    public String getCategory() { return category; }
    public double getPrice() { return price; }
    public double getRating() { return rating; }
    public int getReviewsCount() { return reviewsCount; }
    public int getStock() { return stock; }
    public String getDescription() { return description; }
    public Map<String, String> getSpecs() { return Collections.unmodifiableMap(specs); }
    public String getImageUrl() { return imageUrl; }
    public boolean isInStock() { return stock > 0; }

    @Override
    public int compareTo(Product other) {
        if (other == null) return 1;
        return this.name.compareToIgnoreCase(other.name);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Product product = (Product) o;
        return Objects.equals(id, product.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("[%s] %s (%s) - ₹%,.2f | Rating: %.1f★ | Stock: %d",
                id, name, category, price, rating, stock);
    }
}
