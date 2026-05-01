// composables/useStaff.js
import { ref } from 'vue'

export const API_URL = 'https://script.google.com/macros/s/AKfycbxqjjlFQX3k7VyAxImzOJHDRbxBW_ZaBrQGrc3vJ0oIY3TFn9KPI_F0LSdWbMqZovX0jw/exec'

export function useStaff() {
  // staff list
  const staff = ref([])

  // attendance: keyed by STRING staffId → { day: 'P'|'A'|'H'|'' }
  // e.g. { "1777490539288": { 1: "P", 3: "A" } }
  const attendance = ref({})

  // adjustments: keyed by STRING staffId → { advance, pending, bonus }
  // e.g. { "1777490539288": { advance: 500, pending: 0, bonus: 0 } }
  const adjustments = ref({})

  // paid: keyed by "staffId_YYYY-MM" → true/false
  // e.g. { "1777490539288_2026-04": true }
  const paid = ref({})

  const isLoading = ref(false)
  const isSaving  = ref(false)
  const error     = ref('')

  // ─── FETCH ALL DATA FOR A MONTH ──────────────────────────────────────────────
  async function fetchStaff(month) {
    isLoading.value = true
    error.value     = ''
    try {
      const [staffRes, attRes, payRes] = await Promise.all([
        fetch(`${API_URL}?action=staffGet`),
        fetch(`${API_URL}?action=attendanceGet&month=${encodeURIComponent(month)}`),
        fetch(`${API_URL}?action=paymentGet&month=${encodeURIComponent(month)}`)
      ])

      const staffData = await staffRes.json()
      const attData   = await attRes.json()
      const payData   = await payRes.json()

      staff.value = staffData.staff || []

      // ── Attendance: Apps Script returns { staffId: { day: status } }
      // Keys from sheet are staffId strings. Ensure every loaded staff has an entry.
      const rawAtt = attData.attendance || {}
      const newAtt = {}
      staff.value.forEach(s => {
        const sid      = String(s.id)
        newAtt[sid]    = {}
        // rawAtt keys may be numbers or strings — normalise
        const fromSheet = rawAtt[sid] || rawAtt[s.id] || {}
        Object.entries(fromSheet).forEach(([day, status]) => {
          if (status) newAtt[sid][Number(day)] = status  // Number key, skip empty
        })
      })
      attendance.value = newAtt

      // ── Payments
      const rawPay = payData.payments || {}
      const newAdj = {}
      const newPaid = {}
      staff.value.forEach(s => {
        const sid  = String(s.id)
        const p    = rawPay[sid] || rawPay[s.id] || {}
        newAdj[sid] = {
          advance: Number(p.advance || 0),
          pending: Number(p.pending || 0),
          bonus:   Number(p.bonus   || 0)
        }
        newPaid[sid + '_' + month] = p.paid === true || p.paid === 'TRUE' || p.paid === true
      })
      adjustments.value = newAdj
      paid.value        = newPaid

    } catch (err) {
      console.error('fetchStaff error:', err)
      error.value = 'Failed to load staff data. Check your connection.'
    } finally {
      isLoading.value = false
    }
  }

  // ─── SAVE / UPDATE STAFF MEMBER ──────────────────────────────────────────────
  async function saveStaff(payload) {
    isSaving.value = true
    error.value    = ''
    try {
      const params = new URLSearchParams({ action: 'staffSave', ...payload })
      const res    = await fetch(`${API_URL}?${params}`)
      return await res.json()
    } catch (err) {
      console.error('saveStaff error:', err)
      error.value = 'Failed to save staff.'
    } finally {
      isSaving.value = false
    }
  }

  // ─── DELETE STAFF MEMBER ─────────────────────────────────────────────────────
  async function deleteStaff(id) {
    try {
      await fetch(`${API_URL}?action=staffDelete&id=${encodeURIComponent(id)}`)
    } catch (err) {
      console.error('deleteStaff error:', err)
    }
  }

  // ─── SAVE ONE ATTENDANCE CELL (called on every toggle → instant save) ────────
  async function saveAttendanceCell(staffId, month, day, status) {
    try {
      const params = new URLSearchParams({
        action:  'attendanceSave',
        staffId: String(staffId),
        month,
        day:     String(day),
        status:  status || ''
      })
      await fetch(`${API_URL}?${params}`)
    } catch (err) {
      console.error('saveAttendanceCell error:', err)
    }
  }

  // ─── SAVE PAYMENT ADJUSTMENTS ────────────────────────────────────────────────
  async function saveAdjustment(staffId, month, adj, isPaid) {
    try {
      const params = new URLSearchParams({
        action:  'paymentSave',
        staffId: String(staffId),
        month,
        advance: Number(adj?.advance || 0),
        pending: Number(adj?.pending || 0),
        bonus:   Number(adj?.bonus   || 0),
        paid:    isPaid ? 'true' : 'false'
      })
      await fetch(`${API_URL}?${params}`)
    } catch (err) {
      console.error('saveAdjustment error:', err)
    }
  }

  // ─── MARK SALARY AS PAID ─────────────────────────────────────────────────────
  async function markPaid(staffId, month) {
    const sid  = String(staffId)
    const adj  = adjustments.value[sid] || { advance: 0, pending: 0, bonus: 0 }
    // Instant UI update
    paid.value[sid + '_' + month] = true
    await saveAdjustment(sid, month, adj, true)
  }

  return {
    staff,
    attendance,
    adjustments,
    paid,
    isLoading,
    isSaving,
    error,
    fetchStaff,
    saveStaff,
    deleteStaff,
    saveAttendanceCell,
    saveAdjustment,
    markPaid
  }
}