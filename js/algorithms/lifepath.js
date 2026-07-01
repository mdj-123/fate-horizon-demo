const NUMBER_MEANINGS = {
  1: { name: '创造者', trait: '独立、创新、领导力', challenge: '自我中心、固执', career: '创业者、领导者、艺术家' },
  2: { name: '合作者', trait: '温和、敏感、外交', challenge: '优柔寡断、依赖', career: '调解员、心理咨询师、外交官' },
  3: { name: '表达者', trait: '乐观、创意、社交', challenge: '散漫、情绪化', career: '作家、演员、设计师' },
  4: { name: '建设者', trait: '务实、稳定、勤奋', challenge: '刻板、缺乏变通', career: '工程师、会计师、管理者' },
  5: { name: '自由者', trait: '冒险、适应、多变', challenge: '不负责任、冲动', career: '旅行家、记者、销售' },
  6: { name: '守护者', trait: '负责、关爱、正直', challenge: '过度付出、完美主义', career: '教师、医生、社会工作者' },
  7: { name: '探索者', trait: '智慧、分析、内省', challenge: '孤僻、怀疑', career: '科学家、研究员、哲学家' },
  8: { name: '成就者', trait: '果断、雄心、管理', challenge: '功利、控制欲', career: '企业家、银行家、政治家' },
  9: { name: '博爱者', trait: '慷慨、包容、智慧', challenge: '过度牺牲、不切实际', career: '慈善家、艺术家、导师' },
  11: { name: '启迪者', trait: '直觉、灵感、理想', challenge: '焦虑、不接地气', career: '灵性导师、创新者、艺术家' },
  22: { name: '建造者', trait: '远见、务实、力量', challenge: '压力过大、负担重', career: '大型项目经理、建筑师、领袖' },
  33: { name: '大爱者', trait: '无私、慈悲、智慧', challenge: '过度付出、疲惫', career: '教育家、疗愈师、慈善家' },
};

function reduceNumber(num) {
  if (num === 11 || num === 22 || num === 33) return num;
  while (num >= 10) {
    num = String(num).split('').reduce((s, d) => s + parseInt(d), 0);
  }
  return num;
}

function sumDigits(num) {
  return String(num).split('').reduce((s, d) => s + parseInt(d), 0);
}

function letterToNumber(letter) {
  const code = letter.toUpperCase().charCodeAt(0);
  if (code < 65 || code > 90) return -1;
  const map = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8];
  return map[code - 65];
}

function getVowels(name) {
  const vowels = 'AEIOU';
  return name.split('').filter(c => vowels.includes(c.toUpperCase())).join('');
}

function getConsonants(name) {
  const vowels = 'AEIOU';
  return name.split('').filter(c => {
    const u = c.toUpperCase();
    return u >= 'A' && u <= 'Z' && !vowels.includes(u);
  }).join('');
}

export function calculateLifePath(year, month, day, name = '') {
  const lifePathNum = reduceNumber(sumDigits(year) + sumDigits(month) + sumDigits(day));
  const birthdayNum = reduceNumber(day);
  const talentNum1 = sumDigits(month) + sumDigits(day);
  const talentNum2 = sumDigits(year) + sumDigits(day);
  const talentNums = [reduceNumber(talentNum1), reduceNumber(talentNum2)];
  let soulNum = null;
  let personalityNum = null;
  if (name) {
    const vowelSum = getVowels(name).split('').reduce((s, c) => s + letterToNumber(c), 0);
    soulNum = reduceNumber(vowelSum);
    const consonantSum = getConsonants(name).split('').reduce((s, c) => s + letterToNumber(c), 0);
    personalityNum = reduceNumber(consonantSum);
  }
  return {
    lifePath: {
      number: lifePathNum,
      meaning: NUMBER_MEANINGS[lifePathNum] || NUMBER_MEANINGS[reduceNumber(lifePathNum)],
    },
    birthday: {
      number: birthdayNum,
      meaning: NUMBER_MEANINGS[birthdayNum] || NUMBER_MEANINGS[reduceNumber(birthdayNum)],
    },
    talent: talentNums.map(n => ({
      number: n,
      meaning: NUMBER_MEANINGS[n] || NUMBER_MEANINGS[reduceNumber(n)],
    })),
    soul: soulNum ? {
      number: soulNum,
      meaning: NUMBER_MEANINGS[soulNum] || NUMBER_MEANINGS[reduceNumber(soulNum)],
    } : null,
    personality: personalityNum ? {
      number: personalityNum,
      meaning: NUMBER_MEANINGS[personalityNum] || NUMBER_MEANINGS[reduceNumber(personalityNum)],
    } : null,
  };
}
