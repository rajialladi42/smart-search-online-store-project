package com.smartsearch.adsa;

import com.smartsearch.model.Product;
import java.util.*;

/**
 * ADSA: Self-Balancing AVL (Adelson-Velsky and Landis) Binary Search Tree
 * 
 * Guarantees O(log N) time complexity for Search, Insertion, and Deletion
 * by maintaining the balance factor BF(node) = height(left) - height(right) in [-1, 0, 1].
 * 
 * Supports:
 * 1. Single Right Rotation (LL Case)
 * 2. Single Left Rotation (RR Case)
 * 3. Left-Right Double Rotation (LR Case)
 * 4. Right-Left Double Rotation (RL Case)
 * 5. Prefix range matching for Sub-millisecond E-commerce Autocomplete
 */
public class AVLTree {
    private AVLNode root;
    private int nodeCount;
    private int totalRotations;

    public AVLTree() {
        this.root = null;
        this.nodeCount = 0;
        this.totalRotations = 0;
    }

    public int getHeight(AVLNode node) {
        return node == null ? 0 : node.getHeight();
    }

    public int getBalanceFactor(AVLNode node) {
        return node == null ? 0 : getHeight(node.getLeft()) - getHeight(node.getRight());
    }

    private void updateHeight(AVLNode node) {
        if (node != null) {
            node.setHeight(1 + Math.max(getHeight(node.getLeft()), getHeight(node.getRight())));
        }
    }

    /**
     * Right Rotation (Clockwise) - Resolves Left-Left (LL) Heavy Imbalance
     * 
     *       y                             x
     *      / \                           / \
     *     x   T3   -- Right Rotate -->  T1   y
     *    / \                                / \
     *   T1  T2                             T2  T3
     */
    private AVLNode rightRotate(AVLNode y) {
        AVLNode x = y.getLeft();
        AVLNode T2 = x.getRight();

        // Perform rotation
        x.setRight(y);
        y.setLeft(T2);

        // Update heights
        updateHeight(y);
        updateHeight(x);

        totalRotations++;
        return x;
    }

    /**
     * Left Rotation (Counter-Clockwise) - Resolves Right-Right (RR) Heavy Imbalance
     * 
     *     x                               y
     *    / \                             / \
     *   T1  y      -- Left Rotate -->   x   T3
     *      / \                         / \
     *     T2  T3                      T1  T2
     */
    private AVLNode leftRotate(AVLNode x) {
        AVLNode y = x.getRight();
        AVLNode T2 = y.getLeft();

        // Perform rotation
        y.setLeft(x);
        x.setRight(T2);

        // Update heights
        updateHeight(x);
        updateHeight(y);

        totalRotations++;
        return y;
    }

    /**
     * Inserts a key and its associated product into the AVL tree with balancing.
     */
    public void insert(String key, Product product) {
        if (key == null || key.trim().isEmpty()) return;
        String normalizedKey = key.trim().toLowerCase();
        root = insertRecursive(root, normalizedKey, product);
    }

    private AVLNode insertRecursive(AVLNode node, String key, Product product) {
        // 1. Standard BST insertion
        if (node == null) {
            nodeCount++;
            return new AVLNode(key, product);
        }

        int cmp = key.compareTo(node.getKey());
        if (cmp < 0) {
            node.setLeft(insertRecursive(node.getLeft(), key, product));
        } else if (cmp > 0) {
            node.setRight(insertRecursive(node.getRight(), key, product));
        } else {
            // Duplicate key: append product to existing node
            node.addProduct(product);
            return node;
        }

        // 2. Update height of current ancestor node
        updateHeight(node);

        // 3. Obtain Balance Factor
        int balance = getBalanceFactor(node);

        // 4. Handle 4 Imbalance Cases:

        // Case 1: Left-Left (LL) -> Right Rotation
        if (balance > 1 && key.compareTo(node.getLeft().getKey()) < 0) {
            return rightRotate(node);
        }

        // Case 2: Right-Right (RR) -> Left Rotation
        if (balance < -1 && key.compareTo(node.getRight().getKey()) > 0) {
            return leftRotate(node);
        }

        // Case 3: Left-Right (LR) -> Left Rotate on left child, then Right Rotate
        if (balance > 1 && key.compareTo(node.getLeft().getKey()) > 0) {
            node.setLeft(leftRotate(node.getLeft()));
            return rightRotate(node);
        }

        // Case 4: Right-Left (RL) -> Right Rotate on right child, then Left Rotate
        if (balance < -1 && key.compareTo(node.getRight().getKey()) < 0) {
            node.setRight(rightRotate(node.getRight()));
            return leftRotate(node);
        }

        return node;
    }

    /**
     * Exact key search - O(log N)
     */
    public List<Product> searchExact(String key) {
        if (key == null) return Collections.emptyList();
        AVLNode node = searchRecursive(root, key.trim().toLowerCase());
        return node != null ? node.getProducts() : Collections.emptyList();
    }

    private AVLNode searchRecursive(AVLNode node, String key) {
        if (node == null) return null;
        int cmp = key.compareTo(node.getKey());
        if (cmp == 0) return node;
        if (cmp < 0) return searchRecursive(node.getLeft(), key);
        return searchRecursive(node.getRight(), key);
    }

    /**
     * Prefix Autocomplete Search:
     * Efficiently locates all keys sharing the given prefix for instant search bar autocomplete suggestions.
     */
    public List<Product> searchPrefix(String prefix, int maxResults) {
        if (prefix == null || prefix.trim().isEmpty()) return Collections.emptyList();
        String normalizedPrefix = prefix.trim().toLowerCase();
        Set<Product> resultSet = new LinkedHashSet<>();
        collectPrefixMatches(root, normalizedPrefix, resultSet, maxResults);
        return new ArrayList<>(resultSet);
    }

    private void collectPrefixMatches(AVLNode node, String prefix, Set<Product> results, int maxResults) {
        if (node == null || results.size() >= maxResults) return;

        // If current node's key could be greater or equal to prefix
        if (node.getKey().compareTo(prefix) >= 0 || prefix.startsWith(node.getKey())) {
            collectPrefixMatches(node.getLeft(), prefix, results, maxResults);
        }

        if (node.getKey().startsWith(prefix)) {
            for (Product p : node.getProducts()) {
                results.add(p);
                if (results.size() >= maxResults) return;
            }
        }

        collectPrefixMatches(node.getRight(), prefix, results, maxResults);
    }

    /**
     * Substring Search / Keyword Matching across all indexed nodes in the AVL Tree
     */
    public List<Product> searchKeyword(String query, int maxResults) {
        if (query == null || query.trim().isEmpty()) return Collections.emptyList();
        String normalized = query.trim().toLowerCase();
        Set<Product> resultSet = new LinkedHashSet<>();
        collectKeywordMatches(root, normalized, resultSet, maxResults);
        return new ArrayList<>(resultSet);
    }

    private void collectKeywordMatches(AVLNode node, String keyword, Set<Product> results, int maxResults) {
        if (node == null || results.size() >= maxResults) return;

        collectKeywordMatches(node.getLeft(), keyword, results, maxResults);

        if (node.getKey().contains(keyword)) {
            for (Product p : node.getProducts()) {
                results.add(p);
                if (results.size() >= maxResults) return;
            }
        }

        collectKeywordMatches(node.getRight(), keyword, results, maxResults);
    }

    public List<String> inOrderTraversal() {
        List<String> list = new ArrayList<>();
        inOrder(root, list);
        return list;
    }

    private void inOrder(AVLNode node, List<String> list) {
        if (node != null) {
            inOrder(node.getLeft(), list);
            list.add(node.getKey() + " (h=" + node.getHeight() + ", bf=" + getBalanceFactor(node) + ")");
            inOrder(node.getRight(), list);
        }
    }

    public int getNodeCount() { return nodeCount; }
    public int getTreeHeight() { return getHeight(root); }
    public int getTotalRotations() { return totalRotations; }
    public AVLNode getRoot() { return root; }
}
