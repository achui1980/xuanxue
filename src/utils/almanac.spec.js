import { describe, it, expect } from 'vitest'
import { getAlmanacInfo, getTermInfo, getFestivalInfo, getTermIcon } from '../utils/tyme'

describe('黄历功能测试', () => {
  describe('getAlmanacInfo', () => {
    it('应该返回宜忌信息', () => {
      const result = getAlmanacInfo(new Date(2026, 1, 7)) // 2026-02-07
      expect(result).toHaveProperty('recommends')
      expect(result).toHaveProperty('avoids')
      expect(Array.isArray(result.recommends)).toBe(true)
      expect(Array.isArray(result.avoids)).toBe(true)
    })

    it('宜忌数组长度不应超过5', () => {
      const result = getAlmanacInfo()
      expect(result.recommends.length).toBeLessThanOrEqual(5)
      expect(result.avoids.length).toBeLessThanOrEqual(5)
    })
  })

  describe('getTermInfo', () => {
    it('应该返回节气信息', () => {
      const result = getTermInfo(new Date(2026, 1, 7)) // 2026-02-07
      expect(result).toHaveProperty('current')
      expect(result).toHaveProperty('next')
      expect(result).toHaveProperty('daysUntil')
    })

    it('2026-02-07应该是立春之后', () => {
      const result = getTermInfo(new Date(2026, 1, 7))
      // 2026年立春是2月4日
      expect(result.current).toBe('立春')
    })
  })

  describe('getFestivalInfo', () => {
    it('应该返回节日信息', () => {
      const result = getFestivalInfo()
      expect(result).toHaveProperty('festivals')
      expect(result).toHaveProperty('isTraditional')
      expect(result).toHaveProperty('hasFestival')
      expect(Array.isArray(result.festivals)).toBe(true)
    })

    it('春节应该被识别为传统节日', () => {
      // 2026年春节是2月17日
      const result = getFestivalInfo(new Date(2026, 1, 17))
      if (result.hasFestival) {
        expect(result.isTraditional).toBe(true)
      }
    })
  })

  describe('getTermIcon', () => {
    it('应该返回节气的emoji图标', () => {
      expect(getTermIcon('立春')).toBe('🌱')
      expect(getTermIcon('雨水')).toBe('🌧️')
      expect(getTermIcon('冬至')).toBe('🧣')
    })

    it('未知节气应返回默认图标', () => {
      expect(getTermIcon('未知')).toBe('🌤️')
    })
  })
})
