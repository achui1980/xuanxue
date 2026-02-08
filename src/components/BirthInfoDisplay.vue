<template>
  <BaseCard class="birth-info-display" elevated>
    <template #header>
      <div class="header-row">
        <div>
          <h3 class="card-title">命盘信息</h3>
          <p class="card-subtitle">你的八字五行分析</p>
        </div>
        <button class="btn btn-secondary btn-sm" @click="$emit('edit')">
          <AppIcon name="edit" size="sm" />
          修改
        </button>
      </div>
    </template>

    <div class="birth-content">
      <!-- 左侧：出生信息 -->
      <div class="birth-info">
        <div class="info-item">
          <span class="info-label">阳历</span>
          <span class="info-value">
            {{ profile.birthYear }}年{{ profile.birthMonth }}月{{ profile.birthDay }}日
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">时辰</span>
          <span class="info-value">
            {{ profile.birthHour }}时 ({{ getBranchForHour(profile.birthHour) }}时)
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">日主</span>
          <span class="info-value day-master">{{ profile.dayMaster }}</span>
        </div>
      </div>

      <!-- 中间：八字四柱 -->
      <div class="bazi-section">
        <div class="bazi-pillars">
          <div class="pillar">
            <span class="pillar-label">年柱</span>
            <span class="pillar-value">{{ profile.bazi?.year?.full || '--' }}</span>
          </div>
          <div class="pillar">
            <span class="pillar-label">月柱</span>
            <span class="pillar-value">{{ profile.bazi?.month?.full || '--' }}</span>
          </div>
          <div class="pillar day">
            <span class="pillar-label">日柱</span>
            <span class="pillar-value">{{ profile.bazi?.day?.full || '--' }}</span>
          </div>
          <div class="pillar">
            <span class="pillar-label">时柱</span>
            <span class="pillar-value">{{ profile.bazi?.hour?.full || '--' }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：喜用神 -->
      <div class="favorable-section">
        <div class="favorable-group">
          <span class="group-label good">喜用神</span>
          <div class="tag-list">
            <span
              v-for="element in profile.favorable"
              :key="element"
              class="tag"
              :class="`tag-${getElementKey(element)}`"
            >
              {{ element }}
            </span>
            <span v-if="!profile.favorable?.length" class="empty-text">未计算</span>
          </div>
        </div>
        <div class="favorable-group">
          <span class="group-label bad">忌神</span>
          <div class="tag-list">
            <span
              v-for="element in profile.unfavorable"
              :key="element"
              class="tag"
              :class="`tag-${getElementKey(element)}`"
            >
              {{ element }}
            </span>
            <span v-if="!profile.unfavorable?.length" class="empty-text">未计算</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 五行强度条 -->
    <div class="wuxing-bars">
      <div v-for="(value, key) in profile.wuxing" :key="key" class="wuxing-item">
        <ElementIcon :element="key" size="sm" />
        <span class="wuxing-name">{{ getWuxingName(key) }}</span>
        <div class="wuxing-bar-bg">
          <div class="wuxing-progress" :class="key" :style="{ width: `${value}%` }" />
        </div>
        <span class="wuxing-value">{{ value }}%</span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useBeijingTime } from '@/composables/useBeijingTime'
import BaseCard from '@/components/common/BaseCard.vue'
import ElementIcon from '@/components/icons/ElementIcon.vue'
import AppIcon from '@/components/icons/AppIcon.vue'

const userStore = useUserStore()
const { getBranchForHour } = useBeijingTime()

const profile = computed(() => userStore.profile)

defineEmits(['edit'])

function getWuxingName(key) {
  const map = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' }
  return map[key] || key
}

function getElementKey(elementName) {
  const map = {
    金: 'metal',
    木: 'wood',
    水: 'water',
    火: 'fire',
    土: 'earth'
  }
  return map[elementName] || 'earth'
}
</script>

<style scoped>
.birth-info-display {
  margin-bottom: 0;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.card-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: var(--space-1) 0 0;
}

.birth-content {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  gap: var(--space-6);
  margin: var(--space-5) 0;
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
}

@media (max-width: 1024px) {
  .birth-content {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }
}

/* Birth Info */
.birth-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.info-value.day-master {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  background: linear-gradient(135deg, var(--metal) 0%, var(--metal-dim) 100%);
  color: var(--ink-black);
  border-radius: var(--radius-md);
  font-size: var(--text-xl);
}

/* Bazi Section */
.bazi-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.bazi-pillars {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}

.pillar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-3);
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
}

.pillar.day {
  background: rgba(96, 165, 250, 0.1);
  border-color: rgba(96, 165, 250, 0.3);
}

.pillar-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.pillar-value {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--metal);
}

.pillar.day .pillar-value {
  color: var(--water);
}

/* Favorable Section */
.favorable-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.favorable-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.group-label {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  display: inline-block;
  width: fit-content;
}

.group-label.good {
  background: rgba(74, 222, 128, 0.15);
  color: var(--wood);
}

.group-label.bad {
  background: rgba(248, 113, 113, 0.15);
  color: var(--fire);
}

.tag-list {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.tag {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.tag-metal {
  background: rgba(232, 196, 102, 0.15);
  color: var(--metal);
}
.tag-wood {
  background: rgba(74, 222, 128, 0.15);
  color: var(--wood);
}
.tag-water {
  background: rgba(96, 165, 250, 0.15);
  color: var(--water);
}
.tag-fire {
  background: rgba(248, 113, 113, 0.15);
  color: var(--fire);
}
.tag-earth {
  background: rgba(251, 191, 36, 0.15);
  color: var(--earth);
}

.empty-text {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* Wuxing Bars */
.wuxing-bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.wuxing-item {
  display: grid;
  grid-template-columns: 24px 40px 1fr 48px;
  align-items: center;
  gap: var(--space-3);
}

.wuxing-name {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.wuxing-bar-bg {
  height: 8px;
  background: var(--bg-elevated);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.wuxing-progress {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.5s ease;
}

.wuxing-progress.wood {
  background: var(--wood);
}
.wuxing-progress.fire {
  background: var(--fire);
}
.wuxing-progress.earth {
  background: var(--earth);
}
.wuxing-progress.metal {
  background: var(--metal);
}
.wuxing-progress.water {
  background: var(--water);
}

.wuxing-value {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  text-align: right;
}

@media (max-width: 768px) {
  .bazi-pillars {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
