import { ref, computed } from 'vue'

// 十二地支
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 时辰对应表（每两小时为一个时辰）
const HOUR_TO_BRANCH = {
  0: 0, // 23:00-01:00 子时
  1: 0,
  2: 1, // 01:00-03:00 丑时
  3: 1,
  4: 2, // 03:00-05:00 寅时
  5: 2,
  6: 3, // 05:00-07:00 卯时
  7: 3,
  8: 4, // 08:00-10:00 辰时
  9: 4,
  10: 5, // 10:00-12:00 巳时
  11: 5,
  12: 6, // 12:00-14:00 午时
  13: 6,
  14: 7, // 14:00-16:00 未时
  15: 7,
  16: 8, // 16:00-18:00 申时
  17: 8,
  18: 9, // 18:00-20:00 酉时
  19: 9,
  20: 10, // 20:00-22:00 戌时
  21: 10,
  22: 11, // 22:00-24:00 亥时
  23: 11
}

export function useBeijingTime() {
  const currentTime = ref(new Date())

  const beijingHour = computed(() => {
    try {
      const beijingTime = new Date(
        currentTime.value.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })
      )
      return beijingTime.getHours()
    } catch (e) {
      return 9 // fallback
    }
  })

  const beijingTime = computed(() => {
    try {
      return new Date(currentTime.value.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }))
    } catch (e) {
      return new Date() // fallback
    }
  })

  // 当前时辰地支
  const currentBranch = computed(() => {
    const hour = beijingHour.value
    const branchIndex = HOUR_TO_BRANCH[hour]
    return BRANCHES[branchIndex]
  })

  // 获取指定小时的地支
  function getBranchForHour(hour) {
    const branchIndex = HOUR_TO_BRANCH[hour]
    return BRANCHES[branchIndex]
  }

  // 获取时辰范围文字
  function getBranchTimeRange(hour) {
    const ranges = [
      '23:00-01:00', // 子
      '01:00-03:00', // 丑
      '03:00-05:00', // 寅
      '05:00-07:00', // 卯
      '07:00-09:00', // 辰
      '09:00-11:00', // 巳
      '11:00-13:00', // 午
      '13:00-15:00', // 未
      '15:00-17:00', // 申
      '17:00-19:00', // 酉
      '19:00-21:00', // 戌
      '21:00-23:00' // 亥
    ]
    const branchIndex = HOUR_TO_BRANCH[hour]
    return ranges[branchIndex]
  }

  function updateTime() {
    currentTime.value = new Date()
  }

  // Update time every minute
  const updateInterval = setInterval(updateTime, 60000)

  function stopTimeUpdates() {
    clearInterval(updateInterval)
  }

  return {
    currentTime,
    beijingHour,
    beijingTime,
    currentHour: beijingHour,
    currentBranch,
    getBranchForHour,
    getBranchTimeRange,
    updateTime,
    stopTimeUpdates
  }
}
