package com.smartsearch.dmgt;

import com.smartsearch.model.Product;
import java.util.*;

/**
 * DMGT: Discrete Mathematics & Graph Theory - Set Algebra Engine
 * 
 * Provides rigorous mathematical set operations applied to e-commerce filtering:
 * 1. Intersection (A ∩ B): Products matching all conditions (AND)
 * 2. Union (A ∪ B): Products matching any condition (OR)
 * 3. Difference (A \ B): Products in A excluding those in B (NOT)
 * 4. Symmetric Difference (A ⊕ B): Products in either A or B, but not both
 * 5. Subset Evaluation (A ⊆ B)
 * 6. Multi-criteria Cartesian/Predicate Evaluation
 */
public class SetFilterEngine {

    /**
     * Mathematical Set Intersection: A ∩ B = { x | x ∈ A and x ∈ B }
     */
    public static <T> Set<T> intersection(Set<T> setA, Set<T> setB) {
        if (setA == null || setB == null) return Collections.emptySet();
        // Optimize by iterating over the smaller set
        Set<T> smaller = setA.size() < setB.size() ? setA : setB;
        Set<T> larger = setA.size() < setB.size() ? setB : setA;

        Set<T> result = new LinkedHashSet<>();
        for (T element : smaller) {
            if (larger.contains(element)) {
                result.add(element);
            }
        }
        return result;
    }

    /**
     * Mathematical Set Union: A ∪ B = { x | x ∈ A or x ∈ B }
     */
    public static <T> Set<T> union(Set<T> setA, Set<T> setB) {
        Set<T> result = new LinkedHashSet<>();
        if (setA != null) result.addAll(setA);
        if (setB != null) result.addAll(setB);
        return result;
    }

    /**
     * Mathematical Set Difference (Relative Complement): A \ B = { x | x ∈ A and x ∉ B }
     */
    public static <T> Set<T> difference(Set<T> setA, Set<T> setB) {
        if (setA == null) return Collections.emptySet();
        if (setB == null) return new LinkedHashSet<>(setA);

        Set<T> result = new LinkedHashSet<>(setA);
        result.removeAll(setB);
        return result;
    }

    /**
     * Multi-criteria DMGT Set Filtering:
     * Evaluates S_result = S_search ∩ S_brand ∩ S_category ∩ S_price ∩ S_rating
     */
    public static Set<Product> applyFilters(
            Collection<Product> universe,
            Set<Product> searchCandidates,
            Set<String> selectedBrands,
            Set<String> selectedCategories,
            double minPrice,
            double maxPrice,
            double minRating) {

        Set<Product> currentUniverse = searchCandidates != null ? new LinkedHashSet<>(searchCandidates) : new LinkedHashSet<>(universe);

        // 1. Brand Set: S_brand = { p ∈ U | p.brand ∈ selectedBrands }
        Set<Product> brandSet;
        if (selectedBrands != null && !selectedBrands.isEmpty()) {
            brandSet = new LinkedHashSet<>();
            for (Product p : universe) {
                if (selectedBrands.contains(p.getBrand())) {
                    brandSet.add(p);
                }
            }
        } else {
            brandSet = new LinkedHashSet<>(universe);
        }

        // 2. Category Set: S_category = { p ∈ U | p.category ∈ selectedCategories }
        Set<Product> categorySet;
        if (selectedCategories != null && !selectedCategories.isEmpty()) {
            categorySet = new LinkedHashSet<>();
            for (Product p : universe) {
                if (selectedCategories.contains(p.getCategory())) {
                    categorySet.add(p);
                }
            }
        } else {
            categorySet = new LinkedHashSet<>(universe);
        }

        // 3. Price Set: S_price = { p ∈ U | minPrice <= p.price <= maxPrice }
        Set<Product> priceSet = new LinkedHashSet<>();
        for (Product p : universe) {
            if (p.getPrice() >= minPrice && p.getPrice() <= maxPrice) {
                priceSet.add(p);
            }
        }

        // 4. Rating Set: S_rating = { p ∈ U | p.rating >= minRating }
        Set<Product> ratingSet = new LinkedHashSet<>();
        for (Product p : universe) {
            if (p.getRating() >= minRating) {
                ratingSet.add(p);
            }
        }

        // Compute Multi-way Set Intersection: S_result = (S_cand ∩ S_brand) ∩ (S_cat ∩ (S_price ∩ S_rating))
        Set<Product> result = intersection(currentUniverse, brandSet);
        result = intersection(result, categorySet);
        result = intersection(result, priceSet);
        result = intersection(result, ratingSet);

        return result;
    }

    /**
     * Generates formal DMGT mathematical notation string for display in UI & reports
     */
    public static String getSetAlgebraFormula(
            Set<String> brands, Set<String> categories, double minPrice, double maxPrice, double minRating) {
        StringBuilder sb = new StringBuilder("S_result = S_search");

        if (brands != null && !brands.isEmpty()) {
            sb.append(" ∩ {p | p.brand ∈ {")
              .append(String.join(", ", brands))
              .append("}}");
        }
        if (categories != null && !categories.isEmpty()) {
            sb.append(" ∩ {p | p.cat ∈ {")
              .append(String.join(", ", categories))
              .append("}}");
        }
        if (minPrice > 0 || maxPrice < Double.MAX_VALUE) {
            sb.append(String.format(" ∩ {p | ₹%,.0f ≤ p.price ≤ ₹%,.0f}", minPrice, maxPrice));
        }
        if (minRating > 0) {
            sb.append(String.format(" ∩ {p | p.rating ≥ %.1f★}", minRating));
        }

        return sb.toString();
    }
}
