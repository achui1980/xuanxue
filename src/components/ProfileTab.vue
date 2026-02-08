<template>
  <div class="profile-tab">
    <!-- Header -->
    <div class="profile-header">
      <h2 class="profile-title">个人中心</h2>
      <p class="profile-subtitle">完善信息，获取个性化运势指引</p>
    </div>

    <!-- Bento Grid Layout -->
    <div class="profile-grid">
      <!-- Personality Card -->
      <PersonalityCard class="grid-span-2" />

      <!-- Energy Clock -->
      <EnergyClock />

      <!-- Birth Info Card -->
      <BaseCard class="birth-card grid-span-2" elevated>
        <template #header>
          <div class="card-header-row">
            <h3 class="card-title">出生信息</h3>
            <button class="btn btn-ghost btn-sm" @click="toggleBirthSection">
              <AppIcon :name="birthExpanded ? 'chevron-up' : 'chevron-down'" size="sm" />
            </button>
          </div>
        </template>

        <Transition name="collapse">
          <div v-show="birthExpanded">
            <!-- Birth Form -->
            <div v-if="!userStore.hasBirthInfo()" class="birth-form">
              <p class="form-intro">
                <AppIcon name="info" size="sm" />
                请输入出生信息，用于生成八字与五行分析
              </p>

              <div class="form-grid">
                <div class="form-field">
                  <label>出生年份</label>
                  <input
                    type="number"
                    v-model.number="birthForm.year"
                    class="input"
                    placeholder="例如: 1990"
                    min="1900"
                    max="2100"
                  />
                </div>

                <div class="form-field">
                  <label>出生月份</label>
                  <select v-model.number="birthForm.month" class="input select">
                    <option :value="null" disabled>选择</option>
                    <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
                  </select>
                </div>

                <div class="form-field">
                  <label>出生日期</label>
                  <select v-model.number="birthForm.day" class="input select">
                    <option :value="null" disabled>选择</option>
                    <option v-for="d in 31" :key="d" :value="d">{{ d }}日</option>
                  </select>
                </div>

                <div class="form-field">
                  <label>出生时辰</label>
                  <select v-model.number="birthForm.hour" class="input select">
                    <option :value="null" disabled>选择</option>
                    <option v-for="h in 24" :key="h - 1" :value="h - 1">
                      {{ h - 1 }}时 {{ getBranchForHour(h - 1) }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-actions">
                <button class="btn btn-primary" @click="handleCalculate" :disabled="!isFormValid">
                  <AppIcon name="check" size="sm" />
                  计算八字
                </button>
                <button class="btn btn-secondary" @click="goToToday">先看通用指引</button>
              </div>

              <Transition name="fade">
                <div v-if="errorMessage" class="error-alert">
                  <AppIcon name="warning" size="sm" />
                  {{ errorMessage }}
                </div>
              </Transition>
            </div>

            <!-- Birth Display -->
            <div v-else class="birth-display">
              <div class="birth-summary">
                <div class="summary-item">
                  <span class="summary-label">阳历</span>
                  <span class="summary-value">
                    {{ profile.birthYear }}年{{ profile.birthMonth }}月{{ profile.birthDay }}日
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">时辰</span>
                  <span class="summary-value">
                    {{ profile.birthHour }}时 ({{ getBranchForHour(profile.birthHour) }}时)
                  </span>
                </div>
              </div>

              <div class="bazi-display">
                <div class="bazi-pillar">
                  <span class="pillar-label">年柱</span>
                  <span class="pillar-value">{{ profile.bazi?.year?.full || '--' }}</span>
                </div>
                <div class="bazi-pillar">
                  <span class="pillar-label">月柱</span>
                  <span class="pillar-value">{{ profile.bazi?.month?.full || '--' }}</span>
                </div>
                <div class="bazi-pillar">
                  <span class="pillar-label">日柱</span>
                  <span class="pillar-value">{{ profile.bazi?.day?.full || '--' }}</span>
                </div>
                <div class="bazi-pillar">
                  <span class="pillar-label">时柱</span>
                  <span class="pillar-value">{{ profile.bazi?.hour?.full || '--' }}</span>
                </div>
              </div>

              <div class="action-row">
                <button class="btn btn-secondary" @click="handleClear">重新输入</button>
              </div>
            </div>
          </div>
        </Transition>
      </BaseCard>

      <!-- Advanced Info Card -->
      <BaseCard v-if="userStore.hasBirthInfo()" class="advanced-card grid-span-2" elevated>
        <template #header>
          <div class="card-header-row">
            <h3 class="card-title">详细分析</h3>
            <button class="btn btn-ghost btn-sm" @click="toggleAdvancedSection">
              <AppIcon :name="advancedExpanded ? 'chevron-up' : 'chevron-down'" size="sm" />
            </button>
          </div>
        </template>

        <Transition name="collapse">
          <div v-show="advancedExpanded" class="advanced-content">
            <!-- Day Master -->
            <div class="analysis-section">
              <div class="section-label">日主</div>
              <div class="day-master-badge">
                {{ profile.dayMaster || '未知' }}
              </div>
            </div>

            <!-- Five Elements -->
            <div class="analysis-section">
              <div class="section-label">五行强度</div>
              <div class="wuxing-grid">
                <div v-for="(value, key) in profile.wuxing" :key="key" class="wuxing-item">
                  <ElementIcon :element="key" size="sm" />
                  <span class="wuxing-name">{{ getWuxingName(key) }}</span>
                  <div class="wuxing-bar">
                    <div class="wuxing-progress" :style="{ width: `${value}%` }" />
                  </div>
                  <span class="wuxing-value">{{ value }}%</span>
                </div>
              </div>
            </div>

            <!-- Favorable -->
            <div class="analysis-section favorable-section">
              <div class="favorable-row">
                <span class="favorable-label good">喜用神</span>
                <span class="favorable-value">{{ profile.favorable?.join('、') || '未计算' }}</span>
              </div>
              <div class="favorable-row">
                <span class="favorable-label bad">忌神</span>
                <span class="favorable-value">{{
                  profile.unfavorable?.join('、') || '未计算'
                }}</span>
              </div>
            </div>
          </div>
        </Transition>
      </BaseCard>

      <!-- Personalized Rules -->
      <PersonalizedRules class="grid-span-2" />

      <!-- Settings Cards -->
      <BaseCard class="settings-card" title="智能提醒" elevated>
        <div v-if="!isSupported" class="warning-text">您的浏览器不支持通知功能</div>
        <div v-else class="setting-item">
          <div class="setting-info">
            <span class="setting-title">浏览器通知</span>
            <span class="setting-desc">吉时提醒与冲煞预警</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="isNotificationEnabled" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </BaseCard>

      <BaseCard class="settings-card" title="数据管理" elevated>
        <div class="data-actions">
          <button class="btn btn-secondary btn-sm" @click="handleExport">
            <AppIcon name="arrow-right" size="sm" />
            导出
          </button>
          <button class="btn btn-secondary btn-sm" @click="triggerImport">
            <AppIcon name="arrow-left" size="sm" />
            导入
          </button>
          <input type="file" ref="fileInput" accept=".json" class="hidden" @change="handleImport" />
        </div>
      </BaseCard>

      <!-- Privacy Note -->
      <div class="privacy-card grid-span-2">
        <div class="privacy-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div class="privacy-content">
          <span class="privacy-title">隐私保护</span>
          <span class="privacy-text">所有数据仅存储在浏览器本地，不会上传到服务器</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { useNotifications } from '@/composables/useNotifications'
import { useBeijingTime } from '@/composables/useBeijingTime'
import { useToast } from 'vue-toastification'
import BaseCard from '@/components/common/BaseCard.vue'
import ElementIcon from '@/components/icons/ElementIcon.vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import PersonalityCard from '@/components/PersonalityCard.vue'
import EnergyClock from '@/components/EnergyClock.vue'
import PersonalizedRules from '@/components/PersonalizedRules.vue'

const userStore = useUserStore()
const appStore = useAppStore()
const { requestPermission, isSupported } = useNotifications()
const { getBranchForHour } = useBeijingTime()
const toast = useToast()
const fileInput = ref(null)

const profile = computed(() => userStore.profile)

// Section states
const birthExpanded = ref(!userStore.hasBirthInfo())
const advancedExpanded = ref(false)

function toggleBirthSection() {
  birthExpanded.value = !birthExpanded.value
}

function toggleAdvancedSection() {
  advancedExpanded.value = !advancedExpanded.value
}

function goToToday() {
  appStore.setActiveTab('today')
}

// Notification toggle
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

// Birth form
const birthForm = ref({
  year: null,
  month: null,
  day: null,
  hour: null
})

const errorMessage = ref('')

const isFormValid = computed(() => {
  return (
    birthForm.value.year &&
    birthForm.value.month &&
    birthForm.value.day &&
    birthForm.value.hour !== null
  )
})

function handleCalculate() {
  errorMessage.value = ''

  if (!isFormValid.value) {
    errorMessage.value = '请填写完整的出生信息'
    return
  }

  const success = userStore.setBirthInfo(
    birthForm.value.year,
    birthForm.value.month,
    birthForm.value.day,
    birthForm.value.hour
  )

  if (success) {
    toast.success('八字计算成功')
    birthExpanded.value = false
  } else {
    errorMessage.value = '计算失败，请检查输入日期是否有效'
    toast.error('计算失败')
  }
}

function handleClear() {
  if (confirm('确定要清除出生信息吗？')) {
    userStore.clearBirthInfo()
    birthForm.value = { year: null, month: null, day: null, hour: null }
    birthExpanded.value = true
  }
}

function getWuxingName(key) {
  const map = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' }
  return map[key] || key
}

// Data export/import
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
      if (profile.value.birthYear) {
        birthForm.value = {
          year: profile.value.birthYear,
          month: profile.value.birthMonth,
          day: profile.value.birthDay,
          hour: profile.value.birthHour
        }
      }
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
}

.profile-header {
  margin-bottom: var(--space-6);
}

.profile-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2);
}

.profile-subtitle {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0;
}

/* Grid Layout */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

.grid-span-2 {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  .grid-span-2 {
    grid-column: span 1;
  }
}

/* Card Header */
.card-header-row {
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

/* Birth Form */
.form-intro {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: rgba(96, 165, 250, 0.1);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--water);
  margin-bottom: var(--space-5);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-field label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  gap: var(--space-3);
}

@media (max-width: 480px) {
  .form-actions {
    flex-direction: column;
  }
}

.error-alert {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding: var(--space-3);
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: var(--radius-md);
  color: var(--fire);
  font-size: var(--text-sm);
}

/* Birth Display */
.birth-display {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.birth-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
}

@media (max-width: 480px) {
  .birth-summary {
    grid-template-columns: 1fr;
  }
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.summary-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.bazi-display {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}

@media (max-width: 640px) {
  .bazi-display {
    grid-template-columns: repeat(2, 1fr);
  }
}

.bazi-pillar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
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

.action-row {
  display: flex;
  justify-content: flex-end;
}

/* Advanced Card */
.advanced-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  margin-top: var(--space-4);
}

.analysis-section {
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

.analysis-section:first-child {
  padding-top: 0;
  border-top: none;
}

.section-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-3);
}

.day-master-badge {
  display: inline-flex;
  padding: var(--space-3) var(--space-6);
  background: linear-gradient(135deg, var(--metal) 0%, var(--metal-dim) 100%);
  color: var(--ink-black);
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  border-radius: var(--radius-lg);
}

/* Five Elements Grid */
.wuxing-grid {
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

.wuxing-bar {
  height: 8px;
  background: var(--bg-elevated);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.wuxing-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--metal) 0%, var(--metal-dim) 100%);
  border-radius: var(--radius-full);
  transition: width 0.5s ease;
}

.wuxing-value {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  text-align: right;
}

/* Favorable Section */
.favorable-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.favorable-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.favorable-label {
  padding: var(--space-1) var(--space-3);
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

.favorable-value {
  font-size: var(--text-base);
  color: var(--text-primary);
}

/* Settings */
.settings-card .warning-text {
  padding: var(--space-3);
  background: rgba(248, 113, 113, 0.1);
  color: var(--fire);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  text-align: center;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.setting-title {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.setting-desc {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
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
  height: 20px;
  width: 20px;
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
  transform: translateX(22px);
}

/* Data Actions */
.data-actions {
  display: flex;
  gap: var(--space-2);
}

.hidden {
  display: none;
}

/* Privacy Card */
.privacy-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: var(--radius-lg);
}

.privacy-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(96, 165, 250, 0.2);
  border-radius: var(--radius-md);
  color: var(--water);
}

.privacy-icon svg {
  width: 24px;
  height: 24px;
}

.privacy-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.privacy-title {
  font-weight: var(--font-semibold);
  color: var(--water);
}

.privacy-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* Transitions */
.collapse-enter-active,
.collapse-leave-active {
  transition: all var(--transition-base);
  max-height: 800px;
  opacity: 1;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
