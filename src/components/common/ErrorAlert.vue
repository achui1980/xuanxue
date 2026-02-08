<template>
  <Transition name="slide">
    <div v-if="visible" class="error-alert" :class="type">
      <div class="icon">
        <AppIcon v-if="type === 'error'" name="warning" size="lg" />
        <AppIcon v-else name="info" size="lg" />
      </div>
      <div class="content">
        <h3 v-if="title" class="title">{{ title }}</h3>
        <p class="message">{{ message }}</p>
      </div>
      <button v-if="dismissible" @click="dismiss" class="close-btn" aria-label="Close">
        <AppIcon name="close" size="md" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import AppIcon from '@/components/icons/AppIcon.vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'warning', 'info'].includes(value)
  },
  dismissible: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const visible = ref(true)

function dismiss() {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.error-alert {
  display: flex;
  align-items: flex-start;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
  border: 1px solid transparent;
}

.error-alert.error {
  background-color: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.3);
  color: var(--fire);
}

.error-alert.warning {
  background-color: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
  color: var(--earth);
}

.error-alert.info {
  background-color: rgba(96, 165, 250, 0.1);
  border-color: rgba(96, 165, 250, 0.3);
  color: var(--water);
}

.icon {
  margin-right: var(--space-3);
  flex-shrink: 0;
}

.content {
  flex: 1;
}

.title {
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-1);
  font-size: var(--text-base);
  color: inherit;
}

.message {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  padding: var(--space-1);
  margin-left: var(--space-2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--transition-fast);
}

.close-btn:hover {
  opacity: 1;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all var(--transition-base);
  max-height: 200px;
  opacity: 1;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  margin-bottom: 0;
  overflow: hidden;
}
</style>
