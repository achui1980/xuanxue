/**
 * tyme4ts 库封装工具
 * 提供中国历法计算功能：农历、八字、五行等
 */

import { SolarDay, SolarTime, LunarDay, LunarHour } from 'tyme4ts'

/**
 * 五行枚举
 */
export const WU_XING = {
  WOOD: '木',
  FIRE: '火',
  EARTH: '土',
  METAL: '金',
  WATER: '水'
}

/**
 * 天干五行对应表
 */
export const HEAVENLY_STEM_ELEMENTS = {
  甲: WU_XING.WOOD,
  乙: WU_XING.WOOD,
  丙: WU_XING.FIRE,
  丁: WU_XING.FIRE,
  戊: WU_XING.EARTH,
  己: WU_XING.EARTH,
  庚: WU_XING.METAL,
  辛: WU_XING.METAL,
  壬: WU_XING.WATER,
  癸: WU_XING.WATER
}

/**
 * 地支五行对应表
 */
export const EARTHLY_BRANCH_ELEMENTS = {
  子: WU_XING.WATER,
  丑: WU_XING.EARTH,
  寅: WU_XING.WOOD,
  卯: WU_XING.WOOD,
  辰: WU_XING.EARTH,
  巳: WU_XING.FIRE,
  午: WU_XING.FIRE,
  未: WU_XING.EARTH,
  申: WU_XING.METAL,
  酉: WU_XING.METAL,
  戌: WU_XING.EARTH,
  亥: WU_XING.WATER
}

/**
 * 五行相生关系
 */
const ELEMENT_GENERATES = {
  [WU_XING.WOOD]: WU_XING.FIRE,
  [WU_XING.FIRE]: WU_XING.EARTH,
  [WU_XING.EARTH]: WU_XING.METAL,
  [WU_XING.METAL]: WU_XING.WATER,
  [WU_XING.WATER]: WU_XING.WOOD
}

/**
 * 五行相克关系
 */
const ELEMENT_RESTRICTS = {
  [WU_XING.WOOD]: WU_XING.EARTH,
  [WU_XING.FIRE]: WU_XING.METAL,
  [WU_XING.EARTH]: WU_XING.WATER,
  [WU_XING.METAL]: WU_XING.WOOD,
  [WU_XING.WATER]: WU_XING.FIRE
}

/**
 * 地支六合关系（相合为吉）
 */
export const BRANCH_LIU_HE = {
  子: '丑',
  丑: '子',
  寅: '亥',
  亥: '寅',
  卯: '戌',
  戌: '卯',
  辰: '酉',
  酉: '辰',
  巳: '申',
  申: '巳',
  午: '未',
  未: '午'
}

/**
 * 地支六冲关系（相冲为凶）
 */
export const BRANCH_LIU_CHONG = {
  子: '午',
  午: '子',
  丑: '未',
  未: '丑',
  寅: '申',
  申: '寅',
  卯: '酉',
  酉: '卯',
  辰: '戌',
  戌: '辰',
  巳: '亥',
  亥: '巳'
}

/**
 * 计算用户八字
 * @param {number} year - 出生年份
 * @param {number} month - 出生月份 (1-12)
 * @param {number} day - 出生日期 (1-31)
 * @param {number} hour - 出生小时 (0-23)
 * @returns {Object} 八字信息
 */
export function calculateBaZi(year, month, day, hour) {
  try {
    // 创建农历时辰对象
    const solarTime = SolarTime.fromYmdHms(year, month, day, hour, 0, 0)
    const lunarHour = solarTime.getLunarHour()
    const eightChar = lunarHour.getEightChar()

    // 获取四柱
    const yearPillar = eightChar.getYear()
    const monthPillar = eightChar.getMonth()
    const dayPillar = eightChar.getDay()
    const hourPillar = eightChar.getHour()

    return {
      year: {
        stem: yearPillar.getHeavenStem().getName(),
        branch: yearPillar.getEarthBranch().getName(),
        full: yearPillar.getName()
      },
      month: {
        stem: monthPillar.getHeavenStem().getName(),
        branch: monthPillar.getEarthBranch().getName(),
        full: monthPillar.getName()
      },
      day: {
        stem: dayPillar.getHeavenStem().getName(),
        branch: dayPillar.getEarthBranch().getName(),
        full: dayPillar.getName()
      },
      hour: {
        stem: hourPillar.getHeavenStem().getName(),
        branch: hourPillar.getEarthBranch().getName(),
        full: hourPillar.getName()
      },
      // 日主（日干）
      dayMaster: dayPillar.getHeavenStem().getName()
    }
  } catch (error) {
    console.error('计算八字失败:', error)
    return null
  }
}

/**
 * 计算五行强弱分布
 * @param {Object} bazi - 八字信息
 * @returns {Object} 五行分数
 */
export function calculateWuXingStrength(bazi) {
  if (!bazi) return null

  const scores = {
    [WU_XING.WOOD]: 0,
    [WU_XING.FIRE]: 0,
    [WU_XING.EARTH]: 0,
    [WU_XING.METAL]: 0,
    [WU_XING.WATER]: 0
  }

  // 计算四柱天干地支的五行
  const pillars = ['year', 'month', 'day', 'hour']
  pillars.forEach((pillar) => {
    const stem = bazi[pillar].stem
    const branch = bazi[pillar].branch

    // 天干权重更高
    if (HEAVENLY_STEM_ELEMENTS[stem]) {
      scores[HEAVENLY_STEM_ELEMENTS[stem]] += 3
    }

    // 地支
    if (EARTHLY_BRANCH_ELEMENTS[branch]) {
      scores[EARTHLY_BRANCH_ELEMENTS[branch]] += 2
    }
  })

  // 日柱（日主）权重最高，再加分
  const dayMasterElement = HEAVENLY_STEM_ELEMENTS[bazi.day.stem]
  if (dayMasterElement) {
    scores[dayMasterElement] += 5
  }

  return scores
}

/**
 * 确定喜用神（简化算法）
 * @param {Object} wuxingScores - 五行分数
 * @param {string} dayMaster - 日主天干
 * @returns {Object} 喜用神和忌神
 */
export function calculateUsefulGods(wuxingScores, dayMaster) {
  if (!wuxingScores || !dayMaster) return null

  const dayMasterElement = HEAVENLY_STEM_ELEMENTS[dayMaster]

  // 找出最弱和最强的五行
  const sortedElements = Object.entries(wuxingScores).sort((a, b) => b[1] - a[1])

  const strongest = sortedElements[0][0]
  const weakest = sortedElements[sortedElements.length - 1][0]

  // 简化规则：
  // 如果日主五行过强，喜克制（克我）和泄（我生）
  // 如果日主五行过弱，喜生助（生我）和同类
  const dayMasterScore = wuxingScores[dayMasterElement]
  const averageScore = Object.values(wuxingScores).reduce((a, b) => a + b, 0) / 5

  let favorable = []
  let unfavorable = []

  if (dayMasterScore > averageScore * 1.3) {
    // 日主偏强，喜泄克
    favorable.push(ELEMENT_GENERATES[dayMasterElement]) // 我生
    Object.entries(ELEMENT_RESTRICTS).forEach(([k, v]) => {
      if (v === dayMasterElement) favorable.push(k) // 克我
    })
    unfavorable.push(dayMasterElement) // 同类
    Object.entries(ELEMENT_GENERATES).forEach(([k, v]) => {
      if (v === dayMasterElement) unfavorable.push(k) // 生我
    })
  } else {
    // 日主偏弱，喜生助
    Object.entries(ELEMENT_GENERATES).forEach(([k, v]) => {
      if (v === dayMasterElement) favorable.push(k) // 生我
    })
    favorable.push(dayMasterElement) // 同类
    unfavorable.push(ELEMENT_RESTRICTS[dayMasterElement]) // 我克
    Object.entries(ELEMENT_RESTRICTS).forEach(([k, v]) => {
      if (v === dayMasterElement) unfavorable.push(k) // 克我
    })
  }

  return {
    favorable: [...new Set(favorable)],
    unfavorable: [...new Set(unfavorable)],
    usefulGod: favorable[0],
    avoidGod: unfavorable[0]
  }
}

/**
 * 获取当前时辰的八字信息
 * @param {Date} date - 目标日期时间
 * @returns {Object} 时辰八字
 */
export function getCurrentHourBazi(date = new Date()) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()

  try {
    const solarTime = SolarTime.fromYmdHms(year, month, day, hour, 0, 0)
    const lunarHour = solarTime.getLunarHour()
    const sixtyCycleHour = lunarHour.getSixtyCycleHour()

    return {
      stem: sixtyCycleHour.getSixtyCycle().getHeavenStem().getName(),
      branch: sixtyCycleHour.getSixtyCycle().getEarthBranch().getName(),
      full: sixtyCycleHour.getSixtyCycle().getName()
    }
  } catch (error) {
    console.error('获取当前时辰八字失败:', error)
    return null
  }
}

/**
 * 获取当前农历信息
 * @param {Date} date - 目标日期
 * @returns {Object} 农历信息
 */
export function getLunarInfo(date = new Date()) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  try {
    const solarDay = SolarDay.fromYmd(year, month, day)
    const lunarDay = solarDay.getLunarDay()
    const lunarMonth = lunarDay.getLunarMonth()
    const lunarYear = lunarMonth.getLunarYear()

    return {
      year: lunarYear.getYear(),
      yearName: lunarYear.getName(),
      month: lunarMonth.getMonth(),
      monthName: lunarMonth.getName(),
      day: lunarDay.getDay(),
      dayName: lunarDay.getName(),
      fullName: `${lunarYear.getName()}${lunarMonth.getName()}${lunarDay.getName()}`
    }
  } catch (error) {
    console.error('获取农历信息失败:', error)
    return null
  }
}

/**
 * 冲煞对应表
 */
const CLASH_MAP = {
  子: '午', // 鼠冲马
  丑: '未', // 牛冲羊
  寅: '申', // 虎冲猴
  卯: '酉', // 兔冲鸡
  辰: '戌', // 龙冲狗
  巳: '亥', // 蛇冲猪
  午: '子',
  未: '丑',
  申: '寅',
  酉: '卯',
  戌: '辰',
  亥: '巳'
}

/**
 * 桃花位对应表（简化：以日支或年支查）
 * 申子辰在酉，寅午戌在卯，巳酉丑在午，亥卯未在子
 */
const TAO_HUA_MAP = {
  申: '酉',
  子: '酉',
  辰: '酉',
  寅: '卯',
  午: '卯',
  戌: '卯',
  巳: '午',
  酉: '午',
  丑: '午',
  亥: '子',
  卯: '子',
  未: '子'
}

/**
 * 贵人对应表（天乙贵人 - 简化版）
 * 甲戊并牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸rabbit/snake，庚辛Tiger/Horse
 * 甲戊见丑未，乙己见子申，丙丁见亥酉，壬癸见卯巳，庚辛见寅午
 */
const GUI_REN_MAP = {
  甲: ['丑', '未'],
  戊: ['丑', '未'],
  乙: ['子', '申'],
  己: ['子', '申'],
  丙: ['亥', '酉'],
  丁: ['亥', '酉'],
  壬: ['卯', '巳'],
  癸: ['卯', '巳'],
  庚: ['寅', '午'],
  辛: ['寅', '午']
}

/**
 * 计算神煞与冲煞
 * @param {Object} userBazi - 用户八字
 * @param {Object} hourBazi - 时辰八字
 * @returns {Object} 神煞信息 { clashes: [], stars: [] }
 */
export function calculateShenSha(userBazi, hourBazi) {
  if (!userBazi || !hourBazi) return { clashes: [], stars: [] }

  const clashes = []
  const stars = []

  const hourBranch = hourBazi.branch
  const userYearBranch = userBazi.year.branch
  const userDayBranch = userBazi.day.branch
  const userDayMaster = userBazi.dayMaster // 日干
  const userYearStem = userBazi.year.stem // 年干 (部分神煞看年干)

  // 1. 冲煞 (以日支和年支为主)
  if (CLASH_MAP[userDayBranch] === hourBranch) {
    clashes.push({ name: '日破', desc: '时辰与日支相冲，运势动荡，不宜大事' })
  }
  if (CLASH_MAP[userYearBranch] === hourBranch) {
    clashes.push({ name: '岁破', desc: '时辰与年支相冲，长辈或外界压力大' })
  }

  // 2. 桃花 (以年支或日支查)
  if (TAO_HUA_MAP[userYearBranch] === hourBranch || TAO_HUA_MAP[userDayBranch] === hourBranch) {
    stars.push({ name: '桃花', desc: '人缘好，利社交、恋爱，但也易分心' })
  }

  // 3. 贵人 (以年干或日干查)
  const dayGuiRen = GUI_REN_MAP[userDayMaster] || []
  const yearGuiRen = GUI_REN_MAP[userYearStem] || []

  if (dayGuiRen.includes(hourBranch) || yearGuiRen.includes(hourBranch)) {
    stars.push({ name: '贵人', desc: '遇事呈祥，有贵人相助，逢凶化吉' })
  }

  // 4. 文昌 (以日干查) - 简化: 甲巳乙午丙戊申，丁己酉位庚亥寻，辛子壬寅癸卯位
  const WEN_CHANG_MAP = {
    甲: '巳',
    乙: '午',
    丙: '申',
    戊: '申',
    丁: '酉',
    己: '酉',
    庚: '亥',
    辛: '子',
    壬: '寅',
    癸: '卯'
  }
  if (WEN_CHANG_MAP[userDayMaster] === hourBranch) {
    stars.push({ name: '文昌', desc: '利于学习、考试、写作、思考' })
  }

  // 5. 驿马 (申子辰在寅，寅午戌在申，巳酉丑在亥，亥卯未在巳)
  const YI_MA_MAP = {
    申: '寅',
    子: '寅',
    辰: '寅',
    寅: '申',
    午: '申',
    戌: '申',
    巳: '亥',
    酉: '亥',
    丑: '亥',
    亥: '巳',
    卯: '巳',
    未: '巳'
  }
  if (YI_MA_MAP[userYearBranch] === hourBranch || YI_MA_MAP[userDayBranch] === hourBranch) {
    stars.push({ name: '驿马', desc: '奔波走动，利于出行、出差、变动' })
  }

  return { clashes, stars }
}

/**
 * 计算时辰能量分数 V2（基于五行生克 + 日柱影响）
 * @param {Object} userBazi - 用户八字
 * @param {Object} userGods - 用户喜忌神
 * @param {Object} dayBazi - 当日八字（日柱）
 * @param {Object} hourBazi - 时辰八字
 * @param {boolean} debug - 是否输出调试日志
 * @returns {number} 能量分数 (20-95)
 */
export function calculateHourEnergy(userBazi, userGods, dayBazi, hourBazi, debug = false) {
  if (!userBazi || !hourBazi || !userGods) {
    return 50 // 默认中等能量
  }

  // V1兼容：如果只传了3个参数，使用旧算法
  if (!dayBazi && hourBazi) {
    return calculateHourEnergyLegacy(userBazi, userGods, hourBazi)
  }

  let score = 50 // 基础分数
  const debugInfo = []

  const dayMaster = userBazi.day.stem
  const dayMasterElement = HEAVENLY_STEM_ELEMENTS[dayMaster]

  // ==================== 1. 日柱影响（核心新增，权重最高）====================
  if (dayBazi) {
    const dayStem = dayBazi.day.stem
    const dayBranch = dayBazi.day.branch
    const dayStemElement = HEAVENLY_STEM_ELEMENTS[dayStem]

    // 1.1 日柱天干 vs 用户日主（最核心）
    if (ELEMENT_GENERATES[dayStemElement] === dayMasterElement) {
      score += 18 // 日柱生助日主，大吉
      debugInfo.push(`日柱${dayStem}生助日主+18`)
    } else if (dayStemElement === dayMasterElement) {
      score += 12 // 日柱同类，吉
      debugInfo.push(`日柱${dayStem}同类+12`)
    } else if (ELEMENT_RESTRICTS[dayStemElement] === dayMasterElement) {
      score -= 15 // 日柱克制日主，凶
      debugInfo.push(`日柱${dayStem}克日主-15`)
    } else if (ELEMENT_RESTRICTS[dayMasterElement] === dayStemElement) {
      score -= 8 // 日柱被日主克，小凶
      debugInfo.push(`日柱${dayStem}被克-8`)
    }

    // 1.2 日柱地支与用户八字地支关系（六合/六冲）
    const userDayBranch = userBazi.day.branch
    if (BRANCH_LIU_HE[userDayBranch] === dayBranch) {
      score += 10 // 六合，吉
      debugInfo.push(`日柱地支六合+10`)
    } else if (BRANCH_LIU_CHONG[userDayBranch] === dayBranch) {
      score -= 12 // 六冲，凶
      debugInfo.push(`日柱地支六冲-12`)
    }

    // 1.3 日柱天干与喜忌神
    if (userGods.favorable.includes(dayStemElement)) {
      score += 10
      debugInfo.push(`日柱天干喜神+10`)
    } else if (userGods.unfavorable.includes(dayStemElement)) {
      score -= 10
      debugInfo.push(`日柱天干忌神-10`)
    }
  }

  // ==================== 2. 时辰影响（V1逻辑优化）====================
  const hourStem = hourBazi.stem
  const hourBranch = hourBazi.branch
  const hourStemElement = HEAVENLY_STEM_ELEMENTS[hourStem]
  const hourBranchElement = EARTHLY_BRANCH_ELEMENTS[hourBranch]

  // 2.1 时辰天干与喜用神关系（降低权重，避免过度影响）
  if (userGods.favorable.includes(hourStemElement)) {
    score += 12
    debugInfo.push(`时辰喜神+12`)
  } else if (userGods.unfavorable.includes(hourStemElement)) {
    score -= 12
    debugInfo.push(`时辰忌神-12`)
  }

  // 2.2 时辰地支与喜用神关系
  if (userGods.favorable.includes(hourBranchElement)) {
    score += 8
    debugInfo.push(`时辰地支喜神+8`)
  } else if (userGods.unfavorable.includes(hourBranchElement)) {
    score -= 8
    debugInfo.push(`时辰地支忌神-8`)
  }

  // 2.3 时辰生助日主
  if (ELEMENT_GENERATES[hourStemElement] === dayMasterElement) {
    score += 8
    debugInfo.push(`时辰生助+8`)
  }

  // 2.4 时辰与日主同类
  if (hourStemElement === dayMasterElement) {
    score += 5
    debugInfo.push(`时辰同类+5`)
  }

  // 2.5 时辰克日主
  if (ELEMENT_RESTRICTS[hourStemElement] === dayMasterElement) {
    score -= 10
    debugInfo.push(`时辰克日主-10`)
  }

  // 2.6 时辰地支与用户日柱地支关系
  if (dayBazi) {
    const dayBranch = dayBazi.day.branch
    if (BRANCH_LIU_HE[dayBranch] === hourBranch) {
      score += 8 // 时辰与当日地支合
      debugInfo.push(`时辰合日支+8`)
    } else if (BRANCH_LIU_CHONG[dayBranch] === hourBranch) {
      score -= 10 // 时辰与当日地支冲
      debugInfo.push(`时辰冲日支-10`)
    }
  }

  // ==================== 3. 神煞影响 ====================
  const shenSha = calculateShenSha(userBazi, hourBazi)

  // 贵人加分
  if (shenSha.stars.some((s) => s.name === '贵人')) {
    score += 8
    debugInfo.push(`贵人+8`)
  }
  // 文昌加分
  if (shenSha.stars.some((s) => s.name === '文昌')) {
    score += 5
    debugInfo.push(`文昌+5`)
  }
  // 桃花微加分
  if (shenSha.stars.some((s) => s.name === '桃花')) {
    score += 3
    debugInfo.push(`桃花+3`)
  }

  // 冲煞减分
  if (shenSha.clashes.length > 0) {
    score -= 12
    debugInfo.push(`冲煞-12`)
  }

  // ==================== 4. 分数限制与输出 ====================
  // 限制在 20-95 范围内（避免极端值）
  const finalScore = Math.max(20, Math.min(95, score))

  if (debug) {
    console.log(
      `[能量计算] ${dayBazi?.day?.full || '未知'} ${hourBazi.full}: ${finalScore}分`,
      debugInfo
    )
  }

  return finalScore
}

/**
 * V1 旧版算法（兼容保留）
 */
function calculateHourEnergyLegacy(userBazi, userGods, hourBazi) {
  if (!userBazi || !hourBazi || !userGods) {
    return 50
  }

  let score = 50

  const hourStem = hourBazi.stem
  const hourBranch = hourBazi.branch
  const hourStemElement = HEAVENLY_STEM_ELEMENTS[hourStem]
  const hourBranchElement = EARTHLY_BRANCH_ELEMENTS[hourBranch]

  const dayMaster = userBazi.day.stem
  const dayMasterElement = HEAVENLY_STEM_ELEMENTS[dayMaster]

  // 喜用神
  if (userGods.favorable.includes(hourStemElement)) score += 20
  else if (userGods.unfavorable.includes(hourStemElement)) score -= 20

  if (userGods.favorable.includes(hourBranchElement)) score += 15
  else if (userGods.unfavorable.includes(hourBranchElement)) score -= 15

  // 生克关系
  if (ELEMENT_GENERATES[hourStemElement] === dayMasterElement) score += 10
  if (hourStemElement === dayMasterElement) score += 5
  if (ELEMENT_RESTRICTS[hourStemElement] === dayMasterElement) score -= 15

  // 神煞
  const shenSha = calculateShenSha(userBazi, hourBazi)
  if (shenSha.stars.some((s) => s.name === '贵人')) score += 10
  if (shenSha.stars.some((s) => s.name === '文昌')) score += 5
  if (shenSha.clashes.length > 0) score -= 15

  return Math.max(0, Math.min(100, score))
}

/**
 * 根据五行获取对应的推荐活动
 */
export function getActivitiesByElement(element) {
  const activities = {
    [WU_XING.WOOD]: ['创意工作', '策划', '学习', '社交活动', '户外运动'],
    [WU_XING.FIRE]: ['公开演讲', '签约', '谈判', '社交聚会', '启动项目'],
    [WU_XING.EARTH]: ['理财', '投资决策', '房产事务', '稳健工作', '整理归纳'],
    [WU_XING.METAL]: ['决策', '执行', '完成任务', '法律事务', '精细工作'],
    [WU_XING.WATER]: ['思考', '冥想', '研究', '写作', '休息调养']
  }

  return activities[element] || []
}

/**
 * 根据五行获取对应的避免活动
 */
export function getAvoidActivitiesByElement(element) {
  const avoidActivities = {
    [WU_XING.WOOD]: ['重大决策', '签约', '手术'],
    [WU_XING.FIRE]: ['冲突对抗', '情绪化决定', '投机冒险'],
    [WU_XING.EARTH]: ['急躁决定', '剧烈运动', '冒险活动'],
    [WU_XING.METAL]: ['感情交流', '创意工作', '放松娱乐'],
    [WU_XING.WATER]: ['启动新项目', '公开活动', '签约']
  }

  return avoidActivities[element] || []
}

/**
 * 获取每日黄历宜忌信息
 * @param {Date} date - 目标日期
 * @returns {Object} 宜忌信息 { recommends: [], avoids: [] }
 */
export function getAlmanacInfo(date = new Date()) {
  try {
    const solarDay = SolarDay.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate())
    const sixtyCycleDay = solarDay.getSixtyCycleDay()

    // 获取宜做的事情
    const recommends = sixtyCycleDay.getRecommends().map((item) => ({
      name: item.getName(),
      icon: getActivityIcon(item.getName())
    }))

    // 获取忌做的事情
    const avoids = sixtyCycleDay.getAvoids().map((item) => ({
      name: item.getName(),
      icon: getActivityIcon(item.getName())
    }))

    return {
      recommends: recommends.slice(0, 5), // 最多显示5个
      avoids: avoids.slice(0, 5)
    }
  } catch (error) {
    console.error('获取黄历信息失败:', error)
    return { recommends: [], avoids: [] }
  }
}

/**
 * 获取节气信息
 * @param {Date} date - 目标日期
 * @returns {Object} 节气信息 { current: string, next: string, daysUntil: number }
 */
export function getTermInfo(date = new Date()) {
  try {
    const solarDay = SolarDay.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate())

    // 当前节气
    const currentTerm = solarDay.getTerm()
    const current = currentTerm ? currentTerm.getName() : null

    // 下一节气 - 通过遍历查找
    let next = null
    let daysUntil = 0

    if (currentTerm) {
      // 获取下一个节气
      const nextTerm = currentTerm.next(1)
      if (nextTerm) {
        next = nextTerm.getName()
        // 计算天数差
        const nextTermSolarDay = nextTerm.getSolarDay()
        if (nextTermSolarDay) {
          daysUntil = nextTermSolarDay.subtract(solarDay)
        }
      }
    }

    return {
      current,
      next,
      daysUntil
    }
  } catch (error) {
    console.error('获取节气信息失败:', error)
    return { current: null, next: null, daysUntil: 0 }
  }
}

/**
 * 获取节日信息
 * @param {Date} date - 目标日期
 * @returns {Object} 节日信息 { festivals: [], isHoliday: boolean }
 */
export function getFestivalInfo(date = new Date()) {
  try {
    const solarDay = SolarDay.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate())
    const lunarDay = solarDay.getLunarDay()

    const festivals = []

    // 获取农历节日（单数）
    const lunarFestival = lunarDay.getFestival()
    if (lunarFestival) {
      festivals.push(lunarFestival.getName())
    }

    // 获取公历节日（单数）
    const solarFestival = solarDay.getFestival()
    if (solarFestival) {
      festivals.push(solarFestival.getName())
    }

    // 中国传统节日列表
    const traditionalFestivals = [
      '春节',
      '元宵',
      '端午',
      '七夕',
      '中元',
      '中秋',
      '重阳',
      '腊八',
      '除夕'
    ]
    const isTraditional = festivals.some((f) => traditionalFestivals.some((tf) => f.includes(tf)))

    return {
      festivals,
      isTraditional,
      hasFestival: festivals.length > 0
    }
  } catch (error) {
    console.error('获取节日信息失败:', error)
    return { festivals: [], isTraditional: false, hasFestival: false }
  }
}

/**
 * 获取活动对应的 emoji 图标
 * @param {string} activityName - 活动名称
 * @returns {string} emoji 图标
 */
function getActivityIcon(activityName) {
  const iconMap = {
    嫁娶: '💒',
    祭祀: '🕯️',
    祈福: '🙏',
    求嗣: '👶',
    出行: '✈️',
    交易: '💰',
    立券: '📜',
    动土: '🚧',
    安床: '🛏️',
    破土: '⛏️',
    安葬: '⚰️',
    修造: '🔨',
    拆卸: '🏚️',
    起基: '🏗️',
    入宅: '🏠',
    移徙: '🚚',
    纳采: '💍',
    问名: '📋',
    纳婿: '🤵',
    归宁: '👰',
    冠笄: '👑',
    进人口: '👨‍👩‍👧‍👦',
    入学: '🎓',
    沐浴: '🛁',
    裁衣: '👕',
    结网: '🕸️',
    取渔: '🎣',
    捕捉: '🎯',
    畋猎: '🏹',
    纳畜: '🐄',
    牧养: '🐑',
    开渠: '🌊',
    放水: '💧',
    修坟: '🪦',
    除服: '⚪',
    成服: '⚫',
    移柩: '⚰️',
    启钻: '💎',
    谢土: '🙇',
    斋醮: '📿',
    开仓: '🏚️',
    出货财: '💵',
    经络: '🧵',
    酝酿: '🍶',
    伐木: '🪵',
    栽种: '🌱',
    会亲友: '👥',
    竖柱: '🏛️',
    上梁: '🏗️',
    纳财: '💵',
    赴任: '💼',
    词讼: '⚖️',
    补垣: '🧱',
    塞穴: '🕳️',
    筑堤: '🏔️',
    修饰垣墙: '🎨',
    平治道涂: '🛣️',
    整手足甲: '💅',
    求医: '🏥',
    治病: '💊',
    安机械: '⚙️',
    造车器: '🚗',
    掘井: '⛏️',
    开柱眼: '👁️',
    造桥: '🌉',
    作厕: '🚽',
    造仓: '🏚️',
    造畜稠: '🐷',
    教牛马: '🐂',
    造屋: '🏠',
    合帐: '🛏️',
    开厕: '🚪',
    断蚁: '🐜'
  }

  return iconMap[activityName] || '•'
}

/**
 * 获取节气对应的 emoji 图标
 * @param {string} termName - 节气名称
 * @returns {string} emoji 图标
 */
export function getTermIcon(termName) {
  const termIconMap = {
    立春: '🌱',
    雨水: '🌧️',
    惊蛰: '🐛',
    春分: '🌸',
    清明: '🌿',
    谷雨: '🌾',
    立夏: '☀️',
    小满: '🌾',
    芒种: '🌾',
    夏至: '☀️',
    小暑: '🌞',
    大暑: '🔥',
    立秋: '🍂',
    处暑: '🍃',
    白露: '💧',
    秋分: '🍁',
    寒露: '🌾',
    霜降: '❄️',
    立冬: '🧥',
    小雪: '❄️',
    大雪: '☃️',
    冬至: '🧣',
    小寒: '❄️',
    大寒: '🥶'
  }

  return termIconMap[termName] || '🌤️'
}
