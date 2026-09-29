# SmartSearch: UML Diagrams & System Flowcharts

This document provides visual flowcharts and UML architectural diagrams for academic presentations, project defense, and viva evaluations.

---

## 1. System Architecture Flowchart

```mermaid
flowchart TD
    Client["User Interface (Web Client / Browser)"]
    
    subgraph Frontend ["Client Layer (HTML5 / Tailwind / JS)"]
        SearchBar["Search Bar Input"]
        FilterSidebar["Filter Sidebar (Brand, Cat, Price, Rating)"]
        CardGrid["Product Cards Grid (Real Photos)"]
        DetailModal["Product Detail Modal"]
        RecSection["'You May Also Like' Cards"]
        CartDrawer["Slide-over Shopping Cart"]
    end

    subgraph Backend ["Backend & Core Algorithmic Layer"]
        HttpServer["Python HTTP Server & API Bridge"]
        
        subgraph ADSA ["ADSA: AVL Tree Engine"]
            AVLIndex["AVL Tree Index"]
            PrefixLookup["Prefix Autocomplete O(log N + k)"]
            TreeRotations["LL / RR / LR / RL Rotations"]
        end
        
        subgraph DMGT ["DMGT: Set Algebra Engine"]
            SetIntersect["Set Intersection (∩)"]
            SetUnion["Set Union (∪)"]
            SetDiff["Set Difference (\)"]
        end

        subgraph PythonAI ["Python AI / NLP Recommender"]
            TFIDF["TF-IDF Vectorizer"]
            CosineSim["Cosine Similarity Matrix"]
            RecGenerator["Top-N Similar Products"]
        end
    end

    subgraph DataStore ["Data Storage"]
        ProductsJSON[("products.json (52 Electronics Items)")]
        RecsJSON[("recommendations.json")]
        RecsCSV[("recommendations.csv")]
    end

    Client --> SearchBar
    SearchBar -->|Keystrokes| PrefixLookup
    PrefixLookup --> AVLIndex
    AVLIndex --> ProductsJSON

    FilterSidebar -->|Filter Criteria| SetIntersect
    SetIntersect --> ProductsJSON
    SetIntersect --> CardGrid

    CardGrid -->|Select Product| DetailModal
    DetailModal --> RecSection
    RecGenerator --> CosineSim
    CosineSim --> TFIDF
    TFIDF --> ProductsJSON
    RecGenerator --> RecsJSON
    RecsJSON --> RecSection

    DetailModal -->|Add to Cart| CartDrawer
```

---

## 2. Complete User Search & Recommendation Flowchart

```mermaid
flowchart TD
    Start([User Opens SmartSearch Store]) --> Browse[Browse 52 Real Electronics Products]
    
    Browse --> ActionChoice{User Action?}
    
    ActionChoice -->|Types in Search Box| SearchInput[Enter Keystrokes e.g. 'iph']
    SearchInput --> AVLSearch[ADSA: AVL Tree Prefix Query]
    AVLSearch --> ShowSuggestions[Display Autocomplete Suggestions Dropdown]
    ShowSuggestions --> ClickSuggestion[User Selects Suggestion or Hits Enter]
    
    ActionChoice -->|Applies Filter| FilterAction[Select Brand, Category, Price Slider, Rating]
    ClickSuggestion --> CombineFilters
    FilterAction --> CombineFilters[DMGT: Compute Set Intersection S_result]
    
    CombineFilters --> RenderGrid[Render Filtered Products with Real Photos & Live Set Formula]
    
    RenderGrid --> ProductClick[User Clicks on Product Card]
    ProductClick --> OpenDetailModal[Open Product Details View]
    
    OpenDetailModal --> LoadRecs[Python AI: Query TF-IDF Cosine Similarity Matrix]
    LoadRecs --> DisplayYouMayAlsoLike[Display 'You May Also Like' Section with Match %]
    
    DisplayYouMayAlsoLike --> AddToCart[User Clicks 'Add to Shopping Cart']
    AddToCart --> ViewCart[Slide Open Shopping Cart Drawer]
    ViewCart --> Checkout([Order Confirmation])
```

---

## 3. ADSA: AVL Tree Balancing & Rotations Flowchart

```mermaid
flowchart TD
    Insert[Insert New Product Key into BST] --> UpdateH[Update Height of Ancestor Node]
    UpdateH --> CalcBF["Calculate Balance Factor BF = height(Left) - height(Right)"]
    
    CalcBF --> CheckBal{Is |BF| > 1 ?}
    CheckBal -->|No: BF is -1, 0, or +1| Balanced([Node is Balanced])
    
    CheckBal -->|Yes: Imbalance Detected| CheckCase{Determine Imbalance Type}
    
    CheckCase -->|BF > 1 and Key < Left.Key| CaseLL["Left-Left (LL) Case"]
    CaseLL --> RotateRight["Perform Single Right Rotation"]
    
    CheckCase -->|BF < -1 and Key > Right.Key| CaseRR["Right-Right (RR) Case"]
    CaseRR --> RotateLeft["Perform Single Left Rotation"]
    
    CheckCase -->|BF > 1 and Key > Left.Key| CaseLR["Left-Right (LR) Case"]
    CaseLR --> RotateLR["Rotate Left on Left Child, then Rotate Right on Node"]
    
    CheckCase -->|BF < -1 and Key < Right.Key| CaseRL["Right-Left (RL) Case"]
    CaseRL --> RotateRL["Rotate Right on Right Child, then Rotate Left on Node"]
    
    RotateRight --> Balanced
    RotateLeft --> Balanced
    RotateLR --> Balanced
    RotateRL --> Balanced
```

---

## 4. UML Class Diagram (Java OOPJ & ADSA & DMGT)

```mermaid
classDiagram
    class Product {
        -String id
        -String name
        -String brand
        -String category
        -double price
        -double rating
        -int reviewsCount
        -int stock
        -String description
        -Map~String, String~ specs
        -String imageUrl
        +getId() String
        +getName() String
        +getBrand() String
        +getCategory() String
        +getPrice() double
        +getRating() double
        +getStock() int
        +isInStock() boolean
        +compareTo(Product) int
    }

    class AVLNode {
        -String key
        -List~Product~ products
        -int height
        -AVLNode left
        -AVLNode right
        +getKey() String
        +getProducts() List~Product~
        +addProduct(Product) void
        +getHeight() int
        +setHeight(int) void
        +getLeft() AVLNode
        +getRight() AVLNode
    }

    class AVLTree {
        -AVLNode root
        -int nodeCount
        -int totalRotations
        +insert(String, Product) void
        +searchExact(String) List~Product~
        +searchPrefix(String, int) List~Product~
        +searchKeyword(String, int) List~Product~
        -rightRotate(AVLNode) AVLNode
        -leftRotate(AVLNode) AVLNode
        -getBalanceFactor(AVLNode) int
        -updateHeight(AVLNode) void
        +inOrderTraversal() List~String~
    }

    class SetFilterEngine {
        <<utility>>
        +intersection(Set~T~, Set~T~) Set~T~
        +union(Set~T~, Set~T~) Set~T~
        +difference(Set~T~, Set~T~) Set~T~
        +applyFilters(...) Set~Product~
        +getSetAlgebraFormula(...) String
    }

    class Catalog {
        -Map~String, Product~ productById
        -Set~String~ allBrands
        -Set~String~ allCategories
        +addProduct(Product) void
        +getProductById(String) Product
        +getAllProducts() List~Product~
        +getAllBrands() Set~String~
        +getAllCategories() Set~String~
        +size() int
    }

    class SearchEngine {
        -Catalog catalog
        -AVLTree nameIndexTree
        -AVLTree keywordIndexTree
        +buildIndexes() void
        +getAutocompleteSuggestions(String, int) List~Product~
        +search(String) Set~Product~
        +searchWithFilters(...) List~Product~
    }

    class RecommendationEngine {
        -Catalog catalog
        -Map~String, List~String~~ recommendationMap
        +registerRecommendation(String, List~String~) void
        +getRecommendations(String, int) List~Product~
    }

    AVLNode "1" *-- "many" Product : references
    AVLNode "1" o-- "2" AVLNode : child nodes
    AVLTree "1" *-- "1" AVLNode : root
    SearchEngine "1" *-- "2" AVLTree : indexes
    SearchEngine "1" o-- "1" Catalog : accesses
    Catalog "1" *-- "many" Product : stores
    RecommendationEngine "1" o-- "1" Catalog : queries
    SearchEngine ..> SetFilterEngine : calls static methods
```

---

## 5. Sequence Diagram: Autocomplete & Search Execution

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Client UI (app.js)
    participant Server as Web Server (server.py)
    participant SearchEngine as Java / Python Search Engine
    participant AVL as AVLTree (ADSA)
    participant DMGT as SetFilterEngine (DMGT)

    User->>Browser: Types "iphone" in search bar
    Browser->>Server: GET /api/autocomplete?q=iphone
    Server->>SearchEngine: getAutocompleteSuggestions("iphone")
    SearchEngine->>AVL: searchPrefix("iphone", 6)
    AVL-->>SearchEngine: Return matching AVLNode product lists
    SearchEngine-->>Server: Top 6 autocomplete items
    Server-->>Browser: JSON Array of matching products
    Browser->>User: Renders Autocomplete Dropdown List

    User->>Browser: Selects Brand "Apple" and Max Price ₹1,00,000
    Browser->>DMGT: applyFilters(Universe, S_search, {Apple}, [0, 100000])
    DMGT-->>Browser: Filtered Set S_result = S_search ∩ S_brand ∩ S_price
    Browser->>User: Displays matching product cards with real images & updated DMGT formula
```
