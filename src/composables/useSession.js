import { ref, computed } from 'vue'

const SESSION_KEY = 'scin_session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

const _isLoggedIn = ref(false)

// restore session
try {
  const raw = localStorage.getItem(SESSION_KEY)
  if (raw) {
    const { expiry } = JSON.parse(raw)
    if (Date.now() < expiry) {
      _isLoggedIn.value = true
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }
} catch {
  localStorage.removeItem(SESSION_KEY)
}

export function useSession() {
  const isLoggedIn = computed(() => _isLoggedIn.value)

  function loginSuccess() {
    _isLoggedIn.value = true
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      expiry: Date.now() + SESSION_TTL_MS
    }))
  }

  function logout() {
    _isLoggedIn.value = false
    localStorage.removeItem(SESSION_KEY)
  }

  return { isLoggedIn, loginSuccess, logout }
}