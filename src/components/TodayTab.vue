<template>
  <div class="today-tab">
    <!-- Guest CTA -->
    <div v-if="isGuest" class="guest-banner animate-fadeIn">
      <div class="guest-content">
        <AppIcon name="info" size="sm" />
        <span>当前显示通用指引，完善出生信息可获得个性化分析</span>
        <button class="btn btn-primary btn-sm" @click="goToProfile">
          去完善
          <AppIcon name="arrow-right" size="sm" />
        </button>
      </div>
    </div>

    <!-- Bento Grid Layout -->
    <div class="bento-grid">
      <!-- Fortune Card - Main Feature -->
      <BaseCard class="fortune-card bento-span-2" elevated>
        <div class="fortune-content">
          <div class="fortune-header">
            <div class="date-display">
              <span class="lunar-date">{{ dailyFortune.lunarText }}</span>
              <span class="solar-date">{{ currentDate }}</span>
            </div>
            <div class="fortune-badge" :class="dailyFortune.overall.level">
              <span class="score-value">{{ dailyFortune.overall.score }}</span>
              <span class="score-label">综合评分</span>
            </div>
          </div>

          <div class="fortune-body">
            <p class="fortune-quote">「{{ dailyFortune.quote }}」</p>

            <!-- Aspect Bars -->
            <div class="aspects-grid">
              <div v-for="(aspect, key) in dailyFortune.aspects" :key="key" class="aspect-item">
                <span class="aspect-name">{{ aspectNames[key] }}</span>
                <div class="aspect-bar-bg">
                  <div
                    class="aspect-bar"
                    :class="`level-${getLevel(aspect.score)}`"
                    :style="{ width: `${aspect.score}%` }"
                  />
                </div>
                <span class="aspect-score">{{ aspect.text }}</span>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="fortune-tags">
            <span v-for="tag in dailyFortune.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </BaseCard>

      <!-- Quick Actions Card -->
      <BaseCard class="quick-actions-card" title="今日时机" elevated>
        <div class="action-section">
          <div class="action-header success">
            <ElementIcon element="wood" size="sm" />
            <span>最佳时段</span>
          </div>
          <div class="time-chips">
            <button
              v-for="hour in dailyFortune.topHours"
              :key="hour.hour"
              class="time-chip success"
              @click="selectHour(hour.hour)"
            >
              <span class="chip-time">{{ hour.hour }}:00</span>
              <span class="chip-branch">{{ getBranchForHour(hour.hour) }}时</span>
              <span v-if="hour.reasonTags[0]" class="chip-tag">{{ hour.reasonTags[0] }}</span>
            </button>
          </div>
        </div>

        <div class="divider" />

        <div class="action-section">
          <div class="action-header caution">
            <ElementIcon element="fire" size="sm" />
            <span>需谨慎</span>
          </div>
          <div class="time-chips">
            <button
              v-for="hour in dailyFortune.cautionHours"
              :key="hour.hour"
              class="time-chip caution"
              @click="selectHour(hour.hour)"
            >
              <span class="chip-time">{{ hour.hour }}:00</span>
              <span class="chip-branch">{{ getBranchForHour(hour.hour) }}时</span>
            </button>
          </div>
        </div>
      </BaseCard>

      <!-- Intent Card -->
      <BaseCard class="intent-card" title="择事问时" elevated>
        <div class="intent-selector">
          <select
            v-model="selectedIntent"
            class="input select"
            @change="updateIntentRecommendation"
          >
            <option value="" disabled>选择要办理的事项...</option>
            <option v-for="action in actionLibrary" :key="action.id" :value="action.id">
              {{ action.label }}
            </option>
          </select>
        </div>

        <Transition name="fade">
          <div v-if="intentResult" class="intent-result">
            <div v-if="intentResult.top.length > 0" class="recommendation-group">
              <span class="group-label">推荐时辰</span>
              <div class="recommendation-chips">
                <button
                  v-for="h in intentResult.top"
                  :key="h.hour"
                  class="rec-chip success"
                  @click="selectHour(h.hour)"
                >
                  <span class="rec-time">{{ h.hour }}:00 {{ getBranchForHour(h.hour) }}时</span>
                  <span class="rec-score">{{ h.score }}分</span>
                </button>
              </div>
            </div>

            <div v-if="intentResult.caution.length > 0" class="recommendation-group">
              <span class="group-label">避开时辰</span>
              <div class="recommendation-chips">
                <button
                  v-for="h in intentResult.caution"
                  :key="h.hour"
                  class="rec-chip caution"
                  @click="selectHour(h.hour)"
                >
                  <span class="rec-time">{{ h.hour }}:00 {{ getBranchForHour(h.hour) }}时</span>
                </button>
              </div>
            </div>

            <button class="btn btn-primary btn-full" @click="addToPlan" :disabled="!selectedIntent">
              <AppIcon name="plus" size="sm" />
              加入今日计划
            </button>
          </div>
        </Transition>
      </BaseCard>

      <!-- Term & Almanac Cards -->
      <TermInfo class="term-card" />
      <AlmanacCard class="almanac-card" />

      <!-- Current Hour Detail -->
      <BaseCard v-if="selectedHourData" class="current-hour-card bento-span-2" elevated>
        <div class="current-header">
          <div class="current-time">
            <span class="time-main">{{ selectedHourData.rangeLabel }}</span>
            <span class="time-branch">{{ getBranchForHour(appStore.selectedHour) }}时</span>
          </div>
          <div
            class="current-suitability"
            :class="energyStore.getEnergyLevel(selectedHourData.score)"
          >
            {{ getSuitabilityText(selectedHourData.score) }}
          </div>
        </div>

        <div class="current-tags">
          <span v-for="tag in selectedHourData.reasonTags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>

        <div
          v-if="
            selectedHourData.recommendedActions?.length || selectedHourData.avoidActions?.length
          "
          class="current-actions"
        >
          <div v-if="selectedHourData.recommendedActions?.length" class="action-row do">
            <ElementIcon element="wood" size="sm" />
            <span class="action-label">宜：</span>
            <span class="action-list">{{
              selectedHourData.recommendedActions.slice(0, 3).join('、')
            }}</span>
          </div>
          <div v-if="selectedHourData.avoidActions?.length" class="action-row avoid">
            <ElementIcon element="fire" size="sm" />
            <span class="action-label">忌：</span>
            <span class="action-list">{{
              selectedHourData.avoidActions.slice(0, 2).join('、')
            }}</span>
          </div>
        </div>

        <div class="current-element">
          <span class="element-label">五行：</span>
          <ElementIcon :element="getElementKey(selectedHourData.element)" size="sm" />
          <span class="element-value">{{ selectedHourData.element }}旺</span>
          <span class="element-hint">（{{ selectedHourData.elementHint }}）</span>
        </div>
      </BaseCard>

      <!-- Energy Chart -->
      <BaseCard class="chart-card bento-span-2" elevated>
        <div class="chart-header">
          <h3 class="chart-title">二十四时辰能量走势</h3>
          <button v-if="!isGuest" class="btn btn-ghost btn-sm" @click="toggleAdvancedMode">
            {{ advancedMode ? '简洁模式' : '专业模式' }}
          </button>
        </div>
        <EnergyChart
          @hourSelected="onHourSelected"
          :showShenSha="advancedMode && !isGuest"
          :highlights="chartHighlights"
          ref="energyChartRef"
        />
      </BaseCard>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.visible" class="toast">
        <AppIcon name="check" size="sm" />
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useEnergyStore } from '@/stores/energy'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { useHourSelection } from '@/composables/useHourSelection'
import { useBeijingTime } from '@/composables/useBeijingTime'
import BaseCard from '@/components/common/BaseCard.vue'
import EnergyChart from '@/components/EnergyChart.vue'
import TermInfo from '@/components/TermInfo.vue'
import AlmanacCard from '@/components/AlmanacCard.vue'
import ElementIcon from '@/components/icons/ElementIcon.vue'
import AppIcon from '@/components/icons/AppIcon.vue'

const energyStore = useEnergyStore()
const userStore = useUserStore()
const appStore = useAppStore()
const { selectedHour, selectedHourData, selectHour } = useHourSelection()
const { getBranchForHour } = useBeijingTime()
const energyChartRef = ref(null)

const dailyFortune = computed(() => energyStore.dailyFortune)
const actionLibrary = computed(() => energyStore.actionLibrary)
const isGuest = computed(() => !userStore.hasBirthInfo())

const selectedIntent = ref('')
const intentResult = ref(null)
const advancedMode = ref(false)
const toast = ref({ visible: false, message: '' })

const aspectNames = {
  career: '事业',
  wealth: '财富',
  love: '情感',
  health: '健康'
}

const currentDate = computed(() => {
  const date = new Date()
  return `${date.getMonth() + 1}月${date.getDate()}日`
})

// Highlights for chart when intent is selected
const chartHighlights = computed(() => {
  if (!intentResult.value) return { top: [], caution: [] }
  return {
    top: intentResult.value.top.map((h) => h.hour),
    caution: intentResult.value.caution.map((h) => h.hour)
  }
})

function getLevel(score) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

function getSuitabilityText(score) {
  if (score >= 85) return '大吉'
  if (score >= 70) return '吉'
  if (score >= 50) return '平'
  if (score >= 30) return '凶'
  return '大凶'
}

function getElementKey(elementName) {
  const map = {
    金: 'metal',
    木: 'wood',
    水: 'water',
    火: 'fire',
    土: 'earth'
  }
  return map[elementName] || 'earth'
}

function updateIntentRecommendation() {
  if (!selectedIntent.value) {
    intentResult.value = null
    return
  }
  intentResult.value = energyStore.getRecommendedHoursForAction(selectedIntent.value)

  if (intentResult.value?.top?.length > 0) {
    const firstRecommended = intentResult.value.top[0].hour
    selectHour(firstRecommended)
    if (energyChartRef.value?.scrollToHour) {
      energyChartRef.value.scrollToHour(firstRecommended)
    }
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
    showToast(`已添加「${action.label}」到今日计划`)
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

onMounted(() => {
  if (actionLibrary.value.length > 0) {
    // Optional pre-selection
  }
})
</script>

<style scoped>
.today-tab {
  width: 100%;
}

/* Guest Banner */
.guest-banner {
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: rgba(232, 196, 102, 0.1);
  border: 1px dashed var(--metal);
  border-radius: var(--radius-lg);
}

.guest-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.btn-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
}

.btn-full {
  width: 100%;
  margin-top: var(--space-4);
}

/* Bento Grid */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

.bento-span-2 {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
  .bento-span-2 {
    grid-column: span 1;
  }
}

/* Fortune Card */
.fortune-card {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(232, 196, 102, 0.05) 100%);
}

.fortune-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.fortune-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.date-display {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.lunar-date {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

.solar-date {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.fortune-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--bg-elevated);
  border: 2px solid;
}

.fortune-badge.good {
  border-color: var(--wood);
  color: var(--wood);
}

.fortune-badge.caution {
  border-color: var(--fire);
  color: var(--fire);
}

.fortune-badge.ok {
  border-color: var(--metal);
  color: var(--metal);
}

.score-value {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: 1;
}

.score-label {
  font-size: var(--text-xs);
  margin-top: var(--space-1);
  opacity: 0.8;
}

.fortune-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.fortune-quote {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  color: var(--text-secondary);
  text-align: center;
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* Aspect Bars */
.aspects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.aspect-item {
  display: grid;
  grid-template-columns: 40px 1fr 48px;
  align-items: center;
  gap: var(--space-3);
}

.aspect-name {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.aspect-bar-bg {
  height: 6px;
  background: var(--bg-elevated);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.aspect-bar {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.5s ease;
}

.aspect-bar.level-high {
  background: var(--wood);
}
.aspect-bar.level-medium {
  background: var(--metal);
}
.aspect-bar.level-low {
  background: var(--text-muted);
}

.aspect-score {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  text-align: right;
}

/* Tags */
.fortune-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: center;
}

/* Quick Actions */
.quick-actions-card {
  grid-row: span 2;
}

.action-section {
  margin-bottom: var(--space-4);
}

.action-section:last-child {
  margin-bottom: 0;
}

.action-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-3);
}

.action-header.success {
  color: var(--wood);
}
.action-header.caution {
  color: var(--fire);
}

.time-chips {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.time-chip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: transparent;
}

.time-chip.success {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.2);
}

.time-chip.success:hover {
  background: rgba(74, 222, 128, 0.2);
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.2);
}

.time-chip.caution {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
}

.time-chip.caution:hover {
  background: rgba(248, 113, 113, 0.2);
}

.chip-time {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.chip-branch {
  font-size: var(--text-xs);
  color: var(--metal);
  padding: 2px 6px;
  background: rgba(232, 196, 102, 0.15);
  border-radius: var(--radius-sm);
}

.chip-tag {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-left: auto;
}

/* Intent Card */
.intent-card {
  grid-row: span 2;
}

.intent-selector {
  margin-bottom: var(--space-4);
}

.intent-result {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.recommendation-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.group-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.recommendation-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.rec-chip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--text-sm);
}

.rec-chip.success {
  background: rgba(74, 222, 128, 0.15);
  color: var(--wood);
}

.rec-chip.success:hover {
  background: rgba(74, 222, 128, 0.25);
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.2);
}

.rec-chip.caution {
  background: rgba(248, 113, 113, 0.15);
  color: var(--fire);
}

.rec-chip.caution:hover {
  background: rgba(248, 113, 113, 0.25);
}

.rec-score {
  font-weight: var(--font-bold);
  font-size: var(--text-xs);
}

/* Current Hour Card */
.current-hour-card {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(96, 165, 250, 0.05) 100%);
  border-left: 4px solid var(--water);
}

.current-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.current-time {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.time-main {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.time-branch {
  font-size: var(--text-lg);
  color: var(--metal);
  font-weight: var(--font-medium);
}

.current-suitability {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
}

.current-suitability.high {
  background: rgba(74, 222, 128, 0.15);
  color: var(--wood);
}

.current-suitability.medium {
  background: rgba(232, 196, 102, 0.15);
  color: var(--metal);
}

.current-suitability.low {
  background: var(--bg-elevated);
  color: var(--text-secondary);
}

.current-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
}

.current-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.action-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.action-row.do {
  color: var(--wood);
}
.action-row.avoid {
  color: var(--fire);
}

.action-label {
  font-weight: var(--font-semibold);
}

.action-list {
  color: var(--text-primary);
}

.current-element {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-subtle);
}

.element-value {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.element-hint {
  color: var(--text-tertiary);
}

/* Chart Card */
.chart-card {
  background: var(--bg-secondary);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.chart-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: var(--wood);
  color: var(--ink-black);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  z-index: 100;
  box-shadow: var(--shadow-lg);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all var(--transition-spring);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* Responsive */
@media (max-width: 1024px) {
  .fortune-card {
    grid-column: span 1;
  }

  .aspects-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-card,
  .intent-card {
    grid-row: span 1;
  }
}
</style>
