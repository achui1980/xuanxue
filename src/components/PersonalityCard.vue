<template>
  <BaseCard v-if="hasBirthInfo" class="personality-card" elevated>
    <template #header>
      <div class="personality-header">
        <div class="personality-avatar" :class="`wuxing-${dominantElement}`">
          <ElementIcon :element="dominantElement" size="xl" />
        </div>
        <div class="personality-title">
          <h3 class="personality-name">{{ personalityName }}</h3>
          <div class="personality-tags">
            <span v-for="tag in personalityTags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <div class="personality-description">
      <p class="description-text">{{ personalityDescription }}</p>
    </div>

    <div v-if="dayMasterInfo" class="day-master-section">
      <div class="day-master-header">
        <span class="day-master-label">日主</span>
        <span class="day-master-value"
          >{{ dayMasterInfo.name }} · {{ dayMasterInfo.metaphor }}</span
        >
      </div>
      <p class="day-master-traits">{{ dayMasterInfo.traits }}</p>
      <p class="day-master-advice">
        <AppIcon name="lightbulb" size="sm" />
        {{ dayMasterInfo.advice }}
      </p>
    </div>

    <div class="best-for-section">
      <div class="section-label">最适合</div>
      <div class="best-activities">
        <span v-for="activity in bestActivities" :key="activity" class="activity-tag">
          {{ activity }}
        </span>
      </div>
      <div class="best-time">
        <AppIcon name="clock" size="sm" />
        <span class="time-text">最佳时段：{{ bestTimeOfDay }}</span>
      </div>
    </div>

    <div class="characteristics-section">
      <div class="section-label">性格特征</div>
      <p class="characteristics-text">{{ characteristics }}</p>
    </div>

    <div class="wuxing-visualization">
      <div class="section-label">五行分布</div>
      <div class="wuxing-bars">
        <div
          v-for="item in wuxingData"
          :key="item.key"
          class="wuxing-bar-item"
          :class="{ dominant: item.isDominant }"
        >
          <span class="wuxing-name">{{ item.name }}</span>
          <div class="wuxing-bar-container">
            <div
              class="wuxing-bar-fill"
              :style="{ width: getWuxingPercent(item.value) + '%' }"
              :class="`wuxing-${item.key}`"
            />
          </div>
          <span class="wuxing-value">{{ item.value }}</span>
        </div>
      </div>
    </div>

    <div class="favorable-section">
      <div class="favorable-row">
        <span class="favorable-label good">喜用神</span>
        <span class="favorable-content">{{ favorableElements.join('、') || '未计算' }}</span>
      </div>
      <div class="favorable-row">
        <span class="favorable-label bad">忌神</span>
        <span class="favorable-content">{{ unfavorableElements.join('、') || '未计算' }}</span>
      </div>
    </div>
  </BaseCard>

  <BaseCard v-else class="personality-empty" elevated>
    <div class="empty-content">
      <div class="empty-icon">
        <AppIcon name="user" size="xl" />
      </div>
      <p class="empty-text">完善出生信息，解锁你的五行人格画像</p>
      <button class="btn btn-primary" @click="scrollToBirthForm">去填写</button>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import { usePersonality } from '@/composables/usePersonality'
import BaseCard from '@/components/common/BaseCard.vue'
import ElementIcon from '@/components/icons/ElementIcon.vue'
import AppIcon from '@/components/icons/AppIcon.vue'

const {
  hasBirthInfo,
  dominantElement,
  personalityTags,
  personalityDescription,
  dayMasterInfo,
  bestActivities,
  bestTimeOfDay,
  characteristics,
  wuxingData,
  favorableElements,
  unfavorableElements,
  getWuxingPercent
} = usePersonality()

const personalityName = computed(() => {
  if (!dayMasterInfo.value) return ''
  return `${dayMasterInfo.value.name} · ${personalityTags.value[0] || ''}`
})

function scrollToBirthForm() {
  window.dispatchEvent(new CustomEvent('scroll-to-birth-form'))
}
</script>

<style scoped>
.personality-card {
  margin-bottom: var(--space-6);
}

.personality-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.personality-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 3px solid var(--border-light);
  flex-shrink: 0;
}

.personality-avatar.wuxing-wood {
  background: rgba(74, 222, 128, 0.1);
  border-color: var(--wood);
}

.personality-avatar.wuxing-fire {
  background: rgba(248, 113, 113, 0.1);
  border-color: var(--fire);
}

.personality-avatar.wuxing-earth {
  background: rgba(251, 191, 36, 0.1);
  border-color: var(--earth);
}

.personality-avatar.wuxing-metal {
  background: rgba(232, 196, 102, 0.15);
  border-color: var(--metal);
}

.personality-avatar.wuxing-water {
  background: rgba(96, 165, 250, 0.1);
  border-color: var(--water);
}

.personality-title {
  flex: 1;
}

.personality-name {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.personality-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.tag {
  background: rgba(96, 165, 250, 0.1);
  color: var(--water);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.personality-description {
  margin: var(--space-5) 0;
  padding: var(--space-4);
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
}

.description-text {
  margin: 0;
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
  font-size: var(--text-base);
}

.day-master-section {
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  border-left: 4px solid var(--water);
  background: rgba(96, 165, 250, 0.05);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
}

.day-master-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.day-master-label {
  background: var(--water);
  color: var(--ink-black);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
}

.day-master-value {
  font-weight: var(--font-bold);
  color: var(--text-primary);
  font-size: var(--text-lg);
  font-family: var(--font-display);
}

.day-master-traits {
  margin: 0 0 var(--space-2) 0;
  color: var(--text-primary);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.day-master-advice {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-style: italic;
}

.day-master-advice svg {
  flex-shrink: 0;
  color: var(--metal);
}

.best-for-section {
  margin-bottom: var(--space-5);
}

.section-label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-tertiary);
  margin-bottom: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.best-activities {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}

.activity-tag {
  background: rgba(74, 222, 128, 0.1);
  color: var(--wood);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.best-time {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.characteristics-section {
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
}

.characteristics-text {
  margin: 0;
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
  font-size: var(--text-sm);
}

.wuxing-visualization {
  margin-bottom: var(--space-5);
}

.wuxing-bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.wuxing-bar-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.wuxing-bar-item.dominant {
  background: rgba(232, 196, 102, 0.05);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  margin: calc(-1 * var(--space-2));
}

.wuxing-name {
  width: 24px;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-family: var(--font-display);
}

.wuxing-bar-container {
  flex: 1;
  height: 24px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.wuxing-bar-fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width 0.5s ease;
  min-width: 4px;
}

.wuxing-bar-fill.wuxing-wood {
  background: var(--wood);
}
.wuxing-bar-fill.wuxing-fire {
  background: var(--fire);
}
.wuxing-bar-fill.wuxing-earth {
  background: var(--earth);
}
.wuxing-bar-fill.wuxing-metal {
  background: var(--metal);
}
.wuxing-bar-fill.wuxing-water {
  background: var(--water);
}

.wuxing-value {
  width: 32px;
  text-align: right;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.favorable-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.favorable-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
}

.favorable-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  padding: var(--space-1) 0;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
}

.favorable-label.good {
  background: rgba(74, 222, 128, 0.15);
  color: var(--wood);
}

.favorable-label.bad {
  background: rgba(248, 113, 113, 0.15);
  color: var(--fire);
}

.favorable-content {
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

/* Empty State */
.personality-empty {
  margin-bottom: var(--space-6);
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-10) var(--space-5);
  text-align: center;
}

.empty-icon {
  color: var(--text-tertiary);
}

.empty-text {
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .personality-header {
    flex-direction: column;
    text-align: center;
  }

  .personality-avatar {
    width: 64px;
    height: 64px;
  }
}
</style>
