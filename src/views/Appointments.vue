<template>
  <div class="appointments">

    <!-- ── Full-page loading overlay ── -->
    <transition name="fade">
      <div v-if="isLoading" class="page-loader">
        <div class="loader-box">
          <div class="loader-spinner"></div>
          <div class="loader-text">{{ loadingMsg }}</div>
        </div>
      </div>
    </transition>

    <!-- ── Error banner ── -->
    <div v-if="apiError" class="error-bar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ apiError }}
      <button class="error-retry" @click="loadBookings">Retry</button>
    </div>

    <!-- ── Date navigation ── -->
    <div class="date-nav">
      <div class="date-nav__controls">
        <button class="date-nav-btn" @click="changeDate(-1)" title="Yesterday">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div class="date-display" @click="openDatePicker">
          <div class="date-main">{{ formattedDate }}</div>
          <div class="date-day">{{ formattedDay }}</div>
        </div>
        <!-- Hidden native date input — triggered programmatically -->
        <input
          ref="datePickerRef"
          type="date"
          class="date-input-hidden"
          :value="dateInputValue"
          @change="onDatePick"
        />

        <button class="date-nav-btn" @click="changeDate(1)" title="Tomorrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        <button v-if="!isToday" class="today-pill" @click="goToday">Today</button>
        <span    v-else        class="today-badge">Today</span>
      </div>

      <div class="date-nav__actions">
        <div v-if="Object.keys(bookings).length > 0" class="reminder-info">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span>{{ scheduledRemindersCount }} reminder{{ scheduledRemindersCount !== 1 ? 's' : '' }} scheduled</span>
        </div>
        <button class="action-btn action-btn--wa" @click="sendSummary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Share day
        </button>
      </div>
    </div>

    <!-- ── Summary pills ── -->
    <div class="summary-row">
      <div class="summary-pill">
        <span class="pill-num">{{ Object.keys(bookings).length }}</span>
        <span class="pill-label">Total</span>
      </div>
      <div class="summary-pill summary-pill--hair">
        <span class="pill-num">{{ hairCount }}</span>
        <span class="pill-label">Hair</span>
      </div>
      <div class="summary-pill summary-pill--beauty">
        <span class="pill-num">{{ beautyCount }}</span>
        <span class="pill-label">Beauty</span>
      </div>
      <div class="summary-pill summary-pill--free">
        <span class="pill-num">{{ freeSlots }}</span>
        <span class="pill-label">Free slots</span>
      </div>
    </div>

    <!-- ── Calendar grid ── -->
    <div class="cal-wrap">
      <!-- Header row -->
      <div class="cal-grid cal-head-row">
        <div class="time-col-head"></div>
        <div v-for="chair in CHAIRS" :key="chair.id" class="cal-col-head" :class="`cal-col-head--${chair.type}`">
          <div class="head-name">{{ chair.label }}</div>
          <div class="head-type">{{ chair.type === 'hair' ? '✂ Hair' : '💄 Beauty' }}</div>
        </div>
      </div>

      <!-- Scrollable body -->
      <div class="cal-body" ref="calBodyRef">
        <div
          v-for="time in TIME_SLOTS"
          :key="time"
          class="cal-grid cal-row"
          :class="{ 'cal-row--now': isCurrentSlot(time) }"
        >
          <div class="time-col">
            <span class="time-lbl">{{ time }}</span>
          </div>

          <div
            v-for="chair in CHAIRS"
            :key="chair.id"
            class="cal-cell"
            :class="cellClass(time, chair)"
            @click="onCellClick(time, chair)"
          >
            <template v-if="getBooking(time, chair.id)">
              <div class="cell-booking">
                <div class="cell-name">{{ getBooking(time, chair.id).name }}</div>
                <div class="cell-svc">{{ getBooking(time, chair.id).services }}</div>
                <!-- WhatsApp button visible on hover -->
                <button
                  class="cell-wa-btn"
                  @click.stop="quickRemind(time, chair)"
                  title="WhatsApp reminder"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Remind
                </button>
              </div>
            </template>
            <template v-else>
              <div class="cell-empty">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Booking / View modal ── -->
    <BookingModal
      :show="modal.show"
      :mode="modal.mode"
      :time="modal.time"
      :chair-id="modal.chairId"
      :chair-label="modal.chairLabel"
      :chair-type="modal.chairType"
      :date="currentDate"
      :booking="modal.booking"
      :is-saving="isSaving"
      @close="closeModal"
      @submit="onSubmit"
      @delete="onDelete"
      @go-to-billing="onGoToBilling"
    />

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BookingModal from '@/components/BookingModal.vue'
import { useBookings, CHAIRS, TIME_SLOTS } from '@/composables/useBookings'
import { useWhatsApp } from '@/composables/useWhatsApp'

const { getBookingsForDate, addBooking, deleteBooking, isLoading, isSaving, apiError } = useBookings()
const { sendReminder, scheduleAllReminders, sendDailySummary, requestNotificationPermission } = useWhatsApp()
const router = useRouter()

// ── state ─────────────────────────────────────────────────────────────────────
const currentDate  = ref(new Date())
const bookings     = ref({})
const datePickerRef = ref(null)
const calBodyRef   = ref(null)
const scheduledRemindersCount = ref(0)
const loadingMsg   = ref('Loading appointments…')

const modal = ref({
  show: false, mode: 'book',
  time: '', chairId: '', chairLabel: '', chairType: '',
  booking: null, slotKey: ''
})

// ── computed ──────────────────────────────────────────────────────────────────
const hairCount  = computed(() => Object.keys(bookings.value).filter(k => k.includes('_hair')).length)
const beautyCount = computed(() => Object.keys(bookings.value).filter(k => k.includes('_beauty')).length)
const freeSlots  = computed(() => TIME_SLOTS.length * CHAIRS.length - Object.keys(bookings.value).length)

const formattedDate = computed(() =>
  currentDate.value.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
)
const formattedDay = computed(() =>
  currentDate.value.toLocaleDateString('en-IN', { weekday: 'long' })
)
const isToday = computed(() => {
  const t = new Date(); t.setHours(0,0,0,0)
  const c = new Date(currentDate.value); c.setHours(0,0,0,0)
  return t.getTime() === c.getTime()
})
const dateInputValue = computed(() => {
  const d = currentDate.value
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
})

// ── helpers ───────────────────────────────────────────────────────────────────
async function loadBookings() {
  loadingMsg.value = 'Loading appointments…'
  bookings.value = await getBookingsForDate(currentDate.value)
  rescheduleReminders()
  scrollToCurrentTime()
}

function getBooking(time, chairId) {
  return bookings.value[`${time}_${chairId}`] || null
}

function cellClass(time, chair) {
  const b = getBooking(time, chair.id)
  if (b) return `cal-cell--booked cal-cell--${chair.type}`
  return 'cal-cell--empty'
}

function isCurrentSlot(time) {
  if (!isToday.value) return false
  const now = new Date()
  const [h, m] = time.split(':').map(Number)
  const hour = h < 10 ? h + 12 : h
  return now.getHours() === hour && (
    (now.getMinutes() < 30 && m === 0) ||
    (now.getMinutes() >= 30 && m === 30)
  )
}

function scrollToCurrentTime() {
  if (!isToday.value || !calBodyRef.value) return
  nextTick(() => {
    const rows = calBodyRef.value.querySelectorAll('.cal-row--now')
    if (rows.length > 0) rows[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

// ── date navigation ───────────────────────────────────────────────────────────
function changeDate(delta) {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + delta)
  currentDate.value = d
}
function goToday() {
  currentDate.value = new Date()
}
function openDatePicker() {
  datePickerRef.value?.showPicker?.()
  datePickerRef.value?.click()
}
function onDatePick(e) {
  const [y, m, d] = e.target.value.split('-').map(Number)
  currentDate.value = new Date(y, m - 1, d)
}

watch(currentDate, loadBookings)

// ── modal ─────────────────────────────────────────────────────────────────────
function onCellClick(time, chair) {
  const booking = getBooking(time, chair.id)
  modal.value = {
    show: true,
    mode: booking ? 'view' : 'book',
    time, chairId: chair.id, chairLabel: chair.label, chairType: chair.type,
    booking,
    slotKey: `${time}_${chair.id}`
  }
}
function closeModal() { modal.value.show = false }

async function onSubmit(formData) {
  loadingMsg.value = 'Saving booking…'
  const slotKey = `${modal.value.time}_${modal.value.chairId}`
  const ok = await addBooking(currentDate.value, slotKey, formData)
  if (ok) {
    closeModal()
    await loadBookings()
    // If reminder was requested and this is today, schedule it
    if (formData.scheduleReminder && isToday.value) {
      rescheduleReminders()
    }
  }
}

async function onDelete() {
  loadingMsg.value = 'Deleting booking…'
  await deleteBooking(currentDate.value, modal.value.slotKey)
  closeModal()
  await loadBookings()
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
// quickRemind: opens wa.me/+91MOBILE?text=reminder directly
function quickRemind(time, chair) {
  const booking = getBooking(time, chair.id)
  if (booking) sendReminder(booking, time, chair.label)
}

function sendSummary() {
  if (Object.keys(bookings.value).length === 0) {
    alert('No bookings for this day.')
    return
  }
  sendDailySummary(bookings.value, currentDate.value, CHAIRS)
}

function rescheduleReminders() {
  const withReminder = Object.values(bookings.value).filter(b => b.scheduleReminder === '1' && b.mobile)
  scheduledRemindersCount.value = withReminder.length
  if (isToday.value) {
    scheduleAllReminders(bookings.value, CHAIRS, currentDate.value)
  }
}

// ── Go to Billing (from BookingModal "Create Bill") ─────────────────────────
function onGoToBilling(data) {
  closeModal()
  router.push({
    path: '/services',
    query: {
      name: data.name || '',
      phone: data.phone || '',
      services: data.services || '',
    }
  })
}

// ── init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await requestNotificationPermission()
  await loadBookings()
})
</script>

<style scoped>
.appointments { display: flex; flex-direction: column; gap: 16px; }

/* ── Loading overlay ── */
.page-loader {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(250,248,245,0.75);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(3px);
}
.loader-box {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 28px 36px;
  box-shadow: var(--shadow-md);
}
.loader-spinner {
  width: 28px; height: 28px;
  border: 2.5px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}
.loader-text { font-size: 13px; color: var(--color-text-muted); }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Fade transition ── */
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Error bar ── */
.error-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  font-size: 13px;
}
.error-retry {
  margin-left: auto; padding: 3px 12px;
  border: 1px solid var(--color-danger); border-radius: var(--radius-sm);
  background: none; color: var(--color-danger); font-size: 12px; cursor: pointer;
}

/* ── Date nav ── */
.date-nav {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 20px;
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap; gap: 12px;
}
.date-nav__controls { display: flex; align-items: center; gap: 10px; }
.date-nav-btn {
  width: 36px; height: 36px;
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  background: none; cursor: pointer; color: var(--color-text);
  display: flex; align-items: center; justify-content: center;
  transition: background var(--transition);
}
.date-nav-btn:hover { background: var(--color-surface-2); }
.date-display {
  text-align: center; cursor: pointer; padding: 4px 12px;
  border-radius: var(--radius-md); transition: background var(--transition);
}
.date-display:hover { background: var(--color-surface-2); }
.date-main { font-family: var(--font-display); font-size: 16px; font-weight: 500; }
.date-day  { font-size: 11px; color: var(--color-text-muted); }
/* Hidden date input — triggered via .showPicker() */
.date-input-hidden {
  position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none;
}
.today-pill {
  padding: 5px 14px; border-radius: 99px;
  border: 1px solid var(--color-accent); background: none;
  color: var(--color-accent); font-size: 12px; cursor: pointer;
  transition: background var(--transition);
}
.today-pill:hover { background: var(--color-accent-light); }
.today-badge {
  padding: 4px 12px; border-radius: 99px;
  background: var(--color-accent-light); color: var(--color-accent);
  font-size: 12px; font-weight: 500;
}
.date-nav__actions { display: flex; align-items: center; gap: 12px; }
.reminder-info { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--color-text-muted); }
.action-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 14px; border: 1px solid var(--color-border);
  border-radius: var(--radius-md); font-size: 12px;
  background: none; color: var(--color-text); cursor: pointer;
  transition: background var(--transition);
}
.action-btn--wa { background: #25D366; color: #fff; border-color: #25D366; }
.action-btn--wa:hover { background: #1da855; }

/* ── Summary pills ── */
.summary-row { display: flex; gap: 10px; flex-wrap: wrap; }
.summary-pill {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  flex: 1; min-width: 80px;
}
.pill-num   { font-family: var(--font-display); font-size: 20px; font-weight: 500; }
.pill-label { font-size: 12px; color: var(--color-text-muted); }
.summary-pill--hair .pill-num   { color: var(--color-hair); }
.summary-pill--beauty .pill-num { color: var(--color-beauty); }
.summary-pill--free .pill-num   { color: var(--color-success); }

/* ── Calendar ── */
.cal-wrap {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  width: 100%;
}
.cal-grid {
  display: grid;
  grid-template-columns: 58px repeat(4, 1fr);
  width: 100%;
}
.cal-head-row {
  border-bottom: 2px solid var(--color-border);
  position: sticky; top: 0; z-index: 10; background: var(--color-surface);
}
.time-col-head { padding: 12px; }
.cal-col-head {
  padding: 10px 8px; text-align: center;
  border-left: 1px solid var(--color-border);
}
.cal-col-head--hair   { background: #EDF4FB; }
.cal-col-head--beauty { background: #FDF0F4; }
.head-name { font-size: 12px; font-weight: 500; }
.head-type { font-size: 10px; color: var(--color-text-muted); margin-top: 2px; }

.cal-body {
  overflow-y: auto;
  max-height: calc(100vh - 360px);
}
.cal-row { border-bottom: 1px solid var(--color-border); }
.cal-row:last-child { border-bottom: none; }
.cal-row--now { background: #FFFBF5; }
.cal-row--now .time-lbl { color: var(--color-accent); font-weight: 600; }

.time-col {
  display: flex; align-items: center; justify-content: flex-end;
  padding: 0 10px 0 0; min-height: 58px;
}
.time-lbl { font-size: 11px; color: var(--color-text-muted); white-space: nowrap; }

.cal-cell {
  min-height: 58px; border-left: 1px solid var(--color-border);
  padding: 4px; cursor: pointer; position: relative;
  transition: background var(--transition);
}
.cal-cell--empty:hover { background: var(--color-surface-2); }
.cal-cell--booked      { cursor: pointer; }
.cal-cell--booked.cal-cell--hair   { background: var(--color-hair-light);   }
.cal-cell--booked.cal-cell--beauty { background: var(--color-beauty-light); }
.cal-cell--booked.cal-cell--hair:hover   { background: #BDD8F0; }
.cal-cell--booked.cal-cell--beauty:hover { background: #F0C8D6; }

.cell-empty {
  width: 100%; height: 100%; min-height: 50px;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-border-strong); opacity: 0;
  transition: opacity var(--transition);
}
.cal-cell--empty:hover .cell-empty { opacity: 1; }

.cell-booking { padding: 5px 6px; }
.cell-name    { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cell-svc     { font-size: 10px; color: var(--color-text-muted); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* WhatsApp button on booked cell — visible on hover */
.cell-wa-btn {
  display: flex; align-items: center; gap: 3px;
  margin-top: 5px; padding: 2px 7px;
  border: none; border-radius: 3px;
  background: #25D366; color: #fff;
  font-size: 10px; cursor: pointer;
  opacity: 0; transition: opacity var(--transition);
}
.cal-cell--booked:hover .cell-wa-btn { opacity: 1; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .cal-grid { grid-template-columns: 44px repeat(4, 1fr); }
  .head-name { font-size: 10px; }
  .date-nav { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 640px) {
  .cal-grid { grid-template-columns: 38px repeat(4, 1fr); }
  .cell-name { font-size: 10px; }
  .cell-svc  { display: none; }
  .head-type { display: none; }
  .cal-body  { max-height: calc(100vh - 420px); }
  .summary-row { gap: 6px; }
  .summary-pill { padding: 8px 10px; }
}
</style>