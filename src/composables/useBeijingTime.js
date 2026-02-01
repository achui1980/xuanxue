import { ref, computed } from 'vue'

export function useBeijingTime() {
  const currentTime = ref(new Date())

  const beijingHour = computed(() => {
    try {
      const beijingTime = new Date(currentTime.value.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}))
      return beijingTime.getHours()
    } catch (e) {
      return 9 // fallback
    }
  })

  const beijingTime = computed(() => {
    try {
      return new Date(currentTime.value.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}))
    } catch (e) {
      return new Date() // fallback
    }
  })

  function updateTime() {
    currentTime.value = new Date()
  }

  // Update time every minute
  const updateInterval = setInterval(updateTime, 60000)

  function stopTimeUpdates() {
    clearInterval(updateInterval)
  }

  return {
    currentTime,
    beijingHour,
    beijingTime,
    updateTime,
    stopTimeUpdates
  }
}