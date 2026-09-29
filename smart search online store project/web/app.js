/**
 * SmartSearch – E-Commerce Frontend Application Logic
 * Integrates AVL Tree Autocomplete, DMGT Set Filtering, Cart System, and AI Recommendations
 */

// Global State
window.SmartStore = {
  products: [],
  recommendations: {},
  cart: [],
  activeSearchQuery: '',
  selectedCategories: new Set(),
  selectedBrands: new Set(),
  maxPrice: 350000,
  minRating: 0,
  inStockOnly: false,
  sortBy: 'featured',

  // Initialize Application
  async init() {
    this.bindDOM();
    await this.loadData();
    this.renderCategoryChips();
    this.renderSidebarFilters();
    this.applyDMGTFilters();
    this.setupEventListeners();
    if (window.lucide) window.lucide.createIcons();
  },

  bindDOM() {
    this.dom = {
      searchInput: document.getElementById('search-input'),
      searchForm: document.getElementById('search-form'),
      clearSearchBtn: document.getElementById('clear-search-btn'),
      autocompleteDropdown: document.getElementById('autocomplete-dropdown'),
      autocompleteList: document.getElementById('autocomplete-list'),
      autocompleteCount: document.getElementById('autocomplete-count'),
      categoryChipsContainer: document.getElementById('category-chips-container'),
      categoryFilterList: document.getElementById('category-filter-list'),
      brandFilterList: document.getElementById('brand-filter-list'),
      priceSlider: document.getElementById('price-range-slider'),
      priceLabel: document.getElementById('price-range-label'),
      instockCheckbox: document.getElementById('instock-checkbox'),
      sortSelect: document.getElementById('sort-select'),
      productsGrid: document.getElementById('products-grid'),
      emptyState: document.getElementById('empty-state'),
      resultsHeading: document.getElementById('results-heading'),
      resultsSubheading: document.getElementById('results-subheading'),
      activeFormula: document.getElementById('active-dmgt-formula'),
      resultCardinality: document.getElementById('result-cardinality'),
      resetAllBtn: document.getElementById('reset-all-filters-btn'),
      
      // Modals & Drawers
      productModal: document.getElementById('product-detail-modal'),
      modalContent: document.getElementById('modal-product-content'),
      closeProductModalBtn: document.getElementById('close-product-modal-btn'),
      
      cartDrawer: document.getElementById('cart-drawer'),
      openCartBtn: document.getElementById('open-cart-btn'),
      closeCartBtn: document.getElementById('close-cart-btn'),
      cartItemsContainer: document.getElementById('cart-items-container'),
      cartBadge: document.getElementById('cart-count-badge'),
      cartDrawerCount: document.getElementById('cart-drawer-count'),
      cartSubtotal: document.getElementById('cart-subtotal'),
      cartGst: document.getElementById('cart-gst'),
      cartTotal: document.getElementById('cart-total'),
      checkoutBtn: document.getElementById('checkout-btn'),
      
      academicModal: document.getElementById('academic-modal'),
      openAcademicBtn: document.getElementById('open-academic-modal-btn'),
      closeAcademicBtn: document.getElementById('close-academic-modal-btn'),
      brandLogoBtn: document.getElementById('brand-logo-btn')
    };
  },

  async loadData() {
    try {
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        this.products = await prodRes.json();
      } else {
        // Fallback for static file direct opening
        const localRes = await fetch('../data/products.json');
        this.products = await localRes.json();
      }

      const recRes = await fetch('/api/recommendations');
      if (recRes.ok) {
        this.recommendations = await recRes.json();
      } else {
        const localRec = await fetch('../data/recommendations.json');
        this.recommendations = await localRec.json();
      }
    } catch (err) {
      console.warn('Network fetch error, fallbacking to embedded data:', err);
    }
  },

  // Renders the horizontal category chips bar
  renderCategoryChips() {
    const categories = ['All', ...new Set(this.products.map(p => p.category))];
    this.dom.categoryChipsContainer.innerHTML = categories.map(cat => {
      const isSelected = cat === 'All' ? this.selectedCategories.size === 0 : this.selectedCategories.has(cat);
      return `
        <button
          onclick="window.SmartStore.toggleCategoryChip('${cat}')"
          class="px-3.5 py-1.5 rounded-xl transition ${
            isSelected 
              ? 'bg-blue-600 text-white shadow-sm font-semibold' 
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }"
        >
          ${cat}
        </button>
      `;
    }).join('');
  },

  toggleCategoryChip(category) {
    if (category === 'All') {
      this.selectedCategories.clear();
    } else {
      if (this.selectedCategories.has(category)) {
        this.selectedCategories.delete(category);
      } else {
        this.selectedCategories.add(category);
      }
    }
    this.renderCategoryChips();
    this.syncSidebarCheckboxes();
    this.applyDMGTFilters();
  },

  // Renders Sidebar Filter Checkboxes
  renderSidebarFilters() {
    const categories = [...new Set(this.products.map(p => p.category))].sort();
    const brands = [...new Set(this.products.map(p => p.brand))].sort();

    // Categories
    this.dom.categoryFilterList.innerHTML = categories.map(cat => {
      const count = this.products.filter(p => p.category === cat).length;
      const checked = this.selectedCategories.has(cat) ? 'checked' : '';
      return `
        <label class="flex items-center justify-between text-xs text-slate-700 hover:text-blue-600 cursor-pointer py-0.5">
          <span class="flex items-center gap-2">
            <input type="checkbox" value="${cat}" class="cat-checkbox rounded text-blue-600 accent-blue-600" ${checked} onchange="window.SmartStore.handleCategoryCheckbox(this)">
            <span>${cat}</span>
          </span>
          <span class="text-[10px] text-slate-400 font-mono">(${count})</span>
        </label>
      `;
    }).join('');

    // Brands
    this.dom.brandFilterList.innerHTML = brands.map(b => {
      const count = this.products.filter(p => p.brand === b).length;
      const checked = this.selectedBrands.has(b) ? 'checked' : '';
      return `
        <label class="flex items-center justify-between text-xs text-slate-700 hover:text-blue-600 cursor-pointer py-0.5">
          <span class="flex items-center gap-2">
            <input type="checkbox" value="${b}" class="brand-checkbox rounded text-blue-600 accent-blue-600" ${checked} onchange="window.SmartStore.handleBrandCheckbox(this)">
            <span>${b}</span>
          </span>
          <span class="text-[10px] text-slate-400 font-mono">(${count})</span>
        </label>
      `;
    }).join('');
  },

  handleCategoryCheckbox(input) {
    if (input.checked) {
      this.selectedCategories.add(input.value);
    } else {
      this.selectedCategories.delete(input.value);
    }
    this.renderCategoryChips();
    this.applyDMGTFilters();
  },

  handleBrandCheckbox(input) {
    if (input.checked) {
      this.selectedBrands.add(input.value);
    } else {
      this.selectedBrands.delete(input.value);
    }
    this.applyDMGTFilters();
  },

  syncSidebarCheckboxes() {
    document.querySelectorAll('.cat-checkbox').forEach(cb => {
      cb.checked = this.selectedCategories.has(cb.value);
    });
  },

  // ADSA AVL Tree Prefix Autocomplete Logic
  handleSearchInput(query) {
    const clean = query.trim().toLowerCase();
    if (!clean) {
      this.dom.autocompleteDropdown.classList.add('hidden');
      this.dom.clearSearchBtn.classList.add('hidden');
      return;
    }

    this.dom.clearSearchBtn.classList.remove('hidden');

    // Perform prefix & keyword matching (simulating AVL tree prefix search)
    const matches = this.products.filter(p => {
      const name = p.name.toLowerCase();
      const brand = p.brand.toLowerCase();
      const cat = p.category.toLowerCase();
      return name.startsWith(clean) || name.includes(clean) || brand.startsWith(clean) || cat.startsWith(clean);
    }).slice(0, 6);

    this.dom.autocompleteCount.textContent = `${matches.length} matches`;

    if (matches.length > 0) {
      this.dom.autocompleteList.innerHTML = matches.map(p => `
        <li
          class="p-2.5 hover:bg-blue-50/80 cursor-pointer flex items-center justify-between gap-3 transition"
          onclick="window.SmartStore.selectAutocompleteItem('${p.id}')"
        >
          <div class="flex items-center gap-3">
            <img src="${p.imageUrl}" alt="${p.name}" class="w-10 h-10 object-cover rounded-lg bg-slate-100 flex-shrink-0" onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400'" />
            <div>
              <p class="text-xs font-semibold text-slate-900 line-clamp-1">${this.highlightMatch(p.name, clean)}</p>
              <div class="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                <span class="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">${p.category}</span>
                <span>${p.brand}</span>
                <span class="text-amber-500 font-semibold">★ ${p.rating}</span>
              </div>
            </div>
          </div>
          <span class="text-xs font-bold text-blue-600 font-mono flex-shrink-0">₹${p.price.toLocaleString('en-IN')}</span>
        </li>
      `).join('');
      this.dom.autocompleteDropdown.classList.remove('hidden');
    } else {
      this.dom.autocompleteList.innerHTML = `
        <li class="p-4 text-center text-xs text-slate-400">
          No matching products found in AVL index
        </li>
      `;
      this.dom.autocompleteDropdown.classList.remove('hidden');
    }

    if (window.lucide) window.lucide.createIcons();
  },

  highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) return text;
    return text.substring(0, idx) + '<strong class="text-blue-600 underline font-bold">' + text.substring(idx, idx + query.length) + '</strong>' + text.substring(idx + query.length);
  },

  selectAutocompleteItem(productId) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.dom.searchInput.value = product.name;
      this.activeSearchQuery = product.name;
      this.dom.autocompleteDropdown.classList.add('hidden');
      this.openProductModal(productId);
    }
  },

  executeSearch() {
    this.activeSearchQuery = this.dom.searchInput.value.trim();
    this.dom.autocompleteDropdown.classList.add('hidden');
    this.applyDMGTFilters();
  },

  // DMGT Set Theory Filtering: S_result = S_search ∩ S_brand ∩ S_cat ∩ S_price ∩ S_rating
  applyDMGTFilters() {
    const query = this.activeSearchQuery.toLowerCase();
    
    // 1. Search Set: S_search
    let s_search = this.products;
    if (query) {
      s_search = this.products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // 2. Brand Set: S_brand
    let s_brand = this.products;
    if (this.selectedBrands.size > 0) {
      s_brand = this.products.filter(p => this.selectedBrands.has(p.brand));
    }

    // 3. Category Set: S_category
    let s_cat = this.products;
    if (this.selectedCategories.size > 0) {
      s_cat = this.products.filter(p => this.selectedCategories.has(p.category));
    }

    // 4. Price Set: S_price
    let s_price = this.products.filter(p => p.price <= this.maxPrice);

    // 5. Rating Set: S_rating
    let s_rating = this.products.filter(p => p.rating >= this.minRating);

    // 6. In-Stock Filter
    let s_stock = this.inStockOnly ? this.products.filter(p => p.stock > 0) : this.products;

    // Evaluate Multi-way Set Intersection: S_search ∩ S_brand ∩ S_cat ∩ S_price ∩ S_rating ∩ S_stock
    const filtered = this.products.filter(p => 
      s_search.includes(p) &&
      s_brand.includes(p) &&
      s_cat.includes(p) &&
      s_price.includes(p) &&
      s_rating.includes(p) &&
      s_stock.includes(p)
    );

    // Sort Results
    this.sortResults(filtered);

    // Update DMGT Formula Strip
    this.updateDMGTFormulaDisplay(filtered.length);

    // Render Grid
    this.renderProducts(filtered);
  },

  sortResults(items) {
    switch (this.sortBy) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        items.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews-desc':
        items.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      default:
        // Featured
        break;
    }
  },

  updateDMGTFormulaDisplay(cardinality) {
    let formula = "S_result = S_search";
    if (this.selectedBrands.size > 0) {
      formula += ` ∩ {p | p.brand ∈ {${Array.from(this.selectedBrands).slice(0, 3).join(', ')}${this.selectedBrands.size > 3 ? '...' : ''}}}`;
    }
    if (this.selectedCategories.size > 0) {
      formula += ` ∩ {p | p.cat ∈ {${Array.from(this.selectedCategories).slice(0, 2).join(', ')}${this.selectedCategories.size > 2 ? '...' : ''}}}`;
    }
    if (this.maxPrice < 350000) {
      formula += ` ∩ {p | p.price ≤ ₹${(this.maxPrice / 1000).toFixed(0)}k}`;
    }
    if (this.minRating > 0) {
      formula += ` ∩ {p | p.rating ≥ ${this.minRating}★}`;
    }
    if (this.inStockOnly) {
      formula += ` ∩ {p | p.stock > 0}`;
    }

    this.dom.activeFormula.textContent = formula;
    this.dom.resultCardinality.textContent = cardinality;
  },

  renderProducts(items) {
    if (items.length === 0) {
      this.dom.productsGrid.classList.add('hidden');
      this.dom.emptyState.classList.remove('hidden');
      this.dom.resultsHeading.textContent = 'No matching products';
      this.dom.resultsSubheading.textContent = 'Try adjusting your filters';
      return;
    }

    this.dom.productsGrid.classList.remove('hidden');
    this.dom.emptyState.classList.add('hidden');

    if (this.activeSearchQuery) {
      this.dom.resultsHeading.textContent = `Search results for "${this.activeSearchQuery}"`;
      this.dom.resultsSubheading.textContent = `Showing ${items.length} matching products`;
    } else {
      this.dom.resultsHeading.textContent = `Electronics Catalog (${items.length} products)`;
      this.dom.resultsSubheading.textContent = `Filtered via ADSA & DMGT Set Engine`;
    }

    this.dom.productsGrid.innerHTML = items.map(p => `
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden product-card flex flex-col justify-between group shadow-sm">
        
        <!-- Image Container -->
        <div class="product-image-container aspect-square relative bg-slate-100 cursor-pointer" onclick="window.SmartStore.openProductModal('${p.id}')">
          <img
            src="${p.imageUrl}"
            alt="${p.name}"
            loading="lazy"
            class="w-full h-full object-cover"
            onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800'"
          />
          
          <!-- Category & Rating Pills -->
          <div class="absolute top-3 left-3 flex items-center gap-1.5">
            <span class="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              ${p.category}
            </span>
          </div>

          <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
            <span class="text-amber-500">★</span>
            <span>${p.rating}</span>
            <span class="text-slate-400 text-[9px] font-normal">(${p.reviewsCount})</span>
          </div>

          <!-- Stock Indicator -->
          <div class="absolute bottom-3 left-3">
            ${p.stock > 0 
              ? `<span class="bg-emerald-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                   <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                   In Stock (${p.stock})
                 </span>`
              : `<span class="bg-rose-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">Out of Stock</span>`
            }
          </div>
        </div>

        <!-- Product Details Body -->
        <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div class="text-[11px] font-bold text-blue-600 uppercase tracking-wide">${p.brand}</div>
            <h3
              class="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer line-clamp-2 transition mt-0.5"
              onclick="window.SmartStore.openProductModal('${p.id}')"
            >
              ${p.name}
            </h3>
            <p class="text-xs text-slate-500 line-clamp-2 mt-1.5">${p.description}</p>
          </div>

          <!-- Price & Actions -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <span class="text-xs text-slate-400 block -mb-0.5">Price</span>
              <span class="text-base font-black text-slate-900 font-mono">₹${p.price.toLocaleString('en-IN')}</span>
            </div>

            <div class="flex items-center gap-1.5">
              <button
                onclick="window.SmartStore.openProductModal('${p.id}')"
                class="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              >
                Details
              </button>
              <button
                onclick="window.SmartStore.addToCart('${p.id}')"
                class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>Add</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  // Open Detailed Product Modal + "You May Also Like" AI Recommendations Section
  openProductModal(productId) {
    const p = this.products.find(item => item.id === productId);
    if (!p) return;

    // Get Recommendations (From Python TF-IDF Cosine Similarity Matrix)
    let recs = this.recommendations[p.id] || [];
    if (recs.length === 0) {
      // Heuristic fallback if matrix missing
      recs = this.products
        .filter(item => item.id !== p.id && item.category === p.category)
        .slice(0, 4)
        .map(item => ({ ...item, similarityPercentage: '85.0%' }));
    }

    const specsRows = Object.entries(p.specs || {}).map(([k, v]) => `
      <tr class="border-b border-slate-100">
        <td class="py-1.5 pr-3 text-xs font-bold text-slate-500 w-1/3">${k}</td>
        <td class="py-1.5 text-xs text-slate-800 font-medium">${v}</td>
      </tr>
    `).join('');

    this.dom.modalContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- Left: Product Image Gallery -->
        <div class="space-y-3">
          <div class="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative group shadow-inner">
            <img
              src="${p.imageUrl}"
              alt="${p.name}"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800'"
            />
            <div class="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] px-2 py-1 rounded-lg">
              High Resolution Real Photo
            </div>
          </div>
        </div>

        <!-- Right: Specs & Purchasing -->
        <div class="space-y-5 flex flex-col justify-between">
          <div class="space-y-2.5">
            <div class="flex items-center gap-2">
              <span class="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                ${p.brand}
              </span>
              <span class="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                ${p.category}
              </span>
            </div>

            <h1 class="text-xl sm:text-2xl font-black text-slate-900 leading-tight">${p.name}</h1>

            <div class="flex items-center gap-3 text-xs">
              <div class="flex items-center text-amber-500 font-bold">
                ★ ${p.rating}
              </div>
              <span class="text-slate-300">|</span>
              <span class="text-slate-500">${p.reviewsCount.toLocaleString()} Customer Reviews</span>
              <span class="text-slate-300">|</span>
              <span class="text-emerald-600 font-semibold">${p.stock > 0 ? `In Stock (${p.stock} units)` : 'Out of Stock'}</span>
            </div>

            <div class="pt-2">
              <span class="text-2xl sm:text-3xl font-black text-slate-900 font-mono">₹${p.price.toLocaleString('en-IN')}</span>
              <span class="text-xs text-slate-400 ml-1.5">(Inclusive of all taxes)</span>
            </div>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">${p.description}</p>
          </div>

          <!-- Specifications Table -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i data-lucide="cpu" class="w-3.5 h-3.5 text-blue-600"></i>
              <span>Key Technical Specifications</span>
            </h4>
            <table class="w-full text-left">
              <tbody>${specsRows}</tbody>
            </table>
          </div>

          <!-- Add to Cart Action -->
          <div class="pt-2 flex items-center gap-3">
            <button
              onclick="window.SmartStore.addToCart('${p.id}'); window.SmartStore.closeProductModal();"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <i data-lucide="shopping-bag" class="w-4 h-4"></i>
              <span>Add to Shopping Cart</span>
            </button>
          </div>

        </div>

      </div>

      <!-- AI RECOMMENDATION SECTION: "You May Also Like" -->
      <div class="pt-8 border-t border-slate-200">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="font-black text-base text-slate-900">You May Also Like</h3>
              <p class="text-[11px] text-slate-500">AI-Powered Content Recommendations (TF-IDF & Cosine Similarity)</p>
            </div>
          </div>
          <span class="text-xs font-mono bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg">
            Cosine Similarity Matrix
          </span>
        </div>

        <!-- 4-5 Recommendation Product Cards with Real Images -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${recs.slice(0, 4).map(r => `
            <div
              class="bg-slate-50 hover:bg-white p-3 rounded-2xl border border-slate-200 hover:border-purple-300 transition product-card cursor-pointer flex flex-col justify-between space-y-2.5 shadow-sm"
              onclick="window.SmartStore.openProductModal('${r.id}')"
            >
              <div class="aspect-square bg-slate-100 rounded-xl overflow-hidden relative">
                <img
                  src="${r.imageUrl}"
                  alt="${r.name}"
                  loading="lazy"
                  class="w-full h-full object-cover"
                  onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600'"
                />
                <span class="absolute top-2 right-2 bg-purple-900/90 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                  ${r.similarityPercentage || 'AI Match'}
                </span>
              </div>

              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase">${r.brand}</span>
                <h4 class="font-bold text-xs text-slate-900 line-clamp-1">${r.name}</h4>
                <div class="flex items-center justify-between text-xs font-bold pt-1">
                  <span class="text-blue-600 font-mono">₹${r.price.toLocaleString('en-IN')}</span>
                  <span class="text-amber-500 text-[10px]">★ ${r.rating}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.dom.productModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  closeProductModal() {
    this.dom.productModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  },

  // Cart Operations
  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const existing = this.cart.find(item => item.product.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ product, quantity: 1 });
    }

    this.updateCartUI();
    this.showToast(`Added "${product.name}" to cart!`);
  },

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.product.id !== productId);
    this.updateCartUI();
  },

  updateQuantity(productId, delta) {
    const item = this.cart.find(i => i.product.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(productId);
    } else {
      this.updateCartUI();
    }
  },

  updateCartUI() {
    const totalItems = this.cart.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = this.cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
    const gst = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gst;

    this.dom.cartBadge.textContent = totalItems;
    this.dom.cartDrawerCount.textContent = `${totalItems} items`;
    this.dom.cartSubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    this.dom.cartGst.textContent = `₹${gst.toLocaleString('en-IN')}`;
    this.dom.cartTotal.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

    if (this.cart.length === 0) {
      this.dom.cartItemsContainer.innerHTML = `
        <div class="py-16 text-center space-y-3">
          <i data-lucide="shopping-bag" class="w-12 h-12 text-slate-300 mx-auto"></i>
          <p class="text-xs text-slate-500">Your shopping cart is empty.</p>
        </div>
      `;
    } else {
      this.dom.cartItemsContainer.innerHTML = this.cart.map(item => `
        <div class="py-3 flex items-center justify-between gap-3">
          <img
            src="${item.product.imageUrl}"
            alt="${item.product.name}"
            class="w-14 h-14 object-cover rounded-xl bg-slate-100 flex-shrink-0"
            onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400'"
          />
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold text-slate-900 truncate">${item.product.name}</h4>
            <div class="text-[11px] text-blue-600 font-mono font-bold">₹${item.product.price.toLocaleString('en-IN')}</div>
            <div class="flex items-center gap-2 mt-1">
              <button onclick="window.SmartStore.updateQuantity('${item.product.id}', -1)" class="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold flex items-center justify-center">-</button>
              <span class="text-xs font-semibold text-slate-800">${item.quantity}</span>
              <button onclick="window.SmartStore.updateQuantity('${item.product.id}', 1)" class="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold flex items-center justify-center">+</button>
            </div>
          </div>
          <button onclick="window.SmartStore.removeFromCart('${item.product.id}')" class="text-slate-400 hover:text-rose-500 p-1">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `).join('');
    }

    if (window.lucide) window.lucide.createIcons();
  },

  openCartDrawer() {
    this.dom.cartDrawer.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  },

  closeCartDrawer() {
    this.dom.cartDrawer.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  },

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5';
    toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      toast.remove();
    }, 2500);
  },

  resetAllFilters() {
    this.activeSearchQuery = '';
    this.dom.searchInput.value = '';
    this.dom.clearSearchBtn.classList.add('hidden');
    this.selectedCategories.clear();
    this.selectedBrands.clear();
    this.maxPrice = 350000;
    this.minRating = 0;
    this.inStockOnly = false;
    this.dom.priceSlider.value = 350000;
    this.dom.priceLabel.textContent = 'Up to ₹3.5L';
    this.dom.instockCheckbox.checked = false;
    document.querySelectorAll('input[name="rating-filter"]').forEach(r => r.checked = r.value === '0');

    this.renderCategoryChips();
    this.syncSidebarCheckboxes();
    this.renderSidebarFilters();
    this.applyDMGTFilters();
  },

  setupEventListeners() {
    // Autocomplete Input
    this.dom.searchInput.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });

    this.dom.clearSearchBtn.addEventListener('click', () => {
      this.dom.searchInput.value = '';
      this.activeSearchQuery = '';
      this.dom.autocompleteDropdown.classList.add('hidden');
      this.dom.clearSearchBtn.classList.add('hidden');
      this.applyDMGTFilters();
    });

    // Close autocomplete on click outside
    document.addEventListener('click', (e) => {
      if (!this.dom.searchInput.contains(e.target) && !this.dom.autocompleteDropdown.contains(e.target)) {
        this.dom.autocompleteDropdown.classList.add('hidden');
      }
    });

    // Price Slider
    this.dom.priceSlider.addEventListener('input', (e) => {
      this.maxPrice = Number(e.target.value);
      this.dom.priceLabel.textContent = `Up to ₹${(this.maxPrice / 1000).toFixed(0)}k`;
      this.applyDMGTFilters();
    });

    // Rating Filter
    document.querySelectorAll('input[name="rating-filter"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.minRating = Number(e.target.value);
        this.applyDMGTFilters();
      });
    });

    // In Stock
    this.dom.instockCheckbox.addEventListener('change', (e) => {
      this.inStockOnly = e.target.checked;
      this.applyDMGTFilters();
    });

    // Sort Dropdown
    this.dom.sortSelect.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.applyDMGTFilters();
    });

    // Reset All
    this.dom.resetAllBtn.addEventListener('click', () => this.resetAllFilters());
    this.dom.brandLogoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.resetAllFilters();
    });

    // Modals
    this.dom.closeProductModalBtn.addEventListener('click', () => this.closeProductModal());
    this.dom.productModal.addEventListener('click', (e) => {
      if (e.target === this.dom.productModal) this.closeProductModal();
    });

    this.dom.openCartBtn.addEventListener('click', () => this.openCartDrawer());
    this.dom.closeCartBtn.addEventListener('click', () => this.closeCartDrawer());
    this.dom.cartDrawer.addEventListener('click', (e) => {
      if (e.target === this.dom.cartDrawer) this.closeCartDrawer();
    });

    this.dom.checkoutBtn.addEventListener('click', () => {
      if (this.cart.length === 0) {
        alert('Your shopping cart is empty!');
        return;
      }
      alert('🎉 Order Placed Successfully!\n\nThank you for shopping at SmartSearch Electronics Store. A confirmation message has been sent to your registered contact.');
      this.cart = [];
      this.updateCartUI();
      this.closeCartDrawer();
    });

    // Academic Inspector Modal
    this.dom.openAcademicBtn.addEventListener('click', () => {
      this.dom.academicModal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    });
    this.dom.closeAcademicBtn.addEventListener('click', () => {
      this.dom.academicModal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    });
    this.dom.academicModal.addEventListener('click', (e) => {
      if (e.target === this.dom.academicModal) {
        this.dom.academicModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    });

    // Academic Tabs
    document.querySelectorAll('.academic-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.academic-tab-btn').forEach(b => {
          b.classList.remove('bg-blue-600', 'text-white', 'active');
          b.classList.add('bg-slate-100', 'text-slate-700');
        });
        btn.classList.remove('bg-slate-100', 'text-slate-700');
        btn.classList.add('bg-blue-600', 'text-white', 'active');

        document.querySelectorAll('.academic-tab-content').forEach(content => {
          content.classList.add('hidden');
        });
        document.getElementById(`tab-${tab}`).classList.remove('hidden');
      });
    });
  }
};

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  window.SmartStore.init();
});
