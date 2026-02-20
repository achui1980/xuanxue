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
 * 地支三合局 (能量 +8)
 * 申子辰合水, 寅午戌合火, 巳酉丑合金, 亥卯未合木
 */
export const SAN_HE = [
  ['申', '子', '辰'],
  ['寅', '午', '戌'],
  ['巳', '酉', '丑'],
  ['亥', '卯', '未']
]

/**
 * 地支三会局 (能量 +8)
 * 寅卯辰会木, 巳午未会火, 申酉戌会金, 亥子丑会水
 */
export const SAN_HUI = [
  ['寅', '卯', '辰'],
  ['巳', '午', '未'],
  ['申', '酉', '戌'],
  ['亥', '子', '丑']
]

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
 * 天乙贵人表 (以年干或日干查)
 * 甲戊并牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸蛇兔藏，庚辛逢虎马
 */
const TIAN_YI_MAP = {
  甲: ['丑', '未'],
  戊: ['丑', '未'],
  乙: ['子', '申'],
  己: ['子', '申'],
  丙: ['亥', '酉'],
  丁: ['亥', '酉'],
  壬: ['巳', '卯'],
  癸: ['巳', '卯'],
  庚: ['寅', '午'],
  辛: ['寅', '午']
}

/**
 * 太极贵人表 (以年干 or 日干查)
 * 甲乙生人子午中，丙丁鸡兔定亨通，戊己两干临四季，庚辛寅亥禄丰隆，壬癸巳申偏喜用
 */
const TAI_JI_MAP = {
  甲: ['子', '午'],
  乙: ['子', '午'],
  丙: ['酉', '卯'],
  丁: ['酉', '卯'],
  戊: ['辰', '戌', '丑', '未'],
  己: ['辰', '戌', '丑', '未'],
  庚: ['寅', '亥'],
  辛: ['寅', '亥'],
  壬: ['巳', '申'],
  癸: ['巳', '申']
}

/**
 * 文昌贵人表 (以日干查)
 * 甲巳乙午丙戊申，丁己酉位庚亥寻，辛子壬寅癸卯位
 */
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

/**
 * 羊刃表 (以日干查)
 * 甲卯乙辰丙戊午，丁己未庚酉辛戌，壬子癸丑
 */
const YANG_REN_MAP = {
  甲: '卯',
  乙: '辰',
  丙: '午',
  戊: '午',
  丁: '未',
  己: '未',
  庚: '酉',
  辛: '戌',
  壬: '子',
  癸: '丑'
}

/**
 * 金舆表 (以日干查 - 禄前二位)
 * 甲龙乙蛇丙戊羊，丁己猴歌庚犬方，辛猪壬牛癸虎地
 */
const JIN_YU_MAP = {
  甲: '辰',
  乙: '巳',
  丙: '未',
  戊: '未',
  丁: '申',
  己: '申',
  庚: '戌',
  辛: '亥',
  壬: '丑',
  癸: '寅'
}

/**
 * 红鸾天喜表 (以年支查)
 * 鼠:红鸾卯/天喜酉, 牛:寅/申, 虎:丑/未...
 * 公式: 红鸾 = 卯逆数至年支 (子->卯, 丑->寅, 寅->丑, 卯->子, 辰->亥, 巳->戌, 午->酉, 未->申, 申->未, 酉->午, 戌->巳, 亥->辰)
 * 天喜 = 红鸾对冲
 */
const HONG_LUAN_MAP = {
  子: '卯',
  丑: '寅',
  寅: '丑',
  卯: '子',
  辰: '亥',
  巳: '戌',
  午: '酉',
  未: '申',
  申: '未',
  酉: '午',
  戌: '巳',
  亥: '辰'
}

/**
 * 劫煞表 (以年支或日支查)
 * 申子辰在巳，寅午戌在亥，巳酉丑在寅，亥卯未在申
 */
const JIE_SHA_MAP = {
  申: '巳',
  子: '巳',
  辰: '巳',
  寅: '亥',
  午: '亥',
  戌: '亥',
  巳: '寅',
  酉: '寅',
  丑: '寅',
  亥: '申',
  卯: '申',
  未: '申'
}

/**
 * 孤辰寡宿表 (以年支查)
 * 亥子丑: 寅孤/戌寡
 * 寅卯辰: 巳孤/丑寡
 * 巳午未: 申孤/辰寡
 * 申酉戌: 亥孤/未寡
 */
const GU_GUA_MAP = {
  亥: { gu: '寅', gua: '戌' },
  子: { gu: '寅', gua: '戌' },
  丑: { gu: '寅', gua: '戌' },
  寅: { gu: '巳', gua: '丑' },
  卯: { gu: '巳', gua: '丑' },
  辰: { gu: '巳', gua: '丑' },
  巳: { gu: '申', gua: '辰' },
  午: { gu: '申', gua: '辰' },
  未: { gu: '申', gua: '辰' },
  申: { gu: '亥', gua: '未' },
  酉: { gu: '亥', gua: '未' },
  戌: { gu: '亥', gua: '未' }
}

/**
 * 驿马表 (以年支或日支查)
 */
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

/**
 * V2.0 模块化计算函数：日柱影响
 */
export function calculateDayImpact(userBazi, dayPillar) {
  let score = 0
  const reasons = []

  const userDayMaster = userBazi.day.stem
  const userDayBranch = userBazi.day.branch
  const dayStem = dayPillar.stem
  const dayBranch = dayPillar.branch

  const userElement = HEAVENLY_STEM_ELEMENTS[userDayMaster]
  const dayElement = HEAVENLY_STEM_ELEMENTS[dayStem]

  // 1. 日柱天干 vs 日主 (±12)
  if (ELEMENT_GENERATES[dayElement] === userElement) {
    score += 15 // 提升权重
    reasons.push('得天时生助，能量源源不断')
  } else if (dayElement === userElement) {
    score += 10 // 提升权重
    reasons.push('得天时助力，气场稳固')
  } else if (ELEMENT_RESTRICTS[dayElement] === userElement) {
    score -= 8 // 降低扣分
    reasons.push('天时稍有克制，需稳扎稳打')
  } else if (ELEMENT_GENERATES[userElement] === dayElement) {
    score -= 5
    reasons.push('天时消耗精力，注意休息')
  }

  // 2. 日柱地支 vs 用户日支 (六合/六冲 ±10)
  if (BRANCH_LIU_HE[userDayBranch] === dayBranch) {
    score += 12 // 提升权重
    reasons.push('地利相合，行事顺畅')
  } else if (BRANCH_LIU_CHONG[userDayBranch] === dayBranch) {
    score -= 10 // 降低扣分
    reasons.push('地利相冲，变动较多')
  }

  // 3. 日柱地支 vs 用户年支 (六合/六冲 ±6)
  if (BRANCH_LIU_HE[userBazi.year.branch] === dayBranch) {
    score += 8 // 提升权重
    reasons.push('年支相合，根基稳固')
  } else if (BRANCH_LIU_CHONG[userBazi.year.branch] === dayBranch) {
    score -= 6 // 降低扣分
    reasons.push('年支相冲，长辈或外界压力')
  }

  return { score, reasons }
}

/**
 * V2.0 模块化计算函数：时辰影响
 */
export function calculateHourImpact(userBazi, dayPillar, hourPillar) {
  let score = 0
  const reasons = []

  const userDayMaster = userBazi.day.stem
  const userDayBranch = userBazi.day.branch
  const hourStem = hourPillar.stem
  const hourBranch = hourPillar.branch
  const dayBranch = dayPillar.branch

  const userElement = HEAVENLY_STEM_ELEMENTS[userDayMaster]
  const hourElement = HEAVENLY_STEM_ELEMENTS[hourStem]

  // 1. 时辰天干 vs 日主 (±10)
  if (ELEMENT_GENERATES[hourElement] === userElement) {
    score += 12 // 提升权重
    reasons.push('时运生助，效率倍增')
  } else if (hourElement === userElement) {
    score += 8 // 提升权重
    reasons.push('时运相辅，得心应手')
  } else if (ELEMENT_RESTRICTS[hourElement] === userElement) {
    score -= 6 // 降低扣分
    reasons.push('时运受阻，宜守不宜攻')
  }

  // 2. 时辰地支 vs 用户日支 (六合/六冲 ±8)
  if (BRANCH_LIU_HE[userDayBranch] === hourBranch) {
    score += 10 // 提升权重
    reasons.push('时支六合，人和事顺')
  } else if (BRANCH_LIU_CHONG[userDayBranch] === hourBranch) {
    score -= 8 // 降低扣分
    reasons.push('时支相冲，多生变数')
  }

  // 3. 时辰地支 vs 日柱地支 (六合/六冲 ±6)
  if (BRANCH_LIU_HE[dayBranch] === hourBranch) {
    score += 8 // 提升权重
    reasons.push('日时相合，气场和谐')
  } else if (BRANCH_LIU_CHONG[dayBranch] === hourBranch) {
    score -= 6 // 降低扣分
    reasons.push('日时相冲，易有波折')
  }

  // 4. 时辰地支 vs 用户年支 (冲煞 -8)
  if (BRANCH_LIU_CHONG[userBazi.year.branch] === hourBranch) {
    score -= 6 // 降低扣分
    reasons.push('岁破临门，谨言慎行')
  }

  return { score, reasons }
}

/**
 * V2.0 模块化计算函数：神煞影响
 */
export function calculateShenShaImpact(userBazi, hourPillar) {
  let score = 0
  const reasons = []
  const stars = []
  const clashes = []

  const hourBranch = hourPillar.branch
  const userDayMaster = userBazi.day.stem
  const userDayBranch = userBazi.day.branch
  const userYearBranch = userBazi.year.branch
  const userYearStem = userBazi.year.stem

  // 1. 贵人 (天乙贵人) +10
  const guiRenBranches = TIAN_YI_MAP[userDayMaster] || []
  const yearGuiRenBranches = TIAN_YI_MAP[userYearStem] || []
  if (guiRenBranches.includes(hourBranch) || yearGuiRenBranches.includes(hourBranch)) {
    score += 18 // 提升权重 (原+10)
    reasons.push('天乙贵人照临，遇事呈祥')
    stars.push({ name: '天乙贵人', desc: '遇事呈祥，有贵人相助' })
  }

  // 2. 文昌 +6
  if (WEN_CHANG_MAP[userDayMaster] === hourBranch) {
    score += 10 // 提升权重 (原+6)
    reasons.push('文昌星临，思如泉涌')
    stars.push({ name: '文昌贵人', desc: '利于学习、考试、写作' })
  }

  // 3. 桃花 +3
  if (TAO_HUA_MAP[userDayBranch] === hourBranch || TAO_HUA_MAP[userYearBranch] === hourBranch) {
    score += 5 // 提升权重 (原+3)
    reasons.push('桃花星动，人缘极佳')
    stars.push({ name: '桃花', desc: '人缘好，利社交、恋爱' })
  }

  // 4. 驿马 +2
  if (YI_MA_MAP[userDayBranch] === hourBranch || YI_MA_MAP[userYearBranch] === hourBranch) {
    score += 3 // 提升权重 (原+2)
    reasons.push('驿马星动，利于出行')
    stars.push({ name: '驿马', desc: '利于出行、变动' })
  }

  // 5. 冲煞 -15 (日破/岁破)
  // 注意：calculateHourImpact 已经计算了冲的五行分，这里是神煞层面的额外减分
  if (BRANCH_LIU_CHONG[userDayBranch] === hourBranch) {
    score -= 10 // 降低扣分 (原-15)
    reasons.push('日破大耗，诸事宜静')
    clashes.push({ name: '日破', desc: '运势动荡，不宜大事' })
  }
  if (BRANCH_LIU_CHONG[userYearBranch] === hourBranch) {
    score -= 8 // 降低扣分 (原-12)
    reasons.push('岁破临门，谨言慎行')
    clashes.push({ name: '岁破', desc: '长辈或外界压力大' })
  }
  
  // 去重
  const uniqueStars = stars.filter((s, i, self) => i === self.findIndex(t => t.name === s.name))
  const uniqueClashes = clashes.filter((c, i, self) => i === self.findIndex(t => t.name === c.name))

  return { score, reasons, stars: uniqueStars, clashes: uniqueClashes }
}

/**
 * V2.0 模块化计算函数：特殊组合
 */
export function calculateSpecialCombo(userBazi, dayPillar, hourPillar) {
  let score = 0
  const reasons = []

  const dayBranch = dayPillar.branch
  const hourBranch = hourPillar.branch
  const userDayBranch = userBazi.day.branch
  const monthBranch = userBazi.month.branch

  // 1. 双合 (日柱和时辰都与命主日支相合) +10
  if (BRANCH_LIU_HE[userDayBranch] === dayBranch && BRANCH_LIU_HE[userDayBranch] === hourBranch) {
    score += 10
    reasons.push('日柱与时辰双合命主日支，大吉')
  }

  // 2. 双冲 (日柱和时辰都与命主日支相冲) -12
  if (BRANCH_LIU_CHONG[userDayBranch] === dayBranch && BRANCH_LIU_CHONG[userDayBranch] === hourBranch) {
    score -= 12
    reasons.push('日柱与时辰双冲命主日支，大凶')
  }

  // 3. 日柱与时辰相合 +5 (已在 hourImpact 计算过地支六合，这里可视为额外加成)
  if (BRANCH_LIU_HE[dayBranch] === hourBranch) {
    score += 5
    reasons.push('日时双合')
  }

  // 4. 三合局检查 (日支+时支+月支)
  const branches = [dayBranch, hourBranch, monthBranch]
  const isSanHe = SAN_HE.some(group => group.every(b => branches.includes(b)))
  if (isSanHe) {
    score += 8
    reasons.push('地支三合局成，能量强旺')
  }
  
  // 5. 三会局检查
  const isSanHui = SAN_HUI.some(group => group.every(b => branches.includes(b)))
  if (isSanHui) {
    score += 8
    reasons.push('地支三会局成，气势宏大')
  }

  return { score, reasons }
}

/**
 * 获取能量等级
 */
export function getEnergyLevel(score) {
  if (score >= 85) return { level: '大吉', color: 'green' }
  if (score >= 70) return { level: '吉', color: 'light-green' }
  if (score >= 45) return { level: '平', color: 'yellow' } // 阈值调整：60->45 (更友好)
  if (score >= 25) return { level: '凶', color: 'orange' } // 阈值调整：40->25 (更友好)
  return { level: '大凶', color: 'red' }
}

/**
 * V2.0 主计算入口
 * @param {Object} userBazi - 用户八字
 * @param {Object} userGods - 用户喜用神
 * @param {Date} queryDate - 查询时间
 */
export function calculateHourEnergyV2(userBazi, userGods, queryDate) {
  // 1. 获取查询日期的日柱和时辰柱
  // 注意：calculateBaZi 可能会失败，需要容错
  const dayPillarInfo = calculateBaZi(queryDate.getFullYear(), queryDate.getMonth() + 1, queryDate.getDate(), 12)
  const hourPillarInfo = getCurrentHourBazi(queryDate)
  
  if (!dayPillarInfo || !hourPillarInfo) {
    return { score: 50, level: '平', reasons: [], shenSha: [], clashes: [] }
  }
  
  // 提取由于计算函数需要的结构 (calculateBaZi 返回的是完整结构，我们只需要日柱)
  const dayPillar = dayPillarInfo.day
  const hourPillar = hourPillarInfo

  // 2. 基础分
  let score = 60 // 基础分提升至60 (原50)
  const allReasons = []
  
  // 3. 日柱影响 (±25)
  const dayImpact = calculateDayImpact(userBazi, dayPillar)
  score += dayImpact.score
  allReasons.push(...dayImpact.reasons)

  // 4. 时辰影响 (±20)
  const hourImpact = calculateHourImpact(userBazi, dayPillar, hourPillar)
  score += hourImpact.score
  allReasons.push(...hourImpact.reasons)

  // 5. 神煞影响 (±15)
  const shenShaImpact = calculateShenShaImpact(userBazi, hourPillar)
  score += shenShaImpact.score
  allReasons.push(...shenShaImpact.reasons)

  // 6. 特殊组合 (±10)
  const comboImpact = calculateSpecialCombo(userBazi, dayPillar, hourPillar)
  score += comboImpact.score
  allReasons.push(...comboImpact.reasons)

  // 7. 分数限制与等级判定
  score = Math.max(20, Math.min(95, score))
  const levelInfo = getEnergyLevel(score)

  return {
    score,
    level: levelInfo.level,
    reasons: allReasons.join('；'),
    shenSha: shenShaImpact.stars,
    clashes: shenShaImpact.clashes
  }
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
  const userYearStem = userBazi.year.stem // 年干

  // === 凶煞部分 ===

  // 1. 冲煞 (以日支和年支为主)
  if (CLASH_MAP[userDayBranch] === hourBranch) {
    clashes.push({ name: '日破', desc: '日支相冲，运势动荡，不宜大事' })
  }
  if (CLASH_MAP[userYearBranch] === hourBranch) {
    clashes.push({ name: '岁破', desc: '年支相冲，长辈或外界压力大' })
  }

  // 2. 劫煞 (以年支或日支查)
  if (JIE_SHA_MAP[userYearBranch] === hourBranch || JIE_SHA_MAP[userDayBranch] === hourBranch) {
    clashes.push({ name: '劫煞', desc: '易破财、生波折，需谨慎行事' })
  }

  // 3. 孤辰/寡宿 (以年支查)
  const guGua = GU_GUA_MAP[userYearBranch]
  if (guGua) {
    if (guGua.gu === hourBranch) {
      clashes.push({ name: '孤辰', desc: '孤独感强，不利社交' })
    }
    if (guGua.gua === hourBranch) {
      clashes.push({ name: '寡宿', desc: '内心孤僻，易离群索居' })
    }
  }

  // 4. 羊刃 (以日干查)
  if (YANG_REN_MAP[userDayMaster] === hourBranch) {
    // 羊刃喜忌看身强弱，此处暂作为中性/凶煞提示
    clashes.push({ name: '羊刃', desc: '性情刚烈，易冲动或受伤' })
  }

  // === 吉神部分 ===

  // 1. 天乙贵人 (以年干或日干查)
  const dayGuiRen = TIAN_YI_MAP[userDayMaster] || []
  const yearGuiRen = TIAN_YI_MAP[userYearStem] || []
  if (dayGuiRen.includes(hourBranch) || yearGuiRen.includes(hourBranch)) {
    stars.push({ name: '天乙贵人', desc: '最强吉星，遇事呈祥，逢凶化吉' })
  }

  // 2. 太极贵人 (以年干或日干查)
  const dayTaiJi = TAI_JI_MAP[userDayMaster] || []
  const yearTaiJi = TAI_JI_MAP[userYearStem] || []
  if (dayTaiJi.includes(hourBranch) || yearTaiJi.includes(hourBranch)) {
    stars.push({ name: '太极贵人', desc: '利于思考、玄学、钻研' })
  }

  // 3. 文昌贵人 (以日干查)
  if (WEN_CHANG_MAP[userDayMaster] === hourBranch) {
    stars.push({ name: '文昌贵人', desc: '利于学习、考试、写作、策划' })
  }

  // 4. 金舆 (以日干查)
  if (JIN_YU_MAP[userDayMaster] === hourBranch) {
    stars.push({ name: '金舆', desc: '财运佳，出行顺利，得交通之利' })
  }

  // 5. 桃花 (以年支或日支查)
  if (TAO_HUA_MAP[userYearBranch] === hourBranch || TAO_HUA_MAP[userDayBranch] === hourBranch) {
    stars.push({ name: '桃花', desc: '人缘好，利社交、恋爱，但也易分心' })
  }

  // 6. 红鸾/天喜 (以年支查)
  const hongLuan = HONG_LUAN_MAP[userYearBranch]
  const tianXi = CLASH_MAP[hongLuan] // 天喜是红鸾的对冲
  if (hourBranch === hongLuan) {
    stars.push({ name: '红鸾', desc: '主婚恋喜庆，异性缘极佳' })
  }
  if (hourBranch === tianXi) {
    stars.push({ name: '天喜', desc: '主开心之事，消灾解难' })
  }

  // 7. 驿马 (以年支或日支查)
  if (YI_MA_MAP[userYearBranch] === hourBranch || YI_MA_MAP[userDayBranch] === hourBranch) {
    stars.push({ name: '驿马', desc: '奔波走动，利于出行、出差、变动' })
  }

  // 8. 魁罡 (日柱判断，此处是时辰判断，仅作参考，或判断流日/流时是否也是魁罡)
  // 严格来说魁罡是日柱神煞。如果时柱也是魁罡 (庚辰/庚戌/壬辰/戊戌)，可视为一种性格/能量加持
  const KUI_GANG_LIST = ['庚辰', '庚戌', '壬辰', '戊戌']
  if (KUI_GANG_LIST.includes(hourBazi.full)) {
     stars.push({ name: '魁罡', desc: '性格刚烈，掌权，聪敏' })
  }

  // 去重 (防止年日查到同一个)
  const uniqueStars = stars.filter((star, index, self) =>
    index === self.findIndex((t) => t.name === star.name)
  )

  return { clashes, stars: uniqueStars }
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

  let score = 60 // 基础分数 (V2.1 提升至60)
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
      score += 20 // 日柱生助日主，大吉 (原+18)
      debugInfo.push(`日柱${dayStem}生助日主+20`)
    } else if (dayStemElement === dayMasterElement) {
      score += 15 // 日柱同类，吉 (原+12)
      debugInfo.push(`日柱${dayStem}同类+15`)
    } else if (ELEMENT_RESTRICTS[dayStemElement] === dayMasterElement) {
      score -= 10 // 日柱克制日主，凶 (原-15)
      debugInfo.push(`日柱${dayStem}克日主-10`)
    } else if (ELEMENT_RESTRICTS[dayMasterElement] === dayStemElement) {
      score -= 5 // 日柱被日主克，小凶 (原-8)
      debugInfo.push(`日柱${dayStem}被克-5`)
    }

    // 1.2 日柱地支与用户八字地支关系（六合/六冲）
    const userDayBranch = userBazi.day.branch
    if (BRANCH_LIU_HE[userDayBranch] === dayBranch) {
      score += 10 // 六合，吉
      debugInfo.push(`日柱地支六合+10`)
    } else if (BRANCH_LIU_CHONG[userDayBranch] === dayBranch) {
      score -= 10 // 六冲，凶 (原-12)
      debugInfo.push(`日柱地支六冲-10`)
    }

    // 1.3 日柱天干与喜忌神
    if (userGods.favorable.includes(dayStemElement)) {
      score += 12 // (原+10)
      debugInfo.push(`日柱天干喜神+12`)
    } else if (userGods.unfavorable.includes(dayStemElement)) {
      score -= 8 // (原-10)
      debugInfo.push(`日柱天干忌神-8`)
    }
  }

  // ==================== 2. 时辰影响（V1逻辑优化）====================
  const hourStem = hourBazi.stem
  const hourBranch = hourBazi.branch
  const hourStemElement = HEAVENLY_STEM_ELEMENTS[hourStem]
  const hourBranchElement = EARTHLY_BRANCH_ELEMENTS[hourBranch]

  // 2.1 时辰天干与喜用神关系（降低权重，避免过度影响）
  if (userGods.favorable.includes(hourStemElement)) {
    score += 15 // (原+12)
    debugInfo.push(`时辰喜神+15`)
  } else if (userGods.unfavorable.includes(hourStemElement)) {
    score -= 8 // (原-12)
    debugInfo.push(`时辰忌神-8`)
  }

  // 2.2 时辰地支与喜用神关系
  if (userGods.favorable.includes(hourBranchElement)) {
    score += 10 // (原+8)
    debugInfo.push(`时辰地支喜神+10`)
  } else if (userGods.unfavorable.includes(hourBranchElement)) {
    score -= 5 // (原-8)
    debugInfo.push(`时辰地支忌神-5`)
  }

  // 2.3 时辰生助日主
  if (ELEMENT_GENERATES[hourStemElement] === dayMasterElement) {
    score += 10 // (原+8)
    debugInfo.push(`时辰生助+10`)
  }

  // 2.4 时辰与日主同类
  if (hourStemElement === dayMasterElement) {
    score += 8 // (原+5)
    debugInfo.push(`时辰同类+8`)
  }

  // 2.5 时辰克日主
  if (ELEMENT_RESTRICTS[hourStemElement] === dayMasterElement) {
    score -= 5 // (原-10)
    debugInfo.push(`时辰克日主-5`)
  }

  // 2.6 时辰地支与用户日柱地支关系
  if (dayBazi) {
    const dayBranch = dayBazi.day.branch
    if (BRANCH_LIU_HE[dayBranch] === hourBranch) {
      score += 8 // 时辰与当日地支合
      debugInfo.push(`时辰合日支+8`)
    } else if (BRANCH_LIU_CHONG[dayBranch] === hourBranch) {
      score -= 8 // 时辰与当日地支冲 (原-10)
      debugInfo.push(`时辰冲日支-8`)
    }
  }

  // ==================== 3. 神煞影响 ====================
  const shenSha = calculateShenSha(userBazi, hourBazi)

  // 遍历吉神加分
  shenSha.stars.forEach((star) => {
    if (star.name === '天乙贵人') {
      score += 15 // (原+10)
      debugInfo.push(`天乙贵人+15`)
    } else if (star.name === '太极贵人') {
      score += 5
      debugInfo.push(`太极贵人+5`)
    } else if (star.name === '文昌贵人') {
      score += 8 // (原+6)
      debugInfo.push(`文昌+8`)
    } else if (star.name === '金舆') {
      score += 4
      debugInfo.push(`金舆+4`)
    } else if (star.name === '红鸾' || star.name === '天喜') {
      score += 8 // (原+5)
      debugInfo.push(`${star.name}+8`)
    } else if (star.name === '驿马') {
      score += 3
      debugInfo.push(`驿马+3`)
    } else if (star.name === '桃花') {
      score += 2
      debugInfo.push(`桃花+2`)
    } else if (star.name === '魁罡') {
      score += 5 // (原+3)
      debugInfo.push(`魁罡+5`)
    }
  })

  // 遍历凶煞减分
  shenSha.clashes.forEach((clash) => {
    if (clash.name === '日破' || clash.name === '岁破') {
      score -= 12
      debugInfo.push(`${clash.name}-12`)
    } else if (clash.name === '劫煞') {
      score -= 5
      debugInfo.push(`劫煞-5`)
    } else if (clash.name === '孤辰' || clash.name === '寡宿') {
      score -= 3
      debugInfo.push(`${clash.name}-3`)
    } else if (clash.name === '羊刃') {
      score -= 4
      debugInfo.push(`羊刃-4`)
    }
  })

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
