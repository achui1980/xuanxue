<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useEnergyStore } from '@/stores/energy'

const userStore = useUserStore()
const energyStore = useEnergyStore()

const newGoalText = ref('')
const recommendedGoalId = ref(null)

const goals = computed(() => userStore.profile.goals || [])
const hasGoals = computed(() => goals.value.length > 0)

// 推荐结果
const recommendation = ref(null)

function handleAddGoal() {
  const text = newGoalText.value.trim()
  if (text) {
    userStore.addGoal(text)
    newGoalText.value = ''
  }
}

function handleRemoveGoal(id) {
  userStore.removeGoal(id)
  if (recommendedGoalId.value === id) {
    recommendation.value = null
    recommendedGoalId.value = null
  }
}

function handleToggleGoal(id) {
  userStore.toggleGoal(id)
}

function getRecommendation(goal) {
  if (recommendedGoalId.value === goal.id) {
    // Toggle off
    recommendation.value = null
    recommendedGoalId.value = null
    return
  }
  
  const bestTimes = energyStore.getBestHoursForGoal(goal.text)
  recommendation.value = {
    goalId: goal.id,
    times: bestTimes
  }
  recommendedGoalId.value = goal.id
}
</script>

<template>
  <div class="goal-manager card">
    <div class="card-header">
      <h3>今日目标</h3>
      <span class="badge" v-if="hasGoals">{{ goals.filter(g => g.completed).length }}/{{ goals.length }}</span>
    </div>

    <div class="add-goal-form">
      <input 
        v-model="newGoalText" 
        @keyup.enter="handleAddGoal"
        type="text" 
        placeholder="添加新目标..." 
        class="goal-input"
      />
      <button @click="handleAddGoal" class="add-btn" :disabled="!newGoalText.trim()">
        +
      </button>
    </div>

    <div class="goals-list" v-if="hasGoals">
      <div 
        v-for="goal in goals" 
        :key="goal.id" 
        class="goal-item"
        :class="{ completed: goal.completed }"
      >
        <div class="goal-content">
          <label class="checkbox-wrapper">
            <input 
              type="checkbox" 
              :checked="goal.completed" 
              @change="handleToggleGoal(goal.id)"
            />
            <span class="checkmark"></span>
          </label>
          <span class="goal-text">{{ goal.text }}</span>
        </div>
        
        <div class="goal-actions">
          <button 
            class="recommend-btn" 
            :class="{ active: recommendedGoalId === goal.id }"
            @click="getRecommendation(goal)"
            title="查看最佳时机"
          >
            ⚡️
          </button>
          <button class="delete-btn" @click="handleRemoveGoal(goal.id)" title="删除">
            ×
          </button>
        </div>

        <!-- Inline Recommendation -->
        <div v-if="recommendedGoalId === goal.id && recommendation" class="recommendation-panel">
          <div class="rec-title">最佳时机:</div>
          <div class="rec-times">
            <div v-for="time in recommendation.times" :key="time.hour" class="rec-time-chip">
              <span class="time-range">{{ time.rangeLabel.split('-')[0] }}</span>
              <span class="time-score">{{ time.score }}分</span>
            </div>
            <div v-if="recommendation.times.length === 0" class="no-rec">
              暂无特别推荐时段，建议选择高能量时段。
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <p>暂无目标，开始规划您的一天吧。</p>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--header-text);
}

.badge {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
}

.add-goal-form {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.goal-input {
  flex: 1;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.goal-input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.add-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  width: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.goal-item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: 8px;
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: all 0.2s;
}

.goal-item:hover {
  background: var(--bg-hover);
}

.goal-item.completed .goal-text {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.goal-content {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 10px;
  min-height: 28px;
}

.goal-text {
  font-size: 0.95rem;
  word-break: break-all;
}

.goal-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.recommend-btn, .delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.recommend-btn:hover {
  color: #fbbf24; /* Amber-400 */
  background: rgba(251, 191, 36, 0.1);
}

.recommend-btn.active {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}

.delete-btn:hover {
  color: #ef4444; /* Red-500 */
  background: rgba(239, 68, 68, 0.1);
}

/* Custom Checkbox */
.checkbox-wrapper {
  display: block;
  position: relative;
  padding-left: 20px;
  cursor: pointer;
  font-size: 22px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.checkbox-wrapper input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.checkbox-wrapper:hover input ~ .checkmark {
  border-color: var(--accent-color);
}

.checkbox-wrapper input:checked ~ .checkmark {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-wrapper input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-wrapper .checkmark:after {
  left: 6px;
  top: 2px;
  width: 4px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding: 20px 0;
}

/* Recommendation Panel */
.recommendation-panel {
  width: 100%;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-color);
  animation: slideDown 0.2s ease-out;
}

.rec-title {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.rec-times {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.rec-time-chip {
  background: rgba(251, 191, 36, 0.15); /* Amber with opacity */
  border: 1px solid rgba(251, 191, 36, 0.3);
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-range {
  font-weight: 600;
  color: var(--header-text);
  font-size: 0.9rem;
}

.time-score {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>