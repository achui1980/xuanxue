<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const chartContainer = ref(null)
let chart = null
let resizeObserver = null

// 五行配置 - 使用新的配色系统
const elements = [
  { name: '金', key: 'metal', color: '#e8c466' },
  { name: '木', key: 'wood', color: '#4ade80' },
  { name: '水', key: 'water', color: '#60a5fa' },
  { name: '火', key: 'fire', color: '#f87171' },
  { name: '土', key: 'earth', color: '#fbbf24' }
]

function initChart() {
  if (!chartContainer.value) return

  chart = echarts.init(chartContainer.value, 'dark')
  updateChart()

  window.addEventListener('resize', handleResize)

  resizeObserver = new ResizeObserver(() => {
    chart?.resize()
  })
  resizeObserver.observe(chartContainer.value)
}

function handleResize() {
  chart?.resize()
}

function updateChart() {
  if (!chart) return

  const textColor = '#94a3b8'
  const splitLineColor = 'rgba(148, 163, 184, 0.1)'
  const areaColor = ['rgba(96, 165, 250, 0.1)', 'rgba(96, 165, 250, 0.05)']

  const data = elements.map((e) => userStore.profile.wuxing[e.key] || 0)
  const hasData = data.some((v) => v > 0)

  const option = {
    backgroundColor: 'transparent',
    radar: {
      indicator: elements.map((e) => ({
        name: e.name,
        max: 100,
        color: e.color
      })),
      center: ['50%', '50%'],
      radius: '65%',
      splitNumber: 4,
      axisName: {
        color: textColor,
        fontSize: 12,
        fontFamily: 'Noto Serif SC'
      },
      axisLine: {
        lineStyle: {
          color: splitLineColor
        }
      },
      splitLine: {
        lineStyle: {
          color: splitLineColor
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: areaColor
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: hasData ? data : [20, 20, 20, 20, 20],
            name: '五行强度',
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                { offset: 0, color: 'rgba(232, 196, 102, 0.4)' },
                { offset: 1, color: 'rgba(232, 196, 102, 0.1)' }
              ])
            },
            itemStyle: {
              color: '#e8c466',
              borderWidth: 2,
              borderColor: '#e8c466'
            },
            lineStyle: {
              width: 2,
              color: '#e8c466'
            }
          }
        ]
      }
    ],
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(30, 41, 59, 0.9)',
      borderColor: 'rgba(148, 163, 184, 0.2)',
      textStyle: {
        color: '#f8fafc'
      }
    }
  }

  chart.setOption(option)
}

watch(
  () => userStore.profile.wuxing,
  () => {
    setTimeout(updateChart, 50)
  },
  { deep: true }
)

onMounted(() => {
  setTimeout(initChart, 0)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  resizeObserver?.disconnect()
  chart?.dispose()
})
</script>

<template>
  <div class="five-elements-radar">
    <div v-if="userStore.hasBirthInfo()" class="chart-wrapper">
      <div ref="chartContainer" class="chart-container"></div>

      <!-- Element Legend -->
      <div class="element-legend">
        <div v-for="el in elements" :key="el.key" class="legend-item">
          <span class="legend-dot" :style="{ background: el.color }"></span>
          <span class="legend-name">{{ el.name }}</span>
          <span class="legend-value">{{ userStore.profile.wuxing[el.key] || 0 }}%</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </div>
      <p class="empty-title">暂无五行数据</p>
      <p class="empty-subtitle">请在「个人」页面完善生辰信息</p>
      <button class="btn btn-primary btn-sm" @click="$emit('goToProfile')">去完善</button>
    </div>
  </div>
</template>

<style scoped>
.five-elements-radar {
  width: 100%;
}

.chart-wrapper {
  position: relative;
}

.chart-container {
  width: 100%;
  height: 220px;
}

.element-legend {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-subtle);
}

.legend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-name {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-family: var(--font-display);
}

.legend-value {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.empty-state {
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: var(--text-secondary);
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border-light);
  padding: var(--space-6);
}

.empty-icon {
  width: 40px;
  height: 40px;
  color: var(--text-tertiary);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin: 0;
}

.empty-subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.btn-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-xs);
}

@media (max-width: 640px) {
  .chart-container {
    height: 180px;
  }

  .element-legend {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
