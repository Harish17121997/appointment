import { ref, onUnmounted } from 'vue'

export function useWhatsApp() {
  const reminderTimers = ref([])

  // ── Format phone: always +91XXXXXXXXXX ─────────────────────────────────────
  function formatPhone(mobile) {
    let digits = String(mobile).replace(/\D/g, '')
    if (digits.length === 10) digits = '91' + digits
    return digits
  }

  // ── Core: open WhatsApp with a pre-filled message ──────────────────────────
  function openWhatsApp(mobile, message) {
    const phone = formatPhone(mobile)
    const url   = `https://wa.me/${phone}?text=${encodeURIComponent(message.trim())}`
    window.open(url, '_blank')
  }

  // ── Build the 15-min reminder message ─────────────────────────────────────
  function buildReminderMessage(booking, time, chairLabel) {
    return (
      `Hello *${booking.name}*\n\n` +
      `This is a reminder from *Scintillate Unisex Salon*\n\n` +
      `Your appointment is in *15 minutes*!\n\n` +
      `Time: *${time}*\n` +
      `Service: *${booking.services}*\n` +
      `${chairLabel}\n\n` +
      `We look forward to seeing you!\n` +
      `If you need to reschedule, please call us.\n\n` +
      ` *Scintillate Unisex Salon*`
    )
  }

  // ── Immediately send a WhatsApp reminder (opens wa.me with number) ─────────
  // This is called when you click the WhatsApp/Remind button on a booking
  function sendReminder(booking, time, chairLabel) {
    const msg = buildReminderMessage(booking, time, chairLabel)
    openWhatsApp(booking.mobile, msg)
  }

  // ── Schedule auto-reminder: fires a browser alert + opens WA 15 min before ─
  function scheduleReminder(booking, time, chairLabel, date) {
    const parts = time.split(':')
    let hour    = parseInt(parts[0])
    const min   = parseInt(parts[1] || '0')

    // Our slots: 10:00–12:30 are AM (10–12), 1:00 onwards are PM (13+)
    if (hour < 10) hour = hour + 12

    const apptTime = new Date(date)
    apptTime.setHours(hour, min, 0, 0)

    const delay = apptTime.getTime() - 15 * 60 * 1000 - Date.now()
    if (delay <= 0) return null   // already past

    const timerId = setTimeout(() => {
      // Browser notification
      if (Notification?.permission === 'granted') {
        new Notification(`⏰ Reminder: ${booking.name}`, {
          body: `Appointment in 15 min — ${time} — ${booking.services}`
        })
      }
      // Open WhatsApp directly — no confirm dialog, just open
      sendReminder(booking, time, chairLabel)
    }, delay)

    reminderTimers.value.push(timerId)
    return timerId
  }

  // ── Schedule reminders for all bookings on a day ───────────────────────────
  function scheduleAllReminders(bookings, chairs, date) {
    clearAllTimers()
    Object.entries(bookings).forEach(([slotKey, booking]) => {
      if (!booking.mobile) return
      const [time, chairId] = slotKey.split(/_(.+)/)
      const chair = chairs.find(c => c.id === chairId)
      if (chair) scheduleReminder(booking, time, chair.label, date)
    })
  }

  function clearAllTimers() {
    reminderTimers.value.forEach(id => clearTimeout(id))
    reminderTimers.value = []
  }

  async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  // ── Build full day summary message ─────────────────────────────────────────
  function buildDailySummary(bookings, date, chairs) {
    const dateStr = new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    })

    const hairEntries   = Object.entries(bookings).filter(([k]) => k.includes('hair'))
    const beautyEntries = Object.entries(bookings).filter(([k]) => k.includes('beauty'))

    let msg = `✂️ *Scintillate Unisex Salon*\n📅 ${dateStr}\n\n`

    if (hairEntries.length > 0) {
      msg += `💈 *HAIR APPOINTMENTS (${hairEntries.length})*\n`
      msg += `${'─'.repeat(30)}\n`
      hairEntries.forEach(([slotKey, b]) => {
        const [time, chairId] = slotKey.split(/_(.+)/)
        const chair = chairs.find(c => c.id === chairId)
        msg += `🕐 ${time}  |  ${chair?.label || chairId}\n`
        msg += `👤 ${b.name}   📞 ${b.mobile}\n`
        msg += `💇 ${b.services}\n\n`
      })
    }

    if (beautyEntries.length > 0) {
      msg += `💄 *BEAUTY APPOINTMENTS (${beautyEntries.length})*\n`
      msg += `${'─'.repeat(30)}\n`
      beautyEntries.forEach(([slotKey, b]) => {
        const [time, chairId] = slotKey.split(/_(.+)/)
        const chair = chairs.find(c => c.id === chairId)
        msg += `🕐 ${time}  |  ${chair?.label || chairId}\n`
        msg += `👤 ${b.name}   📞 ${b.mobile}\n`
        msg += `💅 ${b.services}\n\n`
      })
    }

    const total = Object.keys(bookings).length
    msg += `${'─'.repeat(30)}\n`
    msg += `📊 *Total: ${total} appointment${total !== 1 ? 's' : ''}*\n`
    msg += `💈 Hair: ${hairEntries.length}   💄 Beauty: ${beautyEntries.length}`

    return msg
  }

  // ── Send daily summary (no specific number — broadcast) ───────────────────
  function sendDailySummary(bookings, date, chairs) {
    const msg = buildDailySummary(bookings, date, chairs)
    // Opens WhatsApp without a pre-set number so you can choose who to send to
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

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