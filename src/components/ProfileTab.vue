<template>
  <div class="profile-tab">
    <!-- 第1层：Hero 区域 - 人格画像 + 能量时钟 -->
    <BaseCard v-if="hasBirthInfo" class="profile-hero" elevated>
      <div class="hero-content">
        <div class="hero-main">
          <div class="hero-avatar" :class="`wuxing-${dominantElement}`">
            <ElementIcon :element="dominantElement" size="xl" />
          </div>
          <div class="hero-info">
            <h2 class="hero-title">{{ personalityName }}</h2>
            <p class="hero-description">{{ personalityDescription }}</p>
            <div class="hero-tags">
              <span v-for="tag in personalityTags.slice(0, 3)" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-label">主导五行</span>
            <span class="stat-value" :class="`text-${dominantElement}`">{{
              getWuxingName(dominantElement)
            }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最佳时段</span>
            <span class="stat-value">{{ bestTimeOfDay }}</span>
          </div>
        </div>
      </div>
      <button class="btn btn-secondary btn-edit" @click="showEditModal = true">
        <AppIcon name="settings" size="sm" />
        编辑信息
      </button>
    </BaseCard>

    <!-- 第2层：出生信息 + 八字展示 -->
    <BirthInfoDisplay v-if="hasBirthInfo" class="profile-section" @edit="showEditModal = true" />

    <!-- 未填写时显示表单 -->
    <BaseCard v-else class="profile-section" elevated>
      <template #header>
        <h3 class="card-title">完善出生信息</h3>
        <p class="card-subtitle">输入出生信息，获取个性化运势指引</p>
      </template>
      <BirthInfoForm @success="onBirthInfoSaved" />
    </BaseCard>

    <!-- 第3层：个性化实验室 -->
    <PersonalizedRules v-if="hasBirthInfo" class="profile-section" />

    <!-- 第4层：设置区 - 2x2 紧凑网格 -->
    <div class="settings-grid">
      <BaseCard class="setting-item" elevated>
        <div class="setting-icon">
          <AppIcon name="bell" size="lg" />
        </div>
        <div class="setting-content">
          <h4 class="setting-title">智能提醒</h4>
          <p class="setting-desc">吉时提醒与冲煞预警</p>
          <label class="toggle" v-if="isSupported">
            <input type="checkbox" v-model="isNotificationEnabled" />
            <span class="toggle-slider"></span>
          </label>
          <span v-else class="setting-warning">不支持</span>
        </div>
      </BaseCard>

      <BaseCard class="setting-item" elevated>
        <div class="setting-icon">
          <AppIcon name="database" size="lg" />
        </div>
        <div class="setting-content">
          <h4 class="setting-title">数据管理</h4>
          <p class="setting-desc">导出或导入个人数据</p>
          <div class="setting-actions">
            <button class="btn btn-secondary btn-sm" @click="handleExport">导出</button>
            <button class="btn btn-secondary btn-sm" @click="triggerImport">导入</button>
          </div>
          <input type="file" ref="fileInput" accept=".json" class="hidden" @change="handleImport" />
        </div>
      </BaseCard>

      <BaseCard class="setting-item" elevated>
        <div class="setting-icon privacy">
          <AppIcon name="shield" size="lg" />
        </div>
        <div class="setting-content">
          <h4 class="setting-title">隐私保护</h4>
          <p class="setting-desc">数据仅存储在本地</p>
        </div>
      </BaseCard>

      <BaseCard class="setting-item" elevated>
        <div class="setting-icon info">
          <AppIcon name="info" size="lg" />
        </div>
        <div class="setting-content">
          <h4 class="setting-title">关于</h4>
          <p class="setting-desc">时机 v1.0.0</p>
        </div>
      </BaseCard>
    </div>

    <!-- 编辑模态框 -->
    <Teleport to="body">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>编辑个人信息</h3>
            <button class="btn btn-ghost" @click="showEditModal = false">
              <AppIcon name="close" size="md" />
            </button>
          </div>
          <BirthInfoForm :initial-data="profile" @success="onEditSuccess" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useNotifications } from '@/composables/useNotifications'
import { useToast } from 'vue-toastification'
import { usePersonality } from '@/composables/usePersonality'
import BaseCard from '@/components/common/BaseCard.vue'
import ElementIcon from '@/components/icons/ElementIcon.vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import BirthInfoDisplay from '@/components/BirthInfoDisplay.vue'
import BirthInfoForm from '@/components/BirthInfoForm.vue'
import PersonalizedRules from '@/components/PersonalizedRules.vue'

const userStore = useUserStore()
const { requestPermission, isSupported } = useNotifications()
const toast = useToast()
const fileInput = ref(null)
const showEditModal = ref(false)

const {
  hasBirthInfo,
  dominantElement,
  personalityName,
  personalityDescription,
  personalityTags,
  bestTimeOfDay
} = usePersonality()

function getWuxingName(key) {
  const map = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' }
  return map[key] || key
}

const profile = computed(() => userStore.profile)

const isNotificationEnabled = computed({
  get: () => userStore.profile.enableNotifications,
  set: async (value) => {
    if (value) {
      const result = await requestPermission()
      if (result === 'granted') {
        userStore.updateProfile({ enableNotifications: true })
        toast.success('已开启智能提醒')
      } else {
        userStore.updateProfile({ enableNotifications: false })
        toast.error('无法开启提醒，请检查浏览器权限')
      }
    } else {
      userStore.updateProfile({ enableNotifications: false })
    }
  }
})

function onBirthInfoSaved() {
  toast.success('出生信息已保存')
}

function onEditSuccess() {
  showEditModal.value = false
  toast.success('个人信息已更新')
}

function handleExport() {
  const data = userStore.exportData()
  if (!data) {
    toast.error('导出数据失败')
    return
  }

  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `shiji_data_${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  toast.success('数据已导出')
}

function triggerImport() {
  fileInput.value.click()
}

function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    const result = userStore.importData(content)

    if (result.success) {
      toast.success('数据导入成功')
    } else {
      toast.error('导入失败: ' + result.error)
    }
    event.target.value = ''
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.profile-tab {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.profile-section {
  margin-bottom: var(--space-6);
}

/* Hero Section */
.profile-hero {
  position: relative;
  overflow: visible;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: var(--space-6);
  align-items: start;
}

.hero-main {
  display: flex;
  gap: var(--space-5);
}

.hero-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 4px solid var(--border-light);
  flex-shrink: 0;
}

.hero-avatar.wuxing-wood {
  background: rgba(74, 222, 128, 0.1);
  border-color: var(--wood);
}

.hero-avatar.wuxing-fire {
  background: rgba(248, 113, 113, 0.1);
  border-color: var(--fire);
}

.hero-avatar.wuxing-earth {
  background: rgba(251, 191, 36, 0.1);
  border-color: var(--earth);
}

.hero-avatar.wuxing-metal {
  background: rgba(232, 196, 102, 0.15);
  border-color: var(--metal);
}

.hero-avatar.wuxing-water {
  background: rgba(96, 165, 250, 0.1);
  border-color: var(--water);
}

.hero-info {
  flex: 1;
}

.hero-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2);
}

.hero-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-3);
}

.hero-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.hero-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 200px;
  padding: var(--space-4);
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.text-wood {
  color: var(--wood);
}
.text-fire {
  color: var(--fire);
}
.text-earth {
  color: var(--earth);
}
.text-metal {
  color: var(--metal);
}
.text-water {
  color: var(--water);
}

.btn-edit {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
}

/* Settings Grid */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

.setting-item {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.setting-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(96, 165, 250, 0.1);
  color: var(--water);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);
}

.setting-icon.privacy {
  background: rgba(74, 222, 128, 0.1);
  color: var(--wood);
}

.setting-icon.info {
  background: rgba(148, 163, 184, 0.15);
  color: var(--text-secondary);
}

.setting-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}

.setting-desc {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin: 0 0 var(--space-3);
}

.setting-actions {
  display: flex;
  gap: var(--space-2);
}

.setting-warning {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-elevated);
  transition: var(--transition-base);
  border-radius: var(--radius-full);
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: var(--text-primary);
  transition: var(--transition-base);
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: var(--wood);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* Modal */
.modal-overlay {
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

.modal-content {
  background: var(--bg-secondary);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
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
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.hidden {
  display: none;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    flex-direction: row;
    justify-content: space-around;
    min-width: 100%;
  }

  .btn-edit {
    position: static;
    margin-top: var(--space-4);
    width: 100%;
  }
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero-main {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
