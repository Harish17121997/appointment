<template>
  <div class="services-page">

    <!-- Tab Bar -->
    <div class="tab-bar">
      <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'menu' }" @click="activeTab = 'menu'">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        Services & Prices
      </button>
      <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'billing' }" @click="activeTab = 'billing'">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
        Walk-in Billing
      </button>
      <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'products' }" @click="activeTab = 'products'; loadProducts()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        Products
      </button>
    </div>

    <!-- ══════════════ SERVICES MENU TAB ══════════════ -->
    <div v-if="activeTab === 'menu'" class="menu-tab">
      <div class="menu-controls">
        <div class="search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="Search services…" class="search-input" />
        </div>
        <div class="category-pills">
          <button v-for="cat in allCategories" :key="cat" class="pill"
            :class="{ 'pill--active': selectedCategory === cat }"
            @click="selectedCategory = cat">{{ cat }}</button>
        </div>
      </div>

      <div v-for="cat in visibleCategories" :key="cat.name" class="category-section">
        <div class="category-header">
          <span class="category-icon" v-html="cat.icon"></span>
          <h2 class="category-title">{{ cat.name }}</h2>
          <span class="category-count">{{ cat.services.length }} services</span>
        </div>
        <div class="services-grid">
          <div v-for="svc in cat.services" :key="svc.name" class="service-card" @click="quickAddToBill(svc)">
            <div class="service-card__name">{{ svc.name }}</div>
            <div class="service-card__footer">
              <span class="service-card__price">₹{{ svc.price.toLocaleString('en-IN') }}</span>
              <button class="add-btn" @click.stop="quickAddToBill(svc)" title="Add to bill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="visibleCategories.length === 0" class="empty-state">
        No services found for "{{ searchQuery }}"
      </div>
    </div>

    <!-- ══════════════ BILLING TAB ══════════════ -->
    <div v-if="activeTab === 'billing'" class="billing-tab">
      <div class="billing-layout">

        <!-- LEFT: Customer + Add Service -->
        <div class="billing-left">
          <div class="card">
            <div class="card__title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Customer
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Name</label>
                <input v-model="bill.customerName" type="text" placeholder="Customer name" class="form-input" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input v-model="bill.customerPhone" type="tel" placeholder="9876543210" class="form-input" />
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card__title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              Add Service
            </div>
            <div class="form-group">
              <label>Service</label>
              <select v-model="newItem.serviceName" @change="onServiceSelect" class="form-select">
                <option value="">Choose a service</option>
                <optgroup v-for="cat in allServicesFlat" :key="cat.name" :label="cat.name">
                  <option v-for="svc in cat.services" :key="svc.name" :value="svc.name">
                    {{ svc.name }} — ₹{{ svc.price.toLocaleString('en-IN') }}
                  </option>
                </optgroup>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Staff</label>
                <select v-model="newItem.staff" class="form-select">
                  <option value="">Choose staff</option>
                  <option v-for="s in staffList" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Rate (₹)</label>
                <input v-model.number="newItem.rate" type="number" class="form-input" />
              </div>
              <div class="form-group form-group--sm">
                <label>Qty</label>
                <input v-model.number="newItem.qty" type="number" min="1" class="form-input" />
              </div>
            </div>
            <button class="btn-add-item" @click="addItemToBill" :disabled="!newItem.serviceName">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add to Bill
            </button>
          </div>

          <div class="card">
            <div class="card__title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Add Product
              <button class="refresh-btn" @click="loadProducts" :disabled="productsLoading" title="Refresh products">
                <svg :class="{ 'spin-icon': productsLoading }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="23,4 23,10 17,10"/>
                  <polyline points="1,20 1,14 7,14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
                  <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/>
                </svg>
              </button>
            </div>

            <!-- Product search dropdown -->
            <div class="form-group" ref="productDropdownRef">
              <label>Product</label>
              <div
                class="product-select"
                :class="{ 'product-select--open': productDropdownOpen }"
                @click="openProductDropdown"
              >
                <span v-if="newProduct.name" class="product-select__value">{{ newProduct.name }}</span>
                <span v-else class="product-select__placeholder">
                  <span v-if="productsLoading">Loading products…</span>
                  <span v-else-if="productsError" class="product-select__error">{{ productsError }}</span>
                  <span v-else>Search or pick a product…</span>
                </span>
                <svg class="product-select__chevron" :class="{ rotated: productDropdownOpen }"
                  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              <div v-if="productDropdownOpen" class="product-dropdown">
                <div class="product-dropdown__search-wrap">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    ref="productSearchInput"
                    v-model="productSearch"
                    class="product-dropdown__search"
                    placeholder="Type to filter…"
                    @click.stop
                    @keydown.escape="productDropdownOpen = false"
                  />
                  <button v-if="productSearch" type="button" class="product-dropdown__clear-btn" @click.stop="productSearch = ''">×</button>
                </div>
                <div class="product-dropdown__list">
                  <div v-if="filteredProducts.length === 0 && !productsLoading" class="product-dropdown__empty">
                    <span v-if="productSearch">No products match "{{ productSearch }}"</span>
                    <span v-else>No products found. Add them in your sheet.</span>
                  </div>
                  <button
                    v-for="p in filteredProducts"
                    :key="p.name"
                    type="button"
                    class="product-dropdown__item"
                    :class="{ 'product-dropdown__item--selected': newProduct.name === p.name }"
                    @click.stop="selectProduct(p)"
                  >
                    <span class="product-dropdown__item-name">{{ p.name }}</span>
                    <span class="product-dropdown__item-price">₹{{ Number(p.price).toLocaleString('en-IN') }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-row" v-if="newProduct.name">
              <div class="form-group">
                <label>Rate (₹)</label>
                <input v-model.number="newProduct.rate" type="number" class="form-input" />
              </div>
              <div class="form-group form-group--sm">
                <label>Qty</label>
                <input v-model.number="newProduct.qty" type="number" min="1" class="form-input" />
              </div>
            </div>
            <button class="btn-add-item btn-add-item--product" @click="addProductToBill" :disabled="!newProduct.name">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add to Bill
            </button>
          </div>
        </div>

        <!-- RIGHT: Invoice Preview -->
        <div class="billing-right">
          <div class="invoice-card">
            <div class="invoice-header">
              <div>
                <div class="invoice-title">Invoice Preview</div>
                <div class="invoice-subtitle">{{ bill.items.length }} item(s)</div>
              </div>
              <div class="invoice-salon">Scintillate Unisex Salon</div>
            </div>

            <!-- Price-check warning banner -->
            <div v-if="bill.items.some(i => i.needsPriceCheck)" class="price-warn-banner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Highlighted rows had no exact price match — please verify the rate before creating the invoice.
            </div>
            <div class="invoice-table-wrap">
              <table class="invoice-table" v-if="bill.items.length">
                <thead>
                  <tr>
                    <th>#</th><th>Description</th><th>Staff</th><th>Rate</th><th>Qty</th><th>Total</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in bill.items" :key="i" :class="{ 'row--warn': item.needsPriceCheck, 'row--product': item.isProduct }">
                    <td class="td-num">{{ i + 1 }}</td>
                    <td>
                      <div class="item-name">{{ item.serviceName }}</div>
                      <span class="item-badge" :class="item.isProduct ? 'item-badge--product' : ''">{{ item.isProduct ? 'Product' : 'Service' }}</span>
                    </td>
                    <td>{{ item.staff || '—' }}</td>
                    <td><input v-model.number="item.rate" type="number" class="rate-input" /></td>
                    <td><input v-model.number="item.qty" type="number" min="1" class="qty-input" /></td>
                    <td class="td-total">₹{{ (item.rate * item.qty).toLocaleString('en-IN') }}</td>
                    <td>
                      <button class="remove-btn" @click="removeItem(i)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="empty-invoice">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                <p>No items added yet.<br>Choose a service on the left.</p>
              </div>
            </div>

            <div class="invoice-totals">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>₹{{ subtotal.toLocaleString('en-IN') }}</span>
              </div>
              <div class="totals-row discount-row">
                <span>Discount (₹)</span>
                <div class="discount-inputs">
                  <input v-model.number="bill.discount" type="number" min="0" class="discount-input" placeholder="0" />
                  <input v-model="bill.discountReason" type="text" class="reason-input" placeholder="Reason (optional)" />
                </div>
              </div>
              <div class="totals-row totals-row--grand">
                <span>Total</span>
                <span class="grand-total">₹{{ grandTotal.toLocaleString('en-IN') }}</span>
              </div>
            </div>

            <div class="invoice-actions">
              <button class="btn-cancel" @click="clearBill">Cancel</button>
              <button class="btn-create" :disabled="bill.items.length === 0" @click="createInvoice">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <line x1="9" y1="7" x2="15" y2="7"/>
                  <line x1="9" y1="11" x2="15" y2="11"/>
                  <line x1="9" y1="15" x2="13" y2="15"/>
                </svg>
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════ PRODUCTS TAB ══════════════ -->
    <div v-if="activeTab === 'products'" class="ptab">

      <!-- Top bar -->
      <div class="ptab__topbar">
        <div class="ptab__topbar-left">
          <div class="ptab__title">Product Catalogue</div>
          <div class="ptab__subtitle">
            <span class="ptab__count">{{ products.length }} products</span>
            <span v-if="productsError" class="ptab__err-badge">⚠ {{ productsError }}</span>
          </div>
        </div>
        <div class="ptab__topbar-right">
          <div class="ptab__search-box">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="productManageSearch" class="ptab__search-input" placeholder="Search products…" />
            <button v-if="productManageSearch" class="ptab__search-clear" @click="productManageSearch = ''">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <button class="ptab__btn-refresh" @click="loadProducts" :disabled="productsLoading" title="Refresh">
            <svg :class="{ 'ptab-spin': productsLoading }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/>
            </svg>
          </button>
          <button class="ptab__btn-add" @click="openAddProduct">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Product
          </button>
        </div>
      </div>

      <!-- Add / Edit inline form -->
      <transition name="pf-slide">
        <div v-if="productForm.show" class="pf-card">
          <div class="pf-card__head">
            <div class="pf-card__label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path v-if="productForm.id" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path v-if="productForm.id" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                <line v-if="!productForm.id" x1="12" y1="5" x2="12" y2="19"/><line v-if="!productForm.id" x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {{ productForm.id ? 'Edit Product' : 'New Product' }}
            </div>
            <button class="pf-card__close" @click="closeProductForm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="pf-card__body">
            <div class="pf-field pf-field--wide">
              <label class="pf-label">Product Name <span class="pf-req">*</span></label>
              <input
                v-model="productForm.name"
                class="pf-input"
                :class="{ 'pf-input--err': productForm.nameError }"
                placeholder="e.g. Loreal Shampoo 400ml"
                @input="productForm.nameError = ''"
              />
              <span v-if="productForm.nameError" class="pf-err-msg">{{ productForm.nameError }}</span>
            </div>
            <div class="pf-field">
              <label class="pf-label">Price (₹) <span class="pf-req">*</span></label>
              <input v-model.number="productForm.price" type="number" min="0" class="pf-input" placeholder="0" />
            </div>
            <div class="pf-field">
              <label class="pf-label">Category</label>
              <input v-model="productForm.category" class="pf-input" placeholder="e.g. Hair Care" />
            </div>
          </div>
          <div class="pf-card__foot">
            <button class="pf-btn pf-btn--ghost" @click="closeProductForm">Cancel</button>
            <button class="pf-btn pf-btn--save" @click="saveProduct" :disabled="productForm.saving">
              <svg v-if="productForm.saving" class="ptab-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ productForm.saving ? 'Saving…' : (productForm.id ? 'Update Product' : 'Add Product') }}
            </button>
          </div>
        </div>
      </transition>

      <!-- Loading state -->
      <div v-if="productsLoading" class="ptab__loading">
        <svg class="ptab-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        Loading products from sheet…
      </div>

      <!-- Products grid / table -->
      <template v-else-if="managedProducts.length">
        <!-- Category group by -->
        <template v-if="!productManageSearch">
          <div v-for="group in groupedProducts" :key="group.category" class="ptab__group">
            <div class="ptab__group-header">
              <span class="ptab__group-name">{{ group.category || 'Uncategorised' }}</span>
              <span class="ptab__group-count">{{ group.items.length }}</span>
            </div>
            <div class="ptab__cards">
              <div v-for="p in group.items" :key="p.id" class="pcard">
                <div class="pcard__name">{{ p.name }}</div>
                <div class="pcard__bottom">
                  <span class="pcard__price">₹{{ Number(p.price).toLocaleString('en-IN') }}</span>
                  <div class="pcard__actions">
                    <button class="pcard__btn pcard__btn--edit" @click="editProduct(p)" title="Edit">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="pcard__btn pcard__btn--del" @click="confirmDeleteProduct(p)" title="Delete">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Flat list when searching -->
        <div v-else class="ptab__cards ptab__cards--flat">
          <div v-for="p in managedProducts" :key="p.id" class="pcard">
            <div class="pcard__name">{{ p.name }}</div>
            <div v-if="p.category" class="pcard__cat">{{ p.category }}</div>
            <div class="pcard__bottom">
              <span class="pcard__price">₹{{ Number(p.price).toLocaleString('en-IN') }}</span>
              <div class="pcard__actions">
                <button class="pcard__btn pcard__btn--edit" @click="editProduct(p)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="pcard__btn pcard__btn--del" @click="confirmDeleteProduct(p)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty -->
      <div v-else class="ptab__empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.25">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <p>{{ productManageSearch ? `No products match "${productManageSearch}"` : 'No products yet.' }}</p>
        <button v-if="!productManageSearch" class="ptab__btn-add" @click="openAddProduct" style="margin-top:4px">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add your first product
        </button>
      </div>

      <!-- Delete confirm dialog -->
      <transition name="modal">
        <div v-if="productDeleteConfirm.show" class="del-overlay" @click.self="productDeleteConfirm.show = false">
          <div class="del-dialog">
            <div class="del-dialog__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <div class="del-dialog__title">Delete Product?</div>
            <div class="del-dialog__msg">
              <strong>{{ productDeleteConfirm.name }}</strong> will be removed from the catalogue. This cannot be undone.
            </div>
            <div class="del-dialog__actions">
              <button class="pf-btn pf-btn--ghost" @click="productDeleteConfirm.show = false">Cancel</button>
              <button class="pf-btn pf-btn--del" @click="deleteProduct" :disabled="productDeleteConfirm.deleting">
                {{ productDeleteConfirm.deleting ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </transition>

    </div>


    <!-- ══════════════ INVOICE MODAL ══════════════ -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="invoiceModal.show" class="inv-backdrop" @click.self="invoiceModal.show = false">
          <div class="inv-modal">

            <!-- Modal Header -->
            <div class="inv-modal__header">
              <div>
                <h2 class="inv-modal__title">Invoice Ready</h2>
                <p class="inv-modal__sub">Send to customer or print</p>
              </div>
              <button class="inv-modal__close" @click="invoiceModal.show = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- Invoice Preview (printable area) -->
            <div class="inv-preview" id="invoice-print-area">
              <!-- Salon Header -->
              <div class="inv-salon-header">
                <div class="inv-salon-logo"><img style="width: 50px; height: 40px;" src="/favicon.png" alt="Scintillate Salon" /></div>
                <div>
                  <div class="inv-salon-name">Scintillate Unisex Salon</div>
                  <div class="inv-salon-addr">Pune, Maharashtra · +91 98765 43210</div>
                </div>
                <div class="inv-meta">
                  <div class="inv-num">Invoice #{{ invoiceModal.invoiceNo }}</div>
                  <div class="inv-date">{{ invoiceModal.dateStr }}</div>
                </div>
              </div>

              <!-- Customer -->
              <div class="inv-customer">
                <div class="inv-customer__label">Bill To</div>
                <div class="inv-customer__name">{{ invoiceModal.customerName || 'Walk-in Customer' }}</div>
                <div v-if="invoiceModal.customerPhone" class="inv-customer__phone">📞 {{ invoiceModal.customerPhone }}</div>
              </div>

              <!-- Items Table -->
              <table class="inv-table">
                <thead>
                  <tr>
                    <th class="inv-th">#</th>
                    <th class="inv-th">Service</th>
                    <th class="inv-th">Staff</th>
                    <th class="inv-th inv-th--right">Qty</th>
                    <th class="inv-th inv-th--right">Rate</th>
                    <th class="inv-th inv-th--right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in invoiceModal.items" :key="i" class="inv-tr">
                    <td class="inv-td inv-td--muted">{{ i + 1 }}</td>
                    <td class="inv-td inv-td--name">
                      {{ item.serviceName }}
                      <span v-if="item.isProduct" class="inv-badge--product">Product</span>
                    </td>
                    <td class="inv-td inv-td--muted">{{ item.staff || '—' }}</td>
                    <td class="inv-td inv-td--right">{{ item.qty }}</td>
                    <td class="inv-td inv-td--right">₹{{ item.rate.toLocaleString('en-IN') }}</td>
                    <td class="inv-td inv-td--right inv-td--bold">₹{{ (item.rate * item.qty).toLocaleString('en-IN') }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Totals -->
              <div class="inv-totals">
                <div class="inv-tot-row">
                  <span>Subtotal</span>
                  <span>₹{{ invoiceModal.subtotal.toLocaleString('en-IN') }}</span>
                </div>
                <div v-if="invoiceModal.discount > 0" class="inv-tot-row inv-tot-row--disc">
                  <span>Discount{{ invoiceModal.discountReason ? ` (${invoiceModal.discountReason})` : '' }}</span>
                  <span>− ₹{{ invoiceModal.discount.toLocaleString('en-IN') }}</span>
                </div>
                <div class="inv-tot-row inv-tot-row--grand">
                  <span>Total</span>
                  <span>₹{{ invoiceModal.grandTotal.toLocaleString('en-IN') }}</span>
                </div>
              </div>

              <!-- Footer -->
              <div class="inv-footer">
                Thank you for visiting Scintillate! 💫 See you again soon.
              </div>
            </div>

            <!-- Send Actions -->
            <div class="inv-actions">
              <button class="inv-btn inv-btn--print" @click="printInvoice">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print / Save PDF
              </button>
              <button class="inv-btn inv-btn--wa" @click="sendInvoiceWhatsApp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                 WhatsApp
              </button>
              <!-- <button class="inv-btn inv-btn--email" @click="sendInvoiceEmail">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Send Email
              </button> -->
              <button class="inv-btn inv-btn--done" @click="doneInvoice">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Done
              </button>
            </div>

          </div>
        </div>
      </transition>
    </teleport>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="`toast--${toast.type}`">{{ toast.message }}</div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { SERVICE_ALIAS_MAP } from '@/composables/useBookings'

// Define API URL directly in this component
const API_URL = 'https://script.google.com/macros/s/AKfycbx3lXRJdgP7uHFqU82c7T0kxDPW3HEWUcB3LpyGrGlAKpMFIckpWFzuFLSDuGvfzQzDTQ/exec'

const route = useRoute()

const activeTab = ref('menu')
const searchQuery = ref('')
const selectedCategory = ref('All')

// ── All Services Data ──
const allServicesFlat = [
  {
    name: 'Hair',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>`,
    services: [
      { name: 'Botorepair Treatment Short Hair', price: 3999 },
      { name: 'Basic Hair Spa - Long Length', price: 1600 },
      { name: 'Basic Hair Spa - Medium Length', price: 999 },
      { name: 'Basic Hair Spa - Short Length', price: 999 },
      { name: 'Botoliss - Long Length', price: 9000 },
      { name: 'Botoliss - Medium Length', price: 6000 },
      { name: 'Botoliss Short', price: 3999 },
      { name: 'Botorepair Treatment Long Length', price: 9999 },
      { name: 'Botorepair Treatment Medium Length', price: 6999 },
      { name: 'Hair Styling - Basic Up Do', price: 1000 },
      { name: 'Hair Styling - Ironing', price: 800 },
      { name: 'Hair Styling - Tongs', price: 1000 },
      { name: 'Luxury Hair Spa - Long Length', price: 2100 },
      { name: 'Luxury Hair Spa - Medium Length', price: 1500 },
      { name: 'Luxury Hair Spa - Short Length', price: 1200 },
      { name: 'Dandruff Hair Spa', price: 1500 },
      { name: 'Shea Hair Spa', price: 3000 },
      { name: "Women's Express Filler Hair Wash & Blow Dry", price: 1200 },
      { name: "Women's Hair Wash & Blast Dry", price: 500 },
      { name: "Women's Hair Wash & Blow Dry", price: 600 },
      { name: "Women's Treatment Hair Wash & Blow Dry", price: 800 },
      { name: "Women's Hair Trim", price: 600 },
    ]
  },
  {
    name: "Men's Grooming",
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    services: [
      { name: "Men's Hair Color", price: 1200 },
      { name: "Men's Hair Color Ammonia Free", price: 1400 },
      { name: "Men's Hair Spa", price: 1000 },
      { name: "Men's Hair Wash", price: 300 },
      { name: "Men's Premium Hair Spa", price: 1200 },
      { name: "Men's Haircut", price: 300 },
    ]
  },
  {
    name: 'Hair Color',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    services: [
      { name: 'Balayage Hair Colour', price: 4500 },
      { name: 'Balayage Long Length', price: 6500 },
      { name: 'Global Hair Color Loreal Long Length', price: 7500 },
      { name: 'Global Hair Color Loreal Medium Length', price: 4500 },
      { name: 'Global Hair Color Schwarzkopf Long Length', price: 8500 },
      { name: 'Global Hair Color Schwarzkopf Medium Length', price: 5500 },
      { name: 'Global Hair Color Schwarzkopf Short Hair', price: 3000 },
      { name: 'Global Hair Color Short Length Loreal', price: 2000 },
      { name: 'Global Highlights', price: 4500 },
      { name: 'Root Touchup Loreal Ammonia Free', price: 1400 },
      { name: 'Root Touch Up Loreal upto 1 inch', price: 1200 },
      { name: 'Root Touch Up Schwarzkopf', price: 1400 },
      { name: 'Root Touch Up Schwarzkopf Ammonia Free', price: 1600 },
    ]
  },
  {
    name: 'Skin',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    services: [
      { name: 'Acne Treatment', price: 1500 },
      { name: 'D-Tan', price: 599 },
      { name: 'Hydration Booster Therapy', price: 2800 },
      { name: 'Body Polishing', price: 3000 },
      { name: 'Arms Polishing', price: 800 },
      { name: 'Legs Polishing', price: 1000 },
      { name: 'Back Polishing', price: 800 },
    ]
  },
  {
    name: 'Facial',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
    services: [
      { name: 'Bridal Facial O3 Professional', price: 3999 },
      { name: 'O3 Shine & Glow', price: 3000 },
      { name: 'Kanpeki Luxury Facial', price: 2500 },
      { name: 'Fruit Facial', price: 1000 },
      { name: 'Gold Facial', price: 1499 },
      { name: 'Fruit Clean Up', price: 800 },
      { name: 'Kanpeki Cleanup', price: 1200 },
    ]
  },
  {
    name: 'Massage',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><path d="M21 12c.552 0 1-.449 1-1V5c0-.551-.448-1-1-1H3c-.552 0-1 .449-1 1v6c0 .551.448 1 1 1h9l3 3V12h6z"/></svg>`,
    services: [
      { name: 'Basic Manicure', price: 700 },
      { name: 'Luxury Manicure', price: 1200 },
      { name: 'Basic Pedicure', price: 999 },
      { name: 'Luxury Pedicure', price: 1500 },
      { name: 'O3 Pedicure', price: 3000 },
      { name: 'Foot Massage', price: 600 },
      { name: 'Head Massage', price: 600 },
      { name: 'Scientific Combing', price: 500 },
      { name: 'Head Massage with Wash', price: 900 },
      { name: 'Back Massage', price: 600 },
    ]
  },
  {
    name: 'Waxing',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    services: [
      { name: 'Back Wax', price: 500 },
      { name: 'Brazilian Wax - Upper Lips', price: 50 },
      { name: 'Brazilian Wax - Side Locks', price: 150 },
      { name: 'Brazilian Wax - Bikini', price: 1300 },
      { name: 'Brazilian Wax - Eyebrows', price: 250 },
      { name: 'Full Body Wax', price: 2999 },
      { name: 'Rica Wax - Full Hands', price: 550 },
      { name: 'Rica Wax - Full Legs', price: 750 },
      { name: 'Rica Wax - Half Leg', price: 450 },
      { name: 'Rica Wax - Hands + Underarms', price: 600 },
      { name: 'Rica Wax - Stomach', price: 300 },
      { name: 'Rica Wax - Underarms', price: 150 },
    ]
  },
  {
    name: 'Threading',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    services: [
      { name: 'Threading Chin', price: 50 },
      { name: 'Threading Eyebrows', price: 100 },
      { name: 'Threading Full Face', price: 250 },
      { name: 'Threading Side Locks', price: 80 },
      { name: 'Threading Upper Lips', price: 50 },
    ]
  },
  {
    name: 'Kids',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    services: [
      { name: 'Kids Haircut - Boys', price: 300 },
      { name: 'Kids Haircut - Girls', price: 400 },
    ]
  },
]

const staffList = ref(['Lucky', 'Shaad', 'Priyanka', 'Surabhi'])

// ── Products ──────────────────────────────────────────────────────────────────
const products = ref([])
const productsLoading = ref(false)
const productsError = ref('')
const productDropdownOpen = ref(false)
const productDropdownRef = ref(null)
const productSearchInput = ref(null)
const productSearch = ref('')
const newProduct = reactive({ name: '', rate: 0, qty: 1 })

const filteredProducts = computed(() => {
  const q = productSearch.value.toLowerCase().trim()
  if (!q) return products.value
  return products.value.filter(p => p.name.toLowerCase().includes(q))
})

async function loadProducts() {
  productsLoading.value = true
  productsError.value = ''
  try {
    const res = await fetch(`${API_URL}?action=productGet`)
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed')
    products.value = data.products || []
  } catch (err) {
    productsError.value = 'Could not load products'
    console.error('Product fetch error:', err)
  } finally {
    productsLoading.value = false
  }
}

async function openProductDropdown() {
  productDropdownOpen.value = true
  if (products.value.length === 0 && !productsLoading.value) loadProducts()
  await nextTick()
  productSearchInput.value?.focus()
}

function selectProduct(p) {
  newProduct.name = p.name
  newProduct.rate = Number(p.price) || 0
  newProduct.qty = 1
  productDropdownOpen.value = false
  productSearch.value = ''
}

function addProductToBill() {
  if (!newProduct.name) return
  bill.items.push({
    serviceName: newProduct.name,
    staff: '',
    rate: newProduct.rate,
    qty: newProduct.qty,
    isProduct: true,
  })
  newProduct.name = ''
  newProduct.rate = 0
  newProduct.qty = 1
}

// ── Product Management (Admin) ────────────────────────────────────────────────
const productManageSearch = ref('')

const managedProducts = computed(() => {
  const q = productManageSearch.value.toLowerCase().trim()
  if (!q) return products.value
  return products.value.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.category || '').toLowerCase().includes(q)
  )
})

const groupedProducts = computed(() => {
  const groups = {}
  products.value.forEach(p => {
    const cat = p.category || ''
    if (!groups[cat]) groups[cat] = { category: cat, items: [] }
    groups[cat].items.push(p)
  })
  return Object.values(groups).sort((a, b) => {
    if (!a.category) return 1
    if (!b.category) return -1
    return a.category.localeCompare(b.category)
  })
})

const productForm = reactive({
  show: false,
  id: '',
  name: '',
  price: 0,
  category: '',
  nameError: '',
  saving: false,
})

const productDeleteConfirm = reactive({
  show: false,
  id: '',
  name: '',
  deleting: false,
})

function openAddProduct() {
  productForm.id       = ''
  productForm.name     = ''
  productForm.price    = 0
  productForm.category = ''
  productForm.nameError = ''
  productForm.saving   = false
  productForm.show     = true
}

function editProduct(p) {
  productForm.id       = p.id
  productForm.name     = p.name
  productForm.price    = Number(p.price) || 0
  productForm.category = p.category || ''
  productForm.nameError = ''
  productForm.saving   = false
  productForm.show     = true
}

function closeProductForm() {
  productForm.show = false
}

async function saveProduct() {
  if (!productForm.name.trim()) {
    productForm.nameError = 'Product name is required'
    return
  }
  productForm.saving = true
  try {
    const params = new URLSearchParams({
      action:   'productSave',
      id:       productForm.id || String(Date.now()),
      name:     productForm.name.trim(),
      price:    productForm.price || 0,
      category: productForm.category.trim(),
    })
    const res  = await fetch(`${API_URL}?${params}`)
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Save failed')
    productForm.show = false
    await loadProducts()
    showToast(productForm.id ? 'Product updated!' : 'Product added!', 'success')
  } catch (err) {
    showToast('Failed to save product', 'error')
    console.error(err)
  } finally {
    productForm.saving = false
  }
}

function confirmDeleteProduct(p) {
  productDeleteConfirm.id       = p.id
  productDeleteConfirm.name     = p.name
  productDeleteConfirm.deleting = false
  productDeleteConfirm.show     = true
}

async function deleteProduct() {
  productDeleteConfirm.deleting = true
  try {
    const params = new URLSearchParams({
      action: 'productDelete',
      id:     productDeleteConfirm.id,
    })
    const res  = await fetch(`${API_URL}?${params}`)
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Delete failed')
    productDeleteConfirm.show = false
    await loadProducts()
    showToast('Product deleted', 'success')
  } catch (err) {
    showToast('Failed to delete product', 'error')
    console.error(err)
  } finally {
    productDeleteConfirm.deleting = false
  }
}

function handleProductClickOutside(e) {
  if (productDropdownRef.value && !productDropdownRef.value.contains(e.target)) {
    productDropdownOpen.value = false
    productSearch.value = ''
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleProductClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', handleProductClickOutside)
})

const allCategories = computed(() => ['All', ...allServicesFlat.map(c => c.name)])

const visibleCategories = computed(() => {
  return allServicesFlat
    .filter(cat => selectedCategory.value === 'All' || cat.name === selectedCategory.value)
    .map(cat => ({
      ...cat,
      services: cat.services.filter(svc =>
        svc.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }))
    .filter(cat => cat.services.length > 0)
})

// ── Billing state ──
const bill = reactive({
  customerName: '',
  customerPhone: '',
  items: [],
  discount: 0,
  discountReason: '',
})

const newItem = reactive({
  serviceName: '',
  staff: '',
  rate: 0,
  qty: 1,
})

// ── Smart service resolver ─────────────────────────────────────────────────
// 3-tier lookup: 1) exact match  2) alias map  3) fuzzy substring
function resolveService(rawName) {
  const key = rawName.trim().toLowerCase()
  if (!key) return null
  const catalogue = allServicesFlat.flatMap(cat => cat.services)

  // TIER 1 — exact (case-insensitive)
  const exact = catalogue.find(s => s.name.toLowerCase() === key)
  if (exact) return { resolvedName: exact.name, price: exact.price, ambiguous: false }

  // TIER 2 — alias map (old generic booking names)
  const aliased = SERVICE_ALIAS_MAP[key]
  if (aliased) {
    const entry = catalogue.find(s => s.name === aliased)
    return { resolvedName: aliased, price: entry?.price ?? 0, ambiguous: false }
  }

  // TIER 3 — fuzzy: name contains key or vice-versa
  const fuzzy = catalogue.filter(s =>
    s.name.toLowerCase().includes(key) || key.includes(s.name.toLowerCase())
  )
  if (fuzzy.length === 1)
    return { resolvedName: fuzzy[0].name, price: fuzzy[0].price, ambiguous: false }
  if (fuzzy.length > 1) {
    fuzzy.sort((a, b) => a.name.length - b.name.length)
    return { resolvedName: fuzzy[0].name, price: fuzzy[0].price, ambiguous: true }
  }

  // TIER 4 — no match, keep original name, price 0 (staff fills manually)
  return { resolvedName: rawName.trim(), price: 0, ambiguous: true }
}

// ── Pre-fill bill from booking data ────────────────────────────────────────
function prefillBill({ name, phone, services }) {
  bill.customerName  = name  || ''
  bill.customerPhone = phone || ''
  if (services) {
    const svcNames = services.split(',').map(s => s.trim()).filter(Boolean)
    svcNames.forEach(rawName => {
      const result = resolveService(rawName)
      if (!result) return
      bill.items.push({
        serviceName: result.resolvedName,
        staff: '',
        rate:  result.price,
        qty:   1,
        needsPriceCheck: result.ambiguous || result.price === 0,
      })
    })
  }
  activeTab.value = 'billing'
}

// Expose prefillBill for parent (App.vue can call this via ref)
defineExpose({ prefillBill })

function onServiceSelect() {
  for (const cat of allServicesFlat) {
    const svc = cat.services.find(s => s.name === newItem.serviceName)
    if (svc) { newItem.rate = svc.price; break }
  }
}

function addItemToBill() {
  if (!newItem.serviceName) return
  bill.items.push({
    serviceName: newItem.serviceName,
    staff: newItem.staff,
    rate: newItem.rate,
    qty: newItem.qty,
  })
  newItem.serviceName = ''
  newItem.staff = ''
  newItem.rate = 0
  newItem.qty = 1
}

function quickAddToBill(svc) {
  bill.items.push({ serviceName: svc.name, staff: '', rate: svc.price, qty: 1 })
  activeTab.value = 'billing'
  showToast(`${svc.name} added to bill`, 'success')
}

function removeItem(i) {
  bill.items.splice(i, 1)
}

const subtotal = computed(() => bill.items.reduce((s, it) => s + it.rate * it.qty, 0))
const grandTotal = computed(() => Math.max(0, subtotal.value - (bill.discount || 0)))

function clearBill() {
  bill.customerName = ''
  bill.customerPhone = ''
  bill.items = []
  bill.discount = 0
  bill.discountReason = ''
}

// ── Invoice Modal ──
const invoiceModal = reactive({
  show: false,
  invoiceNo: '',
  dateStr: '',
  customerName: '',
  customerPhone: '',
  items: [],
  subtotal: 0,
  discount: 0,
  discountReason: '',
  grandTotal: 0,
})

function generateInvoiceNo() {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `SCN-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${Math.floor(Math.random() * 900 + 100)}`
}

function createInvoice() {
  if (!bill.items.length) return

  const now = new Date()
  invoiceModal.invoiceNo = generateInvoiceNo()
  invoiceModal.dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) +
    ' · ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  invoiceModal.customerName = bill.customerName
  invoiceModal.customerPhone = bill.customerPhone
  invoiceModal.items = bill.items.map(i => ({ ...i }))
  invoiceModal.subtotal = subtotal.value
  invoiceModal.discount = bill.discount || 0
  invoiceModal.discountReason = bill.discountReason
  invoiceModal.grandTotal = grandTotal.value
  invoiceModal.show = true
}

function buildWhatsAppInvoiceText() {
  const m = invoiceModal
  let msg = `*INVOICE — Scintillate Unisex Salon*\n`
  msg += `Invoice No: *${m.invoiceNo}*\n`
  msg += `Date: ${m.dateStr}\n`
  msg += `${'─'.repeat(32)}\n`
  if (m.customerName) msg += `Customer: *${m.customerName}*\n`
  if (m.customerPhone) msg += `Phone: ${m.customerPhone}\n`
  msg += `${'─'.repeat(32)}\n`
  msg += `*SERVICES*\n`
  m.items.forEach((item, i) => {
    const amt = (item.rate * item.qty).toLocaleString('en-IN')
    const staff = item.staff ? ` (${item.staff})` : ''
    msg += `${i + 1}. ${item.serviceName}${staff}\n`
    if (item.qty > 1) msg += `   ${item.qty} × ₹${item.rate.toLocaleString('en-IN')} = ₹${amt}\n`
    else msg += `   ₹${amt}\n`
  })
  msg += `${'─'.repeat(32)}\n`
  msg += `Subtotal: ₹${m.subtotal.toLocaleString('en-IN')}\n`
  if (m.discount > 0) {
    msg += `Discount${m.discountReason ? ` (${m.discountReason})` : ''}: − ₹${m.discount.toLocaleString('en-IN')}\n`
  }
  msg += `*TOTAL: ₹${m.grandTotal.toLocaleString('en-IN')}*\n`
  msg += `${'─'.repeat(32)}\n`
  msg += `Thank you for visiting Scintillate! ✨\n`
  msg += `We look forward to seeing you again.`
  return msg
}

function sendInvoiceWhatsApp() {
  const msg = buildWhatsAppInvoiceText()
  let phone = ''
  if (invoiceModal.customerPhone) {
    let digits = String(invoiceModal.customerPhone).replace(/\D/g, '')
    if (digits.length === 10) digits = '91' + digits
    phone = digits
  }
  const url = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`
  window.open(url, '_blank')
  showToast('Opening WhatsApp…', 'success')
}

function sendInvoiceEmail() {
  const m = invoiceModal
  const subject = encodeURIComponent(`Invoice ${m.invoiceNo} — Scintillate Unisex Salon`)
  let body = `Dear ${m.customerName || 'Valued Customer'},\n\n`
  body += `Thank you for visiting Scintillate Unisex Salon!\n\n`
  body += `Invoice No: ${m.invoiceNo}\nDate: ${m.dateStr}\n\n`
  body += `SERVICES:\n`
  m.items.forEach((item, i) => {
    body += `${i + 1}. ${item.serviceName}${item.staff ? ` (${item.staff})` : ''} — ₹${(item.rate * item.qty).toLocaleString('en-IN')}\n`
  })
  body += `\nSubtotal: ₹${m.subtotal.toLocaleString('en-IN')}\n`
  if (m.discount > 0) body += `Discount: − ₹${m.discount.toLocaleString('en-IN')}\n`
  body += `TOTAL: ₹${m.grandTotal.toLocaleString('en-IN')}\n\n`
  body += `We look forward to seeing you again!\n\nWarm regards,\nScintillate Unisex Salon`

  window.open(`mailto:?subject=${subject}&body=${encodeURIComponent(body)}`, '_blank')
  showToast('Opening email client…', 'success')
}

function printInvoice() {
  const area = document.getElementById('invoice-print-area')
  if (!area) return
  const win = window.open('', '_blank', 'width=600,height=700')
  const m = invoiceModal

  const rows = m.items.map((item, i) => [
    '<tr>',
    `<td class="muted">${i+1}</td>`,
    `<td><strong>${item.serviceName}${item.isProduct ? ' [Product]' : ''}</strong></td>`,
    `<td class="muted">${item.staff || '—'}</td>`,
    `<td class="right">${item.qty}</td>`,
    `<td class="right">₹${item.rate.toLocaleString('en-IN')}</td>`,
    `<td class="right bold">₹${(item.rate * item.qty).toLocaleString('en-IN')}</td>`,
    '</tr>'
  ].join('')).join('')

  const discountRow = m.discount > 0
    ? `<div class="tot-row"><span>Discount${m.discountReason ? ' (' + m.discountReason + ')' : ''}</span><span>− ₹${m.discount.toLocaleString('en-IN')}</span></div>`
    : ''

  const customerBlock = m.customerName
    ? '<div class="customer">'
      + '<div class="customer-label">Bill To</div>'
      + `<div class="customer-name">${m.customerName}</div>`
      + (m.customerPhone ? `<div class="customer-phone">📞 ${m.customerPhone}</div>` : '')
      + '</div>'
    : ''

  const css = [
    '* { box-sizing: border-box; margin: 0; padding: 0; }',
    "body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; background: white; }",
    '.wrap { max-width: 520px; margin: 0 auto; padding: 32px 24px; }',
    '.salon-header { display: flex; align-items: center; gap: 14px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0; margin-bottom: 20px; }',
    '.salon-logo { width: 44px; height: 44px; background: #8B6F47; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; }',
    '.salon-name { font-size: 18px; font-weight: 700; }',
    '.salon-addr { font-size: 11px; color: #888; margin-top: 2px; }',
    '.inv-meta { margin-left: auto; text-align: right; }',
    '.inv-num { font-size: 13px; font-weight: 600; color: #8B6F47; }',
    '.inv-date { font-size: 11px; color: #888; margin-top: 2px; }',
    '.customer { background: #fafafa; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }',
    '.customer-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; }',
    '.customer-name { font-size: 15px; font-weight: 600; margin-top: 3px; }',
    '.customer-phone { font-size: 12px; color: #666; margin-top: 2px; }',
    'table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }',
    'th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #999; padding: 8px 6px; border-bottom: 1px solid #eee; text-align: left; }',
    'td { padding: 10px 6px; border-bottom: 1px solid #f5f5f5; }',
    '.right { text-align: right; } .bold { font-weight: 600; } .muted { color: #888; }',
    '.totals { border-top: 2px solid #f0f0f0; padding-top: 14px; }',
    '.tot-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; }',
    '.tot-grand { font-size: 16px; font-weight: 700; padding-top: 10px; border-top: 1px solid #eee; margin-top: 6px; color: #8B6F47; }',
    '.footer { text-align: center; margin-top: 28px; font-size: 12px; color: #aaa; padding-top: 16px; border-top: 1px dashed #eee; }',
    '@media print { body { -webkit-print-color-adjust: exact; } }'
  ].join(' ')

  const html = '<!DOCTYPE html>'
    + '<html><head><meta charset="utf-8">'
    + `<title>Invoice ${m.invoiceNo}</title>`
    + `<style>${css}</style>`
    + '</head><body><div class="wrap">'
    + '<div class="salon-header">'
    + '<div class="salon-logo">✂</div>'
    + '<div><div class="salon-name">Scintillate Unisex Salon</div><div class="salon-addr">Pune, Maharashtra</div></div>'
    + '<div class="inv-meta">'
    + `<div class="inv-num">${m.invoiceNo}</div>`
    + `<div class="inv-date">${m.dateStr}</div>`
    + '</div></div>'
    + customerBlock
    + '<table><thead><tr>'
    + '<th>#</th><th>Service</th><th>Staff</th><th class="right">Qty</th><th class="right">Rate</th><th class="right">Amount</th>'
    + '</tr></thead><tbody>' + rows + '</tbody></table>'
    + '<div class="totals">'
    + `<div class="tot-row"><span>Subtotal</span><span>₹${m.subtotal.toLocaleString('en-IN')}</span></div>`
    + discountRow
    + `<div class="tot-row tot-grand"><span>Total</span><span>₹${m.grandTotal.toLocaleString('en-IN')}</span></div>`
    + '</div>'
    + '<div class="footer">Thank you for visiting Scintillate! 💫 See you again soon.</div>'
    + '</div></body></html>'

  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 500)
}

function doneInvoice() {
  invoiceModal.show = false
  clearBill()
  showToast('Invoice completed!', 'success')
}

// ── Toast ──
const toast = reactive({ show: false, message: '', type: 'success' })
let toastTimer = null
function showToast(message, type = 'success') {
  clearTimeout(toastTimer)
  toast.message = message
  toast.type = type
  toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2800)
}

// ── Auto-prefill from route query (when navigated from BookingModal) ──
onMounted(() => {
  const { name, phone, services } = route.query
  if (name || phone || services) {
    prefillBill({ name, phone, services })
  }
})
</script>

<style scoped>
.services-page {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;
}

/* ── Tabs ── */
.tab-bar {
  display: flex; gap: 4px;
  background: var(--color-surface-2, #f5f5f5);
  border-radius: 10px; padding: 4px;
  width: fit-content; margin-bottom: 24px;
}
.tab-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 18px; border-radius: 7px;
  font-size: 13.5px; font-weight: 500;
  background: none; border: none;
  color: var(--color-text-muted, #666);
  cursor: pointer; transition: background 0.15s, color 0.15s;
}
.tab-btn--active {
  background: var(--color-surface, white);
  color: var(--color-accent, #8B6F47);
  box-shadow: 0 1px 4px rgba(0,0,0,0.10);
}

/* ── Menu Controls ── */
.menu-controls {
  display: flex; gap: 16px; align-items: center;
  flex-wrap: wrap; margin-bottom: 28px;
}
.search-wrap {
  display: flex; align-items: center; gap: 8px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 8px; padding: 8px 14px; min-width: 240px;
}
.search-input {
  border: none; outline: none; background: none;
  font-size: 13.5px; color: var(--color-text, #1a1a1a); flex: 1;
}
.category-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.pill {
  font-size: 12px; font-weight: 500;
  padding: 5px 13px; border-radius: 99px;
  border: 1px solid var(--color-border, #e0e0e0);
  background: var(--color-surface, #fff);
  color: var(--color-text-muted, #666);
  cursor: pointer; transition: all 0.15s;
}
.pill--active {
  background: var(--color-accent, #8B6F47);
  color: white; border-color: var(--color-accent, #8B6F47);
}

/* ── Category Sections ── */
.category-section { margin-bottom: 36px; }
.category-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.category-icon { color: var(--color-accent, #8B6F47); display: flex; }
.category-title {
  font-size: 16px; font-weight: 600;
  color: var(--color-text, #1a1a1a);
  font-family: var(--font-display, serif);
}
.category-count {
  font-size: 11px; color: var(--color-text-light, #999);
  background: var(--color-surface-2, #f5f5f5);
  padding: 2px 8px; border-radius: 99px;
}
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}
.service-card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 10px; padding: 14px 14px 10px;
  cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s, transform 0.12s;
  display: flex; flex-direction: column; justify-content: space-between; gap: 10px;
}
.service-card:hover {
  border-color: var(--color-accent, #8B6F47);
  box-shadow: 0 2px 12px rgba(139,111,71,0.1);
  transform: translateY(-1px);
}
.service-card__name { font-size: 13px; color: var(--color-text, #1a1a1a); line-height: 1.4; }
.service-card__footer { display: flex; align-items: center; justify-content: space-between; }
.service-card__price { font-size: 14px; font-weight: 600; color: var(--color-accent, #8B6F47); }
.add-btn {
  width: 26px; height: 26px; border-radius: 6px;
  border: 1px solid var(--color-border, #e8e8e8);
  background: none; color: var(--color-accent, #8B6F47);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s;
}
.add-btn:hover { background: var(--color-accent-light, #f5ede4); }
.empty-state { text-align: center; padding: 60px 20px; color: var(--color-text-muted, #888); font-size: 14px; }

/* ── Billing Layout ── */
.billing-layout {
  display: grid; grid-template-columns: 420px 1fr;
  gap: 24px; align-items: start;
}
@media (max-width: 900px) { .billing-layout { grid-template-columns: 1fr; } }

/* ── Cards ── */
.card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 12px; padding: 20px; margin-bottom: 16px;
}
.card--muted { opacity: 0.6; }
.card__title {
  display: flex; align-items: center; gap: 8px;
  font-size: 13.5px; font-weight: 600;
  color: var(--color-text, #1a1a1a); margin-bottom: 16px;
}
.muted-text { font-size: 13px; color: var(--color-text-muted, #888); }

/* ── Form Elements ── */
.form-row { display: flex; gap: 10px; }
.form-group { display: flex; flex-direction: column; gap: 5px; flex: 1; position: relative; }
.form-group--sm { max-width: 72px; }
.form-group label { font-size: 11.5px; color: var(--color-text-muted, #666); font-weight: 500; }
.form-input, .form-select {
  padding: 8px 11px;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 7px; font-size: 13px;
  background: var(--color-surface, #fff);
  color: var(--color-text, #1a1a1a);
  outline: none; transition: border-color 0.15s; width: 100%;
}
.form-input:focus, .form-select:focus { border-color: var(--color-accent, #8B6F47); }
.btn-add-item {
  display: flex; align-items: center; gap: 7px;
  width: 100%; justify-content: center; padding: 10px;
  border: none; border-radius: 8px;
  background: var(--color-accent-light, #f5ede4);
  color: var(--color-accent, #8B6F47);
  font-size: 13.5px; font-weight: 500;
  cursor: pointer; margin-top: 12px; transition: background 0.15s;
}
.btn-add-item:hover:not(:disabled) { background: var(--color-accent, #8B6F47); color: white; }
.btn-add-item:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Invoice Preview Card ── */
.invoice-card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 14px; overflow: hidden;
}
.invoice-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 20px 24px 16px; border-bottom: 1px solid var(--color-border, #e8e8e8);
}
.invoice-title { font-size: 16px; font-weight: 600; color: var(--color-text, #1a1a1a); }
.invoice-subtitle { font-size: 12px; color: var(--color-text-muted, #888); margin-top: 2px; }
.invoice-salon { font-size: 11px; color: var(--color-text-light, #aaa); text-align: right; }
.invoice-table-wrap { padding: 0 24px; min-height: 160px; }
.invoice-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 4px 0; }
.invoice-table th {
  font-size: 10.5px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--color-text-light, #aaa);
  padding: 12px 6px 8px; border-bottom: 1px solid var(--color-border, #f0f0f0);
  text-align: left;
}
.invoice-table td {
  padding: 10px 6px; border-bottom: 1px solid var(--color-border, #f5f5f5);
  color: var(--color-text, #1a1a1a); vertical-align: middle;
}
.td-num { color: var(--color-text-muted, #888); width: 28px; }
.td-total { font-weight: 600; text-align: right; }
.item-name { font-weight: 500; }
.item-badge {
  font-size: 10px; background: var(--color-accent-light, #f5ede4);
  color: var(--color-accent, #8B6F47); padding: 1px 6px; border-radius: 4px;
}
.rate-input, .qty-input {
  width: 68px; padding: 5px 7px;
  border: 1px solid var(--color-border, #e0e0e0); border-radius: 5px;
  font-size: 12.5px; background: var(--color-surface, #fff);
  color: var(--color-text, #1a1a1a); outline: none;
}
.qty-input { width: 50px; }
.remove-btn {
  background: none; border: none; cursor: pointer;
  color: var(--color-danger, #e53e3e); opacity: 0.6;
  padding: 4px; border-radius: 4px; transition: opacity 0.15s, background 0.15s;
  display: flex; align-items: center;
}
.remove-btn:hover { opacity: 1; background: var(--color-danger-light, #fff5f5); }
.empty-invoice {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; padding: 50px 20px;
  color: var(--color-text-muted, #888); font-size: 13px; text-align: center;
}

/* ── Totals ── */
.invoice-totals {
  padding: 14px 24px; border-top: 1px solid var(--color-border, #f0f0f0);
  display: flex; flex-direction: column; gap: 10px;
}
.totals-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13.5px; color: var(--color-text, #1a1a1a);
}
.totals-row--grand {
  font-size: 16px; font-weight: 700;
  padding-top: 10px; border-top: 1px solid var(--color-border, #e8e8e8);
}
.grand-total { color: var(--color-accent, #8B6F47); font-size: 20px; }
.discount-row { gap: 12px; }
.discount-inputs { display: flex; gap: 8px; flex: 1; justify-content: flex-end; }
.discount-input {
  width: 80px; padding: 5px 8px;
  border: 1px solid var(--color-border, #e0e0e0); border-radius: 6px;
  font-size: 13px; text-align: right;
  background: var(--color-surface, #fff); color: var(--color-text, #1a1a1a); outline: none;
}
.reason-input {
  width: 160px; padding: 5px 8px;
  border: 1px solid var(--color-border, #e0e0e0); border-radius: 6px;
  font-size: 13px; background: var(--color-surface, #fff);
  color: var(--color-text, #1a1a1a); outline: none;
}

/* ── Invoice Actions ── */
.invoice-actions {
  display: flex; gap: 10px; padding: 16px 24px 20px; justify-content: flex-end;
}
.btn-cancel {
  padding: 10px 22px; border-radius: 8px;
  border: 1px solid var(--color-border, #e0e0e0);
  background: none; color: var(--color-text-muted, #666);
  font-size: 13.5px; cursor: pointer; transition: background 0.15s;
}
.btn-cancel:hover { background: var(--color-surface-2, #f5f5f5); }
.btn-create {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 24px; border-radius: 8px; border: none;
  background: var(--color-accent, #8B6F47);
  color: white; font-size: 13.5px; font-weight: 500;
  cursor: pointer; transition: opacity 0.15s;
}
.btn-create:hover:not(:disabled) { opacity: 0.88; }
.btn-create:disabled { opacity: 0.4; cursor: not-allowed; }

/* ══════════════ INVOICE MODAL ══════════════ */
.inv-backdrop {
  position: fixed; inset: 0;
  background: rgba(10,8,6,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1100; padding: 16px;
}
.inv-modal {
  background: var(--color-surface, #fff);
  border-radius: 16px;
  border: 1px solid var(--color-border, #e8e8e8);
  width: 580px; max-width: 100%;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0,0,0,0.18);
}
.inv-modal__header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 22px 24px 0;
}
.inv-modal__title { font-size: 18px; font-weight: 600; }
.inv-modal__sub { font-size: 12px; color: var(--color-text-muted, #888); margin-top: 3px; }
.inv-modal__close {
  width: 32px; height: 32px;
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 8px; background: none;
  color: var(--color-text-muted, #888);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s; flex-shrink: 0;
}
.inv-modal__close:hover { background: var(--color-surface-2, #f5f5f5); }

/* ── Printable Invoice Preview ── */
.inv-preview {
  margin: 20px 24px;
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 12px; overflow: hidden;
  background: white;
}
.inv-salon-header {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 20px 16px;
  background: linear-gradient(135deg, #faf8f5 0%, #f5ede4 100%);
  border-bottom: 1px solid #e8ddd2;
}
.inv-salon-logo {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--color-accent, #8B6F47);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 18px; flex-shrink: 0;
}
.inv-salon-name { font-size: 15px; font-weight: 700; color: #1a1a1a; }
.inv-salon-addr { font-size: 11px; color: #888; margin-top: 1px; }
.inv-meta { margin-left: auto; text-align: right; flex-shrink: 0; }
.inv-num { font-size: 12px; font-weight: 600; color: var(--color-accent, #8B6F47); }
.inv-date { font-size: 10px; color: #999; margin-top: 2px; }

.inv-customer {
  padding: 14px 20px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}
.inv-customer__label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 0.08em; }
.inv-customer__name { font-size: 14px; font-weight: 600; margin-top: 3px; }
.inv-customer__phone { font-size: 12px; color: #666; margin-top: 2px; }

.inv-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.inv-th {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em;
  color: #aaa; padding: 10px 12px 8px;
  border-bottom: 1px solid #eee; text-align: left; font-weight: 600;
}
.inv-th--right { text-align: right; }
.inv-tr:last-child .inv-td { border-bottom: none; }
.inv-td {
  padding: 10px 12px;
  border-bottom: 1px solid #f5f5f5;
  color: #1a1a1a;
}
.inv-td--muted { color: #999; }
.inv-td--name { font-weight: 500; }
.inv-td--right { text-align: right; }
.inv-td--bold { font-weight: 700; }

.inv-totals {
  padding: 14px 20px 16px;
  border-top: 2px solid #f0f0f0;
  display: flex; flex-direction: column; gap: 8px;
}
.inv-tot-row {
  display: flex; justify-content: space-between;
  font-size: 13px; color: #444;
}
.inv-tot-row--disc { color: #888; font-size: 12px; }
.inv-tot-row--grand {
  font-size: 16px; font-weight: 700;
  color: var(--color-accent, #8B6F47);
  padding-top: 10px;
  border-top: 1px solid #eee;
  margin-top: 4px;
}

.inv-footer {
  text-align: center; padding: 12px;
  border-top: 1px dashed #eee;
  font-size: 12px; color: #aaa;
  background: #fafafa;
}

/* ── Invoice Modal Actions ── */
.inv-actions {
  display: flex; gap: 8px; flex-wrap: wrap;
  padding: 16px 24px 22px;
  border-top: 1px solid var(--color-border, #f0f0f0);
}
.inv-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 18px; border-radius: 9px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  border: 1px solid transparent; transition: opacity 0.15s, transform 0.1s;
  flex: 1; justify-content: center; min-width: 120px;
}
.inv-btn:hover { opacity: 0.88; transform: translateY(-1px); }
.inv-btn--print {
  background: #f5f5f5; color: #444;
  border-color: #e0e0e0;
}
.inv-btn--wa {
  background: #25D366; color: white; border-color: #25D366;
}
.inv-btn--email {
  background: #4285f4; color: white; border-color: #4285f4;
}
.inv-btn--done {
  background: var(--color-accent, #8B6F47); color: white;
  border-color: var(--color-accent, #8B6F47);
}

/* ── Price-check warning ── */
.price-warn-banner {
  display: flex; align-items: center; gap: 8px;
  background: #fffbeb; border: 1px solid #f59e0b;
  border-radius: 8px; padding: 10px 14px;
  margin: 12px 24px 0;
  font-size: 12.5px; color: #92400e;
}
.row--warn td {
  background: #fffbeb !important;
}
.row--warn .rate-input {
  border-color: #f59e0b;
  background: #fffdf0;
}

/* ── Toast ── */
.toast {
  position: fixed; bottom: 28px; right: 28px;
  padding: 12px 22px; border-radius: 10px;
  font-size: 13.5px; font-weight: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,0.14);
  z-index: 9999;
}
.toast--success { background: #1a7a4a; color: white; }
.toast--error   { background: #c0392b; color: white; }
.toast-enter-active, .toast-leave-active { transition: all 0.25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

/* ── Product dropdown ── */
.card__title { display: flex; align-items: center; gap: 7px; }
.refresh-btn {
  margin-left: auto; background: none; border: none; cursor: pointer;
  color: var(--color-text-muted, #888); display: flex; align-items: center;
  padding: 2px; border-radius: 4px; transition: color 0.15s;
}
.refresh-btn:hover:not(:disabled) { color: var(--color-accent, #8B6F47); }
.refresh-btn:disabled { opacity: 0.4; cursor: not-allowed; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin-icon { animation: spin 0.8s linear infinite; }

.product-select {
  position: relative;
  display: flex; align-items: center;
  min-height: 38px; padding: 8px 34px 8px 12px;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 8px; cursor: pointer;
  background: var(--color-surface, #fff);
  font-size: 14px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.product-select:hover { border-color: var(--color-accent, #8B6F47); }
.product-select--open { border-color: var(--color-accent, #8B6F47); box-shadow: 0 0 0 3px rgba(139,111,71,0.1); }
.product-select__value { color: var(--color-text, #1a1a1a); }
.product-select__placeholder { color: var(--color-text-muted, #aaa); font-size: 13px; }
.product-select__error { color: #c0392b; }
.product-select__chevron {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  color: var(--color-text-muted, #aaa); transition: transform 0.18s; pointer-events: none;
}
.product-select__chevron.rotated { transform: translateY(-50%) rotate(180deg); }

.product-dropdown {
  position: absolute; z-index: 200;
  left: 0; right: 0; top: calc(100% + 4px);
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  overflow: hidden;
}
.product-dropdown__search-wrap {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-bottom: 1px solid var(--color-border, #f0f0f0);
  background: var(--color-surface-2, #fafafa); color: var(--color-text-muted, #aaa);
}
.product-dropdown__search {
  flex: 1; border: none; background: none; outline: none;
  font-size: 13px; color: var(--color-text, #1a1a1a);
}
.product-dropdown__search::placeholder { color: var(--color-text-muted, #aaa); }
.product-dropdown__clear-btn {
  background: none; border: none; cursor: pointer;
  font-size: 16px; color: var(--color-text-muted, #aaa); line-height: 1; padding: 0;
}
.product-dropdown__clear-btn:hover { color: var(--color-text, #1a1a1a); }
.product-dropdown__list { max-height: 200px; overflow-y: auto; }
.product-dropdown__empty {
  padding: 16px 14px; font-size: 13px;
  color: var(--color-text-muted, #aaa); text-align: center;
}
.product-dropdown__item {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 9px 14px; background: none; border: none; cursor: pointer;
  font-size: 13px; color: var(--color-text, #1a1a1a);
  transition: background 0.12s;
}
.product-dropdown__item:hover { background: var(--color-surface-2, #f7f7f7); }
.product-dropdown__item--selected { background: var(--color-accent-light, #f5ede4); color: var(--color-accent, #8B6F47); font-weight: 500; }
.product-dropdown__item-name { flex: 1; text-align: left; }
.product-dropdown__item-price { font-weight: 600; color: var(--color-accent, #8B6F47); margin-left: 12px; flex-shrink: 0; }

.btn-add-item--product {
  background: var(--color-surface-2, #f7f7f7);
  border-color: var(--color-border, #e0e0e0);
  color: var(--color-text, #333);
}
.btn-add-item--product:hover:not(:disabled) { background: #eee; }

/* Product row & badge in invoice table */
.row--product td { background: #f0faf4 !important; }
.item-badge--product { background: #d1fae5; color: #065f46; border-color: #a7f3d0; }
.inv-badge--product {
  display: inline-block; margin-left: 6px;
  padding: 1px 6px; border-radius: 4px;
  font-size: 10px; font-weight: 600;
  background: #d1fae5; color: #065f46;
  vertical-align: middle;
}

/* ══════════════ PRODUCTS TAB ══════════════ */
/* ══════════════ PRODUCTS TAB ══════════════ */
.ptab { display: flex; flex-direction: column; gap: 20px; }

/* Top bar */
.ptab__topbar {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px;
}
.ptab__title {
  font-size: 18px; font-weight: 600;
  color: var(--color-text, #1a1a1a);
  font-family: var(--font-display, serif);
}
.ptab__subtitle { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.ptab__count {
  font-size: 12px; color: var(--color-text-muted, #999);
  background: var(--color-surface-2, #f5f5f5);
  padding: 2px 10px; border-radius: 99px;
}
.ptab__err-badge { font-size: 12px; color: #c0392b; }
.ptab__topbar-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* Search inside topbar */
.ptab__search-box {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 12px;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 8px;
  background: var(--color-surface, #fff);
  min-width: 200px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.ptab__search-box:focus-within {
  border-color: var(--color-accent, #8B6F47);
  box-shadow: 0 0 0 3px rgba(139,111,71,0.10);
}
.ptab__search-input {
  border: none; outline: none; background: none;
  font-size: 13.5px; color: var(--color-text, #1a1a1a); flex: 1; min-width: 0;
}
.ptab__search-input::placeholder { color: var(--color-text-light, #c0b8ae); }
.ptab__search-clear {
  background: none; border: none; cursor: pointer; padding: 0;
  color: var(--color-text-muted, #aaa); display: flex; align-items: center;
  transition: color 0.15s;
}
.ptab__search-clear:hover { color: var(--color-text, #1a1a1a); }

/* Buttons */
.ptab__btn-refresh {
  width: 36px; height: 36px; border-radius: 8px;
  border: 1px solid var(--color-border, #e0e0e0);
  background: var(--color-surface, #fff);
  color: var(--color-text-muted, #888);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s, border-color 0.15s;
  flex-shrink: 0;
}
.ptab__btn-refresh:hover:not(:disabled) {
  border-color: var(--color-accent, #8B6F47);
  color: var(--color-accent, #8B6F47);
}
.ptab__btn-refresh:disabled { opacity: 0.45; cursor: not-allowed; }

.ptab__btn-add {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 0 18px; height: 36px; border-radius: 8px; border: none;
  background: var(--color-accent, #8B6F47); color: white;
  font-size: 13.5px; font-weight: 500; cursor: pointer;
  transition: opacity 0.15s; white-space: nowrap;
}
.ptab__btn-add:hover { opacity: 0.88; }

/* Loading */
.ptab__loading {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 60px 20px;
  font-size: 14px; color: var(--color-text-muted, #888);
}

/* Empty */
.ptab__empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; padding: 60px 20px;
  font-size: 14px; color: var(--color-text-muted, #888); text-align: center;
}

/* ── Add/Edit Form Card ── */
.pf-card {
  background: var(--color-surface, #fff);
  border: 1.5px solid var(--color-accent, #8B6F47);
  border-radius: 14px; overflow: hidden;
  box-shadow: 0 4px 24px rgba(139,111,71,0.10);
}
.pf-card__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #faf8f5 0%, #f5ede4 100%);
  border-bottom: 1px solid #e8ddd2;
}
.pf-card__label {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 600;
  color: var(--color-accent, #8B6F47);
}
.pf-card__close {
  width: 28px; height: 28px; border-radius: 6px;
  border: 1px solid rgba(139,111,71,0.25);
  background: rgba(255,255,255,0.6); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-accent, #8B6F47); transition: background 0.15s;
}
.pf-card__close:hover { background: rgba(255,255,255,0.9); }

.pf-card__body {
  padding: 18px 20px; display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start;
}
.pf-field { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 130px; }
.pf-field--wide { flex: 2.5; min-width: 220px; }
.pf-label { font-size: 11.5px; font-weight: 600; color: var(--color-text-muted, #777); text-transform: uppercase; letter-spacing: 0.04em; }
.pf-req { color: var(--color-danger, #e53e3e); }
.pf-input {
  padding: 9px 12px;
  border: 1.5px solid var(--color-border, #e0e0e0);
  border-radius: 8px; font-size: 13.5px;
  background: var(--color-surface, #fff);
  color: var(--color-text, #1a1a1a); outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.pf-input:focus { border-color: var(--color-accent, #8B6F47); box-shadow: 0 0 0 3px rgba(139,111,71,0.10); }
.pf-input--err { border-color: var(--color-danger, #e53e3e) !important; }
.pf-err-msg { font-size: 11px; color: var(--color-danger, #e53e3e); }

.pf-card__foot {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(--color-border, #f0f0f0);
  background: var(--color-surface-2, #fafafa);
}
.pf-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 20px; border-radius: 8px; font-size: 13px;
  cursor: pointer; border: 1px solid var(--color-border, #e0e0e0);
  background: none; color: var(--color-text-muted, #666);
  transition: background 0.15s; white-space: nowrap;
}
.pf-btn:hover:not(:disabled) { background: var(--color-surface-2, #f5f5f5); }
.pf-btn--ghost { color: var(--color-text-muted, #666); }
.pf-btn--save {
  background: var(--color-accent, #8B6F47); color: white;
  border-color: var(--color-accent, #8B6F47); font-weight: 500;
}
.pf-btn--save:hover:not(:disabled) { opacity: 0.88; }
.pf-btn--del {
  background: #e53e3e; color: white; border-color: #e53e3e; font-weight: 500;
}
.pf-btn--del:hover:not(:disabled) { opacity: 0.88; }
.pf-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Category groups ── */
.ptab__group { margin-bottom: 8px; }
.ptab__group-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 10px; padding-bottom: 6px;
  border-bottom: 1.5px solid var(--color-border, #ece8e2);
}
.ptab__group-name {
  font-size: 13px; font-weight: 600;
  color: var(--color-accent, #8B6F47);
  text-transform: uppercase; letter-spacing: 0.05em;
}
.ptab__group-count {
  font-size: 11px; background: var(--color-accent-light, #f5ede4);
  color: var(--color-accent, #8B6F47);
  padding: 1px 8px; border-radius: 99px;
}

/* ── Product cards grid ── */
.ptab__cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 10px;
}
.ptab__cards--flat { margin-top: 4px; }

.pcard {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 10px; padding: 14px;
  display: flex; flex-direction: column; gap: 8px;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.12s;
}
.pcard:hover {
  border-color: var(--color-accent, #8B6F47);
  box-shadow: 0 2px 14px rgba(139,111,71,0.09);
  transform: translateY(-1px);
}
.pcard__name {
  font-size: 13px; font-weight: 500;
  color: var(--color-text, #1a1a1a); line-height: 1.4;
  flex: 1;
}
.pcard__cat {
  font-size: 11px; color: var(--color-text-muted, #999);
}
.pcard__bottom {
  display: flex; align-items: center; justify-content: space-between; gap: 6px;
}
.pcard__price {
  font-size: 15px; font-weight: 700;
  color: var(--color-accent, #8B6F47);
}
.pcard__actions { display: flex; gap: 4px; }
.pcard__btn {
  width: 26px; height: 26px; border-radius: 6px;
  border: 1px solid var(--color-border, #e8e8e8);
  background: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.pcard__btn--edit { color: var(--color-accent, #8B6F47); }
.pcard__btn--edit:hover { background: var(--color-accent-light, #f5ede4); border-color: var(--color-accent, #8B6F47); }
.pcard__btn--del { color: var(--color-danger, #e53e3e); }
.pcard__btn--del:hover { background: #fff5f5; border-color: var(--color-danger, #e53e3e); }

/* ── Delete confirm dialog ── */
.del-overlay {
  position: fixed; inset: 0; background: rgba(10,8,6,0.48);
  display: flex; align-items: center; justify-content: center;
  z-index: 1200; padding: 16px;
}
.del-dialog {
  background: var(--color-surface, #fff);
  border-radius: 16px; border: 1px solid var(--color-border, #e0e0e0);
  width: 340px; max-width: 100%; padding: 28px 24px 24px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
}
.del-dialog__icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: #fff5f5; border: 1.5px solid #fecaca;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 14px; color: var(--color-danger, #e53e3e);
}
.del-dialog__title { font-size: 17px; font-weight: 600; margin-bottom: 8px; }
.del-dialog__msg { font-size: 13px; color: var(--color-text-muted, #666); margin-bottom: 22px; line-height: 1.5; }
.del-dialog__actions { display: flex; gap: 8px; justify-content: center; }

/* Form slide animation */
.pf-slide-enter-active, .pf-slide-leave-active { transition: opacity 0.18s, transform 0.18s; }
.pf-slide-enter-from, .pf-slide-leave-to { opacity: 0; transform: translateY(-10px); }

/* Spinner */
.ptab-spin { animation: ptab-spin-kf 0.8s linear infinite; display: inline-block; flex-shrink: 0; }
@keyframes ptab-spin-kf { to { transform: rotate(360deg); } }

</style>