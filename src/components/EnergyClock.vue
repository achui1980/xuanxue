<template>
  <div class="energy-clock">
    <div class="clock-header">
      <h3 class="clock-title">我的能量时钟</h3>
      <p class="clock-subtitle">根据你的五行特征，不同时段适合不同的活动</p>
    </div>

    <div v-if="hasBirthInfo" class="clock-container">
      <!-- 活动类型标签（左侧） -->
      <div class="activity-labels">
        <div
          v-for="activity in activityTypes"
          :key="activity.id"
          class="activity-label"
          :class="{ selected: selectedActivity?.id === activity.id }"
          @click="selectActivity(activity)"
        >
          {{ activity.label }}
        </div>
      </div>

      <!-- 热力图主体 -->
      <div class="heatmap-container">
        <!-- 时间标签（顶部） -->
        <div class="time-labels">
          <div v-for="hour in displayedHours" :key="hour" class="time-label">{{ hour }}点</div>
        </div>

        <!-- 热力图格子 -->
        <div class="heatmap-grid">
          <div v-for="activity in activityTypes" :key="activity.id" class="heatmap-row">
            <div
              v-for="hour in displayedHours"
              :key="hour"
              class="heatmap-cell"
              :class="getCellClasses(activity.id, hour)"
              :style="getCellStyle(activity.id, hour)"
              @click="selectCell(activity, hour)"
            >
              <span v-if="isCurrentHour(hour)" class="current-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 选中详情 -->
    <div v-if="selectedCell" class="cell-detail">
      <div class="detail-header">
        <span class="detail-activity">{{ selectedCell.activity.label }}</span>
        <span class="detail-time">{{ selectedCell.hour }}:00 - {{ selectedCell.hour }}:59</span>
      </div>
      <div class="detail-score" :class="getScoreLevel(selectedCell.score)">
        匹配度：{{ selectedCell.score }}%
      </div>
      <p class="detail-reason">{{ selectedCell.reason }}</p>
    </div>

    <!-- 图例 -->
    <div class="legend">
      <div class="legend-item">
        <div class="legend-color high"></div>
        <span>非常适合</span>
      </div>
      <div class="legend-item">
        <div class="legend-color medium"></div>
        <span>适合</span>
      </div>
      <div class="legend-item">
        <div class="legend-color low"></div>
        <span>一般</span>
      </div>
      <div class="legend-item">
        <div class="legend-color current"></div>
        <span>当前时段</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!hasBirthInfo" class="clock-empty">
      <p>完善出生信息后，查看你的专属能量时钟</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePersonality } from '@/composables/usePersonality'
import { useEnergyStore } from '@/stores/energy'
import { useAppStore } from '@/stores/app'

const { hasBirthInfo, dominantElement, dayMasterInfo } = usePersonality()
const energyStore = useEnergyStore()
const appStore = useAppStore()

// 活动类型定义（与 actionLibrary 对应）
const activityTypes = [
  { id: 'work', label: '专注工作', wuxing: 'wood', timePreference: 'morning' },
  { id: 'meeting', label: '开会沟通', wuxing: 'fire', timePreference: 'afternoon' },
  { id: 'study', label: '学习充电', wuxing: 'wood', timePreference: 'morning' },
  { id: 'sign', label: '签约合作', wuxing: 'metal', timePreference: 'afternoon' },
  { id: 'money', label: '投资理财', wuxing: 'earth', timePreference: 'morning' },
  { id: 'social', label: '社交聚会', wuxing: 'fire', timePreference: 'evening' },
  { id: 'exercise', label: '运动健身', wuxing: 'wood', timePreference: 'morning' },
  { id: 'create', label: '创意创作', wuxing: 'water', timePreference: 'night' },
  { id: 'decision', label: '重要决策', wuxing: 'metal', timePreference: 'afternoon' },
  { id: 'rest', label: '休息静养', wuxing: 'water', timePreference: 'night' }
]

// 显示的时间段（每3小时显示一个标签，但格子是每1小时）
const displayedHours = [0, 3, 6, 9, 12, 15, 18, 21]
const allHours = Array.from({ length: 24 }, (_, i) => i)

// 选中状态
const selectedActivity = ref(null)
const selectedCell = ref(null)

// 当前北京时
const currentHour = computed(() => appStore.currentBeijingHour)

// 计算匹配度矩阵
const compatibilityMatrix = computed(() => {
  if (!hasBirthInfo.value || !dominantElement.value) {
    // 默认通用匹配度
    return getDefaultCompatibility()
  }

  const matrix = {}

  activityTypes.forEach((activity) => {
    matrix[activity.id] = {}

    allHours.forEach((hour) => {
      matrix[activity.id][hour] = calculateCompatibility(activity, hour)
    })
  })

  return matrix
})

// 默认匹配度（无个人信息时）
function getDefaultCompatibility() {
  const matrix = {}

  activityTypes.forEach((activity) => {
    matrix[activity.id] = {}

    allHours.forEach((hour) => {
      let score = 50 // 基础分

      // 根据活动偏好时段调整
      if (activity.timePreference === 'morning' && hour >= 8 && hour <= 12) {
        score = 80
      } else if (activity.timePreference === 'afternoon' && hour >= 13 && hour <= 17) {
        score = 80
      } else if (activity.timePreference === 'evening' && hour >= 18 && hour <= 21) {
        score = 75
      } else if (activity.timePreference === 'night' && (hour >= 22 || hour <= 2)) {
        score = 75
      } else if (hour >= 0 && hour <= 6) {
        score = 30 // 深夜凌晨普遍较低
      }

      matrix[activity.id][hour] = {
        score,
        reason: getDefaultReason(activity, hour, score)
      }
    })
  })

  return matrix
}

// 计算个性化匹配度
function calculateCompatibility(activity, hour) {
  let score = 50 // 基础分
  let reasons = []

  // 1. 基于五行相生相克
  const userElement = dominantElement.value
  const activityElement = activity.wuxing

  if (userElement === activityElement) {
    score += 15
    reasons.push('与你主导五行同频')
  } else if (isSupporting(userElement, activityElement)) {
    score += 10
    reasons.push('生助你的五行')
  } else if (isRestricting(userElement, activityElement)) {
    score -= 10
    reasons.push('与你五行相克')
  }

  // 2. 基于时段偏好
  if (activity.timePreference === 'morning' && hour >= 8 && hour <= 12) {
    score += 15
    reasons.push('上午精力旺盛')
  } else if (activity.timePreference === 'afternoon' && hour >= 13 && hour <= 17) {
    score += 15
    reasons.push('下午适合此类活动')
  } else if (activity.timePreference === 'evening' && hour >= 18 && hour <= 21) {
    score += 10
    reasons.push('晚间社交黄金时段')
  } else if (activity.timePreference === 'night' && (hour >= 22 || hour <= 2)) {
    score += 10
    reasons.push('深夜思维活跃')
  }

  // 3. 基于日主特征
  if (dayMasterInfo.value) {
    const dayMaster = dayMasterInfo.value.char

    // 甲乙木日主：上午更适合创意
    if (['甲', '乙'].includes(dayMaster) && activity.wuxing === 'wood' && hour >= 8 && hour <= 12) {
      score += 10
      reasons.push('甲木日主上午生发')
    }

    // 丙丁火日主：下午晚上更适合表达
    if (['丙', '丁'].includes(dayMaster) && activity.wuxing === 'fire' && hour >= 13) {
      score += 10
      reasons.push('火日主下午发光')
    }

    // 庚辛金日主：下午更适合决策
    if (
      ['庚', '辛'].includes(dayMaster) &&
      activity.id === 'decision' &&
      hour >= 14 &&
      hour <= 17
    ) {
      score += 10
      reasons.push('金日主下午决断力强')
    }

    // 壬癸水日主：深夜更适合思考
    if (
      ['壬', '癸'].includes(dayMaster) &&
      activity.wuxing === 'water' &&
      (hour >= 22 || hour <= 3)
    ) {
      score += 10
      reasons.push('水日主深夜智慧涌流')
    }
  }

  // 4. 时段本身能量（从 energyStore 获取）
  const hourData = energyStore.getHourData(hour)
  if (hourData) {
    // 如果该时段本身分数高，加分
    if (hourData.score >= 70) {
      score += 10
      reasons.push('此时段能量充沛')
    } else if (hourData.score <= 40) {
      score -= 15
      reasons.push('此时段能量较低')
    }

    // 如果该活动是该时段推荐的，额外加分
    if (
      hourData.recommendedActions.some(
        (a) => a.includes(activity.label) || activityMatches(activity, a)
      )
    ) {
      score += 15
      reasons.push('此时段天然适合')
    }
  }

  // 深夜凌晨普遍降权
  if (hour >= 0 && hour <= 5) {
    score -= 10
    if (!reasons.includes('深夜思维活跃') && !reasons.includes('水日主深夜智慧涌流')) {
      reasons.push('深夜需要休息')
    }
  }

  // 限制在 0-100
  score = Math.max(0, Math.min(100, score))

  return {
    score,
    reason: reasons.length > 0 ? reasons.join('，') : '能量平稳'
  }
}

// 判断五行相生
function isSupporting(from, to) {
  const supportMap = {
    wood: 'fire', // 木生火
    fire: 'earth', // 火生土
    earth: 'metal', // 土生金
    metal: 'water', // 金生水
    water: 'wood' // 水生木
  }
  return supportMap[from] === to
}

// 判断五行相克
function isRestricting(from, to) {
  const restrictMap = {
    wood: 'earth', // 木克土
    earth: 'water', // 土克水
    water: 'fire', // 水克火
    fire: 'metal', // 火克金
    metal: 'wood' // 金克木
  }
  return restrictMap[from] === to
}

// 检查活动是否匹配推荐动作
function activityMatches(activity, actionText) {
  const keywords = {
    work: ['工作', '专注', '深度'],
    meeting: ['会议', '沟通', '谈判'],
    study: ['学习', '阅读', '充电'],
    sign: ['签约', '合作', '法律'],
    money: ['理财', '投资', '财务'],
    social: ['社交', '聚会', '表达'],
    exercise: ['运动', '健身', '锻炼'],
    create: ['创作', '创意', '写作'],
    decision: ['决策', '决定', '判断'],
    rest: ['休息', '冥想', '静养']
  }

  const activityKeywords = keywords[activity.id] || []
  return activityKeywords.some((kw) => actionText.includes(kw))
}

// 默认原因
function getDefaultReason(activity, hour, score) {
  if (score >= 80) {
    if (activity.timePreference === 'morning') return '上午精力充沛，适合此类活动'
    if (activity.timePreference === 'afternoon') return '下午思维清晰，效率较高'
    if (activity.timePreference === 'evening') return '晚间氛围适合此类活动'
    if (activity.timePreference === 'night') return '深夜安静，适合深度工作'
  } else if (score <= 40) {
    return '此时段能量较低，建议休息或安排轻松活动'
  }
  return '能量平稳，可以正常进行'
}

// 获取格子样式
function getCellStyle(activityId, hour) {
  const data = compatibilityMatrix.value[activityId]?.[hour]
  if (!data) return {}

  const opacity = Math.max(0.2, data.score / 100)
  return {
    opacity,
    backgroundColor: getScoreColor(data.score)
  }
}

// 获取格子类名
function getCellClasses(activityId, hour) {
  const data = compatibilityMatrix.value[activityId]?.[hour]
  if (!data) return []

  const classes = []

  if (isCurrentHour(hour)) {
    classes.push('current')
  }

  if (selectedCell.value?.activity.id === activityId && selectedCell.value?.hour === hour) {
    classes.push('selected')
  }

  return classes
}

// 判断是否为当前时段
function isCurrentHour(hour) {
  return hour === currentHour.value
}

// 获取分数颜色
function getScoreColor(score) {
  if (score >= 80) return 'var(--success-color)'
  if (score >= 60) return 'var(--accent-color)'
  if (score >= 40) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

// 获取分数等级
function getScoreLevel(score) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

// 选择活动
function selectActivity(activity) {
  selectedActivity.value = activity
}

// 选择格子
function selectCell(activity, hour) {
  const data = compatibilityMatrix.value[activity.id]?.[hour]
  if (data) {
    selectedCell.value = {
      activity,
      hour,
      score: data.score,
      reason: data.reason
    }
  }
}
</script>

<style scoped>
.energy-clock {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  margin-bottom: 24px;
}

.clock-header {
  margin-bottom: 20px;
}

.clock-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--header-text);
  margin: 0 0 8px 0;
}

.clock-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
}

.clock-container {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
}

/* Activity Labels */
.activity-labels {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 32px; /* Align with time labels */
}

.activity-label {
  height: 32px;
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  padding-right: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
  padding-left: 8px;
}

.activity-label:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.activity-label.selected {
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-color);
  font-weight: 600;
}

/* Heatmap Container */
.heatmap-container {
  flex: 1;
  min-width: 0;
}

.time-labels {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.time-label {
  flex: 1;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  min-width: 40px;
}

/* Heatmap Grid */
.heatmap-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.heatmap-row {
  display: flex;
  gap: 4px;
}

.heatmap-cell {
  flex: 1;
  height: 32px;
  min-width: 40px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.heatmap-cell:hover {
  transform: scale(1.1);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.heatmap-cell.selected {
  box-shadow: 0 0 0 2px var(--accent-color);
  z-index: 5;
}

.heatmap-cell.current {
  box-shadow: 0 0 0 2px var(--warning-color);
}

.heatmap-cell.current::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: var(--warning-color);
  border-radius: 50%;
}

.current-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  background: var(--warning-color);
  border-radius: 50%;
}

/* Cell Detail */
.cell-detail {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 4px solid var(--accent-color);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detail-activity {
  font-weight: 600;
  color: var(--header-text);
  font-size: 1rem;
}

.detail-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.detail-score {
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.detail-score.high {
  color: var(--success-color);
}

.detail-score.medium {
  color: var(--accent-color);
}

.detail-score.low {
  color: var(--danger-color);
}

.detail-reason {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Legend */
.legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.high {
  background: var(--success-color);
}

.legend-color.medium {
  background: var(--accent-color);
}

.legend-color.low {
  background: var(--danger-color);
}

.legend-color.current {
  background: var(--warning-color);
  border-radius: 50%;
}

/* Empty State */
.clock-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .clock-container {
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
  }

  .time-labels {
    min-width: 360px;
  }

  .heatmap-grid {
    min-width: 360px;
  }

  .activity-label {
    font-size: 0.75rem;
  }
}
</style>
