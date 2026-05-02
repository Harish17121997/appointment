import { ref } from 'vue'

//  Your deployed Apps Script URL
export const API_URL = 'https://script.google.com/macros/s/AKfycbx3lXRJdgP7uHFqU82c7T0kxDPW3HEWUcB3LpyGrGlAKpMFIckpWFzuFLSDuGvfzQzDTQ/exec'

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
export const TIME_SLOTS = [
  '11:00','11:30','12:00','12:30',
  '1:00','1:30','2:00','2:30',
  '3:00','3:30','4:00','4:30',
  '5:00','5:30','6:00','6:30',
  '7:00','7:30','8:00'
]

export const CHAIRS = [
  { id: 'hair1',   label: 'Lucky',   type: 'hair' },
  { id: 'hair2',   label: 'Shaad',   type: 'hair' },
  { id: 'beauty1', label: 'Priyanka', type: 'beauty' },
  { id: 'beauty2', label: 'Surabhi', type: 'beauty' },
]

export const HAIR_SERVICES = [
  'Hair Cut','Root Touch-up','Hair Spa','Botox Treatment',
  'Keratin','Blow-dry','Hair Colour','Highlights',
  'Straightening','Balayage'
]

export const BEAUTY_SERVICES = [
  'Facial','Waxing','Threading','D-Tan',
  'Manicure','Pedicure','Bridal Makeup','Cleanup',
  'Eyebrows','Lip Wax'
]

// ─── COMPOSABLE ──────────────────────────────────────────────────────────────
export function useBookings() {
  const isLoading = ref(false)
  const isSaving  = ref(false)
  const apiError  = ref('')

  // 🔥 FIXED: MATCH BACKEND FORMAT (DD-MM-YYYY)
  function dateKey(date) {
    const d   = date instanceof Date ? date : new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const mon = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}-${mon}-${d.getFullYear()}`   // ✅ FIXED
  }

  // ─── FETCH bookings ────────────────────────────────────────────────────────
  async function getBookingsForDate(date) {
    isLoading.value = true
    apiError.value  = ''

    try {
      const key = dateKey(date)

      const res  = await fetch(`${API_URL}?action=fetch&date=${key}`)
      const json = await res.json()

      return json.data || {}

    } catch (err) {
      console.error('Fetch error:', err)
      apiError.value = 'Failed to load bookings.'
      return {}
    } finally {
      isLoading.value = false
    }
  }

  // ─── STATS ────────────────────────────────────────────────────────────────
  async function getStats() {
    isLoading.value = true
    apiError.value = ''

    try {
      const res = await fetch(`${API_URL}?action=stats`)
      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Stats failed')
      }
      return data

    } catch (err) {
      console.error('Stats fetch error:', err)
      apiError.value = 'Failed to load stats.'
      return emptyStats()
    } finally {
      isLoading.value = false
    }
  }

  function emptyStats() {
    const last7 = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      last7.push({
        label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        count: 0,
        isToday: i === 0
      })
    }
    return {
      todayTotal: 0,
      todayHair: 0,
      todayBeauty: 0,
      uniqueClients: 0,
      totalAll: 0,
      last7,
      topServices: [],
      todayBookings: []
    }
  }

  // ─── ADD booking ──────────────────────────────────────────────────────────
  async function addBooking(date, slotKey, data) {
    isSaving.value = true
    apiError.value = ''

    try {
      const params = new URLSearchParams({
        action:    'add',
        date:      dateKey(date),   // ✅ FIXED FORMAT
        slotKey,
        chairType: data.chairType,
        name:      data.name,
        mobile:    data.mobile,
        services:  data.services,
        notes:     data.notes || '',
        scheduleReminder: data.scheduleReminder ? '1' : '0'
      })

      const res  = await fetch(`${API_URL}?${params.toString()}`)
      const json = await res.json()

      return json.success !== false

    } catch (err) {
      console.error('Add booking error:', err)
      apiError.value = 'Failed to save booking.'
      return false
    } finally {
      isSaving.value = false
    }
  }

  // ─── DELETE booking ───────────────────────────────────────────────────────
  async function deleteBooking(date, slotKey) {
    isLoading.value = true

    try {
      const params = new URLSearchParams({
        action: 'delete',
        date: dateKey(date),   // ✅ FIXED FORMAT
        slotKey
      })

      await fetch(`${API_URL}?${params.toString()}`)

    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    isSaving,
    apiError,
    getBookingsForDate,
    addBooking,
    deleteBooking,
    getStats,
    dateKey
  }
}