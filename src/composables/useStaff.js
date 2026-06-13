// composables/useStaff.js
import { ref } from 'vue'

export const API_URL = 'https://script.google.com/macros/s/AKfycbxu2e31nVqB-QcIid9yLwkGWvaLsfyMw-_58YihpyCWqHYNe55N1lqIDYEawXxlIHhj/exec'

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

  // ── PENDING SAVES TRACKER ────────────────────────────────────────────────────
  // Tracks in-flight attendance saves keyed by "staffId_day".
  // fetchStaff skips overwriting cells that have a pending save, preventing
  // the race condition where a slow fetch response resets a just-clicked cell.
  const _pendingSaves = new Set()

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
      // FIX: Skip cells with a pending in-flight save to prevent race condition
      // where a slow fetch response resets a cell the user just clicked.
      const rawAtt = attData.attendance || {}
      const newAtt = {}
      staff.value.forEach(s => {
        const sid   = String(s.id)
        // Preserve any cells that are currently being saved
        newAtt[sid] = { ...(attendance.value[sid] || {}) }
        const fromSheet = rawAtt[sid] || rawAtt[s.id] || {}
        // Apply sheet values, but skip cells with pending saves
        Object.entries(fromSheet).forEach(([day, status]) => {
          const dNum = Number(day)
          if (!_pendingSaves.has(`${sid}_${dNum}`)) {
            if (status) newAtt[sid][dNum] = status
            else        delete newAtt[sid][dNum]
          }
        })
        // Clear days the sheet no longer has (deleted rows), skip pending saves
        Object.keys(newAtt[sid]).forEach(day => {
          const dNum = Number(day)
          if (!_pendingSaves.has(`${sid}_${dNum}`) && !fromSheet[day] && !fromSheet[dNum]) {
            delete newAtt[sid][dNum]
          }
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
    const sid  = String(staffId)
    const dNum = Number(day)
    const pKey = `${sid}_${dNum}`
    _pendingSaves.add(pKey)           // block fetch from overwriting this cell
    try {
      const params = new URLSearchParams({
        action:  'attendanceSave',
        staffId: sid,
        month,
        day:     String(dNum),
        status:  status || ''
      })
      const res  = await fetch(`${API_URL}?${params}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Save failed')
      return true
    } catch (err) {
      console.error('saveAttendanceCell error:', err)
      return false
    } finally {
      _pendingSaves.delete(pKey)      // unblock future fetches for this cell
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