package com.smartsearch.engine;

import com.smartsearch.model.Product;
import java.util.*;

/**
 * OOPJ: Catalog Repository
 * Manages in-memory product inventory, brand indexing, category taxonomy, and lookup operations.
 */
public class Catalog {
    private final Map<String, Product> productById;
    private final Set<String> allBrands;
    private final Set<String> allCategories;

    public Catalog() {
        this.productById = new LinkedHashMap<>();
        this.allBrands = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        this.allCategories = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
    }

    public void addProduct(Product product) {
        if (product == null) return;
        productById.put(product.getId(), product);
        allBrands.add(product.getBrand());
        allCategories.add(product.getCategory());
    }

    public void addAll(Collection<Product> products) {
        if (products == null) return;
        for (Product p : products) {
            addProduct(p);
        }
    }

    public Product getProductById(String id) {
        return productById.get(id);
    }

    public List<Product> getAllProducts() {
        return new ArrayList<>(productById.values());
    }

    public Set<String> getAllBrands() {
        return Collections.unmodifiableSet(allBrands);
    }

    public Set<String> getAllCategories() {
        return Collections.unmodifiableSet(allCategories);
    }

    public int size() {
        return productById.size();
    }
}
