<template>
  <div v-if="visible" class="error-alert" :class="type">
    <div class="icon">
      <span v-if="type === 'error'">⚠️</span>
      <span v-else>ℹ️</span>
    </div>
    <div class="content">
      <h3 v-if="title" class="title">{{ title }}</h3>
      <p class="message">{{ message }}</p>
    </div>
    <button v-if="dismissible" @click="dismiss" class="close-btn" aria-label="Close">
      &times;
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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
    default: 'error', // 'error', 'warning', 'info'
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
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  animation: slideIn 0.3s ease-out;
}

.error-alert.error {
  background-color: #fef2f2;
  border-color: #fee2e2;
  color: #991b1b;
}

.error-alert.warning {
  background-color: #fffbeb;
  border-color: #fef3c7;
  color: #92400e;
}

.error-alert.info {
  background-color: #eff6ff;
  border-color: #dbeafe;
  color: #1e40af;
}

.icon {
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.content {
  flex: 1;
}

.title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.message {
  font-size: 0.875rem;
  line-height: 1.5;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  color: inherit;
  opacity: 0.6;
  padding: 0 0.5rem;
  margin-left: 0.5rem;
}

.close-btn:hover {
  opacity: 1;
}

/* Dark mode overrides (assuming parent has data-theme='dark') */
:global([data-theme='dark']) .error-alert.error {
  background-color: #450a0a;
  border-color: #7f1d1d;
  color: #fecaca;
}

:global([data-theme='dark']) .error-alert.warning {
  background-color: #451a03;
  border-color: #78350f;
  color: #fde68a;
}

:global([data-theme='dark']) .error-alert.info {
  background-color: #172554;
  border-color: #1e3a8a;
  color: #bfdbfe;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
