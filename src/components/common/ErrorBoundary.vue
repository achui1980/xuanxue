<template>
  <div class="error-boundary">
    <slot v-if="!error"></slot>
    <div v-else class="error-fallback">
      <div class="error-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p>{{ error.message || 'An unexpected error occurred.' }}</p>
      <button @click="resetError" class="retry-btn">Try Again</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)

// Capture errors from child components
onErrorCaptured((err, instance, info) => {
  console.error('Error captured in boundary:', err, info)
  error.value = err
  
  // Return false to stop propagation if you want this boundary to handle it completely
  // strict mode: return false
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
  padding: 2rem;
  background-color: var(--bg-secondary);
  border-radius: 0.5rem;
  box-shadow: var(--card-shadow);
  margin: 1rem 0;
  border: 1px solid var(--border-color);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

h3 {
  margin-bottom: 0.5rem;
  color: var(--header-text);
}

p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.retry-btn {
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: var(--accent-hover);
}
</style>
