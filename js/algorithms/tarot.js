const MAJOR_ARCANA = [
  '愚者', '魔术师', '女祭司', '女皇', '皇帝', '教皇', '恋人',
  '战车', '力量', '隐士', '命运之轮', '正义', '倒吊人', '死神',
  '节制', '恶魔', '高塔', '星星', '月亮', '太阳', '审判', '世界',
];

const MINOR_SUITS = ['权杖', '圣杯', '宝剑', '星币'];
const MINOR_RANKS = ['王牌', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍从', '骑士', '王后', '国王'];

const CARD_MEANINGS = {
  '愚者': { upright: '新的开始、冒险、自由', reversed: '鲁莽、冲动、不负责' },
  '魔术师': { upright: '创造力、技巧、自信', reversed: '欺骗、浪费才能' },
  '女祭司': { upright: '直觉、智慧、神秘', reversed: '表面化、忽视直觉' },
  '女皇': { upright: '丰收、温柔、自然', reversed: '依赖、空虚' },
  '皇帝': { upright: '权威、稳定、保护', reversed: '专制、固执' },
  '教皇': { upright: '传统、信仰、教导', reversed: '叛逆、固执己见' },
  '恋人': { upright: '爱情、和谐、选择', reversed: '分离、矛盾' },
  '战车': { upright: '胜利、意志、决心', reversed: '失控、方向错误' },
  '力量': { upright: '勇气、力量、耐心', reversed: '软弱、自我怀疑' },
  '隐士': { upright: '内省、智慧、独处', reversed: '孤立、逃避' },
  '命运之轮': { upright: '转变、循环、机遇', reversed: '厄运、抗拒改变' },
  '正义': { upright: '公平、真相、因果', reversed: '不公、逃避责任' },
  '倒吊人': { upright: '牺牲、新视角、放下', reversed: '延迟、抗拒' },
  '死神': { upright: '结束、新生、转变', reversed: '停滞、抗拒改变' },
  '节制': { upright: '平衡、和谐、适度', reversed: '失衡、极端' },
  '恶魔': { upright: '束缚、欲望、沉迷', reversed: '觉醒、释放' },
  '高塔': { upright: '崩塌、觉醒、重建', reversed: '避免灾难' },
  '星星': { upright: '希望、灵感、平静', reversed: '失望、失去方向' },
  '月亮': { upright: '幻觉、恐惧、潜意识', reversed: '看清真相' },
  '太阳': { upright: '快乐、成功、活力', reversed: '暂时的阴霾' },
  '审判': { upright: '觉醒、重生、召唤', reversed: '自我怀疑' },
  '世界': { upright: '完成、成就、圆满', reversed: '未完成、停滞' },
};

function createMinorCard(suit, rank) {
  const cardName = `${suit}${rank}`;
  const suitMeanings = {
    '权杖': { upright: '行动、热情、创造', reversed: '缺乏方向、拖延' },
    '圣杯': { upright: '情感、直觉、关系', reversed: '情感过剩、不稳定' },
    '宝剑': { upright: '思维、冲突、真相', reversed: '混乱、逃避' },
    '星币': { upright: '物质、工作、健康', reversed: '财务问题、忽视' },
  };
  const base = suitMeanings[suit];
  return {
    name: cardName,
    suit,
    rank,
    type: 'minor',
    meanings: base,
  };
}

function createAllCards() {
  const cards = [];
  MAJOR_ARCANA.forEach((name, i) => {
    const m = CARD_MEANINGS[name];
    cards.push({
      name,
      arcana: 'major',
      number: i,
      meanings: { upright: m.upright, reversed: m.reversed },
    });
  });
  MINOR_SUITS.forEach(suit => {
    MINOR_RANKS.forEach(rank => {
      cards.push(createMinorCard(suit, rank));
    });
  });
  return cards;
}

const ALL_CARDS = createAllCards();

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function drawCard() {
  const card = ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)];
  const isReversed = Math.random() < 0.5;
  return {
    ...card,
    isReversed,
    meaning: isReversed ? card.meanings.reversed : card.meanings.upright,
  };
}

export function drawSingleCard() {
  return drawCard();
}

export function drawThreeCards() {
  const deck = shuffleArray(ALL_CARDS);
  const positions = ['过去', '现在', '未来'];
  return positions.map((position, i) => ({
    position,
    card: {
      ...deck[i],
      isReversed: Math.random() < 0.5,
      meaning: deck[i].meanings[Math.random() < 0.5 ? 'reversed' : 'upright'],
    },
  }));
}
