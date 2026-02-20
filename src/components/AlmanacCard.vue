<template>
  <BaseCard class="almanac-card" title="今日黄历" elevated>
    <div v-if="loading" class="loading-state">
      <div class="skeleton-line" />
      <div class="skeleton-line short" />
    </div>

    <template v-else>
      <!-- 详细参数 (New) -->
      <div class="almanac-details">
        <div class="detail-item">
          <span class="detail-label">值神</span>
          <span class="detail-value">{{ almanacInfo.duty }}日</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">星宿</span>
          <span class="detail-value">{{ almanacInfo.twentyEightStar }}宿</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">五行</span>
          <span class="detail-value">{{ almanacInfo.dayNaYin }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">九星</span>
          <span class="detail-value">{{ almanacInfo.nineStar }}</span>
        </div>
      </div>

      <div class="divider" />

      <!-- 宜 -->
      <div class="almanac-section">
        <div class="section-header do">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span class="section-title">宜</span>
        </div>
        <div class="items-grid">
          <span v-for="item in almanacInfo.recommends" :key="item.name" class="almanac-item do">
            <span class="item-icon">{{ item.icon }}</span>
            <span class="item-name">{{ item.name }}</span>
          </span>
          <span v-if="almanacInfo.recommends.length === 0" class="empty-hint">
            今日无特别适宜事项
          </span>
        </div>
      </div>

      <div class="divider" />

      <!-- 忌 -->
      <div class="almanac-section">
        <div class="section-header avoid">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <span class="section-title">忌</span>
        </div>
        <div class="items-grid">
          <span v-for="item in almanacInfo.avoids" :key="item.name" class="almanac-item avoid">
            <span class="item-icon">{{ item.icon }}</span>
            <span class="item-name">{{ item.name }}</span>
          </span>
          <span v-if="almanacInfo.avoids.length === 0" class="empty-hint">
            今日无特别禁忌事项
          </span>
        </div>
      </div>
    </template>
  </BaseCard>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAlmanacInfo } from '@/utils/tyme'
import BaseCard from '@/components/common/BaseCard.vue'

const almanacInfo = ref({
  recommends: [],
  avoids: []
})
const loading = ref(true)

onMounted(() => {
  setTimeout(() => {
    almanacInfo.value = getAlmanacInfo()
    loading.value = false
  }, 200)
})
</script>

<style scoped>
.almanac-card {
  grid-column: span 1;
}

.loading-state {
  padding: var(--space-4) 0;
}

.skeleton-line {
  height: 24px;
  background: linear-gradient(
    90deg,
    var(--bg-elevated) 25%,
    var(--border-light) 50%,
    var(--bg-elevated) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-3);
}

.skeleton-line.short {
  width: 60%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.almanac-details {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  background: var(--bg-secondary);
  padding: var(--space-3);
  border-radius: var(--radius-md);
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.detail-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.detail-value {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.almanac-section {
  margin-bottom: var(--space-4);
}

.almanac-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.section-header.do {
  color: var(--wood);
}
.section-header.avoid {
  color: var(--fire);
}

.section-icon {
  width: 20px;
  height: 20px;
}

.section-icon svg {
  width: 100%;
  height: 100%;
}

.section-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
}

.items-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.almanac-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--transition-fast);
  cursor: default;
}

.almanac-item:hover {
  transform: translateY(-1px);
}

.almanac-item.do {
  background: rgba(74, 222, 128, 0.1);
  color: var(--wood);
  border: 1px solid rgba(74, 222, 128, 0.2);
}

.almanac-item.avoid {
  background: rgba(248, 113, 113, 0.1);
  color: var(--fire);
  border: 1px solid rgba(248, 113, 113, 0.2);
}

.item-icon {
  font-size: var(--text-base);
}

.item-name {
  font-size: var(--text-sm);
}

.empty-hint {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-style: italic;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-light), transparent);
  margin: var(--space-4) 0;
}

@media (max-width: 640px) {
  .almanac-item {
    padding: var(--space-1) var(--space-2);
    font-size: var(--text-xs);
  }
}
</style>
