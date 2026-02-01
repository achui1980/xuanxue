import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const WUXING_NAMES = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水'
}

const PERSONALITY_CONFIG = {
  wood: {
    tags: ['创意型', '规划型'],
    description: '你的木元素充沛，就像春天的树木，富有生长力和创造力',
    bestActivities: ['创意工作', '规划制定', '学习新知'],
    bestTimeOfDay: '上午',
    characteristics: '善于创新，喜欢探索新可能，做决策时会考虑长远发展'
  },
  fire: {
    tags: ['表达型', '社交型'],
    description: '你的火元素活跃，就像正午的阳光，充满热情和感染力',
    bestActivities: ['公开演讲', '社交聚会', '谈判沟通'],
    bestTimeOfDay: '下午',
    characteristics: '善于表达，人缘好，在人群中能量最充沛'
  },
  earth: {
    tags: ['稳健型', '执行型'],
    description: '你的土元素厚重，就像大地一样踏实可靠',
    bestActivities: ['执行落实', '整理归纳', '财务管理'],
    bestTimeOfDay: '上午和下午都适合',
    characteristics: '做事稳重，注重实际，是团队中的可靠执行者'
  },
  metal: {
    tags: ['决断型', '精准型'],
    description: '你的金元素锐利，就像秋天的果实，成熟而有决断力',
    bestActivities: ['重要决策', '精细工作', '法律事务'],
    bestTimeOfDay: '下午',
    characteristics: '思维清晰，判断准确，做决策干脆利落'
  },
  water: {
    tags: ['思考型', '灵活型'],
    description: '你的水元素流动，就像深海的智慧，善于深度思考',
    bestActivities: ['深度研究', '写作创作', '冥想反思'],
    bestTimeOfDay: '深夜',
    characteristics: '思维深邃，适应力强，在安静环境中灵感最多'
  }
}

const DAY_MASTER_CONFIG = {
  甲: {
    name: '甲木',
    metaphor: '参天大树',
    traits: '正直向上，有领导力，喜欢稳定的环境',
    advice: '重要工作安排在上午，给自己充足的成长空间'
  },
  乙: {
    name: '乙木',
    metaphor: '花草藤蔓',
    traits: '柔韧灵活，善于协调，适应力强',
    advice: '善用你的灵活性，在变化中找到机会'
  },
  丙: {
    name: '丙火',
    metaphor: '太阳',
    traits: '热情大方，光芒四射，喜欢被认可',
    advice: '下午和晚上是你的高光时刻，重要展示安排在这个时段'
  },
  丁: {
    name: '丁火',
    metaphor: '灯火烛光',
    traits: '温暖细腻，专注深入，有艺术气质',
    advice: '晚上安静时做深度工作，你的专注力最强'
  },
  戊: {
    name: '戊土',
    metaphor: '城墙大地',
    traits: '厚重可靠，包容性强，值得信赖',
    advice: '任何时段你都表现稳定，适合承担重要责任'
  },
  己: {
    name: '己土',
    metaphor: '田园土壤',
    traits: '温和滋养，善于培育，有服务精神',
    advice: '与人合作时你的价值最大，善用你的协调能力'
  },
  庚: {
    name: '庚金',
    metaphor: '刀剑矿石',
    traits: '刚毅果断，追求完美，有正义感',
    advice: '下午做决策最准确，相信你的直觉判断'
  },
  辛: {
    name: '辛金',
    metaphor: '珠宝首饰',
    traits: '精致优雅，注重细节，有审美力',
    advice: '精细工作交给你最放心，注意劳逸结合'
  },
  壬: {
    name: '壬水',
    metaphor: '江河湖海',
    traits: '智慧流动，胸怀宽广，善于应变',
    advice: '深夜思考反而清晰，重要决策可以留到晚上'
  },
  癸: {
    name: '癸水',
    metaphor: '雨露泉水',
    traits: '细腻敏感，润物无声，有洞察力',
    advice: '安静环境最能激发你的灵感，注意保护自己的能量'
  }
}

export function usePersonality() {
  const userStore = useUserStore()

  const profile = computed(() => userStore.profile)

  const hasBirthInfo = computed(() => userStore.hasBirthInfo())

  const dominantElement = computed(() => {
    if (!hasBirthInfo.value || !profile.value.wuxing) return null

    const wuxing = profile.value.wuxing
    let maxValue = 0
    let dominant = null

    for (const [key, value] of Object.entries(wuxing)) {
      if (value > maxValue) {
        maxValue = value
        dominant = key
      }
    }

    return dominant
  })

  const personalityTags = computed(() => {
    if (!dominantElement.value) return []
    return PERSONALITY_CONFIG[dominantElement.value]?.tags || []
  })

  const personalityDescription = computed(() => {
    if (!dominantElement.value) return ''
    return PERSONALITY_CONFIG[dominantElement.value]?.description || ''
  })

  const dayMasterInfo = computed(() => {
    if (!hasBirthInfo.value || !profile.value.dayMaster) return null

    const dayMaster = profile.value.dayMaster
    const config = DAY_MASTER_CONFIG[dayMaster]

    if (!config) return null

    return {
      ...config,
      char: dayMaster
    }
  })

  const bestActivities = computed(() => {
    if (!dominantElement.value) return []
    return PERSONALITY_CONFIG[dominantElement.value]?.bestActivities || []
  })

  const bestTimeOfDay = computed(() => {
    if (!dominantElement.value) return ''
    return PERSONALITY_CONFIG[dominantElement.value]?.bestTimeOfDay || ''
  })

  const characteristics = computed(() => {
    if (!dominantElement.value) return ''
    return PERSONALITY_CONFIG[dominantElement.value]?.characteristics || ''
  })

  const wuxingData = computed(() => {
    if (!hasBirthInfo.value || !profile.value.wuxing) return []

    return Object.entries(profile.value.wuxing).map(([key, value]) => ({
      key,
      name: WUXING_NAMES[key],
      value,
      isDominant: key === dominantElement.value
    }))
  })

  const favorableElements = computed(() => {
    if (!profile.value.favorable) return []
    return profile.value.favorable
  })

  const unfavorableElements = computed(() => {
    if (!profile.value.unfavorable) return []
    return profile.value.unfavorable
  })

  const getWuxingPercent = (value) => {
    if (!profile.value.wuxing) return 0
    const total = Object.values(profile.value.wuxing).reduce((a, b) => a + b, 0)
    if (total === 0) return 0
    return Math.min((value / total) * 100 * 2, 100)
  }

  const getPersonalityAdvice = () => {
    if (!dominantElement.value || !dayMasterInfo.value) return ''

    const elementAdvice = PERSONALITY_CONFIG[dominantElement.value]?.advice || ''
    const dayMasterAdvice = dayMasterInfo.value?.advice || ''

    return `${dayMasterAdvice}。${elementAdvice}`
  }

  return {
    hasBirthInfo,
    dominantElement,
    personalityTags,
    personalityDescription,
    dayMasterInfo,
    bestActivities,
    bestTimeOfDay,
    characteristics,
    wuxingData,
    favorableElements,
    unfavorableElements,
    getWuxingPercent,
    getPersonalityAdvice
  }
}
