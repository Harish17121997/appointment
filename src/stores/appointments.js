import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ── Google Apps Script backend URL ─────────────────────────────────────────
// Replace with your deployed Apps Script URL
export const API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'

export const HAIR_SERVICES = [
  'Hair Cut', 'Root Touch-up', 'Hair Spa', 'Botox Treatment',
  'Keratin Treatment', 'Blow-dry', 'Hair Colour', 'Highlights', 'Balayage'
]
export const BEAUTY_SERVICES = [
  'Facial', 'Waxing', 'Threading', 'D-Tan', 'Manicure',
  'Pedicure', 'Bridal Makeup', 'Party Makeup', 'Cleanup', 'Head Massage'
]
export const CHAIRS = ['hair1', 'hair2', 'beauty1', 'beauty2']
export const CHAIR_LABELS = {
  hair1: 'Hair — Chair 1',
  hair2: 'Hair — Chair 2',
  beauty1: 'Beauty — Chair 1',
  beauty2: 'Beauty — Chair 2'
}

// 10:00 AM to 8:00 PM in 30-min slots
export const TIME_SLOTS = (() => {
  const slots = []
  for (let h = 10; h <= 19; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`)
    slots.push(`${h.toString().padStart(2, '0')}:30`)
  }
  slots.push('20:00')
  return slots
})()

function storageKey(date) {
  return `salon_${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`
}

export const useAppointmentStore = defineStore('appointments', () => {
  const allData = ref(JSON.parse(localStorage.getItem('salon_all_v1') || '{}'))

  function persist() {
    localStorage.setItem('salon_all_v1', JSON.stringify(allData.value))
  }

  function getBookings(date) {
    return allData.value[storageKey(date)] || {}
  }

  function addBooking(date, time, chair, booking) {
    const key = storageKey(date)
    if (!allData.value[key]) allData.value[key] = {}
    allData.value[key][`${time}_${chair}`] = {
      ...booking,
      time,
      chair,
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      bookedAt: new Date().toISOString()
    }
    persist()
    syncToSheet(date, time, chair, booking)
  }

  function removeBooking(date, slotKey) {
    const key = storageKey(date)
    if (allData.value[key]) {
      delete allData.value[key][slotKey]
      persist()
    }
  }

  // Stats for dashboard
  const todayStats = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const bookings = getBookings(today)
    const entries = Object.values(bookings)
    return {
      total: entries.length,
      hair: entries.filter(b => b.chair && b.chair.startsWith('hair')).length,
      beauty: entries.filter(b => b.chair && b.chair.startsWith('beauty')).length,
      free: TIME_SLOTS.length * 4 - entries.length
    }
  })

  // Upcoming appointments today (not yet passed)
  const upcomingToday = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const bookings = getBookings(today)
    const now = new Date()
    return Object.entries(bookings)
      .map(([key, val]) => ({ slotKey: key, ...val }))
      .filter(b => {
        const [h, m] = b.time.split(':').map(Number)
        const apptTime = new Date()
        apptTime.setHours(h, m, 0, 0)
        return apptTime > now
      })
      .sort((a, b) => a.time.localeCompare(b.time))
  })

  // Weekly stats — last 7 days
  const weeklyStats = computed(() => {
    const stats = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const bookings = getBookings(d)
      const entries = Object.values(bookings)
      stats.push({
        label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        total: entries.length,
        hair: entries.filter(b => b.chair && b.chair.startsWith('hair')).length,
        beauty: entries.filter(b => b.chair && b.chair.startsWith('beauty')).length,
      })
    }
    return stats
  })

  // Sync to Google Sheet
  async function syncToSheet(date, time, chair, booking) {
    if (API_URL.includes('YOUR_SCRIPT_ID')) return
    try {
      await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'add',
          date: date.toLocaleDateString('en-IN'),
          time,
          chair: CHAIR_LABELS[chair],
          name: booking.name,
          mobile: booking.mobile,
          service: booking.service
        })
      })
    } catch (e) {
      console.warn('Sheet sync failed:', e)
    }
  }

  return {
    allData, getBookings, addBooking, removeBooking,
    todayStats, upcomingToday, weeklyStats
  }
})
