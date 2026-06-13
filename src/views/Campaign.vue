<template>
  <div class="campaign-page">

    <!-- Header Controls -->
    <div class="campaign-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.18v-.26z"/>
          </svg>
        </div>
        <div>
          <h2 class="header-title">WhatsApp Campaign</h2>
          <p class="header-sub">Customers who visited 30+ days ago — send a reminder</p>
        </div>
      </div>
      <div class="header-controls">
        <div class="range-wrap">
          <label class="range-label">Due after</label>
          <select v-model="dayThreshold" class="range-select" @change="loadCampaign">
            <option :value="20">20 days</option>
            <option :value="30">30 days</option>
            <option :value="45">45 days</option>
            <option :value="60">60 days</option>
            <option :value="90">90 days</option>
          </select>
        </div>
        <button class="refresh-btn" @click="loadCampaign" :disabled="loading">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            :class="{ 'spin': loading }">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Summary strip -->
    <div class="summary-strip" v-if="!loading && customers.length > 0">
      <div class="summary-pill summary-pill--total">
        <span class="pill-num">{{ customers.length }}</span>
        <span class="pill-label">Customers due</span>
      </div>
      <div class="summary-pill summary-pill--sent">
        <span class="pill-num">{{ sentCount }}</span>
        <span class="pill-label">Messaged today</span>
      </div>
      <div class="summary-pill summary-pill--pending">
        <span class="pill-num">{{ customers.length - sentCount }}</span>
        <span class="pill-label">Still pending</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Scanning visit history…</span>
    </div>

    <!-- Empty -->
    <div v-else-if="customers.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".3">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <p>All customers visited within the last {{ dayThreshold }} days 🎉</p>
    </div>

    <!-- Customer Table -->
    <div v-else class="table-wrap">
      <!-- Bulk actions bar -->
      <div class="bulk-bar" v-if="selected.size > 0">
        <span class="bulk-count">{{ selected.size }} selected</span>
        <button class="bulk-send-btn" @click="sendBulkWhatsApp">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.18v-.26z"/>
          </svg>
          Send WhatsApp to all
        </button>
        <button class="bulk-clear-btn" @click="selected.clear(); selected = new Set()">Clear</button>
      </div>

      <table class="campaign-table">
        <thead>
          <tr>
            <th class="col-check">
              <input type="checkbox" :checked="allSelected" @change="toggleAll" />
            </th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Last Visit</th>
            <th class="col-days">Days Ago</th>
            <th>Last Service</th>
            <th class="col-action">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in customers" :key="c.phone + c.lastVisit"
            :class="{ 'row--selected': selected.has(c.phone), 'row--sent': sentSet.has(c.phone) }">
            <td class="col-check">
              <input type="checkbox"
                :checked="selected.has(c.phone)"
                @change="toggleSelect(c.phone)" />
            </td>
            <td class="col-name">
              <span class="name-avatar">{{ initials(c.name) }}</span>
              {{ c.name }}
            </td>
            <td class="col-phone">{{ c.phone }}</td>
            <td class="col-date">{{ formatDisplayDate(c.lastVisit) }}</td>
            <td class="col-days">
              <span class="days-badge" :class="daysClass(c.daysAgo)">{{ c.daysAgo }}d</span>
            </td>
            <td class="col-service">{{ c.lastService }}</td>
            <td class="col-action">
              <button
                class="wa-btn"
                :class="{ 'wa-btn--sent': sentSet.has(c.phone) }"
                @click="sendWhatsApp(c)"
                :title="sentSet.has(c.phone) ? 'Already sent today' : 'Open WhatsApp'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                {{ sentSet.has(c.phone) ? 'Sent' : 'Send' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Message preview / edit modal -->
    <div v-if="previewModal" class="modal-overlay" @click.self="previewModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>WhatsApp Message Preview</h3>
          <button class="modal-close" @click="previewModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-to">To: <strong>{{ previewCustomer?.name }}</strong> ({{ previewCustomer?.phone }})</p>
          <textarea v-model="previewMessage" class="message-editor" rows="6" />
          <p class="modal-hint">💡 Clicking "Open WhatsApp" will open the app/web with this pre-filled message.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="previewModal = false">Cancel</button>
          <button class="btn-send" @click="confirmSend">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Open WhatsApp
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxu2e31nVqB-QcIid9yLwkGWvaLsfyMw-_58YihpyCWqHYNe55N1lqIDYEawXxlIHhj/exec'   // same as rest of the app

const loading      = ref(false)
const customers    = ref([])
const dayThreshold = ref(30)
const selected     = ref(new Set())

// Track who was sent a message this session (persisted to localStorage by phone)
const SENT_KEY = 'campaign_sent_' + new Date().toISOString().slice(0, 10)   // resets daily
const sentSet  = ref(new Set(JSON.parse(localStorage.getItem(SENT_KEY) || '[]')))

const sentCount  = computed(() => customers.value.filter(c => sentSet.value.has(c.phone)).length)
const allSelected = computed(() => customers.value.length > 0 && customers.value.every(c => selected.value.has(c.phone)))

// Message preview modal
const previewModal    = ref(false)
const previewCustomer = ref(null)
const previewMessage  = ref('')

// ─── Load campaign data from Google Sheets via GAS ───────────────────────────
async function loadCampaign() {
  loading.value  = true
  customers.value = []
  selected.value  = new Set()
  try {
    const url = `${GAS_URL}?action=campaignGet&days=${dayThreshold.value}`
    const res  = await fetch(url)
    const data = await res.json()
    if (data.success) {
      customers.value = data.customers
    } else {
      console.error('Campaign load failed:', data.error)
    }
  } catch (e) {
    console.error('Campaign fetch error:', e)
  } finally {
    loading.value = false
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatDisplayDate(ddmmyyyy) {
  if (!ddmmyyyy) return '—'
  const [dd, mm, yyyy] = ddmmyyyy.split('-')
  return `${dd} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(mm)-1]} ${yyyy}`
}

function daysClass(days) {
  if (days >= 90) return 'days-badge--red'
  if (days >= 60) return 'days-badge--orange'
  return 'days-badge--yellow'
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────
function buildMessage(customer) {
  return `Hi ${customer.name.split(' ')[0]} 😊\n\nIt's been a while since your last visit to *Scintillate Unisex Salon*! We'd love to pamper you again.\n\nBook your next appointment today and enjoy our latest offers. 💇‍♀️✨\n\n📞 Call us anytime or just reply here!`
}

function sendWhatsApp(customer) {
  previewCustomer.value = customer
  previewMessage.value  = buildMessage(customer)
  previewModal.value    = true
}

function confirmSend() {
  const phone = previewCustomer.value.phone.replace(/\D/g, '')
  const intlPhone = phone.startsWith('91') ? phone : '91' + phone
  const msg  = encodeURIComponent(previewMessage.value)
  window.open(`https://wa.me/${intlPhone}?text=${msg}`, '_blank')

  markSent(previewCustomer.value.phone)
  previewModal.value = false
}

function sendBulkWhatsApp() {
  // Open first pending one; user clicks through each
  const pending = customers.value.filter(c => selected.value.has(c.phone) && !sentSet.value.has(c.phone))
  if (pending.length === 0) return
  sendWhatsApp(pending[0])
}

function markSent(phone) {
  const s = new Set(sentSet.value)
  s.add(phone)
  sentSet.value = s
  localStorage.setItem(SENT_KEY, JSON.stringify([...s]))
}

// ─── Selection ────────────────────────────────────────────────────────────────
function toggleSelect(phone) {
  const s = new Set(selected.value)
  s.has(phone) ? s.delete(phone) : s.add(phone)
  selected.value = s
}

function toggleAll() {
  if (allSelected.value) {
    selected.value = new Set()
  } else {
    selected.value = new Set(customers.value.map(c => c.phone))
  }
}

onMounted(loadCampaign)
</script>

<style scoped>
.campaign-page {
  padding: 20px 24px;
  max-width: 1100px;
}

/* ── Header ── */
.campaign-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-icon {
  width: 44px; height: 44px;
  background: #e7f7ee;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #25D366;
  flex-shrink: 0;
}
.header-title {
  font-size: 17px; font-weight: 600;
  color: var(--color-text, #1a1a2e);
  margin: 0 0 2px;
}
.header-sub {
  font-size: 12.5px; color: var(--color-text-muted, #888);
  margin: 0;
}
.header-controls {
  display: flex; align-items: center; gap: 10px;
}
.range-wrap {
  display: flex; align-items: center; gap: 6px;
}
.range-label {
  font-size: 12px; color: var(--color-text-muted, #888);
}
.range-select {
  padding: 5px 10px;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 8px;
  font-size: 13px;
  background: var(--color-surface, #fff);
  color: var(--color-text, #1a1a2e);
  cursor: pointer;
}
.refresh-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 8px;
  font-size: 13px;
  background: var(--color-surface, #fff);
  color: var(--color-text-muted, #888);
  cursor: pointer;
  transition: all 0.15s;
}
.refresh-btn:hover { background: var(--color-surface-2, #f5f5f5); }
.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Summary strip ── */
.summary-strip {
  display: flex; gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.summary-pill {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid transparent;
}
.summary-pill--total  { background: #f0f4ff; border-color: #c7d7fd; }
.summary-pill--sent   { background: #e7f7ee; border-color: #a8dfc0; }
.summary-pill--pending { background: #fff8e1; border-color: #ffe082; }
.pill-num {
  font-size: 22px; font-weight: 700;
  color: var(--color-text, #1a1a2e);
  line-height: 1;
}
.pill-label { font-size: 12px; color: var(--color-text-muted, #888); }

/* ── Loading / Empty ── */
.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 60px 20px;
  color: var(--color-text-muted, #888);
  font-size: 14px;
}
.spinner {
  width: 28px; height: 28px;
  border: 3px solid var(--color-border, #e0e0e0);
  border-top-color: #25D366;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ── Bulk bar ── */
.bulk-bar {
  display: flex; align-items: center; gap: 10px;
  background: #e7f7ee;
  border: 1px solid #a8dfc0;
  border-radius: 10px 10px 0 0;
  padding: 9px 16px;
}
.bulk-count { font-size: 13px; font-weight: 500; color: var(--color-text, #1a1a2e); flex: 1; }
.bulk-send-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px;
  background: #25D366; color: #fff;
  border: none; border-radius: 7px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: background 0.15s;
}
.bulk-send-btn:hover { background: #1ebe58; }
.bulk-clear-btn {
  padding: 6px 12px;
  border: 1px solid #a8dfc0; border-radius: 7px;
  background: #fff; color: #555; font-size: 13px; cursor: pointer;
}

/* ── Table ── */
.table-wrap { border-radius: 12px; border: 1px solid var(--color-border, #e0e0e0); overflow: hidden; }
.campaign-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}
.campaign-table thead tr {
  background: var(--color-surface-2, #f8f8f8);
  border-bottom: 1px solid var(--color-border, #e0e0e0);
}
.campaign-table th {
  padding: 11px 14px;
  text-align: left;
  font-size: 11.5px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--color-text-muted, #888);
  white-space: nowrap;
}
.campaign-table td {
  padding: 11px 14px;
  border-bottom: 1px solid var(--color-border, #e8e8e8);
  color: var(--color-text, #1a1a2e);
  vertical-align: middle;
}
.campaign-table tbody tr:last-child td { border-bottom: none; }
.campaign-table tbody tr:hover { background: var(--color-surface-2, #fafafa); }
.row--selected td { background: #f0f4ff !important; }
.row--sent td { opacity: 0.6; }

.col-check { width: 36px; }
.col-days  { width: 80px; text-align: center; }
.col-action { width: 90px; text-align: center; }

.name-avatar {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  background: var(--color-accent-light, #f5ede4);
  color: var(--color-accent, #8B6F47);
  border-radius: 50%;
  font-size: 11px; font-weight: 600;
  margin-right: 8px;
  vertical-align: middle;
}
.col-name { font-weight: 500; }
.col-phone { font-family: monospace; color: var(--color-text-muted, #888); }
.col-service {
  max-width: 200px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  color: var(--color-text-muted, #888);
  font-size: 12.5px;
}

.days-badge {
  display: inline-block;
  padding: 2px 8px; border-radius: 99px;
  font-size: 12px; font-weight: 600;
}
.days-badge--yellow { background: #fff8e1; color: #b8860b; }
.days-badge--orange { background: #fff3e0; color: #e65100; }
.days-badge--red    { background: #fce4e4; color: #c62828; }

.wa-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 11px;
  background: #25D366; color: #fff;
  border: none; border-radius: 7px;
  font-size: 12.5px; font-weight: 500; cursor: pointer;
  transition: background 0.15s;
}
.wa-btn:hover { background: #1ebe58; }
.wa-btn--sent { background: var(--color-surface-2, #eee); color: var(--color-text-muted, #888); }
.wa-btn--sent:hover { background: var(--color-surface-2, #e0e0e0); }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 200;
}
.modal {
  background: var(--color-surface, #fff);
  border-radius: 14px;
  width: 480px; max-width: 95vw;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--color-border, #e8e8e8);
}
.modal-header h3 { font-size: 15px; font-weight: 600; margin: 0; }
.modal-close {
  background: none; border: none;
  font-size: 16px; cursor: pointer; color: var(--color-text-muted, #888);
  line-height: 1; padding: 2px 6px; border-radius: 4px;
}
.modal-close:hover { background: var(--color-surface-2, #f5f5f5); }
.modal-body { padding: 16px 20px; }
.modal-to { font-size: 13px; color: var(--color-text-muted, #888); margin: 0 0 10px; }
.message-editor {
  width: 100%; box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 8px;
  font-size: 13.5px; line-height: 1.55;
  resize: vertical;
  font-family: inherit;
  color: var(--color-text, #1a1a2e);
  background: var(--color-surface, #fff);
}
.modal-hint { font-size: 12px; color: var(--color-text-light, #aaa); margin: 8px 0 0; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 20px 18px;
  border-top: 1px solid var(--color-border, #e8e8e8);
}
.btn-cancel {
  padding: 7px 16px;
  border: 1px solid var(--color-border, #e0e0e0); border-radius: 8px;
  background: none; font-size: 13px; cursor: pointer; color: var(--color-text-muted, #888);
}
.btn-send {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 18px;
  background: #25D366; color: #fff;
  border: none; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: background 0.15s;
}
.btn-send:hover { background: #1ebe58; }
</style>