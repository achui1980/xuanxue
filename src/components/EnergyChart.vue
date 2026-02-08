<template>
  <div class="energy-chart-container">
    <div class="chart-wrapper">
      <div class="energy-chart">
        <div
          v-for="(hour, index) in hoursData"
          :key="hour.hour"
          class="hour-bar-wrapper"
          :class="{
            'is-selected': index === selectedHour,
            'is-current': index === currentBeijingHour
          }"
          @click="handleBarClick(index)"
        >
          <div class="bar-area">
            <div
              class="hour-bar"
              :class="getBarClasses(hour, index)"
              :style="{ height: getBarHeight(hour.score) }"
            />
            <div v-if="showShenSha && hasShenSha(hour)" class="shensha-indicator" />
          </div>
          <div class="hour-labels">
            <span class="hour-number" :class="{ 'is-major': index % 2 === 0 }">
              {{ index }}
            </span>
            <span class="hour-branch">{{ getBranchForHour(index) }}</span>
          </div>
        </div>
      </div>

      <!-- Area gradient overlay for depth -->
      <div class="chart-overlay" />
    </div>

    <!-- Detail Panel -->
    <Transition name="slide">
      <div v-if="!overview && selectedHourData" class="detail-panel">
        <div class="detail-header">
          <div class="time-info">
            <span class="time-range">{{ selectedHourData.rangeLabel }}</span>
            <span class="time-branch">{{ getBranchForHour(selectedHour) }}时</span>
            <span class="time-shensha" v-if="showShenSha">
              <span v-for="s in selectedHourData.stars" :key="s.name" class="star-badge">
                {{ s.name }}
              </span>
              <span v-for="c in selectedHourData.clashes" :key="c.name" class="clash-badge">
                {{ c.name }}
              </span>
            </span>
          </div>
          <div class="score-badge" :class="energyStore.getEnergyLevel(selectedHourData.score)">
            <span class="score-value">{{ selectedHourData.score }}</span>
            <span class="score-unit">分</span>
          </div>
        </div>

        <div class="detail-body">
          <div class="suitability-text" :class="energyStore.getEnergyLevel(selectedHourData.score)">
            {{ getSuitabilityText(selectedHourData.score) }}
          </div>

          <div class="reason-tags">
            <span v-for="tag in selectedHourData.reasonTags" :key="tag" class="reason-tag">
              {{ tag }}
            </span>
          </div>

          <div v-if="selectedHourData.recommendedActions?.length" class="action-section">
            <div class="section-header">
              <ElementIcon element="wood" size="sm" />
              <span>建议行动</span>
            </div>
            <p class="action-text">
              {{ selectedHourData.recommendedActions.slice(0, 3).join('、') }}
            </p>
          </div>

          <div v-if="selectedHourData.avoidActions?.length" class="action-section">
            <div class="section-header avoid">
              <ElementIcon element="fire" size="sm" />
              <span>建议避免</span>
            </div>
            <p class="action-text avoid">
              {{ selectedHourData.avoidActions.slice(0, 2).join('、') }}
            </p>
          </div>

          <div class="element-section">
            <ElementIcon :element="getElementKey(selectedHourData.element)" size="sm" />
            <span class="element-label">{{ selectedHourData.element }}旺</span>
            <span class="element-desc">{{ selectedHourData.elementHint }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEnergyStore } from '@/stores/energy'
import { useHourSelection } from '@/composables/useHourSelection'
import { useBeijingTime } from '@/composables/useBeijingTime'
import ElementIcon from '@/components/icons/ElementIcon.vue'

const props = defineProps({
  overview: {
    type: Boolean,
    default: false
  },
  showShenSha: {
    type: Boolean,
    default: false
  },
  selectMode: {
    type: String,
    default: 'jump',
    validator: (value) => ['jump', 'select'].includes(value)
  },
  highlights: {
    type: Object,
    default: () => ({ top: [], caution: [] })
  }
})

const emit = defineEmits(['hourSelected'])

const energyStore = useEnergyStore()
const { selectedHour, currentBeijingHour, selectHour, jumpToHour, selectedHourData } =
  useHourSelection()
const { getBranchForHour } = useBeijingTime()

const hoursData = computed(() => energyStore.hoursData)

function getBarHeight(score) {
  const maxHeight = props.overview ? 40 : 120
  const minHeight = 4
  const height = Math.max(minHeight, (score / 100) * maxHeight)
  return `${height}px`
}

function getBarClasses(hour, index) {
  const classes = []

  const energyLevel = energyStore.getEnergyLevel(hour.score)
  classes.push(`level-${energyLevel}`)

  if (index === selectedHour.value) {
    classes.push('is-selected')
  }

  if (index === currentBeijingHour.value) {
    classes.push('is-current')
  }

  if (props.highlights.top.includes(index)) {
    classes.push('highlight-top')
  }
  if (props.highlights.caution.includes(index)) {
    classes.push('highlight-caution')
  }

  return classes
}

function hasShenSha(hour) {
  return hour.stars.length > 0 || hour.clashes.length > 0
}

function getSuitabilityText(score) {
  if (score >= 85) return '大吉时辰，诸事顺遂'
  if (score >= 70) return '吉时，适合重要事务'
  if (score >= 50) return '平时，凡事谨慎'
  if (score >= 30) return '凶时，保守为宜'
  return '大凶时辰，诸事不宜'
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

function handleBarClick(index) {
  if (props.selectMode === 'select') {
    selectHour(index)
  } else if (props.overview) {
    jumpToHour(index)
  } else {
    selectHour(index)
  }
  emit('hourSelected', index)
}
</script>

<style scoped>
.energy-chart-container {
  width: 100%;
}

.chart-wrapper {
  position: relative;
  padding: var(--space-4) 0;
}

.energy-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 160px;
  padding-bottom: var(--space-8);
  position: relative;
  gap: 2px;
}

.energy-chart.overview {
  height: 60px;
  padding-bottom: 0;
}

/* Bar Wrapper */
.hour-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.hour-bar-wrapper:hover {
  transform: translateY(-2px);
}

.bar-area {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Hour Bar */
.hour-bar {
  width: 100%;
  min-width: 3px;
  max-width: 20px;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  transition: all var(--transition-base);
  position: relative;
}

/* Energy Level Colors */
.hour-bar.level-high {
  background: linear-gradient(180deg, var(--wood) 0%, rgba(74, 222, 128, 0.6) 100%);
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.3);
}

.hour-bar.level-medium {
  background: linear-gradient(180deg, var(--metal) 0%, rgba(232, 196, 102, 0.6) 100%);
}

.hour-bar.level-low {
  background: linear-gradient(180deg, var(--text-tertiary) 0%, rgba(100, 116, 139, 0.4) 100%);
}

/* Selected State */
.hour-bar.is-selected {
  opacity: 1;
  transform: scaleX(1.3);
  box-shadow: 0 0 15px var(--accent-glow);
  z-index: 2;
}

.hour-bar-wrapper.is-selected .hour-bar {
  background: linear-gradient(180deg, var(--metal) 0%, var(--metal-dim) 100%);
}

/* Current Hour Marker */
.hour-bar-wrapper.is-current::before {
  content: '';
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: var(--text-primary);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--text-primary);
  z-index: 3;
}

/* Highlight States */
.hour-bar.highlight-top {
  box-shadow:
    0 0 0 2px var(--wood),
    0 0 10px rgba(74, 222, 128, 0.5);
  z-index: 3;
}

.hour-bar.highlight-caution {
  box-shadow:
    0 0 0 2px var(--fire),
    0 0 10px rgba(248, 113, 113, 0.5);
  z-index: 3;
}

/* Shensha Indicator */
.shensha-indicator {
  position: absolute;
  top: -6px;
  width: 4px;
  height: 4px;
  background: var(--warning);
  border-radius: 50%;
  box-shadow: 0 0 4px var(--warning);
}

/* Labels */
.hour-labels {
  position: absolute;
  bottom: -32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.hour-number {
  font-size: 10px;
  color: var(--text-tertiary);
  font-weight: var(--font-medium);
}

.hour-number.is-major {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: var(--font-semibold);
}

.hour-branch {
  font-size: 9px;
  color: var(--metal);
  font-family: var(--font-display);
}

/* Chart Overlay */
.chart-overlay {
  position: absolute;
  bottom: 32px;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(180deg, transparent 0%, var(--bg-secondary) 100%);
  pointer-events: none;
}

/* Detail Panel */
.detail-panel {
  margin-top: var(--space-4);
  padding: var(--space-5);
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.time-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.time-range {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.time-branch {
  font-size: var(--text-lg);
  color: var(--metal);
  font-weight: var(--font-medium);
}

.time-shensha {
  display: flex;
  gap: var(--space-1);
}

.star-badge {
  padding: 2px 6px;
  background: rgba(232, 196, 102, 0.15);
  color: var(--metal);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.clash-badge {
  padding: 2px 6px;
  background: rgba(248, 113, 113, 0.15);
  color: var(--fire);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.score-badge {
  display: flex;
  align-items: baseline;
  gap: 2px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
}

.score-badge.high {
  background: rgba(74, 222, 128, 0.15);
  color: var(--wood);
}

.score-badge.medium {
  background: rgba(232, 196, 102, 0.15);
  color: var(--metal);
}

.score-badge.low {
  background: var(--bg-secondary);
  color: var(--text-tertiary);
}

.score-value {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
}

.score-unit {
  font-size: var(--text-sm);
}

/* Detail Body */
.detail-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.suitability-text {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
}

.suitability-text.high {
  color: var(--wood);
}
.suitability-text.medium {
  color: var(--metal);
}
.suitability-text.low {
  color: var(--text-secondary);
}

.reason-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.reason-tag {
  padding: var(--space-1) var(--space-3);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  border: 1px solid var(--border-subtle);
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--wood);
}

.section-header.avoid {
  color: var(--fire);
}

.action-text {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin: 0;
  line-height: var(--leading-relaxed);
}

.action-text.avoid {
  color: var(--fire);
}

.element-section {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-subtle);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.element-label {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.element-desc {
  color: var(--text-tertiary);
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all var(--transition-base);
  max-height: 500px;
  opacity: 1;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 640px) {
  .energy-chart {
    height: 140px;
  }

  .hour-number {
    font-size: 9px;
  }

  .hour-branch {
    font-size: 8px;
  }

  .detail-panel {
    padding: var(--space-4);
  }

  .time-range {
    font-size: var(--text-lg);
  }
}
</style>
