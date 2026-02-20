
import { SolarDay, LunarDay } from 'tyme4ts';

try {
  const solarDay = SolarDay.fromYmd(2024, 2, 20);
  const lunarDay = solarDay.getLunarDay();
  
  console.log('Lunar Day:', lunarDay.toString());
  
  // Check Twelve Duty Officer
  if (typeof lunarDay.getTwelveDutyOfficer === 'function') {
    console.log('Twelve Duty Officer:', lunarDay.getTwelveDutyOfficer().getName());
  } else {
    console.log('Twelve Duty Officer method missing on LunarDay');
  }

  // Check NaYin on SixtyCycle
  const sixtyCycle = lunarDay.getSixtyCycle();
  if (typeof sixtyCycle.getNaYin === 'function') {
    console.log('NaYin:', sixtyCycle.getNaYin().getName());
  } else {
    console.log('NaYin method missing on SixtyCycle');
  }

  // Check Nine Star
  if (typeof lunarDay.getNineStar === 'function') {
    console.log('Nine Star:', lunarDay.getNineStar().getName());
  } else {
    console.log('Nine Star method missing on LunarDay');
  }
  
  // Check Moon Phase
  if (typeof lunarDay.getPhase === 'function') {
    console.log('Phase:', lunarDay.getPhase().getName());
  } else {
    console.log('Phase method missing on LunarDay');
  }

} catch (e) {
  console.error(e);
}
