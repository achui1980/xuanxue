<template>
  <BaseCard class="future-planner" elevated>
    <template #header>
      <div class="planner-header-row">
        <div>
          <h3 class="card-title">未来7天规划</h3>
          <p class="card-subtitle">提前了解每日运势</p>
        </div>
        <div class="nav-arrows">
          <button class="nav-btn" @click="shiftDays(-1)" :disabled="shiftOffset <= 0">
            <AppIcon name="arrow-left" size="sm" />
          </button>
          <button class="nav-btn" @click="shiftDays(1)" :disabled="shiftOffset >= 7">
            <AppIcon name="arrow-right" size="sm" />
          </button>
        </div>
      </div>
    </template>

    <div v-if="hasBirthInfo" class="calendar-container">
      <!-- 横向日历 -->
      <div class="calendar-row">
        <div
          v-for="day in weekDays"
          :key="day.date"
          class="day-card"
          :class="getDayClasses(day)"
          @click="selectDay(day)"
        >
          <div class="day-header">
            <span class="day-name">{{ day.dayName }}</span>
            <span class="day-date">{{ day.shortDate }}</span>
          </div>

          <div class="day-score" :class="getScoreLevel(day.score)">{{ day.score }}分</div>

          <div class="day-tags">
            <span v-for="tag in day.topTags.slice(0, 2)" :key="tag" class="day-tag">
              {{ tag }}
            </span>
          </div>

          <div class="day-activities">
            <div class="activity-hint">
              <span class="hint-label do">宜</span>
              <span class="hint-value">{{ day.bestActivity }}</span>
            </div>
            <div class="activity-hint avoid">
              <span class="hint-label avoid">忌</span>
              <span class="hint-value">{{ day.avoidActivity }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 选中日期详情 -->
      <div v-if="selectedDay" class="day-detail">
        <div class="detail-header">
          <span class="detail-date">{{ selectedDay.fullDate }}</span>
          <span class="detail-score" :class="getScoreLevel(selectedDay.score)">
            综合能量 {{ selectedDay.score }}分
          </span>
        </div>

        <div class="detail-section">
          <div class="section-title">当日八字</div>
          <div class="bazi-display">
            <span class="bazi-pillar">{{ selectedDay.bazi.year }}</span>
            <span class="bazi-pillar">{{ selectedDay.bazi.month }}</span>
            <span class="bazi-pillar day">{{ selectedDay.bazi.day }}</span>
            <span class="bazi-pillar">日柱主导</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">全天建议</div>
          <div class="time-slots">
            <div
              v-for="slot in selectedDay.timeSlots"
              :key="slot.hour"
              class="time-slot"
              :class="getSlotClasses(slot)"
            >
              <span class="slot-time">{{ slot.timeLabel }}</span>
              <span class="slot-score">{{ slot.score }}分</span>
              <span class="slot-activity">{{ slot.bestActivity }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">宜忌总结</div>
          <div class="pros-cons">
            <div class="pros">
              <AppIcon name="check" size="sm" />
              <span class="pros-label">适合</span>
              <span>{{ selectedDay.pros.join('、') }}</span>
            </div>
            <div class="cons">
              <AppIcon name="close" size="sm" />
              <span class="cons-label">避免</span>
              <span>{{ selectedDay.cons.join('、') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="planner-empty">
      <div class="empty-icon">
        <AppIcon name="calendar" size="xl" />
      </div>
      <p class="empty-text">完善出生信息后，查看未来7天规划建议</p>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePersonality } from '@/composables/usePersonality'
import {
  calculateBaZi,
  calculateHourEnergy,
  getActivitiesByElement,
  getAvoidActivitiesByElement,
  HEAVENLY_STEM_ELEMENTS
} from '@/utils/tyme'
import BaseCard from '@/components/common/BaseCard.vue'
import AppIcon from '@/components/icons/AppIcon.vue'

const userStore = useUserStore()
const { hasBirthInfo, favorableElements } = usePersonality()

const shiftOffset = ref(0)
const selectedDay = ref(null)

const weekNames = ['日', '一', '二', '三', '四', '五', '六']

const weekDays = computed(() => {
  if (!hasBirthInfo.value) return []

  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i + shiftOffset.value)

    const dayData = calculateDayData(date)
    days.push(dayData)
  }

  return days
})

const dateRangeLabel = computed(() => {
  if (weekDays.value.length === 0) return ''
  const start = weekDays.value[0].shortDate
  const end = weekDays.value[6].shortDate
  return `${start} - ${end}`
})

function calculateDayData(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayOfWeek = date.getDay()

  const dayBazi = calculateBaZi(year, month, day, 12)

  const morningScore = calculateSlotScore(year, month, day, 10)
  const afternoonScore = calculateSlotScore(year, month, day, 14)
  const eveningScore = calculateSlotScore(year, month, day, 20)

  const avgScore = Math.round((morningScore + afternoonScore + eveningScore) / 3)

  const dayElement = HEAVENLY_STEM_ELEMENTS[dayBazi.day.stem]
  const bestActivities = getActivitiesByElement(dayElement)
  const avoidActivities = getAvoidActivitiesByElement(dayElement)

  const tags = generateDayTags(avgScore, dayElement)

  const timeSlots = [
    {
      hour: 9,
      timeLabel: '上午',
      score: morningScore,
      bestActivity: bestActivities[0] || '专注工作'
    },
    {
      hour: 14,
      timeLabel: '下午',
      score: afternoonScore,
      bestActivity: bestActivities[1] || '会议沟通'
    },
    {
      hour: 20,
      timeLabel: '晚间',
      score: eveningScore,
      bestActivity: bestActivities[2] || '休息放松'
    }
  ]

  return {
    date: date.toISOString().split('T')[0],
    fullDate: `${year}年${month}月${day}日 周${weekNames[dayOfWeek]}`,
    shortDate: `${month}/${day}`,
    dayName: weekNames[dayOfWeek],
    score: avgScore,
    bazi: {
      year: dayBazi.year.full,
      month: dayBazi.month.full,
      day: dayBazi.day.full
    },
    topTags: tags,
    bestActivity: bestActivities[0] || '专注工作',
    avoidActivity: avoidActivities[0] || '重大决策',
    timeSlots,
    pros: bestActivities.slice(0, 3),
    cons: avoidActivities.slice(0, 2)
  }
}

function calculateSlotScore(year, month, day, hour) {
  const dayBazi = calculateBaZi(year, month, day, 12)
  const hourBazi = calculateBaZi(year, month, day, hour)
  if (!dayBazi || !hourBazi) return 50

  return calculateHourEnergy(
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

function generateDayTags(score, element) {
  const tags = []

  if (score >= 80) tags.push('吉日')
  else if (score >= 60) tags.push('平吉')
  else tags.push('谨慎')

  if (favorableElements.value.includes(element)) {
    tags.push(`喜${element}`)
  }

  return tags
}

function getScoreLevel(score) {
  if (score >= 75) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

function getDayClasses(day) {
  const classes = []
  classes.push(getScoreLevel(day.score))

  if (selectedDay.value?.date === day.date) {
    classes.push('selected')
  }

  const today = new Date().toISOString().split('T')[0]
  if (day.date === today) {
    classes.push('today')
  }

  return classes
}

function getSlotClasses(slot) {
  return getScoreLevel(slot.score)
}

function selectDay(day) {
  selectedDay.value = day
}

function shiftDays(offset) {
  shiftOffset.value = Math.max(0, Math.min(7, shiftOffset.value + offset))
  selectedDay.value = null
}

watch(
  weekDays,
  (days) => {
    if (days.length > 0 && !selectedDay.value) {
      selectedDay.value = days[0]
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.future-planner {
  margin-bottom: 0;
}

/* Compact Header */
.planner-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2);
}

.card-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.card-subtitle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin: var(--space-1) 0 0;
}

.nav-arrows {
  display: flex;
  gap: var(--space-1);
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.nav-btn:hover:not(:disabled) {
  background: var(--ink-medium);
  border-color: var(--water);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.calendar-container {
  margin-top: var(--space-3);
}

/* Calendar Row - Optimized for medium card */
.calendar-row {
  display: flex;
  gap: var(--space-1);
  overflow-x: auto;
  padding-bottom: var(--space-2);
  -webkit-overflow-scrolling: touch;
}

.day-card {
  flex: 1;
  min-width: 70px;
  max-width: 90px;
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.day-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.day-card.selected {
  border-color: var(--water);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.day-card.today {
  position: relative;
}

.day-card.today::after {
  content: '今天';
  position: absolute;
  top: -8px;
  right: var(--space-2);
  background: var(--water);
  color: var(--ink-black);
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-weight: var(--font-bold);
}

.day-card.high {
  background: rgba(74, 222, 128, 0.1);
  border-color: rgba(74, 222, 128, 0.3);
}

.day-card.medium {
  background: rgba(96, 165, 250, 0.1);
  border-color: rgba(96, 165, 250, 0.3);
}

.day-card.low {
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.3);
}

.day-header {
  text-align: center;
  margin-bottom: var(--space-1);
}

.day-name {
  font-size: 11px;
  color: var(--text-secondary);
  display: block;
}

.day-date {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.day-score {
  text-align: center;
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
  margin-bottom: var(--space-1);
}

.day-score.high {
  color: var(--wood);
}

.day-score.medium {
  color: var(--water);
}

.day-score.low {
  color: var(--fire);
}

.day-tags {
  display: flex;
  gap: var(--space-1);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--space-2);
}

.day-tag {
  font-size: var(--text-xs);
  background: var(--bg-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.day-activities {
  font-size: var(--text-xs);
}

.activity-hint {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-1);
}

.activity-hint.avoid {
  opacity: 0.7;
}

.hint-label {
  font-weight: var(--font-bold);
  padding: 3px 6px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  min-width: 20px;
  text-align: center;
}

.hint-label.do {
  background: rgba(74, 222, 128, 0.2);
  color: var(--wood);
}

.hint-label.avoid {
  background: rgba(248, 113, 113, 0.2);
  color: var(--fire);
}

.hint-value {
  color: var(--text-primary);
  text-align: right;
  flex: 1;
  margin-left: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Day Detail */
.day-detail {
  margin-top: var(--space-5);
  padding: var(--space-5);
  background: var(--bg-elevated);
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

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-subtle);
}

.detail-date {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.detail-score {
  font-weight: var(--font-bold);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
}

.detail-score.high {
  background: rgba(74, 222, 128, 0.2);
  color: var(--wood);
}

.detail-score.medium {
  background: rgba(96, 165, 250, 0.2);
  color: var(--water);
}

.detail-score.low {
  background: rgba(248, 113, 113, 0.2);
  color: var(--fire);
}

.detail-section {
  margin-bottom: var(--space-4);
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-tertiary);
  margin-bottom: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bazi-display {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
}

.bazi-pillar {
  background: var(--bg-secondary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: var(--text-primary);
  font-weight: var(--font-semibold);
  font-family: var(--font-display);
}

.bazi-pillar.day {
  background: rgba(96, 165, 250, 0.15);
  color: var(--water);
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.time-slot {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.time-slot.high {
  border-left: 3px solid var(--wood);
}

.time-slot.medium {
  border-left: 3px solid var(--water);
}

.time-slot.low {
  border-left: 3px solid var(--fire);
}

.slot-time {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  min-width: 40px;
}

.slot-score {
  font-weight: var(--font-bold);
  min-width: 50px;
}

.slot-score.high {
  color: var(--wood);
}

.slot-score.medium {
  color: var(--water);
}

.slot-score.low {
  color: var(--fire);
}

.slot-activity {
  flex: 1;
  color: var(--text-secondary);
  text-align: right;
}

.pros-cons {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.pros,
.cons {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.pros svg {
  color: var(--wood);
}

.cons svg {
  color: var(--fire);
}

.pros-label,
.cons-label {
  font-weight: var(--font-bold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.pros-label {
  background: rgba(74, 222, 128, 0.15);
  color: var(--wood);
}

.cons-label {
  background: rgba(248, 113, 113, 0.15);
  color: var(--fire);
}

/* Empty State */
.planner-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
  padding: var(--space-10) var(--space-5);
}

.empty-icon {
  color: var(--text-tertiary);
}

.empty-text {
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .calendar-row {
    gap: var(--space-1);
  }

  .day-card {
    min-width: 90px;
    padding: var(--space-2);
  }

  .day-date {
    font-size: var(--text-base);
  }

  .day-score {
    font-size: var(--text-lg);
  }

  .bazi-display {
    flex-wrap: wrap;
  }
}
</style>
