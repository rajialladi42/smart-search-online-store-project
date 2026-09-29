package com.smartsearch.adsa;

import com.smartsearch.model.Product;
import java.util.ArrayList;
import java.util.List;

/**
 * ADSA: AVL Node Representation
 * Stores the normalized indexing key, height of the subtree, and associated Product references.
 */
public class AVLNode {
    private String key;                     // Search key (lowercase product name or keyword)
    private final List<Product> products;   // Products associated with this key (handles duplicate keys)
    private int height;                     // Subtree height for balance factor calculation
    private AVLNode left;                   // Left child
    private AVLNode right;                  // Right child

    public AVLNode(String key, Product product) {
        this.key = key;
        this.products = new ArrayList<>();
        if (product != null) {
            this.products.add(product);
        }
        this.height = 1;
        this.left = null;
        this.right = null;
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public List<Product> getProducts() { return products; }
    public void addProduct(Product product) {
        if (product != null && !this.products.contains(product)) {
            this.products.add(product);
        }
    }

    public int getHeight() { return height; }
    public void setHeight(int height) { this.height = height; }

    public AVLNode getLeft() { return left; }
    public void setLeft(AVLNode left) { this.left = left; }

    public AVLNode getRight() { return right; }
    public void setRight(AVLNode right) { this.right = right; }
}
