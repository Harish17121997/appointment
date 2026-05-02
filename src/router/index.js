import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Appointments from '@/views/Appointments.vue'
import Staff from '@/views/Staff.vue'
import Services from '@views/Services.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/appointments', name: 'Appointments', component: Appointments },
  { path: '/staff', name: 'Staff', component: Staff, meta: { ownerOnly: true }, },
  { path: '/services', name: 'Services', component: Services },
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
