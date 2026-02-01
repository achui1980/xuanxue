<template>
  <div class="analysis-tab">
    <!-- 1. 最佳时机查询（核心功能） -->
    <BestTimingQuery />

    <!-- 2. 计划冲突检查 -->
    <ConflictChecker />

    <!-- 3. 未来7天日程规划 -->
    <FuturePlanner />
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
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (max-width: 640px) {
  .analysis-tab {
    padding: 0 12px;
  }
}
</style>
