// ─── useWhatsApp.js ───────────────────────────────────────────────────────────
// Handles WhatsApp reminder messages and daily summaries

import { ref, onUnmounted } from 'vue'

export function useWhatsApp() {
  const reminderTimers = ref([]) // store active timer IDs

  // ── Format phone number for wa.me ─────────────────────────────────────────
  function formatPhone(mobile) {
    // Remove all non-digits
    let digits = mobile.replace(/\D/g, '')
    // Add India country code if not present
    if (digits.length === 10) digits = '91' + digits
    return digits
  }

  // ── Build reminder message ─────────────────────────────────────────────────
  function buildReminderMessage(booking, time, chairLabel) {
    const msg =
      `Hello *${booking.name}* 👋\n\n` +
      `This is a reminder from *Scintillate Unisex Salon* ✂️\n\n` +
      `Your appointment is in *15 minutes*!\n\n` +
      `📅 Time: *${time}*\n` +
      `💇 Service: *${booking.services}*\n` +
      `🪑 ${chairLabel}\n\n` +
      `We look forward to seeing you! If you need to reschedule, please call us.\n\n` +
      `📍 Scintillate Unisex Salon`
    return msg
  }

  // ── Send WhatsApp message (opens wa.me link) ───────────────────────────────
  function openWhatsApp(mobile, message) {
    const phone = formatPhone(mobile)
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  // ── Manually send reminder for a booking ──────────────────────────────────
  function sendReminder(booking, time, chairLabel) {
    const msg = buildReminderMessage(booking, time, chairLabel)
    openWhatsApp(booking.mobile, msg)
  }

  // ── Schedule auto-reminder (runs 15 min before appointment) ───────────────
  function scheduleReminder(booking, time, chairLabel, date) {
    const [hourStr, minStr] = time.includes(':') ? time.split(':') : [time, '00']
    let hour = parseInt(hourStr)
    const min = parseInt(minStr)

    // Convert 12h display (1:00 = 13:00 if pm) — slots after 12:00 are PM
    const slotIndex = parseInt(hourStr)
    if (slotIndex < 10) hour = slotIndex + 12 // 1:00 → 13:00, etc.

    const appointmentTime = new Date(date)
    appointmentTime.setHours(hour, min, 0, 0)

    const reminderTime = new Date(appointmentTime.getTime() - 15 * 60 * 1000)
    const now = new Date()
    const delay = reminderTime.getTime() - now.getTime()

    if (delay <= 0) return null // already passed

    const timerId = setTimeout(() => {
      // Show browser notification first
      if (Notification.permission === 'granted') {
        new Notification(`Reminder: ${booking.name}`, {
          body: `Appointment in 15 min — ${booking.services}`,
          icon: '/favicon.svg'
        })
      }
      // Also prompt to send WhatsApp
      const shouldSend = window.confirm(
        `⏰ 15-minute reminder!\n\n${booking.name} has an appointment at ${time}.\n\nSend WhatsApp reminder now?`
      )
      if (shouldSend) sendReminder(booking, time, chairLabel)
    }, delay)

    reminderTimers.value.push(timerId)
    return timerId
  }

  // ── Schedule reminders for all today's bookings ────────────────────────────
  function scheduleAllReminders(bookings, chairs, date) {
    // clear old timers first
    clearAllTimers()

    Object.entries(bookings).forEach(([slotKey, booking]) => {
      const [time, chairId] = slotKey.split(/_(.+)/)
      const chair = chairs.find(c => c.id === chairId)
      if (chair && booking.mobile) {
        scheduleReminder(booking, time, chair.label, date)
      }
    })
  }

  function clearAllTimers() {
    reminderTimers.value.forEach(id => clearTimeout(id))
    reminderTimers.value = []
  }

  // ── Request notification permission ───────────────────────────────────────
  async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  // ── Build daily summary for WhatsApp ──────────────────────────────────────
  function buildDailySummary(bookings, date, chairs) {
    const dateStr = new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric', weekday: 'long'
    })

    const hairBookings = Object.entries(bookings).filter(([k]) => k.includes('hair'))
    const beautyBookings = Object.entries(bookings).filter(([k]) => k.includes('beauty'))

    let msg = `✂️ *Scintillate Unisex Salon*\n📅 ${dateStr}\n\n`

    if (hairBookings.length > 0) {
      msg += `💈 *HAIR APPOINTMENTS (${hairBookings.length})*\n`
      msg += `${'─'.repeat(28)}\n`
      hairBookings.forEach(([slotKey, b]) => {
        const [time, chairId] = slotKey.split(/_(.+)/)
        const chair = chairs.find(c => c.id === chairId)
        msg += `🕐 ${time}  |  ${chair?.label || chairId}\n👤 ${b.name}  📞 ${b.mobile}\n💇 ${b.services}\n\n`
      })
    }

    if (beautyBookings.length > 0) {
      msg += `💄 *BEAUTY APPOINTMENTS (${beautyBookings.length})*\n`
      msg += `${'─'.repeat(28)}\n`
      beautyBookings.forEach(([slotKey, b]) => {
        const [time, chairId] = slotKey.split(/_(.+)/)
        const chair = chairs.find(c => c.id === chairId)
        msg += `🕐 ${time}  |  ${chair?.label || chairId}\n👤 ${b.name}  📞 ${b.mobile}\n💅 ${b.services}\n\n`
      })
    }

    const total = Object.keys(bookings).length
    msg += `${'─'.repeat(28)}\n`
    msg += `📊 *Total: ${total} appointment${total !== 1 ? 's' : ''}*\n`
    msg += `Hair: ${hairBookings.length}  |  Beauty: ${beautyBookings.length}`

    return msg
  }

  function sendDailySummary(bookings, date, chairs) {
    const msg = buildDailySummary(bookings, date, chairs)
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  // cleanup on unmount
  onUnmounted(clearAllTimers)

  return {
    sendReminder,
    scheduleReminder,
    scheduleAllReminders,
    sendDailySummary,
    buildDailySummary,
    requestNotificationPermission,
    clearAllTimers,
    openWhatsApp,
    formatPhone,
  }
}
