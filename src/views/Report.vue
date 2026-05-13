<template>
  <div class="reports-page">

    <!-- ── Page Header ── -->
    <div class="rp-header">
      <div class="rp-header__left">
        <h2 class="rp-title">Payment Reports</h2>
        <p class="rp-subtitle">Daily revenue · Staff breakdown · Cash vs UPI</p>
      </div>
      <div class="rp-header__right">
        <!-- View toggle: Day / Month -->
        <div class="view-toggle">
          <button class="vt-btn" :class="{ 'vt-btn--active': viewMode === 'day' }" @click="viewMode = 'day'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Day
          </button>
          <button class="vt-btn" :class="{ 'vt-btn--active': viewMode === 'month' }" @click="viewMode = 'month'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Month
          </button>
        </div>
      </div>
    </div>

    <!-- ── Filters ── -->
    <div class="rp-filters">
      <!-- Day picker -->
      <div v-if="viewMode === 'day'" class="filter-group">
        <label class="filter-label">Date</label>
        <div class="date-nav">
          <button class="date-nav__btn" @click="shiftDay(-1)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <input type="date" v-model="selectedDate" class="filter-input filter-input--date" @change="loadDay" />
          <button class="date-nav__btn" @click="shiftDay(1)" :disabled="selectedDate >= todayValue">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button class="date-nav__today" @click="goToday" :disabled="selectedDate === todayValue">Today</button>
        </div>
      </div>

      <!-- Month picker -->
      <div v-if="viewMode === 'month'" class="filter-group">
        <label class="filter-label">Month</label>
        <input type="month" v-model="selectedMonth" class="filter-input" @change="loadMonth" />
      </div>

      <button class="rp-refresh-btn" @click="reload" :disabled="loading">
        <svg :class="{ 'spin': loading }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23,4 23,10 17,10"/>
          <polyline points="1,20 1,14 7,14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
          <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/>
        </svg>
        Refresh
      </button>
    </div>

    <!-- ── Error ── -->
    <div v-if="error" class="rp-error">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {{ error }}
    </div>

    <!-- ── Loading skeleton ── -->
    <div v-if="loading" class="rp-skeleton">
      <div class="skel-card" v-for="i in 3" :key="i"></div>
    </div>

    <!-- ── Content ── -->
    <template v-else-if="rows.length > 0">

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="sum-card sum-card--total">
          <div class="sum-card__label">Total Revenue</div>
          <div class="sum-card__value">₹{{ totalRevenue.toLocaleString('en-IN') }}</div>
          <div class="sum-card__sub">{{ rows.length }} invoice{{ rows.length !== 1 ? 's' : '' }}</div>
        </div>
        <div class="sum-card sum-card--cash">
          <div class="sum-card__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
          </div>
          <div class="sum-card__label">Cash</div>
          <div class="sum-card__value">₹{{ cashRevenue.toLocaleString('en-IN') }}</div>
          <div class="sum-card__sub">{{ cashCount }} invoice{{ cashCount !== 1 ? 's' : '' }}</div>
        </div>
        <div class="sum-card sum-card--upi">
          <div class="sum-card__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </div>
          <div class="sum-card__label">UPI</div>
          <div class="sum-card__value">₹{{ upiRevenue.toLocaleString('en-IN') }}</div>
          <div class="sum-card__sub">{{ upiCount }} invoice{{ upiCount !== 1 ? 's' : '' }}</div>
        </div>
        <div class="sum-card sum-card--discount">
          <div class="sum-card__label">Discounts Given</div>
          <div class="sum-card__value">₹{{ totalDiscount.toLocaleString('en-IN') }}</div>
          <div class="sum-card__sub">Subtotal ₹{{ totalSubtotal.toLocaleString('en-IN') }}</div>
        </div>
      </div>

      <!-- Staff-wise Breakdown -->
      <div class="section-card" v-if="staffBreakdown.length > 0">
        <div class="section-card__head">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Staff-wise Revenue
        </div>
        <div class="staff-table-wrap">
          <table class="staff-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th class="right">Services</th>
                <th class="right">Revenue</th>
                <th class="right">Cash</th>
                <th class="right">UPI</th>
                <th class="right">Share</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in staffBreakdown" :key="s.name">
                <td>
                  <div class="staff-name-cell">
                    <div class="staff-avatar">{{ s.name[0] }}</div>
                    {{ s.name }}
                  </div>
                </td>
                <td class="right muted">{{ s.services }}</td>
                <td class="right bold">₹{{ s.revenue.toLocaleString('en-IN') }}</td>
                <td class="right">
                  <span class="badge badge--cash">₹{{ s.cash.toLocaleString('en-IN') }}</span>
                </td>
                <td class="right">
                  <span class="badge badge--upi">₹{{ s.upi.toLocaleString('en-IN') }}</span>
                </td>
                <td class="right">
                  <div class="share-bar-wrap">
                    <div class="share-bar">
                      <div class="share-bar__fill" :style="{ width: s.sharePercent + '%' }"></div>
                    </div>
                    <span class="share-pct">{{ s.sharePercent }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Month view: Daily summary table -->
      <div class="section-card" v-if="viewMode === 'month'">
        <div class="section-card__head">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Daily Breakdown — {{ monthLabel }}
        </div>
        <div class="staff-table-wrap">
          <table class="staff-table">
            <thead>
              <tr>
                <th>Date</th>
                <th class="right">Invoices</th>
                <th class="right">Revenue</th>
                <th class="right">Cash</th>
                <th class="right">UPI</th>
                <th class="right">Discount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in dailySummary" :key="d.date" class="daily-row" @click="drillDown(d.date)">
                <td>
                  <div class="date-cell">
                    <span class="date-cell__day">{{ d.dayName }}</span>
                    <span class="date-cell__date">{{ d.displayDate }}</span>
                  </div>
                </td>
                <td class="right muted">{{ d.count }}</td>
                <td class="right bold">₹{{ d.revenue.toLocaleString('en-IN') }}</td>
                <td class="right"><span class="badge badge--cash">₹{{ d.cash.toLocaleString('en-IN') }}</span></td>
                <td class="right"><span class="badge badge--upi">₹{{ d.upi.toLocaleString('en-IN') }}</span></td>
                <td class="right muted">{{ d.discount > 0 ? '−₹' + d.discount.toLocaleString('en-IN') : '—' }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="tfoot-total">
                <td><strong>Total</strong></td>
                <td class="right">{{ rows.length }}</td>
                <td class="right bold">₹{{ totalRevenue.toLocaleString('en-IN') }}</td>
                <td class="right"><span class="badge badge--cash">₹{{ cashRevenue.toLocaleString('en-IN') }}</span></td>
                <td class="right"><span class="badge badge--upi">₹{{ upiRevenue.toLocaleString('en-IN') }}</span></td>
                <td class="right muted">{{ totalDiscount > 0 ? '−₹' + totalDiscount.toLocaleString('en-IN') : '—' }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Invoice List (Day view) -->
      <div class="section-card" v-if="viewMode === 'day'">
        <div class="section-card__head">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2"/>
            <line x1="9" y1="7" x2="15" y2="7"/>
            <line x1="9" y1="11" x2="15" y2="11"/>
            <line x1="9" y1="15" x2="13" y2="15"/>
          </svg>
          Invoices — {{ dayLabel }}
        </div>
        <div class="inv-list">
          <div v-for="row in rows" :key="row.invoiceNo" class="inv-row">
            <div class="inv-row__left">
              <div class="inv-row__num">{{ row.invoiceNo }}</div>
              <div class="inv-row__customer">{{ row.customerName || 'Walk-in' }}</div>
              <div v-if="row.customerPhone" class="inv-row__phone">{{ row.customerPhone }}</div>
              <div class="inv-row__staff" v-if="row.staffList">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {{ row.staffList }}
              </div>
            </div>
            <div class="inv-row__center">
              <div class="inv-row__items">{{ row.items }}</div>
            </div>
            <div class="inv-row__right">
              <span class="pay-badge" :class="row.paymentMethod === 'UPI' ? 'pay-badge--upi' : 'pay-badge--cash'">
                {{ row.paymentMethod || 'Cash' }}
              </span>
              <div class="inv-row__total">₹{{ Number(row.grandTotal).toLocaleString('en-IN') }}</div>
              <div v-if="row.discount > 0" class="inv-row__disc">−₹{{ Number(row.discount).toLocaleString('en-IN') }} off</div>
            </div>
          </div>
        </div>
      </div>

    </template>

    <!-- ── Empty State ── -->
    <div v-else-if="!loading" class="rp-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.25">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
      <p>No invoices found for this {{ viewMode === 'day' ? 'date' : 'month' }}.</p>
      <span class="rp-empty__hint">Invoices appear here after clicking <strong>Done</strong> on a bill.</span>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_URL = 'https://script.google.com/macros/s/AKfycbx3lXRJdgP7uHFqU82c7T0kxDPW3HEWUcB3LpyGrGlAKpMFIckpWFzuFLSDuGvfzQzDTQ/exec'

// ── State ─────────────────────────────────────────────────────────────────
const viewMode     = ref('day')   // 'day' | 'month'
const loading      = ref(false)
const error        = ref('')
const rows         = ref([])      // raw report rows from sheet

// Date helpers
function todayISO() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
}
function currentMonth() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}`
}

const todayValue    = ref(todayISO())
const selectedDate  = ref(todayISO())   // "YYYY-MM-DD"
const selectedMonth = ref(currentMonth()) // "YYYY-MM"

// ── Fetch ─────────────────────────────────────────────────────────────────
async function loadDay() {
  loading.value = true
  error.value   = ''
  rows.value    = []
  try {
    // Convert "YYYY-MM-DD" → "DD-MM-YYYY" for the Apps Script
    const [y, m, d] = selectedDate.value.split('-')
    const dateParam = `${d}-${m}-${y}`
    const res  = await fetch(`${API_URL}?action=reportGet&date=${dateParam}`)
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to load report')
    rows.value = data.rows || []
  } catch (err) {
    error.value = err.message || 'Could not load report. Check your network.'
    console.error('Report fetch error:', err)
  } finally {
    loading.value = false
  }
}

async function loadMonth() {
  loading.value = true
  error.value   = ''
  rows.value    = []
  try {
    const res  = await fetch(`${API_URL}?action=reportGet&month=${selectedMonth.value}`)
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to load report')
    rows.value = data.rows || []
  } catch (err) {
    error.value = err.message || 'Could not load report. Check your network.'
    console.error('Report fetch error:', err)
  } finally {
    loading.value = false
  }
}

function reload() {
  if (viewMode.value === 'day') loadDay()
  else loadMonth()
}

// Day nav arrows
function shiftDay(delta) {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + delta)
  const pad = n => String(n).padStart(2, '0')
  selectedDate.value = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
  loadDay()
}
function goToday() {
  selectedDate.value = todayISO()
  loadDay()
}

// Drill down from month row to day view
function drillDown(ddmmyyyy) {
  // ddmmyyyy = "04-05-2026"
  const [dd, mm, yyyy] = ddmmyyyy.split('-')
  selectedDate.value = `${yyyy}-${mm}-${dd}`
  viewMode.value = 'day'
  loadDay()
}

// ── Labels ────────────────────────────────────────────────────────────────
const dayLabel = computed(() => {
  if (!selectedDate.value) return ''
  const d = new Date(selectedDate.value + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const monthLabel = computed(() => {
  if (!selectedMonth.value) return ''
  const [y, m] = selectedMonth.value.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
})

// ── Summary Computeds ─────────────────────────────────────────────────────
const totalRevenue  = computed(() => rows.value.reduce((s, r) => s + Number(r.grandTotal || 0), 0))
const totalSubtotal = computed(() => rows.value.reduce((s, r) => s + Number(r.subtotal   || 0), 0))
const totalDiscount = computed(() => rows.value.reduce((s, r) => s + Number(r.discount   || 0), 0))

const cashRows     = computed(() => rows.value.filter(r => (r.paymentMethod || 'Cash') !== 'UPI'))
const upiRows      = computed(() => rows.value.filter(r => r.paymentMethod === 'UPI'))
const cashRevenue  = computed(() => cashRows.value.reduce((s, r) => s + Number(r.grandTotal || 0), 0))
const upiRevenue   = computed(() => upiRows.value.reduce((s, r)  => s + Number(r.grandTotal || 0), 0))
const cashCount    = computed(() => cashRows.value.length)
const upiCount     = computed(() => upiRows.value.length)

// ── Staff Breakdown ───────────────────────────────────────────────────────
// Each row has staffList = "Lucky, Priyanka" and items = "Service x1 (Lucky); Service x1 (Priyanka)"
// We parse line items to attribute revenue per staff member
const staffBreakdown = computed(() => {
  const map = {}  // staffName → { revenue, cash, upi, services }

  rows.value.forEach(row => {
    const method  = row.paymentMethod === 'UPI' ? 'upi' : 'cash'
    const itemsStr = row.items || ''

    // Parse items: "Women's Hair Trim x1 (Lucky); D-Tan x2 (Priyanka)"
    const parts = itemsStr.split(';').map(p => p.trim()).filter(Boolean)

    // Collect what each staff member did in this invoice
    const staffInvoice = {}  // staffName → total for this invoice
    let unattributed = 0

    // Track whether any item has a @rate so we know which format this invoice uses
    let hasRates = false

    parts.forEach(part => {
      // New format with rate: "Service Name xQty @Amount (StaffName)"
      const matchNew = part.match(/^(.+?)\s+x(\d+)\s+@(\d+(?:\.\d+)?)\s+\((.+?)\)$/)
      // New format no staff: "Service Name xQty @Amount"
      const matchNewNoStaff = part.match(/^(.+?)\s+x(\d+)\s+@(\d+(?:\.\d+)?)$/)
      // Old format: "Service Name xQty (StaffName)"
      const matchOld = part.match(/^(.+?)\s+x(\d+)\s+\((.+?)\)$/)

      if (matchNew) {
        hasRates = true
        const amount = Number(matchNew[3])
        const staff  = matchNew[4].trim()
        if (!staffInvoice[staff]) staffInvoice[staff] = { amount: 0, count: 0 }
        staffInvoice[staff].amount += amount
        staffInvoice[staff].count  += Number(matchNew[2])
      } else if (matchNewNoStaff) {
        hasRates = true
        unattributed += Number(matchNewNoStaff[3])
      } else if (matchOld) {
        const qty   = Number(matchOld[2])
        const staff = matchOld[3].trim()
        if (!staffInvoice[staff]) staffInvoice[staff] = { amount: 0, count: 0 }
        staffInvoice[staff].count += qty
      } else {
        unattributed++
      }
    })

    const staffNames = Object.keys(staffInvoice)

    if (staffNames.length === 0) {
      // No staff listed — attribute to "Unassigned"
      const key = 'Unassigned'
      if (!map[key]) map[key] = { revenue: 0, cash: 0, upi: 0, services: 0 }
      map[key].revenue  += Number(row.grandTotal || 0)
      map[key][method]  += Number(row.grandTotal || 0)
      map[key].services += parts.length
      return
    }

    if (hasRates) {
      // New format: use exact @amount per staff — correct attribution
      staffNames.forEach(staff => {
        if (!map[staff]) map[staff] = { revenue: 0, cash: 0, upi: 0, services: 0 }
        map[staff].revenue  += staffInvoice[staff].amount
        map[staff][method]  += staffInvoice[staff].amount
        map[staff].services += staffInvoice[staff].count
      })
    } else {
      // Old format (no @rate): fall back to proportional split by item count
      const totalItems = Object.values(staffInvoice).reduce((s, v) => s + v.count, 0) + unattributed
      staffNames.forEach(staff => {
        if (!map[staff]) map[staff] = { revenue: 0, cash: 0, upi: 0, services: 0 }
        const share  = totalItems > 0 ? staffInvoice[staff].count / totalItems : 1 / staffNames.length
        const amount = Math.round(Number(row.grandTotal || 0) * share)
        map[staff].revenue  += amount
        map[staff][method]  += amount
        map[staff].services += staffInvoice[staff].count
      })
    }
  })

  const total = Object.values(map).reduce((s, v) => s + v.revenue, 0) || 1
  return Object.entries(map)
    .map(([name, v]) => ({
      name,
      revenue:      v.revenue,
      cash:         v.cash,
      upi:          v.upi,
      services:     v.services,
      sharePercent: Math.round((v.revenue / total) * 100),
    }))
    .sort((a, b) => b.revenue - a.revenue)
})

// ── Daily Summary (Month view) ────────────────────────────────────────────
const dailySummary = computed(() => {
  const map = {}
  rows.value.forEach(row => {
    const date = row.date  // "DD-MM-YYYY"
    if (!map[date]) map[date] = { date, revenue: 0, cash: 0, upi: 0, count: 0, discount: 0 }
    const method = row.paymentMethod === 'UPI' ? 'upi' : 'cash'
    map[date].revenue  += Number(row.grandTotal || 0)
    map[date][method]  += Number(row.grandTotal || 0)
    map[date].count    += 1
    map[date].discount += Number(row.discount   || 0)
  })

  return Object.values(map)
    .sort((a, b) => {
      // Sort by date ascending (DD-MM-YYYY)
      const [da, ma, ya] = a.date.split('-').map(Number)
      const [db, mb, yb] = b.date.split('-').map(Number)
      return new Date(ya, ma-1, da) - new Date(yb, mb-1, db)
    })
    .map(d => {
      const [dd, mm, yyyy] = d.date.split('-').map(Number)
      const dateObj = new Date(yyyy, mm-1, dd)
      return {
        ...d,
        displayDate: `${String(dd).padStart(2,'0')}/${String(mm).padStart(2,'0')}`,
        dayName: dateObj.toLocaleDateString('en-IN', { weekday: 'short' }),
      }
    })
})

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => loadDay())
</script>

<style scoped>
.reports-page {
  max-width: 1100px;
  margin: 0 auto;
  padding-bottom: 48px;
}

/* ── Header ── */
.rp-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.rp-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text, #1a1a1a);
  margin: 0 0 2px;
}
.rp-subtitle {
  font-size: 13px;
  color: var(--color-text-muted, #888);
  margin: 0;
}

/* ── View Toggle ── */
.view-toggle {
  display: flex;
  gap: 4px;
  background: var(--color-surface-2, #f5f5f5);
  border-radius: 8px;
  padding: 3px;
}
.vt-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 16px; border-radius: 6px;
  font-size: 13px; font-weight: 500;
  border: none; background: none;
  color: var(--color-text-muted, #666);
  cursor: pointer; transition: all 0.15s;
}
.vt-btn--active {
  background: var(--color-surface, white);
  color: var(--color-accent, #8B6F47);
  box-shadow: 0 1px 4px rgba(0,0,0,0.10);
}

/* ── Filters ── */
.rp-filters {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.filter-input {
  padding: 8px 12px;
  border: 1.5px solid var(--color-border, #e0e0e0);
  border-radius: 8px;
  font-size: 13.5px;
  background: var(--color-surface, white);
  color: var(--color-text, #1a1a1a);
  outline: none;
  transition: border-color 0.15s;
}
.filter-input:focus { border-color: var(--color-accent, #8B6F47); }
.filter-input--date { min-width: 160px; }

.date-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}
.date-nav__btn {
  width: 32px; height: 32px; border-radius: 7px;
  border: 1.5px solid var(--color-border, #e0e0e0);
  background: var(--color-surface, white);
  color: var(--color-text-muted, #666);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s;
}
.date-nav__btn:hover:not(:disabled) {
  border-color: var(--color-accent, #8B6F47);
  color: var(--color-accent, #8B6F47);
}
.date-nav__btn:disabled { opacity: 0.4; cursor: not-allowed; }
.date-nav__today {
  padding: 6px 12px; border-radius: 7px;
  border: 1.5px solid var(--color-border, #e0e0e0);
  background: var(--color-surface, white);
  font-size: 12px; font-weight: 500;
  color: var(--color-text-muted, #666);
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.date-nav__today:hover:not(:disabled) {
  border-color: var(--color-accent, #8B6F47);
  color: var(--color-accent, #8B6F47);
}
.date-nav__today:disabled { opacity: 0.4; cursor: not-allowed; }

.rp-refresh-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px; border-radius: 8px;
  border: 1.5px solid var(--color-border, #e0e0e0);
  background: var(--color-surface, white);
  font-size: 13px; color: var(--color-text-muted, #666);
  cursor: pointer; transition: all 0.15s;
}
.rp-refresh-btn:hover:not(:disabled) {
  border-color: var(--color-accent, #8B6F47);
  color: var(--color-accent, #8B6F47);
}
.rp-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.spin { animation: spin-kf 0.8s linear infinite; }
@keyframes spin-kf { to { transform: rotate(360deg); } }

/* ── Error ── */
.rp-error {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-radius: 10px;
  background: #fff5f5; border: 1px solid #fecaca;
  color: #c53030; font-size: 13.5px; margin-bottom: 20px;
}

/* ── Skeleton ── */
.rp-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.skel-card {
  height: 90px; border-radius: 14px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer { to { background-position: -200% 0; } }

/* ── Summary Cards ── */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}
.sum-card {
  background: var(--color-surface, white);
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 14px;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
}
.sum-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
}
.sum-card--total::before { background: var(--color-accent, #8B6F47); }
.sum-card--cash::before  { background: #38a169; }
.sum-card--upi::before   { background: #6c63ff; }
.sum-card--discount::before { background: #e53e3e; }

.sum-card__icon {
  color: var(--color-text-muted, #aaa);
  margin-bottom: 6px;
}
.sum-card__label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}
.sum-card__value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text, #1a1a1a);
  line-height: 1.1;
  margin-bottom: 4px;
}
.sum-card--cash .sum-card__value  { color: #276749; }
.sum-card--upi .sum-card__value   { color: #553c9a; }
.sum-card--discount .sum-card__value { color: #c53030; }
.sum-card__sub {
  font-size: 12px;
  color: var(--color-text-muted, #999);
}

/* ── Section Card ── */
.section-card {
  background: var(--color-surface, white);
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 20px;
}
.section-card__head {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #faf8f5 0%, #f5ede4 100%);
  border-bottom: 1px solid var(--color-border, #e8e8e8);
  font-size: 13.5px; font-weight: 600;
  color: var(--color-accent, #8B6F47);
}

/* ── Staff Table ── */
.staff-table-wrap { overflow-x: auto; }
.staff-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}
.staff-table th {
  padding: 10px 16px;
  background: var(--color-surface-2, #fafafa);
  border-bottom: 1px solid var(--color-border, #ededee);
  font-size: 11.5px; font-weight: 600;
  color: var(--color-text-muted, #888);
  text-transform: uppercase; letter-spacing: 0.04em;
  white-space: nowrap;
}
.staff-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border, #f0f0f0);
  color: var(--color-text, #1a1a1a);
  vertical-align: middle;
}
.staff-table tr:last-child td { border-bottom: none; }
.staff-table tr:hover td { background: var(--color-accent-light, #faf6f1); }

.right { text-align: right; }
.muted { color: var(--color-text-muted, #999); }
.bold  { font-weight: 600; }

.staff-name-cell {
  display: flex; align-items: center; gap: 10px;
  font-weight: 500;
}
.staff-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--color-accent-light, #f5ede4);
  color: var(--color-accent, #8B6F47);
  font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 99px;
  font-size: 12px; font-weight: 600;
}
.badge--cash { background: #f0fff4; color: #276749; }
.badge--upi  { background: #f5f3ff; color: #553c9a; }

/* Share bar */
.share-bar-wrap {
  display: flex; align-items: center; gap: 8px; justify-content: flex-end;
}
.share-bar {
  width: 60px; height: 5px;
  background: var(--color-border, #eee);
  border-radius: 99px;
  overflow: hidden;
  flex-shrink: 0;
}
.share-bar__fill {
  height: 100%;
  background: var(--color-accent, #8B6F47);
  border-radius: 99px;
  transition: width 0.4s ease;
}
.share-pct {
  font-size: 12px;
  color: var(--color-text-muted, #888);
  min-width: 30px; text-align: right;
}

/* ── Daily row (month view) ── */
.daily-row { cursor: pointer; }
.daily-row:hover td { background: var(--color-accent-light, #faf6f1) !important; }

.date-cell { display: flex; flex-direction: column; gap: 1px; }
.date-cell__day  { font-size: 11px; color: var(--color-text-muted, #999); }
.date-cell__date { font-weight: 600; font-size: 13.5px; }

.tfoot-total td {
  padding: 12px 16px;
  background: var(--color-surface-2, #fafafa);
  border-top: 2px solid var(--color-border, #e8e8e8) !important;
  border-bottom: none !important;
}

/* ── Invoice list (day view) ── */
.inv-list { padding: 4px 0; }
.inv-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-border, #f0f0f0);
  transition: background 0.12s;
}
.inv-row:last-child { border-bottom: none; }
.inv-row:hover { background: var(--color-accent-light, #faf6f1); }

.inv-row__left {
  min-width: 160px;
  flex-shrink: 0;
}
.inv-row__num {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent, #8B6F47);
  margin-bottom: 3px;
}
.inv-row__customer {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text, #1a1a1a);
}
.inv-row__phone {
  font-size: 12px;
  color: var(--color-text-muted, #888);
}
.inv-row__staff {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--color-text-muted, #999);
  margin-top: 4px;
}

.inv-row__center {
  flex: 1;
  min-width: 0;
}
.inv-row__items {
  font-size: 12.5px;
  color: var(--color-text-muted, #777);
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.inv-row__right {
  text-align: right;
  flex-shrink: 0;
}
.pay-badge {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11.5px; font-weight: 600;
  margin-bottom: 6px;
}
.pay-badge--cash { background: #f0fff4; color: #276749; }
.pay-badge--upi  { background: #f5f3ff; color: #553c9a; }

.inv-row__total {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text, #1a1a1a);
  line-height: 1.1;
}
.inv-row__disc {
  font-size: 11.5px;
  color: #e53e3e;
  margin-top: 2px;
}

/* ── Empty state ── */
.rp-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 10px; padding: 72px 24px;
  text-align: center;
}
.rp-empty p {
  font-size: 15px; color: var(--color-text-muted, #888); margin: 0;
}
.rp-empty__hint {
  font-size: 12.5px; color: var(--color-text-light, #bbb);
}
</style>