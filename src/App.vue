<template>
  <div class="app ink-texture">
    <div class="app-container">
      <!-- Header -->
      <header class="app-header">
        <div class="header-content">
          <div class="brand">
            <div class="brand-mark">
              <svg
                class="brand-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div class="brand-text">
              <h1 class="brand-title">时机</h1>
              <p class="brand-subtitle">择时而动 · 顺势而为</p>
            </div>
          </div>
          <div class="header-meta">
            <RealTimeClock />
          </div>
        </div>
      </header>

      <!-- Main Bento Grid Layout -->
      <div class="bento-layout">
        <!-- Left Sidebar: Navigation -->
        <aside class="bento-nav">
          <nav class="tab-nav">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="nav-item"
              :class="{ active: activeTab === tab.id }"
              @click="setActiveTab(tab.id)"
            >
              <span class="nav-icon" v-html="tab.icon"></span>
              <span class="nav-label">{{ tab.label }}</span>
              <span class="nav-indicator"></span>
            </button>
          </nav>
        </aside>

        <!-- Main Content Area -->
        <main class="bento-main">
          <ErrorBoundary>
            <Transition name="tab" mode="out-in">
              <component :is="currentTabComponent" :key="activeTab" />
            </Transition>
          </ErrorBoundary>
        </main>

        <!-- Right Sidebar: Quick Info -->
        <aside class="bento-sidebar">
          <ErrorBoundary>
            <!-- Daily Fortune Card -->
            <div v-if="dailyFortune" class="sidebar-card fortune-mini">
              <div class="card-header">
                <span class="card-title">今日运势</span>
                <span class="fortune-score" :class="dailyFortune.overall.level">
                  {{ dailyFortune.overall.score }}
                </span>
              </div>
              <p class="fortune-quote">{{ dailyFortune.quote }}</p>
            </div>

            <!-- Current Hour -->
            <div class="sidebar-card current-hour">
              <div class="card-header">
                <span class="card-title">当前时辰</span>
              </div>
              <div class="hour-display">
                <span class="hour-number">{{ currentHour }}:00</span>
                <span class="hour-branch">{{ currentBranch }}</span>
              </div>
            </div>

            <!-- Goals -->
            <SkeletonLoader :loading="sidebarLoading" height="200px">
              <GoalManager />
            </SkeletonLoader>

            <!-- Five Elements Radar -->
            <div class="sidebar-card radar-card">
              <div class="card-header collapsible" @click="radarCollapsed = !radarCollapsed">
                <span class="card-title">五行能量</span>
                <svg
                  class="toggle-icon"
                  :class="{ collapsed: radarCollapsed }"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <Transition name="collapse">
                <div v-show="!radarCollapsed" class="radar-content">
                  <FiveElementsRadar />
                </div>
              </Transition>
            </div>
          </ErrorBoundary>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useEnergyStore } from '@/stores/energy'
import { useNotifications } from '@/composables/useNotifications'
import { useBeijingTime } from '@/composables/useBeijingTime'
import TodayTab from '@/components/TodayTab.vue'
import AnalysisTab from '@/components/AnalysisTab.vue'
import ProfileTab from '@/components/ProfileTab.vue'
import RealTimeClock from '@/components/RealTimeClock.vue'
import GoalManager from '@/components/GoalManager.vue'
import FiveElementsRadar from '@/components/FiveElementsRadar.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const appStore = useAppStore()
const userStore = useUserStore()
const energyStore = useEnergyStore()
const { sendNotification } = useNotifications()
const { currentHour, currentBranch } = useBeijingTime()

// Navigation tabs with SVG icons
const tabs = [
  {
    id: 'today',
    label: '今日',
    component: 'TodayTab',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
  },
  {
    id: 'result',
    label: '分析',
    component: 'AnalysisTab',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>'
  },
  {
    id: 'profile',
    label: '个人',
    component: 'ProfileTab',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  }
]

const activeTab = computed(() => appStore.activeTab)
const dailyFortune = computed(() => energyStore.dailyFortune)
const sidebarLoading = ref(true)
const radarCollapsed = ref(false)

const currentTabComponent = computed(() => {
  const tab = tabs.find((t) => t.id === activeTab.value)
  switch (tab?.component) {
    case 'TodayTab':
      return TodayTab
    case 'AnalysisTab':
      return AnalysisTab
    case 'ProfileTab':
      return ProfileTab
    default:
      return TodayTab
  }
})

function setActiveTab(tabId) {
  appStore.setActiveTab(tabId)
}

// Watch for hour changes to trigger notifications
watch(
  () => appStore.selectedHour,
  (newHour) => {
    if (!userStore.profile.enableNotifications) return

    const hourData = energyStore.hoursData[newHour]
    if (!hourData) return

    const currentScore = hourData.score
    const hourLabel = `${newHour}:00`

    if (currentScore >= 85) {
      sendNotification('吉时已到', {
        body: `${hourLabel} 能量极佳 (${currentScore}分)，适合处理重要事务！`,
        tag: 'high-energy'
      })
      return
    }

    if (currentScore <= 40) {
      sendNotification('运势提醒', {
        body: `${hourLabel} 能量较低 (${currentScore}分)，建议保守行事。`,
        tag: 'low-energy'
      })
    }
  }
)

onMounted(() => {
  appStore.setSelectedHour(appStore.getCurrentBeijingHour())

  setTimeout(() => {
    sidebarLoading.value = false
  }, 800)
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  padding: var(--space-5);
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Styles */
.app-header {
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.brand-mark {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--metal) 0%, var(--metal-dim) 100%);
  border-radius: var(--radius-md);
  color: var(--ink-black);
}

.brand-icon {
  width: 28px;
  height: 28px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.brand-title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
}

.brand-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
  letter-spacing: 0.1em;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

/* Bento Grid Layout */
.bento-layout {
  display: grid;
  grid-template-columns: 220px 1fr 280px;
  gap: var(--space-6);
  align-items: start;
}

/* Navigation Sidebar */
.bento-nav {
  position: sticky;
  top: var(--space-5);
}

.tab-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--bg-elevated);
  color: var(--metal);
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
}

.nav-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--metal);
  border-radius: 0 2px 2px 0;
  transition: height var(--transition-fast);
}

.nav-item.active .nav-indicator {
  height: 20px;
}

/* Main Content */
.bento-main {
  min-height: 600px;
}

/* Right Sidebar */
.bento-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  position: sticky;
  top: var(--space-5);
}

.sidebar-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.card-header.collapsible {
  cursor: pointer;
  margin-bottom: 0;
}

.card-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toggle-icon {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  transition: transform var(--transition-fast);
}

.toggle-icon.collapsed {
  transform: rotate(-90deg);
}

/* Fortune Mini Card */
.fortune-mini .fortune-score {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
}

.fortune-score.good {
  color: var(--wood);
  background: rgba(74, 222, 128, 0.15);
}

.fortune-score.caution {
  color: var(--fire);
  background: rgba(248, 113, 113, 0.15);
}

.fortune-score.ok {
  color: var(--metal);
  background: rgba(232, 196, 102, 0.15);
}

.fortune-quote {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0;
  font-style: italic;
}

/* Current Hour Card */
.hour-display {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.hour-number {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.hour-branch {
  font-size: var(--text-lg);
  color: var(--metal);
  font-weight: var(--font-medium);
}

/* Radar Card */
.radar-card {
  overflow: hidden;
}

.radar-content {
  margin-top: var(--space-4);
}

/* Tab Transitions */
.tab-enter-active,
.tab-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.tab-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Collapse Transition */
.collapse-enter-active,
.collapse-leave-active {
  transition: all var(--transition-base);
  max-height: 400px;
  opacity: 1;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .bento-layout {
    grid-template-columns: 180px 1fr 240px;
  }
}

@media (max-width: 1024px) {
  .bento-layout {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }

  .bento-nav {
    position: static;
  }

  .tab-nav {
    flex-direction: row;
    justify-content: center;
  }

  .nav-item {
    padding: var(--space-3) var(--space-5);
  }

  .nav-indicator {
    display: none;
  }

  .bento-sidebar {
    position: static;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 640px) {
  .app {
    padding: var(--space-4);
  }

  .brand-mark {
    width: 40px;
    height: 40px;
  }

  .brand-icon {
    width: 24px;
    height: 24px;
  }

  .brand-title {
    font-size: var(--text-2xl);
  }

  .brand-subtitle {
    display: none;
  }

  .tab-nav {
    gap: var(--space-1);
  }

  .nav-item {
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
  }

  .nav-label {
    display: none;
  }

  .bento-sidebar {
    grid-template-columns: 1fr;
  }
}
</style>
