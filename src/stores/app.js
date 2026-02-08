import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const activeTab = ref('today')
  const selectedHour = ref(getCurrentBeijingHour())
  const currentBeijingHour = ref(getCurrentBeijingHour())
  const selectedAction = ref('')

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

  function getCurrentBeijingHour() {
    try {
      const now = new Date()
      const beijingTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }))
      return beijingTime.getHours()
    } catch (e) {
      return 9 // fallback
    }
  }

  return {
    activeTab,
    selectedHour,
    selectedAction,
    setActiveTab,
    setSelectedHour,
    setSelectedAction,
    getCurrentBeijingHour,
    currentBeijingHour,
    updateCurrentBeijingHour
  }
})
