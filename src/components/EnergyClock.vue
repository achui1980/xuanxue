<template>
  <BaseCard class="energy-clock" elevated>
    <template #header>
      <h3 class="card-title">我的能量时钟</h3>
      <p class="card-subtitle">根据你的五行特征，不同时段适合不同的活动</p>
    </template>

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
              <span v-if="isCurrentHour(hour)" class="current-indicator" />
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
        <div class="legend-color high" />
        <span>非常适合</span>
      </div>
      <div class="legend-item">
        <div class="legend-color medium" />
        <span>适合</span>
      </div>
      <div class="legend-item">
        <div class="legend-color low" />
        <span>一般</span>
      </div>
      <div class="legend-item">
        <div class="legend-color current" />
        <span>当前时段</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!hasBirthInfo" class="clock-empty">
      <p>完善出生信息后，查看你的专属能量时钟</p>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePersonality } from '@/composables/usePersonality'
import { useEnergyStore } from '@/stores/energy'
import { useAppStore } from '@/stores/app'
import BaseCard from '@/components/common/BaseCard.vue'

const { hasBirthInfo, dominantElement, dayMasterInfo } = usePersonality()
const energyStore = useEnergyStore()
const appStore = useAppStore()

// 活动类型定义
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

const displayedHours = [0, 3, 6, 9, 12, 15, 18, 21]
const allHours = Array.from({ length: 24 }, (_, i) => i)

const selectedActivity = ref(null)
const selectedCell = ref(null)

const currentHour = computed(() => appStore.currentBeijingHour)

// 计算匹配度矩阵
const compatibilityMatrix = computed(() => {
  if (!hasBirthInfo.value || !dominantElement.value) {
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

function getDefaultCompatibility() {
  const matrix = {}

  activityTypes.forEach((activity) => {
    matrix[activity.id] = {}

    allHours.forEach((hour) => {
      let score = 50

      if (activity.timePreference === 'morning' && hour >= 8 && hour <= 12) {
        score = 80
      } else if (activity.timePreference === 'afternoon' && hour >= 13 && hour <= 17) {
        score = 80
      } else if (activity.timePreference === 'evening' && hour >= 18 && hour <= 21) {
        score = 75
      } else if (activity.timePreference === 'night' && (hour >= 22 || hour <= 2)) {
        score = 75
      } else if (hour >= 0 && hour <= 6) {
        score = 30
      }

      matrix[activity.id][hour] = {
        score,
        reason: getDefaultReason(activity, hour, score)
      }
    })
  })

  return matrix
}

function calculateCompatibility(activity, hour) {
  let score = 50
  let reasons = []

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

  if (dayMasterInfo.value) {
    const dayMaster = dayMasterInfo.value.char

    if (['甲', '乙'].includes(dayMaster) && activity.wuxing === 'wood' && hour >= 8 && hour <= 12) {
      score += 10
      reasons.push('甲木日主上午生发')
    }

    if (['丙', '丁'].includes(dayMaster) && activity.wuxing === 'fire' && hour >= 13) {
      score += 10
      reasons.push('火日主下午发光')
    }

    if (
      ['庚', '辛'].includes(dayMaster) &&
      activity.id === 'decision' &&
      hour >= 14 &&
      hour <= 17
    ) {
      score += 10
      reasons.push('金日主下午决断力强')
    }

    if (
      ['壬', '癸'].includes(dayMaster) &&
      activity.wuxing === 'water' &&
      (hour >= 22 || hour <= 3)
    ) {
      score += 10
      reasons.push('水日主深夜智慧涌流')
    }
  }

  const hourData = energyStore.getHourData(hour)
  if (hourData) {
    if (hourData.score >= 70) {
      score += 10
      reasons.push('此时段能量充沛')
    } else if (hourData.score <= 40) {
      score -= 15
      reasons.push('此时段能量较低')
    }

    if (
      hourData.recommendedActions.some(
        (a) => a.includes(activity.label) || activityMatches(activity, a)
      )
    ) {
      score += 15
      reasons.push('此时段天然适合')
    }
  }

  if (hour >= 0 && hour <= 5) {
    score -= 10
    if (!reasons.includes('深夜思维活跃') && !reasons.includes('水日主深夜智慧涌流')) {
      reasons.push('深夜需要休息')
    }
  }

  score = Math.max(0, Math.min(100, score))

  return {
    score,
    reason: reasons.length > 0 ? reasons.join('，') : '能量平稳'
  }
}

function isSupporting(from, to) {
  const supportMap = {
    wood: 'fire',
    fire: 'earth',
    earth: 'metal',
    metal: 'water',
    water: 'wood'
  }
  return supportMap[from] === to
}

function isRestricting(from, to) {
  const restrictMap = {
    wood: 'earth',
    earth: 'water',
    water: 'fire',
    fire: 'metal',
    metal: 'wood'
  }
  return restrictMap[from] === to
}

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

function getCellStyle(activityId, hour) {
  const data = compatibilityMatrix.value[activityId]?.[hour]
  if (!data) return {}

  const opacity = Math.max(0.2, data.score / 100)
  return {
    opacity,
    backgroundColor: getScoreColor(data.score)
  }
}

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

function isCurrentHour(hour) {
  return hour === currentHour.value
}

function getScoreColor(score) {
  if (score >= 80) return 'var(--wood)'
  if (score >= 60) return 'var(--water)'
  if (score >= 40) return 'var(--earth)'
  return 'var(--fire)'
}

function getScoreLevel(score) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

function selectActivity(activity) {
  selectedActivity.value = activity
}

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
  margin-bottom: var(--space-6);
}

.card-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: var(--space-1) 0 0;
}

.clock-container {
  display: flex;
  gap: var(--space-3);
  margin: var(--space-5) 0;
  overflow-x: auto;
}

/* Activity Labels */
.activity-labels {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding-top: 32px;
}

.activity-label {
  height: 32px;
  display: flex;
  align-items: center;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  white-space: nowrap;
  padding-right: var(--space-2);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: var(--radius-sm);
  padding-left: var(--space-2);
}

.activity-label:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.activity-label.selected {
  background: rgba(96, 165, 250, 0.1);
  color: var(--water);
  font-weight: var(--font-semibold);
}

/* Heatmap Container */
.heatmap-container {
  flex: 1;
  min-width: 0;
}

.time-labels {
  display: flex;
  gap: var(--space-1);
  margin-bottom: var(--space-1);
}

.time-label {
  flex: 1;
  text-align: center;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  min-width: 40px;
}

/* Heatmap Grid */
.heatmap-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.heatmap-row {
  display: flex;
  gap: var(--space-1);
}

.heatmap-cell {
  flex: 1;
  height: 32px;
  min-width: 40px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.heatmap-cell:hover {
  transform: scale(1.1);
  z-index: 10;
  box-shadow: var(--shadow-md);
}

.heatmap-cell.selected {
  box-shadow: 0 0 0 2px var(--water);
  z-index: 5;
}

.heatmap-cell.current {
  box-shadow: 0 0 0 2px var(--earth);
}

.heatmap-cell.current::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: var(--earth);
  border-radius: 50%;
}

.current-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  background: var(--earth);
  border-radius: 50%;
}

/* Cell Detail */
.cell-detail {
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  border-left: 4px solid var(--water);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.detail-activity {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--text-base);
}

.detail-time {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.detail-score {
  font-weight: var(--font-bold);
  margin-bottom: var(--space-2);
  font-size: var(--text-lg);
}

.detail-score.high {
  color: var(--wood);
}

.detail-score.medium {
  color: var(--water);
}

.detail-score.low {
  color: var(--fire);
}

.detail-reason {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

/* Legend */
.legend {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-sm);
}

.legend-color.high {
  background: var(--wood);
}

.legend-color.medium {
  background: var(--water);
}

.legend-color.low {
  background: var(--fire);
}

.legend-color.current {
  background: var(--earth);
  border-radius: 50%;
}

/* Empty State */
.clock-empty {
  text-align: center;
  padding: var(--space-10) var(--space-5);
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

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
    font-size: 11px;
  }
}
</style>
