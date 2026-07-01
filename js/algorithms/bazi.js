const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const WU_XING_TIAN_GAN = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
const WU_XING_DI_ZHI = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(year, month) {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) return 29;
  return days[month - 1];
}

function daysSince1900(year, month, day) {
  let total = 0;
  for (let y = 1900; y < year; y++) {
    total += isLeapYear(y) ? 366 : 365;
  }
  for (let m = 1; m < month; m++) {
    total += getDaysInMonth(year, m);
  }
  total += day - 1;
  return total;
}

function getYearPillar(year) {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return { gan: TIAN_GAN[ganIndex], zhi: DI_ZHI[zhiIndex], ganIndex, zhiIndex };
}

function getMonthPillar(year, month, day) {
  const solarTermStartDay = [0, 0, 4, 6, 5, 6, 6, 7, 8, 8, 8, 7, 7];
  let adjustedMonth = month;
  if (day < solarTermStartDay[month]) {
    adjustedMonth = month - 1;
    if (adjustedMonth === 0) adjustedMonth = 12;
  }
  const yearGanIndex = (year - 4) % 10;
  const zhiIndex = (adjustedMonth + 1) % 12;
  const ganIndex = (yearGanIndex % 5 * 2 + zhiIndex) % 10;
  return { gan: TIAN_GAN[ganIndex], zhi: DI_ZHI[zhiIndex], ganIndex, zhiIndex };
}

function getDayPillar(year, month, day) {
  const days = daysSince1900(year, month, day);
  const ganIndex = days % 10;
  const zhiIndex = (days + 10) % 12;
  return { gan: TIAN_GAN[ganIndex], zhi: DI_ZHI[zhiIndex], ganIndex, zhiIndex };
}

function getHourPillar(dayGanIndex, hour) {
  let zhiIndex;
  if (hour === 23 || hour === 0) {
    zhiIndex = 0;
  } else {
    zhiIndex = Math.floor((hour + 1) / 2) % 12;
  }
  const ganIndex = (dayGanIndex % 5 * 2 + zhiIndex) % 10;
  return { gan: TIAN_GAN[ganIndex], zhi: DI_ZHI[zhiIndex], ganIndex, zhiIndex };
}

export function calculateBaZi(year, month, day, hour) {
  if (year < 1900 || year > 2100) {
    throw new Error('年份超出支持范围（1900-2100）');
  }
  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(year, month, day);
  const dayPillar = getDayPillar(year, month, day);
  const hourPillar = getHourPillar(dayPillar.ganIndex, hour);
  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };
}

export function getWuXing(bazi) {
  const elements = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour];
  pillars.forEach(pillar => {
    const ganWx = WU_XING_TIAN_GAN[pillar.ganIndex];
    const zhiWx = WU_XING_DI_ZHI[pillar.zhiIndex];
    elements[ganWx] += 1;
    elements[zhiWx] += 0.5;
  });
  Object.keys(elements).forEach(k => {
    elements[k] = Math.round(elements[k] * 10) / 10;
  });
  return elements;
}
