// useSession.js — app-wide login guard
// Everyone must enter the salon passcode to access the app.
// Session auto-expires after 7 days.
//
// ⚠️  Change SALON_PASSCODE to your desired passcode before deploying.

import { ref, computed } from 'vue'

const SALON_PASSCODE = '1505'                          // ← change this
const SESSION_KEY    = 'scin_session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000       // 7 days in ms

// ── Module-level reactive state (shared across all components) ─────────────
const _isLoggedIn = ref(false)

// Restore session on app load
try {
  const raw = localStorage.getItem(SESSION_KEY)
  if (raw) {
    const { expiry } = JSON.parse(raw)
    if (Date.now() < expiry) {
      _isLoggedIn.value = true
    } else {
      localStorage.removeItem(SESSION_KEY)   // expired → clear
    }
  }
} catch {
  localStorage.removeItem(SESSION_KEY)
}

export function useSession() {
  const isLoggedIn = computed(() => _isLoggedIn.value)

  function login(passcode) {
    if (String(passcode).trim() === SALON_PASSCODE) {
      _isLoggedIn.value = true
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        expiry: Date.now() + SESSION_TTL_MS
      }))
      return true
    }
    return false
  }

  function logout() {
    _isLoggedIn.value = false
    localStorage.removeItem(SESSION_KEY)
  }

  function sessionDaysLeft() {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) return 0
      const { expiry } = JSON.parse(raw)
      return Math.ceil((expiry - Date.now()) / (24 * 60 * 60 * 1000))
    } catch { return 0 }
  }

  return { isLoggedIn, login, logout, sessionDaysLeft }
}