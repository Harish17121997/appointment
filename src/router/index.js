import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Appointments from '@/views/Appointments.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/appointments', name: 'Appointments', component: Appointments },
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
