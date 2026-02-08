<template>
  <BaseCard class="term-card" elevated>
    <div v-if="loading" class="loading-state">
      <div class="skeleton-circle" />
      <div class="skeleton-text">
        <div class="skeleton-line" />
        <div class="skeleton-line short" />
      </div>
    </div>

    <template v-else>
      <!-- Current Term -->
      <div v-if="termInfo.current" class="term-section">
        <div class="term-icon-wrapper">
          <svg
            class="term-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="12" cy="12" r="5" />
            <path
              d="M12 1v2M12 21v2M4.22 4.22l1.41 1.41M18.36 18.36l1.41 1.41M1 12h2M21 12h2M4.22 19.78l1.41-1.41M18.36 5.64l1.41-1.41"
            />
          </svg>
        </div>
        <div class="term-info">
          <span class="term-label">当前节气 · {{ termInfo.current }}</span>
          <span v-if="termInfo.daysUntil > 0" class="term-countdown">
            距离{{ termInfo.next }}还有 {{ termInfo.daysUntil }} 天
          </span>
          <span v-else-if="termInfo.next" class="term-countdown today">
            今日{{ termInfo.next }}
          </span>
        </div>
      </div>

      <!-- Festival Section -->
      <div v-if="festivalInfo.hasFestival" class="festival-section">
        <div
          v-for="festival in festivalInfo.festivals"
          :key="festival"
          class="festival-tag"
          :class="{ traditional: festivalInfo.isTraditional }"
        >
          <svg
            class="festival-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
          <span>{{ festival }}</span>
        </div>
      </div>
    </template>
  </BaseCard>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTermInfo, getFestivalInfo } from '@/utils/tyme'
import BaseCard from '@/components/common/BaseCard.vue'

const termInfo = ref({
  current: null,
  next: null,
  daysUntil: 0
})
const festivalInfo = ref({
  festivals: [],
  isTraditional: false,
  hasFestival: false
})
const loading = ref(true)

onMounted(() => {
  setTimeout(() => {
    termInfo.value = getTermInfo()
    festivalInfo.value = getFestivalInfo()
    loading.value = false
  }, 150)
})
</script>

<style scoped>
.term-card {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(96, 165, 250, 0.05) 100%);
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.skeleton-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    var(--bg-elevated) 25%,
    var(--border-light) 50%,
    var(--bg-elevated) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-text {
  flex: 1;
}

.skeleton-line {
  height: 20px;
  background: linear-gradient(
    90deg,
    var(--bg-elevated) 25%,
    var(--border-light) 50%,
    var(--bg-elevated) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
}

.skeleton-line.short {
  width: 70%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Term Section */
.term-section {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.term-icon-wrapper {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border-radius: var(--radius-full);
  flex-shrink: 0;
  color: var(--water);
}

.term-icon {
  width: 32px;
  height: 32px;
}

.term-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.term-label {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.term-countdown {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.term-countdown.today {
  color: var(--wood);
  font-weight: var(--font-medium);
}

/* Festival Section */
.festival-section {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

.festival-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  background: rgba(96, 165, 250, 0.1);
  color: var(--water);
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.festival-tag.traditional {
  background: linear-gradient(135deg, rgba(232, 196, 102, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%);
  color: var(--metal);
  border-color: rgba(232, 196, 102, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.festival-icon {
  width: 16px;
  height: 16px;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

@media (max-width: 640px) {
  .term-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .term-icon {
    width: 28px;
    height: 28px;
  }

  .term-label {
    font-size: var(--text-base);
  }
}
</style>
