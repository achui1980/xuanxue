<template>
  <div class="conflict-checker">
    <div class="checker-header">
      <h3 class="checker-title">计划冲突检查</h3>
      <p class="checker-subtitle">检查你的计划时间是否合适</p>
    </div>

    <div class="checker-form">
      <div class="form-row">
        <label class="form-label">我计划做</label>
        <input
          v-model="planDescription"
          type="text"
          class="text-input"
          placeholder="例如：周三下午签约"
        />
      </div>

      <div class="form-row datetime-row">
        <div class="datetime-field">
          <label class="form-label">日期</label>
          <input v-model="planDate" type="date" class="date-input" />
        </div>
        <div class="datetime-field">
          <label class="form-label">时间</label>
          <select v-model="planHour" class="hour-select">
            <option v-for="h in 24" :key="h" :value="h - 1">
              {{ String(h - 1).padStart(2, '0') }}:00
            </option>
          </select>
        </div>
      </div>

      <button class="check-btn" @click="checkConflict" :disabled="!canCheck">检查是否合适</button>
    </div>

    <!-- 检查结果 -->
    <div v-if="checkResult" class="check-result" :class="checkResult.type">
      <div class="result-icon">{{ checkResult.icon }}</div>
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
          <div v-for="tip in checkResult.tips" :key="tip" class="tip-item">💡 {{ tip }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useEnergyStore } from '@/stores/energy'
import { calculateBaZi, calculateHourEnergy } from '@/utils/tyme'

const userStore = useUserStore()
const energyStore = useEnergyStore()

const planDescription = ref('')
const planDate = ref('')
const planHour = ref(14) // 默认下午2点
const checkResult = ref(null)

// 是否可以检查
const canCheck = computed(() => {
  return planDescription.value.trim().length > 0 && planDate.value
})

// 获取分数等级
function getScoreLevel(score) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

// 执行冲突检查（使用V2算法）
function checkConflict() {
  if (!canCheck.value) return

  const date = new Date(planDate.value)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = planHour.value

  // 计算该时段分数（使用V2算法）
  let score = 50

  if (userStore.hasBirthInfo()) {
    const dayBazi = calculateBaZi(year, month, day, 12) // 日柱
    const hourBazi = calculateBaZi(year, month, day, hour)

    if (dayBazi && hourBazi) {
      score = calculateHourEnergy(
        userStore.profile.bazi,
        {
          favorable: userStore.profile.favorable,
          unfavorable: userStore.profile.unfavorable
        },
        dayBazi, // V2新增：日柱
        hourBazi, // 时辰
        false
      )
    }
  } else {
    // 无个人信息时，使用默认时段分数
    const hourData = energyStore.getHourData(hour)
    if (hourData) {
      score = hourData.score
    }
  }

  // 解析活动类型
  const activityType = detectActivityType(planDescription.value)

  // 根据分数生成结果
  checkResult.value = generateResult(score, year, month, day, hour, activityType)
}

// 检测活动类型
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

// 生成检查结果
function generateResult(score, year, month, day, hour, activityType) {
  const datetime = `${month}月${day}日 ${String(hour).padStart(2, '0')}:00`

  // 查找替代时段（前后3天）
  const alternatives = findAlternatives(year, month, day, hour, activityType)

  if (score >= 75) {
    return {
      type: 'good',
      icon: '✅',
      title: '这个时段很合适！',
      message: `${datetime} 能量分数 ${score}分，非常适合你的计划。`,
      alternatives: [],
      tips: ['建议提前10分钟到场，做好准备', '这个时段你的决策力较强']
    }
  } else if (score >= 50) {
    return {
      type: 'medium',
      icon: '⚠️',
      title: '这个时段尚可，但有更好的选择',
      message: `${datetime} 能量分数 ${score}分，可以执行但不够理想。`,
      alternatives: alternatives.filter((a) => a.score >= 75),
      tips: ['如果不是特别重要，可以考虑改期', '执行前做好充分准备']
    }
  } else {
    return {
      type: 'bad',
      icon: '❌',
      title: '建议改期！',
      message: `${datetime} 能量分数 ${score}分，不太适合重要事项。`,
      alternatives: alternatives.filter((a) => a.score >= 70),
      tips: ['能量较低，容易出现疏漏', '重要决策建议另选时间']
    }
  }
}

// 查找替代时段（使用V2算法）
function findAlternatives(year, month, day) {
  const alternatives = []

  // 搜索前后3天，每天3个时段（上午/下午/晚上）
  for (let dayOffset = -3; dayOffset <= 3; dayOffset++) {
    if (dayOffset === 0) continue // 跳过当天

    const checkDate = new Date(year, month - 1, day + dayOffset)
    const checkYear = checkDate.getFullYear()
    const checkMonth = checkDate.getMonth() + 1
    const checkDay = checkDate.getDate()

    const timeSlots = [10, 14, 20] // 上午、下午、晚上代表时段

    timeSlots.forEach((checkHour) => {
      let slotScore = 50

      if (userStore.hasBirthInfo()) {
        const dayBazi = calculateBaZi(checkYear, checkMonth, checkDay, 12) // 日柱
        const hourBazi = calculateBaZi(checkYear, checkMonth, checkDay, checkHour)

        if (dayBazi && hourBazi) {
          slotScore = calculateHourEnergy(
            userStore.profile.bazi,
            {
              favorable: userStore.profile.favorable,
              unfavorable: userStore.profile.unfavorable
            },
            dayBazi, // V2新增：日柱
            hourBazi, // 时辰
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
        // 只保留55分以上（V2算法分数范围更广）
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

  // 按分数排序
  alternatives.sort((a, b) => b.score - a.score)
  return alternatives.slice(0, 6)
}

// 选择替代时段
function selectAlternative(alt) {
  // 填充表单
  planDate.value = alt.fullDate
  planHour.value = alt.hour

  // 重新检查
  checkConflict()
}
</script>

<style scoped>
.conflict-checker {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  margin-bottom: 24px;
}

.checker-header {
  margin-bottom: 20px;
}

.checker-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--header-text);
  margin: 0 0 8px 0;
}

.checker-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Checker Form */
.checker-form {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.form-row {
  margin-bottom: 16px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.text-input,
.date-input,
.hour-select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 1rem;
}

.text-input:focus,
.date-input:focus,
.hour-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
}

.datetime-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}

.datetime-field {
  display: flex;
  flex-direction: column;
}

.check-btn {
  width: 100%;
  padding: 14px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.check-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.check-btn:disabled {
  background: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Check Result */
.check-result {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
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
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.check-result.medium {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.check-result.bad {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.result-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
}

.result-title {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: var(--header-text);
}

.result-message {
  font-size: 0.95rem;
  color: var(--text-primary);
  margin-bottom: 16px;
  line-height: 1.5;
}

/* Alternatives */
.alternatives {
  margin-bottom: 16px;
}

.alternatives-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.alternatives-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alternative-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.alternative-btn:hover {
  border-color: var(--accent-color);
  background: rgba(var(--accent-rgb), 0.05);
}

.alt-datetime {
  font-weight: 600;
  color: var(--text-primary);
}

.alt-score {
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.alt-score.high {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success-color);
}

.alt-score.medium {
  background: rgba(59, 130, 246, 0.2);
  color: var(--accent-color);
}

/* Tips */
.result-tips {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tip-item {
  font-size: 0.85rem;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.5);
  padding: 8px 12px;
  border-radius: 6px;
}

/* Responsive */
@media (max-width: 480px) {
  .datetime-row {
    grid-template-columns: 1fr;
  }

  .check-result {
    flex-direction: column;
    gap: 12px;
  }

  .result-icon {
    font-size: 1.5rem;
  }
}
</style>
