<template>
  <div class="future-planner">
    <div class="planner-header">
      <h3 class="planner-title">未来7天日程规划</h3>
      <p class="planner-subtitle">根据你的五行特征，推荐每天适合的活动</p>
    </div>

    <div v-if="hasBirthInfo" class="calendar-container">
      <!-- 日期导航 -->
      <div class="calendar-nav">
        <button class="nav-btn" @click="shiftDays(-1)" :disabled="shiftOffset <= 0">←</button>
        <span class="nav-label">{{ dateRangeLabel }}</span>
        <button class="nav-btn" @click="shiftDays(1)" :disabled="shiftOffset >= 7">→</button>
      </div>

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
              <span class="hint-label">宜</span>
              <span class="hint-value">{{ day.bestActivity }}</span>
            </div>
            <div class="activity-hint caution">
              <span class="hint-label">忌</span>
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
              <span class="pros-label">✓ 适合</span>
              <span>{{ selectedDay.pros.join('、') }}</span>
            </div>
            <div class="cons">
              <span class="cons-label">✕ 避免</span>
              <span>{{ selectedDay.cons.join('、') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="planner-empty">
      <div class="empty-icon">📅</div>
      <p class="empty-text">完善出生信息后，查看未来7天规划建议</p>
    </div>
  </div>
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

const userStore = useUserStore()
const { hasBirthInfo, favorableElements } = usePersonality()

const shiftOffset = ref(0)
const selectedDay = ref(null)

// 星期名称
const weekNames = ['日', '一', '二', '三', '四', '五', '六']

// 计算未来7天的日期数据
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

// 日期范围标签
const dateRangeLabel = computed(() => {
  if (weekDays.value.length === 0) return ''
  const start = weekDays.value[0].shortDate
  const end = weekDays.value[6].shortDate
  return `${start} - ${end}`
})

// 计算单天数据
function calculateDayData(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayOfWeek = date.getDay()

  // 计算当天八字（用中午12点代表全天）
  const dayBazi = calculateBaZi(year, month, day, 12)

  // 计算当天3个关键时段的分数
  const morningScore = calculateSlotScore(year, month, day, 10)
  const afternoonScore = calculateSlotScore(year, month, day, 14)
  const eveningScore = calculateSlotScore(year, month, day, 20)

  // 综合分数（加权平均）
  const avgScore = Math.round((morningScore + afternoonScore + eveningScore) / 3)

  // 根据当天日柱五行判断适合的活动
  const dayElement = HEAVENLY_STEM_ELEMENTS[dayBazi.day.stem]
  const bestActivities = getActivitiesByElement(dayElement)
  const avoidActivities = getAvoidActivitiesByElement(dayElement)

  // 生成标签
  const tags = generateDayTags(avgScore, dayElement)

  // 时间段数据
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

// 计算某时段分数（使用V2算法）
function calculateSlotScore(year, month, day, hour) {
  const dayBazi = calculateBaZi(year, month, day, 12) // 用中午代表当天的日柱
  const hourBazi = calculateBaZi(year, month, day, hour)
  if (!dayBazi || !hourBazi) return 50

  return calculateHourEnergy(
    userStore.profile.bazi,
    {
      favorable: userStore.profile.favorable,
      unfavorable: userStore.profile.unfavorable
    },
    dayBazi, // 日柱（V2新增）
    hourBazi, // 时辰
    false // 不输出调试日志（生产环境）
  )
}

// 生成当天标签
function generateDayTags(score, element) {
  const tags = []

  if (score >= 80) tags.push('吉日')
  else if (score >= 60) tags.push('平吉')
  else tags.push('谨慎')

  // 根据五行和喜忌添加标签
  if (favorableElements.value.includes(element)) {
    tags.push(`喜${element}`)
  }

  return tags
}

// 获取分数等级
function getScoreLevel(score) {
  if (score >= 75) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

// 获取日期卡片类名
function getDayClasses(day) {
  const classes = []
  classes.push(getScoreLevel(day.score))

  if (selectedDay.value?.date === day.date) {
    classes.push('selected')
  }

  // 标记今天
  const today = new Date().toISOString().split('T')[0]
  if (day.date === today) {
    classes.push('today')
  }

  return classes
}

// 获取时段类名
function getSlotClasses(slot) {
  return getScoreLevel(slot.score)
}

// 选择日期
function selectDay(day) {
  selectedDay.value = day
}

// 切换日期范围
function shiftDays(offset) {
  shiftOffset.value = Math.max(0, Math.min(7, shiftOffset.value + offset))
  selectedDay.value = null
}

// 自动选中今天
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
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  margin-bottom: 24px;
}

.planner-header {
  margin-bottom: 20px;
}

.planner-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--header-text);
  margin: 0 0 8px 0;
}

.planner-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Calendar Navigation */
.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.nav-btn {
  background: var(--bg-secondary);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-primary);
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: var(--accent-color);
  color: white;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Calendar Row */
.calendar-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}

.day-card {
  flex: 1;
  min-width: 100px;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.day-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.day-card.selected {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.2);
}

.day-card.today {
  position: relative;
}

.day-card.today::after {
  content: '今天';
  position: absolute;
  top: -8px;
  right: 8px;
  background: var(--accent-color);
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.day-card.high {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.day-card.medium {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.day-card.low {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.day-header {
  text-align: center;
  margin-bottom: 8px;
}

.day-name {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: block;
}

.day-date {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--header-text);
}

.day-score {
  text-align: center;
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.day-score.high {
  color: var(--success-color);
}

.day-score.medium {
  color: var(--accent-color);
}

.day-score.low {
  color: var(--danger-color);
}

.day-tags {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.day-tag {
  font-size: 0.7rem;
  background: var(--card-bg);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-secondary);
}

.day-activities {
  font-size: 0.75rem;
}

.activity-hint {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.activity-hint.caution {
  opacity: 0.7;
}

.hint-label {
  font-weight: 600;
  color: var(--text-secondary);
}

.hint-value {
  color: var(--text-primary);
  text-align: right;
  flex: 1;
  margin-left: 4px;
}

/* Day Detail */
.day-detail {
  margin-top: 20px;
  padding: 16px;
  background: var(--bg-secondary);
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

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.detail-date {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--header-text);
}

.detail-score {
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
}

.detail-score.high {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success-color);
}

.detail-score.medium {
  background: rgba(59, 130, 246, 0.2);
  color: var(--accent-color);
}

.detail-score.low {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger-color);
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bazi-display {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.bazi-pillar {
  background: var(--card-bg);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 600;
}

.bazi-pillar.day {
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-color);
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-slot {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--card-bg);
  border-radius: 8px;
  font-size: 0.9rem;
}

.time-slot.high {
  border-left: 3px solid var(--success-color);
}

.time-slot.medium {
  border-left: 3px solid var(--accent-color);
}

.time-slot.low {
  border-left: 3px solid var(--danger-color);
}

.slot-time {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 40px;
}

.slot-score {
  font-weight: 700;
  min-width: 50px;
}

.slot-score.high {
  color: var(--success-color);
}

.slot-score.medium {
  color: var(--accent-color);
}

.slot-score.low {
  color: var(--danger-color);
}

.slot-activity {
  flex: 1;
  color: var(--text-secondary);
  text-align: right;
}

.pros-cons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pros,
.cons {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.9rem;
}

.pros-label,
.cons-label {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.pros-label {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success-color);
}

.cons-label {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger-color);
}

/* Empty State */
.planner-empty {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-row {
    gap: 6px;
  }

  .day-card {
    min-width: 90px;
    padding: 10px;
  }

  .day-date {
    font-size: 1rem;
  }

  .day-score {
    font-size: 1.1rem;
  }

  .bazi-display {
    flex-wrap: wrap;
  }
}
</style>
