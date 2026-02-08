<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useEnergyStore } from '@/stores/energy'
import AppIcon from '@/components/icons/AppIcon.vue'

const userStore = useUserStore()
const energyStore = useEnergyStore()

const newActivityLabel = ref('')
const errorMessage = ref('')

const customActivities = computed(() => {
  return userStore.profile.customActivities || []
})

const defaultActivities = computed(() => {
  const library = energyStore.actionLibrary
  const customIds = customActivities.value.map((a) => a.id)
  return library.filter((a) => !customIds.includes(a.id))
})

function handleAdd() {
  if (!newActivityLabel.value.trim()) {
    errorMessage.value = '请输入活动名称'
    return
  }

  const label = newActivityLabel.value.trim()

  const exists = energyStore.actionLibrary.some((a) => a.label === label)
  if (exists) {
    errorMessage.value = '该活动已存在'
    return
  }

  const id = 'custom_' + Date.now()
  userStore.addCustomActivity({ id, label })
  newActivityLabel.value = ''
  errorMessage.value = ''
}

function handleDelete(id) {
  if (confirm('确定要删除这个自定义活动吗？')) {
    userStore.removeCustomActivity(id)
  }
}
</script>

<template>
  <div class="activity-manager-overlay" @click.self="$emit('close')">
    <div class="activity-manager-modal">
      <div class="modal-header">
        <h3>管理活动库</h3>
        <button class="close-btn" @click="$emit('close')">
          <AppIcon name="close" size="md" />
        </button>
      </div>

      <div class="modal-body">
        <!-- Add New Section -->
        <div class="add-section">
          <h4>添加自定义活动</h4>
          <div class="input-group">
            <input
              v-model="newActivityLabel"
              type="text"
              placeholder="例如：写代码、弹吉他..."
              @keyup.enter="handleAdd"
            />
            <button class="add-btn" @click="handleAdd">
              <AppIcon name="plus" size="sm" />
              添加
            </button>
          </div>
          <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
        </div>

        <!-- Custom Activities List -->
        <div class="list-section">
          <h4>自定义活动</h4>
          <div v-if="customActivities.length === 0" class="empty-state">暂无自定义活动</div>
          <ul v-else class="activity-list">
            <li v-for="activity in customActivities" :key="activity.id" class="activity-item">
              <span class="activity-label">{{ activity.label }}</span>
              <button class="delete-btn" @click="handleDelete(activity.id)">
                <AppIcon name="close" size="sm" />
              </button>
            </li>
          </ul>
        </div>

        <!-- Default Activities List (Read-only) -->
        <div class="list-section">
          <h4>默认活动</h4>
          <ul class="activity-list default-list">
            <li v-for="activity in defaultActivities" :key="activity.id" class="activity-item">
              <span class="activity-label">{{ activity.label }}</span>
              <span class="tag">系统</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-manager-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.activity-manager-modal {
  background: var(--bg-secondary);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}

.modal-header {
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  color: var(--text-primary);
  font-family: var(--font-display);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-1);
  line-height: 1;
  transition: color var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--fire);
}

.modal-body {
  padding: var(--space-5);
  overflow-y: auto;
}

.add-section {
  margin-bottom: var(--space-6);
}

.add-section h4,
.list-section h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-group {
  display: flex;
  gap: var(--space-2);
}

.input-group input {
  flex: 1;
  padding: var(--space-3);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: border-color var(--transition-fast);
}

.input-group input:focus {
  outline: none;
  border-color: var(--water);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--water);
  color: var(--ink-black);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: var(--font-semibold);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.add-btn:hover {
  background: var(--water-dim);
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow);
}

.error-msg {
  color: var(--fire);
  font-size: var(--text-sm);
  margin: var(--space-2) 0 0 0;
}

.list-section {
  margin-bottom: var(--space-5);
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  transition: background var(--transition-fast);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background: var(--bg-elevated);
}

.activity-label {
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(248, 113, 113, 0.1);
  color: var(--fire);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.delete-btn:hover {
  background: rgba(248, 113, 113, 0.2);
  transform: scale(1.05);
}

.tag {
  font-size: var(--text-xs);
  background: var(--bg-elevated);
  color: var(--text-tertiary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.empty-state {
  text-align: center;
  color: var(--text-tertiary);
  padding: var(--space-6);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

@media (max-width: 480px) {
  .input-group {
    flex-direction: column;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
