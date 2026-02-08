<!-- 五行图标组件 -->
<template>
  <svg
    :class="['element-icon', `element-${element}`, size]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- 金 - 圆形，代表金属的完整与坚固 -->
    <g v-if="element === 'metal'">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </g>

    <!-- 木 - 向上生长的树枝 -->
    <g v-else-if="element === 'wood'">
      <path d="M12 21V8" />
      <path d="M12 8l4-4" />
      <path d="M12 8l-4-4" />
      <path d="M12 14l3-3" />
      <path d="M12 14l-3-3" />
    </g>

    <!-- 水 - 波浪流动 -->
    <g v-else-if="element === 'water'">
      <path d="M2 12c2-3 5-3 7 0s5 3 7 0 5-3 7 0" />
      <path d="M2 17c2-3 5-3 7 0s5 3 7 0 5-3 7 0" />
    </g>

    <!-- 火 - 火焰形状 -->
    <g v-else-if="element === 'fire'">
      <path d="M12 21c4-3 6-6 6-10 0-4-3-8-6-11-3 3-6 7-6 11 0 4 2 7 6 10z" />
      <path
        d="M12 17c2-1.5 3-3 3-5 0-2-1.5-4-3-6-1.5 2-3 4-3 6 0 2 1 3.5 3 5z"
        fill="currentColor"
      />
    </g>

    <!-- 土 - 山脉大地 -->
    <g v-else-if="element === 'earth'">
      <path d="M3 21h18" />
      <path d="M5 21l4-8 3 4 4-6 5 10" />
      <circle cx="8" cy="9" r="2" />
    </g>
  </svg>
</template>

<script setup>
defineProps({
  element: {
    type: String,
    required: true,
    validator: (value) => ['metal', 'wood', 'water', 'fire', 'earth'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  }
})
</script>

<style scoped>
.element-icon {
  flex-shrink: 0;
}

.element-icon.sm {
  width: 16px;
  height: 16px;
}
.element-icon.md {
  width: 24px;
  height: 24px;
}
.element-icon.lg {
  width: 32px;
  height: 32px;
}
.element-icon.xl {
  width: 48px;
  height: 48px;
}

.element-metal {
  color: var(--metal);
}
.element-wood {
  color: var(--wood);
}
.element-water {
  color: var(--water);
}
.element-fire {
  color: var(--fire);
}
.element-earth {
  color: var(--earth);
}
</style>
