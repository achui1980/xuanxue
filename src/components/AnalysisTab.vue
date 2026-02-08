<template>
  <div class="analysis-tab">
    <div class="bento-grid stagger-enter">
      <!-- 主要功能：最佳时机查询 -->
      <BestTimingQuery class="bento-item-large feature-card-primary" />

      <!-- 次要功能：未来7天规划 -->
      <FuturePlanner class="bento-item" />

      <!-- 快速工具：冲突检查 -->
      <ConflictChecker class="bento-item" />
    </div>
  </div>
</template>

<script setup>
import BestTimingQuery from '@/components/BestTimingQuery.vue'
import ConflictChecker from '@/components/ConflictChecker.vue'
import FuturePlanner from '@/components/FuturePlanner.vue'
</script>

<style scoped>
.analysis-tab {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-4);
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

.bento-item {
  min-height: 200px;
}

.bento-item-large {
  grid-column: span 2;
  min-height: 280px;
}

/* 平板适配 */
@media (max-width: 768px) {
  .analysis-tab {
    padding: var(--space-3);
  }

  .bento-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .bento-item-large {
    grid-column: span 1;
    min-height: auto;
  }
}

/* 手机适配 */
@media (max-width: 480px) {
  .analysis-tab {
    padding: var(--space-2);
  }

  .bento-grid {
    gap: var(--space-3);
  }
}
</style>
