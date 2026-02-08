<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { getCurrentHourBazi } from '@/utils/tyme'

const appStore = useAppStore()
const currentTime = ref('')
const currentShichen = ref('')
const currentBranch = ref('')

const timer = ref(null)

// 十二地支
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

function getBranchFromHour(hour) {
  // 23:00-01:00 子时
  const branchIndex = Math.floor(((hour + 1) % 24) / 2)
  return BRANCHES[branchIndex]
}

function updateTime() {
  const now = new Date()

  try {
    const beijingTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }))
    const hours = beijingTime.getHours().toString().padStart(2, '0')
    const minutes = beijingTime.getMinutes().toString().padStart(2, '0')
    const seconds = beijingTime.getSeconds().toString().padStart(2, '0')
    currentTime.value = `${hours}:${minutes}:${seconds}`

    const currentHour = beijingTime.getHours()
    currentBranch.value = getBranchFromHour(currentHour)

    if (currentHour !== appStore.currentBeijingHour) {
      appStore.updateCurrentBeijingHour()
    }
  } catch (e) {
    currentTime.value = '--:--:--'
  }

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
    <div class="clock-display">
      <span class="time-value">{{ currentTime }}</span>
      <span class="branch-badge">{{ currentBranch }}</span>
    </div>
    <div class="shichen-label">北京时间 · {{ currentShichen }}</div>
  </div>
</template>

<style scoped>
.real-time-clock {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
}

.clock-display {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.time-value {
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  letter-spacing: 0.05em;
}

.branch-badge {
  padding: var(--space-1) var(--space-2);
  background: linear-gradient(135deg, var(--metal) 0%, var(--metal-dim) 100%);
  color: var(--ink-black);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  border-radius: var(--radius-md);
}

.shichen-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  letter-spacing: 0.05em;
}

@media (max-width: 640px) {
  .real-time-clock {
    align-items: center;
  }

  .time-value {
    font-size: var(--text-lg);
  }

  .shichen-label {
    font-size: var(--text-xs);
  }
}
</style>
