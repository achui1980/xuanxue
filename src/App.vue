<template>
  <div class="app">
    <div class="container">
      <!-- Header -->
      <header>
        <div class="header-content">
          <div class="title-group">
            <h1>时机</h1>
            <p class="subtitle">个体化时间能量决策助手</p>
          </div>
          <div class="header-controls">
            <RealTimeClock />
            <button @click="toggleTheme" class="theme-toggle" :title="currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
              <span v-if="currentTheme === 'dark'">☀️</span>
              <span v-else>🌙</span>
            </button>
          </div>
        </div>
      </header>

      <div class="main-layout">
        <!-- Left Column: Navigation -->
        <nav class="tab-nav">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-btn" 
            :class="{ active: activeTab === tab.id }"
            @click="setActiveTab(tab.id)"
          >
            {{ tab.label }}
          </button>
        </nav>

        <!-- Middle Column: Main Content -->
        <main class="tab-content-wrapper">
          <ErrorBoundary>
            <Transition name="tab" mode="out-in">
              <component :is="currentTabComponent" :key="activeTab" />
            </Transition>
          </ErrorBoundary>
        </main>
        
        <!-- Right Column: Auxiliary -->
        <aside class="aux-sidebar">
           <ErrorBoundary>
             <!-- Fortune Quick Look -->
             <div v-if="!sidebarLoading && dailyFortune" class="sidebar-card quick-look">
               <div class="quick-look-header">
                  <span class="ql-label">今日能量</span>
                  <span class="ql-score" :class="dailyFortune.overall.level">{{ dailyFortune.overall.score }}</span>
               </div>
               <div class="ql-quote">{{ dailyFortune.quote }}</div>
             </div>

             <SkeletonLoader :loading="sidebarLoading" height="150px" class="mb-6">
               <GoalManager />
             </SkeletonLoader>
             
             <!-- Collapsible Radar -->
             <div class="mt-6 sidebar-section">
               <div class="sidebar-section-header" @click="radarCollapsed = !radarCollapsed">
                 <span>五行能量参考</span>
                 <span class="toggle-icon">{{ radarCollapsed ? '▼' : '▲' }}</span>
               </div>
               
               <div v-show="!radarCollapsed" class="radar-container">
                 <SkeletonLoader :loading="sidebarLoading" height="300px">
                   <FiveElementsRadar />
                 </SkeletonLoader>
               </div>
               <div v-if="radarCollapsed" class="radar-hint">
                 点击查看长期能量风格分析
               </div>
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

const tabs = [
  { id: 'today', label: '今日', component: 'TodayTab' },
  { id: 'result', label: '分析', component: 'AnalysisTab' },
  { id: 'profile', label: '个人', component: 'ProfileTab' }
]

const activeTab = computed(() => appStore.activeTab)
const currentTheme = computed(() => appStore.theme)
const dailyFortune = computed(() => energyStore.dailyFortune)
const sidebarLoading = ref(true)
const radarCollapsed = ref(true)

const currentTabComponent = computed(() => {
  const tab = tabs.find(t => t.id === activeTab.value)
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

function toggleTheme() {
  appStore.toggleTheme()
}

// Watch for hour changes to trigger notifications
watch(
  () => appStore.selectedHour,
  (newHour) => {
    // Only trigger if notifications are enabled
    if (!userStore.profile.enableNotifications) return

    // Ensure we have current energy data
    // Assuming energyStore has hourlyScores or we access via hoursData
    const hourData = energyStore.hoursData[newHour]
    if (!hourData) return

    const currentScore = hourData.score
    const hourLabel = `${newHour}:00`
    
    // Trigger 1: High Energy (Prime Time)
    if (currentScore >= 85) {
      sendNotification('吉时已到 ✨', {
        body: `${hourLabel} 能量极佳 (${currentScore}分)，适合处理重要事务！`,
        tag: 'high-energy'
      })
      return
    }

    // Trigger 2: Low Energy Warning
    if (currentScore <= 40) {
      sendNotification('运势提醒 ⚠️', {
        body: `${hourLabel} 能量较低 (${currentScore}分)，建议保守行事，避免冲动决策。`,
        tag: 'low-energy'
      })
    }
  }
)

onMounted(() => {
  // Initialize the app with current Beijing time
  appStore.setSelectedHour(appStore.getCurrentBeijingHour())
  // Apply theme
  appStore.applyTheme(appStore.theme)
  
  // Simulate loading for sidebar
  setTimeout(() => {
    sidebarLoading.value = false
  }, 800)
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.title-group {
  text-align: left;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background-color: var(--border-color);
}

h1 {
  color: var(--header-text);
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

/* Mobile Layout (Default) */
.main-layout {
  display: flex;
  flex-direction: column;
}

.tab-nav {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  background: none;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn.active {
  color: var(--header-text);
  border-bottom-color: var(--accent-color);
  font-weight: 600;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-content-wrapper {
  position: relative;
  width: 100%;
}

.aux-sidebar {
  display: none; /* Hide on mobile for now */
}

.sidebar-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--card-shadow);
  margin-bottom: 20px;
}

.quick-look-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ql-label {
  font-weight: 600;
  color: var(--text-secondary);
}

.ql-score {
  font-size: 1.2rem;
  font-weight: 700;
}
.ql-score.good { color: var(--success-color); }
.ql-score.caution { color: var(--warning-color); }
.ql-score.ok { color: var(--text-primary); }

.ql-quote {
  font-size: 0.85rem;
  color: var(--text-primary);
  line-height: 1.4;
  font-style: italic;
}

.sidebar-section {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: var(--card-shadow);
}

.sidebar-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  color: var(--header-text);
}

.radar-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 8px;
  text-align: center;
}

/* Desktop Layout (3-Column) */
@media (min-width: 1024px) {
  .main-layout {
    display: grid;
    grid-template-columns: 200px 1fr 250px;
    gap: 40px;
    align-items: start;
  }

  .tab-nav {
    flex-direction: column;
    border-bottom: none;
    border-right: 1px solid var(--border-color);
    padding-right: 20px;
    align-items: stretch;
    justify-content: flex-start;
  }

  .tab-btn {
    text-align: left;
    border-bottom: none;
    border-right: 2px solid transparent;
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .tab-btn.active {
    border-right-color: transparent; /* Reset bottom border style */
    background-color: var(--bg-secondary);
    color: var(--accent-color);
  }

  .aux-sidebar {
    display: block;
    min-height: 200px;
  }
}

/* Tab Transition */
.tab-enter-active,
.tab-leave-active {
  transition: all 0.3s ease;
}

.tab-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.tab-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
