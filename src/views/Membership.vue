<template>
  <div class="membership-page">

    <!-- Tabs -->
    <div class="mem-tabs">
      <button class="mem-tab" :class="{ 'mem-tab--active': activeTab === 'new' }" @click="switchTab('new')">New Membership</button>
      <button class="mem-tab" :class="{ 'mem-tab--active': activeTab === 'usage' }" @click="switchTab('usage')">Service Usage</button>
      <button class="mem-tab" :class="{ 'mem-tab--active': activeTab === 'list' }" @click="switchTab('list')">All Memberships</button>
      <button class="mem-tab" :class="{ 'mem-tab--active': activeTab === 'plans' }" @click="switchTab('plans')">Plans</button>
    </div>

    <!-- Loading overlay: shown while switching to a tab that preloads data -->
    <div v-if="tabLoading" class="mem-loading">
      <div class="mem-spinner"></div>
      <span>Loading…</span>
    </div>

    <!-- ══════════════ TAB: NEW MEMBERSHIP ══════════════ -->
    <div v-if="!tabLoading && activeTab === 'new'" class="mem-panel">
      <h3 class="mem-panel__title">Choose a Plan</h3>
      <div v-if="plans.length === 0" class="mem-empty">No active plans yet. Add one in the Plans tab.</div>
      <div class="plan-grid">
        <div
          v-for="p in plans" :key="p.id"
          class="plan-card"
          :class="{ 'plan-card--selected': form.planId === p.id }"
          @click="form.planId = p.id"
        >
          <div class="plan-card__name">{{ p.name }}</div>
          <div class="plan-card__paid">₹{{ p.paidAmount.toLocaleString('en-IN') }}</div>
          <div class="plan-card__benefit">₹{{ p.benefitAmount.toLocaleString('en-IN') }} benefit</div>
          <div class="plan-card__validity">{{ p.validityMonths }} months validity</div>
        </div>
      </div>

      <h3 class="mem-panel__title" style="margin-top:24px">Customer Details</h3>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Customer name *</label>
          <input class="form-input" v-model="form.customerName" placeholder="e.g. Priya Sharma" />
          <span v-if="formErrors.customerName" class="form-error">{{ formErrors.customerName }}</span>
        </div>
        <div class="form-group">
          <label class="form-label">Mobile number *</label>
          <input class="form-input" v-model="form.customerPhone" placeholder="10-digit number" inputmode="numeric" maxlength="15" />
          <span v-if="formErrors.customerPhone" class="form-error">{{ formErrors.customerPhone }}</span>
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Start date</label>
          <input class="form-input" type="date" v-model="form.startDate" />
        </div>
        <div class="form-group">
          <label class="form-label">Expiry date (auto)</label>
          <input class="form-input" :value="previewExpiry" disabled />
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Staff *</label>
          <select class="form-input" v-model="form.staffName">
            <option value="">{{ staffNames.length ? 'Select staff' : 'Loading staff…' }}</option>
            <option v-for="s in staffNames" :key="s" :value="s">{{ s }}</option>
          </select>
          <span v-if="formErrors.staffName" class="form-error">{{ formErrors.staffName }}</span>
        </div>
      </div>

      <div class="inv-payment-row" style="padding:0; margin: 10px 0 18px;">
        <span class="inv-payment-label">Payment via</span>
        <div class="inv-payment-toggle">
          <button class="inv-pay-opt" :class="{ 'inv-pay-opt--active inv-pay-opt--cash': form.paymentMethod === 'Cash' }" @click="form.paymentMethod = 'Cash'">Cash</button>
          <button class="inv-pay-opt" :class="{ 'inv-pay-opt--active inv-pay-opt--upi': form.paymentMethod === 'UPI' }" @click="form.paymentMethod = 'UPI'">UPI</button>
        </div>
      </div>

      <span v-if="formErrors.planId" class="form-error" style="display:block; margin-bottom:10px;">{{ formErrors.planId }}</span>

      <button class="btn-save" @click="submitMembership" :disabled="isSaving">
        {{ isSaving ? 'Saving…' : 'Confirm & Generate Invoice' }}
      </button>
    </div>

    <!-- ══════════════ TAB: SERVICE USAGE ══════════════ -->
    <div v-if="!tabLoading && activeTab === 'usage'" class="mem-panel">
      <h3 class="mem-panel__title">Find Membership</h3>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Search by phone</label>
          <div class="search-row">
            <input class="form-input" v-model="searchPhone" placeholder="10-digit number" @keyup.enter="searchByPhone" />
            <button class="btn-cancel" @click="searchByPhone">Search</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Search by membership no.</label>
          <div class="search-row">
            <input class="form-input" v-model="searchNo" placeholder="MEM-20260101-123" @keyup.enter="searchByNo" />
            <button class="btn-cancel" @click="searchByNo">Search</button>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="mem-inline-loading">
        <div class="mem-spinner mem-spinner--sm"></div>
        <span>Loading…</span>
      </div>

      <template v-else>
        <div v-if="searchResults.length > 1" class="mem-empty" style="text-align:left">
          <div style="margin-bottom:8px; font-weight:500;">Multiple memberships found — select one:</div>
          <div v-for="m in searchResults" :key="m.id" class="pick-row" @click="selectMembership(m)">
            {{ m.membershipNo }} — {{ m.customerName }} ({{ m.planName }})
          </div>
        </div>
        <div v-else-if="searchResults.length === 0 && searched" class="mem-empty">No membership found.</div>
      </template>

      <div v-if="selected" class="mem-detail">
        <div class="mem-detail__row">
          <div class="mem-detail__label">Membership No</div>
          <div class="mem-detail__value">{{ selected.membershipNo }}</div>
        </div>
        <div class="mem-detail__row">
          <div class="mem-detail__label">Customer</div>
          <div class="mem-detail__value">{{ selected.customerName }} · {{ selected.customerPhone }}</div>
        </div>
        <div class="mem-detail__row">
          <div class="mem-detail__label">Plan</div>
          <div class="mem-detail__value">{{ selected.planName }}</div>
        </div>
        <div v-if="selected.staffName" class="mem-detail__row">
          <div class="mem-detail__label">Staff</div>
          <div class="mem-detail__value">{{ selected.staffName }}</div>
        </div>
        <div class="mem-detail__row">
          <div class="mem-detail__label">Status</div>
          <div class="mem-detail__value"><span class="status-badge" :class="statusClass(selected.status)">{{ selected.status }}</span></div>
        </div>
        <div class="mem-stats">
          <div class="mem-stat"><div class="mem-stat__num">₹{{ selected.benefitAmount.toLocaleString('en-IN') }}</div><div class="mem-stat__label">Total Benefit</div></div>
          <div class="mem-stat"><div class="mem-stat__num">₹{{ selected.totalUsed.toLocaleString('en-IN') }}</div><div class="mem-stat__label">Used</div></div>
          <div class="mem-stat"><div class="mem-stat__num">₹{{ selected.remainingBalance.toLocaleString('en-IN') }}</div><div class="mem-stat__label">Remaining</div></div>
          <div class="mem-stat"><div class="mem-stat__num">{{ formatDisplayDate(selected.expiryDate) }}</div><div class="mem-stat__label">Expires</div></div>
        </div>

        <div v-if="selected.status !== 'Active'" class="usage-blocked">
          This membership is {{ selected.status.toLowerCase() }} — no further services can be deducted.
        </div>
        <div v-else class="usage-form">
          <h4 class="mem-panel__title" style="margin-top:20px">Record Service Usage</h4>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Service description *</label>
              <input class="form-input" v-model="usageForm.serviceDescription" placeholder="e.g. Hair Spa" />
              <span v-if="usageErrors.serviceDescription" class="form-error">{{ usageErrors.serviceDescription }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Amount (₹) *</label>
              <input class="form-input" type="number" v-model.number="usageForm.amount" min="0" placeholder="e.g. 3000" />
              <span v-if="usageErrors.amount" class="form-error">{{ usageErrors.amount }}</span>
            </div>
          </div>
          <button class="btn-save" @click="submitUsage" :disabled="isSaving">
            {{ isSaving ? 'Saving…' : 'Deduct & Record' }}
          </button>
        </div>

        <h4 class="mem-panel__title" style="margin-top:26px">Service History</h4>
        <table v-if="usageHistory.length" class="mem-table">
          <thead><tr><th>Date</th><th>Service</th><th class="right">Amount</th><th class="right">Remaining</th></tr></thead>
          <tbody>
            <tr v-for="u in usageHistory" :key="u.id">
              <td>{{ formatDisplayDate(u.date) }}</td>
              <td>{{ u.serviceDescription }}</td>
              <td class="right">₹{{ u.amount.toLocaleString('en-IN') }}</td>
              <td class="right">₹{{ u.remainingBalanceAfter.toLocaleString('en-IN') }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="mem-empty">No services recorded yet.</div>
      </div>
    </div>

    <!-- ══════════════ TAB: ALL MEMBERSHIPS ══════════════ -->
    <div v-if="!tabLoading && activeTab === 'list'" class="mem-panel">
      <div class="search-row" style="margin-bottom:16px; max-width:340px;">
        <input class="form-input" v-model="listSearch" placeholder="Search name, phone, or membership no." @keyup.enter="loadList" />
        <button class="btn-cancel" @click="loadList">Search</button>
      </div>
      <div v-if="isLoading" class="mem-inline-loading">
        <div class="mem-spinner mem-spinner--sm"></div>
        <span>Loading…</span>
      </div>
      <table v-else-if="memberships.length" class="mem-table">
        <thead>
          <tr>
            <th>Membership No</th><th>Customer</th><th>Phone</th><th>Plan</th><th>Staff</th>
            <th class="right">Benefit</th><th class="right">Used</th><th class="right">Remaining</th>
            <th>Expiry</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in memberships" :key="m.id">
            <td>{{ m.membershipNo }}</td>
            <td>{{ m.customerName }}</td>
            <td>{{ m.customerPhone }}</td>
            <td>{{ m.planName }}</td>
            <td>{{ m.staffName || '—' }}</td>
            <td class="right">₹{{ m.benefitAmount.toLocaleString('en-IN') }}</td>
            <td class="right">₹{{ m.totalUsed.toLocaleString('en-IN') }}</td>
            <td class="right">₹{{ m.remainingBalance.toLocaleString('en-IN') }}</td>
            <td>{{ formatDisplayDate(m.expiryDate) }}</td>
            <td><span class="status-badge" :class="statusClass(m.status)">{{ m.status }}</span></td>
          </tr>
        </tbody>
      </table>
      <div v-else class="mem-empty">No memberships found.</div>
    </div>

    <!-- ══════════════ TAB: PLANS (admin) ══════════════ -->
    <div v-if="!tabLoading && activeTab === 'plans'" class="mem-panel">
      <div class="plans-header">
        <h3 class="mem-panel__title" style="margin:0">Membership Plans</h3>
        <button class="btn-save" style="width:auto; padding: 8px 16px;" @click="openPlanModal()">+ Add Plan</button>
      </div>
      <div class="plan-grid">
        <div v-for="p in allPlans" :key="p.id" class="plan-card plan-card--admin" :class="{ 'plan-card--inactive': !p.active }">
          <div class="plan-card__name">{{ p.name }} <span v-if="!p.active" class="inactive-tag">Inactive</span></div>
          <div class="plan-card__paid">₹{{ p.paidAmount.toLocaleString('en-IN') }} → ₹{{ p.benefitAmount.toLocaleString('en-IN') }}</div>
          <div class="plan-card__validity">{{ p.validityMonths }} months</div>
          <div class="plan-card__actions">
            <button class="link-btn" @click="openPlanModal(p)">Edit</button>
            <button class="link-btn link-btn--danger" @click="removePlan(p)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════ INVOICE MODAL ══════════════ -->
    <transition name="modal">
      <div v-if="invoiceModal.show" class="inv-backdrop" @click.self="invoiceModal.show = false">
        <div class="inv-modal">
          <div class="inv-modal__header">
            <div>
              <h2 class="inv-modal__title">Membership Invoice</h2>
              <p class="inv-modal__sub">Send to customer or print</p>
            </div>
            <button class="inv-modal__close" @click="invoiceModal.show = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="inv-preview" id="membership-invoice-print-area">
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

            <div class="inv-customer">
              <div class="inv-customer__label">Bill To</div>
              <div class="inv-customer__name">{{ invoiceModal.customerName }}</div>
              <div class="inv-customer__phone">📞 {{ invoiceModal.customerPhone }}</div>
            </div>

            <div class="mem-invoice-plan">
              <div class="mem-invoice-plan__name">{{ invoiceModal.planName }}</div>
              <div class="mem-invoice-plan__grid">
                <div><span>Membership No</span><strong>{{ invoiceModal.membershipNo }}</strong></div>
                <div><span>Amount Paid</span><strong>₹{{ invoiceModal.paidAmount.toLocaleString('en-IN') }}</strong></div>
                <div><span>Total Benefit</span><strong>₹{{ invoiceModal.benefitAmount.toLocaleString('en-IN') }}</strong></div>
                <div><span>Start Date</span><strong>{{ formatDisplayDate(invoiceModal.startDate) }}</strong></div>
                <div><span>Expiry Date</span><strong>{{ formatDisplayDate(invoiceModal.expiryDate) }}</strong></div>
                <div><span>Payment Method</span><strong>{{ invoiceModal.paymentMethod }}</strong></div>
              </div>
            </div>

            <div class="inv-totals">
              <div class="inv-tot-row inv-tot-row--grand">
                <span>Amount Paid</span>
                <span>₹{{ invoiceModal.paidAmount.toLocaleString('en-IN') }}</span>
              </div>
            </div>

            <div class="inv-footer">
              Thank you for choosing Scintillate Membership! 💫 See you again soon.
            </div>
          </div>

          <div class="inv-actions">
            <button class="inv-btn inv-btn--print" @click="printMembershipInvoice">
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
            <button class="inv-btn inv-btn--done" @click="invoiceModal.show = false">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Done
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══════════════ ADD/EDIT PLAN MODAL ══════════════ -->
    <transition name="modal">
      <div v-if="planModal.show" class="modal-backdrop" @click.self="planModal.show = false">
        <div class="modal-box">
          <div class="modal-header">
            <div class="modal-title">{{ planModal.editing ? 'Edit Plan' : 'Add Plan' }}</div>
            <button class="modal-close" @click="planModal.show = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Plan name *</label>
              <input class="form-input" v-model="planModal.form.name" placeholder="e.g. Silver Plan" />
              <span v-if="planModal.errors.name" class="form-error">{{ planModal.errors.name }}</span>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Paid amount (₹) *</label>
                <input class="form-input" type="number" v-model.number="planModal.form.paidAmount" min="0" />
                <span v-if="planModal.errors.paidAmount" class="form-error">{{ planModal.errors.paidAmount }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Benefit amount (₹) *</label>
                <input class="form-input" type="number" v-model.number="planModal.form.benefitAmount" min="0" />
                <span v-if="planModal.errors.benefitAmount" class="form-error">{{ planModal.errors.benefitAmount }}</span>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Validity (months) *</label>
                <input class="form-input" type="number" v-model.number="planModal.form.validityMonths" min="1" />
                <span v-if="planModal.errors.validityMonths" class="form-error">{{ planModal.errors.validityMonths }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Active</label>
                <select class="form-input" v-model="planModal.form.active">
                  <option :value="true">Active</option>
                  <option :value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="planModal.show = false">Cancel</button>
            <button class="btn-save" @click="savePlanForm" :disabled="isSaving">
              {{ isSaving ? 'Saving…' : (planModal.editing ? 'Save changes' : 'Add plan') }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast-fade">
      <div v-if="toast.show" class="toast" :class="`toast--${toast.type}`">{{ toast.message }}</div>
    </transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useMembership, API_URL } from '@/composables/useMembership'
import { useWhatsApp } from '@/composables/useWhatsApp'

const {
  plans, memberships, usageHistory,
  isLoading, isSaving,
  fetchPlans, savePlan, deletePlan,
  saveMembership, fetchMembershipById, fetchMembershipsByPhone,
  fetchMembershipList, fetchUsageHistory, recordUsage
} = useMembership()

const { openWhatsApp } = useWhatsApp()

const activeTab = ref('new')
const allPlans = ref([])

// Separate from the composable's shared `isLoading` (which also covers in-panel
// searches like the usage-tab lookup) so switching tabs doesn't blank out a
// panel the user is actively typing into elsewhere.
const tabLoading = ref(false)

// ── Tab switching: reload whatever data that tab needs, full-panel loading shown via tabLoading ──
async function switchTab(tab) {
  activeTab.value = tab
  tabLoading.value = true
  try {
    if (tab === 'new') await loadPlans()
    else if (tab === 'list') await loadList()
    else if (tab === 'plans') await loadPlans()
    // 'usage' tab has no data to preload — it loads on search
  } finally {
    tabLoading.value = false
  }
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

// ── Date helpers ──
function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function isoToDDMMYYYY(iso) {
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}
function formatDisplayDate(ddmmyyyy) {
  if (!ddmmyyyy) return '—'
  const [dd, mm, yyyy] = ddmmyyyy.split('-')
  return `${dd} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(mm)-1]} ${yyyy}`
}

// ── Status badge ──
function statusClass(status) {
  return {
    'status-badge--active': status === 'Active',
    'status-badge--expired': status === 'Expired',
    'status-badge--used': status === 'Fully Utilized'
  }
}

// ══════════════ NEW MEMBERSHIP ══════════════
const form = reactive({
  planId: '', customerName: '', customerPhone: '', staffName: '',
  startDate: todayISO(), paymentMethod: 'Cash'
})
const formErrors = reactive({})

// Staff names for the "Staff" dropdown (same source as Walk-in Billing)
const staffNames = ref([])
async function loadStaffNames() {
  try {
    const res  = await fetch(`${API_URL}?action=staffGet`)
    const data = await res.json()
    staffNames.value = (data.staff || []).map(s => s.name).filter(Boolean)
  } catch (err) {
    console.error('loadStaffNames error:', err)
  }
}

const selectedPlanPreview = computed(() => plans.value.find(p => p.id === form.planId) || null)
const previewExpiry = computed(() => {
  if (!selectedPlanPreview.value || !form.startDate) return '—'
  const d = new Date(form.startDate)
  d.setMonth(d.getMonth() + Number(selectedPlanPreview.value.validityMonths))
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
})

function validateMembershipForm() {
  const errs = {}
  if (!form.customerName.trim()) errs.customerName = 'Name is required'
  if (!form.customerPhone.trim()) errs.customerPhone = 'Phone is required'
  if (!form.staffName) errs.staffName = 'Please select staff'
  if (!form.planId) errs.planId = 'Please select a plan'
  Object.keys(formErrors).forEach(k => delete formErrors[k])
  Object.assign(formErrors, errs)
  return Object.keys(errs).length === 0
}

function generateInvoiceNo() {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `SCN-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${Math.floor(Math.random() * 900 + 100)}`
}

const invoiceModal = reactive({
  show: false, invoiceNo: '', dateStr: '',
  customerName: '', customerPhone: '',
  planName: '', membershipNo: '', paidAmount: 0, benefitAmount: 0,
  startDate: '', expiryDate: '', paymentMethod: 'Cash'
})

async function submitMembership() {
  if (!validateMembershipForm()) return
  const plan = selectedPlanPreview.value
  const invoiceNo = generateInvoiceNo()

  const res = await saveMembership({
    customerName: form.customerName.trim(),
    customerPhone: form.customerPhone.trim(),
    planId: form.planId,
    staffName: form.staffName,
    paidAmount: String(plan.paidAmount),
    startDate: isoToDDMMYYYY(form.startDate),
    paymentMethod: form.paymentMethod,
    invoiceNo
  })

  if (!res.success) {
    showToast(res.error || 'Failed to save membership', 'error')
    return
  }

  // Append to report sheet so existing revenue totals include this sale
  try {
    const params = new URLSearchParams({
      action: 'reportSave',
      date: isoToDDMMYYYY(form.startDate),
      invoiceNo,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      items: `Membership: ${plan.name}`,
      staffList: form.staffName,
      subtotal: String(plan.paidAmount),
      discount: '0',
      discountReason: '',
      grandTotal: String(plan.paidAmount),
      paymentMethod: form.paymentMethod
    })
    await fetch(`${API_URL}?${params}`)
  } catch (err) {
    console.error('reportSave for membership failed:', err)
  }

  const now = new Date()
  invoiceModal.invoiceNo = invoiceNo
  invoiceModal.dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  invoiceModal.customerName = form.customerName.trim()
  invoiceModal.customerPhone = form.customerPhone.trim()
  invoiceModal.planName = plan.name
  invoiceModal.membershipNo = res.membershipNo
  invoiceModal.paidAmount = plan.paidAmount
  invoiceModal.benefitAmount = res.benefitAmount
  invoiceModal.startDate = isoToDDMMYYYY(form.startDate)
  invoiceModal.expiryDate = res.expiryDate
  invoiceModal.paymentMethod = form.paymentMethod
  invoiceModal.show = true

  showToast('Membership saved! ✓', 'success')
  form.planId = ''
  form.customerName = ''
  form.customerPhone = ''
  form.staffName = ''
  form.startDate = todayISO()
  form.paymentMethod = 'Cash'
}

function sendInvoiceWhatsApp() {
  const m = invoiceModal
  const msg = `*MEMBERSHIP INVOICE — Scintillate Unisex Salon*\n` +
    `Invoice No: *${m.invoiceNo}*\nMembership No: *${m.membershipNo}*\nDate: ${m.dateStr}\n` +
    `${'─'.repeat(32)}\n` +
    `Customer: *${m.customerName}*\nPhone: ${m.customerPhone}\n` +
    `${'─'.repeat(32)}\n` +
    `Plan: *${m.planName}*\n` +
    `Amount Paid: ₹${m.paidAmount.toLocaleString('en-IN')}\n` +
    `Total Benefit: ₹${m.benefitAmount.toLocaleString('en-IN')}\n` +
    `Start: ${formatDisplayDate(m.startDate)}\nExpiry: ${formatDisplayDate(m.expiryDate)}\n` +
    `${'─'.repeat(32)}\n` +
    `Thank you for choosing Scintillate Membership! ✨`
  openWhatsApp(m.customerPhone, msg)
}

function printMembershipInvoice() {
  const area = document.getElementById('membership-invoice-print-area')
  if (!area) return
  const win = window.open('', '_blank', 'width=600,height=700')
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${invoiceModal.invoiceNo}</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a}
    .wrap{max-width:520px;margin:0 auto;padding:32px 24px}@media print{body{-webkit-print-color-adjust:exact}}</style>
    </head><body><div class="wrap">${area.innerHTML}</div></body></html>`)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 500)
}

// ══════════════ SERVICE USAGE ══════════════
const searchPhone = ref('')
const searchNo = ref('')
const searchResults = ref([])
const searched = ref(false)
const selected = ref(null)

async function searchByPhone() {
  if (!searchPhone.value.trim()) return
  searched.value = true
  selected.value = null
  const res = await fetchMembershipsByPhone(searchPhone.value.trim())
  searchResults.value = res.memberships || []
  if (searchResults.value.length === 1) selectMembership(searchResults.value[0])
}

async function searchByNo() {
  if (!searchNo.value.trim()) return
  searched.value = true
  selected.value = null
  const res = await fetchMembershipList(searchNo.value.trim())
  searchResults.value = res.memberships || []
  if (searchResults.value.length === 1) selectMembership(searchResults.value[0])
}

async function selectMembership(m) {
  selected.value = m
  searchResults.value = []
  await fetchUsageHistory(m.id)
}

const usageForm = reactive({ serviceDescription: '', amount: null })
const usageErrors = reactive({})

function validateUsageForm() {
  const errs = {}
  if (!usageForm.serviceDescription.trim()) errs.serviceDescription = 'Description is required'
  if (!usageForm.amount || usageForm.amount <= 0) errs.amount = 'Enter a valid amount'
  Object.keys(usageErrors).forEach(k => delete usageErrors[k])
  Object.assign(usageErrors, errs)
  return Object.keys(errs).length === 0
}

async function submitUsage() {
  if (!validateUsageForm() || !selected.value) return

  const res = await recordUsage({
    membershipId: selected.value.id,
    amount: String(usageForm.amount),
    serviceDescription: usageForm.serviceDescription.trim()
  })

  if (!res.success) {
    showToast(res.error || 'Failed to record service', 'error')
    return
  }

  if (res.clamped) {
    showToast(`Only ₹${res.amountDeducted.toLocaleString('en-IN')} was available and has been deducted. Balance is now ₹${res.remainingBalance.toLocaleString('en-IN')}.`, 'error')
  } else {
    showToast(`Recorded! Remaining balance: ₹${res.remainingBalance.toLocaleString('en-IN')}`, 'success')
  }

  // Refresh membership detail + history from the source of truth
  const fresh = await fetchMembershipById(selected.value.id)
  if (fresh.memberships && fresh.memberships[0]) selected.value = fresh.memberships[0]
  await fetchUsageHistory(selected.value.id)

  usageForm.serviceDescription = ''
  usageForm.amount = null
}

// ══════════════ ALL MEMBERSHIPS ══════════════
const listSearch = ref('')
async function loadList() {
  await fetchMembershipList(listSearch.value.trim())
}

// ══════════════ PLANS (admin) ══════════════
const planModal = reactive({
  show: false, editing: false, editId: null,
  form: { name: '', paidAmount: null, benefitAmount: null, validityMonths: null, active: true },
  errors: {}
})

function openPlanModal(p) {
  if (p) {
    planModal.editing = true
    planModal.editId = p.id
    planModal.form = { name: p.name, paidAmount: p.paidAmount, benefitAmount: p.benefitAmount, validityMonths: p.validityMonths, active: p.active }
  } else {
    planModal.editing = false
    planModal.editId = null
    planModal.form = { name: '', paidAmount: null, benefitAmount: null, validityMonths: null, active: true }
  }
  planModal.errors = {}
  planModal.show = true
}

function validatePlanForm() {
  const errs = {}
  if (!planModal.form.name.trim()) errs.name = 'Name is required'
  if (!planModal.form.paidAmount || planModal.form.paidAmount <= 0) errs.paidAmount = 'Enter a valid amount'
  if (!planModal.form.benefitAmount || planModal.form.benefitAmount <= 0) errs.benefitAmount = 'Enter a valid amount'
  if (!planModal.form.validityMonths || planModal.form.validityMonths <= 0) errs.validityMonths = 'Enter valid months'
  planModal.errors = errs
  return Object.keys(errs).length === 0
}

async function savePlanForm() {
  if (!validatePlanForm()) return
  const res = await savePlan({
    id: planModal.editId || '',
    name: planModal.form.name.trim(),
    paidAmount: String(planModal.form.paidAmount),
    benefitAmount: String(planModal.form.benefitAmount),
    validityMonths: String(planModal.form.validityMonths),
    active: String(planModal.form.active)
  })
  if (!res.success) {
    showToast(res.error || 'Failed to save plan', 'error')
    return
  }
  planModal.show = false
  showToast('Plan saved! ✓', 'success')
  await loadPlans()
}

async function removePlan(p) {
  const res = await deletePlan(p.id)
  if (res.success) {
    showToast('Plan deleted', 'success')
    await loadPlans()
  } else {
    showToast(res.error || 'Failed to delete plan', 'error')
  }
}

async function loadPlans() {
  const [, activeRes] = await Promise.all([fetchPlans(false), fetchPlans(true)])
  allPlans.value = activeRes.plans || []
}

onMounted(async () => {
  loadStaffNames()
  tabLoading.value = true
  try {
    await loadPlans()
  } finally {
    tabLoading.value = false
  }
})
</script>

<style scoped>
.membership-page { max-width: 1100px; padding: 4px 4px 40px; }

.mem-tabs { display: flex; gap: 6px; margin-bottom: 20px; border-bottom: 1px solid var(--color-border, #e0e0e0); }
.mem-tab {
  padding: 10px 16px; border: none; background: none; cursor: pointer;
  font-size: 13.5px; color: var(--color-text-muted, #888);
  border-bottom: 2px solid transparent; transition: color 0.15s, border-color 0.15s;
}
.mem-tab:hover { color: var(--color-accent, #8B6F47); }
.mem-tab--active { color: var(--color-accent, #8B6F47); border-color: var(--color-accent, #8B6F47); font-weight: 500; }

.mem-panel { background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e0e0e0); border-radius: 12px; padding: 22px; }
.mem-panel__title { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
.mem-empty { color: var(--color-text-muted, #888); font-size: 13px; padding: 16px 0; }

/* Loading states */
.mem-loading {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 60px 20px;
  color: var(--color-text-muted, #888); font-size: 14px;
  background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e0e0e0); border-radius: 12px;
}
.mem-inline-loading {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 0;
  color: var(--color-text-muted, #888); font-size: 13px;
}
.mem-spinner {
  width: 28px; height: 28px;
  border: 3px solid var(--color-border, #e0e0e0);
  border-top-color: var(--color-accent, #8B6F47);
  border-radius: 50%;
  animation: mem-spin 0.8s linear infinite;
}
.mem-spinner--sm { width: 16px; height: 16px; border-width: 2px; }
@keyframes mem-spin { to { transform: rotate(360deg); } }

/* Plan cards */
.plan-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.plan-card {
  border: 1.5px solid var(--color-border, #e0e0e0); border-radius: 10px; padding: 14px;
  cursor: pointer; transition: border-color 0.15s, background 0.15s;
}
.plan-card:hover { border-color: var(--color-accent, #8B6F47); }
.plan-card--selected { border-color: var(--color-accent, #8B6F47); background: var(--color-accent-light, #F0E8DC); }
.plan-card--admin { cursor: default; }
.plan-card--inactive { opacity: 0.55; }
.plan-card__name { font-weight: 600; font-size: 13.5px; margin-bottom: 6px; }
.plan-card__paid { font-size: 15px; font-weight: 700; color: var(--color-accent, #8B6F47); }
.plan-card__benefit { font-size: 12.5px; color: var(--color-text-muted, #888); margin-top: 2px; }
.plan-card__validity { font-size: 12px; color: var(--color-text-muted, #888); margin-top: 4px; }
.plan-card__actions { display: flex; gap: 10px; margin-top: 10px; }
.inactive-tag { font-size: 10px; color: var(--color-danger, #9B2020); font-weight: 500; }

.plans-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }

.link-btn { background: none; border: none; color: var(--color-accent, #8B6F47); font-size: 12.5px; cursor: pointer; padding: 0; }
.link-btn--danger { color: var(--color-danger, #9B2020); }

/* Forms */
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
.form-label { font-size: 12px; color: var(--color-text-muted, #888); font-weight: 500; }
.form-input {
  padding: 9px 12px; border: 1px solid var(--color-border, #e0e0e0); border-radius: 8px;
  font-size: 13.5px; background: var(--color-surface, #fff); color: var(--color-text, #1a1a2e);
}
.form-input:disabled { background: var(--color-surface-2, #f5f5f5); color: var(--color-text-muted, #888); }
.form-error { font-size: 11.5px; color: var(--color-danger, #9B2020); }

.search-row { display: flex; gap: 8px; }
.search-row .form-input { flex: 1; }

.btn-cancel {
  padding: 9px 16px; border: 1px solid var(--color-border, #e0e0e0); border-radius: 8px;
  background: none; font-size: 13px; cursor: pointer; color: var(--color-text-muted, #888);
}
.btn-save {
  width: 100%; padding: 11px; border: none; border-radius: 9px;
  background: var(--color-accent, #8B6F47); color: #fff;
  font-size: 13.5px; font-weight: 500; cursor: pointer; transition: opacity 0.15s;
}
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

/* Membership detail */
.pick-row {
  padding: 10px 12px; border: 1px solid var(--color-border, #e0e0e0); border-radius: 8px;
  margin-bottom: 6px; cursor: pointer; font-size: 13px;
}
.pick-row:hover { background: var(--color-surface-2, #f5f5f5); }

.mem-detail { margin-top: 18px; border-top: 1px solid var(--color-border, #eee); padding-top: 18px; }
.mem-detail__row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
.mem-detail__label { color: var(--color-text-muted, #888); }
.mem-detail__value { font-weight: 500; }

.mem-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0; }
.mem-stat { text-align: center; padding: 12px 8px; background: var(--color-surface-2, #fafafa); border-radius: 8px; }
.mem-stat__num { font-size: 15px; font-weight: 700; }
.mem-stat__label { font-size: 11px; color: var(--color-text-muted, #888); margin-top: 2px; }

.usage-blocked {
  background: var(--color-danger-light, #FDEAEA); color: var(--color-danger, #9B2020);
  padding: 12px 14px; border-radius: 8px; font-size: 13px; margin-top: 12px;
}

/* Status badges */
.status-badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11.5px; font-weight: 600; }
.status-badge--active { background: var(--color-success-light, #D5F0E3); color: var(--color-success, #1E6B45); }
.status-badge--expired { background: var(--color-danger-light, #FDEAEA); color: var(--color-danger, #9B2020); }
.status-badge--used { background: var(--color-warning-light, #FDF3DC); color: var(--color-warning, #7A4F00); }

/* Table */
.mem-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
.mem-table th { text-align: left; padding: 9px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted, #888); border-bottom: 1px solid var(--color-border, #e0e0e0); }
.mem-table td { padding: 9px 10px; border-bottom: 1px solid var(--color-border, #f0f0f0); }
.mem-table .right { text-align: right; }

/* Invoice modal (adapted from Services.vue) */
.inv-backdrop { position: fixed; inset: 0; background: rgba(10,8,6,0.55); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 16px; }
.inv-modal { background: var(--color-surface, #fff); border-radius: 16px; border: 1px solid var(--color-border, #e8e8e8); width: 580px; max-width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.18); }
.inv-modal__header { display: flex; align-items: flex-start; justify-content: space-between; padding: 22px 24px 0; }
.inv-modal__title { font-size: 18px; font-weight: 600; }
.inv-modal__sub { font-size: 12px; color: var(--color-text-muted, #888); margin-top: 3px; }
.inv-modal__close { width: 32px; height: 32px; border: 1px solid var(--color-border, #e8e8e8); border-radius: 8px; background: none; color: var(--color-text-muted, #888); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s; flex-shrink: 0; }
.inv-modal__close:hover { background: var(--color-surface-2, #f5f5f5); }

.inv-preview { margin: 20px 24px; border: 1px solid var(--color-border, #e8e8e8); border-radius: 12px; overflow: hidden; background: white; }
.inv-salon-header { display: flex; align-items: center; gap: 14px; padding: 18px 20px 16px; background: linear-gradient(135deg, #faf8f5 0%, #f5ede4 100%); border-bottom: 1px solid #e8ddd2; }
.inv-salon-logo { width: 40px; height: 40px; border-radius: 50%; background: var(--color-accent, #8B6F47); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; flex-shrink: 0; }
.inv-salon-name { font-size: 15px; font-weight: 700; color: #1a1a1a; }
.inv-salon-addr { font-size: 11px; color: #888; margin-top: 1px; }
.inv-meta { margin-left: auto; text-align: right; flex-shrink: 0; }
.inv-num { font-size: 12px; font-weight: 600; color: var(--color-accent, #8B6F47); }
.inv-date { font-size: 10px; color: #999; margin-top: 2px; }

.inv-customer { padding: 14px 20px; background: #fafafa; border-bottom: 1px solid #f0f0f0; }
.inv-customer__label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 0.08em; }
.inv-customer__name { font-size: 14px; font-weight: 600; margin-top: 3px; }
.inv-customer__phone { font-size: 12px; color: #666; margin-top: 2px; }

.mem-invoice-plan { padding: 16px 20px; }
.mem-invoice-plan__name { font-size: 15px; font-weight: 700; color: var(--color-accent, #8B6F47); margin-bottom: 10px; }
.mem-invoice-plan__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.mem-invoice-plan__grid div { display: flex; flex-direction: column; font-size: 12px; }
.mem-invoice-plan__grid span { color: #999; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; }
.mem-invoice-plan__grid strong { font-size: 13px; margin-top: 2px; }

.inv-totals { padding: 14px 20px 16px; border-top: 2px solid #f0f0f0; display: flex; flex-direction: column; gap: 8px; }
.inv-tot-row { display: flex; justify-content: space-between; font-size: 13px; color: #444; }
.inv-tot-row--grand { font-size: 16px; font-weight: 700; color: var(--color-accent, #8B6F47); padding-top: 10px; border-top: 1px solid #eee; margin-top: 4px; }
.inv-footer { text-align: center; padding: 12px; border-top: 1px dashed #eee; font-size: 12px; color: #aaa; background: #fafafa; }

.inv-actions { display: flex; gap: 8px; flex-wrap: wrap; padding: 16px 24px 22px; border-top: 1px solid var(--color-border, #f0f0f0); }
.inv-btn { display: flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 9px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid transparent; transition: opacity 0.15s, transform 0.1s; flex: 1; justify-content: center; min-width: 120px; }
.inv-btn:hover { opacity: 0.88; transform: translateY(-1px); }
.inv-btn--print { background: #f5f5f5; color: #444; border-color: #e0e0e0; }
.inv-btn--wa { background: #25D366; color: white; border-color: #25D366; }
.inv-btn--done { background: var(--color-accent, #8B6F47); color: white; border-color: var(--color-accent, #8B6F47); }

.inv-payment-row { display: flex; align-items: center; justify-content: space-between; }
.inv-payment-label { font-size: 12px; color: var(--color-text-muted, #888); }
.inv-payment-toggle { display: flex; gap: 6px; }
.inv-pay-opt { padding: 7px 14px; border-radius: 8px; border: 1px solid var(--color-border, #e0e0e0); background: none; font-size: 12.5px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.inv-pay-opt--cash.inv-pay-opt--active { background: var(--color-success-light, #D5F0E3); border-color: var(--color-success, #1E6B45); color: var(--color-success, #1E6B45); }
.inv-pay-opt--upi.inv-pay-opt--active { background: #eef2ff; border-color: #4285f4; color: #4285f4; }

/* Add/Edit modals (Staff.vue pattern) */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal-box { background: var(--color-surface, #fff); border-radius: 14px; width: 460px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 14px; border-bottom: 1px solid var(--color-border, #e8e8e8); }
.modal-title { font-size: 15px; font-weight: 600; }
.modal-close { background: none; border: none; cursor: pointer; color: var(--color-text-muted, #888); }
.modal-body { padding: 18px 20px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px 18px; border-top: 1px solid var(--color-border, #e8e8e8); }

.modal-enter-active, .modal-leave-active { transition: opacity 0.15s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* Toast */
.toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 10px; font-size: 13.5px; color: #fff; z-index: 1300; box-shadow: 0 8px 24px rgba(0,0,0,0.18); max-width: 360px; }
.toast--success { background: var(--color-success, #1E6B45); }
.toast--error { background: var(--color-danger, #9B2020); }
.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(8px); }
</style>
