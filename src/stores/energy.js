import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'
import {
  getCurrentHourBazi,
  calculateHourEnergy,
  getActivitiesByElement,
  getAvoidActivitiesByElement,
  calculateShenSha,
  getLunarInfo, // Import getLunarInfo
  HEAVENLY_STEM_ELEMENTS,
  EARTHLY_BRANCH_ELEMENTS
} from '../utils/tyme'

export const useEnergyStore = defineStore('energy', () => {
  const userStore = useUserStore()

  const defaultActionLibrary = [
    { id: 'work', label: '专注工作' },
    { id: 'meeting', label: '开会谈事' },
    { id: 'study', label: '学习充电' },
    { id: 'sign', label: '签约合作' },
    { id: 'money', label: '投资决策' },
    { id: 'social', label: '社交表达' },
    { id: 'date', label: '表白约会' }, // New
    { id: 'exercise', label: '运动健身' },
    { id: 'travel', label: '外出行程' },
    { id: 'cleanup', label: '整理收尾' }, // New
    { id: 'create', label: '创作输出' }, // New
    { id: 'plan', label: '复盘规划' } // New
  ]

  const actionLibrary = computed(() => {
    const custom = userStore.profile.customActivities || []
    return [...defaultActionLibrary, ...custom]
  })

  /**
   * 动态计算24小时能量数据
   */
  const hoursData = computed(() => {
    if (!userStore.hasBirthInfo()) {
      return getDefaultHoursData()
    }

    const today = new Date()
    const result = []

    for (let hour = 0; hour < 24; hour++) {
      const hourDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, 0, 0)
      const hourBazi = getCurrentHourBazi(hourDate)

      if (!hourBazi) {
        result.push(getDefaultHourData(hour))
        continue
      }

      let score = calculateHourEnergy(
        userStore.profile.bazi,
        {
          favorable: userStore.profile.favorable,
          unfavorable: userStore.profile.unfavorable
        },
        hourBazi
      )

      // 应用个性化规则调整分数
      score = applyPersonalRules(score, hour)

      const hourStemElement = HEAVENLY_STEM_ELEMENTS[hourBazi.stem]
      const hourBranchElement = EARTHLY_BRANCH_ELEMENTS[hourBazi.branch]

      let dominantElement = hourStemElement
      if (userStore.profile.favorable.includes(hourStemElement)) {
        dominantElement = hourStemElement
      } else if (userStore.profile.favorable.includes(hourBranchElement)) {
        dominantElement = hourBranchElement
      }

      const { stars, clashes } = calculateShenSha(userStore.profile.bazi, hourBazi)
      const shenShaDesc = [
        ...stars.map((s) => `✨${s.name}`),
        ...clashes.map((c) => `⚠️${c.name}`)
      ].join(' ')

      const recommendedActivities = getActivitiesByElement(dominantElement)
      const avoidActivities = getAvoidActivitiesByElement(dominantElement)

      let brief = ''
      let elementHint = ''

      if (clashes.length > 0) {
        elementHint = '凶'
        brief = `时辰${hourBazi.full}，犯${clashes[0].name} (${clashes[0].desc})，宜静守。`
      } else if (score >= 80) {
        elementHint = '极佳时机'
        brief = `时辰${hourBazi.full}，${dominantElement}旺，与您的命局非常相合，适合处理重要事务。`
      } else if (score >= 70) {
        elementHint = '吉时'
        brief = `时辰${hourBazi.full}，${dominantElement}助，能量充沛，适合行动。`
      } else if (score >= 50) {
        elementHint = '平稳'
        brief = `时辰${hourBazi.full}，能量平和，可处理日常事务。`
      } else if (score >= 30) {
        elementHint = '不宜'
        brief = `时辰${hourBazi.full}，${dominantElement}不利，宜谨慎行事。`
      } else {
        elementHint = '忌'
        brief = `时辰${hourBazi.full}，能量不佳，建议休息调整。`
      }

      result.push({
        hour,
        rangeLabel: `${String(hour).padStart(2, '0')}:00-${String(hour).padStart(2, '0')}:59`,
        score,
        elementHint,
        brief,
        hourBazi: hourBazi.full,
        element: dominantElement,
        recommendedActions: recommendedActivities.slice(0, 3),
        avoidActions: avoidActivities.slice(0, 2),
        shenSha: shenShaDesc,
        stars,
        clashes,
        // Pre-compute reason tags for UI
        reasonTags: translateStarsClashesToTags(stars, clashes, score)
      })
    }

    return result
  })

  // Helper to translate stars/clashes to human readable tags
  function translateStarsClashesToTags(stars, clashes, score) {
    const tags = []

    // High level tags from ShenSha
    stars.forEach((s) => {
      if (s.name === '贵人') tags.push('适合求助')
      if (s.name === '文昌') tags.push('适合脑力')
      if (s.name === '桃花') tags.push('人缘在线')
      if (s.name === '驿马') tags.push('适合跑动')
    })

    clashes.forEach((c) => {
      tags.push('少做决策')
      tags.push('注意情绪')
    })

    // Fallback tags based on score if no specific ShenSha
    if (tags.length === 0) {
      if (score >= 80) tags.push('效率极高')
      else if (score >= 70) tags.push('推进顺利')
      else if (score <= 30) tags.push('宜静养')
      else if (score <= 50) tags.push('宜保守')
    }

    // Deduplicate and slice
    return [...new Set(tags)].slice(0, 2)
  }

  // 计算今日综合运势 (Daily Fortune)
  const dailyFortune = computed(() => {
    const today = new Date()
    const lunarInfo = getLunarInfo(today)

    // 1. Calculate Overall Score
    // Weight daytime (08-22) higher
    let totalWeightedScore = 0
    let totalWeight = 0
    let scores = []

    hoursData.value.forEach((h) => {
      const weight = h.hour >= 8 && h.hour <= 22 ? 1.2 : 0.8
      totalWeightedScore += h.score * weight
      totalWeight += weight
      scores.push(h.score)
    })

    let overallScore = Math.round(totalWeightedScore / totalWeight)

    // Stability Bonus/Penalty (Standard Deviation)
    const mean = scores.reduce((a, b) => a + b) / scores.length
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length
    const stdDev = Math.sqrt(variance)

    // Low variance (stable) is good, High variance (volatile) is risky
    if (stdDev < 10) overallScore += 5
    else if (stdDev > 20) overallScore -= 5

    overallScore = Math.max(0, Math.min(100, overallScore))

    // Level Text
    let level = 'ok'
    let levelText = '平'
    let quote = '按计划推进更顺，低谷时段别做硬决策。'

    if (overallScore >= 75) {
      level = 'good'
      levelText = '顺'
      quote = '今天适合把关键事项定下来，优先做最重要的一件。'
    } else if (overallScore < 55) {
      level = 'caution'
      levelText = '谨慎'
      quote = '今天更适合收尾与整理，重要决定放慢半拍。'
    }

    // 2. Calculate Aspects (Behavior Mapping)
    // Helper to get avg score for keywords
    const getAspectScore = (keywords) => {
      const targetHours = hoursData.value.filter((h) => {
        // Simple heuristic: check if recommendedActions match keywords
        return h.recommendedActions.some((act) => keywords.some((k) => act.includes(k)))
      })

      if (targetHours.length === 0) return overallScore // fallback

      // Top 5 hours avg
      const topScores = targetHours
        .map((h) => h.score)
        .sort((a, b) => b - a)
        .slice(0, 5)
      return Math.round(topScores.reduce((a, b) => a + b, 0) / topScores.length)
    }

    const careerScore = getAspectScore(['工作', '决策', '会议', '谈判'])
    const wealthScore = getAspectScore(['投资', '理财', '签约'])
    const loveScore = getAspectScore(['社交', '聚会', '情感'])
    const healthScore = getAspectScore(['运动', '健身', '休息']) // Simplified

    // 3. Top / Caution Hours
    // Prefer daytime for Top hours unless score is exceptionally high at night
    const topHours = [...hoursData.value]
      .map((h) => ({ ...h, sortScore: h.score + (h.hour >= 9 && h.hour <= 21 ? 10 : 0) })) // boost daytime preference
      .sort((a, b) => b.sortScore - a.sortScore)
      .slice(0, 3)
      .map((h) => ({
        hour: h.hour,
        score: h.score,
        rangeLabel: h.rangeLabel,
        reasonTags: h.reasonTags
      }))

    const cautionHours = [...hoursData.value]
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .map((h) => ({
        hour: h.hour,
        score: h.score,
        rangeLabel: h.rangeLabel,
        reasonTags: h.reasonTags
      }))

    // 4. Pros / Cons (from Top/Caution hours)
    const pros = [...new Set(topHours.flatMap((h) => hoursData.value[h.hour].recommendedActions))]
      .slice(0, 3)
      .map((a) => `宜${a}`)
    const cons = [...new Set(cautionHours.flatMap((h) => hoursData.value[h.hour].avoidActions))]
      .slice(0, 3)
      .map((a) => `忌${a}`)

    // 5. Daily Tags
    const dailyTags = []
    if (topHours.some((h) => h.reasonTags.includes('适合求助'))) dailyTags.push('贵人运')
    if (topHours.some((h) => h.reasonTags.includes('适合脑力'))) dailyTags.push('利脑力')
    if (cautionHours.some((h) => h.reasonTags.includes('少做决策'))) dailyTags.push('忌冲动')
    if (dailyTags.length === 0) {
      if (level === 'good') dailyTags.push('诸事皆宜')
      else if (level === 'caution') dailyTags.push('宜守成')
      else dailyTags.push('平稳有序')
    }

    return {
      date: today.toISOString().slice(0, 10),
      lunarText: lunarInfo ? lunarInfo.fullName : '',
      overall: { score: overallScore, level, text: levelText },
      aspects: {
        career: { score: careerScore, text: getAspectText(careerScore) },
        wealth: { score: wealthScore, text: getAspectText(wealthScore) },
        love: { score: loveScore, text: getAspectText(loveScore) },
        health: { score: healthScore, text: getAspectText(healthScore) }
      },
      quote,
      tags: dailyTags.slice(0, 3),
      pros,
      cons,
      topHours,
      cautionHours
    }
  })

  function getAspectText(score) {
    if (score >= 80) return '势不可挡'
    if (score >= 70) return '推进顺利'
    if (score >= 50) return '平稳'
    if (score >= 40) return '需费力'
    return '宜保守'
  }

  /**
   * 获取默认通用时辰数据（无个性化）
   */
  function getDefaultHoursData() {
    return [
      {
        hour: 0,
        rangeLabel: '00:00-00:59',
        score: 25,
        elementHint: '宜静养',
        brief: '适合睡眠休息，避免剧烈活动。',
        recommendedActions: ['冥想', '轻松阅读'],
        avoidActions: ['剧烈运动', '重要决策'],
        reasonTags: ['宜静养'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 1,
        rangeLabel: '01:00-01:59',
        score: 20,
        elementHint: '深度休息',
        brief: '身心最需要休息的时段。',
        recommendedActions: ['深度睡眠'],
        avoidActions: ['任何活动'],
        reasonTags: ['宜静养'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 2,
        rangeLabel: '02:00-02:59',
        score: 15,
        elementHint: '低谷期',
        brief: '能量最低，不宜安排任何重要事务。',
        recommendedActions: ['睡眠'],
        avoidActions: ['工作', '决策', '运动'],
        reasonTags: ['宜静养'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 3,
        rangeLabel: '03:00-03:59',
        score: 18,
        elementHint: '渐复苏',
        brief: '能量开始缓慢恢复。',
        recommendedActions: ['继续睡眠'],
        avoidActions: ['重体力活动'],
        reasonTags: ['宜静养'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 4,
        rangeLabel: '04:00-04:59',
        score: 22,
        elementHint: '早起适宜',
        brief: '适合早起人群的轻度活动。',
        recommendedActions: ['轻度冥想', '拉伸'],
        avoidActions: ['剧烈运动'],
        reasonTags: ['宜静养'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 5,
        rangeLabel: '05:00-05:59',
        score: 30,
        elementHint: '渐入状态',
        brief: '思维开始清晰，适合轻度准备工作。',
        recommendedActions: ['晨间规划', '轻度运动'],
        avoidActions: ['复杂决策'],
        reasonTags: ['宜规划'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 6,
        rangeLabel: '06:00-06:59',
        score: 45,
        elementHint: '晨间活力',
        brief: '适合开始一天的准备工作。',
        recommendedActions: ['晨练', '整理思路'],
        avoidActions: ['情感谈话'],
        reasonTags: ['宜规划'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 7,
        rangeLabel: '07:00-07:59',
        score: 55,
        elementHint: '精神饱满',
        brief: '思维清晰，适合处理重要但不复杂的事务。',
        recommendedActions: ['重要沟通', '规划制定'],
        avoidActions: ['冲动决策'],
        reasonTags: ['宜沟通'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 8,
        rangeLabel: '08:00-08:59',
        score: 62,
        elementHint: '工作启动',
        brief: '适合开始工作状态，处理日常事务。',
        recommendedActions: ['邮件处理', '日程安排'],
        avoidActions: ['重大签约'],
        reasonTags: ['宜启动'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 9,
        rangeLabel: '09:00-09:59',
        score: 68,
        elementHint: '适合启动',
        brief: '思路相对清晰，适合处理需要专注的工作。',
        recommendedActions: ['专注工作', '重要任务'],
        avoidActions: ['情感决策'],
        reasonTags: ['宜专注'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 10,
        rangeLabel: '10:00-10:59',
        score: 82,
        elementHint: '黄金时段',
        brief: '一天中的第一个能量高峰，适合处理重要事务。',
        recommendedActions: ['重要会议', '关键决策', '创意工作'],
        avoidActions: ['琐碎事务'],
        reasonTags: ['效率高'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 11,
        rangeLabel: '11:00-11:59',
        score: 78,
        elementHint: '持续高效',
        brief: '延续上午的高能量状态。',
        recommendedActions: ['深度工作', '重要谈判'],
        avoidActions: ['分散注意力的活动'],
        reasonTags: ['效率高'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 12,
        rangeLabel: '12:00-12:59',
        score: 65,
        elementHint: '需要平衡',
        brief: '能量开始下降，需要适当休息。',
        recommendedActions: ['用餐', '轻松交流'],
        avoidActions: ['高强度工作'],
        reasonTags: ['宜休息'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 13,
        rangeLabel: '13:00-13:59',
        score: 58,
        elementHint: '餐后调整',
        brief: '用餐后需要时间消化调整。',
        recommendedActions: ['轻度活动', '午休'],
        avoidActions: ['重要会议'],
        reasonTags: ['宜休息'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 14,
        rangeLabel: '14:00-14:59',
        score: 42,
        elementHint: '低谷期',
        brief: '下午低谷期，容易疲倦分神。',
        recommendedActions: ['休息', '轻松阅读'],
        avoidActions: ['重要决策', '复杂工作'],
        reasonTags: ['防犯错'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 15,
        rangeLabel: '15:00-15:59',
        score: 72,
        elementHint: '下午高峰',
        brief: '下午的能量回升期，适合推进重要工作。',
        recommendedActions: ['重要项目', '关键沟通'],
        avoidActions: ['琐碎杂务'],
        reasonTags: ['效率高'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 16,
        rangeLabel: '16:00-16:59',
        score: 69,
        elementHint: '稳定推进',
        brief: '能量稳定，适合持续性工作。',
        recommendedActions: ['专注任务', '团队协作'],
        avoidActions: ['情绪化决策'],
        reasonTags: ['宜专注'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 17,
        rangeLabel: '17:00-17:59',
        score: 63,
        elementHint: '收尾阶段',
        brief: '适合总结和收尾工作。',
        recommendedActions: ['工作总结', '明日规划'],
        avoidActions: ['新项目启动'],
        reasonTags: ['宜收尾'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 18,
        rangeLabel: '18:00-18:59',
        score: 56,
        elementHint: '转换模式',
        brief: '从工作模式向生活模式转换。',
        recommendedActions: ['轻松活动', '社交'],
        avoidActions: ['高强度工作'],
        reasonTags: ['宜放松'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 19,
        rangeLabel: '19:00-19:59',
        score: 52,
        elementHint: '社交时光',
        brief: '适合社交和轻松的个人活动。',
        recommendedActions: ['社交聚会', '兴趣爱好'],
        avoidActions: ['复杂思考'],
        reasonTags: ['宜社交'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 20,
        rangeLabel: '20:00-20:59',
        score: 48,
        elementHint: '放松时段',
        brief: '身心开始放松，准备结束一天。',
        recommendedActions: ['娱乐', '轻度运动'],
        avoidActions: ['工作', '学习'],
        reasonTags: ['宜放松'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 21,
        rangeLabel: '21:00-21:59',
        score: 40,
        elementHint: '准备休息',
        brief: '开始准备休息，避免刺激性活动。',
        recommendedActions: ['阅读', '音乐'],
        avoidActions: ['激烈运动', '重要决策'],
        reasonTags: ['宜休息'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 22,
        rangeLabel: '22:00-22:59',
        score: 32,
        elementHint: '睡前准备',
        brief: '准备睡眠，让身心逐渐安静下来。',
        recommendedActions: ['轻松阅读', '冥想'],
        avoidActions: ['工作', '刺激性活动'],
        reasonTags: ['宜静养'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      },
      {
        hour: 23,
        rangeLabel: '23:00-23:59',
        score: 28,
        elementHint: '入睡时机',
        brief: '最佳入睡时间，让身体进入休息状态。',
        recommendedActions: ['睡眠准备'],
        avoidActions: ['任何兴奋性活动'],
        reasonTags: ['宜静养'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      }
    ]
  }

  function getDefaultHourData(hour) {
    return (
      getDefaultHoursData()[hour] || {
        hour,
        rangeLabel: `${String(hour).padStart(2, '0')}:00-${String(hour).padStart(2, '0')}:59`,
        score: 50,
        elementHint: '平稳',
        brief: '能量平和，可处理日常事务。',
        recommendedActions: ['日常工作'],
        avoidActions: ['重大决策'],
        reasonTags: ['平稳'],
        stars: [],
        clashes: [],
        element: '通用',
        hourBazi: '',
        shenSha: ''
      }
    )
  }

  // Computed properties for best/worst hours
  const bestHours = computed(() => {
    return hoursData.value
      .filter((hour) => hour.score >= 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  })

  const worstHours = computed(() => {
    return hoursData.value
      .filter((hour) => hour.score <= 50)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
  })

  function getHourData(hour) {
    return hoursData.value[hour]
  }

  function getActionLabel(actionId) {
    const action = actionLibrary.value.find((a) => a.id === actionId)
    return action ? action.label : ''
  }

  function getEnergyLevel(score) {
    if (score >= 70) return 'high'
    if (score >= 50) return 'medium'
    return 'low'
  }

  /**
   * 应用个性化规则调整分数
   * @param {number} baseScore - 基础分数
   * @param {number} hour - 小时
   * @returns {number} - 调整后的分数
   */
  function applyPersonalRules(baseScore, hour) {
    const personalRules = userStore.profile.personalRules || []
    const personalizationWeight = userStore.profile.personalizationWeight ?? 30

    if (personalRules.length === 0 || personalizationWeight === 0) {
      return baseScore
    }

    let totalAdjustment = 0
    let applicableRules = 0

    personalRules.forEach((rule) => {
      // 检查规则是否适用于当前时段
      if (isRuleApplicable(rule, hour)) {
        const impact = (rule.impact || 10) * (rule.count || 1)

        if (rule.type === 'preference') {
          totalAdjustment += impact
        } else if (rule.type === 'avoidance') {
          totalAdjustment -= impact
        } else if (rule.type === 'observation') {
          // 观察类规则根据描述判断
          if (isPositiveObservation(rule)) {
            totalAdjustment += impact * 0.5
          } else {
            totalAdjustment -= impact * 0.5
          }
        }

        applicableRules++
      }
    })

    if (applicableRules === 0) {
      return baseScore
    }

    // 计算加权平均：八字推荐占 (100 - weight)%，个人规则占 weight%
    const weightFactor = personalizationWeight / 100
    const adjustedScore = baseScore + totalAdjustment * weightFactor

    // 限制在 0-100 范围内
    return Math.max(0, Math.min(100, adjustedScore))
  }

  /**
   * 检查规则是否适用于当前时段
   */
  function isRuleApplicable(rule, hour) {
    const context = rule.context

    if (!context || context === 'always') {
      return true
    }

    const contextMap = {
      morning: hour >= 6 && hour <= 12,
      afternoon: hour >= 13 && hour <= 17,
      evening: hour >= 18 && hour <= 21,
      night: hour >= 22 || hour <= 5,
      workday: hour >= 9 && hour <= 18,
      weekend: true // 周末全天，简化处理
    }

    return contextMap[context] || false
  }

  /**
   * 判断观察类规则是正面还是负面
   */
  function isPositiveObservation(rule) {
    const positiveWords = ['高', '好', '强', '顺利', '成功', '有效', '适合', '喜欢']
    const negativeWords = ['低', '差', '弱', '困难', '失败', '疲劳', '累', '避免']

    const desc = rule.description || ''
    const hasPositive = positiveWords.some((w) => desc.includes(w))
    const hasNegative = negativeWords.some((w) => desc.includes(w))

    if (hasPositive && !hasNegative) return true
    if (hasNegative && !hasPositive) return false
    return true // 默认正面
  }

  /**
   * 根据目标内容推荐最佳时机
   * 返回 { top: [], caution: [], tips: [] }
   */
  function getRecommendedHoursForAction(actionId) {
    if (!actionId) return { top: [], caution: [] }

    const action = actionLibrary.value.find((a) => a.id === actionId)
    if (!action) return { top: [], caution: [] }

    // Map action IDs to keywords for better matching
    const ACTION_KEYWORDS = {
      work: ['专注', '深度', '执行', '完成', '工作', '任务', '项目'],
      meeting: ['会议', '谈判', '沟通', '公开', '演讲', '讨论', '谈事'],
      study: ['学习', '充电', '阅读', '研究', '思考', '理解', '吸收'],
      sign: ['签约', '合作', '合同', '法律', '协议', '承诺'],
      money: ['投资', '理财', '决策', '金钱', '财务', '收益'],
      social: ['社交', '表达', '聚会', '人脉', '关系', '互动', '交流'],
      date: ['表白', '约会', '情感', '浪漫', '亲近', '约会'],
      exercise: ['运动', '健身', '锻炼', '体能', '活动', '身体'],
      travel: ['出行', '旅行', '外出行程', '移动', '外出', '赶路'],
      cleanup: ['整理', '收尾', '清洁', '归纳', '收拾', '完成'],
      create: ['创作', '输出', '创意', '写作', '设计', '灵感'],
      plan: ['复盘', '规划', '总结', '计划', '反思', '调整']
    }

    const keywords = ACTION_KEYWORDS[actionId] || [action.label]

    // Smart matching: check recommendedActions, avoidActions, reasonTags, brief
    const matches = hoursData.value.filter((h) => {
      const searchText = [
        ...h.recommendedActions,
        ...h.avoidActions,
        ...h.reasonTags,
        h.brief,
        h.elementHint
      ].join(' ')

      return keywords.some((kw) => searchText.includes(kw))
    })

    let top = []
    if (matches.length > 0) {
      // Sort by score, prefer daytime hours (9-21)
      top = matches
        .map((h) => ({ ...h, sortScore: h.score + (h.hour >= 9 && h.hour <= 21 ? 5 : 0) }))
        .sort((a, b) => b.sortScore - a.sortScore)
        .slice(0, 3)
    } else {
      // Fallback to high score hours
      top = [...bestHours.value].slice(0, 3)
    }

    const caution = [...worstHours.value].slice(0, 2)

    return { top, caution }
  }

  /**
   * 计算未来7天的能量趋势
   */
  const weeklyTrend = computed(() => {
    if (!userStore.hasBirthInfo()) {
      return getSimulatedWeeklyData()
    }

    const today = new Date()
    const result = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      let dailyTotalScore = 0

      for (let hour = 0; hour < 24; hour += 2) {
        const hourDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0)
        const hourBazi = getCurrentHourBazi(hourDate)
        if (hourBazi) {
          dailyTotalScore += calculateHourEnergy(
            userStore.profile.bazi,
            {
              favorable: userStore.profile.favorable,
              unfavorable: userStore.profile.unfavorable
            },
            hourBazi
          )
        } else {
          dailyTotalScore += 50
        }
      }

      const avgScore = Math.round(dailyTotalScore / 12)

      result.push({
        date: date.toISOString().slice(0, 10),
        shortDate: `${date.getMonth() + 1}/${date.getDate()}`,
        score: avgScore
      })
    }

    return result
  })

  function getSimulatedWeeklyData() {
    const today = new Date()
    const result = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      result.push({
        date: date.toISOString().slice(0, 10),
        shortDate: `${date.getMonth() + 1}/${date.getDate()}`,
        score: 40 + Math.floor(Math.random() * 50) // Random 40-90
      })
    }
    return result
  }

  return {
    actionLibrary,
    hoursData,
    weeklyTrend,
    bestHours,
    worstHours,
    dailyFortune, // New
    getHourData,
    getActionLabel,
    getEnergyLevel,
    getRecommendedHoursForAction,
    getBestHoursForGoal
  }

  function getBestHoursForGoal(text) {
    if (!text) return []
    // Simple match
    const matches = hoursData.value.filter(
      (h) => h.recommendedActions.some((act) => act.includes(text)) || h.brief.includes(text)
    )

    if (matches.length > 0) {
      return matches.sort((a, b) => b.score - a.score).slice(0, 3)
    }

    // Fallback to general best hours
    return bestHours.value
  }
})
