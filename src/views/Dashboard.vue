<template>
  <div class="dashboard">

    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>Loading dashboard…</span>
    </div>

    <!-- Error banner -->
    <div v-if="apiError" class="error-banner">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ apiError }}
    </div>

    <!-- Stat cards -->
    <div class="stat-grid">
      <div class="stat-card stat-card--primary">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-num">{{ isLoading ? '...' : stats.todayTotal }}</div>
          <div class="stat-label">Today's appointments</div>
        </div>
      </div>

      <div class="stat-card stat-card--hair">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-num">{{ stats.todayHair ?? '—' }}</div>
          <div class="stat-label">Hair today</div>
        </div>
      </div>

      <div class="stat-card stat-card--beauty">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-num">{{ stats.todayBeauty ?? '—' }}</div>
          <div class="stat-label">Beauty today</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-num">{{ stats.uniqueClients ?? '—' }}</div>
          <div class="stat-label">Unique clients</div>
        </div>
      </div>
    </div>

    <!-- Chart + Top Services -->
    <div class="content-grid">
      <!-- Weekly bar chart -->
      <div class="card chart-card">
        <div class="card__header">
          <h2 class="card__title">Last 7 days</h2>
          <span class="card__sub">Booking activity</span>
        </div>
        <div class="bar-chart">
          <div v-for="(day, i) in stats.last7 || []":key="i" class="bar-col">
            <div class="bar-val">{{ day.count || '' }}</div>
            <div class="bar-wrap">
              <div
                class="bar-fill"
                :style="{ height: barHeight(day.count) }"
                :class="{ 'bar-fill--today': day.isToday }"
              ></div>
            </div>
            <div class="bar-label">{{ day.label }}</div>
          </div>
        </div>
      </div>

      <!-- Top services -->
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">Top services</h2>
          <span class="card__sub">All time</span>
        </div>
        <div v-if="!stats.topServices || stats.topServices.length === 0" class="empty-state">
          <p>No bookings yet — start adding appointments!</p>
        </div>
        <div v-else class="service-list">
          <div v-for="(svc, i) in stats.topServices" :key="svc.name" class="service-row">
            <div class="service-rank">{{ i + 1 }}</div>
            <div class="service-info">
              <div class="service-name">{{ svc.name }}</div>
              <div class="service-bar-wrap">
                <div class="service-bar" :style="{ width: serviceBarWidth(svc.count) }"></div>
              </div>
            </div>
            <div class="service-count">{{ svc.count }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="card quick-actions">
      <div class="card__header">
        <h2 class="card__title">Quick actions</h2>
      </div>
      <div class="actions-grid">
        <router-link to="/appointments" class="action-btn action-btn--primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New appointment
        </router-link>
        <router-link to="/appointments" class="action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Today's schedule
        </router-link>
        <button class="action-btn action-btn--wa" @click="sendTodaySummary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp summary
        </button>
        <button class="action-btn" @click="loadData">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.22-3.29"/>
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Today's upcoming appointments -->
    <div class="card" v-if="todayBookings.length > 0">
      <div class="card__header">
        <h2 class="card__title">Upcoming today</h2>
        <span class="card__sub">Next appointments</span>
      </div>
      <div class="upcoming-list">
        <div v-for="appt in todayBookings" :key="appt.slotKey" class="upcoming-row">
          <div class="upcoming-time">{{ appt.time }}</div>
          <div class="upcoming-info">
            <div class="upcoming-name">{{ appt.name }}</div>
            <div class="upcoming-service">{{ appt.services }}</div>
          </div>
          <div class="upcoming-chair" :class="appt.chairType === 'hair' ? 'chair--hair' : 'chair--beauty'">
            {{ appt.chairLabel }}
          </div>
          <!-- WhatsApp remind button — opens wa.me with number directly -->
          <button class="remind-btn" @click="sendSingleReminder(appt)" title="Send WhatsApp reminder">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Remind
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBookings, CHAIRS, API_URL } from '@/composables/useBookings'
import { useWhatsApp } from '@/composables/useWhatsApp'

const { getStats, getBookingsForDate, isLoading, apiError } = useBookings()
const { sendReminder, sendDailySummary } = useWhatsApp()

// ── Reactive stats loaded from API ────────────────────────────────────────────
const stats = ref({
  todayTotal: 0, todayHair: 0, todayBeauty: 0,
  uniqueClients: 0, totalAll: 0,
  last7: [], topServices: [], todayBookings: []
})
const todayRawBookings = ref({})

// ── Computed ──────────────────────────────────────────────────────────────────
const maxCount = computed(() => {
  const values = (stats.value.last7 || []).map(d => d.count)
  return values.length ? Math.max(...values) : 1
})

const maxSvc = computed(() => {
  const values = (stats.value.topServices || []).map(s => s.count)
  return values.length ? Math.max(...values) : 1
})

function barHeight(count) {
  return `${Math.max((count / maxCount.value) * 100, count > 0 ? 8 : 3)}%`
}
function serviceBarWidth(count) {
  return `${(count / maxSvc.value) * 100}%`
}

// Build today's upcoming list from raw bookings fetched separately
const todayBookings = computed(() => {
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const result = []

  Object.entries(todayRawBookings.value).forEach(([slotKey, b]) => {
    const [time, chairId] = slotKey.split(/_(.+)/)
    const parts = time.split(':')
    let h = parseInt(parts[0])
    const m = parseInt(parts[1] || '0')
    if (h < 10) h = h + 12
    const slotMinutes = h * 60 + m
    if (slotMinutes >= nowMinutes) {
      const chair = CHAIRS.find(c => c.id === chairId)
      result.push({ slotKey, time, ...b, chairLabel: chair?.label || chairId, chairType: chair?.type })
    }
  })

  return result
    .sort((a, b) => {
      const toMin = t => { const [h,m] = t.split(':').map(Number); return (h < 10 ? h+12 : h)*60+m }
      return toMin(a.time) - toMin(b.time)
    })
    .slice(0, 6)
})

// ── Load data ─────────────────────────────────────────────────────────────────
async function loadData() {
  isLoading.value = true
  try {
    function formatDateKey(date) {
      const d = new Date(date)
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
    }
    const today = formatDateKey(new Date())
    const res = await fetch(`${API_URL}?action=dashboard&date=${today}`)
    const json = await res.json()
    if (json.success) {
      stats.value = { ...stats.value, ...json.stats }
      todayRawBookings.value = json.today || {}
    }
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
function sendTodaySummary() {
  if (Object.keys(todayRawBookings.value).length === 0) {
    alert('No bookings for today.')
    return
  }
  sendDailySummary(todayRawBookings.value, new Date(), CHAIRS)
}

function sendSingleReminder(appt) {
  // sendReminder opens wa.me/PHONE?text=... directly
  sendReminder({ name: appt.name, mobile: appt.mobile, services: appt.services }, appt.time, appt.chairLabel)
}

onMounted(loadData)
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 20px; position: relative; }

/* loading overlay */
.loading-overlay {
  position: absolute; inset: 0; z-index: 50;
  background: rgba(250,248,245,0.82);
  display: flex; align-items: center; justify-content: center; gap: 12px;
  border-radius: var(--radius-lg);
  font-size: 13px; color: var(--color-text-muted);
  backdrop-filter: blur(2px);
}
.loading-spinner {
  width: 20px; height: 20px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* error banner */
.error-banner {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  font-size: 13px;
}

/* stat cards */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
}
.stat-icon {
  width: 48px; height: 48px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.stat-card--primary .stat-icon { background: var(--color-accent-light);  color: var(--color-accent); }
.stat-card--hair .stat-icon    { background: var(--color-hair-light);    color: var(--color-hair);   }
.stat-card--beauty .stat-icon  { background: var(--color-beauty-light);  color: var(--color-beauty); }
.stat-num   { font-family: var(--font-display); font-size: 28px; font-weight: 600; line-height: 1; }
.stat-label { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }

/* card */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}
.card__header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 20px; }
.card__title  { font-family: var(--font-display); font-size: 16px; font-weight: 500; }
.card__sub    { font-size: 12px; color: var(--color-text-muted); }

/* content grid */
.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* bar chart */
.bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 140px; }
.bar-col   { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; }
.bar-val   { font-size: 11px; color: var(--color-text-muted); min-height: 16px; }
.bar-wrap  { flex: 1; display: flex; align-items: flex-end; width: 100%; }
.bar-fill  { width: 100%; border-radius: 4px 4px 0 0; background: var(--color-border); transition: height 0.4s; min-height: 3px; }
.bar-fill--today { background: var(--color-accent); }
.bar-label { font-size: 10px; color: var(--color-text-light); text-align: center; }

/* top services */
.service-list { display: flex; flex-direction: column; gap: 14px; }
.service-row  { display: flex; align-items: center; gap: 12px; }
.service-rank {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--color-surface-2);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 500; color: var(--color-text-muted); flex-shrink: 0;
}
.service-info     { flex: 1; }
.service-name     { font-size: 13px; margin-bottom: 4px; }
.service-bar-wrap { height: 4px; background: var(--color-surface-2); border-radius: 2px; }
.service-bar      { height: 100%; background: var(--color-accent); border-radius: 2px; transition: width 0.5s; }
.service-count    { font-size: 13px; font-weight: 500; color: var(--color-text-muted); min-width: 24px; text-align: right; }

/* quick actions */
.actions-grid { display: flex; gap: 10px; flex-wrap: wrap; }
.action-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 13px; background: var(--color-surface);
  color: var(--color-text); text-decoration: none;
  cursor: pointer; transition: background var(--transition);
  white-space: nowrap;
}
.action-btn:hover { background: var(--color-surface-2); }
.action-btn--primary { background: var(--color-accent); color: #fff; border-color: var(--color-accent); }
.action-btn--primary:hover { background: var(--color-accent-hover); }
.action-btn--wa { background: #25D366; color: #fff; border-color: #25D366; }
.action-btn--wa:hover { background: #1da855; }

/* upcoming */
.upcoming-list { display: flex; flex-direction: column; gap: 2px; }
.upcoming-row  {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: var(--radius-md);
  transition: background var(--transition);
}
.upcoming-row:hover { background: var(--color-surface-2); }
.upcoming-time    { font-size: 13px; font-weight: 500; color: var(--color-accent); min-width: 48px; }
.upcoming-info    { flex: 1; }
.upcoming-name    { font-size: 13px; font-weight: 500; }
.upcoming-service { font-size: 12px; color: var(--color-text-muted); }
.upcoming-chair   { font-size: 11px; padding: 3px 10px; border-radius: 99px; white-space: nowrap; }
.chair--hair      { background: var(--color-hair-light);   color: var(--color-hair); }
.chair--beauty    { background: var(--color-beauty-light); color: var(--color-beauty); }
.remind-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 12px; border: none; border-radius: var(--radius-sm);
  background: #25D366; color: #fff; font-size: 11px; cursor: pointer;
  white-space: nowrap; flex-shrink: 0;
  transition: background 0.15s;
}
.remind-btn:hover { background: #1da855; }

.empty-state { color: var(--color-text-muted); font-size: 13px; text-align: center; padding: 20px; }

/* ── Responsive ── */
@media (max-width: 1100px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .stat-grid    { grid-template-columns: 1fr 1fr; gap: 10px; }
  .content-grid { grid-template-columns: 1fr; }
  .actions-grid { flex-direction: column; }
  .action-btn   { width: 100%; justify-content: center; }
  .upcoming-chair { display: none; }
}
@media (max-width: 480px) {
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .stat-num  { font-size: 22px; }
  .card      { padding: 16px; }
}
</style>