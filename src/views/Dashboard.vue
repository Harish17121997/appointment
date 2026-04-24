<template>
  <div class="dashboard">
    <!-- Stat cards -->
    <div class="stat-grid">
      <div class="stat-card stat-card--primary">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-num">{{ stats.todayTotal }}</div>
          <div class="stat-label">Today's appointments</div>
        </div>
      </div>

      <div class="stat-card stat-card--hair">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M9.5 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"/><path d="M14 7c0 2.5-2 4-4.5 4C7 11 5 9.5 5 7"/>
            <path d="M3 21v-2a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v2"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-num">{{ stats.todayHair }}</div>
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
          <div class="stat-num">{{ stats.todayBeauty }}</div>
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
          <div class="stat-num">{{ stats.uniqueClients }}</div>
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
          <div
            v-for="(day, i) in stats.last7"
            :key="i"
            class="bar-col"
          >
            <div class="bar-val">{{ day.count || '' }}</div>
            <div class="bar-wrap">
              <div
                class="bar-fill"
                :style="{ height: barHeight(day.count) }"
                :class="{ 'bar-fill--today': i === 6 }"
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
        <div v-if="stats.topServices.length === 0" class="empty-state">
          <p>No bookings yet — start adding appointments!</p>
        </div>
        <div v-else class="service-list">
          <div
            v-for="(svc, i) in stats.topServices"
            :key="svc.name"
            class="service-row"
          >
            <div class="service-rank">{{ i + 1 }}</div>
            <div class="service-info">
              <div class="service-name">{{ svc.name }}</div>
              <div class="service-bar-wrap">
                <div
                  class="service-bar"
                  :style="{ width: serviceBarWidth(svc.count) }"
                ></div>
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New appointment
        </router-link>
        <router-link to="/appointments" class="action-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          View today's schedule
        </router-link>
        <button class="action-btn" @click="sendTodaySummary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          WhatsApp summary
        </button>
      </div>
    </div>

    <!-- Today's upcoming -->
    <div class="card" v-if="todayUpcoming.length > 0">
      <div class="card__header">
        <h2 class="card__title">Upcoming today</h2>
        <span class="card__sub">Next appointments</span>
      </div>
      <div class="upcoming-list">
        <div
          v-for="appt in todayUpcoming"
          :key="appt.slotKey"
          class="upcoming-row"
        >
          <div class="upcoming-time">{{ appt.time }}</div>
          <div class="upcoming-info">
            <div class="upcoming-name">{{ appt.booking.name }}</div>
            <div class="upcoming-service">{{ appt.booking.services }}</div>
          </div>
          <div class="upcoming-chair" :class="appt.chairType === 'hair' ? 'chair--hair' : 'chair--beauty'">
            {{ appt.chairLabel }}
          </div>
          <button class="reminder-btn" @click="sendSingleReminder(appt)" title="Send WhatsApp reminder">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
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
import { computed, onMounted } from 'vue'
import { useBookings, CHAIRS, TIME_SLOTS } from '@/composables/useBookings'
import { useWhatsApp } from '@/composables/useWhatsApp'

const { getStats, getBookingsForDate } = useBookings()
const { sendReminder, sendDailySummary } = useWhatsApp()

const stats = computed(() => getStats())

const maxCount = computed(() => Math.max(...stats.value.last7.map(d => d.count), 1))
const maxSvc   = computed(() => Math.max(...stats.value.topServices.map(s => s.count), 1))

function barHeight(count) {
  return `${Math.max((count / maxCount.value) * 100, count > 0 ? 8 : 2)}%`
}
function serviceBarWidth(count) {
  return `${(count / maxSvc.value) * 100}%`
}

const todayUpcoming = computed(() => {
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const bookings = getBookingsForDate(new Date())
  const result = []

  Object.entries(bookings).forEach(([slotKey, booking]) => {
    const [time, chairId] = slotKey.split(/_(.+)/)
    const [h, m] = time.split(':').map(Number)
    // convert 1:00 → 13:00 style
    const hour = h < 10 ? h + 12 : h
    const slotMinutes = hour * 60 + (m || 0)
    if (slotMinutes >= nowMinutes) {
      const chair = CHAIRS.find(c => c.id === chairId)
      result.push({ slotKey, time, booking, chairType: chair?.type, chairLabel: chair?.label })
    }
  })

  return result.sort((a, b) => {
    const toMin = t => { const [h,m] = t.split(':').map(Number); const hr = h < 10 ? h+12 : h; return hr*60+(m||0) }
    return toMin(a.time) - toMin(b.time)
  }).slice(0, 5)
})

function sendTodaySummary() {
  const bookings = getBookingsForDate(new Date())
  sendDailySummary(bookings, new Date(), CHAIRS)
}

function sendSingleReminder(appt) {
  const chair = CHAIRS.find(c => c.id === appt.slotKey.split(/_(.+)/)[1])
  sendReminder(appt.booking, appt.time, chair?.label || '')
}
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 20px; }

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
.stat-card--primary .stat-icon { background: var(--color-accent-light); color: var(--color-accent); }
.stat-card--hair .stat-icon    { background: var(--color-hair-light);   color: var(--color-hair);   }
.stat-card--beauty .stat-icon  { background: var(--color-beauty-light); color: var(--color-beauty); }
.stat-num { font-family: var(--font-display); font-size: 28px; font-weight: 600; color: var(--color-text); line-height: 1; }
.stat-label { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }

/* generic card */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}
.card__header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 20px; }
.card__title { font-family: var(--font-display); font-size: 16px; font-weight: 500; }
.card__sub { font-size: 12px; color: var(--color-text-muted); }

/* charts grid */
.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* bar chart */
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 140px;
}
.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
}
.bar-val { font-size: 11px; color: var(--color-text-muted); min-height: 16px; }
.bar-wrap { flex: 1; display: flex; align-items: flex-end; width: 100%; }
.bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  background: var(--color-border);
  transition: height 0.4s ease;
  min-height: 3px;
}
.bar-fill--today { background: var(--color-accent); }
.bar-label { font-size: 10px; color: var(--color-text-light); text-align: center; }

/* service list */
.service-list { display: flex; flex-direction: column; gap: 14px; }
.service-row { display: flex; align-items: center; gap: 12px; }
.service-rank {
  width: 20px; height: 20px;
  border-radius: 50%;
  background: var(--color-surface-2);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 500; color: var(--color-text-muted);
  flex-shrink: 0;
}
.service-info { flex: 1; }
.service-name { font-size: 13px; font-weight: 400; margin-bottom: 4px; }
.service-bar-wrap { height: 4px; background: var(--color-surface-2); border-radius: 2px; }
.service-bar { height: 100%; background: var(--color-accent); border-radius: 2px; transition: width 0.5s ease; }
.service-count { font-size: 13px; font-weight: 500; color: var(--color-text-muted); min-width: 20px; text-align: right; }

/* quick actions */
.actions-grid { display: flex; gap: 12px; flex-wrap: wrap; }
.action-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 13px; font-weight: 400;
  color: var(--color-text);
  background: var(--color-surface);
  text-decoration: none;
  transition: background var(--transition), border-color var(--transition);
  cursor: pointer;
}
.action-btn:hover { background: var(--color-surface-2); }
.action-btn--primary {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
}
.action-btn--primary:hover { background: var(--color-accent-hover); }

/* upcoming */
.upcoming-list { display: flex; flex-direction: column; gap: 2px; }
.upcoming-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  transition: background var(--transition);
}
.upcoming-row:hover { background: var(--color-surface-2); }
.upcoming-time { font-size: 13px; font-weight: 500; color: var(--color-accent); min-width: 44px; }
.upcoming-info { flex: 1; }
.upcoming-name { font-size: 13px; font-weight: 500; }
.upcoming-service { font-size: 12px; color: var(--color-text-muted); }
.upcoming-chair {
  font-size: 11px; font-weight: 400;
  padding: 3px 10px; border-radius: 99px;
}
.chair--hair { background: var(--color-hair-light); color: var(--color-hair); }
.chair--beauty { background: var(--color-beauty-light); color: var(--color-beauty); }
.reminder-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 10px;
  border: none; border-radius: var(--radius-sm);
  background: #25D366;
  color: white;
  font-size: 11px;
  cursor: pointer;
}

.empty-state { color: var(--color-text-muted); font-size: 13px; text-align: center; padding: 20px; }

@media (max-width: 900px) {
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .content-grid { grid-template-columns: 1fr; }
}
</style>
