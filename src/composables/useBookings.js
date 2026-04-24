import { ref } from 'vue'

// ✅ Your deployed Apps Script URL
export const API_URL = 'https://script.google.com/macros/s/AKfycbznWn8bqGUGVcl2LSKNTaEChHIfbqRVpVsNd_kDu19F80WGZbLfUiDVxGCp-ncj7Bq9yg/exec'

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
  { id: 'hair1',   label: 'Hair — Chair 1',   type: 'hair' },
  { id: 'hair2',   label: 'Hair — Chair 2',   type: 'hair' },
  { id: 'beauty1', label: 'Beauty — Chair 1', type: 'beauty' },
  { id: 'beauty2', label: 'Beauty — Chair 2', type: 'beauty' },
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
  const isSaving = ref(false)

  function dateKey(date) {
    return new Date(date).toLocaleDateString('en-IN')
  }

  // ✅ FETCH
  async function getBookingsForDate(date) {
    try {
      const res = await fetch(`${API_URL}?action=fetch&date=${encodeURIComponent(dateKey(date))}`)
      const json = await res.json()
      return json.data || {}
    } catch (err) {
      console.error(err)
      return {}
    }
  }

  // ✅ ADD
  async function addBooking(date, slotKey, data) {
    try {
      const url = `${API_URL}?action=add&date=${encodeURIComponent(dateKey(date))}&slotKey=${encodeURIComponent(slotKey)}&chairType=${encodeURIComponent(data.chairType)}&name=${encodeURIComponent(data.name)}&mobile=${encodeURIComponent(data.mobile)}&services=${encodeURIComponent(data.services)}&notes=${encodeURIComponent(data.notes || '')}`
      await fetch(url)
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  // ✅ DELETE
  async function deleteBooking(date, slotKey) {
    try {
      await fetch(`${API_URL}?action=delete&date=${encodeURIComponent(dateKey(date))}&slotKey=${encodeURIComponent(slotKey)}`)
    } catch (err) {
      console.error(err)
    }
  }

  return {
    isSaving,
    getBookingsForDate,
    addBooking,
    deleteBooking,
    dateKey
  }
}