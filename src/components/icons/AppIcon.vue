<!-- 通用 SVG 图标集合 -->
<template>
  <svg
    :class="['app-icon', size]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- 太阳/阳 -->
    <g v-if="name === 'sun'">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </g>

    <!-- 月亮/阴 -->
    <g v-else-if="name === 'moon'">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
    </g>

    <!-- 时钟 -->
    <g v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </g>

    <!-- 日历 -->
    <g v-else-if="name === 'calendar'">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </g>

    <!-- 星星 -->
    <g v-else-if="name === 'star'">
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      />
    </g>

    <!-- 对勾 -->
    <g v-else-if="name === 'check'">
      <polyline points="20 6 9 17 4 12" />
    </g>

    <!-- 关闭 -->
    <g v-else-if="name === 'close'">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </g>

    <!-- 加号 -->
    <g v-else-if="name === 'plus'">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </g>

    <!-- 减号 -->
    <g v-else-if="name === 'minus'">
      <line x1="5" y1="12" x2="19" y2="12" />
    </g>

    <!-- 信息 -->
    <g v-else-if="name === 'info'">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </g>

    <!-- 警告 -->
    <g v-else-if="name === 'warning'">
      <path
        d="M10.29 3.86l-8.47 14.73A2 2 0 0 0 3.67 22h16.66a2 2 0 0 0 1.85-3.41L13.71 3.86a2 2 0 0 0-3.42 0z"
      />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </g>

    <!-- 趋势向上 -->
    <g v-else-if="name === 'trend-up'">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </g>

    <!-- 趋势向下 -->
    <g v-else-if="name === 'trend-down'">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </g>

    <!-- 用户 -->
    <g v-else-if="name === 'user'">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </g>

    <!-- 设置 -->
    <g v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
      />
    </g>

    <!-- 箭头右 -->
    <g v-else-if="name === 'arrow-right'">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </g>

    <!-- 箭头左 -->
    <g v-else-if="name === 'arrow-left'">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </g>

    <!--  Chevron 下 -->
    <g v-else-if="name === 'chevron-down'">
      <polyline points="6 9 12 15 18 9" />
    </g>

    <!-- Chevron 上 -->
    <g v-else-if="name === 'chevron-up'">
      <polyline points="18 15 12 9 6 15" />
    </g>

    <!-- Bell (铃铛/提醒) -->
    <g v-else-if="name === 'bell'">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </g>

    <!-- Database (数据库) -->
    <g v-else-if="name === 'database'">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </g>

    <!-- Shield (盾牌/隐私) -->
    <g v-else-if="name === 'shield'">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </g>

    <!-- Edit (编辑) -->
    <g v-else-if="name === 'edit'">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </g>

    <!-- Trophy/Gold Medal (第一名) -->
    <g v-else-if="name === 'trophy'">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </g>

    <!-- Medal (奖牌) -->
    <g v-else-if="name === 'medal'">
      <circle cx="12" cy="9" r="5" />
      <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38l-3.93 3.93" />
      <path d="M7.5 2.21c4.49 3.09 8.57 9.75 10.96 16.79m-1.03-19.14l2.82 2.82" />
      <circle cx="12" cy="9" r="2" fill="currentColor" />
    </g>

    <!-- Check Circle (勾选圈) -->
    <g v-else-if="name === 'check-circle'">
      <circle cx="12" cy="12" r="10" />
      <polyline points="8 12 11 15 16 9" />
    </g>

    <!-- Close Circle (关闭圈) -->
    <g v-else-if="name === 'close-circle'">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </g>

    <!-- Warning Circle (警告圈) -->
    <g v-else-if="name === 'warning-circle'">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </g>

    <!-- Lightbulb (灯泡/提示) -->
    <g v-else-if="name === 'lightbulb'">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path
        d="M15.09 14c.18-.9.27-1.48.27-2.14A5.42 5.42 0 0 0 6.27 9.13a5.67 5.67 0 0 0 2.4 9.6V18h5.25v-.72c1.24-.5 2.12-1.56 2.17-2.86"
      />
      <circle cx="12" cy="7" r="1" fill="currentColor" />
    </g>

    <!-- Ranking Numbers -->
    <g v-else-if="name === 'rank-1'">
      <circle cx="12" cy="12" r="10" stroke="#FFD700" />
      <text
        x="12"
        y="16"
        text-anchor="middle"
        font-size="12"
        font-weight="bold"
        fill="currentColor"
      >
        1
      </text>
    </g>

    <g v-else-if="name === 'rank-2'">
      <circle cx="12" cy="12" r="10" stroke="#C0C0C0" />
      <text
        x="12"
        y="16"
        text-anchor="middle"
        font-size="12"
        font-weight="bold"
        fill="currentColor"
      >
        2
      </text>
    </g>

    <g v-else-if="name === 'rank-3'">
      <circle cx="12" cy="12" r="10" stroke="#CD7F32" />
      <text
        x="12"
        y="16"
        text-anchor="middle"
        font-size="12"
        font-weight="bold"
        fill="currentColor"
      >
        3
      </text>
    </g>

    <!-- Notes/Edit (编辑/笔记) -->
    <g v-else-if="name === 'notes'">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </g>

    <!-- Eye (眼睛/观察) -->
    <g v-else-if="name === 'eye'">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </g>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  }
})
</script>

<style scoped>
.app-icon {
  flex-shrink: 0;
}

.app-icon.sm {
  width: 16px;
  height: 16px;
}
.app-icon.md {
  width: 20px;
  height: 20px;
}
.app-icon.lg {
  width: 24px;
  height: 24px;
}
.app-icon.xl {
  width: 32px;
  height: 32px;
}
</style>
