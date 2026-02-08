<template>
  <component
    :is="tag"
    class="base-card"
    :class="{
      'card-interactive': interactive,
      'card-elevated': elevated,
      'card-bordered': bordered,
      'card-glass': glass,
      [`padding-${padding}`]: true
    }"
    v-bind="$attrs"
  >
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </slot>
    </div>

    <div class="card-body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </component>
</template>

<script setup>
defineOptions({
  name: 'BaseCard',
  inheritAttrs: false
})

defineProps({
  tag: {
    type: String,
    default: 'div'
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  interactive: {
    type: Boolean,
    default: false
  },
  elevated: {
    type: Boolean,
    default: true
  },
  bordered: {
    type: Boolean,
    default: true
  },
  glass: {
    type: Boolean,
    default: false
  },
  padding: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg'].includes(value)
  }
})
</script>

<style scoped>
.base-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
}

/* Padding variants */
.padding-none {
  padding: 0;
}
.padding-sm {
  padding: var(--space-3);
}
.padding-md {
  padding: var(--space-5);
}
.padding-lg {
  padding: var(--space-6);
}

/* Border */
.card-bordered {
  border: 1px solid var(--border-subtle);
}

.card-bordered:hover {
  border-color: var(--border-light);
}

/* Shadow */
.card-elevated {
  box-shadow: var(--shadow-md);
}

.card-elevated:hover {
  box-shadow: var(--shadow-lg);
}

/* Glass effect */
.card-glass {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Interactive */
.card-interactive {
  cursor: pointer;
}

.card-interactive:hover {
  transform: translateY(-2px);
}

.card-interactive:active {
  transform: translateY(0);
}

/* Header */
.card-header {
  margin-bottom: var(--space-4);
}

.card-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}

.card-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* Body */
.card-body {
  flex: 1;
}

/* Footer */
.card-footer {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}
</style>
