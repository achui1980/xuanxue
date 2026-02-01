<template>
  <div class="personal-lab">
    <div class="lab-header">
      <h3 class="lab-title">个性化实验室</h3>
      <p class="lab-subtitle">标记你的实际经验，让推荐更懂你</p>
    </div>

    <!-- 规则列表 -->
    <div v-if="rules.length > 0" class="rules-list">
      <div
        v-for="(rule, index) in rules"
        :key="index"
        class="rule-item"
        :class="{ active: rule.impact > 0 }"
      >
        <div class="rule-content">
          <span class="rule-icon">{{ getRuleIcon(rule.type) }}</span>
          <span class="rule-text">{{ rule.description }}</span>
        </div>
        <div class="rule-meta">
          <span class="rule-count" v-if="rule.count > 1">已记录 {{ rule.count }} 次</span>
          <button class="rule-delete" @click="removeRule(index)">×</button>
        </div>
      </div>
    </div>

    <!-- 添加规则表单 -->
    <div class="add-rule-section">
      <div class="form-row">
        <select v-model="newRule.type" class="rule-type-select">
          <option value="preference">我发现...</option>
          <option value="avoidance">我避免...</option>
          <option value="observation">我注意到...</option>
        </select>
      </div>

      <div class="form-row">
        <textarea
          v-model="newRule.description"
          class="rule-input"
          placeholder="例如：上午做创意工作总是效率很高"
          rows="2"
        ></textarea>
      </div>

      <div class="form-row context-row">
        <select v-model="newRule.context" class="context-select">
          <option value="">选择适用场景</option>
          <option value="morning">上午时段</option>
          <option value="afternoon">下午时段</option>
          <option value="evening">晚间时段</option>
          <option value="night">深夜时段</option>
          <option value="workday">工作日</option>
          <option value="weekend">周末</option>
          <option value="always">所有时段</option>
        </select>

        <select v-model="newRule.activity" class="activity-select">
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

      <button class="add-rule-btn" @click="addRule" :disabled="!canAddRule">添加观察记录</button>
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

      <p class="weight-hint">
        {{ weightHint }}
      </p>
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
      <div class="empty-icon">📝</div>
      <p class="empty-text">记录你的实际工作习惯，系统会逐渐学习并优化推荐</p>
      <p class="empty-hint">例如："我发现周三下午总是效率很低"</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 从 store 获取现有规则
const rules = computed({
  get: () => userStore.profile.personalRules || [],
  set: (value) => userStore.updateProfile({ personalRules: value })
})

// 个性化权重（0-100，0=完全用八字，100=完全用个人习惯）
const personalizationWeight = computed({
  get: () => userStore.profile.personalizationWeight ?? 30,
  set: (value) => userStore.updateProfile({ personalizationWeight: value })
})

// 新规则表单
const newRule = ref({
  type: 'preference',
  description: '',
  context: '',
  activity: '',
  impact: 10,
  count: 1,
  createdAt: null
})

// 是否可以添加
const canAddRule = computed(() => {
  return newRule.value.description.trim().length >= 5 && newRule.value.context !== ''
})

// 权重标签
const weightLabel = computed(() => {
  if (personalizationWeight.value <= 20) return '以八字为主'
  if (personalizationWeight.value <= 40) return '八字偏重'
  if (personalizationWeight.value <= 60) return '平衡模式'
  if (personalizationWeight.value <= 80) return '习惯偏重'
  return '以习惯为主'
})

// 权重提示
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

// 生效规则数
const activeRulesCount = computed(() => {
  return rules.value.filter((r) => r.count >= 3 || r.impact >= 15).length
})

// 获取规则图标
function getRuleIcon(type) {
  const icons = {
    preference: '✓',
    avoidance: '✕',
    observation: '👁'
  }
  return icons[type] || '•'
}

// 添加规则
function addRule() {
  if (!canAddRule.value) return

  const existingIndex = rules.value.findIndex(
    (r) =>
      r.description === newRule.value.description.trim() &&
      r.context === newRule.value.context &&
      r.activity === newRule.value.activity
  )

  if (existingIndex >= 0) {
    // 已有相同规则，增加计数
    const updatedRules = [...rules.value]
    updatedRules[existingIndex] = {
      ...updatedRules[existingIndex],
      count: updatedRules[existingIndex].count + 1,
      impact: Math.min(25, updatedRules[existingIndex].impact + 5)
    }
    rules.value = updatedRules
  } else {
    // 添加新规则
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

  // 重置表单
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

// 删除规则
function removeRule(index) {
  const updatedRules = [...rules.value]
  updatedRules.splice(index, 1)
  rules.value = updatedRules
}
</script>

<style scoped>
.personal-lab {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  margin-bottom: 24px;
}

.lab-header {
  margin-bottom: 20px;
}

.lab-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--header-text);
  margin: 0 0 8px 0;
}

.lab-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Rules List */
.rules-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: 10px;
  border-left: 3px solid var(--text-secondary);
  transition: all 0.2s;
}

.rule-item.active {
  border-left-color: var(--success-color);
  background: rgba(16, 185, 129, 0.05);
}

.rule-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.rule-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border-radius: 50%;
  font-size: 0.9rem;
}

.rule-text {
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.4;
}

.rule-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rule-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: var(--card-bg);
  padding: 2px 8px;
  border-radius: 10px;
}

.rule-delete {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s;
}

.rule-delete:hover {
  color: var(--danger-color);
}

/* Add Rule Form */
.add-rule-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.form-row {
  margin-bottom: 12px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.rule-type-select,
.context-select,
.activity-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
}

.rule-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.9rem;
  resize: vertical;
  font-family: inherit;
}

.rule-type-select:focus,
.rule-input:focus,
.context-select:focus,
.activity-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
}

.context-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.add-rule-btn {
  width: 100%;
  padding: 12px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-rule-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.add-rule-btn:disabled {
  background: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Weight Section */
.weight-section {
  background: rgba(var(--accent-rgb), 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(var(--accent-rgb), 0.2);
}

.weight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.weight-label {
  font-weight: 600;
  color: var(--header-text);
  font-size: 0.95rem;
}

.weight-value {
  background: var(--accent-color);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.weight-slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.weight-end-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.weight-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--bg-secondary);
  border-radius: 3px;
  outline: none;
}

.weight-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--accent-color);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s;
}

.weight-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.weight-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--accent-color);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.weight-hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Impact Preview */
.impact-preview {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.impact-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--header-text);
  margin-bottom: 12px;
}

.impact-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Empty State */
.lab-empty {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.empty-hint {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.85rem;
  font-style: italic;
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 480px) {
  .context-row {
    grid-template-columns: 1fr;
  }

  .impact-stats {
    grid-template-columns: 1fr;
  }

  .rule-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .rule-meta {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
