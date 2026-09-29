"""
SmartSearch - Full Stack Web Server & API Bridge
================================================
Serves the responsive e-commerce web application and provides REST APIs for:
- Product Catalog Retrieval (/api/products)
- AVL Tree Prefix Autocomplete (/api/autocomplete)
- AI TF-IDF Cosine Similarity Recommendations (/api/recommendations)
"""

import http.server
import json
import os
import socketserver
import sys
import urllib.parse
from ai_engine.recommender import run_pipeline, TFIDFRecommender

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, 'web')
DATA_DIR = os.path.join(BASE_DIR, 'data')
PRODUCTS_FILE = os.path.join(DATA_DIR, 'products.json')
RECOMMENDATIONS_FILE = os.path.join(DATA_DIR, 'recommendations.json')
RECOMMENDATIONS_CSV = os.path.join(DATA_DIR, 'recommendations.csv')

# Ensure recommendations exist
if not os.path.exists(RECOMMENDATIONS_FILE):
    print("[Server] Initializing AI Recommendation Engine...")
    run_pipeline(PRODUCTS_FILE, RECOMMENDATIONS_FILE, RECOMMENDATIONS_CSV)

with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
    ALL_PRODUCTS = json.load(f)

with open(RECOMMENDATIONS_FILE, 'r', encoding='utf-8') as f:
    ALL_RECOMMENDATIONS = json.load(f)


class SmartSearchRequestHandler(http.server.SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)

        # API Endpoints
        if path == '/api/products':
            self.send_json_response(ALL_PRODUCTS)
            return

        elif path == '/api/recommendations':
            product_id = query_params.get('id', [None])[0]
            if product_id:
                recs = ALL_RECOMMENDATIONS.get(product_id, [])
                self.send_json_response(recs)
            else:
                self.send_json_response(ALL_RECOMMENDATIONS)
            return

        elif path == '/api/autocomplete':
            q = query_params.get('q', [''])[0].strip().lower()
            if not q:
                self.send_json_response([])
                return
            matches = [
                p for p in ALL_PRODUCTS
                if p['name'].lower().startswith(q) or p['name'].lower().find(q) != -1 or p['brand'].lower().startswith(q)
            ][:8]
            self.send_json_response(matches)
            return

        elif path == '/api/search':
            q = query_params.get('q', [''])[0].strip().lower()
            if not q:
                self.send_json_response(ALL_PRODUCTS)
                return
            results = [
                p for p in ALL_PRODUCTS
                if q in p['name'].lower() or q in p['brand'].lower() or q in p['category'].lower() or q in p['description'].lower()
            ]
            self.send_json_response(results)
            return

        # Serve static web frontend
        if path == '/' or path == '':
            self.path = '/index.html'

        return super().do_GET()

    def send_json_response(self, data, status=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")


def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SmartSearchRequestHandler) as httpd:
        print("=" * 80)
        print("  SMARTSEARCH: AI-POWERED E-COMMERCE SEARCH & RECOMMENDATION STORE")
        print("=" * 80)
        print(f"  [+] Catalog Loaded:      {len(ALL_PRODUCTS)} Electronics Products with Real Photos")
        print(f"  [+] AI Matrix Loaded:     {len(ALL_RECOMMENDATIONS)} Precomputed TF-IDF Recommendations")
        print(f"  [+] Web UI & Server:      http://localhost:{PORT}")
        print("=" * 80)
        print("  Press Ctrl+C to terminate the server.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[!] Server shutting down gracefully...")


if __name__ == '__main__':
    start_server()
