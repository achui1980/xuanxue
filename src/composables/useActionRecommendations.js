import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useEnergyStore } from '@/stores/energy'

export function useActionRecommendations() {
  const appStore = useAppStore()
  const energyStore = useEnergyStore()

  const selectedAction = computed(() => appStore.selectedAction)
  const selectedHourData = computed(() => energyStore.getHourData(appStore.selectedHour))

  const recommendedActions = computed(() => {
    return selectedHourData.value?.recommendedActions || []
  })

  const avoidActions = computed(() => {
    return selectedHourData.value?.avoidActions || []
  })

  const selectedActionLabel = computed(() => {
    return energyStore.getActionLabel(selectedAction.value)
  })

  function isActionHighlighted(actionText) {
    if (!selectedAction.value || !selectedActionLabel.value) return false
    return actionText.includes(selectedActionLabel.value)
  }

  function selectAction(actionId) {
    appStore.setSelectedAction(actionId)
  }

  return {
    selectedAction,
    selectedActionLabel,
    recommendedActions,
    avoidActions,
    isActionHighlighted,
    selectAction
  }
}