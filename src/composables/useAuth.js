// useAuth.js — simple owner PIN guard
// Owner PIN is stored in localStorage so it persists across sessions.
// Default PIN: 1234  (owner can change it from the Staff page)

import { ref, computed } from 'vue'

const OWNER_PIN_KEY  = 'salon_owner_pin'
const OWNER_AUTH_KEY = 'salon_owner_auth'
const DEFAULT_PIN    = '1234'

const isOwner = ref(false)

// Restore session auth on import
try {
  const saved = sessionStorage.getItem(OWNER_AUTH_KEY)
  if (saved === 'true') isOwner.value = true
} catch {}

export function useAuth() {
  function getPin() {
    return localStorage.getItem(OWNER_PIN_KEY) || DEFAULT_PIN
  }

  function setPin(newPin) {
    localStorage.setItem(OWNER_PIN_KEY, newPin)
  }

  function login(pin) {
    if (pin === getPin()) {
      isOwner.value = true
      sessionStorage.setItem(OWNER_AUTH_KEY, 'true')
      return true
    }
    return false
  }

  function logout() {
    isOwner.value = false
    sessionStorage.removeItem(OWNER_AUTH_KEY)
  }

  return { isOwner: computed(() => isOwner.value), login, logout, setPin, getPin }
}