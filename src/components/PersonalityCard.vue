<template>
  <div class="personality-card" v-if="hasBirthInfo">
    <div class="personality-header">
      <div class="personality-avatar" :class="`wuxing-${dominantElement}`">
        <span class="avatar-emoji">{{ getAvatarEmoji() }}</span>
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
      <p class="day-master-advice">💡 {{ dayMasterInfo.advice }}</p>
    </div>

    <div class="best-for-section">
      <div class="section-label">最适合</div>
      <div class="best-activities">
        <span v-for="activity in bestActivities" :key="activity" class="activity-tag">
          {{ activity }}
        </span>
      </div>
      <div class="best-time">
        <span class="time-icon">🕐</span>
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
            ></div>
          </div>
          <span class="wuxing-value">{{ item.value }}</span>
        </div>
      </div>
    </div>

    <div class="favorable-section">
      <div class="favorable-row">
        <span class="favorable-label favorable">喜用神</span>
        <span class="favorable-content">{{ favorableElements.join('、') || '未计算' }}</span>
      </div>
      <div class="favorable-row">
        <span class="favorable-label unfavorable">忌神</span>
        <span class="favorable-content">{{ unfavorableElements.join('、') || '未计算' }}</span>
      </div>
    </div>
  </div>

  <div v-else class="personality-empty">
    <div class="empty-icon">👤</div>
    <p class="empty-text">完善出生信息，解锁你的五行人格画像</p>
    <button class="empty-action" @click="scrollToBirthForm">去填写</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePersonality } from '@/composables/usePersonality'

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

function getAvatarEmoji() {
  const emojis = {
    wood: '🌳',
    fire: '☀️',
    earth: '⛰️',
    metal: '⚔️',
    water: '🌊'
  }
  return emojis[dominantElement.value] || '✨'
}

function scrollToBirthForm() {
  // Emit event to parent to scroll to birth form
  // This will be handled by ProfileTab
  window.dispatchEvent(new CustomEvent('scroll-to-birth-form'))
}
</script>

<style scoped>
.personality-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  margin-bottom: 24px;
}

.personality-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.personality-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  background: var(--bg-secondary);
  border: 3px solid var(--border-color);
  flex-shrink: 0;
}

.personality-avatar.wuxing-wood {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--success-color);
}

.personality-avatar.wuxing-fire {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger-color);
}

.personality-avatar.wuxing-earth {
  background: rgba(245, 158, 11, 0.1);
  border-color: var(--warning-color);
}

.personality-avatar.wuxing-metal {
  background: rgba(148, 163, 184, 0.2);
  border-color: #94a3b8;
}

.personality-avatar.wuxing-water {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--accent-color);
}

.avatar-emoji {
  line-height: 1;
}

.personality-title {
  flex: 1;
}

.personality-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--header-text);
  margin: 0 0 8px 0;
}

.personality-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-color);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.personality-description {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.description-text {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 1rem;
}

.day-master-section {
  margin-bottom: 20px;
  padding: 16px;
  border-left: 4px solid var(--accent-color);
  background: rgba(var(--accent-rgb), 0.05);
  border-radius: 0 12px 12px 0;
}

.day-master-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.day-master-label {
  background: var(--accent-color);
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.day-master-value {
  font-weight: 700;
  color: var(--header-text);
  font-size: 1.1rem;
}

.day-master-traits {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.5;
}

.day-master-advice {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-style: italic;
}

.best-for-section {
  margin-bottom: 20px;
}

.section-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.best-activities {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.activity-tag {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.best-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.time-icon {
  font-size: 1.1rem;
}

.characteristics-section {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.characteristics-text {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 0.95rem;
}

.wuxing-visualization {
  margin-bottom: 20px;
}

.wuxing-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wuxing-bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wuxing-bar-item.dominant {
  background: rgba(var(--accent-rgb), 0.05);
  padding: 8px;
  border-radius: 8px;
  margin: -4px -8px;
}

.wuxing-name {
  width: 24px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.wuxing-bar-container {
  flex: 1;
  height: 24px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.wuxing-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
  min-width: 4px;
}

.wuxing-bar-fill.wuxing-wood {
  background: var(--success-color);
}
.wuxing-bar-fill.wuxing-fire {
  background: var(--danger-color);
}
.wuxing-bar-fill.wuxing-earth {
  background: var(--warning-color);
}
.wuxing-bar-fill.wuxing-metal {
  background: #94a3b8;
}
.wuxing-bar-fill.wuxing-water {
  background: var(--accent-color);
}

.wuxing-value {
  width: 32px;
  text-align: right;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.85rem;
}

.favorable-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.favorable-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
}

.favorable-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  padding: 4px 0;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.favorable-label.favorable {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success-color);
}

.favorable-label.unfavorable {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger-color);
}

.favorable-content {
  color: var(--text-primary);
  font-weight: 500;
}

/* Empty State */
.personality-empty {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 48px 24px;
  box-shadow: var(--card-shadow);
  text-align: center;
  margin-bottom: 24px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  color: var(--text-secondary);
  margin: 0 0 20px 0;
  font-size: 1rem;
}

.empty-action {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.empty-action:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .personality-header {
    flex-direction: column;
    text-align: center;
  }

  .personality-avatar {
    width: 64px;
    height: 64px;
    font-size: 32px;
  }
}
</style>
