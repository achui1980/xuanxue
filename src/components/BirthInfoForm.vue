<template>
  <div class="birth-info-form">
    <p class="form-intro">
      <AppIcon name="info" size="sm" />
      请输入出生信息，用于生成八字与五行分析
    </p>

    <div class="form-grid">
      <div class="form-field">
        <label>出生年份</label>
        <input
          type="number"
          v-model.number="form.year"
          class="input"
          placeholder="例如: 1990"
          min="1900"
          max="2100"
        />
      </div>

      <div class="form-field">
        <label>出生月份</label>
        <select v-model.number="form.month" class="input select">
          <option :value="null" disabled>选择</option>
          <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
        </select>
      </div>

      <div class="form-field">
        <label>出生日期</label>
        <select v-model.number="form.day" class="input select">
          <option :value="null" disabled>选择</option>
          <option v-for="d in 31" :key="d" :value="d">{{ d }}日</option>
        </select>
      </div>

      <div class="form-field">
        <label>出生时辰</label>
        <select v-model.number="form.hour" class="input select">
          <option :value="null" disabled>选择</option>
          <option v-for="h in 24" :key="h - 1" :value="h - 1">
            {{ h - 1 }}时 {{ getBranchForHour(h - 1) }}
          </option>
        </select>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn btn-primary" @click="handleSubmit" :disabled="!isFormValid">
        <AppIcon name="check" size="sm" />
        {{ isEdit ? '保存修改' : '计算八字' }}
      </button>
      <button v-if="isEdit" class="btn btn-secondary" @click="$emit('cancel')">取消</button>
    </div>

    <Transition name="fade">
      <div v-if="errorMessage" class="error-alert">
        <AppIcon name="warning" size="sm" />
        {{ errorMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useBeijingTime } from '@/composables/useBeijingTime'
import AppIcon from '@/components/icons/AppIcon.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['success', 'cancel'])

const userStore = useUserStore()
const { getBranchForHour } = useBeijingTime()

const isEdit = computed(() => !!props.initialData?.birthYear)

const form = ref({
  year: props.initialData?.birthYear || null,
  month: props.initialData?.birthMonth || null,
  day: props.initialData?.birthDay || null,
  hour: props.initialData?.birthHour ?? null
})

const errorMessage = ref('')

const isFormValid = computed(() => {
  return form.value.year && form.value.month && form.value.day && form.value.hour !== null
})

function handleSubmit() {
  errorMessage.value = ''

  if (!isFormValid.value) {
    errorMessage.value = '请填写完整的出生信息'
    return
  }

  const success = userStore.setBirthInfo(
    form.value.year,
    form.value.month,
    form.value.day,
    form.value.hour
  )

  if (success) {
    emit('success')
  } else {
    errorMessage.value = '计算失败，请检查输入日期是否有效'
  }
}
</script>

<style scoped>
.birth-info-form {
  padding: var(--space-4);
}

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

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
