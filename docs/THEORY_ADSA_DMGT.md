# SmartSearch: In-Depth Theoretical Foundations (ADSA & DMGT)

This theoretical document covers the rigorous mathematical derivations, data structure properties, and discrete mathematical formulations used in the **SmartSearch** academic project.

---

## 1. ADSA (Advanced Data Structures & Algorithms): AVL Tree Theory

### 1.1 Definition & Balanced Tree Property
An **AVL Tree** (named after inventors Adelson-Velsky and Landis, 1962) is a strictly balanced Binary Search Tree (BST) where the heights of the two child subtrees of any node differ by at most one.

$$\forall \, v \in V(T), \quad |h(\text{left}(v)) - h(\text{right}(v))| \le 1$$

where $h(v)$ denotes the height of subtree rooted at $v$, with $h(\text{null}) = 0$.

### 1.2 Balance Factor Definition
$$\text{Balance Factor } BF(v) = h(\text{left}(v)) - h(\text{right}(v))$$

For any valid AVL node:
$$BF(v) \in \{-1, 0, +1\}$$

- $BF(v) = 0$: Node is perfectly balanced.
- $BF(v) = +1$: Left-heavy by 1 level.
- $BF(v) = -1$: Right-heavy by 1 level.
- $|BF(v)| \ge 2$: Tree invariant violated; rebalancing rotation required.

---

### 1.3 Mathematical Proof of Guaranteed Logarithmic Height $\mathcal{O}(\log N)$

Let $N(h)$ be the **minimum number of nodes** in an AVL tree of height $h$.

- For $h = 0$: $N(0) = 0$
- For $h = 1$: $N(1) = 1$
- For $h = 2$: $N(2) = 2$
- For $h \ge 3$: $N(h) = 1 + N(h-1) + N(h-2)$

Notice this recurrence closely mirrors the Fibonacci sequence:
$$N(h) = F_{h+2} - 1$$

Using Binet's Formula for Fibonacci numbers with golden ratio $\phi = \frac{1 + \sqrt{5}}{2} \approx 1.618$:
$$N(h) \approx \frac{\phi^{h+2}}{\sqrt{5}} - 1$$

Taking the logarithm base 2 of both sides:
$$\log_2 N \approx h \log_2 \phi \implies h \le \frac{\log_2 N}{\log_2 1.618} \approx 1.44 \log_2 N$$

**Conclusion**: The maximum height of an AVL tree with $N$ nodes is strictly bounded by $1.44 \log_2 N$. Thus, all primary operations (Search, Insertion, Deletion, Prefix Autocomplete traversal) exhibit guaranteed $\mathcal{O}(\log N)$ worst-case time complexity.

---

### 1.4 The Four AVL Rotations & Rebalancing Logic

#### 1. Left-Left (LL) Heavy Imbalance $\implies$ Single Right Rotation
Occurs when an item is inserted into the left subtree of the left child ($BF > 1$ and $key < left.key$).

```
        y (BF=+2)                     x (BF=0)
       / \                           / \
      x   T3   -- Right Rotate -->  T1   y
     / \                                / \
    T1  T2                             T2  T3
```

#### 2. Right-Right (RR) Heavy Imbalance $\implies$ Single Left Rotation
Occurs when an item is inserted into the right subtree of the right child ($BF < -1$ and $key > right.key$).

```
      x (BF=-2)                       y (BF=0)
     / \                             / \
    T1  y      -- Left Rotate -->   x   T3
       / \                         / \
      T2  T3                      T1  T2
```

#### 3. Left-Right (LR) Heavy Imbalance $\implies$ Double Rotation (Left on Child, Right on Root)
Occurs when an item is inserted into the right subtree of the left child ($BF > 1$ and $key > left.key$).

```
        z (BF=+2)              z                  x
       / \                    / \                / \
      y   T4  - Left on y -> x   T4 - Right ->  y   z
     / \                    / \                / \ / \
    T1  x                  y  T3              T1 T2 T3 T4
       / \                / \
      T2  T3             T1  T2
```

#### 4. Right-Left (RL) Heavy Imbalance $\implies$ Double Rotation (Right on Child, Left on Root)
Occurs when an item is inserted into the left subtree of the right child ($BF < -1$ and $key < right.key$).

---

## 2. DMGT (Discrete Mathematics & Graph Theory): Set Theory Applied to E-Commerce

### 2.1 Universe of Discourse & Set Formulations
Let $U = \{p_1, p_2, \dots, p_N\}$ be the universal set of all products in the e-commerce catalog.

Each filter criterion corresponds to a well-defined mathematical subset:
1. **Search Query Set ($S_{\text{search}}$)**:
   $$S_{\text{search}} = \{ p \in U \mid \text{Match}(p, q) = \text{True} \}$$
2. **Brand Facet Set ($S_{\text{brand}}$)**:
   $$S_{\text{brand}} = \bigcup_{b \in B_{\text{selected}}} \{ p \in U \mid p.\text{brand} = b \}$$
3. **Category Facet Set ($S_{\text{category}}$)**:
   $$S_{\text{category}} = \bigcup_{c \in C_{\text{selected}}} \{ p \in U \mid p.\text{category} = c \}$$
4. **Price Interval Set ($S_{\text{price}}$)**:
   $$S_{\text{price}} = \{ p \in U \mid p.\text{price} \in [P_{\min}, P_{\max}] \}$$
5. **Rating Constraint Set ($S_{\text{rating}}$)**:
   $$S_{\text{rating}} = \{ p \in U \mid p.\text{rating} \ge R_{\min} \}$$

---

### 2.2 Final Filter Set via General Intersection
The result displayed to the shopper is the mathematical intersection of all active filter subsets:
$$S_{\text{result}} = S_{\text{search}} \cap S_{\text{brand}} \cap S_{\text{category}} \cap S_{\text{price}} \cap S_{\text{rating}}$$

By **Associativity and Commutativity of Set Intersection**:
$$A \cap (B \cap C) = (A \cap B) \cap C, \quad A \cap B = B \cap A$$

The engine optimizes computation by evaluating the smallest subset first:
$$\text{Cost} = \mathcal{O}(\min(|S_A|, |S_B|))$$

---

### 2.3 De Morgan’s Laws & Negation Filtering (e.g. Exclude Out-of-Stock)
When excluding products (e.g. "Exclude Refurbished OR Out of Stock"):
$$(A \cup B)^c = A^c \cap B^c$$
$$(A \cap B)^c = A^c \cup B^c$$

This ensures that negating combined filters yields exact set complements without logical discrepancies.
