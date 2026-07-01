import { calculateBaZi, getWuXing } from './algorithms/bazi.js'
import { getZodiacReport } from './algorithms/zodiac.js'
import { calculateLifePath } from './algorithms/lifepath.js'
import { drawSingleCard } from './algorithms/tarot.js'
import { ZODIAC_SIGNS } from './data/zodiac-data.js'
import { FIVE_ELEMENTS } from './data/fortune-text.js'
import { callAIApi } from './ai-service.js'

const WX_MAP = { '金': 'metal', '木': 'wood', '水': 'water', '火': 'fire', '土': 'earth' }

const SHI_SHEN = {
  '甲': { '甲':'比肩','乙':'劫财','丙':'食神','丁':'伤官','戊':'偏财','己':'正财','庚':'七杀','辛':'正官','壬':'偏印','癸':'正印' },
  '乙': { '甲':'劫财','乙':'比肩','丙':'伤官','丁':'食神','戊':'正财','己':'偏财','庚':'正官','辛':'七杀','壬':'正印','癸':'偏印' },
  '丙': { '甲':'偏印','乙':'正印','丙':'比肩','丁':'劫财','戊':'食神','己':'伤官','庚':'偏财','辛':'正财','壬':'七杀','癸':'正官' },
  '丁': { '甲':'正印','乙':'偏印','丙':'劫财','丁':'比肩','戊':'伤官','己':'食神','庚':'正财','辛':'偏财','壬':'正官','癸':'七杀' },
  '戊': { '甲':'七杀','乙':'正官','丙':'偏印','丁':'正印','戊':'比肩','己':'劫财','庚':'食神','辛':'伤官','壬':'偏财','癸':'正财' },
  '己': { '甲':'正官','乙':'七杀','丙':'正印','丁':'偏印','戊':'劫财','己':'比肩','庚':'伤官','辛':'食神','壬':'正财','癸':'偏财' },
  '庚': { '甲':'偏财','乙':'正财','丙':'七杀','丁':'正官','戊':'偏印','己':'正印','庚':'比肩','辛':'劫财','壬':'食神','癸':'伤官' },
  '辛': { '甲':'正财','乙':'偏财','丙':'正官','丁':'七杀','戊':'正印','己':'偏印','庚':'劫财','辛':'比肩','壬':'伤官','癸':'食神' },
  '壬': { '甲':'食神','乙':'伤官','丙':'偏财','丁':'正财','戊':'七杀','己':'正官','庚':'偏印','辛':'正印','壬':'比肩','癸':'劫财' },
  '癸': { '甲':'伤官','乙':'食神','丙':'正财','丁':'偏财','戊':'正官','己':'七杀','庚':'正印','辛':'偏印','壬':'劫财','癸':'比肩' },
}

const TIAN_GAN_NAMES = ['甲木','乙木','丙火','丁火','戊土','己土','庚金','辛金','壬水','癸水']

const GAN_ZHI_MEANING = {
  '甲': '参天大树，有领导力和担当精神，性格正直。', '乙': '藤萝花草，柔韧有策略，善于变通和协调。',
  '丙': '太阳之火，热情开朗，感染力强，有奉献精神。', '丁': '灯烛之火，细腻深邃，重感情有洞察力。',
  '戊': '泰山之土，稳重厚实，值得信赖，有包容心。', '己': '田园之土，谦逊细腻，善于策划和经营。',
  '庚': '斧钺之金，刚毅果断，有魄力和变革精神。', '辛': '珠玉之金，精致优雅，有审美和艺术天赋。',
  '壬': '江河之水，智慧开阔，有远见和应变能力。', '癸': '雨露之水，细腻敏感，有直觉和灵性。',
  '子': '灵动机敏', '丑': '踏实坚韧', '寅': '充满活力', '卯': '温和优雅',
  '辰': '包容多变', '巳': '热情智慧', '午': '光明磊落', '未': '温和细腻',
  '申': '机敏果断', '酉': '精致内敛', '戌': '忠诚稳重', '亥': '智慧深沉',
}



function calcZodiacAnimal(year) {
  const animals = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']
  return animals[(year - 4) % 12]
}

function getLuckDirection(wxKey) {
  const map = { '木': '东方', '火': '南方', '土': '中央', '金': '西方', '水': '北方' }
  return map[wxKey] || '中'
}

function getSeasonAdvice(wxKey) {
  const map = {
    '木': '春季是能量最强的时候，适合开拓新项目和创意工作。',
    '火': '夏季是能量高峰，适合展示才华和社交活动。',
    '土': '长夏和季末适合沉淀和积累，不宜冒进。',
    '金': '秋季适合收尾和总结，是收获的季节。',
    '水': '冬季适合内省和蓄力，为来年做准备。'
  }
  return map[wxKey] || ''
}

function getDaYunAdvice(wxKey, wuxing) {
  const sorted = Object.entries(wuxing).sort((a, b) => b[1] - a[1])
  const strongest = sorted[0][0]
  const weakest = sorted[sorted.length - 1][0]

  const shengCycle = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
  const keCycle = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }

  const sheng = shengCycle[strongest]
  const ke = keCycle[strongest]

  return {
    strongest,
    weakest,
    needsElement: sheng,
    avoidElement: ke,
    shengAdvice: `加强${sheng}元素能助你发挥${strongest}的能量优势`,
    keAdvice: `注意${ke}元素对你${strongest}元素的克制影响`,
  }
}

function generateBaziAI(profile) {
  const bazi = calculateBaZi(profile.birthYear, profile.birthMonth, profile.birthDay, profile.birthHour)
  const wuxing = getWuXing(bazi)
  const dayGanName = TIAN_GAN_NAMES[bazi.day.ganIndex]
  const dayZhiMeaning = GAN_ZHI_MEANING[bazi.day.zhi] || ''
  const dayGanMeaning = GAN_ZHI_MEANING[bazi.day.gan] || ''
  const animal = calcZodiacAnimal(profile.birthYear)
  const daYun = getDaYunAdvice(Object.entries(wuxing).sort((a,b)=>b[1]-a[1])[0][0], wuxing)
  const elemInfo = FIVE_ELEMENTS[WX_MAP[daYun.strongest]]

  const yearName = TIAN_GAN_NAMES[bazi.year.ganIndex]
  const monthName = TIAN_GAN_NAMES[bazi.month.ganIndex]
  const hourName = TIAN_GAN_NAMES[bazi.hour.ganIndex]
  const riZhuShiShen = SHI_SHEN[bazi.day.gan]?.[bazi.year.gan] || ''

  const wuxingAnalysis = Object.entries(wuxing).map(([el, v]) => {
    const level = v >= 2 ? '旺盛' : v >= 1 ? '适中' : '偏弱'
    return `${el}(${level} ${v})`
  }).join('，')

  const report = getZodiacReport(profile.birthMonth, profile.birthDay, profile.birthYear, profile.birthHour)
  const zodiacSign = ZODIAC_SIGNS.find(z => z.nameZh === report.sun.sign)
  const lp = calculateLifePath(profile.birthYear, profile.birthMonth, profile.birthDay, profile.name)

  return {
    bazi,
    wuxing,
    dayGanName,
    dayGanMeaning,
    dayZhiMeaning,
    animal,
    daYun,
    elemInfo,
    wuxingAnalysis,
    yearName: `${bazi.year.gan}${bazi.year.zhi} (${yearName})`,
    monthName: `${bazi.month.gan}${bazi.month.zhi} (${monthName})`,
    dayName: `${bazi.day.gan}${bazi.day.zhi} (${dayGanName})`,
    hourName: `${bazi.hour.gan}${bazi.hour.zhi} (${hourName})`,
    riZhuShiShen,
    pillarList: [
      { label: '年柱', gan: bazi.year.gan, zhi: bazi.year.zhi, desc: yearName, sx: animal },
      { label: '月柱', gan: bazi.month.gan, zhi: bazi.month.zhi, desc: monthName, sx: '' },
      { label: '日柱', gan: bazi.day.gan, zhi: bazi.day.zhi, desc: dayGanName, sx: '' },
      { label: '时柱', gan: bazi.hour.gan, zhi: bazi.hour.zhi, desc: hourName, sx: '' },
    ],
    zodiacSign,
    lifepathNum: lp.lifePath.number,
    lifepathName: lp.lifePath.meaning.name,
  }
}

function generateDailyFortuneAI(profile) {
  const { bazi, wuxing, daYun, dayGanName, animal } = generateBaziAI(profile)

  const sorted = Object.entries(wuxing).sort((a, b) => b[1] - a[1])
  const dominantWx = sorted[0][0]
  const elemInfo = FIVE_ELEMENTS[WX_MAP[dominantWx]]

  const today = new Date()
  const dayOfMonth = today.getDate()
  const season = today.getMonth() < 3 ? '春' : today.getMonth() < 6 ? '夏' : today.getMonth() < 9 ? '秋' : '冬'

  const seasonScore = dominantWx === '木' && season === '春' ? 15 :
    dominantWx === '火' && season === '夏' ? 15 :
    dominantWx === '金' && season === '秋' ? 15 :
    dominantWx === '水' && season === '冬' ? 15 : 0

  const phaseScore = Math.sin((dayOfMonth / 30) * Math.PI * 2) * 10
  const baseScore = Math.round(40 + seasonScore + phaseScore + Math.random() * 20 - 10)

  const level = baseScore >= 65 ? 'excellent' : baseScore >= 50 ? 'good' : baseScore >= 35 ? 'neutral' : baseScore >= 20 ? 'bad' : 'terrible'
  const levelName = { excellent:'大吉', good:'吉', neutral:'平', bad:'凶', terrible:'大凶' }[level]
  const emoji = { excellent:'🌟🌟🌟', good:'🌟🌟', neutral:'⭐', bad:'🌧️', terrible:'🌪️' }[level]

  const report = getZodiacReport(profile.birthMonth, profile.birthDay, profile.birthYear, profile.birthHour)
  const zodiacSign = ZODIAC_SIGNS.find(z => z.nameZh === report.sun.sign)

  const luckyColor = zodiacSign?.luckyColor || '金色'
  const luckyNumber = Math.floor(Math.random() * 9) + 1

  const readings = {
    excellent: `今日${profile.name}的能量场极其强大！五行${dominantWx}元素在${season}季如鱼得水，${elemInfo?.positive || '充满活力'}。太阳星座${report.sun.sign}为你加持，幸运色${luckyColor}今日特别旺你。`,
    good: `今日运势温和向上，${profile.name}的${dominantWx}元素与时节相合。生肖${animal}今日社交运不错，${report.sun.sign}座的直觉格外敏锐。`,
    neutral: `今日能量平稳，${profile.name}的八字${dayGanName}日主今日需要更多的内省时间。适合整理思绪，不宜冒进。`,
    bad: `今日稍有阻碍，${profile.name}的${dominantWx}元素受到时节克制，建议以守为主。${report.sun.sign}座今日适合低调行事。`,
    terrible: `今日能量较低，${profile.name}需要特别注意保持耐心。五行运行到低位期，但这正是积蓄力量的好时机。`,
  }

  const careerAdvices = {
    excellent: `${dominantWx}元素旺盛，今日适合提出新方案、谈判或争取资源。你的领导力特别突出。`,
    good: `工作运不错，适合推进已有项目和团队协作。下午效率更高。`,
    neutral: `注意细节，适合处理文书和整理工作。避免重大决策。`,
    bad: `谨防沟通误会，重要事宜需书面确认。不宜主动推进新项目。`,
    terrible: `今日不宜做重要工作决策。以完成日常任务为主，保存实力。`,
  }

  const loveAdvices = {
    excellent: `魅力四射的一天！单身者有望在社交场合遇到有趣的人。有伴者适合安排浪漫约会。`,
    good: `感情融洽，适合深入沟通未来规划。小惊喜能让关系升温。`,
    neutral: `感情稳定平淡，给彼此一些独立空间。适合安静相处。`,
    bad: `容易因小事产生摩擦，注意控制情绪。给彼此多一些理解和包容。`,
    terrible: `感情方面容易敏感，建议给自己一些独处时间，避免冲动表达。`,
  }

  return {
    level, levelName, emoji, baseScore,
    reading: readings[level],
    career: careerAdvices[level],
    love: loveAdvices[level],
    wealth: `财运${level === 'excellent' ? '旺盛，偏财正财均有不错的收获机会' : level === 'good' ? '稳定，有小小进账的机会' : level === 'neutral' ? '平平，收支基本平衡' : level === 'bad' ? '需谨慎，避免冲动消费和投资' : '不佳，谨防破财，保管好个人财物'}`,
    health: `健康${level === 'excellent' ? '状态极佳，精力充沛，适合运动' : level === 'good' ? '良好，保持规律作息' : level === 'neutral' ? '一般，注意饮食和休息' : level === 'bad' ? '容易疲劳，注意调整作息' : '较差，注意保暖和休息'}`,
    luckyColor,
    luckyNumber,
    dominantWx,
    season,
    advice: zodiacSign?.compatibleSigns ? `今日旺你的星座：${zodiacSign.compatibleSigns.slice(0,2).join('、')}` : '保持积极心态',
  }
}

function generateZodiacAI(profile) {
  const report = getZodiacReport(profile.birthMonth, profile.birthDay, profile.birthYear, profile.birthHour)
  const zodiacSign = ZODIAC_SIGNS.find(z => z.nameZh === report.sun.sign)
  const animal = calcZodiacAnimal(profile.birthYear)

  const elementTraits = {
    '火': { energy: '热情主动', style: '直接果断', advice: '注意耐心倾听，控制冲动' },
    '土': { energy: '稳定务实', style: '踏实可靠', advice: '尝试灵活变通，接受新事物' },
    '风': { energy: '思维活跃', style: '灵活变通', advice: '注意坚持到底，避免三分钟热度' },
    '水': { energy: '感性细腻', style: '善解人意', advice: '建立边界感，避免过度情绪化' },
  }

  const sunElement = zodiacSign?.element || report.sun.element
  const traits = elementTraits[sunElement === '风' ? '风' : sunElement] || elementTraits['火']

  const risingDesc = {
    '白羊座': '充满冲劲和冒险精神的第一印象', '金牛座': '稳重可靠、给人安全感的初印象',
    '双子座': '聪明健谈、好奇心旺盛的外在表现', '巨蟹座': '温和友善、让人感到亲切的气质',
    '狮子座': '自信大方、有领导风范的外在形象', '处女座': '细致认真、有条不紊的第一印象',
    '天秤座': '优雅得体、擅长社交的外在气质', '天蝎座': '神秘深沉、让人想深入了解',
    '射手座': '乐观开朗、热爱自由的外在表现', '摩羯座': '沉稳干练、值得信赖的第一印象',
    '水瓶座': '独特前卫、思维跳跃的外在气质', '双鱼座': '温柔梦幻、富有艺术气息的初印象',
  }

  return {
    sunSign: report.sun.sign,
    sunElement: report.sun.element,
    sunQuality: report.sun.quality,
    sunDesc: zodiacSign?.description || '',
    sunStrength: zodiacSign?.strength || '',
    sunWeakness: zodiacSign?.weakness || '',
    sunLove: report.sun.traits?.love || '',
    luckyColor: zodiacSign?.luckyColor || '',
    luckyNumber: zodiacSign?.luckyNumber || 7,
    compatibleSigns: zodiacSign?.compatibleSigns || [],
    incompatibleSigns: zodiacSign?.incompatibleSigns || [],
    moonSign: report.moon.name,
    moonTrait: report.moon.trait,
    moonInsight: `${report.moon.name}的你，内心情感${report.moon.trait}。在亲密关系中，你需要被理解和倾听，而不是被指导和说教。`,
    risingSign: report.rising.sign,
    risingDesc: risingDesc[report.rising.sign] || '自信从容的第一印象',
    risingInsight: `上升${report.rising.sign}是你的社交面具，也是你逐渐成为的样子。30岁以后，上升星座的特质会越来越明显。`,
    elementTraits: traits,
    animal,
    overallReading: `${profile.name}的太阳${report.sun.sign}赋予你${zodiacSign?.personality?.slice(0,2).join('、') || traits.energy}的性格底色，月亮${report.moon.name}则让你在亲近的人面前展现${report.moon.trait}的一面。而上升${report.rising.sign}是你给世界的第一印象——${risingDesc[report.rising.sign] || '自信优雅'}。三者的综合，构成了独一无二的你。`,
  }
}

function generateLifePathAI(profile) {
  const result = calculateLifePath(profile.birthYear, profile.birthMonth, profile.birthDay, profile.name)
  const animal = calcZodiacAnimal(profile.birthYear)

  const monthlyCycles = ['1月:开创期', '2月:积累期', '3月:表达期', '4月:建设期', '5月:变化期', '6月:平衡期', '7月:内省期', '8月:收获期', '9月:完成期', '10月:调整期', '11月:深化期', '12月:总结期']
  const currentMonth = new Date().getMonth()
  const currentCycle = monthlyCycles[currentMonth]

  const yearCycle = new Date().getFullYear()
  const personalYear = result.lifePath.number + yearCycle
  const pyReduced = personalYear % 9 || 9
  const pyMeanings = {
    1: '全新开始的一年，适合开启新项目和设定新目标',
    2: '合作与关系的一年，耐心等待时机',
    3: '创造与表达的一年，展现你的才华',
    4: '建设与巩固的一年，脚踏实地打基础',
    5: '变化与自由的一年，拥抱新的可能性',
    6: '责任与平衡的一年，关注家庭和关系',
    7: '内省与成长的一年，深入思考和灵性探索',
    8: '成就与收获的一年，事业和财务的丰收期',
    9: '完成与释放在一年，为下一个周期做准备',
  }

  const baziInsight = (() => {
    try {
      const bazi = calculateBaZi(profile.birthYear, profile.birthMonth, profile.birthDay, profile.birthHour)
      const wuxing = getWuXing(bazi)
      const dominant = Object.entries(wuxing).sort((a, b) => b[1] - a[1])[0][0]
      return `你的八字中${dominant}元素最强，生命道路${result.lifePath.number}与${dominant}的能量相互呼应。`
    } catch {
      return ''
    }
  })()

  return {
    lifePath: { number: result.lifePath.number, name: result.lifePath.meaning.name, trait: result.lifePath.meaning.trait, career: result.lifePath.meaning.career, challenge: result.lifePath.meaning.challenge },
    birthday: { number: result.birthday.number, trait: result.birthday.meaning.trait },
    soul: result.soul ? { number: result.soul.number, name: result.soul.meaning.name, trait: result.soul.meaning.trait } : null,
    personality: result.personality ? { number: result.personality.number, name: result.personality.meaning.name, trait: result.personality.meaning.trait } : null,
    talent: result.talent?.map(t => ({ number: t.number, trait: t.meaning.trait })) || [],
    personalYear: pyReduced,
    personalYearMeaning: pyMeanings[pyReduced] || '',
    currentCycle,
    baziInsight,
    animal,
    overallReading: `${profile.name}的生命道路数字是${result.lifePath.number}——${result.lifePath.meaning.name}。这意味著你天生具有${result.lifePath.meaning.trait}的特质。${baziInsight}今年是你的个人年${pyReduced}，${pyMeanings[pyReduced] || ''}。当前${currentCycle}，适合根据周期节奏安排生活。`,
  }
}

function generatePersonalityAI(profile) {
  const baziAI = generateBaziAI(profile)
  const report = getZodiacReport(profile.birthMonth, profile.birthDay, profile.birthYear, profile.birthHour)
  const zodiacSign = ZODIAC_SIGNS.find(z => z.nameZh === report.sun.sign)
  const lp = calculateLifePath(profile.birthYear, profile.birthMonth, profile.birthDay, profile.name)
  const animal = calcZodiacAnimal(profile.birthYear)

  const { wuxing, daYun, dayGanName, elemInfo } = baziAI
  const dominantSorted = Object.entries(wuxing).sort((a, b) => b[1] - a[1])
  const dominantWx = dominantSorted[0][0]
  const weakestWx = dominantSorted[dominantSorted.length - 1][0]

  const archetypes = [
    { name: '领袖型', match: '金', desc: '果断刚毅，有天然的领导力和决策力' },
    { name: '创造型', match: '木', desc: '富有创造力和生长力，善于开拓新局面' },
    { name: '智慧型', match: '水', desc: '深沉智慧，适应力强，善于谋略' },
    { name: '热情型', match: '火', desc: '热情奔放，感染力强，行动力卓越' },
    { name: '稳健型', match: '土', desc: '稳重可靠，值得信赖，是团队的基石' },
  ]
  const archetype = archetypes.find(a => a.match === dominantWx) || { name: '综合型', desc: '五行平衡，多才多艺' }

  const strengths = [
    zodiacSign?.strength || '',
    elemInfo?.positive || '',
    `${dayGanName}日主：${baziAI.dayGanMeaning}`,
  ].filter(Boolean)

  const challenges = [
    zodiacSign?.weakness || '',
    elemInfo?.negative || '',
    `需要注意${weakestWx}元素的补足`,
  ].filter(Boolean)

  return {
    name: profile.name,
    archetype: archetype.name,
    archetypeDesc: archetype.desc,
    dominantWx,
    weakestWx,
    sunSign: report.sun.sign,
    risingSign: report.rising.sign,
    moonSign: report.moon.name,
    moonTrait: report.moon.trait,
    lifepathNum: lp.lifePath.number,
    lifepathName: lp.lifePath.meaning.name,
    animal,
    strengths,
    challenges,
    overallReading: `经过对${profile.name}的八字、星座和生命灵数的综合分析，你的命理人格属于"${archetype.name}"。你以${dominantWx}元素为主导，${archetype.desc}。太阳${report.sun.sign}赋予你${zodiacSign?.personality?.slice(0,3).join('、') || '独特'}的性格特质，生命道路${lp.lifePath.number}（${lp.lifePath.meaning.name}）则指引你的人生方向。`,
    compatibility: `与你最契合的类型是五行${daYun.shengAdvice}。在人际交往中，你容易与${dominantWx}元素强的人产生共鸣。`,
    zodiacAnimal: `${animal}年出生的你，${['机敏','踏实','勇敢','温柔','智慧','灵动'][(profile.birthYear - 4) % 6]}的气质与你的命理人格相辅相成。`,
  }
}

export function getAIDailyFortune(profile) {
  return generateDailyFortuneAI(profile)
}

export function getAIBaziReading(profile) {
  return generateBaziAI(profile)
}

export function getAIZodiacReading(profile) {
  return generateZodiacAI(profile)
}

export function getAILifePathReading(profile) {
  return generateLifePathAI(profile)
}

export function getAIPersonalityReading(profile) {
  return generatePersonalityAI(profile)
}

function buildProfileContext(profile) {
  const bazi = calculateBaZi(profile.birthYear, profile.birthMonth, profile.birthDay, profile.birthHour)
  const wx = getWuXing(bazi)
  const report = getZodiacReport(profile.birthMonth, profile.birthDay, profile.birthYear, profile.birthHour)
  const lp = calculateLifePath(profile.birthYear, profile.birthMonth, profile.birthDay, profile.name)
  const animal = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'][(profile.birthYear - 4) % 12]
  const wxSorted = Object.entries(wx).sort((a, b) => b[1] - a[1])
  return { bazi, wx, report, lp, animal, wxSorted, wxAnalysis: wxSorted.map(([k,v]) => `${k}${v}`).join(',') }
}

export async function getAIEnhancedDailyFortune(profile, store) {
  const ctx = buildProfileContext(profile)
  const prompt = `作为一位精通中西命理学的AI命理大师，请为以下用户生成今日运势分析（中文，200字以内）。格式：先给一个运势等级（大吉/吉/平/凶/大凶），然后详细解析。
用户基本信息：姓名${profile.name}，出生${profile.birthYear}年${profile.birthMonth}月${profile.birthDay}日，生肖${ctx.animal}。
八字日主：${ctx.bazi.day.gan}${ctx.bazi.day.zhi}（${ctx.bazi.day.ganIndex % 2 === 0 ? '阳' : '阴'}干）。
五行分布：${ctx.wxAnalysis}。太阳星座：${ctx.report.sun.sign}。月亮星座：${ctx.report.moon.name}。上升星座：${ctx.report.rising.sign}。
生命灵数：${ctx.lp.lifePath.number}（${ctx.lp.lifePath.meaning.name}）。`

  const result = await callAIApi(store, '你是一位精通八字、星座、生命灵数的AI命理大师，用中文输出，语言亲切有温度但不轻浮。以"🔮 AI命理分析"开头。', prompt)
  if (result) {
    const local = generateDailyFortuneAI(profile)
    local.aiReading = result
    local.usedAI = true
    return local
  }
  return generateDailyFortuneAI(profile)
}

export async function getAIEnhancedBaziReading(profile, store) {
  const ctx = buildProfileContext(profile)
  const prompt = `作为八字命理专家，请详细解析以下用户的八字命盘（300字以内）。
姓名：${profile.name}。八字四柱：年柱${ctx.bazi.year.gan}${ctx.bazi.year.zhi}、月柱${ctx.bazi.month.gan}${ctx.bazi.month.zhi}、日柱${ctx.bazi.day.gan}${ctx.bazi.day.zhi}（日主${ctx.bazi.day.gan}）、时柱${ctx.bazi.hour.gan}${ctx.bazi.hour.zhi}。
五行能量：${ctx.wxAnalysis}。生肖：${ctx.animal}。请分析日主强弱、喜用神、性格特质、事业财运走向。`

  const result = await callAIApi(store, '你是一位精通子平八字的命理大师，用中文输出，专业但不晦涩。以"☯️ AI八字解析"开头。', prompt)
  if (result) {
    const local = generateBaziAI(profile)
    local.aiReading = result
    local.usedAI = true
    return local
  }
  return generateBaziAI(profile)
}

export async function getAIEnhancedZodiacReading(profile, store) {
  const ctx = buildProfileContext(profile)
  const prompt = `作为星座占星专家，请综合解析以下用户的三星星座（300字以内）。
姓名：${profile.name}。太阳星座：${ctx.report.sun.sign}（元素${ctx.report.sun.element}）。月亮星座：${ctx.report.moon.name}。上升星座：${ctx.report.rising.sign}。
请分析太阳、月亮、上升三星的能量如何共同塑造ta的性格，以及近期的运势走向。`

  const result = await callAIApi(store, '你是一位精通西方占星学的星座大师，用中文输出，有深度有温度。以"⭐ AI星座解读"开头。', prompt)
  if (result) {
    const local = generateZodiacAI(profile)
    local.aiReading = result
    local.usedAI = true
    return local
  }
  return generateZodiacAI(profile)
}

export async function getAIEnhancedLifePathReading(profile, store) {
  const ctx = buildProfileContext(profile)
  const prompt = `作为生命灵数专家，请解析以下用户的数字命理（300字以内）。
姓名：${profile.name}。生命道路数字：${ctx.lp.lifePath.number}（${ctx.lp.lifePath.meaning.name}），特质：${ctx.lp.lifePath.meaning.trait}。
生日数：${ctx.lp.birthday.number}。八字日主：${ctx.bazi.day.gan}火元素。五行：${ctx.wxAnalysis}。
请结合数字命理和八字五行，给出人生方向指引和当下建议。`

  const result = await callAIApi(store, '你是一位精通生命灵数和数字命理的导师，用中文输出，启发式表达。以"🔢 AI灵数解析"开头。', prompt)
  if (result) {
    const local = generateLifePathAI(profile)
    local.aiReading = result
    local.usedAI = true
    return local
  }
  return generateLifePathAI(profile)
}

export async function getAIEnhancedPersonalityReading(profile, store) {
  const ctx = buildProfileContext(profile)
  const prompt = `作为命理人格分析专家，请为以下用户生成综合性格画像（400字以内）。
姓名：${profile.name}。太阳星座：${ctx.report.sun.sign}。上升星座：${ctx.report.rising.sign}。月亮星座：${ctx.report.moon.name}。
生命灵数：${ctx.lp.lifePath.number}（${ctx.lp.lifePath.meaning.name}）。八字日主：${ctx.bazi.day.gan}。
五行能量分布：${ctx.wxAnalysis}。生肖：${ctx.animal}。
请综合八字、星座、灵数、生肖四个维度，分析ta的性格特质、天赋优势、成长建议和人际相处之道。`

  const result = await callAIApi(store, '你是一位融合东西方命理学的性格分析专家，用中文输出，深刻、温暖、有洞察力。以"🧠 AI人格画像"开头。', prompt)
  if (result) {
    const local = generatePersonalityAI(profile)
    local.aiReading = result
    local.usedAI = true
    return local
  }
  return generatePersonalityAI(profile)
}
