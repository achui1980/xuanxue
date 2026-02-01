import { describe, it, expect } from 'vitest'
import {
  WU_XING,
  HEAVENLY_STEM_ELEMENTS,
  EARTHLY_BRANCH_ELEMENTS,
  getActivitiesByElement,
  getAvoidActivitiesByElement
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
})
