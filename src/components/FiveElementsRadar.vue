<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

const userStore = useUserStore()
const appStore = useAppStore()
const chartContainer = ref(null)
let chart = null
let resizeObserver = null

// 五行配置
const elements = [
  { name: '木', key: 'wood', color: '#10b981' }, // emerald-500
  { name: '火', key: 'fire', color: '#ef4444' }, // red-500
  { name: '土', key: 'earth', color: '#f59e0b' }, // amber-500
  { name: '金', key: 'metal', color: '#64748b' }, // slate-500
  { name: '水', key: 'water', color: '#3b82f6' }, // blue-500
]

function getThemeColor(variable) {
  return getComputedStyle(document.body).getPropertyValue(variable).trim()
}

function initChart() {
  if (!chartContainer.value) return
  
  chart = echarts.init(chartContainer.value)
  updateChart()
  
  window.addEventListener('resize', handleResize)
  
  // Use ResizeObserver for container resize
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

  const textColor = getThemeColor('--text-secondary')
  const splitLineColor = getThemeColor('--border-color')
  const areaColor = appStore.theme === 'dark' 
    ? ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
    : ['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.02)']

  const data = elements.map(e => userStore.profile.wuxing[e.key] || 0)
  const hasData = data.some(v => v > 0)
  
  const option = {
    radar: {
      indicator: elements.map(e => ({ name: e.name, max: 100 })),
      splitNumber: 4,
      axisName: {
        color: textColor,
        fontSize: 14
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
            value: hasData ? data : [0,0,0,0,0],
            name: '五行强度',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
              ])
            },
            itemStyle: {
              color: '#3b82f6'
            },
            lineStyle: {
              width: 2
            }
          }
        ]
      }
    ],
    tooltip: {
      trigger: 'item'
    }
  }

  chart.setOption(option)
}

watch(
  [() => userStore.profile.wuxing, () => appStore.theme], 
  () => {
    // Small delay to ensure CSS variables are updated in DOM
    setTimeout(updateChart, 50)
  },
  { deep: true }
)

onMounted(() => {
  // Wait for next tick to ensure container has dimensions
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
    </div>
    
    <div v-else class="empty-state">
      <span class="icon">🌫️</span>
      <p>暂无五行数据</p>
      <p class="sub-text">请在"个人"标签页完善生辰信息</p>
    </div>
  </div>
</template>

<style scoped>
/* Removed .card wrapper styling since parent now handles layout */
.five-elements-radar {
  width: 100%;
}

.chart-wrapper {
  position: relative;
  height: 250px;
  width: 100%;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.empty-state {
  height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: var(--bg-hover);
  border-radius: 8px;
  border: 1px dashed var(--border-color);
}

.icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.sub-text {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-top: 4px;
}
</style>
