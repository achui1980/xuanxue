<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useEnergyStore } from '@/stores/energy'

const emit = defineEmits(['close'])

const userStore = useUserStore()
const energyStore = useEnergyStore()

const newActivityLabel = ref('')
const errorMessage = ref('')

const customActivities = computed(() => {
  return userStore.profile.customActivities || []
})

const defaultActivities = computed(() => {
  // Filter out custom ones from the full library to show what's default
  const library = energyStore.actionLibrary
  const customIds = customActivities.value.map(a => a.id)
  return library.filter(a => !customIds.includes(a.id))
})

function handleAdd() {
  if (!newActivityLabel.value.trim()) {
    errorMessage.value = '请输入活动名称'
    return
  }
  
  const label = newActivityLabel.value.trim()
  
  // Check for duplicates in full library
  const exists = energyStore.actionLibrary.some(a => a.label === label)
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
        <button class="close-btn" @click="$emit('close')">×</button>
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
            <button class="add-btn" @click="handleAdd">添加</button>
          </div>
          <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
        </div>

        <!-- Custom Activities List -->
        <div class="list-section">
          <h4>自定义活动</h4>
          <div v-if="customActivities.length === 0" class="empty-state">
            暂无自定义活动
          </div>
          <ul v-else class="activity-list">
            <li v-for="activity in customActivities" :key="activity.id" class="activity-item">
              <span class="activity-label">{{ activity.label }}</span>
              <button class="delete-btn" @click="handleDelete(activity.id)">删除</button>
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.activity-manager-modal {
  background: white;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.add-section {
  margin-bottom: 24px;
}

.add-section h4, .list-section h4 {
  margin: 0 0 12px 0;
  font-size: 0.95rem;
  color: #475569;
}

.input-group {
  display: flex;
  gap: 8px;
}

.input-group input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
}

.input-group input:focus {
  outline: none;
  border-color: #3b82f6;
}

.add-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.add-btn:hover {
  background: #2563eb;
}

.error-msg {
  color: #ef4444;
  font-size: 0.85rem;
  margin: 6px 0 0 0;
}

.list-section {
  margin-bottom: 20px;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #e2e8f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-label {
  color: #334155;
}

.delete-btn {
  padding: 4px 8px;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.delete-btn:hover {
  background: #fecaca;
}

.tag {
  font-size: 0.75rem;
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 6px;
  border-radius: 4px;
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 0.9rem;
}
</style>