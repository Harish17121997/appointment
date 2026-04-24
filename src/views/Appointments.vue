<template>
  <div class="appointments">
    <!-- Date navigation bar -->
    <div class="date-nav">
      <div class="date-nav__controls">
        <button class="date-nav-btn" @click="changeDate(-1)" title="Previous day">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="date-display" @click="showDatePicker = true">
          <div class="date-main">{{ formattedDate }}</div>
          <div class="date-day">{{ formattedDay }}</div>
        </div>
        <button class="date-nav-btn" @click="changeDate(1)" title="Next day">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button v-if="!isToday" class="today-pill" @click="goToday">Today</button>
        <span v-else class="today-badge">Today</span>
        <input v-if="showDatePicker" type="date" class="date-input" :value="dateInputValue" @change="onDatePick" @blur="showDatePicker = false" ref="datePickerRef" />
      </div>

      <div class="date-nav__actions">
        <!-- Reminder schedule info -->
        <div class="reminder-info" v-if="Object.keys(bookings).length > 0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="color:#25D366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>{{ scheduledReminders }} reminder{{ scheduledReminders !== 1 ? 's' : '' }} scheduled</span>
        </div>

        <button class="action-btn action-btn--whatsapp" @click="sendSummary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Share day summary
        </button>
      </div>
    </div>

    <!-- Summary pills -->
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
        <span class="pill-num">{{ totalSlots - Object.keys(bookings).length }}</span>
        <span class="pill-label">Free slots</span>
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="cal-container">
      <!-- Column headers -->
      <div class="cal-grid cal-grid--header">
        <div class="cal-time-cell"></div>
        <div v-for="chair in CHAIRS" :key="chair.id" class="cal-head" :class="`cal-head--${chair.type}`">
          <div class="head-label">{{ chair.label }}</div>
          <div class="head-type">{{ chair.type === 'hair' ? '✂ Hair' : '💄 Beauty' }}</div>
        </div>
      </div>

      <!-- Time rows -->
      <div class="cal-body">
        <div
          v-for="time in TIME_SLOTS"
          :key="time"
          class="cal-grid cal-grid--row"
          :class="{ 'cal-grid--current': isCurrentHour(time) }"
        >
          <div class="cal-time-cell">
            <span class="time-label">{{ time }}</span>
          </div>
          <div
            v-for="chair in CHAIRS"
            :key="chair.id"
            class="cal-slot"
            :class="slotClass(time, chair)"
            @click="onSlotClick(time, chair)"
          >
            <template v-if="getBooking(time, chair.id)">
              <div class="slot-booking">
                <div class="slot-name">{{ getBooking(time, chair.id).name }}</div>
                <div class="slot-services">{{ getBooking(time, chair.id).services }}</div>
                <div class="slot-actions">
                  <button class="slot-remind-btn" @click.stop="quickRemind(time, chair)" title="Send WhatsApp reminder">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="slot-empty">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking / View modal -->
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
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import BookingModal from '@/components/BookingModal.vue'
import { useBookings, CHAIRS, TIME_SLOTS } from '@/composables/useBookings'
import { useWhatsApp } from '@/composables/useWhatsApp'

const { getBookingsForDate, addBooking, deleteBooking, isSaving, dateKey } = useBookings()
const { sendReminder, scheduleAllReminders, sendDailySummary, requestNotificationPermission } = useWhatsApp()

// ── state ────────────────────────────────────────────────────────────────────
const currentDate = ref(new Date())
const showDatePicker = ref(false)
const datePickerRef = ref(null)
const bookings = ref({})
const scheduledReminders = ref(0)

const modal = ref({
  show: false, mode: 'book',
  time: '', chairId: '', chairLabel: '', chairType: '',
  booking: null, slotKey: ''
})

// ── computed ─────────────────────────────────────────────────────────────────
const totalSlots = computed(() => TIME_SLOTS.length * CHAIRS.length)
const hairCount  = computed(() => Object.keys(bookings.value).filter(k => k.includes('_hair')).length)
const beautyCount = computed(() => Object.keys(bookings.value).filter(k => k.includes('_beauty')).length)

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

// ── helpers ──────────────────────────────────────────────────────────────────
function loadBookings() {
  bookings.value = getBookingsForDate(currentDate.value)
}

function getBooking(time, chairId) {
  return bookings.value[`${time}_${chairId}`] || null
}

function slotClass(time, chair) {
  const b = getBooking(time, chair.id)
  if (b) return `cal-slot--booked cal-slot--${chair.type}`
  return 'cal-slot--empty'
}

function isCurrentHour(time) {
  if (!isToday.value) return false
  const now = new Date()
  const [h, m] = time.split(':').map(Number)
  const hour = h < 10 ? h + 12 : h
  const nowH = now.getHours(), nowM = now.getMinutes()
  return nowH === hour && nowM < 30 && m === 0 || nowH === hour && nowM >= 30 && m === 30
}

// ── navigation ────────────────────────────────────────────────────────────────
function changeDate(delta) {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + delta)
  currentDate.value = d
}
function goToday() {
  currentDate.value = new Date()
}
function onDatePick(e) {
  const [y, m, d] = e.target.value.split('-').map(Number)
  currentDate.value = new Date(y, m-1, d)
  showDatePicker.value = false
}

watch(currentDate, () => {
  loadBookings()
  rescheduleReminders()
})

watch(showDatePicker, async (val) => {
  if (val) { await nextTick(); datePickerRef.value?.showPicker?.() }
})

// ── modal ─────────────────────────────────────────────────────────────────────
function onSlotClick(time, chair) {
  const booking = getBooking(time, chair.id)
  modal.value = {
    show: true,
    mode: booking ? 'view' : 'book',
    time,
    chairId: chair.id,
    chairLabel: chair.label,
    chairType: chair.type,
    booking,
    slotKey: `${time}_${chair.id}`
  }
}

function closeModal() {
  modal.value.show = false
}

async function onSubmit(formData) {
  const slotKey = `${modal.value.time}_${modal.value.chairId}`
  const ok = await addBooking(currentDate.value, slotKey, formData)
  if (ok) {
    loadBookings()
    closeModal()
    rescheduleReminders()
  }
}

async function onDelete() {
  await deleteBooking(currentDate.value, modal.value.slotKey)
  loadBookings()
  closeModal()
  rescheduleReminders()
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
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
  const count = Object.values(bookings.value).filter(b => b.scheduleReminder && b.mobile).length
  scheduledReminders.value = count
  if (isToday.value) {
    scheduleAllReminders(bookings.value, CHAIRS, currentDate.value)
  }
}

// ── init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await requestNotificationPermission()
  loadBookings()
  rescheduleReminders()
})
</script>

<style scoped>
.appointments { display: flex; flex-direction: column; gap: 16px; }

/* date nav */
.date-nav {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 20px;
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap; gap: 12px;
}
.date-nav__controls { display: flex; align-items: center; gap: 10px; position: relative; }
.date-nav-btn {
  width: 36px; height: 36px;
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  background: none; cursor: pointer; color: var(--color-text);
  display: flex; align-items: center; justify-content: center;
  transition: background var(--transition);
}
.date-nav-btn:hover { background: var(--color-surface-2); }
.date-display {
  text-align: center; cursor: pointer; padding: 4px 10px; border-radius: var(--radius-md);
  transition: background var(--transition);
}
.date-display:hover { background: var(--color-surface-2); }
.date-main { font-family: var(--font-display); font-size: 16px; font-weight: 500; }
.date-day { font-size: 11px; color: var(--color-text-muted); }
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
.date-input {
  position: absolute; top: 44px; left: 50%; transform: translateX(-50%);
  opacity: 0; width: 1px; height: 1px; pointer-events: none;
}

.date-nav__actions { display: flex; align-items: center; gap: 12px; }
.reminder-info { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--color-text-muted); }

.action-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px; border: 1px solid var(--color-border);
  border-radius: var(--radius-md); font-size: 12px; background: none;
  color: var(--color-text); cursor: pointer;
  transition: background var(--transition);
}
.action-btn--whatsapp { background: #25D366; color: white; border-color: #25D366; }
.action-btn--whatsapp:hover { background: #1da855; }

/* summary row */
.summary-row { display: flex; gap: 10px; }
.summary-pill {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.pill-num { font-family: var(--font-display); font-size: 20px; font-weight: 500; }
.pill-label { font-size: 12px; color: var(--color-text-muted); }
.summary-pill--hair .pill-num   { color: var(--color-hair); }
.summary-pill--beauty .pill-num { color: var(--color-beauty); }
.summary-pill--free .pill-num   { color: var(--color-success); }

/* calendar */
.cal-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.cal-grid {
  display: grid;
  grid-template-columns: 60px repeat(4, 1fr);
  gap: 0;
}
.cal-grid--header {
  border-bottom: 2px solid var(--color-border);
  position: sticky; top: 0; z-index: 10; background: var(--color-surface);
}
.cal-time-cell {
  display: flex; align-items: center; justify-content: flex-end;
  padding: 0 12px 0 0; min-height: 56px;
}
.time-label { font-size: 11px; color: var(--color-text-muted); white-space: nowrap; }

.cal-head {
  padding: 12px 8px; text-align: center;
  border-left: 1px solid var(--color-border);
}
.cal-head--hair   { background: #EDF4FB; }
.cal-head--beauty { background: #FDF0F4; }
.head-label { font-size: 12px; font-weight: 500; color: var(--color-text); }
.head-type  { font-size: 10px; color: var(--color-text-muted); margin-top: 2px; }

.cal-body { max-height: calc(100vh - 380px); overflow-y: auto; }

.cal-grid--row { border-bottom: 1px solid var(--color-border); }
.cal-grid--row:last-child { border-bottom: none; }
.cal-grid--current { background: #FFFBF5; }
.cal-grid--current .time-label { color: var(--color-accent); font-weight: 500; }

.cal-slot {
  min-height: 56px; border-left: 1px solid var(--color-border);
  padding: 4px; cursor: pointer; position: relative;
  transition: background var(--transition);
}
.cal-slot--empty:hover { background: var(--color-surface-2); }
.cal-slot--booked { cursor: default; }
.cal-slot--booked.cal-slot--hair   { background: var(--color-hair-light); }
.cal-slot--booked.cal-slot--beauty { background: var(--color-beauty-light); }
.cal-slot--booked.cal-slot--hair:hover   { background: #C5DCF2; }
.cal-slot--booked.cal-slot--beauty:hover { background: #F4D5E0; }

.slot-empty {
  width: 100%; height: 100%; min-height: 48px;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-border-strong);
  opacity: 0;
  transition: opacity var(--transition);
}
.cal-slot--empty:hover .slot-empty { opacity: 1; }

.slot-booking { padding: 4px 6px; }
.slot-name { font-size: 12px; font-weight: 500; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.slot-services { font-size: 10px; color: var(--color-text-muted); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.slot-actions { display: flex; gap: 4px; margin-top: 4px; }
.slot-remind-btn {
  padding: 2px 6px; border: none; border-radius: 3px;
  background: #25D366; color: white; cursor: pointer;
  display: flex; align-items: center; gap: 3px;
  font-size: 10px; opacity: 0; transition: opacity var(--transition);
}
.cal-slot--booked:hover .slot-remind-btn { opacity: 1; }
</style>
