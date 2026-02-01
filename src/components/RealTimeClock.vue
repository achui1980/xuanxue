<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { getCurrentHourBazi } from '@/utils/tyme'

const appStore = useAppStore()
const currentTime = ref('')
const currentShichen = ref('')

const timer = ref(null)

function updateTime() {
  const now = new Date()
  
  // Update Beijing Time Display
  try {
    const beijingTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}))
    const hours = beijingTime.getHours().toString().padStart(2, '0')
    const minutes = beijingTime.getMinutes().toString().padStart(2, '0')
    const seconds = beijingTime.getSeconds().toString().padStart(2, '0')
    currentTime.value = `${hours}:${minutes}:${seconds}`
    
    // Check if hour changed to update store
    const currentHour = beijingTime.getHours()
    if (currentHour !== appStore.currentBeijingHour) {
      appStore.updateCurrentBeijingHour()
    }

  } catch (e) {
    currentTime.value = '时间获取失败'
  }

  // Update Shichen Display
  const bazi = getCurrentHourBazi(now)
  if (bazi && bazi.branch) {
    currentShichen.value = `${bazi.branch}时`
  }
}

onMounted(() => {
  updateTime()
  timer.value = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<template>
  <div class="real-time-clock">
    <div class="time-display">{{ currentTime }}</div>
    <div class="shichen-display">{{ currentShichen }}</div>
  </div>
</template>

<style scoped>
.real-time-clock {
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* Right align by default */
  font-family: monospace;
  line-height: 1.2;
}

.time-display {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.shichen-display {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* Adjust for mobile if needed, though header usually handles layout */
@media (max-width: 640px) {
  .real-time-clock {
    align-items: center;
  }
  
  .time-display {
    font-size: 1rem;
  }
  
  .shichen-display {
    font-size: 0.75rem;
  }
}
</style>