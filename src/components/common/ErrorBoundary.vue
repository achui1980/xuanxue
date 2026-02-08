<template>
  <div class="error-boundary">
    <slot v-if="!error"></slot>
    <div v-else class="error-fallback">
      <div class="error-icon">
        <AppIcon name="warning" size="xl" />
      </div>
      <h3>出错了</h3>
      <p>{{ error.message || '发生了意外错误。' }}</p>
      <button @click="resetError" class="retry-btn">
        <AppIcon name="refresh" size="sm" />
        重试
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import AppIcon from '@/components/icons/AppIcon.vue'

const error = ref(null)

onErrorCaptured((err, instance, info) => {
  console.error('Error captured in boundary:', err, info)
  error.value = err
  return false
})

function resetError() {
  error.value = null
}
</script>

<style scoped>
.error-boundary {
  width: 100%;
}

.error-fallback {
  text-align: center;
  padding: var(--space-8);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin: var(--space-4) 0;
  border: 1px solid var(--border-subtle);
}

.error-icon {
  color: var(--fire);
  margin-bottom: var(--space-4);
}

h3 {
  margin-bottom: var(--space-2);
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-xl);
}

p {
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  font-size: var(--text-sm);
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--water);
  color: var(--ink-black);
  border: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: var(--font-semibold);
  transition: all var(--transition-fast);
}

.retry-btn:hover {
  background: var(--water-dim);
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow);
}
</style>
