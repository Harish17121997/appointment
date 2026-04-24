<template>
  <div class="app-shell">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar--collapsed': sidebarCollapsed }">
      <div class="sidebar__brand">
        <div class="brand-icon">✂</div>
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
          <transition name="fade">
            <span v-if="!sidebarCollapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
          </transition>
        </router-link>

        <!-- Future menu placeholder -->
        <div class="nav-section-label" v-if="!sidebarCollapsed" style="margin-top: 1.5rem;">Coming soon</div>
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
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed" :title="sidebarCollapsed ? 'Expand' : 'Collapse'">
          <span v-html="sidebarCollapsed ? '&#9654;' : '&#9664;'"></span>
        </button>
        <transition name="fade">
          <span v-if="!sidebarCollapsed" class="sidebar__version">v1.0.0</span>
        </transition>
      </div>
    </aside>

    <!-- Main content area -->
    <div class="main-area">
      <!-- Top bar -->
      <header class="topbar">
        <div class="topbar__left">
          <h1 class="topbar__title">{{ currentPageTitle }}</h1>
          <span class="topbar__date">{{ todayDisplay }}</span>
        </div>
        <div class="topbar__right">
          <div class="topbar__salon">
            <div class="salon-dot"></div>
            <span>Open</span>
          </div>
        </div>
      </header>

      <!-- Page content -->
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
import { useRoute } from 'vue-router'

const route = useRoute()
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
]

const futureItems = [
  {
    label: 'Clients',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },
  {
    label: 'Services & Prices',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
  },
  {
    label: 'Staff',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
  },
  {
    label: 'Reports',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
  },
]

const currentPageTitle = computed(() => {
  const item = menuItems.find(m => m.path === route.path)
  return item ? item.label : 'Scintillate Salon'
})

const todayDisplay = computed(() => {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
})
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
.sidebar--collapsed {
  width: 64px;
  min-width: 64px;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--color-border);
  min-height: 72px;
}
.brand-icon {
  width: 36px;
  height: 36px;
  min-width: 36px;
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-family: var(--font-display);
}
.brand-text {
  display: flex;
  flex-direction: column;
}
.brand-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.2;
  white-space: nowrap;
}
.brand-sub {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.sidebar__nav {
  flex: 1;
  padding: 16px 10px;
  overflow-y: auto;
  overflow-x: hidden;
}
.nav-section-label {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-light);
  padding: 0 8px;
  margin-bottom: 6px;
  margin-top: 4px;
  white-space: nowrap;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text-muted);
  font-size: 13.5px;
  font-weight: 400;
  margin-bottom: 2px;
  transition: background var(--transition), color var(--transition);
  white-space: nowrap;
  cursor: pointer;
}
.nav-item:hover {
  background: var(--color-accent-light);
  color: var(--color-accent);
}
.nav-item--active {
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-weight: 500;
}
.nav-item--disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}
.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
}
.nav-label { flex: 1; }
.nav-badge {
  font-size: 10px;
  background: var(--color-accent);
  color: white;
  padding: 1px 7px;
  border-radius: 99px;
}
.nav-soon {
  font-size: 10px;
  background: var(--color-surface-2);
  color: var(--color-text-light);
  padding: 1px 6px;
  border-radius: 99px;
}

.sidebar__footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.collapse-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: background var(--transition);
  flex-shrink: 0;
}
.collapse-btn:hover { background: var(--color-surface-2); }
.sidebar__version { font-size: 11px; color: var(--color-text-light); }

/* ── Main area ── */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.topbar {
  height: var(--topbar-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  flex-shrink: 0;
}
.topbar__left { display: flex; align-items: baseline; gap: 16px; }
.topbar__title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 500;
  color: var(--color-text);
}
.topbar__date { font-size: 13px; color: var(--color-text-muted); }
.topbar__right { display: flex; align-items: center; gap: 12px; }
.topbar__salon {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-success);
  background: var(--color-success-light);
  padding: 4px 12px;
  border-radius: 99px;
}
.salon-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-success);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.page-enter-active, .page-leave-active { transition: opacity 0.2s, transform 0.2s; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
