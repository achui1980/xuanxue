<template>
  <div class="today-tab">
    <!-- Fortune Card Section -->
    <div class="card fortune-card">
      <div v-if="isGuest" class="guest-cta-block">
        <div class="guest-cta-content">
          <span class="guest-cta-title">通用指引（未填写出生信息）</span>
          <button class="guest-cta-btn" @click="goToProfile">去完善个人信息</button>
        </div>
      </div>

      <div class="fortune-header">
        <div class="fortune-date">
          <span class="lunar-text">{{ dailyFortune.lunarText }}</span>
        </div>
        <div class="fortune-score-container" :class="dailyFortune.overall.level">
          <div class="score-circle">
            <span class="score-value">{{ dailyFortune.overall.score }}</span>
            <span class="score-label">今日运势</span>
          </div>
          <div class="score-text">{{ dailyFortune.overall.text }}</div>
        </div>
      </div>

      <div class="fortune-quote">"{{ dailyFortune.quote }}"</div>

      <div class="aspects-grid">
        <div class="aspect-item">
          <span class="aspect-label">事业</span>
          <div class="aspect-bar-container">
            <div
              class="aspect-bar"
              :style="{ width: dailyFortune.aspects.career.score + '%' }"
            ></div>
          </div>
          <span class="aspect-value">{{ dailyFortune.aspects.career.text }}</span>
        </div>
        <div class="aspect-item">
          <span class="aspect-label">财富</span>
          <div class="aspect-bar-container">
            <div
              class="aspect-bar"
              :style="{ width: dailyFortune.aspects.wealth.score + '%' }"
            ></div>
          </div>
          <span class="aspect-value">{{ dailyFortune.aspects.wealth.text }}</span>
        </div>
        <div class="aspect-item">
          <span class="aspect-label">情感</span>
          <div class="aspect-bar-container">
            <div class="aspect-bar" :style="{ width: dailyFortune.aspects.love.score + '%' }"></div>
          </div>
          <span class="aspect-value">{{ dailyFortune.aspects.love.text }}</span>
        </div>
        <div class="aspect-item">
          <span class="aspect-label">健康</span>
          <div class="aspect-bar-container">
            <div
              class="aspect-bar"
              :style="{ width: dailyFortune.aspects.health.score + '%' }"
            ></div>
          </div>
          <span class="aspect-value">{{ dailyFortune.aspects.health.text }}</span>
        </div>
      </div>

      <div class="tags-container">
        <span v-for="tag in dailyFortune.tags" :key="tag" class="fortune-tag">
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Quick Actions Section -->
    <div class="section-title">
      <span>今日时机速览</span>
      <span v-if="isGuest" class="guest-badge">通用指引</span>
    </div>
    <div class="card quick-actions-card">
      <div class="quick-action-group">
        <div class="group-label success"><span class="icon">✨</span> 最佳时段</div>
        <div class="action-buttons">
          <button
            v-for="hour in dailyFortune.topHours"
            :key="hour.hour"
            class="time-btn success"
            @click="scrollToHour(hour.hour)"
          >
            <span class="time-range">{{ hour.rangeLabel.split('-')[0] }}</span>
            <span class="time-tag" v-if="hour.reasonTags[0]">{{ hour.reasonTags[0] }}</span>
          </button>
        </div>
      </div>

      <div class="divider"></div>

      <div class="quick-action-group">
        <div class="group-label caution"><span class="icon">⚠️</span> 需谨慎</div>
        <div class="action-buttons">
          <button
            v-for="hour in dailyFortune.cautionHours"
            :key="hour.hour"
            class="time-btn caution"
            @click="scrollToHour(hour.hour)"
          >
            <span class="time-range">{{ hour.rangeLabel.split('-')[0] }}</span>
            <span class="time-tag" v-if="hour.reasonTags[0]">{{ hour.reasonTags[0] }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Intent Mode Section -->
    <div class="section-title">
      <span>我想...</span>
      <span v-if="isGuest" class="guest-badge">通用指引</span>
    </div>
    <div class="card intent-card">
      <div class="intent-selector">
        <select v-model="selectedIntent" @change="updateIntentRecommendation">
          <option value="" disabled>选择一个事项...</option>
          <option v-for="action in actionLibrary" :key="action.id" :value="action.id">
            {{ action.label }}
          </option>
        </select>
      </div>

      <div v-if="intentResult" class="intent-result">
        <div v-if="intentResult.top.length > 0" class="recommendation-list">
          <div class="rec-title">推荐时段：</div>
          <div class="rec-items">
            <div v-for="h in intentResult.top" :key="h.hour" class="rec-item success">
              <span class="rec-time">{{ h.rangeLabel }}</span>
              <span class="rec-score">{{ h.score }}分</span>
            </div>
          </div>
        </div>

        <div v-if="intentResult.caution.length > 0" class="recommendation-list">
          <div class="rec-title">避开时段：</div>
          <div class="rec-items">
            <div v-for="h in intentResult.caution" :key="h.hour" class="rec-item caution">
              <span class="rec-time">{{ h.rangeLabel }}</span>
            </div>
          </div>
        </div>

        <button class="add-plan-btn" @click="addToPlan" :disabled="!selectedIntent">
          ➕ 加入今日计划
        </button>
      </div>
    </div>

    <!-- Detailed Timeline Section -->
    <div class="section-title">
      <span>24小时详情</span>
      <span v-if="isGuest" class="guest-badge">通用指引</span>
      <button v-if="!isGuest" class="toggle-mode-btn" @click="toggleAdvancedMode">
        {{ advancedMode ? '切回简洁模式' : '查看专业模式' }}
      </button>
    </div>

    <!-- Current Hour Quick Summary - always visible -->
    <div v-if="selectedHourData" class="card current-hour-card">
      <div class="current-hour-header">
        <span class="current-time">{{ selectedHourData.rangeLabel }}</span>
        <span
          class="current-suitability"
          :class="energyStore.getEnergyLevel(selectedHourData.score)"
        >
          {{ getSuitabilityText(selectedHourData.score) }}
        </span>
      </div>
      <div class="current-tags">
        <span v-for="tag in selectedHourData.reasonTags" :key="tag" class="current-tag">{{
          tag
        }}</span>
      </div>
      <div
        class="current-actions"
        v-if="selectedHourData.recommendedActions?.length || selectedHourData.avoidActions?.length"
      >
        <div v-if="selectedHourData.recommendedActions?.length" class="current-action do">
          <span class="action-label">建议：</span>
          <span>{{ selectedHourData.recommendedActions.slice(0, 2).join('、') }}</span>
        </div>
        <div v-if="selectedHourData.avoidActions?.length" class="current-action avoid">
          <span class="action-label">避免：</span>
          <span>{{ selectedHourData.avoidActions.slice(0, 2).join('、') }}</span>
        </div>
      </div>
    </div>

    <!-- 24-hour chart with highlights -->
    <div class="card timeline-card">
      <EnergyChart
        @hourSelected="onHourSelected"
        :showShenSha="advancedMode && !isGuest"
        :highlights="chartHighlights"
        ref="energyChartRef"
      />
    </div>

    <!-- Toast Notification -->
    <div v-if="toast.visible" class="toast">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useEnergyStore } from '@/stores/energy'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { useHourSelection } from '@/composables/useHourSelection'
import EnergyChart from '@/components/EnergyChart.vue'

const energyStore = useEnergyStore()
const userStore = useUserStore()
const appStore = useAppStore()
const { selectedHour, selectedHourData, selectHour, currentBeijingHour } = useHourSelection()
const energyChartRef = ref(null)

const dailyFortune = computed(() => energyStore.dailyFortune)
const actionLibrary = computed(() => energyStore.actionLibrary)
const isGuest = computed(() => !userStore.hasBirthInfo())

const selectedIntent = ref('')
const intentResult = ref(null)
const advancedMode = ref(false)
const toast = ref({ visible: false, message: '' })

// Highlights for chart when intent is selected
const chartHighlights = computed(() => {
  if (!intentResult.value) return { top: [], caution: [] }
  return {
    top: intentResult.value.top.map((h) => h.hour),
    caution: intentResult.value.caution.map((h) => h.hour)
  }
})

// Default to first intent if available to show state
onMounted(() => {
  if (actionLibrary.value.length > 0) {
    // Optional: Pre-select something or leave empty
    // selectedIntent.value = actionLibrary.value[0].id
    // updateIntentRecommendation()
  }
})

function updateIntentRecommendation() {
  if (!selectedIntent.value) {
    intentResult.value = null
    return
  }
  intentResult.value = energyStore.getRecommendedHoursForAction(selectedIntent.value)

  // Auto-select the first recommended hour so user sees guidance immediately
  if (intentResult.value?.top?.length > 0) {
    const firstRecommended = intentResult.value.top[0].hour
    selectHour(firstRecommended)

    // Also scroll chart to that hour if method available
    if (energyChartRef.value?.scrollToHour) {
      energyChartRef.value.scrollToHour(firstRecommended)
    }
  }
}

function getSuitabilityText(score) {
  if (score >= 80) return '非常适合'
  if (score >= 70) return '适合'
  if (score >= 50) return '一般'
  if (score >= 30) return '不宜'
  return '尽量避开'
}

function scrollToHour(hour) {
  // Select the hour so the chart shows its details
  selectHour(hour)
  console.log('Selected hour:', hour)

  // Scroll the chart into view
  if (energyChartRef.value?.$el) {
    energyChartRef.value.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function onHourSelected(hour) {
  console.log('Hour selected:', hour)
}

function toggleAdvancedMode() {
  advancedMode.value = !advancedMode.value
}

function addToPlan() {
  if (!selectedIntent.value) return

  const action = actionLibrary.value.find((a) => a.id === selectedIntent.value)
  if (action) {
    userStore.addGoal(action.label)
    showToast(`已添加 "${action.label}" 到今日计划`)
  }
}

function showToast(msg) {
  toast.value = { visible: true, message: msg }
  setTimeout(() => {
    toast.value.visible = false
  }, 2000)
}

function goToProfile() {
  appStore.setActiveTab('profile')
}
</script>

<style scoped>
.today-tab {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 24px 0 12px;
  color: var(--header-text);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-mode-btn {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: none;
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: 12px;
  cursor: pointer;
}

.card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  margin-bottom: 16px;
}

/* Fortune Card Styles */
.fortune-card {
  background: linear-gradient(145deg, var(--card-bg) 0%, rgba(var(--accent-rgb), 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.fortune-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.lunar-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.fortune-score-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--bg-secondary);
  border: 3px solid currentColor;
}

.fortune-score-container.good {
  color: var(--success-color);
}
.fortune-score-container.caution {
  color: var(--warning-color);
}
.fortune-score-container.ok {
  color: var(--text-primary);
}

.score-value {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 0.6rem;
  opacity: 0.8;
}

.score-text {
  font-size: 1.5rem;
  font-weight: 700;
}

.fortune-quote {
  font-style: italic;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 24px;
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 10px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.aspects-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.aspect-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.aspect-label {
  width: 40px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.aspect-bar-container {
  flex: 1;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.aspect-bar {
  height: 100%;
  background: var(--accent-color);
  border-radius: 4px;
  transition: width 0.5s ease-out;
}

.aspect-value {
  width: 60px;
  text-align: right;
  font-size: 0.85rem;
  color: var(--text-primary);
  font-weight: 500;
}

.tags-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.fortune-tag {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Quick Actions Styles */
.quick-action-group {
  margin-bottom: 12px;
}

.quick-action-group:last-child {
  margin-bottom: 0;
}

.group-label {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.group-label.success {
  color: var(--success-color);
}
.group-label.caution {
  color: var(--danger-color);
}

.action-buttons {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.time-btn {
  flex: 1;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  min-width: 80px;
  transition: transform 0.1s;
}

.time-btn:active {
  transform: scale(0.98);
}

.time-btn.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.time-btn.caution {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.time-range {
  font-weight: 700;
  font-size: 1rem;
}

.time-tag {
  font-size: 0.7rem;
  opacity: 0.9;
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 16px 0;
}

/* Intent Card Styles */
.intent-selector select {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 16px;
}

.intent-result {
  animation: fadeIn 0.3s ease;
}

.recommendation-list {
  margin-bottom: 12px;
}

.rec-title {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.rec-items {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.rec-item {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.rec-item.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.rec-item.caution {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.rec-score {
  font-weight: 600;
  font-size: 0.8rem;
}

.add-plan-btn {
  width: 100%;
  padding: 12px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 12px;
  cursor: pointer;
}

.add-plan-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  z-index: 100;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translate(-50%, 20px);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Guest Mode Styles */
.guest-cta-block {
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(var(--accent-rgb), 0.1);
  border: 1px dashed var(--accent-color);
  border-radius: 12px;
}

.guest-cta-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.guest-cta-title {
  font-size: 0.9rem;
  color: var(--accent-color);
  font-weight: 600;
}

.guest-cta-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.guest-cta-btn:hover {
  background: var(--accent-hover);
}

.guest-badge {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
  border: 1px solid var(--border-color);
}

/* Current Hour Summary Card */
.current-hour-card {
  background: var(--bg-secondary);
  border-left: 4px solid var(--accent-color);
  padding: 16px;
}

.current-hour-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.current-time {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--header-text);
}

.current-suitability {
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
}
.current-suitability.high {
  color: var(--success-color);
  background: rgba(16, 185, 129, 0.1);
}
.current-suitability.medium {
  color: var(--accent-color);
  background: rgba(59, 130, 246, 0.1);
}
.current-suitability.low {
  color: var(--text-secondary);
  background: var(--bg-primary);
}

.current-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.current-tag {
  background: var(--card-bg);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.current-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
}

.current-action {
  display: flex;
  align-items: baseline;
}

.current-action .action-label {
  font-weight: 600;
  margin-right: 6px;
  flex-shrink: 0;
}

.current-action.do {
  color: var(--success-color);
}

.current-action.avoid {
  color: var(--danger-color);
}
</style>
