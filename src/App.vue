<template>
  <div v-if="isLoginPage" class="login-wrapper">
    <router-view />
  </div>
  <div v-else class="app-shell">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar--collapsed': sidebarCollapsed }">
      <div class="sidebar__brand">
        <div class="brand-icon"><img style="width: 50px; height: 40px;" src="/favicon.png" alt="Scintillate Salon" /></div>
        <transition name="fade">
          <div v-if="!sidebarCollapsed" class="brand-text">
            <span class="brand-name">Scintillate</span>
            <span class="brand-sub">Unisex Salon</span>
          </div>
        </transition>
      </div>

      <nav class="sidebar__nav">
        <div class="nav-section-label" v-if="!sidebarCollapsed">Main</div>

        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ 'nav-item--active': $route.path === item.path }"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <transition name="fade">
            <span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
          </transition>
        </router-link>

        <!-- Owner-only: Staff -->
        <div class="nav-section-label" v-if="!sidebarCollapsed" style="margin-top:1.25rem">Owner</div>
        <router-link
          to="/staff"
          class="nav-item nav-item--owner"
          :class="{ 'nav-item--active': $route.path === '/staff' }"
        >
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
          <transition name="fade">
            <span v-if="!sidebarCollapsed" class="nav-label">Staff</span>
          </transition>
          <transition name="fade">
            <span v-if="!sidebarCollapsed" class="nav-owner-badge">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z"/></svg>
              Owner
            </span>
          </transition>
        </router-link>

        <!-- Future items -->
        <div class="nav-section-label" v-if="!sidebarCollapsed" style="margin-top: 1.25rem;">Coming soon</div>
        <div v-for="item in futureItems" :key="item.label" class="nav-item nav-item--disabled">
          <span class="nav-icon" v-html="item.icon"></span>
          <transition name="fade">
            <span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
          </transition>
          <transition name="fade">
            <span v-if="!sidebarCollapsed" class="nav-soon">Soon</span>
          </transition>
        </div>
      </nav>

      <div class="sidebar__footer">
        <!-- Owner logout button (if authed) -->
        <!-- Owner mode off (owner only) -->
        <button
          v-if="isOwner && !sidebarCollapsed"
          class="owner-logout"
          @click="ownerLogout"
          title="Exit owner mode"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Owner mode off
        </button>
        <!-- Lock app (visible to everyone) -->
        <button
          v-if="!sidebarCollapsed"
          class="lock-btn"
          @click="lockApp"
          title="Lock app"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Lock app
        </button>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed" :title="sidebarCollapsed ? 'Expand' : 'Collapse'">
          <span v-html="sidebarCollapsed ? '&#9654;' : '&#9664;'"></span>
        </button>
        <transition name="fade">
          <span v-if="!sidebarCollapsed && !isOwner" class="sidebar__version">v1.0.0</span>
        </transition>
      </div>
    </aside>

    <!-- Main content area -->
    <div class="main-area">
      <header class="topbar">
        <div class="topbar__left">
          <h1 class="topbar__title">{{ currentPageTitle }}</h1>
          <span class="topbar__date">{{ todayDisplay }}</span>
        </div>
        <div class="topbar__right">
          <div v-if="isOwner" class="owner-badge-top">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z"/></svg>
            Owner mode
          </div>
          <div class="topbar__salon">
            <div class="salon-dot"></div>
            <span>Open</span>
          </div>
        </div>
      </header>

      <main class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSession } from '@/composables/useSession'

const route  = useRoute()
const router = useRouter()

// Match any route that should show ONLY the login page (no sidebar/shell)
const isLoginPage = computed(() =>
  route.path === '/login' ||
  route.path === '/' && !route.name ||
  route.name === 'Login' ||
  route.name === 'login'
)
const { isOwner, logout: ownerLogout } = useAuth()
const { logout: sessionLogout } = useSession()

function lockApp() {
  ownerLogout()     // clear owner mode
  sessionLogout()   // clear 7-day session
  router.push('/login')
}
const sidebarCollapsed = ref(false)

const menuItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`
  },
  {
    path: '/appointments',
    label: 'Appointments',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
  },
  {
    path: '/services',
    label: 'Services & Billing',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12"/><path d="M6 7h12"/><path d="M6 11h5a4 4 0 1 0 0-8"/><path d="M6 11l8 10"/></svg>`
  },
]

const futureItems = [
  {
    label: 'Reports',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
  },
]

const currentPageTitle = computed(() => {
  if (route.path === '/dashboard')    return 'Dashboard'
  if (route.path === '/appointments') return 'Appointments'
  if (route.path === '/staff')        return 'Staff Management'
  if (route.path === '/services')     return 'Services & Billing'
  return 'Scintillate Salon'
})

const todayDisplay = computed(() =>
  new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
)
</script>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  width: 100%;
}

/* ── Sidebar ── */
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  height: 100vh;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: width var(--transition), min-width var(--transition);
  overflow: hidden;
}
.sidebar--collapsed { width: 64px; min-width: 64px; }

.sidebar__brand {
  display: flex; align-items: center; gap: 12px;
  padding: 20px 16px; border-bottom: 1px solid var(--color-border); min-height: 72px;
}
.brand-icon {
  width: 36px; height: 36px; min-width: 36px;
  background: var(--color-accent); color: white;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-family: var(--font-display);
}
.brand-text { display: flex; flex-direction: column; }
.brand-name {
  font-family: var(--font-display); font-size: 15px; font-weight: 600;
  color: var(--color-text); line-height: 1.2; white-space: nowrap;
}
.brand-sub { font-size: 11px; color: var(--color-text-muted); white-space: nowrap; }

.sidebar__nav {
  flex: 1; padding: 16px 10px;
  overflow-y: auto; overflow-x: hidden;
}
.nav-section-label {
  font-size: 10px; font-weight: 500; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--color-text-light);
  padding: 0 8px; margin-bottom: 6px; margin-top: 4px; white-space: nowrap;
}
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: var(--radius-md);
  text-decoration: none; color: var(--color-text-muted);
  font-size: 13.5px; font-weight: 400; margin-bottom: 2px;
  transition: background var(--transition), color var(--transition);
  white-space: nowrap; cursor: pointer;
}
.nav-item:hover { background: var(--color-accent-light); color: var(--color-accent); }
.nav-item--active { background: var(--color-accent-light); color: var(--color-accent); font-weight: 500; }
.nav-item--disabled { opacity: 0.45; cursor: not-allowed; pointer-events: none; }
.nav-item--owner:hover { background: #FFF8E7; color: #B8860B; }
.nav-item--owner.nav-item--active { background: #FFF8E7; color: #B8860B; }
.nav-icon { display: flex; align-items: center; justify-content: center; min-width: 18px; }
.nav-label { flex: 1; }
.nav-soon {
  font-size: 10px; background: var(--color-surface-2);
  color: var(--color-text-light); padding: 1px 6px; border-radius: 99px;
}
.nav-owner-badge {
  display: flex; align-items: center; gap: 3px;
  font-size: 10px; background: #FFF3CD; color: #856404;
  padding: 2px 7px; border-radius: 99px; font-weight: 500;
}

.sidebar__footer {
  padding: 12px 16px; border-top: 1px solid var(--color-border);
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  flex-wrap: wrap;
}
.collapse-btn {
  width: 28px; height: 28px; border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); background: none; color: var(--color-text-muted);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; transition: background var(--transition); flex-shrink: 0;
}
.collapse-btn:hover { background: var(--color-surface-2); }
.sidebar__version { font-size: 11px; color: var(--color-text-light); }
.owner-logout {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: var(--color-danger); background: none;
  border: 1px solid var(--color-danger); border-radius: var(--radius-sm);
  padding: 3px 8px; cursor: pointer;
  transition: background var(--transition);
}
.owner-logout:hover { background: var(--color-danger-light); }

/* ── Main area ── */
.main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.topbar {
  height: var(--topbar-height); background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 28px; flex-shrink: 0;
}
.topbar__left { display: flex; align-items: baseline; gap: 16px; }
.topbar__title { font-family: var(--font-display); font-size: 20px; font-weight: 500; color: var(--color-text); }
.topbar__date  { font-size: 13px; color: var(--color-text-muted); }
.topbar__right { display: flex; align-items: center; gap: 12px; }
.topbar__salon {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--color-success); background: var(--color-success-light);
  padding: 4px 12px; border-radius: 99px;
}
.salon-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--color-success); animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

.owner-badge-top {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 500; color: #856404;
  background: #FFF3CD; padding: 4px 12px; border-radius: 99px;
}

.page-content { flex: 1; overflow-y: auto; padding: 08px; }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.page-enter-active, .page-leave-active { transition: opacity 0.2s, transform 0.2s; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to   { opacity: 0; transform: translateY(-8px); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .sidebar { position: fixed; z-index: 100; }
  .sidebar--collapsed { width: 0; min-width: 0; }
  .main-area { width: 100%; }
  .topbar { padding: 0 16px; }
  .page-content { padding: 16px; }
}
/* ── Login wrapper (no sidebar shell) ── */
.login-wrapper { width: 100%; height: 100vh; }

/* ── Lock button ── */
.lock-btn {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: var(--color-text-muted);
  background: none; border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); padding: 4px 9px;
  cursor: pointer; transition: background var(--transition), color var(--transition), border-color var(--transition);
  white-space: nowrap;
}
.lock-btn:hover {
  background: var(--color-accent-light, #f5ede4);
  color: var(--color-accent, #8B6F47);
  border-color: var(--color-accent, #8B6F47);
}
</style>