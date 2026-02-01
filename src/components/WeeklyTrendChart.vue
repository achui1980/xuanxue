<template>
  <div class="calendar-chart">
    <div class="week-header">
      <div v-for="day in weekDays" :key="day" class="week-day-label">{{ day }}</div>
    </div>
    <div class="chart-body">
      <div 
        v-for="(dayData, index) in data" 
        :key="index"
        class="day-column"
      >
        <div 
          class="energy-bar" 
          :style="{ height: dayData.score + '%', backgroundColor: getColor(dayData.score) }"
          :title="`${dayData.date}: ${dayData.score}分`"
        ></div>
        <div class="day-date">{{ dayData.shortDate }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    // Expected format: [{ date: '2024-01-01', shortDate: '1/1', score: 80 }, ...]
  }
})

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

function getColor(score) {
  if (score >= 80) return 'var(--success-color)'
  if (score >= 60) return 'var(--accent-color)'
  if (score >= 40) return 'var(--warning-color)'
  return 'var(--danger-color)'
}
</script>

<style scoped>
.calendar-chart {
  width: 100%;
  height: 250px;
  display: flex;
  flex-direction: column;
}

.week-header {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 5px;
}

.week-day-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  width: 100%;
  text-align: center;
}

.chart-body {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding-bottom: 20px; /* Space for dates */
}

.day-column {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  position: relative;
}

.energy-bar {
  width: 60%;
  border-radius: 4px;
  transition: height 0.5s ease;
  min-height: 4px;
}

.day-date {
  position: absolute;
  bottom: -25px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}
</style>
