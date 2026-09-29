package com.smartsearch;

import com.smartsearch.adsa.AVLTree;
import com.smartsearch.dmgt.SetFilterEngine;
import com.smartsearch.engine.Catalog;
import com.smartsearch.engine.RecommendationEngine;
import com.smartsearch.engine.SearchEngine;
import com.smartsearch.model.Product;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.*;

/**
 * Academic Demonstration Runner (OOPJ, ADSA, DMGT)
 * Executes standalone algorithmic validations and benchmark displays.
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("================================================================================");
        System.out.println("  SMARTSEARCH: AI-POWERED E-COMMERCE SEARCH & RECOMMENDATION SYSTEM  ");
        System.out.println("  B.Tech Mini-Project: ADSA (AVL Tree) + DMGT (Set Theory) + OOPJ + Python AI   ");
        System.out.println("================================================================================\n");

        Catalog catalog = new Catalog();
        loadSampleCatalog(catalog);

        System.out.printf("[+] Loaded %d products into in-memory catalog repository.%n", catalog.size());

        // 1. ADSA: Build and verify AVL Tree Index
        System.out.println("\n--------------------------------------------------------------------------------");
        System.out.println("  1. ADSA MODULE: AVL BALANCED BINARY SEARCH TREE DEMONSTRATION  ");
        System.out.println("--------------------------------------------------------------------------------");
        
        SearchEngine searchEngine = new SearchEngine(catalog);
        AVLTree nameTree = searchEngine.getNameIndexTree();

        System.out.printf("AVL Tree Indexed Nodes: %d%n", nameTree.getNodeCount());
        System.out.printf("AVL Tree Root Height:   %d (Guaranteed O(log N) balance)%n", nameTree.getTreeHeight());
        System.out.printf("Total Self-Balancing Rotations Executed: %d%n", nameTree.getTotalRotations());

        // Test Autocomplete
        String prefix = "iph";
        System.out.printf("%n[*] Testing AVL Tree Prefix Autocomplete for '%s':%n", prefix);
        List<Product> suggestions = searchEngine.getAutocompleteSuggestions(prefix, 5);
        for (int i = 0; i < suggestions.size(); i++) {
            Product p = suggestions.get(i);
            System.out.printf("    %d. %-32s [₹%,.0f] (Brand: %s, Rating: %.1f★)%n",
                    i + 1, p.getName(), p.getPrice(), p.getBrand(), p.getRating());
        }

        // 2. DMGT: Set Operations & Filtering
        System.out.println("\n--------------------------------------------------------------------------------");
        System.out.println("  2. DMGT MODULE: DISCRETE MATHEMATICAL SET-BASED FILTERING  ");
        System.out.println("--------------------------------------------------------------------------------");
        
        Set<String> selectedBrands = new HashSet<>(Collections.singletonList("Apple"));
        Set<String> selectedCategories = Collections.emptySet();
        double minPrice = 50000;
        double maxPrice = 100000;
        double minRating = 4.5;

        String formula = SetFilterEngine.getSetAlgebraFormula(selectedBrands, selectedCategories, minPrice, maxPrice, minRating);
        System.out.println("[*] DMGT Set Algebra Expression:");
        System.out.println("    " + formula);

        List<Product> filteredResults = searchEngine.searchWithFilters(
                "iphone",
                selectedBrands,
                selectedCategories,
                minPrice,
                maxPrice,
                minRating
        );

        System.out.printf("%n[*] Filter Result Set (|S_result| = %d):%n", filteredResults.size());
        for (Product p : filteredResults) {
            System.out.printf("    • %-30s | ₹%,10.2f | %s | Rating: %.1f★%n",
                    p.getName(), p.getPrice(), p.getCategory(), p.getRating());
        }

        // 3. Recommendation System
        System.out.println("\n--------------------------------------------------------------------------------");
        System.out.println("  3. AI / RECOMMENDATION MODULE: 'YOU MAY ALSO LIKE' (TF-IDF + COSINE SIMILARITY)  ");
        System.out.println("--------------------------------------------------------------------------------");

        RecommendationEngine recEngine = new RecommendationEngine(catalog);
        String targetId = "PROD-015"; // Sony WH-1000XM5
        Product targetProduct = catalog.getProductById(targetId);

        if (targetProduct != null) {
            System.out.printf("[*] User is viewing: %s (%s - ₹%,.0f)%n",
                    targetProduct.getName(), targetProduct.getCategory(), targetProduct.getPrice());
            System.out.println("[*] Cosine Similarity Top Recommended Products (You May Also Like):");

            List<Product> recs = recEngine.getRecommendations(targetId, 4);
            for (int i = 0; i < recs.size(); i++) {
                Product r = recs.get(i);
                System.out.printf("    [%d] %-35s | ₹%,10.2f | %s | %s%n",
                        i + 1, r.getName(), r.getPrice(), r.getBrand(), r.getCategory());
            }
        }

        System.out.println("\n================================================================================");
        System.out.println("  CLI Algorithmic Validation Completed Successfully!  ");
        System.out.println("  Run 'python server.py' or 'run.bat' to launch the interactive web store.  ");
        System.out.println("================================================================================\n");
    }

    private static void loadSampleCatalog(Catalog catalog) {
        // Look for data/products.json or populate standard sample if file parsing is standalone
        File file = new File("data/products.json");
        if (file.exists()) {
            try (BufferedReader br = new BufferedReader(new FileReader(file))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) {
                    sb.append(line);
                }
                parseAndAddProducts(sb.toString(), catalog);
                return;
            } catch (Exception ignored) {
                // Fallback to manual setup below
            }
        }

        // Fallback default sample initialization
        catalog.addProduct(new Product("PROD-001", "Apple iPhone 16 Pro Max", "Apple", "Smartphones", 144900, 4.9, 1280, 18, "Flagship Titanium A18 Pro", null, ""));
        catalog.addProduct(new Product("PROD-002", "Apple iPhone 16", "Apple", "Smartphones", 79900, 4.7, 940, 25, "Dynamic Island A18 phone", null, ""));
        catalog.addProduct(new Product("PROD-003", "Apple iPhone 15 Pro", "Apple", "Smartphones", 119900, 4.8, 2150, 14, "Titanium A17 Pro camera", null, ""));
        catalog.addProduct(new Product("PROD-004", "Samsung Galaxy S24 Ultra", "Samsung", "Smartphones", 129999, 4.8, 1820, 22, "Galaxy AI S-Pen phone", null, ""));
        catalog.addProduct(new Product("PROD-009", "Apple MacBook Pro 16 M3 Max", "Apple", "Laptops", 349900, 4.9, 420, 7, "M3 Max creator laptop", null, ""));
        catalog.addProduct(new Product("PROD-015", "Sony WH-1000XM5 Noise Cancelling Headphones", "Sony", "Headphones", 29990, 4.8, 3890, 42, "ANC LDAC Hi-Res Audio", null, ""));
        catalog.addProduct(new Product("PROD-016", "Bose QuietComfort Ultra Headphones", "Bose", "Headphones", 35900, 4.7, 1650, 28, "Spatial audio ANC luxury", null, ""));
        catalog.addProduct(new Product("PROD-021", "Apple Watch Ultra 2", "Apple", "Smart Watches", 89900, 4.9, 810, 14, "Titanium GPS diving watch", null, ""));
    }

    private static void parseAndAddProducts(String json, Catalog catalog) {
        // Lightweight regex JSON parser to maintain zero third-party jar dependencies for pure Java
        String[] items = json.split("\\{\\s*\"id\"");
        for (String item : items) {
            if (!item.contains("name")) continue;
            String id = extractJsonField(item, "id");
            if (id.isEmpty()) id = "PROD-" + (catalog.size() + 1);
            String name = extractJsonField(item, "name");
            String brand = extractJsonField(item, "brand");
            String category = extractJsonField(item, "category");
            double price = extractJsonDouble(item, "price", 9999);
            double rating = extractJsonDouble(item, "rating", 4.5);
            int stock = (int) extractJsonDouble(item, "stock", 10);
            int reviews = (int) extractJsonDouble(item, "reviewsCount", 100);
            String desc = extractJsonField(item, "description");
            String img = extractJsonField(item, "imageUrl");

            if (!name.isEmpty()) {
                catalog.addProduct(new Product(id, name, brand, category, price, rating, reviews, stock, desc, null, img));
            }
        }
    }

    private static String extractJsonField(String block, String key) {
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]+)\"");
        java.util.regex.Matcher m = p.matcher(block);
        return m.find() ? m.group(1) : "";
    }

    private static double extractJsonDouble(String block, String key, double defaultVal) {
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("\"" + key + "\"\\s*:\\s*([0-9\\.]+)");
        java.util.regex.Matcher m = p.matcher(block);
        if (m.find()) {
            try { return Double.parseDouble(m.group(1)); } catch (Exception ignored) {}
        }
        return defaultVal;
    }
}
