"""
SmartSearch AI Engine - Content-Based Recommendation System
===========================================================
Algorithm: TF-IDF (Term Frequency - Inverse Document Frequency) & Cosine Similarity
Purpose: Computes semantic similarity between e-commerce electronics product descriptions
         and outputs top-N product recommendations for "You May Also Like".
"""

import json
import math
import os
import re
from collections import Counter
from typing import List, Dict, Any, Tuple

# Comprehensive English stop words set for NLP tokenization
STOP_WORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
    'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
    'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
    'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
    'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in',
    'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t',
    'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
    'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s',
    'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
    'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
    'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
    'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s',
    'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
    'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself',
    'yourselves', 'with', 'featuring', 'comes', 'designed', 'built', 'including', 'up', 'to', 'for'
}


class TFIDFRecommender:
    """
    Pure Python & Scalable Content-Based Recommendation Engine using TF-IDF & Cosine Similarity.
    Zero external dependencies required, with optional scikit-learn acceleration if installed.
    """

    def __init__(self, products: List[Dict[str, Any]]):
        self.products = products
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.tfidf_matrix: List[Dict[int, float]] = []  # Sparse vector per product
        self.product_index_map: Dict[str, int] = {p['id']: i for i, p in enumerate(products)}

    @staticmethod
    def tokenize(text: str) -> List[str]:
        """Normalize, remove special characters, lowercase, and tokenize into filtered terms."""
        tokens = re.findall(r'\b[a-zA-Z0-9\+\-\.]{2,}\b', text.lower())
        return [t for t in tokens if t not in STOP_WORDS and not t.isdigit()]

    def _prepare_document(self, product: Dict[str, Any]) -> str:
        """Combine product metadata (Name, Brand, Category, Description, Specs) into rich document."""
        specs_str = " ".join(f"{k} {v}" for k, v in product.get("specs", {}).items())
        # Weight product name, brand, and category higher by repeating them
        doc = f"{product['name']} {product['name']} {product['brand']} {product['brand']} {product['category']} {product['category']} {product['description']} {specs_str}"
        return doc

    def fit(self):
        """Compute Term Frequencies, Vocabulary, and Inverse Document Frequencies across catalog."""
        docs_tokens = [self.tokenize(self._prepare_document(p)) for p in self.products]
        total_docs = len(docs_tokens)

        # 1. Build Vocabulary & Document Frequency (DF)
        df_counter: Counter = Counter()
        vocab_set = set()

        for tokens in docs_tokens:
            unique_terms = set(tokens)
            for term in unique_terms:
                df_counter[term] += 1
                vocab_set.add(term)

        self.vocabulary = {term: idx for idx, term in enumerate(sorted(vocab_set))}

        # 2. Compute Smoothed IDF: ln((1 + N) / (1 + df)) + 1
        self.idf = {}
        for term, df in df_counter.items():
            self.idf[term] = math.log((1 + total_docs) / (1 + df)) + 1.0

        # 3. Compute TF-IDF Sparse Vectors & L2 Normalization
        self.tfidf_matrix = []
        for tokens in docs_tokens:
            if not tokens:
                self.tfidf_matrix.append({})
                continue

            tf_counter = Counter(tokens)
            doc_len = len(tokens)
            vec: Dict[int, float] = {}
            norm_sq = 0.0

            for term, count in tf_counter.items():
                if term in self.vocabulary:
                    term_idx = self.vocabulary[term]
                    # Sublinear TF scaling: 1 + log(tf) or relative tf
                    tf = 1 + math.log(count) if count > 0 else 0
                    tfidf_val = tf * self.idf[term]
                    vec[term_idx] = tfidf_val
                    norm_sq += tfidf_val * tfidf_val

            # L2 Normalize the vector so cosine similarity is simply dot product
            norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0
            normalized_vec = {k: v / norm for k, v in vec.items()}
            self.tfidf_matrix.append(normalized_vec)

    def calculate_cosine_similarity(self, vec_a: Dict[int, float], vec_b: Dict[int, float]) -> float:
        """Calculate dot product of two L2-normalized sparse vectors."""
        # Iterate over smaller dictionary for efficiency
        if len(vec_a) > len(vec_b):
            vec_a, vec_b = vec_b, vec_a
        dot_product = sum(val * vec_b[idx] for idx, val in vec_a.items() if idx in vec_b)
        return max(0.0, min(1.0, dot_product))

    def get_recommendations_for_product(self, product_id: str, top_n: int = 5) -> List[Dict[str, Any]]:
        """Find top-N most similar products for a given product ID."""
        if product_id not in self.product_index_map:
            return []

        target_idx = self.product_index_map[product_id]
        target_vec = self.tfidf_matrix[target_idx]
        target_product = self.products[target_idx]

        similarities: List[Tuple[int, float]] = []

        for idx, vec in enumerate(self.tfidf_matrix):
            if idx == target_idx:
                continue
            
            # Boost score slightly if products share the exact same category
            base_sim = self.calculate_cosine_similarity(target_vec, vec)
            candidate = self.products[idx]
            
            category_boost = 1.15 if candidate.get("category") == target_product.get("category") else 1.0
            brand_boost = 1.05 if candidate.get("brand") == target_product.get("brand") else 1.0
            
            final_sim = min(0.99, base_sim * category_boost * brand_boost)
            similarities.append((idx, final_sim))

        # Sort descending by similarity score
        similarities.sort(key=lambda x: x[1], reverse=True)

        recommendations = []
        for idx, score in similarities[:top_n]:
            prod = self.products[idx].copy()
            prod['similarityScore'] = round(score, 4)
            prod['similarityPercentage'] = f"{round(score * 100, 1)}%"
            recommendations.append(prod)

        return recommendations

    def generate_all_recommendations(self, top_n: int = 5) -> Dict[str, List[Dict[str, Any]]]:
        """Compute top recommendations for every product in the dataset."""
        self.fit()
        results = {}
        for product in self.products:
            pid = product['id']
            results[pid] = self.get_recommendations_for_product(pid, top_n=top_n)
        return results


def run_pipeline(products_path: str, output_json_path: str, output_csv_path: str = None):
    """Execute recommendation generation pipeline and serialize results."""
    print(f"[SmartSearch AI] Loading products from {products_path}...")
    with open(products_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    print(f"[SmartSearch AI] Loaded {len(products)} products.")
    recommender = TFIDFRecommender(products)
    recommendations_map = recommender.generate_all_recommendations(top_n=5)

    # Save to JSON
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(recommendations_map, f, indent=2)
    print(f"[SmartSearch AI] Successfully wrote recommendations to {output_json_path}")

    # Optional CSV export for academic documentation
    if output_csv_path:
        with open(output_csv_path, 'w', encoding='utf-8') as f:
            f.write("Target_Product_ID,Target_Product_Name,Recommended_Product_ID,Recommended_Product_Name,Similarity_Score,Similarity_Percentage\n")
            p_map = {p['id']: p['name'] for p in products}
            for pid, recs in recommendations_map.items():
                t_name = p_map.get(pid, "Unknown").replace(',', ' ')
                for r in recs:
                    r_name = r['name'].replace(',', ' ')
                    f.write(f"{pid},{t_name},{r['id']},{r_name},{r['similarityScore']},{r['similarityPercentage']}\n")
        print(f"[SmartSearch AI] Successfully exported recommendations to {output_csv_path}")

    return recommendations_map


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    p_path = os.path.join(base_dir, 'data', 'products.json')
    out_json = os.path.join(base_dir, 'data', 'recommendations.json')
    out_csv = os.path.join(base_dir, 'data', 'recommendations.csv')
    run_pipeline(p_path, out_json, out_csv)
