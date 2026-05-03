import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard    from '@/views/Dashboard.vue'
import Appointments from '@/views/Appointments.vue'
import Staff        from '@/views/Staff.vue'
import Services     from '@/views/Services.vue'
import Login        from '@/views/Login.vue'

const routes = [
  { path: '/login',        name: 'Login',        component: Login, meta: { public: true } },
  { path: '/',             redirect: '/dashboard' },
  { path: '/dashboard',    name: 'Dashboard',    component: Dashboard },
  { path: '/appointments', name: 'Appointments', component: Appointments },
  { path: '/staff',        name: 'Staff',        component: Staff, meta: { ownerOnly: true } },
  { path: '/services',     name: 'Services',     component: Services },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// ── Navigation guard: check session on every route ──────────────────────────
const SESSION_KEY = 'scin_session'

router.beforeEach((to) => {
  if (to.meta.public) return true          // login page — always allow

  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      const { expiry } = JSON.parse(raw)
      if (Date.now() < expiry) return true  // valid session → proceed
    }
  } catch { /* fall through */ }

  return { name: 'Login' }                 // no valid session → login
})

export default router