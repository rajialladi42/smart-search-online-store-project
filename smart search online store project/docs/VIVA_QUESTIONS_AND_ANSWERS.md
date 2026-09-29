# SmartSearch: Comprehensive Viva-Voce Questions & Answers
## 2nd-Year B.Tech Mini-Project Evaluation Guide

This guide contains 30+ categorized questions and in-depth answers covering ADSA, DMGT, OOPJ, Python NLP, System Design, and Scalability.

---

### Category 1: ADSA (Advanced Data Structures & Algorithms)

#### Q1: What is an AVL Tree and why is it preferred over a standard Binary Search Tree (BST)?
**Answer**: An AVL tree is a height-balanced binary search tree where the height difference (Balance Factor) between left and right subtrees of any node is at most 1 ($\{-1, 0, +1\}$). In a standard BST, if elements are inserted in sorted order (e.g. "Apple", "Asus", "Bose", "Dell"), the tree degenerates into a linear linked list with $\mathcal{O}(N)$ search time. AVL trees perform tree rotations during insertions to maintain a logarithmic height of at most $1.44 \log_2 N$, guaranteeing $\mathcal{O}(\log N)$ worst-case search and insertion times.

#### Q2: What is a Balance Factor (BF) and how is it calculated?
**Answer**: The Balance Factor of a node $N$ is calculated as:
$$BF(N) = \text{height}(N.\text{left}) - \text{height}(N.\text{right})$$
A node is considered balanced if $BF \in \{-1, 0, 1\}$. If $BF > 1$ (left-heavy) or $BF < -1$ (right-heavy), a rebalancing rotation is triggered immediately at the lowest unbalanced ancestor.

#### Q3: Name the four types of AVL tree rotations and when each is used.
**Answer**:
1. **Left-Left (LL)**: Single Right Rotation (when insertion is in the left subtree of the left child).
2. **Right-Right (RR)**: Single Left Rotation (when insertion is in the right subtree of the right child).
3. **Left-Right (LR)**: Double Rotation — Left rotation on left child, then Right rotation on current node.
4. **Right-Left (RL)**: Double Rotation — Right rotation on right child, then Left rotation on current node.

#### Q4: How does SmartSearch use the AVL tree for search autocomplete?
**Answer**: Products and their keyword tokens are indexed as keys in the AVL tree. When a user types a prefix like `"iph"`, the algorithm uses an in-order prefix traversal starting at the root: it navigates lexicographically to find nodes whose keys start with or contain the prefix, retrieving up to $k$ matching product suggestions in $\mathcal{O}(\log N + k)$ time.

#### Q5: What is the space complexity of an AVL tree with $N$ elements?
**Answer**: The space complexity is $\mathcal{O}(N)$. Each node stores the key, child pointers (`left`, `right`), height integer, and a list of product pointers.

---

### Category 2: DMGT (Discrete Mathematics & Graph Theory)

#### Q6: How is Set Theory applied to product filtering in SmartSearch?
**Answer**: The catalog of products is treated as the universal set $U$. Each filter constraint creates a mathematical subset:
- $S_{\text{brand}} = \{ p \in U \mid p.\text{brand} \in \text{SelectedBrands} \}$
- $S_{\text{price}} = \{ p \in U \mid P_{\min} \le p.\text{price} \le P_{\max} \}$
- $S_{\text{rating}} = \{ p \in U \mid p.\text{rating} \ge R_{\min} \}$

The active filtered catalog is computed through formal Set Intersection ($\cap$):
$$S_{\text{result}} = S_{\text{search}} \cap S_{\text{brand}} \cap S_{\text{category}} \cap S_{\text{price}} \cap S_{\text{rating}}$$

#### Q7: What are the algebraic properties of Set Intersection used here?
**Answer**:
1. **Commutativity**: $A \cap B = B \cap A$ (filter order does not change the resulting products).
2. **Associativity**: $(A \cap B) \cap C = A \cap (B \cap C)$ (filters can be combined in any grouping).
3. **Identity Element**: $A \cap U = A$ (applying no filter returns the complete catalog).
4. **Empty Set Property**: $A \cap \emptyset = \emptyset$ (contradictory filters return zero items).

#### Q8: How can Set Difference ($\setminus$) be used in e-commerce?
**Answer**: Set difference is used for exclusion filtering. For example, to find all electronics except those that are Out of Stock ($S_{\text{oos}}$):
$$S_{\text{available}} = U \setminus S_{\text{oos}} = \{ p \in U \mid p \notin S_{\text{oos}} \}$$

#### Q9: How do De Morgan's Laws apply to query logic?
**Answer**: If a user specifies a compound exclusion such as "NOT (Apple OR Sony)", De Morgan's Law states:
$$(S_{\text{Apple}} \cup S_{\text{Sony}})^c = S_{\text{Apple}}^c \cap S_{\text{Sony}}^c$$
This ensures logical equivalence when converting between compound union negations and individual intersection filters.

---

### Category 3: Python AI & Natural Language Processing

#### Q10: What is TF-IDF and how does it work?
**Answer**: **TF-IDF** stands for **Term Frequency – Inverse Document Frequency**. It is a statistical numerical measure used to evaluate how relevant a word is to a document within a collection:
- **Term Frequency (TF)**: Measures how frequently a term $t$ appears in a product description $d$.
- **Inverse Document Frequency (IDF)**: Measures the informativeness of term $t$ across all products $D$. Rare words (e.g., *"Titanium"*, *"OLED"*, *"ANC"*) receive higher weights, while common generic words (e.g., *"electronics"*, *"device"*) receive lower weights.
$$\text{TF-IDF}(t, d) = \text{TF}(t, d) \times \text{IDF}(t, D)$$

#### Q11: How is Cosine Similarity computed between two products?
**Answer**: Each product is represented as an $n$-dimensional TF-IDF vector. The Cosine Similarity measures the cosine of the angle between two non-zero vectors $A$ and $B$:
$$\text{Cosine Similarity}(A, B) = \frac{A \cdot B}{\|A\|_2 \|B\|_2} = \frac{\sum_{i=1}^n A_i B_i}{\sqrt{\sum_{i=1}^n A_i^2} \sqrt{\sum_{i=1}^n B_i^2}}$$
Values range from 0 (completely dissimilar) to 1 (identical descriptions).

#### Q12: Why use Cosine Similarity instead of Euclidean Distance?
**Answer**: Euclidean distance is sensitive to document length (a long description with repeated terms would have a large Euclidean distance from a concise description of the same item). Cosine Similarity measures orientation/direction in vector space rather than magnitude, making it length-invariant.

#### Q13: How does the "You May Also Like" section work?
**Answer**: When a user selects a product (e.g. *PROD-015: Sony WH-1000XM5 Headphones*), the engine retrieves its precalculated similarity vector from the similarity matrix, sorts other catalog items by descending similarity score, and returns the top 4-5 items (e.g., Bose QC Ultra, AirPods Max) with real photos and matching similarity percentages.

---

### Category 4: OOPJ (Object-Oriented Programming in Java)

#### Q14: Explain the principles of Encapsulation demonstrated in the `Product` class.
**Answer**: In `Product.java`, all member variables (`id`, `name`, `price`, `rating`, `specs`) are declared as `private final`. State is initialized exclusively via constructor and exposed via public getter methods. Mutable objects like `Map<String, String> specs` are wrapped in `Collections.unmodifiableMap()`, preventing external tampering and ensuring data integrity.

#### Q15: Why did you implement the `Comparable<Product>` interface?
**Answer**: Implementing `Comparable<Product>` with `compareTo()` allows Java collections and tree structures to define natural sorting orders (e.g., alphabetical by product name or by price) without external Comparator boilerplate.

#### Q16: How is the Single Responsibility Principle (SRP) maintained?
**Answer**:
- `Product`: Holds product entity state.
- `AVLTree`: Manages tree topology, heights, and rotations.
- `SetFilterEngine`: Computes mathematical set operations.
- `Catalog`: Stores product repository mappings.
- `SearchEngine`: Coordinates search indexing and queries.

---

### Category 5: System Architecture, UI, & Real-World Scalability

#### Q17: Why did you choose real product images instead of placeholders?
**Answer**: Real-world e-commerce evaluation requires visual realism. Products feature authentic photography mapped to categories (Smartphones, Laptops, Audio, Monitors, Cameras) to accurately simulate commercial platforms like Amazon or BestBuy.

#### Q18: How can this system scale from 52 products to 50,000+ products?
**Answer**:
1. **Inverted Index & Suffix Tries**: Supplement the AVL tree with an inverted keyword index for multi-word queries.
2. **Approximate Nearest Neighbors (ANN)**: Use algorithms like HNSW (Hierarchical Navigable Small World) or FAISS for sub-millisecond vector similarity search across large embedding collections.
3. **Database Indexing**: Transition the catalog storage to a relational database (PostgreSQL with B-tree / GIN indexes) backed by Redis in-memory caching.
