import { ref } from 'vue'

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Replace this URL with your Google Apps Script Web App URL
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzCskNjuFmWOcJtVVgfaWPfyaDQi4qV-pY81hCQ93xSI8xSA0aYExQQhxilaqVAKQopnA/exec'

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
export const TIME_SLOTS = [
  '10:00','10:30','11:00','11:30',
  '12:00','12:30',
  '1:00','1:30','2:00','2:30',
  '3:00','3:30','4:00','4:30',
  '5:00','5:30','6:00','6:30',
  '7:00','7:30','8:00'
]

export const CHAIRS = [
  { id: 'hair1',   label: 'Hair — Chair 1',   type: 'hair'   },
  { id: 'hair2',   label: 'Hair — Chair 2',   type: 'hair'   },
  { id: 'beauty1', label: 'Beauty — Chair 1', type: 'beauty' },
  { id: 'beauty2', label: 'Beauty — Chair 2', type: 'beauty' },
]

export const HAIR_SERVICES = [
  'Hair Cut', 'Root Touch-up', 'Hair Spa', 'Botox Treatment',
  'Keratin', 'Blow-dry', 'Hair Colour', 'Highlights',
  'Straightening', 'Balayage'
]

export const BEAUTY_SERVICES = [
  'Facial', 'Waxing', 'Threading', 'D-Tan',
  'Manicure', 'Pedicure', 'Bridal Makeup', 'Cleanup',
  'Eyebrows', 'Lip Wax'
]

const STORAGE_KEY = 'scintillate_bookings_v1'

// ─── COMPOSABLE ──────────────────────────────────────────────────────────────
export function useBookings() {
  const isLoading = ref(false)
  const isSaving  = ref(false)
  const error     = ref(null)

  function loadAll() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
    catch { return {} }
  }

  function saveAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function dateKey(date) {
    return new Date(date).toLocaleDateString('en-IN')
  }

  function getBookingsForDate(date) {
    const all = loadAll()
    return all[dateKey(date)] || {}
  }

  async function syncToSheet(payload) {
    if (!APPS_SCRIPT_URL) return
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
    } catch (e) {
      console.error('❌ API Error:', e)
    }
}

  async function addBooking(date, slotKey, booking) {
    isSaving.value = true
    error.value = null
    try {
      const all = loadAll()
      if (!all[dateKey(date)]) all[dateKey(date)] = {}

      // optional: prevent double booking
      if (all[dateKey(date)][slotKey]) {
        throw new Error('Slot already booked')
      }
      const newBooking = {
        ...booking,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }

      all[dateKey(date)][slotKey] = newBooking
      saveAll(all)

      await syncToSheet({
        action: 'add',
        date: dateKey(date),
        slotKey,
        ...newBooking
      })

      return true

    } catch (e) {
      error.value = e.message
      console.error('❌ Booking failed:', e.message)
      return false

    } finally {
      isSaving.value = false
    }
  }

  async function deleteBooking(date, slotKey) {
    const all = loadAll()
    if (all[dateKey(date)]) {
      delete all[dateKey(date)][slotKey]
      saveAll(all)
      await syncToSheet({ action: 'delete', date: dateKey(date), slotKey })
    }
  }

  function getStats() {
    const all = loadAll()
    const today = dateKey(new Date())
    const todayData = all[today] || {}
    const todayBookings = Object.values(todayData)

    const last7 = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const k = dateKey(d)
      const count = Object.keys(all[k] || {}).length
      last7.push({
        label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        count
      })
    }

    const serviceCounts = {}
    Object.values(all).forEach(dayData => {
      Object.values(dayData).forEach(b => {
        const svcs = (b.services || b.service || '').split(',').map(s => s.trim())
        svcs.forEach(s => { if (s) serviceCounts[s] = (serviceCounts[s] || 0) + 1 })
      })
    })
    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    const totalAllTime = Object.values(all).reduce((sum, d) => sum + Object.keys(d).length, 0)
    const uniqueClients = new Set()
    Object.values(all).forEach(d => Object.values(d).forEach(b => { if (b.mobile) uniqueClients.add(b.mobile) }))

    return {
      todayTotal: todayBookings.length,
      todayHair: todayBookings.filter(b => b.chairType === 'hair').length,
      todayBeauty: todayBookings.filter(b => b.chairType === 'beauty').length,
      totalAllTime,
      uniqueClients: uniqueClients.size,
      last7,
      topServices,
    }
  }

  return {
    isLoading, isSaving, error,
    getBookingsForDate,
    addBooking,
    deleteBooking,
    getStats,
    dateKey,
    loadAll,
  }
}
