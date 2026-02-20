import { describe, it, expect } from 'vitest'
import { getTrueSolarTime, calculateBaZi } from './tyme'

describe('True Solar Time', () => {
  it('should return same time for standard longitude (120°E)', () => {
    // 2024-02-04 12:00:00 (Li Chun)
    // EoT on Feb 4 is about -14 minutes.
    // So even at 120°E, TST != MST because of EoT.
    // TST = LMT + EoT
    // LMT = MST + (Long - 120)*4 = MST
    // TST = MST + EoT
    
    const date = new Date('2024-02-04T12:00:00') // Local time (assuming environment is running in CST or we handle offsets carefully)
    // To avoid timezone confusion in test, let's look at the relative difference
    
    const tst = getTrueSolarTime(date, 120)
    const diff = (tst.getTime() - date.getTime()) / 1000 / 60 // minutes
    
    // EoT for Feb 4 is approx -14 mins.
    expect(diff).toBeCloseTo(-14, 0) 
  })

  it('should adjust for longitude difference (Chengdu 104°E)', () => {
    // 120 - 104 = 16 degrees
    // 16 * 4 = 64 minutes lag
    // LMT = MST - 64 mins
    // TST = LMT + EoT
    
    const date = new Date('2024-02-04T12:00:00')
    const tst = getTrueSolarTime(date, 104)
    
    // Expected diff: -64 (long) + (-14) (EoT) = -78 mins
    const diff = (tst.getTime() - date.getTime()) / 1000 / 60
    expect(diff).toBeCloseTo(-78, 0)
  })

  it('should adjust for longitude difference (Harbin 126°E)', () => {
    // 126 - 120 = 6 degrees
    // 6 * 4 = 24 minutes lead
    // LMT = MST + 24 mins
    
    const date = new Date('2024-02-04T12:00:00')
    const tst = getTrueSolarTime(date, 126)
    
    // Expected diff: +24 (long) + (-14) (EoT) = +10 mins
    const diff = (tst.getTime() - date.getTime()) / 1000 / 60
    expect(diff).toBeCloseTo(10, 0)
  })
})

describe('BaZi with True Solar Time', () => {
  it('should change hour pillar when TST crosses hour boundary', () => {
    // 2024-02-04 12:00 is Wu Hour (11:00-13:00)
    // If we are in Urumqi (87°E), -132 mins -> 09:48.
    // 09:48 is Si Hour (09:00-11:00).
    
    const year = 2024
    const month = 2
    const day = 4
    const hour = 12
    
    // Standard (Beijing)
    const baziBJ = calculateBaZi(year, month, day, hour, 0, 120)
    // Wu Hour (Horse)
    expect(baziBJ.hour.branch).toBe('午')
    
    // Urumqi
    const baziUQ = calculateBaZi(year, month, day, hour, 0, 87)
    // Should be Si Hour (Snake)
    expect(baziUQ.hour.branch).toBe('巳')
  })
})
