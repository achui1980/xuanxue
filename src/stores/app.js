import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const activeTab = ref('today')
  const selectedHour = ref(getCurrentBeijingHour())
  const currentBeijingHour = ref(getCurrentBeijingHour())
  const selectedAction = ref('')
  const theme = ref(localStorage.getItem('shiji_theme') || 'auto')

  function setActiveTab(tab) {
    activeTab.value = tab
  }

  function setSelectedHour(hour) {
    selectedHour.value = hour
  }

  function updateCurrentBeijingHour() {
    currentBeijingHour.value = getCurrentBeijingHour()
  }

  function setSelectedAction(action) {
    selectedAction.value = action
  }

  function setTheme(newTheme) {
    theme.value = newTheme
    localStorage.setItem('shiji_theme', newTheme)
    applyTheme(newTheme)
  }

  function applyTheme(newTheme) {
    const root = document.documentElement
    if (newTheme === 'dark' || (newTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.setAttribute('data-theme', 'dark')
    } else {
      root.setAttribute('data-theme', 'light')
    }
  }

  function toggleTheme() {
    const newTheme = theme.value === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  function getCurrentBeijingHour() {
    try {
      const now = new Date()
      const beijingTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}))
      return beijingTime.getHours()
    } catch (e) {
      return 9 // fallback
    }
  }

  return {
    activeTab,
    selectedHour,
    selectedAction,
    theme,
    setActiveTab,
    setSelectedHour,
    setSelectedAction,
    setTheme,
    toggleTheme,
    applyTheme,
    getCurrentBeijingHour,
    currentBeijingHour,
    updateCurrentBeijingHour
  }
})