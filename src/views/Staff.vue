<template>
  <div class="staff-page">

    <!-- ══ OWNER PIN GATE ══════════════════════════════════════════════════ -->
    <transition name="modal">
      <div v-if="!isOwner" class="pin-gate">
        <div class="pin-box">
          <div class="pin-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 class="pin-title">Owner Access Required</h2>
          <p class="pin-sub">Enter your PIN to manage staff</p>
          <div class="pin-inputs">
            <input
              v-for="(_, i) in pinDigits"
              :key="i"
              :ref="el => pinRefs[i] = el"
              type="password"
              inputmode="numeric"
              maxlength="1"
              class="pin-digit"
              :class="{ 'pin-digit--error': pinError }"
              v-model="pinDigits[i]"
              @input="onPinInput(i)"
              @keydown.backspace="onPinBack(i)"
            />
          </div>
          <p v-if="pinError" class="pin-error">Incorrect PIN. Try again.</p>
          <button class="pin-submit" @click="submitPin">Unlock</button>
          <p class="pin-hint">Default PIN: <strong>1234</strong></p>
        </div>
      </div>
    </transition>

    <!-- ══ STAFF CONTENT (owner only) ══════════════════════════════════════ -->
    <template v-if="isOwner">

      <!-- Tab bar -->
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.id" class="tab" :class="{ 'tab--active': activeTab === tab.id }" @click="activeTab = tab.id">
          <span v-html="tab.icon"></span>
          {{ tab.label }}
        </button>
        <div class="tab-spacer"></div>
        <button class="btn-add-staff" @click="openAddStaff">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Staff
        </button>
        <button class="btn-pin-change" @click="showPinModal = true" title="Change owner PIN">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </button>
      </div>

      <!-- ── TAB: Staff List ─────────────────────────────────────────────── -->
      <div v-if="activeTab === 'staff'" class="tab-content">
        <div v-if="staffList.length === 0" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <p>No staff added yet</p>
          <button class="btn-primary" @click="openAddStaff">Add first staff member</button>
        </div>

        <div v-else class="staff-grid">
          <div v-for="s in staffList" :key="s.id" class="staff-card">
            <div class="staff-avatar" :style="{ background: s.color }">
              {{ initials(s.name) }}
            </div>
            <div class="staff-info">
              <div class="staff-name">{{ s.name }}</div>
              <div class="staff-role">{{ s.role }}</div>
              <div class="staff-mobile">{{ s.mobile }}</div>
            </div>
            <div class="staff-salary-info">
              <div class="salary-label">Monthly salary</div>
              <div class="salary-amount">₹{{ Number(s.salary).toLocaleString('en-IN') }}</div>
            </div>
            <div class="staff-actions">
              <button class="icon-btn" @click="editStaff(s)" title="Edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="icon-btn icon-btn--danger" @click="deleteStaff(s.id)" title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TAB: Attendance ────────────────────────────────────────────── -->
      <div v-if="activeTab === 'attendance'" class="tab-content">
        <!-- Month selector -->
        <div class="month-bar">
          <button class="date-nav-btn" @click="changeMonth(-1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="month-label">{{ monthLabel }}</div>
          <button class="date-nav-btn" @click="changeMonth(1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <div v-if="staffList.length === 0" class="empty-state">
          <p>Add staff members first to track attendance.</p>
        </div>

        <div v-else class="attendance-table-wrap">
          <table class="attendance-table">
            <thead>
              <tr>
                <th class="att-name-col">Staff</th>
                <th v-for="day in daysInMonth" :key="day"
                    class="att-day-col"
                    :class="{ 'att-day--today': isToday(day), 'att-day--sun': isSunday(day) }">
                  <div class="day-num">{{ day }}</div>
                  <div class="day-wd">{{ weekdayShort(day) }}</div>
                </th>
                <th class="att-total-col">Present</th>
                <th class="att-total-col">Absent</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in staffList" :key="s.id">
                <td class="att-name-col">
                  <div class="att-name-cell">
                    <div class="mini-avatar" :style="{ background: s.color }">{{ initials(s.name) }}</div>
                    <span>{{ s.name.split(' ')[0] }}</span>
                  </div>
                </td>
                <td v-for="day in daysInMonth" :key="day" class="att-day-col" :class="{ 'att-day--sun': isSunday(day) }">
                  <button
                    class="att-btn"
                    :class="attClass(s.id, day)"
                    @click="toggleAtt(s.id, day)"
                    :title="attLabel(s.id, day)"
                  >
                    {{ attSymbol(s.id, day) }}
                  </button>
                </td>
                <td class="att-total-col att-total--present">{{ presentCount(s.id) }}</td>
                <td class="att-total-col att-total--absent">{{ absentCount(s.id) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="att-legend">
          <span class="leg-p">P</span> Present &nbsp;
          <span class="leg-a">A</span> Absent &nbsp;
          <span class="leg-h">H</span> Half-day &nbsp;
          <span class="leg-o">–</span> Not marked
        </p>
      </div>

      <!-- ── TAB: Payment ───────────────────────────────────────────────── -->
      <div v-if="activeTab === 'payment'" class="tab-content">
        <div class="month-bar">
          <button class="date-nav-btn" @click="changeMonth(-1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="month-label">{{ monthLabel }}</div>
          <button class="date-nav-btn" @click="changeMonth(1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <div v-if="staffList.length === 0" class="empty-state">
          <p>Add staff members first.</p>
        </div>

        <div v-else class="payment-grid">
          <div v-for="s in staffList" :key="s.id" class="payment-card">
            <div class="pay-header">
              <div class="staff-avatar" :style="{ background: s.color }">{{ initials(s.name) }}</div>
              <div>
                <div class="staff-name">{{ s.name }}</div>
                <div class="staff-role">{{ s.role }}</div>
              </div>
            </div>

            <div class="pay-grid">
              <div class="pay-row">
                <span class="pay-label">Monthly salary</span>
                <span class="pay-val">₹{{ Number(s.salary).toLocaleString('en-IN') }}</span>
              </div>
              <div class="pay-row">
                <span class="pay-label">Working days</span>
                <span class="pay-val">{{ workingDays }} days</span>
              </div>
              <div class="pay-row">
                <span class="pay-label">Present days</span>
                <span class="pay-val pay-val--ok">{{ presentCount(s.id) }} <span style="font-size:10px">(+{{ halfCount(s.id) }} half)</span></span>
              </div>
              <div class="pay-row">
                <span class="pay-label">Per-day rate</span>
                <span class="pay-val">₹{{ perDay(s).toLocaleString('en-IN') }}</span>
              </div>
              <div class="pay-row pay-row--divider">
                <span class="pay-label">Earned (attendance)</span>
                <span class="pay-val">₹{{ earned(s).toLocaleString('en-IN') }}</span>
              </div>

              <!-- Advance / Pending adjustments -->
              <div class="pay-row">
                <span class="pay-label">Advance paid</span>
                <div class="pay-input-wrap">
                  <span class="pay-currency">₹</span>
                  <input type="number" class="pay-input" v-model.number="adjustments[s.id].advance" min="0" placeholder="0" />
                </div>
              </div>
              <div class="pay-row">
                <span class="pay-label">Pending (prev. month)</span>
                <div class="pay-input-wrap">
                  <span class="pay-currency">₹</span>
                  <input type="number" class="pay-input" v-model.number="adjustments[s.id].pending" min="0" placeholder="0" />
                </div>
              </div>
              <div class="pay-row">
                <span class="pay-label">Bonus / Extra</span>
                <div class="pay-input-wrap">
                  <span class="pay-currency">₹</span>
                  <input type="number" class="pay-input" v-model.number="adjustments[s.id].bonus" min="0" placeholder="0" />
                </div>
              </div>

              <div class="pay-row pay-row--total">
                <span class="pay-label">Net payable</span>
                <span class="pay-val pay-val--total">₹{{ netPay(s).toLocaleString('en-IN') }}</span>
              </div>
            </div>

            <div class="pay-actions">
              <button class="btn-payslip" @click="markPaid(s)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                Mark paid
              </button>
              <button class="btn-wa-pay" @click="sendPayslip(s)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Send payslip
              </button>
            </div>

            <div v-if="paidStatus[s.id + '_' + monthKey]" class="paid-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Paid
            </div>
          </div>
        </div>
      </div>

    </template>

    <!-- ══ ADD / EDIT STAFF MODAL ══════════════════════════════════════════ -->
    <transition name="modal">
      <div v-if="staffModal.show" class="modal-backdrop" @click.self="staffModal.show = false">
        <div class="modal-box">
          <div class="modal-header">
            <div class="modal-title">{{ staffModal.editing ? 'Edit Staff' : 'Add Staff Member' }}</div>
            <button class="modal-close" @click="staffModal.show = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Full name *</label>
                <input class="form-input" v-model="staffModal.form.name" placeholder="e.g. Priya Sharma" />
                <span v-if="staffModal.errors.name" class="form-error">{{ staffModal.errors.name }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Role *</label>
                <select class="form-input" v-model="staffModal.form.role">
                  <option value="">Select role</option>
                  <option>Hair Stylist</option>
                  <option>Beauty Expert</option>
                  <option>Nail Technician</option>
                  <option>Receptionist</option>
                  <option>Trainee</option>
                  <option>Manager</option>
                </select>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Mobile number *</label>
                <input class="form-input" v-model="staffModal.form.mobile" placeholder="10-digit number" inputmode="numeric" maxlength="15" />
                <span v-if="staffModal.errors.mobile" class="form-error">{{ staffModal.errors.mobile }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Monthly salary (₹) *</label>
                <input class="form-input" type="number" v-model.number="staffModal.form.salary" placeholder="e.g. 15000" min="0" />
                <span v-if="staffModal.errors.salary" class="form-error">{{ staffModal.errors.salary }}</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Join date</label>
              <input class="form-input" type="date" v-model="staffModal.form.joinDate" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="staffModal.show = false">Cancel</button>
            <button class="btn-save" @click="saveStaff">
              {{ staffModal.editing ? 'Save changes' : 'Add staff member' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══ CHANGE PIN MODAL ════════════════════════════════════════════════ -->
    <transition name="modal">
      <div v-if="showPinModal" class="modal-backdrop" @click.self="showPinModal = false">
        <div class="modal-box" style="max-width:340px">
          <div class="modal-header">
            <div class="modal-title">Change Owner PIN</div>
            <button class="modal-close" @click="showPinModal = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Current PIN</label>
              <input class="form-input" type="password" inputmode="numeric" maxlength="6" v-model="pinChange.current" placeholder="••••" />
            </div>
            <div class="form-group">
              <label class="form-label">New PIN</label>
              <input class="form-input" type="password" inputmode="numeric" maxlength="6" v-model="pinChange.newPin" placeholder="••••" />
            </div>
            <div class="form-group">
              <label class="form-label">Confirm new PIN</label>
              <input class="form-input" type="password" inputmode="numeric" maxlength="6" v-model="pinChange.confirm" placeholder="••••" />
            </div>
            <p v-if="pinChange.error" class="form-error">{{ pinChange.error }}</p>
            <p v-if="pinChange.success" style="color:var(--color-success);font-size:12px">PIN changed successfully!</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showPinModal = false">Cancel</button>
            <button class="btn-save" @click="changePin">Change PIN</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useStaff } from '@/composables/useStaff'
import { useAuth } from '@/composables/useAuth'

/* ───────── AUTH (FIXED) ───────── */
const { isOwner, login } = useAuth()

const pinDigits = ref(['', '', '', ''])
const pinRefs = []
const pinError = ref(false)

function onPinInput(index) {
  pinError.value = false
  if (pinDigits.value[index] && index < 3) {
    pinRefs[index + 1]?.focus()
  }
}

function onPinBack(index) {
  if (!pinDigits.value[index] && index > 0) {
    pinRefs[index - 1]?.focus()
  }
}

function submitPin() {
  const enteredPin = pinDigits.value.join('')

  if (login(enteredPin)) {
    pinError.value = false
    pinDigits.value = ['', '', '', '']
  } else {
    pinError.value = true
    pinDigits.value = ['', '', '', '']
    pinRefs[0]?.focus()
  }
}

/* ───────── API ───────── */
const {
  staff,
  attendance,
  adjustments,
  paid,
  fetchStaff,
  saveStaff: apiSaveStaff,
  deleteStaff: apiDeleteStaff,
  saveAttendance: apiSaveAttendance,
  saveAdjustment: apiSaveAdjustment,
  markPaid: apiMarkPaid
} = useStaff()

const staffList = staff
const paidStatus = paid

/* ───────── MONTH ───────── */
const viewDate = ref(new Date())

const monthKey = computed(() => {
  const d = viewDate.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
})

onMounted(() => fetchStaff(monthKey.value))
watch(monthKey, (m) => fetchStaff(m))

/* ───────── STAFF MODAL ───────── */
const staffModal = reactive({
  show: false,
  editing: false,
  editId: null,
  form: { name: '', role: '', mobile: '', salary: '', joinDate: '' },
  errors: {}
})

function validateStaffForm() {
  const e = {}
  if (!staffModal.form.name.trim()) e.name = 'Required'
  if (!/^\d{7,15}$/.test(staffModal.form.mobile)) e.mobile = 'Invalid mobile'
  if (!staffModal.form.salary) e.salary = 'Required'
  staffModal.errors = e
  return Object.keys(e).length === 0
}

async function saveStaff() {
  if (!validateStaffForm()) return

  await apiSaveStaff({
    id: staffModal.editId || Date.now().toString(),
    ...staffModal.form
  })

  staffModal.show = false
  fetchStaff(monthKey.value)
}

async function deleteStaff(id) {
  if (!confirm('Delete staff?')) return
  await apiDeleteStaff(id)
  fetchStaff(monthKey.value)
}

/* ───────── ATTENDANCE ───────── */
function getKey(id) {
  return `${id}_${monthKey.value}`
}

async function toggleAtt(id, day) {
  const key = getKey(id)

  if (!attendance.value[key]) attendance.value[key] = {}

  const cur = attendance.value[key][day] || ''
  const cycle = ['', 'P', 'A', 'H']
  const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length]

  attendance.value[key][day] = next

  await apiSaveAttendance(id, monthKey.value, attendance.value[key])
}

/* ───────── AUTO SAVE PAYMENT ───────── */
watch(adjustments, (val) => {
  Object.keys(val).forEach(id => {
    apiSaveAdjustment(id, monthKey.value, val[id])
  })
}, { deep: true })

/* ───────── MARK PAID ───────── */
async function markPaid(s) {
  await apiMarkPaid(s.id, monthKey.value)
  fetchStaff(monthKey.value)
}

/* ───────── BONUS: AUTO SUBMIT PIN ───────── */
watch(pinDigits, (val) => {
  if (val.join('').length === 4) {
    submitPin()
  }
}, { deep: true })

/* ───────── TABS ───────── */
const activeTab = ref('staff')

const tabs = [
  { id: 'staff', label: 'Staff', icon: '👤' },
  { id: 'attendance', label: 'Attendance', icon: '📅' },
  { id: 'payment', label: 'Salary', icon: '💰' }
]

/* ───────── MONTH LOGIC ───────── */
function changeMonth(offset) {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() + offset)
  viewDate.value = d
}

const monthLabel = computed(() => {
  return viewDate.value.toLocaleString('default', { month: 'long', year: 'numeric' })
})

const daysInMonth = computed(() => {
  const d = viewDate.value
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
})

/* ───────── DATE HELPERS ───────── */
function isToday(day) {
  const today = new Date()
  return (
    today.getDate() === day &&
    today.getMonth() === viewDate.value.getMonth() &&
    today.getFullYear() === viewDate.value.getFullYear()
  )
}

function isSunday(day) {
  const d = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), day)
  return d.getDay() === 0
}

function weekdayShort(day) {
  const d = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), day)
  return d.toLocaleDateString('en-IN', { weekday: 'short' })
}

/* ───────── ATTENDANCE UI ───────── */
function attSymbol(id, day) {
  const key = getKey(id)
  return attendance.value[key]?.[day] || '–'
}

function attClass(id, day) {
  const v = attSymbol(id, day)
  return {
    'att-p': v === 'P',
    'att-a': v === 'A',
    'att-h': v === 'H'
  }
}

function attLabel(id, day) {
  return attSymbol(id, day)
}

/* ───────── COUNTING ───────── */
function presentCount(id) {
  const key = getKey(id)
  const data = attendance.value[key] || {}
  return Object.values(data).filter(v => v === 'P').length
}

function absentCount(id) {
  const key = getKey(id)
  const data = attendance.value[key] || {}
  return Object.values(data).filter(v => v === 'A').length
}

function halfCount(id) {
  const key = getKey(id)
  const data = attendance.value[key] || {}
  return Object.values(data).filter(v => v === 'H').length
}

/* ───────── SALARY CALCULATION ───────── */
const workingDays = computed(() => daysInMonth.value)

function perDay(s) {
  return Number(s.salary || 0) / workingDays.value
}

function earned(s) {
  const p = presentCount(s.id)
  const h = halfCount(s.id)
  return Math.round(perDay(s) * (p + h * 0.5))
}

function netPay(s) {
  const adj = adjustments.value[s.id] || {}
  return (
    earned(s) -
    (adj.advance || 0) +
    (adj.pending || 0) +
    (adj.bonus || 0)
  )
}

/* ───────── UI HELPERS ───────── */
function initials(name) {
  return name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

/* ───────── STAFF MODAL ───────── */
function openAddStaff() {
  staffModal.show = true
  staffModal.editing = false
  staffModal.editId = null
  staffModal.form = { name: '', role: '', mobile: '', salary: '', joinDate: '' }
}

function editStaff(s) {
  staffModal.show = true
  staffModal.editing = true
  staffModal.editId = s.id
  staffModal.form = { ...s }
}
</script>

<style scoped>
.staff-page { display: flex; flex-direction: column; gap: 20px; }

/* ── PIN gate ── */
.pin-gate {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(26,23,20,0.6);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
}
.pin-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 40px 36px;
  text-align: center;
  width: 340px;
  box-shadow: var(--shadow-lg);
}
.pin-icon {
  width: 60px; height: 60px; margin: 0 auto 16px;
  background: var(--color-accent-light); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-accent);
}
.pin-title { font-family: var(--font-display); font-size: 20px; margin-bottom: 6px; }
.pin-sub   { font-size: 13px; color: var(--color-text-muted); margin-bottom: 24px; }
.pin-inputs { display: flex; gap: 12px; justify-content: center; margin-bottom: 16px; }
.pin-digit {
  width: 52px; height: 56px; text-align: center;
  font-size: 22px; font-weight: 600;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  color: var(--color-text);
  outline: none; transition: border-color var(--transition);
}
.pin-digit:focus { border-color: var(--color-accent); }
.pin-digit--error { border-color: var(--color-danger); animation: shake .3s; }
@keyframes shake {
  0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)}
}
.pin-error  { font-size: 12px; color: var(--color-danger); margin-bottom: 12px; }
.pin-hint   { font-size: 11px; color: var(--color-text-light); margin-top: 12px; }
.pin-submit {
  width: 100%; padding: 11px;
  background: var(--color-accent); color: white; border: none;
  border-radius: var(--radius-md); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: background var(--transition);
}
.pin-submit:hover { background: var(--color-accent-hover); }

/* ── Tabs ── */
.tabs {
  display: flex; align-items: center; gap: 4px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 8px 12px;
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;
}
.tab {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 16px; border-radius: var(--radius-md);
  border: none; background: none; cursor: pointer;
  font-size: 13px; color: var(--color-text-muted);
  transition: background var(--transition), color var(--transition);
}
.tab:hover { background: var(--color-surface-2); color: var(--color-text); }
.tab--active { background: var(--color-accent-light); color: var(--color-accent); font-weight: 500; }
.tab-spacer { flex: 1; }
.btn-add-staff {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: var(--radius-md);
  background: var(--color-accent); color: white; border: none;
  font-size: 12px; font-weight: 500; cursor: pointer;
  transition: background var(--transition);
}
.btn-add-staff:hover { background: var(--color-accent-hover); }
.btn-pin-change {
  width: 32px; height: 32px; border-radius: var(--radius-md);
  border: 1px solid var(--color-border); background: none;
  color: var(--color-text-muted); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background var(--transition);
}
.btn-pin-change:hover { background: var(--color-surface-2); }

.tab-content { display: flex; flex-direction: column; gap: 16px; }

/* ── Staff grid ── */
.staff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
.staff-card {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: var(--shadow-sm); position: relative;
}
.staff-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 16px; font-weight: 600;
  font-family: var(--font-display); flex-shrink: 0;
}
.mini-avatar {
  width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 10px; font-weight: 600; flex-shrink: 0;
}
.staff-info { flex: 1; }
.staff-name  { font-size: 14px; font-weight: 500; }
.staff-role  { font-size: 12px; color: var(--color-text-muted); }
.staff-mobile{ font-size: 11px; color: var(--color-text-light); }
.staff-salary-info { text-align: right; }
.salary-label  { font-size: 10px; color: var(--color-text-light); }
.salary-amount { font-family: var(--font-display); font-size: 16px; font-weight: 500; color: var(--color-accent); }
.staff-actions { display: flex; gap: 6px; }
.icon-btn {
  width: 30px; height: 30px; border-radius: var(--radius-sm);
  border: 1px solid var(--color-border); background: none;
  color: var(--color-text-muted); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background var(--transition);
}
.icon-btn:hover { background: var(--color-surface-2); }
.icon-btn--danger { color: var(--color-danger); border-color: #F09595; }
.icon-btn--danger:hover { background: var(--color-danger-light); }

/* ── Month bar ── */
.month-bar {
  display: flex; align-items: center; gap: 12px;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 10px 16px;
  width: fit-content; box-shadow: var(--shadow-sm);
}
.date-nav-btn {
  width: 32px; height: 32px; border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); background: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text); transition: background var(--transition);
}
.date-nav-btn:hover { background: var(--color-surface-2); }
.month-label { font-family: var(--font-display); font-size: 16px; font-weight: 500; min-width: 160px; text-align: center; }

/* ── Attendance table ── */
.attendance-table-wrap {
  overflow-x: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.attendance-table {
  border-collapse: collapse; width: 100%; font-size: 11px;
}
.attendance-table th, .attendance-table td {
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  text-align: center; padding: 0;
}
.attendance-table th:last-child, .attendance-table td:last-child { border-right: none; }
.attendance-table thead th {
  background: var(--color-surface-2); padding: 8px 4px;
  font-weight: 500; color: var(--color-text-muted); font-size: 10px;
  position: sticky; top: 0; z-index: 2;
}
.att-name-col { min-width: 110px; text-align: left !important; padding: 0 8px !important; position: sticky; left: 0; z-index: 3; background: var(--color-surface); }
.att-day-col  { min-width: 30px; width: 30px; }
.att-total-col { min-width: 52px; font-weight: 600; }
.att-total--present { color: var(--color-success); }
.att-total--absent  { color: var(--color-danger); }
.att-day--today th, .att-day--today td { background: var(--color-accent-xlt, #FAF6F1); }
.att-day--sun  { color: var(--color-danger); opacity: 0.6; }
.day-num { font-size: 11px; font-weight: 600; }
.day-wd  { font-size: 9px; color: var(--color-text-light); }
.att-name-cell { display: flex; align-items: center; gap: 6px; padding: 8px 0; font-size: 12px; }
.att-btn {
  width: 28px; height: 28px; border: none; border-radius: 4px;
  font-size: 10px; font-weight: 700; cursor: pointer; background: var(--color-surface-2);
  color: var(--color-text-muted); transition: background var(--transition);
}
.att-btn.att-p { background: var(--color-success-light); color: var(--color-success); }
.att-btn.att-a { background: var(--color-danger-light);  color: var(--color-danger);  }
.att-btn.att-h { background: var(--color-warning-light); color: var(--color-warning); }
.att-legend { font-size: 11px; color: var(--color-text-muted); display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.leg-p,.leg-a,.leg-h { padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 10px; }
.leg-p { background: var(--color-success-light); color: var(--color-success); }
.leg-a { background: var(--color-danger-light);  color: var(--color-danger); }
.leg-h { background: var(--color-warning-light); color: var(--color-warning); }
.leg-o { color: var(--color-text-light); }

/* ── Payment grid ── */
.payment-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px; }
.payment-card {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 20px;
  box-shadow: var(--shadow-sm); position: relative; overflow: hidden;
}
.pay-header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.pay-grid   { display: flex; flex-direction: column; gap: 8px; }
.pay-row    { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
.pay-row--divider { border-top: 1px dashed var(--color-border); padding-top: 8px; margin-top: 4px; }
.pay-row--total   { border-top: 2px solid var(--color-border); padding-top: 10px; margin-top: 4px; }
.pay-label  { color: var(--color-text-muted); font-size: 12px; }
.pay-val    { font-weight: 500; }
.pay-val--ok    { color: var(--color-success); }
.pay-val--total { font-family: var(--font-display); font-size: 18px; color: var(--color-accent); }
.pay-input-wrap { display: flex; align-items: center; gap: 4px; }
.pay-currency   { font-size: 12px; color: var(--color-text-muted); }
.pay-input {
  width: 90px; padding: 4px 8px;
  border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  font-size: 13px; text-align: right; background: var(--color-surface-2);
  color: var(--color-text); outline: none;
}
.pay-input:focus { border-color: var(--color-accent); }
.pay-actions { display: flex; gap: 10px; margin-top: 16px; }
.btn-payslip, .btn-wa-pay {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px; border: none; border-radius: var(--radius-md);
  font-size: 12px; font-weight: 500; cursor: pointer; transition: background var(--transition);
}
.btn-payslip { background: var(--color-success-light); color: var(--color-success); }
.btn-payslip:hover { background: #B7E4CE; }
.btn-wa-pay  { background: #25D366; color: white; }
.btn-wa-pay:hover { background: #1da855; }
.paid-badge {
  position: absolute; top: 12px; right: 12px;
  display: flex; align-items: center; gap: 4px;
  background: var(--color-success-light); color: var(--color-success);
  padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600;
}

/* ── Modal ── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(10,8,6,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px;
}
.modal-box {
  background: var(--color-surface); border-radius: var(--radius-lg);
  border: 1px solid var(--color-border); width: 520px; max-width: 100%;
  max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 0;
}
.modal-title  { font-family: var(--font-display); font-size: 18px; font-weight: 500; }
.modal-close  {
  width: 32px; height: 32px; border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); background: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-muted);
}
.modal-close:hover { background: var(--color-surface-2); }
.modal-body   { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.modal-footer { padding: 0 24px 20px; display: flex; gap: 10px; justify-content: flex-end; }
.form-row-2   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group   { display: flex; flex-direction: column; gap: 5px; }
.form-label   { font-size: 12px; font-weight: 500; color: var(--color-text-muted); }
.form-input {
  padding: 9px 12px; border: 1px solid var(--color-border);
  border-radius: var(--radius-md); font-size: 14px;
  background: var(--color-surface); color: var(--color-text); outline: none;
  transition: border-color var(--transition);
}
.form-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(139,111,71,0.1); }
.form-error { font-size: 11px; color: var(--color-danger); }
.btn-cancel {
  padding: 9px 18px; border: 1px solid var(--color-border); border-radius: var(--radius-md);
  background: none; font-size: 13px; color: var(--color-text-muted); cursor: pointer;
}
.btn-save {
  padding: 9px 20px; border: none; border-radius: var(--radius-md);
  background: var(--color-accent); color: white; font-size: 13px;
  font-weight: 500; cursor: pointer; transition: background var(--transition);
}
.btn-save:hover { background: var(--color-accent-hover); }
.btn-primary {
  padding: 10px 20px; background: var(--color-accent); color: white;
  border: none; border-radius: var(--radius-md); cursor: pointer; font-size: 13px;
}

/* ── Transitions ── */
.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* ── Empty state ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 48px 24px; color: var(--color-text-muted); text-align: center;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .staff-grid    { grid-template-columns: 1fr; }
  .payment-grid  { grid-template-columns: 1fr; }
  .form-row-2    { grid-template-columns: 1fr; }
  .tabs          { flex-wrap: wrap; gap: 6px; }
  .tab-spacer    { display: none; }
  .month-label   { min-width: 120px; font-size: 14px; }
}
</style>