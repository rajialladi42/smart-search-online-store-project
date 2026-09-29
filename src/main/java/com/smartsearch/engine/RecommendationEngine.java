package com.smartsearch.engine;

import com.smartsearch.model.Product;
import java.util.*;

/**
 * OOPJ: RecommendationEngine
 * Bridges the precomputed AI/Python TF-IDF Cosine Similarity recommendations
 * or executes fallback heuristic content similarities in Java.
 */
public class RecommendationEngine {
    private final Catalog catalog;
    private final Map<String, List<String>> recommendationMap;

    public RecommendationEngine(Catalog catalog) {
        this.catalog = catalog;
        this.recommendationMap = new HashMap<>();
    }

    public void registerRecommendation(String productId, List<String> recommendedProductIds) {
        if (productId != null && recommendedProductIds != null) {
            recommendationMap.put(productId, recommendedProductIds);
        }
    }

    /**
     * Retrieves top similar products for "You May Also Like"
     */
    public List<Product> getRecommendations(String productId, int limit) {
        List<Product> results = new ArrayList<>();
        List<String> recIds = recommendationMap.get(productId);

        if (recIds != null && !recIds.isEmpty()) {
            for (String recId : recIds) {
                Product p = catalog.getProductById(recId);
                if (p != null) {
                    results.add(p);
                    if (results.size() >= limit) break;
                }
            }
        }

        // Fallback heuristic: find same category/brand products if AI matrix entry not found
        if (results.size() < limit) {
            Product target = catalog.getProductById(productId);
            if (target != null) {
                for (Product p : catalog.getAllProducts()) {
                    if (!p.getId().equals(productId) && !results.contains(p)) {
                        if (p.getCategory().equalsIgnoreCase(target.getCategory())) {
                            results.add(p);
                            if (results.size() >= limit) break;
                        }
                    }
                }
            }
        }

        return results;
    }
}
