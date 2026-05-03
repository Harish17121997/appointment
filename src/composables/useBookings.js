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
  { id: 'hair1',   label: 'Lucky',    type: 'hair' },
  { id: 'hair2',   label: 'Shaad',    type: 'hair' },
  { id: 'beauty1', label: 'Priyanka', type: 'beauty' },
  { id: 'beauty2', label: 'Surabhi',  type: 'beauty' },
]

// ─── HAIR SERVICES ───────────────────────────────────────────────────────────
// All names match the billing catalogue exactly → price auto-lookup works.
export const HAIR_SERVICES = [
  // Haircut & Trim
  "Women's Hair Trim",
  "Men's Haircut",
  "Kids Haircut - Boys",
  "Kids Haircut - Girls",

  // Wash & Blow Dry
  "Women's Hair Wash & Blow Dry",
  "Women's Hair Wash & Blast Dry",
  "Women's Treatment Hair Wash & Blow Dry",
  "Women's Express Filler Hair Wash & Blow Dry",
  "Men's Hair Wash",

  // Styling
  "Hair Styling - Ironing",
  "Hair Styling - Tongs",
  "Hair Styling - Basic Up Do",

  // Hair Spa
  "Basic Hair Spa - Short Length",
  "Basic Hair Spa - Medium Length",
  "Basic Hair Spa - Long Length",
  "Luxury Hair Spa - Short Length",
  "Luxury Hair Spa - Medium Length",
  "Luxury Hair Spa - Long Length",
  "Dandruff Hair Spa",
  "Shea Hair Spa",
  "Men's Hair Spa",
  "Men's Premium Hair Spa",

  // Smoothening / Botoliss / Botorepair
  "Botoliss Short",
  "Botoliss - Medium Length",
  "Botoliss - Long Length",
  "Botorepair Treatment Short Hair",
  "Botorepair Treatment Medium Length",
  "Botorepair Treatment Long Length",

  // Root Touch-Up
  "Root Touch Up Loreal upto 1 inch",
  "Root Touchup Loreal Ammonia Free",
  "Root Touch Up Schwarzkopf",
  "Root Touch Up Schwarzkopf Ammonia Free",

  // Hair Colour
  "Men's Hair Color",
  "Men's Hair Color Ammonia Free",
  "Global Hair Color Short Length Loreal",
  "Global Hair Color Loreal Medium Length",
  "Global Hair Color Loreal Long Length",
  "Global Hair Color Schwarzkopf Short Hair",
  "Global Hair Color Schwarzkopf Medium Length",
  "Global Hair Color Schwarzkopf Long Length",

  // Highlights & Balayage
  "Global Highlights",
  "Balayage Hair Colour",
  "Balayage Long Length",
]

// ─── BEAUTY SERVICES ─────────────────────────────────────────────────────────
export const BEAUTY_SERVICES = [
  // Facial & Cleanup
  "Fruit Clean Up",
  "Kanpeki Cleanup",
  "Fruit Facial",
  "Gold Facial",
  "Kanpeki Luxury Facial",
  "O3 Shine & Glow",
  "Bridal Facial O3 Professional",

  // Skin
  "D-Tan",
  "Acne Treatment",
  "Hydration Booster Therapy",

  // Body
  "Body Polishing",
  "Arms Polishing",
  "Back Polishing",
  "Legs Polishing",

  // Waxing
  "Rica Wax - Underarms",
  "Rica Wax - Stomach",
  "Rica Wax - Half Leg",
  "Rica Wax - Full Hands",
  "Rica Wax - Hands + Underarms",
  "Rica Wax - Full Legs",
  "Back Wax",
  "Full Body Wax",
  "Brazilian Wax - Upper Lips",
  "Brazilian Wax - Side Locks",
  "Brazilian Wax - Eyebrows",
  "Brazilian Wax - Bikini",

  // Threading
  "Threading Upper Lips",
  "Threading Chin",
  "Threading Side Locks",
  "Threading Eyebrows",
  "Threading Full Face",

  // Manicure & Pedicure
  "Basic Manicure",
  "Luxury Manicure",
  "Basic Pedicure",
  "Luxury Pedicure",
  "O3 Pedicure",

  // Massage
  "Foot Massage",
  "Head Massage",
  "Head Massage with Wash",
  "Back Massage",
  "Scientific Combing",

  // Bridal
  "Bridal Makeup",
]

// ─── SERVICE ALIAS MAP ────────────────────────────────────────────────────────
// Maps old short/generic booking names → closest catalogue name.
// Used by Services.vue prefillBill() when coming from a legacy appointment.
export const SERVICE_ALIAS_MAP = {
  // Hair
  'hair cut':           "Women's Hair Trim",
  'haircut':            "Women's Hair Trim",
  'root touch-up':      "Root Touch Up Loreal upto 1 inch",
  'root touch up':      "Root Touch Up Loreal upto 1 inch",
  'hair spa':           "Basic Hair Spa - Short Length",
  'botox treatment':    "Botorepair Treatment Short Hair",
  'keratin':            "Botoliss Short",
  'blow-dry':           "Women's Hair Wash & Blow Dry",
  'blow dry':           "Women's Hair Wash & Blow Dry",
  'blowdry':            "Women's Hair Wash & Blow Dry",
  'hair colour':        "Global Hair Color Short Length Loreal",
  'hair color':         "Global Hair Color Short Length Loreal",
  'highlights':         "Global Highlights",
  'straightening':      "Botoliss Short",
  'balayage':           "Balayage Hair Colour",

  // Beauty
  'facial':             "Fruit Facial",
  'waxing':             "Rica Wax - Full Hands",
  'threading':          "Threading Full Face",
  'd-tan':              "D-Tan",
  'dtan':               "D-Tan",
  'manicure':           "Basic Manicure",
  'pedicure':           "Basic Pedicure",
  'bridal makeup':      "Bridal Makeup",
  'cleanup':            "Fruit Clean Up",
  'clean up':           "Fruit Clean Up",
  'eyebrows':           "Threading Eyebrows",
  'lip wax':            "Brazilian Wax - Upper Lips",
}

// ─── COMPOSABLE ──────────────────────────────────────────────────────────────
export function useBookings() {
  const isLoading = ref(false)
  const isSaving  = ref(false)
  const apiError  = ref('')

  function dateKey(date) {
    const d   = date instanceof Date ? date : new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const mon = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}-${mon}-${d.getFullYear()}`
  }

  async function getBookingsForDate(date) {
    isLoading.value = true
    apiError.value  = ''
    try {
      const key  = dateKey(date)
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

  async function getStats() {
    isLoading.value = true
    apiError.value  = ''
    try {
      const res  = await fetch(`${API_URL}?action=stats`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Stats failed')
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
      todayTotal: 0, todayHair: 0, todayBeauty: 0,
      uniqueClients: 0, totalAll: 0,
      last7, topServices: [], todayBookings: []
    }
  }

  async function addBooking(date, slotKey, data) {
    isSaving.value = true
    apiError.value = ''
    try {
      const params = new URLSearchParams({
        action:    'add',
        date:      dateKey(date),
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

  async function deleteBooking(date, slotKey) {
    isLoading.value = true
    try {
      const params = new URLSearchParams({
        action: 'delete',
        date:   dateKey(date),
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
    isLoading, isSaving, apiError,
    getBookingsForDate, addBooking, deleteBooking,
    getStats, dateKey
  }
}