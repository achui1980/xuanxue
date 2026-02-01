<template>
  <div class="profile-tab">
    <!-- 1. 人格画像（新增核心） -->
    <PersonalityCard />

    <!-- 2. 能量时钟（新增） -->
    <EnergyClock />

    <!-- 3. 个性化实验室（新增） -->
    <PersonalizedRules />

    <!-- 4. 出生信息（已填则折叠，默认收起） -->
    <div class="profile-section birth-section">
      <div class="section-header" @click="toggleBirthSection">
        <div class="card-title">出生信息</div>
        <span class="toggle-icon">{{ birthExpanded ? '▼' : '▶' }}</span>
      </div>

      <div v-show="birthExpanded">
        <div v-if="!userStore.hasBirthInfo()" class="birth-form">
          <p class="form-hint">请输入您的出生信息，用于生成个性化吉时与行动建议</p>

          <div class="form-row">
            <div class="form-field">
              <label>出生年份</label>
              <input
                type="number"
                v-model.number="birthForm.year"
                placeholder="例如: 1990"
                min="1900"
                max="2100"
              />
            </div>

            <div class="form-field">
              <label>出生月份</label>
              <select v-model.number="birthForm.month">
                <option :value="null" disabled>选择月份</option>
                <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
              </select>
            </div>

            <div class="form-field">
              <label>出生日期</label>
              <select v-model.number="birthForm.day">
                <option :value="null" disabled>选择日期</option>
                <option v-for="d in 31" :key="d" :value="d">{{ d }}日</option>
              </select>
            </div>

            <div class="form-field">
              <label>出生时辰</label>
              <select v-model.number="birthForm.hour">
                <option :value="null" disabled>选择时辰</option>
                <option v-for="h in 24" :key="h - 1" :value="h - 1">
                  {{ String(h - 1).padStart(2, '0') }}:00 - {{ String(h - 1).padStart(2, '0') }}:59
                </option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button @click="handleCalculate" class="btn-primary" :disabled="!isFormValid">
              计算八字
            </button>
            <button @click="goToToday" class="btn-secondary">先看通用指引</button>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>

        <div v-else class="birth-display">
          <div class="birth-info-grid">
            <div class="info-item">
              <span class="info-label">出生日期：</span>
              <span class="info-value">
                {{ profile.birthYear }}年{{ profile.birthMonth }}月{{ profile.birthDay }}日
                {{ String(profile.birthHour).padStart(2, '0') }}时
              </span>
            </div>
          </div>

          <button @click="handleClear" class="btn-secondary">重新输入</button>
        </div>
      </div>
    </div>

    <!-- 3. 高级信息（八字、五行原始数据 - 折叠） -->
    <div v-if="userStore.hasBirthInfo()" class="profile-section advanced-section">
      <div class="section-header" @click="toggleAdvancedSection">
        <div class="card-title">高级信息</div>
        <span class="toggle-icon">{{ advancedExpanded ? '▼' : '▶' }}</span>
      </div>

      <div v-show="advancedExpanded">
        <!-- 八字信息 -->
        <div v-if="profile.bazi" class="advanced-subsection">
          <div class="subsection-title">八字信息</div>
          <div class="bazi-grid">
            <div class="bazi-pillar">
              <div class="pillar-label">年柱</div>
              <div class="pillar-value">{{ profile.bazi.year.full }}</div>
            </div>
            <div class="bazi-pillar">
              <div class="pillar-label">月柱</div>
              <div class="pillar-value">{{ profile.bazi.month.full }}</div>
            </div>
            <div class="bazi-pillar">
              <div class="pillar-label">日柱</div>
              <div class="pillar-value">{{ profile.bazi.day.full }}</div>
            </div>
            <div class="bazi-pillar">
              <div class="pillar-label">时柱</div>
              <div class="pillar-value">{{ profile.bazi.hour.full }}</div>
            </div>
          </div>
          <div class="day-master">
            日主：<strong>{{ profile.dayMaster }}</strong>
          </div>
        </div>

        <!-- 五行原始数据 -->
        <div v-if="profile.wuxing" class="advanced-subsection">
          <div class="subsection-title">五行数据</div>
          <div class="wuxing-raw">
            <div v-for="(value, key) in profile.wuxing" :key="key" class="wuxing-raw-item">
              <span class="wuxing-raw-name">{{ getWuxingName(key) }}</span>
              <span class="wuxing-raw-value">{{ value }}</span>
            </div>
          </div>
        </div>

        <!-- 喜忌 -->
        <div class="advanced-subsection">
          <div class="subsection-title">喜忌分析</div>
          <div class="favorable-row">
            <span class="favorable-label pro">喜用神</span>
            <span class="favorable-value">{{ profile.favorable?.join('、') || '未计算' }}</span>
          </div>
          <div class="favorable-row">
            <span class="favorable-label con">忌神</span>
            <span class="favorable-value">{{ profile.unfavorable?.join('、') || '未计算' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. 隐私说明 -->
    <div class="privacy-note">
      <strong>隐私保护：</strong
      >所有数据仅存储在您的浏览器本地，不会上传到服务器。您的个人信息完全私密安全。
    </div>

    <!-- 5. 智能提醒 -->
    <div class="profile-section reminders-section">
      <div class="card-title">智能提醒</div>

      <div v-if="!isSupported" class="reminder-warning">您的浏览器不支持通知功能</div>

      <div v-else class="reminder-settings">
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-label">开启浏览器通知</span>
            <span class="setting-desc">当进入吉时或遭遇冲煞时自动提醒</span>
          </div>
          <div class="toggle-switch">
            <input type="checkbox" id="notification-toggle" v-model="isNotificationEnabled" />
            <label for="notification-toggle"></label>
          </div>
        </div>
      </div>
    </div>

    <!-- 6. 数据管理 -->
    <div class="profile-section data-section">
      <div class="card-title">数据管理</div>
      <div class="data-actions">
        <button @click="handleExport" class="btn-secondary">导出数据</button>
        <button @click="triggerImport" class="btn-secondary">导入数据</button>
        <input
          type="file"
          ref="fileInput"
          accept=".json"
          style="display: none"
          @change="handleImport"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useNotifications } from '@/composables/useNotifications'
import { useToast } from 'vue-toastification'
import { useAppStore } from '@/stores/app'
import PersonalityCard from '@/components/PersonalityCard.vue'
import EnergyClock from '@/components/EnergyClock.vue'
import PersonalizedRules from '@/components/PersonalizedRules.vue'

const userStore = useUserStore()
const appStore = useAppStore()
const { requestPermission, isSupported } = useNotifications()
const toast = useToast()
const fileInput = ref(null)

const profile = computed(() => userStore.profile)

// 折叠状态
const birthExpanded = ref(!userStore.hasBirthInfo()) // 未填时展开
const advancedExpanded = ref(false) // 默认折叠

function toggleBirthSection() {
  birthExpanded.value = !birthExpanded.value
}

function toggleAdvancedSection() {
  advancedExpanded.value = !advancedExpanded.value
}

function goToToday() {
  appStore.setActiveTab('today')
}

// Notification State
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

// Birth Form State
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
    birthExpanded.value = false // 计算成功后收起
  } else {
    errorMessage.value = '计算失败，请检查输入日期是否有效'
    toast.error('计算失败')
  }
}

function handleClear() {
  if (confirm('确定要清除出生信息吗？')) {
    userStore.clearBirthInfo()
    birthForm.value = {
      year: null,
      month: null,
      day: null,
      hour: null
    }
    birthExpanded.value = true // 清除后展开
  }
}

function getWuxingName(key) {
  const map = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水'
  }
  return map[key] || key
}

// 导出数据
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

// 触发导入
function triggerImport() {
  fileInput.value.click()
}

// 处理文件导入
function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    const result = userStore.importData(content)

    if (result.success) {
      toast.success('数据导入成功')
      // 重新加载出生信息表单
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

    // 清空 input，允许再次选择同一文件
    event.target.value = ''
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.profile-tab {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.profile-section {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 4px 0;
}

.section-header:hover .toggle-icon {
  color: var(--accent-color);
}

.toggle-icon {
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color 0.2s;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--header-text);
}

/* Advanced Section Styles */
.advanced-subsection {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.advanced-subsection:first-child {
  margin-top: 16px;
  padding-top: 0;
  border-top: none;
}

.subsection-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.bazi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.bazi-pillar {
  background: var(--bg-secondary);
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.pillar-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.pillar-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--header-text);
}

.day-master {
  text-align: center;
  padding: 10px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  color: var(--accent-hover);
  font-size: 0.95rem;
}

.wuxing-raw {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.wuxing-raw-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-secondary);
  padding: 8px 12px;
  border-radius: 6px;
}

.wuxing-raw-name {
  font-weight: 600;
  color: var(--text-primary);
}

.wuxing-raw-value {
  color: var(--text-secondary);
  font-weight: 500;
}

.favorable-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
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

.favorable-label.pro {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success-color);
}

.favorable-label.con {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger-color);
}

.favorable-value {
  color: var(--text-primary);
  font-weight: 500;
}

/* Birth Section */
.birth-form {
  margin-top: 16px;
}

.form-hint {
  color: var(--text-secondary);
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field label {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
  font-size: 0.85rem;
}

.form-field input,
.form-field select {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.form-field input:focus,
.form-field select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: var(--text-secondary);
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--bg-primary);
  border-color: var(--text-secondary);
}

.error-message {
  margin-top: 12px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger-color);
  border-radius: 6px;
  color: var(--danger-color);
  font-size: 0.9rem;
}

.birth-display {
  margin-top: 16px;
}

.birth-info-grid {
  background: var(--bg-secondary);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.info-value {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Privacy Note */
.privacy-note {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid var(--accent-color);
  border-radius: 8px;
  padding: 16px;
  color: var(--accent-hover);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

/* Reminders */
.reminders-section .reminder-warning {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
  border-radius: 6px;
  text-align: center;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.setting-info {
  display: flex;
  flex-direction: column;
}

.setting-label {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 50px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-switch label:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.toggle-switch input:checked + label {
  background-color: var(--accent-color);
}

.toggle-switch input:checked + label:before {
  transform: translateX(24px);
}

/* Data Section */
.data-section .data-actions {
  display: flex;
  gap: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .bazi-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .wuxing-raw {
    gap: 8px;
  }

  .wuxing-raw-item {
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
