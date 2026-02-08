<template>
  <div class="calendar-chart">
    <div class="week-header">
      <div v-for="day in weekDays" :key="day" class="week-day-label">{{ day }}</div>
    </div>
    <div class="chart-body">
      <div v-for="(dayData, index) in data" :key="index" class="day-column">
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
const props = defineProps({
  data: {
    type: Array,
    required: true
    // Expected format: [{ date: '2024-01-01', shortDate: '1/1', score: 80 }, ...]
  }
})

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

function getColor(score) {
  if (score >= 80) return 'var(--wood)'
  if (score >= 60) return 'var(--water)'
  if (score >= 40) return 'var(--earth)'
  return 'var(--fire)'
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
  margin-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: var(--space-2);
}

.week-day-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  width: 100%;
  text-align: center;
  font-family: var(--font-display);
}

.chart-body {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding-bottom: var(--space-6);
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
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  transition: height 0.5s ease;
  min-height: 4px;
}

.day-date {
  position: absolute;
  bottom: -24px;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
</style>
