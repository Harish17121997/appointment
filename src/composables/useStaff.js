// composables/useStaff.js
import { ref } from 'vue'


export const API_URL = 'https://script.google.com/macros/s/AKfycbwonxYpGYpd7TlU86pTY213m6izJ6yH-TUfZbc7fxDON6vycpT0v8Hh0lCb4cPeC6hPvg/exec'

export function useStaff() {
  const staff = ref([])
  const attendance = ref({})
  const adjustments = ref({})
  const paid = ref({})

  const isLoading = ref(false)
  const error = ref('')

  // ✅ FETCH ALL DATA
  async function fetchStaff(month) {
    isLoading.value = true
    try {
      const [staffRes, attRes, payRes] = await Promise.all([
        fetch(`${API_URL}?action=staffGet`),
        fetch(`${API_URL}?action=attendanceGet&month=${month}`),
        fetch(`${API_URL}?action=paymentGet&month=${month}`)
      ])

      const staffData = await staffRes.json()
      const attData = await attRes.json()
      const payData = await payRes.json()

      staff.value = staffData.staff || []
      attendance.value = attData.attendance || {}

      // convert payments
      adjustments.value = {}
      paid.value = {}

      Object.keys(payData.payments || {}).forEach(id => {
        adjustments.value[id] = {
          advance: payData.payments[id].advance || 0,
          pending: payData.payments[id].pending || 0,
          bonus: payData.payments[id].bonus || 0
        }

        paid.value[id + '_' + month] = payData.payments[id].paid
      })

    } catch (err) {
      console.error(err)
      error.value = 'Failed to load'
    } finally {
      isLoading.value = false
    }
  }

  // ✅ STAFF SAVE
  async function saveStaff(payload) {
    const params = new URLSearchParams({
      action: 'staffSave',
      ...payload
    })
    await fetch(`${API_URL}?${params}`)
  }

  // ✅ DELETE
  async function deleteStaff(id) {
    await fetch(`${API_URL}?action=staffDelete&id=${id}`)
  }

  // ✅ SAVE ATTENDANCE (FIXED)
  async function saveAttendance(id, month, att) {
    const requests = Object.keys(att).map(day => {
        return fetch(`${API_URL}?action=attendanceSave&staffId=${id}&month=${month}&day=${day}&status=${att[day]}`)
    })

    await Promise.all(requests) // ✅ parallel (FAST)
  }

  // ✅ SAVE PAYMENT (FIXED)
  async function saveAdjustment(id, month, adj) {
    if (!adj) return
    await fetch(`${API_URL}?action=paymentSave&staffId=${id}&month=${month}&advance=${adj.advance || 0}&pending=${adj.pending || 0}&bonus=${adj.bonus || 0}&paid=${paid.value[id + '_' + month] || false}`)
  }

  // ✅ MARK PAID (FIXED)
  async function markPaid(id, month) {
    const adj = adjustments.value[id] || {}

    await fetch(`${API_URL}?action=paymentSave&staffId=${id}&month=${month}&advance=${adj.advance || 0}&pending=${adj.pending || 0}&bonus=${adj.bonus || 0}&paid=true`)

    paid.value[id + '_' + month] = true // ✅ instant UI update
  }

  return {
    staff,
    attendance,
    adjustments,
    paid,
    isLoading,
    error,
    fetchStaff,
    saveStaff,
    deleteStaff,
    saveAttendance,
    saveAdjustment,
    markPaid
  }
}