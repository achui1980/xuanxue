<template>
  <div class="analysis-tab">
    <BestTimingQuery />
    <ConflictChecker />
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
  max-width: 800px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .analysis-tab {
    max-width: 100%;
  }
}
</style>
