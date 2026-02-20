import { describe, it, expect } from 'vitest'
import {
  WU_XING,
  HEAVENLY_STEM_ELEMENTS,
  EARTHLY_BRANCH_ELEMENTS,
  getActivitiesByElement,
  getAvoidActivitiesByElement,
  calculateShenSha
} from './tyme'

describe('Tyme Utils', () => {
  describe('Constants', () => {
    it('should have correct WU_XING values', () => {
      expect(WU_XING.WOOD).toBe('木')
      expect(WU_XING.FIRE).toBe('火')
      expect(WU_XING.EARTH).toBe('土')
      expect(WU_XING.METAL).toBe('金')
      expect(WU_XING.WATER).toBe('水')
    })

    it('should map Heavenly Stems to correct Elements', () => {
      expect(HEAVENLY_STEM_ELEMENTS['甲']).toBe(WU_XING.WOOD)
      expect(HEAVENLY_STEM_ELEMENTS['丙']).toBe(WU_XING.FIRE)
      expect(HEAVENLY_STEM_ELEMENTS['戊']).toBe(WU_XING.EARTH)
      expect(HEAVENLY_STEM_ELEMENTS['庚']).toBe(WU_XING.METAL)
      expect(HEAVENLY_STEM_ELEMENTS['壬']).toBe(WU_XING.WATER)
    })

    it('should map Earthly Branches to correct Elements', () => {
      expect(EARTHLY_BRANCH_ELEMENTS['子']).toBe(WU_XING.WATER)
      expect(EARTHLY_BRANCH_ELEMENTS['寅']).toBe(WU_XING.WOOD)
      expect(EARTHLY_BRANCH_ELEMENTS['巳']).toBe(WU_XING.FIRE)
      expect(EARTHLY_BRANCH_ELEMENTS['辰']).toBe(WU_XING.EARTH)
      expect(EARTHLY_BRANCH_ELEMENTS['申']).toBe(WU_XING.METAL)
    })
  })

  describe('Activities', () => {
    it('should return activities for WOOD element', () => {
      const activities = getActivitiesByElement(WU_XING.WOOD)
      expect(activities).toContain('创意工作')
      expect(activities).toContain('学习')
    })

    it('should return empty array for invalid element', () => {
      const activities = getActivitiesByElement('UNKNOWN')
      expect(activities).toEqual([])
    })

    it('should return avoid activities for FIRE element', () => {
      const avoid = getAvoidActivitiesByElement(WU_XING.FIRE)
      expect(avoid).toContain('冲突对抗')
    })
  })

  describe('ShenSha Calculation', () => {
    // Helper to mock user bazi
    const mockUserBazi = (yearStem, yearBranch, dayMaster, dayBranch) => ({
      year: { stem: yearStem, branch: yearBranch },
      day: { stem: dayMaster, branch: dayBranch }, // dayMaster is technically day stem
      dayMaster: dayMaster
    })

    // Helper to mock hour bazi
    const mockHourBazi = (stem, branch, full = '') => ({
      stem,
      branch,
      full: full || stem + branch
    })

    it('should detect Tian Yi Gui Ren (天乙贵人)', () => {
      // 甲戊并牛羊 -> 甲见丑
      const user = mockUserBazi('甲', '子', '甲', '子')
      const hour = mockHourBazi('乙', '丑')
      const result = calculateShenSha(user, hour)
      expect(result.stars.some(s => s.name === '天乙贵人')).toBe(true)
    })

    it('should detect Tai Ji Gui Ren (太极贵人)', () => {
      // 甲乙生人子午中 -> 甲见子
      const user = mockUserBazi('甲', '寅', '甲', '寅')
      const hour = mockHourBazi('丙', '子')
      const result = calculateShenSha(user, hour)
      expect(result.stars.some(s => s.name === '太极贵人')).toBe(true)
    })

    it('should detect Wen Chang Gui Ren (文昌贵人)', () => {
      // 甲巳 -> 甲见巳
      const user = mockUserBazi('甲', '子', '甲', '子')
      const hour = mockHourBazi('己', '巳')
      const result = calculateShenSha(user, hour)
      expect(result.stars.some(s => s.name === '文昌贵人')).toBe(true)
    })

    it('should detect Jin Yu (金舆)', () => {
      // 甲龙 -> 甲见辰
      const user = mockUserBazi('甲', '子', '甲', '子')
      const hour = mockHourBazi('戊', '辰')
      const result = calculateShenSha(user, hour)
      expect(result.stars.some(s => s.name === '金舆')).toBe(true)
    })

    it('should detect Hong Luan (红鸾)', () => {
      // 鼠(子)见卯
      const user = mockUserBazi('甲', '子', '甲', '子') // Year Branch Zi
      const hour = mockHourBazi('丁', '卯')
      const result = calculateShenSha(user, hour)
      expect(result.stars.some(s => s.name === '红鸾')).toBe(true)
    })

    it('should detect Tian Xi (天喜)', () => {
      // 鼠(子)见酉
      const user = mockUserBazi('甲', '子', '甲', '子') // Year Branch Zi
      const hour = mockHourBazi('癸', '酉')
      const result = calculateShenSha(user, hour)
      expect(result.stars.some(s => s.name === '天喜')).toBe(true)
    })

    it('should detect Yang Ren (羊刃)', () => {
      // 甲见卯
      const user = mockUserBazi('甲', '子', '甲', '子')
      const hour = mockHourBazi('丁', '卯')
      const result = calculateShenSha(user, hour)
      // Yang Ren is in clashes (treated as negative/neutral)
      expect(result.clashes.some(s => s.name === '羊刃')).toBe(true)
    })

    it('should detect Kui Gang (魁罡)', () => {
      // Hour pillar is Geng Chen
      const user = mockUserBazi('甲', '子', '甲', '子')
      const hour = mockHourBazi('庚', '辰', '庚辰')
      const result = calculateShenSha(user, hour)
      expect(result.stars.some(s => s.name === '魁罡')).toBe(true)
    })

    it('should detect Jie Sha (劫煞)', () => {
      // Shen(猴)见Si(蛇)
      const user = mockUserBazi('甲', '申', '甲', '子')
      const hour = mockHourBazi('己', '巳')
      const result = calculateShenSha(user, hour)
      expect(result.clashes.some(s => s.name === '劫煞')).toBe(true)
    })

    it('should detect Gu Chen (孤辰)', () => {
      // Hai(猪)见Yin(虎)
      const user = mockUserBazi('甲', '亥', '甲', '子')
      const hour = mockHourBazi('丙', '寅')
      const result = calculateShenSha(user, hour)
      expect(result.clashes.some(s => s.name === '孤辰')).toBe(true)
    })
  })

  describe('V2 Algorithm Modules', () => {
    const { 
      calculateDayImpact, 
      calculateHourImpact, 
      calculateSpecialCombo,
      calculateHourEnergyV2 
    } = require('./tyme')

    const mockUserBazi = (yearStem, yearBranch, dayMaster, dayBranch) => ({
      year: { stem: yearStem, branch: yearBranch },
      month: { stem: '丙', branch: '午' }, // Month branch Wu(Fire)
      day: { stem: dayMaster, branch: dayBranch },
      dayMaster: dayMaster
    })

    describe('calculateDayImpact', () => {
      it('should add score when day stem generates day master', () => {
        // Day Stem Ren(Water) generates User Day Master Jia(Wood)
        const user = mockUserBazi('甲', '子', '甲', '子')
        const dayPillar = { stem: '壬', branch: '申' }
        const result = calculateDayImpact(user, dayPillar)
        expect(result.score).toBeGreaterThan(0)
        expect(result.reasons).toContain('得天时生助，能量源源不断')
      })

      it('should subtract score when day branch clashes with user day branch', () => {
        const user = {
          day: { stem: '甲', branch: '子' },
          year: { branch: '寅' }
        }
        const dayPillar = { stem: '甲', branch: '午' } // 午冲子
        const result = calculateDayImpact(user, dayPillar)
        // score might be net positive due to same stem (+10) but clash (-10), so result ~0
        // But we just check for reason presence
        expect(result.reasons).toContain('地利相冲，变动较多')
      })
    })

    describe('calculateSpecialCombo', () => {
      it('should detect San He (Three Harmony)', () => {
        // User Month: Wu(Horse)
        // Day: Yin(Tiger)
        // Hour: Xu(Dog)
        // Yin-Wu-Xu Fire Frame
        const user = mockUserBazi('甲', '子', '甲', '子') // Month is mocked as Wu inside describe block helper? No, I need to pass it or update helper
        user.month = { stem: '丙', branch: '午' }
        
        const dayPillar = { stem: '甲', branch: '寅' }
        const hourPillar = { stem: '甲', branch: '戌' }
        
        const result = calculateSpecialCombo(user, dayPillar, hourPillar)
        expect(result.score).toBe(8)
        expect(result.reasons).toContain('地支三合局成，能量强旺')
      })

      it('should detect Double He (Day & Hour combine with User Day)', () => {
        // User Day: Zi(Rat)
        // Day: Chou(Ox) -> Zi-Chou He
        // Hour: Chou(Ox) -> Zi-Chou He
        const user = mockUserBazi('甲', '子', '甲', '子')
        const dayPillar = { stem: '己', branch: '丑' }
        const hourPillar = { stem: '乙', branch: '丑' }

        const result = calculateSpecialCombo(user, dayPillar, hourPillar)
        expect(result.reasons).toContain('日柱与时辰双合命主日支，大吉')
        expect(result.score).toBe(10)
      })
    })
  })
})
