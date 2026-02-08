<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useEnergyStore } from '@/stores/energy'
import AppIcon from '@/components/icons/AppIcon.vue'

const userStore = useUserStore()
const energyStore = useEnergyStore()

const newGoalText = ref('')
const recommendedGoalId = ref(null)

const goals = computed(() => userStore.profile.goals || [])
const hasGoals = computed(() => goals.value.length > 0)
const completedCount = computed(() => goals.value.filter((g) => g.completed).length)

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
  <div class="goal-manager">
    <div class="goal-header">
      <h3 class="goal-title">
        <AppIcon name="star" size="sm" />
        今日目标
      </h3>
      <span v-if="hasGoals" class="goal-badge"> {{ completedCount }}/{{ goals.length }} </span>
    </div>

    <div class="add-goal-form">
      <input
        v-model="newGoalText"
        @keyup.enter="handleAddGoal"
        type="text"
        placeholder="添加新目标..."
        class="input goal-input"
      />
      <button
        @click="handleAddGoal"
        class="btn btn-primary add-btn"
        :disabled="!newGoalText.trim()"
      >
        <AppIcon name="plus" size="sm" />
      </button>
    </div>

    <div v-if="hasGoals" class="goals-list">
      <div
        v-for="goal in goals"
        :key="goal.id"
        class="goal-item"
        :class="{ completed: goal.completed }"
      >
        <div class="goal-content">
          <label class="checkbox-wrapper">
            <input type="checkbox" :checked="goal.completed" @change="handleToggleGoal(goal.id)" />
            <span class="checkmark"></span>
          </label>
          <span class="goal-text">{{ goal.text }}</span>
        </div>

        <div class="goal-actions">
          <button
            class="action-btn recommend-btn"
            :class="{ active: recommendedGoalId === goal.id }"
            @click="getRecommendation(goal)"
            title="查看最佳时机"
          >
            <AppIcon name="trend-up" size="sm" />
          </button>
          <button class="action-btn delete-btn" @click="handleRemoveGoal(goal.id)" title="删除">
            <AppIcon name="close" size="sm" />
          </button>
        </div>

        <!-- Inline Recommendation -->
        <Transition name="slide">
          <div v-if="recommendedGoalId === goal.id && recommendation" class="recommendation-panel">
            <div class="rec-title">推荐时辰</div>
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
        </Transition>
      </div>
    </div>

    <div v-else class="empty-state">
      <AppIcon name="star" size="lg" />
      <p>暂无目标，开始规划您的一天吧</p>
    </div>
  </div>
</template>

<style scoped>
.goal-manager {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  border: 1px solid var(--border-subtle);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.goal-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.goal-badge {
  background: var(--bg-elevated);
  color: var(--text-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.add-goal-form {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.goal-input {
  flex: 1;
}

.add-btn {
  padding: var(--space-2) var(--space-3);
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.goal-item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
  transition: all var(--transition-fast);
}

.goal-item:hover {
  background: var(--ink-medium);
}

.goal-item.completed .goal-text {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

.goal-content {
  display: flex;
  align-items: center;
  flex: 1;
  gap: var(--space-3);
  min-height: 24px;
}

.goal-text {
  font-size: var(--text-sm);
  color: var(--text-primary);
  word-break: break-all;
}

.goal-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.recommend-btn:hover {
  color: var(--earth);
  background: rgba(251, 191, 36, 0.1);
}

.recommend-btn.active {
  color: var(--earth);
  background: rgba(251, 191, 36, 0.15);
}

.delete-btn:hover {
  color: var(--fire);
  background: rgba(248, 113, 113, 0.1);
}

/* Custom Checkbox */
.checkbox-wrapper {
  display: block;
  position: relative;
  padding-left: 24px;
  cursor: pointer;
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
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.checkbox-wrapper:hover input ~ .checkmark {
  border-color: var(--metal);
}

.checkbox-wrapper input:checked ~ .checkmark {
  background-color: var(--wood);
  border-color: var(--wood);
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 4px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-wrapper input:checked ~ .checkmark:after {
  display: block;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6) 0;
  color: var(--text-tertiary);
  text-align: center;
}

.empty-state p {
  font-size: var(--text-sm);
  margin: 0;
}

/* Recommendation Panel */
.recommendation-panel {
  width: 100%;
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px dashed var(--border-light);
}

.rec-title {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.rec-times {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.rec-time-chip {
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.3);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.time-range {
  font-weight: var(--font-semibold);
  color: var(--earth);
  font-size: var(--text-sm);
}

.time-score {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.no-rec {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all var(--transition-base);
  max-height: 200px;
  opacity: 1;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  padding-top: 0;
}
</style>
