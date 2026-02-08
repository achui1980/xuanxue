<template>
  <BaseCard class="best-timing-query feature-card" elevated>
    <template #header>
      <div class="feature-header">
        <div class="feature-icon">
          <AppIcon name="trophy" size="xl" />
        </div>
        <div class="feature-title-group">
          <h3 class="card-title">最佳时机查询</h3>
          <p class="card-subtitle">选择活动，找到未来7天最佳时机</p>
        </div>
      </div>
    </template>

    <div class="hero-guide">
      <p class="guide-text">
        <AppIcon name="star" size="sm" />
        不知道何时开始重要事项？让我们帮你找到最适合的时间
      </p>
    </div>

    <div class="query-form">
      <div class="form-row">
        <label class="form-label">我想</label>
        <select v-model="selectedActivity" class="input select">
          <option value="">选择一个事项...</option>
          <option v-for="activity in activityOptions" :key="activity.id" :value="activity.id">
            {{ activity.label }}
          </option>
        </select>
      </div>

      <div class="form-row">
        <label class="form-label">时间段偏好</label>
        <div class="time-preferences">
          <label class="preference-checkbox">
            <input type="checkbox" v-model="timePrefs.morning" />
            <span>上午</span>
          </label>
          <label class="preference-checkbox">
            <input type="checkbox" v-model="timePrefs.afternoon" />
            <span>下午</span>
          </label>
          <label class="preference-checkbox">
            <input type="checkbox" v-model="timePrefs.evening" />
            <span>晚间</span>
          </label>
        </div>
      </div>

      <button class="btn btn-primary btn-full" @click="executeQuery" :disabled="!selectedActivity">
        <AppIcon name="search" size="sm" />
        查询最佳时机
      </button>
    </div>

    <!-- 查询结果 -->
    <div v-if="queryResults.length > 0" class="query-results">
      <div class="results-header">
        <span class="results-title">推荐时段（按匹配度排序）</span>
        <span class="results-count">共 {{ queryResults.length }} 个</span>
      </div>

      <div class="result-list">
        <div
          v-for="(result, index) in queryResults.slice(0, 5)"
          :key="index"
          class="result-item"
          :class="{ top: index === 0 }"
        >
          <div class="result-rank">
            <span v-if="index === 0" class="rank-badge gold">
              <AppIcon name="trophy" size="lg" />
            </span>
            <span v-else-if="index === 1" class="rank-badge silver">
              <AppIcon name="medal" size="lg" />
            </span>
            <span v-else-if="index === 2" class="rank-badge bronze">
              <AppIcon name="medal" size="lg" />
            </span>
            <span v-else class="rank-number">{{ index + 1 }}</span>
          </div>

          <div class="result-content">
            <div class="result-datetime">
              <span class="result-date">{{ result.date }}</span>
              <span class="result-time">{{ result.time }}</span>
            </div>

            <div class="result-score" :class="getScoreLevel(result.score)">
              匹配度 {{ result.score }}%
            </div>

            <div class="result-reasons">
              <span v-for="reason in result.reasons.slice(0, 2)" :key="reason" class="reason-tag">
                {{ reason }}
              </span>
            </div>
          </div>

          <button class="btn btn-primary btn-sm result-action" @click="jumpToTime(result)">
            查看
          </button>
        </div>
      </div>

      <div class="results-tip">
        <AppIcon name="lightbulb" size="sm" />
        <span>建议优先选择前3个时段，匹配度越高，成功率越大</span>
      </div>
    </div>

    <!-- 无结果提示 -->
    <div v-else-if="hasQueried" class="no-results">
      <AppIcon name="info" size="lg" />
      <p>未找到合适的时段，建议调整时间段偏好或更换活动类型</p>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { usePersonality } from '@/composables/usePersonality'
import { useEnergyStore } from '@/stores/energy'
import { calculateBaZi, calculateHourEnergy, HEAVENLY_STEM_ELEMENTS } from '@/utils/tyme'
import BaseCard from '@/components/common/BaseCard.vue'
import AppIcon from '@/components/icons/AppIcon.vue'

const userStore = useUserStore()
const appStore = useAppStore()
const energyStore = useEnergyStore()
const { hasBirthInfo, dominantElement, favorableElements } = usePersonality()

const selectedActivity = ref('')
const hasQueried = ref(false)
const queryResults = ref([])

const timePrefs = ref({
  morning: true,
  afternoon: true,
  evening: false
})

// 活动选项
const activityOptions = [
  { id: 'work', label: '专注工作', wuxing: 'wood', keywords: ['专注', '深度', '工作'] },
  { id: 'meeting', label: '开会沟通', wuxing: 'fire', keywords: ['会议', '沟通', '谈判'] },
  { id: 'study', label: '学习充电', wuxing: 'wood', keywords: ['学习', '阅读', '研究'] },
  { id: 'sign', label: '签约合作', wuxing: 'metal', keywords: ['签约', '合作', '协议'] },
  { id: 'money', label: '投资理财', wuxing: 'earth', keywords: ['投资', '理财', '财务'] },
  { id: 'social', label: '社交聚会', wuxing: 'fire', keywords: ['社交', '聚会', '人脉'] },
  { id: 'exercise', label: '运动健身', wuxing: 'wood', keywords: ['运动', '健身', '锻炼'] },
  { id: 'create', label: '创意创作', wuxing: 'water', keywords: ['创意', '创作', '写作'] },
  { id: 'decision', label: '重要决策', wuxing: 'metal', keywords: ['决策', '决定', '判断'] },
  { id: 'rest', label: '休息静养', wuxing: 'water', keywords: ['休息', '冥想', '放松'] }
]

function getScoreLevel(score) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

function executeQuery() {
  if (!selectedActivity.value) return

  hasQueried.value = true
  const activity = activityOptions.find((a) => a.id === selectedActivity.value)
  if (!activity) return

  const results = []
  const today = new Date()

  // 遍历未来7天
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today)
    date.setDate(today.getDate() + dayOffset)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    // 根据时间段偏好检查不同时段
    const timeSlots = []
    if (timePrefs.value.morning) {
      timeSlots.push({ hour: 10, label: '10:00-11:59', period: 'morning' })
    }
    if (timePrefs.value.afternoon) {
      timeSlots.push({ hour: 14, label: '14:00-15:59', period: 'afternoon' })
      timeSlots.push({ hour: 16, label: '16:00-17:59', period: 'afternoon' })
    }
    if (timePrefs.value.evening) {
      timeSlots.push({ hour: 20, label: '20:00-21:59', period: 'evening' })
    }

    timeSlots.forEach((slot) => {
      const result = calculateMatchScore(year, month, day, slot.hour, activity)
      const score = result.score

      if (score >= 50) {
        results.push({
          date: `${month}月${day}日`,
          fullDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          time: slot.label,
          hour: slot.hour,
          score,
          reasons: generateReasons(score, activity, slot.period),
          activity: activity.label
        })
      }
    })
  }

  // 按分数排序
  results.sort((a, b) => b.score - a.score)
  queryResults.value = results
}

function calculateMatchScore(year, month, day, hour, activity) {
  let score = 50
  const reasons = []

  const baseScoreByType = {
    work: 55,
    meeting: 52,
    study: 55,
    sign: 48,
    money: 48,
    social: 52,
    exercise: 58,
    create: 50,
    decision: 45,
    rest: 60
  }

  score = baseScoreByType[activity.id] || 50

  if (hasBirthInfo.value) {
    const dayBazi = calculateBaZi(year, month, day, 12)
    const hourBazi = calculateBaZi(year, month, day, hour)

    if (dayBazi && hourBazi) {
      const energyScore = calculateHourEnergy(
        userStore.profile.bazi,
        {
          favorable: userStore.profile.favorable,
          unfavorable: userStore.profile.unfavorable
        },
        dayBazi,
        hourBazi,
        false
      )

      score = score * 0.85 + energyScore * 0.15

      const hourElement = HEAVENLY_STEM_ELEMENTS[hourBazi.stem]
      if (hourElement === activity.wuxing) {
        score += 12
        reasons.push('时辰五行匹配')
      } else if (favorableElements.value.includes(hourElement)) {
        score += 8
        reasons.push('喜用神时辰')
      }

      const dayElement = HEAVENLY_STEM_ELEMENTS[dayBazi.day.stem]
      if (dayElement === activity.wuxing) {
        score += 5
        reasons.push('当日五行助力')
      } else if (favorableElements.value.includes(dayElement)) {
        score += 3
        reasons.push('吉日')
      }
    }
  } else {
    const hourData = energyStore.getHourData(hour)
    if (hourData) {
      let hourScore = hourData.score

      const matchesActivity = hourData.recommendedActions.some((action) =>
        activity.keywords.some((kw) => action.includes(kw))
      )

      if (matchesActivity) {
        hourScore += 15
      }

      score = score * 0.5 + hourScore * 0.5
    }
  }

  const hourInRange =
    activity.timePreference === 'morning' && hour >= 8 && hour <= 12
      ? 20
      : activity.timePreference === 'afternoon' && hour >= 13 && hour <= 17
        ? 20
        : activity.timePreference === 'evening' && hour >= 18 && hour <= 21
          ? 15
          : activity.timePreference === 'night' && (hour >= 22 || hour <= 2)
            ? 15
            : 0

  if (hourInRange > 0) {
    score += hourInRange
    const timeLabels = {
      morning: '上午黄金时段',
      afternoon: '下午高效时段',
      evening: '晚间适宜时段',
      night: '深夜安静时段'
    }
    reasons.push(timeLabels[activity.timePreference])
  }

  if (hour >= 0 && hour <= 5 && activity.timePreference !== 'night') {
    score -= 20
    reasons.push('深夜不宜此活动')
  }

  score = Math.max(20, Math.min(95, Math.round(score)))

  return {
    score,
    reason: reasons.length > 0 ? reasons.join('，') : '能量平稳'
  }
}

function generateReasons(score, activity, period) {
  const reasons = []

  if (score >= 85) {
    reasons.push('五行高度相合')
  } else if (score >= 70) {
    reasons.push('能量充沛')
  }

  if (activity.wuxing === dominantElement.value) {
    reasons.push('与你主导五行同频')
  }

  const periodText = {
    morning: '上午精力旺盛',
    afternoon: '下午思维清晰',
    evening: '晚间氛围适合'
  }
  reasons.push(periodText[period])

  return reasons
}

function jumpToTime(result) {
  appStore.setSelectedHour(result.hour)
  appStore.setActiveTab('today')
}
</script>

<style scoped>
.best-timing-query {
  margin-bottom: 0;
}

/* Feature Card Styles */
.feature-card :deep(.card-header) {
  background: linear-gradient(135deg, rgba(232, 196, 102, 0.1) 0%, transparent 100%);
  border-bottom: 1px solid rgba(232, 196, 102, 0.2);
  margin: calc(-1 * var(--space-5)) calc(-1 * var(--space-5)) var(--space-5);
  padding: var(--space-5);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.feature-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.feature-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--metal) 0%, var(--metal-dim) 100%);
  color: var(--ink-black);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.feature-title-group {
  flex: 1;
}

.card-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
}

.card-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: var(--space-1) 0 0;
}

/* Hero Guide */
.hero-guide {
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  background: rgba(232, 196, 102, 0.08);
  border-radius: var(--radius-lg);
  border-left: 3px solid var(--metal);
}

.guide-text {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  font-size: var(--text-sm);
  color: var(--metal);
}

.guide-text svg {
  flex-shrink: 0;
}

.query-form {
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

.time-preferences {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.preference-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.preference-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--water);
}

.btn-full {
  width: 100%;
}

/* Query Results */
.query-results {
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

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.results-title {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.results-count {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  background: var(--bg-elevated);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.result-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  border: 1px solid var(--border-subtle);
}

.result-item:hover {
  background: var(--ink-medium);
  border-color: var(--border-light);
}

.result-item.top {
  background: rgba(74, 222, 128, 0.1);
  border-color: rgba(74, 222, 128, 0.3);
}

.result-rank {
  flex-shrink: 0;
  width: 36px;
  text-align: center;
}

.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-badge.gold {
  color: var(--metal);
}

.rank-badge.silver {
  color: var(--text-secondary);
}

.rank-badge.bronze {
  color: #cd7f32;
}

.rank-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--bg-secondary);
  border-radius: 50%;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-datetime {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.result-date {
  font-weight: var(--font-bold);
  color: var(--text-primary);
  font-size: var(--text-base);
}

.result-time {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.result-score {
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
  margin-bottom: var(--space-1);
}

.result-score.high {
  color: var(--wood);
}

.result-score.medium {
  color: var(--water);
}

.result-score.low {
  color: var(--fire);
}

.result-reasons {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.reason-tag {
  font-size: var(--text-xs);
  background: var(--bg-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.result-action {
  flex-shrink: 0;
}

.results-tip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding: var(--space-3);
  background: rgba(96, 165, 250, 0.1);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--water);
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
  padding: var(--space-8) var(--space-5);
  color: var(--text-secondary);
}

.no-results p {
  margin: 0;
}

@media (max-width: 480px) {
  .time-preferences {
    flex-direction: column;
    gap: var(--space-2);
  }

  .result-datetime {
    flex-direction: column;
    gap: var(--space-1);
  }

  .result-item {
    flex-wrap: wrap;
  }

  .result-action {
    width: 100%;
    margin-top: var(--space-2);
  }
}
</style>
