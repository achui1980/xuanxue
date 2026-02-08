<template>
  <BaseCard class="conflict-checker" elevated>
    <template #header>
      <h3 class="card-title">计划冲突检查</h3>
      <p class="card-subtitle">检查你的计划时间是否合适</p>
    </template>

    <div class="checker-form">
      <div class="form-row">
        <label class="form-label">我计划做</label>
        <input
          v-model="planDescription"
          type="text"
          class="input"
          placeholder="例如：周三下午签约"
        />
      </div>

      <div class="form-row datetime-row">
        <div class="datetime-field">
          <label class="form-label">日期</label>
          <input v-model="planDate" type="date" class="input" />
        </div>
        <div class="datetime-field">
          <label class="form-label">时间</label>
          <select v-model="planHour" class="input select">
            <option v-for="h in 24" :key="h" :value="h - 1">
              {{ String(h - 1).padStart(2, '0') }}:00
            </option>
          </select>
        </div>
      </div>

      <button class="btn btn-primary btn-full" @click="checkConflict" :disabled="!canCheck">
        <AppIcon name="check-circle" size="sm" />
        检查是否合适
      </button>
    </div>

    <!-- 检查结果 -->
    <div v-if="checkResult" class="check-result" :class="checkResult.type">
      <div class="result-icon" :class="checkResult.type">
        <AppIcon :name="checkResult.icon" size="xl" />
      </div>
      <div class="result-content">
        <div class="result-title">{{ checkResult.title }}</div>
        <div class="result-message">{{ checkResult.message }}</div>

        <div v-if="checkResult.alternatives.length > 0" class="alternatives">
          <div class="alternatives-title">建议改到：</div>
          <div class="alternatives-list">
            <button
              v-for="alt in checkResult.alternatives.slice(0, 3)"
              :key="alt.datetime"
              class="alternative-btn"
              @click="selectAlternative(alt)"
            >
              <span class="alt-datetime">{{ alt.datetime }}</span>
              <span class="alt-score" :class="getScoreLevel(alt.score)">{{ alt.score }}分</span>
            </button>
          </div>
        </div>

        <div v-if="checkResult.tips.length > 0" class="result-tips">
          <div v-for="tip in checkResult.tips" :key="tip" class="tip-item">
            <AppIcon name="lightbulb" size="sm" />
            {{ tip }}
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useEnergyStore } from '@/stores/energy'
import { calculateBaZi, calculateHourEnergy } from '@/utils/tyme'
import BaseCard from '@/components/common/BaseCard.vue'
import AppIcon from '@/components/icons/AppIcon.vue'

const userStore = useUserStore()
const energyStore = useEnergyStore()

const planDescription = ref('')
const planDate = ref('')
const planHour = ref(14)
const checkResult = ref(null)

const canCheck = computed(() => {
  return planDescription.value.trim().length > 0 && planDate.value
})

function getScoreLevel(score) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

function checkConflict() {
  if (!canCheck.value) return

  const date = new Date(planDate.value)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = planHour.value

  let score = 50

  if (userStore.hasBirthInfo()) {
    const dayBazi = calculateBaZi(year, month, day, 12)
    const hourBazi = calculateBaZi(year, month, day, hour)

    if (dayBazi && hourBazi) {
      score = calculateHourEnergy(
        userStore.profile.bazi,
        {
          favorable: userStore.profile.favorable,
          unfavorable: userStore.profile.unfavorable
        },
        dayBazi,
        hourBazi,
        false
      )
    }
  } else {
    const hourData = energyStore.getHourData(hour)
    if (hourData) {
      score = hourData.score
    }
  }

  const activityType = detectActivityType(planDescription.value)
  checkResult.value = generateResult(score, year, month, day, hour, activityType)
}

function detectActivityType(description) {
  const keywords = {
    签约: 'sign',
    合作: 'sign',
    合同: 'sign',
    会议: 'meeting',
    开会: 'meeting',
    沟通: 'meeting',
    决策: 'decision',
    决定: 'decision',
    投资: 'money',
    理财: 'money',
    社交: 'social',
    聚会: 'social',
    运动: 'exercise',
    健身: 'exercise',
    创意: 'create',
    创作: 'create',
    学习: 'study',
    专注: 'work',
    工作: 'work'
  }

  for (const [key, type] of Object.entries(keywords)) {
    if (description.includes(key)) {
      return type
    }
  }
  return 'general'
}

function generateResult(score, year, month, day, hour, activityType) {
  const datetime = `${month}月${day}日 ${String(hour).padStart(2, '0')}:00`
  const alternatives = findAlternatives(year, month, day, hour, activityType)

  if (score >= 75) {
    return {
      type: 'good',
      icon: 'check-circle',
      title: '这个时段很合适！',
      message: `${datetime} 能量分数 ${score}分，非常适合你的计划。`,
      alternatives: [],
      tips: ['建议提前10分钟到场，做好准备', '这个时段你的决策力较强']
    }
  } else if (score >= 50) {
    return {
      type: 'medium',
      icon: 'warning-circle',
      title: '这个时段尚可，但有更好的选择',
      message: `${datetime} 能量分数 ${score}分，可以执行但不够理想。`,
      alternatives: alternatives.filter((a) => a.score >= 75),
      tips: ['如果不是特别重要，可以考虑改期', '执行前做好充分准备']
    }
  } else {
    return {
      type: 'bad',
      icon: 'close-circle',
      title: '建议改期！',
      message: `${datetime} 能量分数 ${score}分，不太适合重要事项。`,
      alternatives: alternatives.filter((a) => a.score >= 70),
      tips: ['能量较低，容易出现疏漏', '重要决策建议另选时间']
    }
  }
}

function findAlternatives(year, month, day) {
  const alternatives = []

  for (let dayOffset = -3; dayOffset <= 3; dayOffset++) {
    if (dayOffset === 0) continue

    const checkDate = new Date(year, month - 1, day + dayOffset)
    const checkYear = checkDate.getFullYear()
    const checkMonth = checkDate.getMonth() + 1
    const checkDay = checkDate.getDate()

    const timeSlots = [10, 14, 20]

    timeSlots.forEach((checkHour) => {
      let slotScore = 50

      if (userStore.hasBirthInfo()) {
        const dayBazi = calculateBaZi(checkYear, checkMonth, checkDay, 12)
        const hourBazi = calculateBaZi(checkYear, checkMonth, checkDay, checkHour)

        if (dayBazi && hourBazi) {
          slotScore = calculateHourEnergy(
            userStore.profile.bazi,
            {
              favorable: userStore.profile.favorable,
              unfavorable: userStore.profile.unfavorable
            },
            dayBazi,
            hourBazi,
            false
          )
        }
      } else {
        const hourData = energyStore.getHourData(checkHour)
        if (hourData) {
          slotScore = hourData.score
        }
      }

      if (slotScore >= 55) {
        const dateStr =
          dayOffset === 1 ? '明天' : dayOffset === -1 ? '昨天' : `${checkMonth}月${checkDay}日`

        alternatives.push({
          datetime: `${dateStr} ${String(checkHour).padStart(2, '0')}:00`,
          fullDate: `${checkYear}-${String(checkMonth).padStart(2, '0')}-${String(checkDay).padStart(2, '0')}`,
          hour: checkHour,
          score: slotScore
        })
      }
    })
  }

  alternatives.sort((a, b) => b.score - a.score)
  return alternatives.slice(0, 6)
}

function selectAlternative(alt) {
  planDate.value = alt.fullDate
  planHour.value = alt.hour
  checkConflict()
}
</script>

<style scoped>
.conflict-checker {
  margin-bottom: var(--space-6);
}

.card-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: var(--space-1) 0 0;
}

.checker-form {
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  margin: var(--space-5) 0;
}

.form-row {
  margin-bottom: var(--space-4);
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.datetime-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-3);
}

.datetime-field {
  display: flex;
  flex-direction: column;
}

.btn-full {
  width: 100%;
}

/* Check Result */
.check-result {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.check-result.good {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.check-result.medium {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.check-result.bad {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.result-icon {
  flex-shrink: 0;
}

.result-icon.good {
  color: var(--wood);
}

.result-icon.medium {
  color: var(--earth);
}

.result-icon.bad {
  color: var(--fire);
}

.result-content {
  flex: 1;
}

.result-title {
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}

.result-message {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
  line-height: var(--leading-relaxed);
}

/* Alternatives */
.alternatives {
  margin-bottom: var(--space-4);
}

.alternatives-title {
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.alternatives-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.alternative-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.alternative-btn:hover {
  border-color: var(--water);
  background: rgba(96, 165, 250, 0.05);
}

.alt-datetime {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.alt-score {
  font-weight: var(--font-bold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.alt-score.high {
  background: rgba(74, 222, 128, 0.2);
  color: var(--wood);
}

.alt-score.medium {
  background: rgba(96, 165, 250, 0.2);
  color: var(--water);
}

/* Tips */
.result-tips {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  background: rgba(232, 196, 102, 0.1);
  padding: var(--space-3);
  border-radius: var(--radius-md);
}

.tip-item svg {
  flex-shrink: 0;
  color: var(--metal);
}

@media (max-width: 480px) {
  .datetime-row {
    grid-template-columns: 1fr;
  }

  .check-result {
    flex-direction: column;
    gap: var(--space-3);
  }
}
</style>
