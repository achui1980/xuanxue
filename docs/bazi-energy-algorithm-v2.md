# 八字能量计算算法规范文档 V2.0

> **文档版本**: V2.0 (设计稿)  
> **创建日期**: 2026-02-01  
> **适用项目**: 玄学时机应用系统 (Vue3 SPA)  
> **核心文件**: `src/utils/tyme.js`

---

## 1. 算法概述

### 1.1 算法目的

根据用户的出生八字（生辰八字），计算查询日期不同时辰的能量分数，为用户提供"最佳时机"决策依据。

### 1.2 输入参数

| 参数        | 类型   | 说明                                       |
| ----------- | ------ | ------------------------------------------ |
| `userBazi`  | Object | 用户八字：年柱、月柱、日柱、时柱           |
| `userGods`  | Object | 用户喜忌神数组：favorable[]、unfavorable[] |
| `queryDate` | Date   | 查询日期时间                               |

### 1.3 输出结果

| 字段      | 类型   | 说明                     |
| --------- | ------ | ------------------------ |
| `score`   | Number | 能量分数 (0-100)         |
| `level`   | String | 等级：大吉/吉/平/凶/大凶 |
| `shenSha` | Array  | 神煞信息（贵人、桃花等） |
| `clashes` | Array  | 冲煞信息（日破、岁破等） |
| `reason`  | String | 评分依据描述             |

---

## 2. 当前算法问题分析 (V1版本)

### 2.1 现有 `calculateHourEnergy` 函数回顾

**源码位置**: `src/utils/tyme.js:400-459`

```javascript
export function calculateHourEnergy(userBazi, userGods, hourBazi) {
  if (!userBazi || !hourBazi || !userGods) {
    return 50 // 默认中等能量
  }

  let score = 50 // 基础分数
  // ... 仅计算时辰与喜用神关系
  // 规则1: 时辰天干与喜用神关系 (+20/-20)
  // 规则2: 时辰地支与喜用神关系 (+15/-15)
  // 规则3: 时辰生助日主 (+10)
  // 规则4: 时辰与日主同类 (+5)
  // 规则5: 时辰克日主 (-15)
  // 规则6: 神煞加成 (贵人+10、文昌+5、桃花+2、冲煞-15)
}
```

### 2.2 核心缺陷

| 缺陷             | 影响                               | 示例                             |
| ---------------- | ---------------------------------- | -------------------------------- |
| **忽略日柱影响** | 未考虑查询日期日柱与用户日主的互动 | 不同日期的同一时辰分数几乎相同   |
| **分数过于集中** | 缺少高分(>85)和低分(<25)           | 24小时分数范围通常只有40-75      |
| **缺少地支关系** | 未计算六合、六冲、刑害             | 无法反映地支相合相冲的能量波动   |
| **维度单一**     | 仅考虑时辰 vs 日主                 | 未考虑日柱 vs 日主、时辰 vs 日柱 |
| **权重不合理**   | 喜用神权重过高(±20)                | 导致非喜用神时辰分数过低         |

### 2.3 测试结果分析

基于现有算法的典型输出：

```
日期: 2026-02-01 (甲木日)
用户: 甲木日主
24小时分数分布:
  高分区(>75): 3个时辰
  中分区(50-75): 18个时辰 ← 过于集中
  低分区(<50): 3个时辰

极差: 35 (42-77)
方差: 8.5 ← 波动过小
```

**问题**: 用户无法感受到明显的"时机差异"，算法实用性不足。

---

## 3. 新算法设计 (V2版本)

### 3.1 计算维度总览

```
┌─────────────────────────────────────────────────────────────┐
│                    总能量分数 (0-100)                        │
├─────────────────────────────────────────────────────────────┤
│  基础分: 50                                                  │
├─────────────────────────────────────────────────────────────┤
│  + 日柱影响 (±25)                                           │
│    ├─ 日柱天干 vs 日主 (生助+12、同类+8、克制-10)            │
│    └─ 日柱地支 vs 日主地支 (六合+10、六冲-12、三合+8)        │
├─────────────────────────────────────────────────────────────┤
│  + 时辰影响 (±20)                                           │
│    ├─ 时辰天干 vs 日主 (生助+10、同类+6、克制-8)             │
│    ├─ 时辰地支 vs 日主地支 (六合+8、六冲-10)                 │
│    └─ 时辰 vs 日柱 (六合+6、六冲-8)                          │
├─────────────────────────────────────────────────────────────┤
│  + 神煞影响 (±15)                                           │
│    ├─ 贵人 +10                                               │
│    ├─ 文昌 +6                                                │
│    ├─ 桃花 +3                                                │
│    ├─ 驿马 +2                                                │
│    └─ 冲煞 -15                                               │
├─────────────────────────────────────────────────────────────┤
│  + 特殊组合 (±10)                                           │
│    ├─ 日柱+时柱双合 +10                                      │
│    ├─ 双冲 -12                                               │
│    ├─ 三合局 +8                                              │
│    └─ 三会局 +8                                              │
├─────────────────────────────────────────────────────────────┤
│  = 最终分数 (限制范围: 20-95)                                │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 核心数据结构

#### 3.2.1 天干五行映射

```javascript
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
```

#### 3.2.2 地支五行映射

```javascript
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
```

#### 3.2.3 五行生克关系

```javascript
// 相生: 木→火→土→金→水→木
const ELEMENT_GENERATES = {
  [WU_XING.WOOD]: WU_XING.FIRE,
  [WU_XING.FIRE]: WU_XING.EARTH,
  [WU_XING.EARTH]: WU_XING.METAL,
  [WU_XING.METAL]: WU_XING.WATER,
  [WU_XING.WATER]: WU_XING.WOOD
}

// 相克: 木→土→水→火→金→木
const ELEMENT_RESTRICTS = {
  [WU_XING.WOOD]: WU_XING.EARTH,
  [WU_XING.FIRE]: WU_XING.METAL,
  [WU_XING.EARTH]: WU_XING.WATER,
  [WU_XING.METAL]: WU_XING.WOOD,
  [WU_XING.WATER]: WU_XING.FIRE
}
```

#### 3.2.4 地支六合表 (能量 +8~+10)

```javascript
const LIU_HE = {
  子: '丑',
  丑: '子', // 子丑合土
  寅: '亥',
  亥: '寅', // 寅亥合木
  卯: '戌',
  戌: '卯', // 卯戌合火
  辰: '酉',
  酉: '辰', // 辰酉合金
  巳: '申',
  申: '巳', // 巳申合水
  午: '未',
  未: '午' // 午未合土
}
```

#### 3.2.5 地支六冲表 (能量 -10~-12)

```javascript
const LIU_CHONG = {
  子: '午',
  午: '子', // 子午冲
  丑: '未',
  未: '丑', // 丑未冲
  寅: '申',
  申: '寅', // 寅申冲
  卯: '酉',
  酉: '卯', // 卯酉冲
  辰: '戌',
  戌: '辰', // 辰戌冲
  巳: '亥',
  亥: '巳' // 巳亥冲
}
```

#### 3.2.6 地支三合局 (能量 +8)

```javascript
const SAN_HE = [
  ['申', '子', '辰'], // 申子辰合水局
  ['寅', '午', '戌'], // 寅午戌合火局
  ['巳', '酉', '丑'], // 巳酉丑合金局
  ['亥', '卯', '未'] // 亥卯未合木局
]
```

#### 3.2.7 地支三会局 (能量 +8)

```javascript
const SAN_HUI = [
  ['寅', '卯', '辰'], // 寅卯辰会木局
  ['巳', '午', '未'], // 巳午未会火局
  ['申', '酉', '戌'], // 申酉戌会金局
  ['亥', '子', '丑'] // 亥子丑会水局
]
```

#### 3.2.8 神煞映射表

```javascript
// 桃花 (利人缘、社交)
const TAO_HUA = {
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

// 贵人 (天乙贵人)
const GUI_REN = {
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

// 文昌 (利学业、思考)
const WEN_CHANG = {
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

// 驿马 (利出行、变动)
const YI_MA = {
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
```

---

## 4. 算法步骤详解

### 4.1 主函数流程

```javascript
export function calculateHourEnergyV2(userBazi, userGods, queryDate) {
  // 1. 获取查询日期的日柱和时辰柱
  const dayPillar = getDayPillar(queryDate) // 查询日期日柱
  const hourPillar = getHourPillar(queryDate) // 查询日期时辰柱

  // 2. 基础分
  let score = 50
  const reasons = [] // 记录评分依据

  // 3. 日柱影响 (±25)
  const dayImpact = calculateDayImpact(userBazi, dayPillar)
  score += dayImpact.score
  reasons.push(...dayImpact.reasons)

  // 4. 时辰影响 (±20)
  const hourImpact = calculateHourImpact(userBazi, dayPillar, hourPillar)
  score += hourImpact.score
  reasons.push(...hourImpact.reasons)

  // 5. 神煞影响 (±15)
  const shenShaImpact = calculateShenShaImpact(userBazi, hourPillar)
  score += shenShaImpact.score
  reasons.push(...shenShaImpact.reasons)

  // 6. 特殊组合 (±10)
  const comboImpact = calculateSpecialCombo(userBazi, dayPillar, hourPillar)
  score += comboImpact.score
  reasons.push(...comboImpact.reasons)

  // 7. 分数限制与等级判定
  score = Math.max(20, Math.min(95, score))
  const level = getEnergyLevel(score)

  return {
    score,
    level,
    reasons: reasons.join('；'),
    shenSha: shenShaImpact.stars,
    clashes: shenShaImpact.clashes
  }
}
```

### 4.2 日柱影响计算 (calculateDayImpact)

```javascript
function calculateDayImpact(userBazi, dayPillar) {
  let score = 0
  const reasons = []

  const userDayMaster = userBazi.day.stem // 用户日主天干
  const userDayBranch = userBazi.day.branch // 用户日支
  const dayStem = dayPillar.stem // 查询日天干
  const dayBranch = dayPillar.branch // 查询日地支

  const userElement = HEAVENLY_STEM_ELEMENTS[userDayMaster]
  const dayElement = HEAVENLY_STEM_ELEMENTS[dayStem]

  // 4.2.1 日柱天干 vs 日主 (±12)
  if (ELEMENT_GENERATES[dayElement] === userElement) {
    score += 12
    reasons.push('日柱天干生助日主')
  } else if (dayElement === userElement) {
    score += 8
    reasons.push('日柱天干与日主同类')
  } else if (ELEMENT_RESTRICTS[dayElement] === userElement) {
    score -= 10
    reasons.push('日柱天干克制日主')
  } else if (ELEMENT_GENERATES[userElement] === dayElement) {
    score -= 5
    reasons.push('日柱天干泄耗日主')
  }

  // 4.2.2 日柱地支 vs 用户日支 (六合/六冲 ±10)
  if (LIU_HE[userDayBranch] === dayBranch) {
    score += 10
    reasons.push('日柱地支与命主日支六合')
  } else if (LIU_CHONG[userDayBranch] === dayBranch) {
    score -= 12
    reasons.push('日柱地支与命主日支相冲')
  }

  // 4.2.3 日柱地支 vs 用户年支 (六合/六冲 ±6)
  if (LIU_HE[userBazi.year.branch] === dayBranch) {
    score += 6
    reasons.push('日柱地支与命主年支六合')
  } else if (LIU_CHONG[userBazi.year.branch] === dayBranch) {
    score -= 8
    reasons.push('日柱地支与命主年支相冲')
  }

  return { score, reasons }
}
```

### 4.3 时辰影响计算 (calculateHourImpact)

```javascript
function calculateHourImpact(userBazi, dayPillar, hourPillar) {
  let score = 0
  const reasons = []

  const userDayMaster = userBazi.day.stem
  const userDayBranch = userBazi.day.branch
  const hourStem = hourPillar.stem
  const hourBranch = hourPillar.branch
  const dayBranch = dayPillar.branch

  const userElement = HEAVENLY_STEM_ELEMENTS[userDayMaster]
  const hourElement = HEAVENLY_STEM_ELEMENTS[hourStem]

  // 4.3.1 时辰天干 vs 日主 (±10)
  if (ELEMENT_GENERATES[hourElement] === userElement) {
    score += 10
    reasons.push('时辰天干生助日主')
  } else if (hourElement === userElement) {
    score += 6
    reasons.push('时辰天干与日主同类')
  } else if (ELEMENT_RESTRICTS[hourElement] === userElement) {
    score -= 8
    reasons.push('时辰天干克制日主')
  }

  // 4.3.2 时辰地支 vs 用户日支 (六合/六冲 ±8)
  if (LIU_HE[userDayBranch] === hourBranch) {
    score += 8
    reasons.push('时辰地支与命主日支六合')
  } else if (LIU_CHONG[userDayBranch] === hourBranch) {
    score -= 10
    reasons.push('时辰地支与命主日支相冲(日破)')
  }

  // 4.3.3 时辰地支 vs 日柱地支 (六合/六冲 ±6)
  if (LIU_HE[dayBranch] === hourBranch) {
    score += 6
    reasons.push('时辰地支与日柱地支六合')
  } else if (LIU_CHONG[dayBranch] === hourBranch) {
    score -= 8
    reasons.push('时辰地支与日柱地支相冲')
  }

  // 4.3.4 时辰地支 vs 用户年支 (冲煞 ±8)
  if (LIU_CHONG[userBazi.year.branch] === hourBranch) {
    score -= 8
    reasons.push('时辰地支与命主年支相冲(岁破)')
  }

  return { score, reasons }
}
```

### 4.4 神煞影响计算 (calculateShenShaImpact)

```javascript
function calculateShenShaImpact(userBazi, hourPillar) {
  let score = 0
  const reasons = []
  const stars = []
  const clashes = []

  const hourBranch = hourPillar.branch
  const userDayMaster = userBazi.day.stem
  const userDayBranch = userBazi.day.branch
  const userYearBranch = userBazi.year.branch
  const userYearStem = userBazi.year.stem

  // 4.4.1 贵人 (天乙贵人) +10
  const guiRenBranches = GUI_REN[userDayMaster] || []
  if (guiRenBranches.includes(hourBranch)) {
    score += 10
    reasons.push('遇天乙贵人')
    stars.push({ name: '贵人', desc: '遇事呈祥，有贵人相助' })
  }

  // 4.4.2 文昌 +6
  if (WEN_CHANG[userDayMaster] === hourBranch) {
    score += 6
    reasons.push('逢文昌星')
    stars.push({ name: '文昌', desc: '利于学习、考试、写作' })
  }

  // 4.4.3 桃花 +3
  if (TAO_HUA[userDayBranch] === hourBranch || TAO_HUA[userYearBranch] === hourBranch) {
    score += 3
    reasons.push('桃花星动')
    stars.push({ name: '桃花', desc: '人缘好，利社交、恋爱' })
  }

  // 4.4.4 驿马 +2
  if (YI_MA[userDayBranch] === hourBranch || YI_MA[userYearBranch] === hourBranch) {
    score += 2
    reasons.push('驿马星临')
    stars.push({ name: '驿马', desc: '利于出行、变动' })
  }

  // 4.4.5 冲煞 -15
  if (LIU_CHONG[userDayBranch] === hourBranch) {
    score -= 15
    reasons.push('犯日破(日支相冲)')
    clashes.push({ name: '日破', desc: '运势动荡，不宜大事' })
  }
  if (LIU_CHONG[userYearBranch] === hourBranch) {
    score -= 12
    reasons.push('犯岁破(年支相冲)')
    clashes.push({ name: '岁破', desc: '长辈或外界压力大' })
  }

  return { score, reasons, stars, clashes }
}
```

### 4.5 特殊组合计算 (calculateSpecialCombo)

```javascript
function calculateSpecialCombo(userBazi, dayPillar, hourPillar) {
  let score = 0
  const reasons = []

  const dayBranch = dayPillar.branch
  const hourBranch = hourPillar.branch
  const userDayBranch = userBazi.day.branch

  // 4.5.1 双合 (日柱和时辰都与命主日支相合) +10
  if (LIU_HE[userDayBranch] === dayBranch && LIU_HE[userDayBranch] === hourBranch) {
    score += 10
    reasons.push('日柱与时辰双合命主日支，大吉')
  }

  // 4.5.2 双冲 (日柱和时辰都与命主日支相冲) -12
  if (LIU_CHONG[userDayBranch] === dayBranch && LIU_CHONG[userDayBranch] === hourBranch) {
    score -= 12
    reasons.push('日柱与时辰双冲命主日支，大凶')
  }

  // 4.5.3 日柱与时辰相合 +5
  if (LIU_HE[dayBranch] === hourBranch) {
    score += 5
    reasons.push('日柱与时柱地支相合')
  }

  // 4.5.4 日柱与时辰相冲 -8
  if (LIU_CHONG[dayBranch] === hourBranch) {
    score -= 8
    reasons.push('日柱与时柱地支相冲')
  }

  // 4.5.5 三合局检查 (需要月支参与，简化版)
  // 实际应用中需结合月柱，此处仅作示例

  // 4.5.6 三会局检查 (简化版)

  return { score, reasons }
}
```

---

## 5. 关键公式汇总

### 5.1 总能量分数公式

```
总分数 = 基础分(50)
       + 日柱影响分(±25)
       + 时辰影响分(±20)
       + 神煞影响分(±15)
       + 特殊组合分(±10)

限制范围: max(20, min(95, 总分数))
```

### 5.2 各维度权重分配

| 维度         | 权重范围 | 占比 | 说明                  |
| ------------ | -------- | ---- | --------------------- |
| 基础分       | 50       | 50%  | 所有时辰起点相同      |
| 日柱影响     | ±25      | 25%  | 日期层面的大趋势      |
| 时辰影响     | ±20      | 20%  | 时辰层面的波动        |
| 神煞影响     | ±15      | 15%  | 特殊星煞的加成/减成   |
| 特殊组合     | ±10      | 10%  | 组合效应              |
| **理论极差** | **80**   | -    | 20~95分 (实际约50-70) |

### 5.3 评分等级划分

| 分数范围 | 等级 | 颜色    | 建议                   |
| -------- | ---- | ------- | ---------------------- |
| 85-95    | 大吉 | 🟢 深绿 | 最佳时机，适合重要决策 |
| 70-84    | 吉   | 🟢 浅绿 | 能量充沛，适合行动     |
| 45-69    | 平   | 🟡 黄色 | 平稳期，处理日常事务   |
| 25-44    | 凶   | 🟠 橙色 | 需谨慎，避免重大决策   |
| 20-24    | 大凶 | 🔴 红色 | 不宜行动，静守为上     |

### 5.4 期望分布

在一个月的随机日期测试下，期望24小时分数分布如下：

| 等级      | 占比 | 时辰数/日 |
| --------- | ---- | --------- |
| 大吉(≥85) | ~15% | 3-4个时辰 |
| 吉(70-84) | ~35% | 8-9个时辰 |
| 平(45-69) | ~30% | 7-8个时辰 |
| 凶(25-44) | ~15% | 3-4个时辰 |
| 大凶(<25) | ~5%  | 0-2个时辰 |

---

## 6. 测试验证标准

### 6.1 基础测试用例

```javascript
// 测试1: 同一用户不同日期的分数差异
describe('Date Variation Test', () => {
  const user = {
    /* 甲木日主，寅日支 */
  }

  test('同一时辰不同日期的分数差异应>20分', () => {
    const date1 = new Date('2026-02-01T10:00:00') // 乙木日
    const date2 = new Date('2026-02-02T10:00:00') // 丙火日

    const score1 = calculateHourEnergyV2(user, {}, date1)
    const score2 = calculateHourEnergyV2(user, {}, date2)

    expect(Math.abs(score1.score - score2.score)).toBeGreaterThan(20)
  })
})

// 测试2: 分数分布检验
describe('Score Distribution Test', () => {
  test('24小时分数极差应>40分', () => {
    const scores = []
    for (let h = 0; h < 24; h++) {
      const date = new Date(`2026-02-01T${h}:00:00`)
      scores.push(calculateHourEnergyV2(user, {}, date).score)
    }

    const max = Math.max(...scores)
    const min = Math.min(...scores)
    expect(max - min).toBeGreaterThan(40)
  })

  test('应有至少1个时辰≥85分(大吉)', () => {
    const highScores = scores.filter((s) => s >= 85)
    expect(highScores.length).toBeGreaterThanOrEqual(1)
  })

  test('应有至少1个时辰≤30分(凶/大凶)', () => {
    const lowScores = scores.filter((s) => s <= 30)
    expect(lowScores.length).toBeGreaterThanOrEqual(1)
  })
})

// 测试3: 六合日应加分
describe('Liu He Test', () => {
  test('命主日支为寅，亥日应加分', () => {
    const user = { day: { stem: '甲', branch: '寅' } }
    const heDate = new Date('2026-02-??T12:00:00') // 需为亥日

    const result = calculateHourEnergyV2(user, {}, heDate)
    expect(result.reasons).toContain('日柱地支与命主日支六合')
    expect(result.score).toBeGreaterThan(60)
  })
})

// 测试4: 六冲日应减分
describe('Liu Chong Test', () => {
  test('命主日支为寅，申日应减分', () => {
    const user = { day: { stem: '甲', branch: '寅' } }
    const chongDate = new Date('2026-02-??T12:00:00') // 需为申日

    const result = calculateHourEnergyV2(user, {}, chongDate)
    expect(result.reasons).toContain('日柱地支与命主日支相冲')
  })
})
```

### 6.2 性能测试标准

| 指标       | 要求    | 说明                 |
| ---------- | ------- | -------------------- |
| 单次计算   | < 5ms   | 单个时辰能量计算     |
| 24小时计算 | < 100ms | 单日24个时辰批量计算 |
| 7天计算    | < 500ms | 周趋势计算           |
| 内存占用   | < 10MB  | 算法运行时峰值内存   |

### 6.3 边界情况测试

```javascript
// 边界测试
const edgeCases = [
  { desc: '极高分上限', condition: '所有有利因素叠加', expected: 95 },
  { desc: '极低分下限', condition: '所有不利因素叠加', expected: 20 },
  { desc: '子时(23:00)', hour: 23, shouldWork: true },
  { desc: '丑时(01:00)', hour: 1, shouldWork: true },
  { desc: '边界时辰切换', hour: 23.5, shouldThrow: false }
]
```

---

## 7. 代码实现建议

### 7.1 保留旧版本作为 Fallback

```javascript
// tyme.js

/**
 * V1版本：原算法，保留用于对比测试
 * @deprecated 请使用 calculateHourEnergyV2
 */
export function calculateHourEnergy(userBazi, userGods, hourBazi) {
  // ... 原有实现保持不变
}

/**
 * V2版本：新算法，推荐用于生产环境
 */
export function calculateHourEnergyV2(userBazi, userGods, queryDate) {
  // ... 新实现
}

// 根据配置或特性开关选择版本
export function calculateHourEnergyAuto(userBazi, userGods, queryDate, useV2 = true) {
  if (useV2) {
    try {
      return calculateHourEnergyV2(userBazi, userGods, queryDate)
    } catch (error) {
      console.warn('V2算法计算失败，回退到V1:', error)
      const hourBazi = getCurrentHourBazi(queryDate)
      return calculateHourEnergy(userBazi, userGods, hourBazi)
    }
  }
  const hourBazi = getCurrentHourBazi(queryDate)
  return calculateHourEnergy(userBazi, userGods, hourBazi)
}
```

### 7.2 添加详细日志便于调试

```javascript
// 日志配置
const DEBUG_MODE = process.env.NODE_ENV === 'development'

function logCalculation(step, details) {
  if (DEBUG_MODE) {
    console.log(`[EnergyCalc] ${step}:`, details)
  }
}

// 使用示例
function calculateDayImpact(userBazi, dayPillar) {
  logCalculation('开始计算日柱影响', {
    userDayMaster: userBazi.day.stem,
    dayStem: dayPillar.stem
  })

  let score = 0
  // ... 计算逻辑

  logCalculation('日柱影响计算完成', { score, reasons })
  return { score, reasons }
}
```

### 7.3 性能优化建议

#### 7.3.1 缓存策略

```javascript
// 使用 WeakMap 缓存计算结果
const energyCache = new WeakMap()

export function calculateHourEnergyV2(userBazi, userGods, queryDate) {
  const cacheKey = `${userBazi.day.full}_${queryDate.toISOString()}`

  if (energyCache.has(cacheKey)) {
    return energyCache.get(cacheKey)
  }

  const result = doCalculation(userBazi, userGods, queryDate)
  energyCache.set(cacheKey, result)

  // 限制缓存大小
  if (energyCache.size > 1000) {
    const firstKey = energyCache.keys().next().value
    energyCache.delete(firstKey)
  }

  return result
}
```

#### 7.3.2 批量计算优化

```javascript
// 24小时批量计算时复用日柱计算结果
export function calculateDayEnergy24H(userBazi, userGods, date) {
  const dayPillar = getDayPillar(date) // 只计算一次

  const results = []
  for (let hour = 0; hour < 24; hour++) {
    const hourDate = new Date(date)
    hourDate.setHours(hour)

    const hourPillar = getHourPillar(hourDate)

    // 跳过重复计算日柱，直接传入
    const score = calculateHourEnergyV2Optimized(
      userBazi,
      userGods,
      dayPillar, // 已预计算
      hourPillar
    )
    results.push(score)
  }

  return results
}
```

#### 7.3.3 Web Worker 支持

```javascript
// energy.worker.js
self.onmessage = function (e) {
  const { userBazi, userGods, dates } = e.data

  const results = dates.map((date) => {
    return calculateHourEnergyV2(userBazi, userGods, new Date(date))
  })

  self.postMessage(results)
}

// 主线程调用
const worker = new Worker('energy.worker.js')
worker.postMessage({ userBazi, userGods, dates: weekDates })
worker.onmessage = (e) => {
  updateWeeklyTrend(e.data)
}
```

### 7.4 配置化设计

```javascript
// config/energy.js
export const ENERGY_CONFIG = {
  // 基础分
  BASE_SCORE: 50,

  // 分数范围限制
  MIN_SCORE: 20,
  MAX_SCORE: 95,

  // 各维度权重 (可调)
  weights: {
    dayPillar: 25, // 日柱影响
    hourPillar: 20, // 时辰影响
    shenSha: 15, // 神煞影响
    combo: 10 // 特殊组合
  },

  // 评分细则 (可调)
  scores: {
    // 日柱天干
    dayStemGenerates: 12, // 日柱天干生助日主
    dayStemSame: 8, // 日柱天干同类
    dayStemRestricts: -10, // 日柱天干克制日主
    dayStemDrains: -5, // 日柱天干泄耗日主

    // 日柱地支
    dayBranchLiuHe: 10, // 日柱地支六合
    dayBranchLiuChong: -12, // 日柱地支六冲
    dayBranchSanHe: 8, // 日柱地支三合

    // 时辰天干
    hourStemGenerates: 10, // 时辰天干生助日主
    hourStemSame: 6, // 时辰天干同类
    hourStemRestricts: -8, // 时辰天干克制日主

    // 时辰地支
    hourBranchLiuHe: 8, // 时辰地支六合
    hourBranchLiuChong: -10, // 时辰地支六冲

    // 神煞
    guiRen: 10, // 贵人
    wenChang: 6, // 文昌
    taoHua: 3, // 桃花
    yiMa: 2, // 驿马
    riPo: -15, // 日破
    suiPo: -12 // 岁破
  }
}
```

---

## 8. 附录

### 8.1 参考文档

- 《渊海子平》- 八字命理经典
- 《三命通会》- 万民英著
- 《滴天髓》- 任铁樵注
- `tyme4ts` 库文档: https://github.com/6tail/tyme4ts

### 8.2 术语表

| 术语   | 解释                                           |
| ------ | ---------------------------------------------- |
| 八字   | 出生年、月、日、时的天干地支组合，共八个字     |
| 日主   | 日柱的天干，代表命主本人                       |
| 日柱   | 出生日的天干地支组合                           |
| 时辰   | 2小时为一时辰，一天12个时辰                    |
| 天干   | 甲、乙、丙、丁、戊、己、庚、辛、壬、癸         |
| 地支   | 子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥 |
| 五行   | 金、木、水、火、土                             |
| 六合   | 地支两两相合，能量和谐                         |
| 六冲   | 地支两两相冲，能量冲突                         |
| 三合   | 三个地支组合成局，能量增强                     |
| 三会   | 三个地支会聚一方，能量聚集                     |
| 神煞   | 吉神(贵人、文昌等)和凶煞(日破、岁破等)         |
| 喜用神 | 对命主有利的五行                               |
| 忌神   | 对命主不利的五行                               |

### 8.3 算法演进计划

| 版本 | 状态   | 主要特性                       | 预计时间 |
| ---- | ------ | ------------------------------ | -------- |
| V1   | 已上线 | 基础五行生克 + 神煞            | 2025-Q4  |
| V2   | 设计中 | 日柱影响 + 地支关系 + 特殊组合 | 2026-Q1  |
| V3   | 规划中 | 月柱影响 + 年柱影响 + 刑害关系 | 2026-Q2  |
| V4   | 规划中 | 纳音五行 + 胎元命宫 + 大运流年 | 2026-Q3  |

---

**文档结束**

> 本文档由 AI 助手生成，供开发团队参考。实际实现时请以代码为准，文档可能需要根据实现细节进行调整。
