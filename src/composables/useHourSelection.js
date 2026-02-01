import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useEnergyStore } from '@/stores/energy'

export function useHourSelection() {
  const appStore = useAppStore()
  const energyStore = useEnergyStore()

  const selectedHour = computed(() => appStore.selectedHour)
  const selectedHourData = computed(() => energyStore.getHourData(selectedHour.value))
  
  const currentBeijingHour = computed(() => appStore.currentBeijingHour)

  function selectHour(hour) {
    appStore.setSelectedHour(hour)
  }

  function jumpToHour(hour) {
    selectHour(hour)
    appStore.setActiveTab('today')
  }

  return {
    selectedHour,
    selectedHourData,
    currentBeijingHour,
    selectHour,
    jumpToHour
  }
}