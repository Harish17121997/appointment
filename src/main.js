import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
import Appointments from './views/Appointments.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: Dashboard, meta: { title: 'Dashboard' } },
    { path: '/appointments', component: Appointments, meta: { title: 'Appointments' } },
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
