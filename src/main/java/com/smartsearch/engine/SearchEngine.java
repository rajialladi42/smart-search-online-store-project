package com.smartsearch.engine;

import com.smartsearch.adsa.AVLTree;
import com.smartsearch.dmgt.SetFilterEngine;
import com.smartsearch.model.Product;
import java.util.*;

/**
 * OOPJ & ADSA: SearchEngine Controller
 * Coordinates AVL Tree indexing, prefix-based autocomplete, keyword retrieval,
 * and DMGT set-based facet filtering.
 */
public class SearchEngine {
    private final Catalog catalog;
    private final AVLTree nameIndexTree;
    private final AVLTree keywordIndexTree;

    public SearchEngine(Catalog catalog) {
        this.catalog = catalog;
        this.nameIndexTree = new AVLTree();
        this.keywordIndexTree = new AVLTree();
        buildIndexes();
    }

    /**
     * Indexes catalog products into AVL self-balancing trees.
     */
    public void buildIndexes() {
        for (Product product : catalog.getAllProducts()) {
            // 1. Index full product name
            nameIndexTree.insert(product.getName(), product);

            // 2. Index individual keyword tokens for granular autocomplete
            String[] tokens = product.getName().toLowerCase().split("[\\s\\-\\.,]+");
            for (String token : tokens) {
                if (token.length() >= 2) {
                    keywordIndexTree.insert(token, product);
                }
            }
            // Index brand and category keywords
            keywordIndexTree.insert(product.getBrand().toLowerCase(), product);
            keywordIndexTree.insert(product.getCategory().toLowerCase(), product);
        }
    }

    /**
     * Autocomplete suggestions using AVL Tree Prefix Search.
     */
    public List<Product> getAutocompleteSuggestions(String queryPrefix, int limit) {
        if (queryPrefix == null || queryPrefix.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String clean = queryPrefix.trim().toLowerCase();
        Set<Product> results = new LinkedHashSet<>();

        // Search primary name index
        results.addAll(nameIndexTree.searchPrefix(clean, limit));

        // If not enough results, search keyword index
        if (results.size() < limit) {
            results.addAll(keywordIndexTree.searchPrefix(clean, limit - results.size()));
        }

        // Fallback to substring keyword search if prefix didn't match enough
        if (results.size() < limit) {
            results.addAll(nameIndexTree.searchKeyword(clean, limit - results.size()));
        }

        return new ArrayList<>(results);
    }

    /**
     * Full Search with AVL Tree and optional DMGT Set Filters.
     */
    public Set<Product> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new LinkedHashSet<>(catalog.getAllProducts());
        }

        String clean = query.trim().toLowerCase();
        Set<Product> matches = new LinkedHashSet<>();

        // 1. Exact match in AVL Tree
        matches.addAll(nameIndexTree.searchExact(clean));

        // 2. Prefix match in AVL Tree
        matches.addAll(nameIndexTree.searchPrefix(clean, 20));

        // 3. Keyword tree matches
        matches.addAll(keywordIndexTree.searchKeyword(clean, 20));

        // 4. Keyword tokens match
        String[] tokens = clean.split("\\s+");
        for (String token : tokens) {
            if (token.length() >= 2) {
                matches.addAll(keywordIndexTree.searchPrefix(token, 10));
            }
        }

        return matches;
    }

    /**
     * Complete query execution: AVL Search -> DMGT Set-Based Filtering.
     */
    public List<Product> searchWithFilters(
            String query,
            Set<String> brands,
            Set<String> categories,
            double minPrice,
            double maxPrice,
            double minRating) {

        Set<Product> searchCandidates = search(query);
        Set<Product> filteredSet = SetFilterEngine.applyFilters(
                catalog.getAllProducts(),
                searchCandidates,
                brands,
                categories,
                minPrice,
                maxPrice,
                minRating
        );

        List<Product> resultList = new ArrayList<>(filteredSet);
        return resultList;
    }

    public AVLTree getNameIndexTree() { return nameIndexTree; }
    public AVLTree getKeywordIndexTree() { return keywordIndexTree; }
}
