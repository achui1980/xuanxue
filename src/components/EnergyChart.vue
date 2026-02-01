<template>
  <div class="energy-chart-container">
    <div class="energy-chart" :class="{ overview: overview }">
      <div
        v-for="(hour, index) in hoursData"
        :key="hour.hour"
        class="hour-bar-wrapper"
        @click="handleBarClick(index)"
      >
        <div
          class="hour-bar"
          :class="getBarClasses(hour, index)"
          :style="{ height: getBarHeight(hour.score) }"
        >
          <!-- Optional marker for ShenSha or special events -->
          <div
            v-if="showShenSha && (hour.stars.length > 0 || hour.clashes.length > 0)"
            class="shensha-dot"
          ></div>
        </div>
        <div class="hour-label">{{ formatHourLabel(index) }}</div>
      </div>
    </div>

    <!-- Detail Overlay/Tooltip Area if needed, or just below text -->
    <div v-if="!overview && selectedHourData" class="selected-hour-detail">
      <div class="detail-header">
        <span class="detail-time">{{ selectedHourData.rangeLabel }}</span>
        <span class="detail-score" :class="energyStore.getEnergyLevel(selectedHourData.score)"
          >{{ selectedHourData.score }}分</span
        >
      </div>
      <div class="detail-body">
        <!-- Direct action-oriented text instead of element terminology -->
        <div class="detail-suitability" :class="energyStore.getEnergyLevel(selectedHourData.score)">
          此时段：{{ getSuitabilityText(selectedHourData.score) }}
        </div>

        <!-- Tags showing why -->
        <div class="detail-tags">
          <span v-for="tag in selectedHourData.reasonTags" :key="tag" class="reason-tag">{{
            tag
          }}</span>
        </div>

        <!-- Recommended actions - most direct guidance -->
        <div
          v-if="
            selectedHourData.recommendedActions && selectedHourData.recommendedActions.length > 0
          "
          class="detail-actions recommended"
        >
          <span class="action-label">建议做：</span>
          <span class="action-list">{{
            selectedHourData.recommendedActions.slice(0, 3).join('、')
          }}</span>
        </div>

        <!-- Avoid actions - what not to do -->
        <div
          v-if="selectedHourData.avoidActions && selectedHourData.avoidActions.length > 0"
          class="detail-actions avoid"
        >
          <span class="action-label">建议避免：</span>
          <span class="action-list">{{
            selectedHourData.avoidActions.slice(0, 2).join('、')
          }}</span>
        </div>

        <!-- Brief explanation -->
        <div class="detail-brief">{{ selectedHourData.brief }}</div>

        <!-- 五行能量参考（始终显示） -->
        <div class="detail-element">
          <span class="element-label">五行：</span>
          <span class="element-value">{{ selectedHourData.element }}旺</span>
          <span class="element-hint">（{{ selectedHourData.elementHint }}）</span>
        </div>

        <!-- Technical details only in advanced mode -->
        <div v-if="showShenSha" class="detail-shensha">
          <span v-for="s in selectedHourData.stars" :key="s.name" class="star-tag"
            >✨{{ s.name }}</span
          >
          <span v-for="c in selectedHourData.clashes" :key="c.name" class="clash-tag"
            >⚠️{{ c.name }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEnergyStore } from '@/stores/energy'
import { useHourSelection } from '@/composables/useHourSelection'

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
    default: 'jump', // 'jump' | 'select' - jump switches to today tab, select just updates selection
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

const hoursData = computed(() => energyStore.hoursData)

function getBarHeight(score) {
  const maxHeight = props.overview ? 50 : 120
  const minHeight = props.overview ? 4 : 10
  // Normalize score 0-100 to height
  const height = Math.max(minHeight, (score / 100) * maxHeight)
  return `${height}px`
}

function getBarClasses(hour, index) {
  const classes = []

  // Energy level classes
  const energyLevel = energyStore.getEnergyLevel(hour.score)
  classes.push(energyLevel)

  // Selected hour
  if (index === selectedHour.value) {
    classes.push('selected')
  }

  // Current hour
  if (index === currentBeijingHour.value) {
    classes.push('current')
  }

  // Highlights for intent mode
  if (props.highlights.top.includes(index)) {
    classes.push('highlight-top')
  }
  if (props.highlights.caution.includes(index)) {
    classes.push('highlight-caution')
  }

  return classes
}

function getSuitabilityText(score) {
  // Direct, actionable text based on score
  if (score >= 80) return '非常适合'
  if (score >= 70) return '适合'
  if (score >= 50) return '一般'
  if (score >= 30) return '不宜'
  return '尽量避开'
}

function handleBarClick(index) {
  if (props.selectMode === 'select') {
    // Just select without jumping tabs
    selectHour(index)
  } else if (props.overview) {
    jumpToHour(index)
  } else {
    selectHour(index)
  }
  emit('hourSelected', index)
}

function formatHourLabel(index) {
  if (index % 3 === 0) return index
  return ''
}
</script>

<style scoped>
.energy-chart-container {
  width: 100%;
}

.energy-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 150px;
  padding-bottom: 20px; /* Space for labels */
  position: relative;
  gap: 2px;
}

.energy-chart.overview {
  height: 60px;
  padding-bottom: 0;
  gap: 1px;
}

.hour-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.hour-bar {
  width: 100%;
  background: var(--bg-secondary); /* Default low contrast */
  border-radius: 4px 4px 0 0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  min-width: 4px;
}

.hour-bar:hover {
  opacity: 0.8;
  transform: scaleY(1.05);
}

.hour-bar.low {
  background: var(--bg-secondary);
  opacity: 0.6;
} /* Low energy muted */
.hour-bar.medium {
  background: var(--accent-color);
  opacity: 0.5;
}
.hour-bar.high {
  background: var(--success-color);
  opacity: 0.6;
}

.hour-bar.selected {
  opacity: 1;
  transform: scaleY(1.1);
  box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.3);
  z-index: 2;
}
.hour-bar.selected.low {
  background: var(--text-secondary);
}
.hour-bar.selected.medium {
  background: var(--accent-color);
}
.hour-bar.selected.high {
  background: var(--success-color);
}

/* Highlight styles for intent mode - glowing borders for recommended/caution hours */
.hour-bar.highlight-top {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.6);
  z-index: 3;
}
.hour-bar.highlight-caution {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.5);
  z-index: 3;
}

/* Current Hour Marker */
.hour-bar.current::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text-primary);
}

.hour-label {
  position: absolute;
  bottom: -20px;
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.shensha-dot {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--warning-color);
}

/* Detail Section */
.selected-hour-detail {
  margin-top: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  animation: slideDown 0.2s ease-out;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detail-time {
  font-size: 1.1rem;
  font-weight: 700;
}

.detail-score {
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.9rem;
}
.detail-score.high {
  color: var(--success-color);
  background: rgba(16, 185, 129, 0.1);
}
.detail-score.medium {
  color: var(--accent-color);
  background: rgba(59, 130, 246, 0.1);
}
.detail-score.low {
  color: var(--text-secondary);
  background: var(--bg-secondary);
}

.detail-body {
  font-size: 0.9rem;
}

.detail-element {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-bottom: 6px;
}

.detail-tags,
.detail-shensha {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.star-tag {
  color: var(--warning-color);
  background: rgba(245, 158, 11, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.clash-tag {
  color: var(--danger-color);
  background: rgba(239, 68, 68, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.reason-tag {
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.detail-brief {
  line-height: 1.5;
  color: var(--text-primary);
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-color);
}

/* Direct suitability text - main conclusion */
.detail-suitability {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.detail-suitability.high {
  color: var(--success-color);
}
.detail-suitability.medium {
  color: var(--accent-color);
}
.detail-suitability.low {
  color: var(--text-secondary);
}

/* Recommended and avoid actions */
.detail-actions {
  display: flex;
  align-items: baseline;
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.detail-actions .action-label {
  font-weight: 600;
  margin-right: 8px;
  flex-shrink: 0;
}

.detail-actions.recommended .action-label {
  color: var(--success-color);
}

.detail-actions.avoid .action-label {
  color: var(--danger-color);
}

.detail-actions .action-list {
  color: var(--text-primary);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
