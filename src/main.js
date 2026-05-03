import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App         from './App.vue'
import Login       from './views/Login.vue'
import Dashboard   from './views/Dashboard.vue'
import Appointments from './views/Appointments.vue'
import Staff       from './views/Staff.vue'
import Services    from './views/Services.vue'
import './style.css'

// ── Routes ──────────────────────────────────────────────────────────────────
const routes = [
  { path: '/login',        component: Login,        meta: { public: true,  title: 'Login' } },
  { path: '/',             redirect: '/dashboard' },
  { path: '/dashboard',    component: Dashboard,    meta: { title: 'Dashboard' } },
  { path: '/appointments', component: Appointments, meta: { title: 'Appointments' } },
  { path: '/staff',        component: Staff,        meta: { title: 'Staff' } },
  { path: '/services',     component: Services,     meta: { title: 'Services & Billing' } },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})


const SESSION_KEY = 'scin_session'

router.beforeEach((to) => {
  // Always allow the login page
  if (to.meta.public) return true

  // Check for valid session
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      const { expiry } = JSON.parse(raw)
      if (Date.now() < expiry) return true   // ✅ session valid
    }
  } catch { /* fall through */ }

  // Session missing or expired → redirect to login
  return { path: '/login' }
})

// ── Page title ───────────────────────────────────────────────────────────────
router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} · Scintillate Salon`
    : 'Scintillate Salon'
})

// ── Mount ────────────────────────────────────────────────────────────────────
const app = createApp(App)
app.use(router)
app.mount('#app')