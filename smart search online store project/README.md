# SmartSearch – AI-Powered E-Commerce Search & Recommendation System

[![Project Type](https://img.shields.io/badge/Project-B.Tech%20Academic%20Mini--Project-blue.svg)](#)
[![Stack](https://img.shields.io/badge/Tech-ADSA%20%7C%20DMGT%20%7C%20OOPJ%20%7C%20Python%20AI-success.svg)](#)
[![Runtimes](https://img.shields.io/badge/Runtime-Java%2011%2B%20%7C%20Python%203.8%2B-orange.svg)](#)

> **SmartSearch** is a complete, industry-grade academic project for an online electronics retail store integrating **ADSA** (AVL Self-Balancing Binary Search Tree), **DMGT** (Set-Theoretic Facet Filtering), **OOPJ** (Modular Java Architecture), and **Python NLP** (TF-IDF & Cosine Similarity Recommendation Engine).

---

## 🌟 Key Features

1. **Photorealistic Electronics Store Interface**:
   - 52 realistic electronics items across 10 categories (Smartphones, Laptops, Headphones, Smart Watches, Tablets, Keyboards, Monitors, Cameras, Speakers, Power Banks).
   - **Zero Placeholder Images**: High-resolution, direct Unsplash electronics photography for every single product.
   - Real-time stock status pills, verified customer ratings, specifications sheet, and interactive shopping cart.

2. **ADSA Module – AVL Balanced Binary Search Tree**:
   - Maintains strict height balance ($BF \in \{-1, 0, 1\}$) through four rotation types (LL, RR, LR, RL).
   - Instant prefix autocomplete dropdown matching keystrokes in $\mathcal{O}(\log N + k)$ time.

3. **DMGT Module – Discrete Mathematical Set-Based Filtering**:
   - Multi-criteria facet filtering modeled via formal Set Theory:
     $$S_{\text{result}} = S_{\text{search}} \cap S_{\text{brand}} \cap S_{\text{category}} \cap S_{\text{price}} \cap S_{\text{rating}} \cap S_{\text{stock}}$$
   - Real-time visual DMGT Mathematical Formula Box rendered directly in the website interface.

4. **Python AI Module – Content-Based Recommendations**:
   - Text vectorization via **TF-IDF** (Term Frequency – Inverse Document Frequency).
   - Pairwise **Cosine Similarity** matrix generation.
   - **“You May Also Like”** section dynamically displaying top 4–5 related electronics with match percentage badges (e.g. *67.8% Match*).

5. **OOPJ Module – Clean Object-Oriented Java Architecture**:
   - Robust encapsulation, unmodifiable collections, comparable interfaces, and separation of concerns.

---

## 📁 Project Directory Structure

```
smart-search-online-store/
│
├── data/
│   ├── products.json              # 52 Electronics items with real images & technical specs
│   ├── recommendations.json       # Precomputed TF-IDF & Cosine Similarity matrix
│   └── recommendations.csv        # Tabular recommendations dataset for report presentation
│
├── ai_engine/
│   └── recommender.py            # Python NLP TF-IDF & Cosine Similarity Engine (Zero-dependency)
│
├── src/main/java/com/smartsearch/
│   ├── model/
│   │   └── Product.java          # OOPJ: Product entity with encapsulation
│   ├── adsa/
│   │   ├── AVLNode.java          # ADSA: AVL Tree Node
│   │   └── AVLTree.java          # ADSA: AVL Tree with LL/RR/LR/RL rotations & prefix search
│   ├── dmgt/
│   │   └── SetFilterEngine.java  # DMGT: Set operations (Intersection, Union, Difference)
│   ├── engine/
│   │   ├── Catalog.java          # OOPJ: Central product catalog repository
│   │   ├── SearchEngine.java     # OOPJ: Search controller integrating AVL & DMGT
│   │   └── RecommendationEngine.java # OOPJ: Recommendation loader & similarity evaluator
│   └── Main.java                 # Standalone Java CLI Runner for evaluation
│
├── web/
│   ├── index.html                # Modern e-commerce store frontend (Tailwind CSS + Lucide)
│   ├── app.js                    # Store client logic, AVL autocomplete, DMGT set visualizer, cart
│   └── style.css                 # Clean store styling and animations
│
├── docs/
│   ├── PROJECT_REPORT.md         # Full Academic Mini-Project Report
│   ├── UML_AND_FLOWCHARTS.md     # Mermaid UML Class Diagrams, Flowcharts & Sequence Diagrams
│   ├── THEORY_ADSA_DMGT.md       # In-depth theoretical derivations, balance factor proofs & set theory
│   └── VIVA_QUESTIONS_AND_ANSWERS.md # 30+ categorized Viva-Voce questions with answers
│
├── server.py                     # Python Web Server & REST API bridge
├── run.bat                       # 1-Click launcher script (starts server & opens browser)
├── run_java.bat                  # Java compilation and CLI demonstration script
└── README.md                     # Project overview and setup instructions
```

---

## 🚀 How to Run the Project

### Option A: Launch Interactive Web Store (1-Click)
1. Double-click **`run.bat`** (or execute `python server.py` in your terminal).
2. The server will launch on port 8000 and automatically open your default browser to:
   ```
   http://localhost:8000
   ```

### Option B: Run Java Standalone CLI Demonstration (ADSA & DMGT)
If you have Java JDK 11+ installed:
```cmd
run_java.bat
```
or manually:
```cmd
javac -d bin src/main/java/com/smartsearch/model/*.java src/main/java/com/smartsearch/adsa/*.java src/main/java/com/smartsearch/dmgt/*.java src/main/java/com/smartsearch/engine/*.java src/main/java/com/smartsearch/Main.java
java -cp bin com.smartsearch.Main
```

### Option C: Re-generate AI Recommendations (Python)
To re-calculate TF-IDF vectors and Cosine Similarity scores:
```cmd
python ai_engine/recommender.py
```

---

## 🎓 Academic Subject Breakdown

| Subject | Implementation | Key Files |
| :--- | :--- | :--- |
| **ADSA** | AVL Tree, Balance Factors, Rotations (LL, RR, LR, RL), Prefix Autocomplete | `src/.../adsa/AVLTree.java`, `AVLNode.java` |
| **DMGT** | Mathematical Set Intersection ($\cap$), Union ($\cup$), Difference ($\setminus$), Facet filtering | `src/.../dmgt/SetFilterEngine.java`, `web/app.js` |
| **OOPJ** | Encapsulation, Composition, Immutability, Separation of Concerns | `src/.../model/Product.java`, `Catalog.java`, `Main.java` |
| **Python AI** | TF-IDF tokenization, document frequency smoothing, Cosine Similarity matrix | `ai_engine/recommender.py` |

---

## 📚 Academic Documentation Links
- [Complete Mini-Project Report](docs/PROJECT_REPORT.md)
- [UML Class Diagrams & Flowcharts](docs/UML_AND_FLOWCHARTS.md)
- [ADSA & DMGT Mathematical Theory](docs/THEORY_ADSA_DMGT.md)
- [Viva-Voce Questions & Answers (30+ Q&As)](docs/VIVA_QUESTIONS_AND_ANSWERS.md)

---

## 📜 License
Developed as an academic mini-project for 2nd-Year B.Tech Computer Science & Engineering. Open-source under MIT License.
