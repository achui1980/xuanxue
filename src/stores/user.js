import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { calculateBaZi, calculateWuXingStrength, calculateUsefulGods } from '../utils/tyme'

// LocalStorage 键名
const STORAGE_KEY = 'shiji_user_profile'

// 从 localStorage 加载数据
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('加载用户数据失败:', error)
    return null
  }
}

// 保存到 localStorage
function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('保存用户数据失败:', error)
  }
}

export const useUserStore = defineStore('user', () => {
  // 从本地存储加载或使用默认值
  const storedProfile = loadFromStorage()

  // Ensure customActivities exists if loading from old storage
  if (storedProfile && !storedProfile.customActivities) {
    storedProfile.customActivities = []
  }

  // Ensure goals exists if loading from old storage
  if (storedProfile && !storedProfile.goals) {
    storedProfile.goals = []
  }

  // Ensure personalRules exists if loading from old storage
  if (storedProfile && !storedProfile.personalRules) {
    storedProfile.personalRules = []
  }

  // Ensure personalizationWeight exists if loading from old storage
  if (storedProfile && typeof storedProfile.personalizationWeight === 'undefined') {
    storedProfile.personalizationWeight = 30
  }

  // Ensure birth info fields exist (V2.1 Update)
  if (storedProfile && typeof storedProfile.birthMinute === 'undefined') {
    storedProfile.birthMinute = 0
  }
  if (storedProfile && typeof storedProfile.birthLongitude === 'undefined') {
    storedProfile.birthLongitude = 120
  }
  if (storedProfile && typeof storedProfile.currentLongitude === 'undefined') {
    storedProfile.currentLongitude = 120
  }

  const profile = ref(
    storedProfile || {
      name: '用户A',
      timezone: 'Asia/Shanghai',

      // 自定义活动
      customActivities: [],

      // 今日目标
      goals: [],

      // 智能提醒
      enableNotifications: false,

      // 出生信息
      birthYear: null,
      birthMonth: null,
      birthDay: null,
      birthHour: null,
      birthMinute: 0,
      birthLongitude: 120, // 默认为东经120度(北京时间标准)
      
      // 当前位置信息 (用于每日能量计算)
      currentLongitude: 120,

      // 八字信息（自动计算）
      bazi: null,
      dayMaster: null,

      // 五行强弱（自动计算）
      wuxing: { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 },

      // 喜忌神（自动计算）
      favorable: [],
      unfavorable: [],
      usefulGod: null,
      avoidGod: null,

      summary: '请输入出生信息以获取个性化分析',

      // 个性化规则实验室
      personalRules: [],
      personalizationWeight: 30
    }
  )

  const preferences = ref({
    goalType: '专注工作',
    intensity: '平衡'
  })

  // 监听 profile 变化，自动保存到 localStorage
  watch(
    profile,
    (newProfile) => {
      saveToStorage(newProfile)
    },
    { deep: true }
  )

  /**
   * 更新个人资料
   */
  function updateProfile(newProfile) {
    profile.value = { ...profile.value, ...newProfile }
  }

  /**
   * 更新偏好设置
   */
  function updatePreferences(newPreferences) {
    preferences.value = { ...preferences.value, ...newPreferences }
  }

  /**
   * 设置出生信息并自动计算八字、五行
   */
  function setBirthInfo(year, month, day, hour, minute = 0, longitude = 120) {
    // 保存出生信息
    profile.value.birthYear = year
    profile.value.birthMonth = month
    profile.value.birthDay = day
    profile.value.birthHour = hour
    profile.value.birthMinute = minute
    profile.value.birthLongitude = longitude

    // 如果没有设置过当前经度，默认为出生地经度
    if (!profile.value.currentLongitude || profile.value.currentLongitude === 120) {
      profile.value.currentLongitude = longitude
    }

    // 计算八字
    const bazi = calculateBaZi(year, month, day, hour, minute, longitude)
    if (!bazi) {
      console.error('计算八字失败')
      return false
    }
    profile.value.bazi = bazi
    profile.value.dayMaster = bazi.dayMaster

    // 计算五行强弱
    const wuxingScores = calculateWuXingStrength(bazi)
    if (wuxingScores) {
      profile.value.wuxing = {
        wood: wuxingScores['木'],
        fire: wuxingScores['火'],
        earth: wuxingScores['土'],
        metal: wuxingScores['金'],
        water: wuxingScores['水']
      }
    }

    // 计算喜忌神
    const gods = calculateUsefulGods(wuxingScores, bazi.dayMaster)
    if (gods) {
      profile.value.favorable = gods.favorable
      profile.value.unfavorable = gods.unfavorable
      profile.value.usefulGod = gods.usefulGod
      profile.value.avoidGod = gods.avoidGod

      // 生成摘要
      const wuxingNames = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' }
      const sortedWuxing = Object.entries(profile.value.wuxing).sort((a, b) => b[1] - a[1])
      const strongest = wuxingNames[sortedWuxing[0][0]]
      const weakest = wuxingNames[sortedWuxing[sortedWuxing.length - 1][0]]

      profile.value.summary = `日主${bazi.dayMaster}，${strongest}旺${weakest}弱，喜${gods.favorable.join('、')}`
    }

    return true
  }

  /**
   * 检查是否有完整的出生信息
   */
  function hasBirthInfo() {
    return !!(
      profile.value.birthYear &&
      profile.value.birthMonth &&
      profile.value.birthDay &&
      profile.value.birthHour !== null
    )
  }

  /**
   * 清除出生信息
   */
  function clearBirthInfo() {
    profile.value.birthYear = null
    profile.value.birthMonth = null
    profile.value.birthDay = null
    profile.value.birthHour = null
    profile.value.birthMinute = 0
    profile.value.birthLongitude = 120
    profile.value.currentLongitude = 120
    profile.value.bazi = null
    profile.value.dayMaster = null
    profile.value.wuxing = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
    profile.value.favorable = []
    profile.value.unfavorable = []
    profile.value.usefulGod = null
    profile.value.avoidGod = null
    profile.value.summary = '请输入出生信息以获取个性化分析'
  }

  /**
   * 导出用户数据
   */
  function exportData() {
    try {
      const data = {
        profile: profile.value,
        preferences: preferences.value,
        version: '1.0.0', // 数据版本号，用于后续兼容性处理
        exportTime: new Date().toISOString()
      }
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('导出数据失败:', error)
      return null
    }
  }

  /**
   * 导入用户数据
   */
  function importData(jsonString) {
    try {
      const data = JSON.parse(jsonString)

      // 简单的数据结构校验
      if (!data || !data.profile) {
        throw new Error('无效的数据格式')
      }

      // TODO: 在这里添加数据版本迁移逻辑 if (data.version !== CURRENT_VERSION)

      // 更新状态
      profile.value = { ...profile.value, ...data.profile }
      if (data.preferences) {
        preferences.value = { ...preferences.value, ...data.preferences }
      }

      return { success: true }
    } catch (error) {
      console.error('导入数据失败:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    profile,
    preferences,
    updateProfile,
    updatePreferences,
    setBirthInfo,
    hasBirthInfo,
    clearBirthInfo,
    addCustomActivity,
    removeCustomActivity,
    addGoal,
    removeGoal,
    toggleGoal,
    exportData,
    importData
  }

  /**
   * 添加今日目标
   */
  function addGoal(text) {
    if (!profile.value.goals) {
      profile.value.goals = []
    }
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2)
    profile.value.goals.push({ id, text, completed: false })
  }

  /**
   * 移除今日目标
   */
  function removeGoal(id) {
    if (!profile.value.goals) return
    const index = profile.value.goals.findIndex((g) => g.id === id)
    if (index !== -1) {
      profile.value.goals.splice(index, 1)
    }
  }

  /**
   * 切换目标完成状态
   */
  function toggleGoal(id) {
    if (!profile.value.goals) return
    const goal = profile.value.goals.find((g) => g.id === id)
    if (goal) {
      goal.completed = !goal.completed
    }
  }

  /**
   * 添加自定义活动
   */
  function addCustomActivity(activity) {
    if (!profile.value.customActivities) {
      profile.value.customActivities = []
    }
    profile.value.customActivities.push(activity)
  }

  /**
   * 移除自定义活动
   */
  function removeCustomActivity(id) {
    if (!profile.value.customActivities) return
    const index = profile.value.customActivities.findIndex((a) => a.id === id)
    if (index !== -1) {
      profile.value.customActivities.splice(index, 1)
    }
  }
})
