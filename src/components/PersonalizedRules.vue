<template>
  <BaseCard class="personal-lab" elevated>
    <template #header>
      <h3 class="card-title">个性化实验室</h3>
      <p class="card-subtitle">标记你的实际经验，让推荐更懂你</p>
    </template>

    <!-- 规则列表 -->
    <div v-if="rules.length > 0" class="rules-list">
      <div
        v-for="(rule, index) in rules"
        :key="index"
        class="rule-item"
        :class="{ active: rule.impact > 0 }"
      >
        <div class="rule-content">
          <span class="rule-icon" :class="rule.type">
            <AppIcon :name="getRuleIconName(rule.type)" size="sm" />
          </span>
          <span class="rule-text">{{ rule.description }}</span>
        </div>
        <div class="rule-meta">
          <span class="rule-count" v-if="rule.count > 1">已记录 {{ rule.count }} 次</span>
          <button class="rule-delete" @click="removeRule(index)">
            <AppIcon name="close" size="sm" />
          </button>
        </div>
      </div>
    </div>

    <!-- 添加规则表单 -->
    <div class="add-rule-section">
      <div class="form-row">
        <select v-model="newRule.type" class="input select">
          <option value="preference">我发现...</option>
          <option value="avoidance">我避免...</option>
          <option value="observation">我注意到...</option>
        </select>
      </div>

      <div class="form-row">
        <textarea
          v-model="newRule.description"
          class="input"
          placeholder="例如：上午做创意工作总是效率很高"
          rows="2"
        ></textarea>
      </div>

      <div class="form-row context-row">
        <select v-model="newRule.context" class="input select">
          <option value="">选择适用场景</option>
          <option value="morning">上午时段</option>
          <option value="afternoon">下午时段</option>
          <option value="evening">晚间时段</option>
          <option value="night">深夜时段</option>
          <option value="workday">工作日</option>
          <option value="weekend">周末</option>
          <option value="always">所有时段</option>
        </select>

        <select v-model="newRule.activity" class="input select">
          <option value="">选择活动类型（可选）</option>
          <option value="work">专注工作</option>
          <option value="meeting">开会沟通</option>
          <option value="study">学习充电</option>
          <option value="sign">签约合作</option>
          <option value="money">投资理财</option>
          <option value="social">社交聚会</option>
          <option value="exercise">运动健身</option>
          <option value="create">创意创作</option>
          <option value="decision">重要决策</option>
          <option value="rest">休息静养</option>
        </select>
      </div>

      <button class="btn btn-primary btn-full" @click="addRule" :disabled="!canAddRule">
        <AppIcon name="plus" size="sm" />
        添加观察记录
      </button>
    </div>

    <!-- 权重调整 -->
    <div class="weight-section">
      <div class="weight-header">
        <span class="weight-label">推荐权重调整</span>
        <span class="weight-value">{{ weightLabel }}</span>
      </div>

      <div class="weight-slider-container">
        <span class="weight-end-label">八字推荐</span>
        <input
          type="range"
          v-model.number="personalizationWeight"
          class="weight-slider"
          min="0"
          max="100"
          step="10"
        />
        <span class="weight-end-label">我的习惯</span>
      </div>

      <p class="weight-hint">{{ weightHint }}</p>
    </div>

    <!-- 影响预览 -->
    <div v-if="rules.length > 0" class="impact-preview">
      <div class="impact-title">当前影响</div>
      <div class="impact-stats">
        <div class="stat-item">
          <span class="stat-number">{{ rules.length }}</span>
          <span class="stat-label">条观察记录</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ activeRulesCount }}</span>
          <span class="stat-label">条已生效</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ personalizationWeight }}%</span>
          <span class="stat-label">个人习惯权重</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="rules.length === 0" class="lab-empty">
      <div class="empty-icon">
        <AppIcon name="notes" size="xl" />
      </div>
      <p class="empty-text">记录你的实际工作习惯，系统会逐渐学习并优化推荐</p>
      <p class="empty-hint">例如："我发现周三下午总是效率很低"</p>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import BaseCard from '@/components/common/BaseCard.vue'
import AppIcon from '@/components/icons/AppIcon.vue'

const userStore = useUserStore()

const rules = computed({
  get: () => userStore.profile.personalRules || [],
  set: (value) => userStore.updateProfile({ personalRules: value })
})

const personalizationWeight = computed({
  get: () => userStore.profile.personalizationWeight ?? 30,
  set: (value) => userStore.updateProfile({ personalizationWeight: value })
})

const newRule = ref({
  type: 'preference',
  description: '',
  context: '',
  activity: '',
  impact: 10,
  count: 1,
  createdAt: null
})

const canAddRule = computed(() => {
  return newRule.value.description.trim().length >= 5 && newRule.value.context !== ''
})

const weightLabel = computed(() => {
  if (personalizationWeight.value <= 20) return '以八字为主'
  if (personalizationWeight.value <= 40) return '八字偏重'
  if (personalizationWeight.value <= 60) return '平衡模式'
  if (personalizationWeight.value <= 80) return '习惯偏重'
  return '以习惯为主'
})

const weightHint = computed(() => {
  if (personalizationWeight.value <= 20) {
    return '系统主要依据八字五行推荐，你的个人观察影响较小'
  } else if (personalizationWeight.value <= 40) {
    return '八字推荐占主导，你的观察记录会适度调整推荐结果'
  } else if (personalizationWeight.value <= 60) {
    return '八字和个人习惯各占一半，系统会平衡两者'
  } else if (personalizationWeight.value <= 80) {
    return '你的观察记录占主导，八字作为辅助参考'
  } else {
    return '系统主要依据你的观察记录推荐，八字影响较小'
  }
})

const activeRulesCount = computed(() => {
  return rules.value.filter((r) => r.count >= 3 || r.impact >= 15).length
})

function getRuleIconName(type) {
  const icons = {
    preference: 'check',
    avoidance: 'close',
    observation: 'eye'
  }
  return icons[type] || 'circle'
}

function addRule() {
  if (!canAddRule.value) return

  const existingIndex = rules.value.findIndex(
    (r) =>
      r.description === newRule.value.description.trim() &&
      r.context === newRule.value.context &&
      r.activity === newRule.value.activity
  )

  if (existingIndex >= 0) {
    const updatedRules = [...rules.value]
    updatedRules[existingIndex] = {
      ...updatedRules[existingIndex],
      count: updatedRules[existingIndex].count + 1,
      impact: Math.min(25, updatedRules[existingIndex].impact + 5)
    }
    rules.value = updatedRules
  } else {
    const rule = {
      id: Date.now(),
      type: newRule.value.type,
      description: newRule.value.description.trim(),
      context: newRule.value.context,
      activity: newRule.value.activity,
      impact: 10,
      count: 1,
      createdAt: new Date().toISOString()
    }
    rules.value = [...rules.value, rule]
  }

  newRule.value = {
    type: 'preference',
    description: '',
    context: '',
    activity: '',
    impact: 10,
    count: 1,
    createdAt: null
  }
}

function removeRule(index) {
  const updatedRules = [...rules.value]
  updatedRules.splice(index, 1)
  rules.value = updatedRules
}
</script>

<style scoped>
.personal-lab {
  margin-bottom: var(--space-6);
}

.card-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: var(--space-1) 0 0;
}

/* Rules List */
.rules-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: var(--space-5) 0;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--text-tertiary);
  transition: all var(--transition-fast);
}

.rule-item.active {
  border-left-color: var(--wood);
  background: rgba(74, 222, 128, 0.05);
}

.rule-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
}

.rule-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 50%;
  flex-shrink: 0;
}

.rule-icon.preference {
  color: var(--wood);
}

.rule-icon.avoidance {
  color: var(--fire);
}

.rule-icon.observation {
  color: var(--water);
}

.rule-text {
  color: var(--text-primary);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.rule-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.rule-count {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  background: var(--bg-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
}

.rule-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: var(--radius-sm);
}

.rule-delete:hover {
  color: var(--fire);
  background: rgba(248, 113, 113, 0.1);
}

/* Add Rule Form */
.add-rule-section {
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-5);
}

.form-row {
  margin-bottom: var(--space-3);
}

.form-row:last-child {
  margin-bottom: 0;
}

.context-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

@media (max-width: 480px) {
  .context-row {
    grid-template-columns: 1fr;
  }
}

.btn-full {
  width: 100%;
}

/* Weight Section */
.weight-section {
  background: rgba(96, 165, 250, 0.05);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.weight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.weight-label {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.weight-value {
  background: var(--water);
  color: var(--ink-black);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
}

.weight-slider-container {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.weight-end-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  white-space: nowrap;
}

.weight-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  outline: none;
}

.weight-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--water);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
}

.weight-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.weight-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--water);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: var(--shadow-sm);
}

.weight-hint {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

/* Impact Preview */
.impact-preview {
  margin-top: var(--space-5);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-subtle);
}

.impact-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.impact-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.stat-item {
  text-align: center;
  padding: var(--space-3);
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
}

.stat-number {
  display: block;
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--water);
  margin-bottom: var(--space-1);
  font-family: var(--font-display);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

/* Empty State */
.lab-empty {
  text-align: center;
  padding: var(--space-10) var(--space-5);
}

.empty-icon {
  color: var(--text-tertiary);
  margin-bottom: var(--space-4);
}

.empty-text {
  color: var(--text-secondary);
  margin: 0 0 var(--space-3) 0;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.empty-hint {
  color: var(--text-tertiary);
  margin: 0;
  font-size: var(--text-xs);
  font-style: italic;
}

@media (max-width: 480px) {
  .impact-stats {
    grid-template-columns: 1fr;
  }

  .rule-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .rule-meta {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
