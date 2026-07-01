const SIGNS = [
  { name: '摩羯座', start: [1, 20], end: [2, 18], element: '土', quality: '开创' },
  { name: '水瓶座', start: [2, 19], end: [3, 20], element: '风', quality: '固定' },
  { name: '双鱼座', start: [3, 21], end: [4, 19], element: '水', quality: '变动' },
  { name: '白羊座', start: [4, 20], end: [5, 20], element: '火', quality: '开创' },
  { name: '金牛座', start: [5, 21], end: [6, 20], element: '土', quality: '固定' },
  { name: '双子座', start: [6, 21], end: [7, 22], element: '风', quality: '变动' },
  { name: '巨蟹座', start: [7, 23], end: [8, 22], element: '水', quality: '开创' },
  { name: '狮子座', start: [8, 23], end: [9, 22], element: '火', quality: '固定' },
  { name: '处女座', start: [9, 23], end: [10, 22], element: '土', quality: '变动' },
  { name: '天秤座', start: [10, 23], end: [11, 21], element: '风', quality: '开创' },
  { name: '天蝎座', start: [11, 22], end: [12, 21], element: '水', quality: '固定' },
  { name: '射手座', start: [12, 22], end: [1, 19], element: '火', quality: '变动' },
];

const SIGN_TRAITS = {
  '白羊座': { strength: '勇敢、自信、热情', weakness: '冲动、急躁、自我', love: '热情直接，主动追求' },
  '金牛座': { strength: '稳重、耐心、务实', weakness: '固执、保守、懒惰', love: '专一持久，重视安全感' },
  '双子座': { strength: '聪明、灵活、好奇', weakness: '善变、浮躁、双重', love: '风趣幽默，需要新鲜感' },
  '巨蟹座': { strength: '温柔、体贴、顾家', weakness: '敏感、情绪化、依赖', love: '深情专一，重视家庭' },
  '狮子座': { strength: '自信、大方、领导力', weakness: '自负、专制、爱面子', love: '热情浪漫，需要被崇拜' },
  '处女座': { strength: '细心、完美、理性', weakness: '挑剔、焦虑、苛刻', love: '细腻体贴，追求完美' },
  '天秤座': { strength: '优雅、公正、社交', weakness: '犹豫、依赖、怕寂寞', love: '浪漫优雅，追求平衡' },
  '天蝎座': { strength: '深沉、专注、洞察', weakness: '多疑、极端、占有', love: '深情热烈，专一执着' },
  '射手座': { strength: '乐观、自由、冒险', weakness: '粗心、冲动、承诺', love: '自由奔放，热爱冒险' },
  '摩羯座': { strength: '坚韧、负责、务实', weakness: '保守、压抑、世故', love: '稳重踏实，默默付出' },
  '水瓶座': { strength: '创新、独立、博爱', weakness: '叛逆、冷漠、古怪', love: '理性独立，需要空间' },
  '双鱼座': { strength: '温柔、浪漫、直觉', weakness: '逃避、优柔、牺牲', love: '浪漫梦幻，全身心投入' },
};

const RISING_SIGNS = [
  { time: [6, 8], sign: '狮子座' },
  { time: [8, 10], sign: '处女座' },
  { time: [10, 12], sign: '天秤座' },
  { time: [12, 14], sign: '天蝎座' },
  { time: [14, 16], sign: '射手座' },
  { time: [16, 18], sign: '摩羯座' },
  { time: [18, 20], sign: '水瓶座' },
  { time: [20, 22], sign: '双鱼座' },
  { time: [22, 24], sign: '白羊座' },
  { time: [0, 2], sign: '金牛座' },
  { time: [2, 4], sign: '双子座' },
  { time: [4, 6], sign: '巨蟹座' },
];

const MOON_SIGNS = [
  { name: '月亮白羊座', trait: '情绪直接，反应快速' },
  { name: '月亮金牛座', trait: '情绪稳定，需要安全感' },
  { name: '月亮双子座', trait: '情绪多变，好奇心强' },
  { name: '月亮巨蟹座', trait: '情绪敏感，重视家庭' },
  { name: '月亮狮子座', trait: '情绪热烈，需要关注' },
  { name: '月亮处女座', trait: '情绪细腻，追求完美' },
  { name: '月亮天秤座', trait: '情绪平和，重视和谐' },
  { name: '月亮天蝎座', trait: '情绪深刻，爱憎分明' },
  { name: '月亮射手座', trait: '情绪乐观，热爱自由' },
  { name: '月亮摩羯座', trait: '情绪内敛，稳重务实' },
  { name: '月亮水瓶座', trait: '情绪理性，独立自主' },
  { name: '月亮双鱼座', trait: '情绪敏感，富有同情心' },
];

function getSignIndex(month, day) {
  for (let i = 0; i < SIGNS.length; i++) {
    const s = SIGNS[i];
    if (month === s.start[0] && day >= s.start[1]) return i;
    if (month === s.end[0] && day <= s.end[1]) return i;
    if (month > s.start[0] && month < s.end[0]) return i;
  }
  return 0;
}

function getRisingSign(hour) {
  for (const rs of RISING_SIGNS) {
    if (hour >= rs.time[0] && hour < rs.time[1]) return rs.sign;
  }
  return '狮子座';
}

function getMoonSign(year, month, day) {
  const dayOfYear = Math.floor(
    (new Date(year, month - 1, day) - new Date(year, 0, 0)) / 86400000
  );
  const index = Math.floor((dayOfYear + year * 12 + month * 3) % 12);
  return MOON_SIGNS[index];
}

export function getSunSign(month, day) {
  const idx = getSignIndex(month, day);
  const sign = SIGNS[idx];
  const traits = SIGN_TRAITS[sign.name];
  return {
    sign: sign.name,
    element: sign.element,
    quality: sign.quality,
    traits: traits,
  };
}

export function getZodiacReport(month, day, year, hour = 12) {
  const sunIdx = getSignIndex(month, day);
  const sunSign = SIGNS[sunIdx];
  const sunTraits = SIGN_TRAITS[sunSign.name];
  const risingSign = getRisingSign(hour);
  const risingTraits = SIGN_TRAITS[risingSign];
  const moonSign = getMoonSign(year, month, day);
  return {
    sun: {
      sign: sunSign.name,
      element: sunSign.element,
      quality: sunSign.quality,
      traits: sunTraits,
    },
    rising: {
      sign: risingSign,
      traits: risingTraits,
    },
    moon: moonSign,
  };
}
