<template>
  <div class="best-timing-query">
    <div class="query-header">
      <h3 class="query-title">最佳时机查询</h3>
      <p class="query-subtitle">我想做某事，未来7天什么时候最好？</p>
    </div>

    <div class="query-form">
      <div class="form-row">
        <label class="form-label">我想</label>
        <select v-model="selectedActivity" class="activity-select">
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

      <button class="query-btn" @click="executeQuery" :disabled="!selectedActivity">
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
            <span v-if="index === 0" class="rank-badge gold">🥇</span>
            <span v-else-if="index === 1" class="rank-badge silver">🥈</span>
            <span v-else-if="index === 2" class="rank-badge bronze">🥉</span>
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

          <button class="result-action" @click="jumpToTime(result)">查看</button>
        </div>
      </div>

      <div class="results-tip">💡 建议优先选择前3个时段，匹配度越高，成功率越大</div>
    </div>

    <!-- 无结果提示 -->
    <div v-else-if="hasQueried" class="no-results">
      <p>未找到合适的时段，建议调整时间段偏好或更换活动类型</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { usePersonality } from '@/composables/usePersonality'
import { useEnergyStore } from '@/stores/energy'
import { calculateBaZi, calculateHourEnergy, HEAVENLY_STEM_ELEMENTS } from '@/utils/tyme'

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

// 活动选项（简化版，与EnergyClock对应）
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

// 获取分数等级
function getScoreLevel(score) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

// 执行查询
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
        // 只记录及格以上的
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

// 计算匹配分数（使用V2算法）
function calculateMatchScore(year, month, day, hour, activity) {
  let score = 50 // 基础分
  const reasons = []

  // 1. 使用V2算法计算八字时辰能量（核心）
  if (hasBirthInfo.value) {
    const dayBazi = calculateBaZi(year, month, day, 12) // 日柱
    const hourBazi = calculateBaZi(year, month, day, hour)

    if (dayBazi && hourBazi) {
      const energyScore = calculateHourEnergy(
        userStore.profile.bazi,
        {
          favorable: userStore.profile.favorable,
          unfavorable: userStore.profile.unfavorable
        },
        dayBazi, // V2新增：日柱
        hourBazi, // 时辰
        false
      )

      // 八字能量占60%权重
      score = energyScore * 0.6 + 50 * 0.4

      // 2. 五行匹配（活动五行 vs 时辰五行）
      const hourElement = HEAVENLY_STEM_ELEMENTS[hourBazi.stem]
      if (hourElement === activity.wuxing) {
        score += 12 // 同五行加分
        reasons.push('时辰与活动五行同频')
      } else if (favorableElements.value.includes(hourElement)) {
        score += 8 // 喜用神时辰加分
        reasons.push('喜用神时辰')
      }

      // 3. 日柱五行匹配（额外加成）
      const dayElement = HEAVENLY_STEM_ELEMENTS[dayBazi.day.stem]
      if (dayElement === activity.wuxing) {
        score += 8
        reasons.push('当日五行助力')
      }
    }
  } else {
    // 无个人信息时，使用通用时段能量
    const hourData = energyStore.getHourData(hour)
    if (hourData) {
      score = hourData.score
    }
  }

  // 4. 时段偏好匹配
  const hourData = energyStore.getHourData(hour)
  if (hourData) {
    // 如果活动匹配该时段推荐
    const isRecommended = hourData.recommendedActions.some((action) =>
      activity.keywords.some((kw) => action.includes(kw))
    )
    if (isRecommended) {
      score += 10
      reasons.push('此时段天然适合')
    }
  }

  // 5. 时段类型加成（上午/下午/晚上）
  if (activity.timePreference === 'morning' && hour >= 8 && hour <= 12) {
    score += 8
    reasons.push('上午精力旺盛')
  } else if (activity.timePreference === 'afternoon' && hour >= 13 && hour <= 17) {
    score += 8
    reasons.push('下午思维清晰')
  } else if (activity.timePreference === 'evening' && hour >= 18 && hour <= 21) {
    score += 5
    reasons.push('晚间氛围适合')
  } else if (activity.timePreference === 'night' && (hour >= 22 || hour <= 2)) {
    score += 5
    reasons.push('深夜思维活跃')
  }

  // 深夜普遍降权（除非是night活动）
  if (hour >= 0 && hour <= 5 && activity.timePreference !== 'night') {
    score -= 15
    reasons.push('深夜能量较低')
  }

  // 限制在 20-95 范围内
  score = Math.max(20, Math.min(95, Math.round(score)))

  return {
    score,
    reason: reasons.length > 0 ? reasons.join('，') : '能量平稳'
  }
}

// 生成原因说明
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

// 跳转到具体时段
function jumpToTime(result) {
  // 设置选中的小时并切换到Today Tab
  appStore.setSelectedHour(result.hour)
  appStore.setActiveTab('today')
}
</script>

<style scoped>
.best-timing-query {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  margin-bottom: 24px;
}

.query-header {
  margin-bottom: 20px;
}

.query-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--header-text);
  margin: 0 0 8px 0;
}

.query-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Query Form */
.query-form {
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

.activity-select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
}

.activity-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
}

.time-preferences {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.preference-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.preference-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent-color);
}

.query-btn {
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

.query-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.query-btn:disabled {
  background: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
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
  margin-bottom: 16px;
}

.results-title {
  font-weight: 600;
  color: var(--header-text);
  font-size: 0.95rem;
}

.results-count {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 4px 10px;
  border-radius: 10px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--bg-secondary);
  border-radius: 12px;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.result-item:hover {
  background: var(--card-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-item.top {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.result-rank {
  flex-shrink: 0;
  width: 36px;
  text-align: center;
}

.rank-badge {
  font-size: 1.5rem;
  line-height: 1;
}

.rank-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--bg-primary);
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-datetime {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}

.result-date {
  font-weight: 700;
  color: var(--header-text);
  font-size: 1rem;
}

.result-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.result-score {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 6px;
}

.result-score.high {
  color: var(--success-color);
}

.result-score.medium {
  color: var(--accent-color);
}

.result-score.low {
  color: var(--danger-color);
}

.result-reasons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.reason-tag {
  font-size: 0.75rem;
  background: var(--card-bg);
  padding: 2px 8px;
  border-radius: 4px;
  color: var(--text-secondary);
}

.result-action {
  flex-shrink: 0;
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.result-action:hover {
  background: var(--accent-hover);
}

.results-tip {
  margin-top: 16px;
  padding: 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--accent-color);
  text-align: center;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 30px 20px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 480px) {
  .time-preferences {
    flex-direction: column;
    gap: 8px;
  }

  .result-datetime {
    flex-direction: column;
    gap: 4px;
  }

  .result-item {
    flex-wrap: wrap;
  }

  .result-action {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
