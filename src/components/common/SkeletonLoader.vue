<template>
  <div class="skeleton-container" :class="{ 'skeleton-active': loading }">
    <div v-if="loading" class="skeleton-wrapper">
      <div 
        v-for="n in count" 
        :key="n" 
        class="skeleton-item"
        :style="{ 
          width: width || '100%', 
          height: height || '20px',
          marginBottom: gap || '10px',
          borderRadius: radius || '4px'
        }"
      ></div>
    </div>
    <slot v-else></slot>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: 1
  },
  width: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: ''
  },
  gap: {
    type: String,
    default: ''
  },
  radius: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.skeleton-wrapper {
  width: 100%;
}

.skeleton-item {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-hover) 37%,
    var(--bg-secondary) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
