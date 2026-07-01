import { Router } from './router.js'
import { Store } from './store.js'
import { drawSingleCard, drawThreeCards } from './algorithms/tarot.js'
import { getZodiacReport } from './algorithms/zodiac.js'
import { ZODIAC_SIGNS } from './data/zodiac-data.js'
import { drawRadarChart } from './components/chart.js'
import { ParticleBackground } from './components/particle.js'
import { DestinyWheel } from './components/wheel.js'
import {
  getAIDailyFortune, getAIBaziReading,
  getAIZodiacReading, getAILifePathReading, getAIPersonalityReading,
  getAIEnhancedDailyFortune, getAIEnhancedBaziReading,
  getAIEnhancedZodiacReading, getAIEnhancedLifePathReading,
  getAIEnhancedPersonalityReading
} from './ai-engine.js'

const APP_KEY = 'fate-horizon'
const store = new Store(APP_KEY)
let particleBg = null
let wheel = null

function getNav() {
  const insp = store.getInspiration()
  const hash = window.location.hash || '#home'
  const tabs = [
    { id: 'home', href: '#home', label: '✦ 命运轮盘' },
    { id: 'plaza', href: '#plaza', label: '功能广场' },
    { id: 'daily', href: '#daily', label: '今日运势' },
    { id: 'profile', href: '#profile', label: '我的' },
  ]
  return `<nav class="app-nav">
    <div class="nav-inner">
      <div class="nav-tabs">
        ${tabs.map(t => `<a href="${t.href}" class="nav-tab ${hash.replace(/[?#].*/,'') === t.href ? 'active' : ''}">${t.label}</a>`).join('')}
      </div>
      <div class="nav-right">
        <div class="inspiration-badge" title="灵感值">✦ ${insp}</div>
        <a href="#ai-settings" class="ai-config-btn" title="智能配置">⚙️</a>
      </div>
    </div>
  </nav>`
}

function getShell(content) {
  return `<div class="app-shell">${getNav()}<main class="app-main">${content}</main></div>`
}

function getLoadingShell(title) {
  return getShell(`<div class="loading-page"><div class="loading-spinner"></div><p>🔮 ${title}...</p></div>`)
}

async function renderWithAI(renderFn, loadingTitle) {
  const root = document.getElementById('app')
  root.innerHTML = getLoadingShell(loadingTitle)
  await renderFn()
}

// ===== HOME =====
function renderHome() {
  const profile = store.getProfile()
  const hasAI = store.hasAIConfig()

  const root = document.getElementById('app')
  root.innerHTML = getShell(`
    <section class="home-hero">
      ${!profile ? `
        <div class="hh-welcome">
          <div class="hh-icon">✦</div>
          <h1>命运交汇</h1>
          <p class="hh-sub">融合八字·星座·灵数·生肖，AI智能分析你的命理人格</p>
          <a href="#profile-create" class="btn btn-primary hh-btn">📝 创建命理档案</a>
          <p class="hh-hint">创建档案后解锁全部AI功能 · 已建档案可直接使用</p>
        </div>
      ` : `
        <div class="hh-welcome">
          <div class="hh-icon">✦</div>
          <h1>欢迎回来，${profile.name}</h1>
          <p class="hh-sub">${hasAI ? '已接入API · 点击下方探索你的命运' : '⚙️ 请在"我的→智能配置"中配置API以解锁增强分析'}</p>
          <div class="hh-actions">
            <a href="#daily" class="btn btn-primary hh-btn">☀️ 今日运势</a>
            <a href="#bazi" class="btn btn-ghost hh-btn">☯️ 八字排盘</a>
            <a href="#zodiac" class="btn btn-ghost hh-btn">⭐ 星座占星</a>
          </div>
          <div class="wh-stats">
            <span>✦${store.getInspiration()}灵感</span>
            <span>🃏${store.getCollectionCount()}卡牌</span>
            <span>📅${store.getCheckInStreak()}天签到</span>
          </div>
        </div>
      `}
      <div class="wheel-area">
        <div class="wheel-area-inner">
          <canvas id="wheel-canvas"></canvas>
          <div class="wheel-result-box" id="wheel-result-box"></div>
        </div>
        <p class="wheel-tip">${profile ? '点击轮盘·星座指引' : '点击旋转轮盘'}</p>
      </div>
    </section>
    <section class="ff-section">
      <div class="feature-grid">
        ${[
          { h:'#daily', i:'☀️', t:'今日运势', d:'八字+星座智能分析当日运程' },
          { h:'#bazi', i:'☯️', t:'八字排盘', d:'四柱八字+十神+五行能量解析' },
          { h:'#zodiac', i:'⭐', t:'星座占星', d:'太阳月亮上升三星综合解读' },
          { h:'#lifepath', i:'🔢', t:'生命灵数', d:'道路数字+个人年周期预测' },
          { h:'#personality', i:'🧠', t:'性格解码', d:'八字+星座+灵数综合画像' },
          { h:'#tarot', i:'🃏', t:'塔罗占卜', d:'3D翻牌·单张/三张牌阵' },
          { h:'#lottery', i:'🎯', t:'幸运灵签', d:'摇签体验·心诚则灵' },
          { h:'#plaza', i:'🏛️', t:'全部功能', d:'探索更多命运面向' },
        ].map(f => profile ? `<a href="${f.h}" class="feat-card"><div class="feat-icon">${f.i}</div><div class="feat-info"><h3>${f.t}</h3><p>${f.d}</p></div></a>` : `<div class="feat-card disabled" onclick="window.location.hash='#profile-create'"><div class="feat-icon">${f.i}</div><div class="feat-info"><h3>${f.t}</h3><p>${f.d}</p></div></div>`).join('')}
      </div>
    </section>
  `)

  if (!wheel) {
    wheel = new DestinyWheel('wheel-canvas')
    wheel.onSpinEnd = r => {
      const box = document.getElementById('wheel-result-box')
      if (box) {
        box.innerHTML = `<div class="wr-anim"><span class="wr-sym">${r.symbol}</span><span class="wr-name">${r.name}</span></div>`
        box.classList.add('show'); setTimeout(() => box.classList.remove('show'), 3000)
      }
      store.addInspiration(2)
    }
  }
}

// ===== PLAZA =====
function renderPlaza() {
  const profile = store.getProfile()
  document.getElementById('app').innerHTML = getShell(`
    <section class="page-plaza">
      <div class="plaza-header"><h1>✦ 功能广场</h1><p>${profile ? '选择你想探索的命运面向' : '请先<a href="#profile-create" style="color:var(--accent)">创建命理档案</a>'}</p></div>
      <div class="plaza-grid">
        ${([
          { h:'#daily', i:'☀️', t:'今日运势', d:'八字+星座，智能分析当日运程', tag:'智能' },
          { h:'#bazi', i:'☯️', t:'八字排盘', d:'四柱八字+十神+五行能量图', tag:'智能' },
          { h:'#zodiac', i:'⭐', t:'星座占星', d:'太阳/月亮/上升三星深度解析', tag:'智能' },
          { h:'#lifepath', i:'🔢', t:'生命灵数', d:'生命道路+个人年+周期分析', tag:'智能' },
          { h:'#personality', i:'🧠', t:'性格解码', d:'八字+星座+灵数综合画像', tag:'智能' },
          { h:'#tarot', i:'🃏', t:'塔罗秘境', d:'3D翻牌·单张/三张牌阵', tag:'占卜' },
          { h:'#lottery', i:'🎯', t:'幸运灵签', d:'摇签体验', tag:'灵签' },
          { h:'#profile', i:'👤', t:'个人中心', d:'档案/图鉴/设置/签到', tag:'我的' },
        ]).map(t => {
          const href = !profile && t.tag === '智能' ? '#profile-create' : t.h
          return `<a href="${href}" class="plaza-card ${!profile && t.tag === '智能' ? 'disabled' : ''}"><div class="pc-icon">${t.i}</div><span class="tag">${t.tag}</span><h3>${t.t}</h3><p>${t.d}</p></a>`
        }).join('')}
      </div>
    </section>
  `)
}

// ===== AI DAILY FORTUNE =====
async function renderDaily() {
  if (!store.hasProfile()) return renderNoProfile('今日运势')

  const p = store.getProfile()
  const root = document.getElementById('app')
  root.innerHTML = getLoadingShell('AI正在分析你的今日运势')

  const ai = await getAIEnhancedDailyFortune(p, store)
  const report = getZodiacReport(p.birthMonth, p.birthDay, p.birthYear, p.birthHour)

  store.addFortuneRecord({ level: ai.levelName, interpretation: ai.aiReading || ai.reading, date: new Date().toLocaleDateString() })

  const colors = { excellent:'#4a9fdf', good:'#2ecc71', neutral:'#d4a84b', bad:'#e67e22', terrible:'#e74c3c' }
  const scoreColor = colors[ai.level] || '#d4a84b'
  const reading = ai.aiReading || ai.reading

  root.innerHTML = getShell(`
    <section class="page-fortune">
      <div class="fortune-header">
        <div class="fh-score" style="--sc:${scoreColor}">
          <div class="fh-score-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8"/><circle cx="60" cy="60" r="52" fill="none" stroke="${scoreColor}" stroke-width="8" stroke-dasharray="326.7" stroke-dashoffset="${326.7 - (ai.baseScore/100)*326.7}" stroke-linecap="round" transform="rotate(-90 60 60)"/></svg><div class="fh-score-inner"><span class="fh-level">${ai.levelName}</span><span class="fh-score-val">${ai.baseScore}</span></div></div>
        </div>
        <div class="fh-info">
          <h1>今日运势</h1>
          <p class="fh-date">${new Date().toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long'})}</p>
          <p class="fh-user">${p.name} · ${report.sun.sign} · 五行${ai.dominantWx}</p>
        </div>
      </div>
      <div class="fortune-reading card">
        <div class="reading-badge">${ai.usedAI ? '🤖 生成' : '📊 命理分析'}</div>
        <p class="reading-text">${reading}</p>
        <div class="reading-meta"><span>🎨 幸运色：${ai.luckyColor}</span><span>🔢 幸运数：${ai.luckyNumber}</span><span>🌿 ${ai.advice}</span></div>
      </div>
      <div class="fortune-dims">
        ${[
          { icon:'💼', title:'事业运', text:ai.career, color:'#4a9fdf' },
          { icon:'💖', title:'爱情运', text:ai.love, color:'#e74c3c' },
          { icon:'💰', title:'财运', text:ai.wealth, color:'#f39c12' },
          { icon:'🍃', title:'健康运', text:ai.health, color:'#2ecc71' },
        ].map(d => `<div class="fd-card" style="--c:${d.color}"><div class="fd-head"><span class="fd-icon">${d.icon}</span><h3>${d.title}</h3></div><p>${d.text}</p></div>`).join('')}
      </div>
    </section>
  `)
}

// ===== BAZI =====
async function renderBaZi() {
  if (!store.hasProfile()) return renderNoProfile('八字排盘')
  const p = store.getProfile()
  const root = document.getElementById('app')
  root.innerHTML = getLoadingShell('AI正在解析你的八字命盘')

  const ai = await getAIEnhancedBaziReading(p, store)
  const wuxingMax = Math.max(...Object.values(ai.wuxing), 1)
  const wxLabels = Object.keys(ai.wuxing)
  const wxData = Object.values(ai.wuxing).map(v => Math.round((v / wuxingMax) * 100))
  const hi = Math.floor((p.birthHour+1)/2)%12
  const hp = ['子时','丑时','寅时','卯时','辰时','巳时','午时','未时','申时','酉时','戌时','亥时']
  const reading = ai.aiReading || ''

  root.innerHTML = getShell(`
    <section class="page-bazi">
      <div class="bz-header"><h1>☯️ 八字排盘</h1><p>${p.name} · ${p.birthYear}年${p.birthMonth}月${p.birthDay}日 ${hp[hi]}时 · 生肖${ai.animal}</p></div>
      <div class="bz-pillars">${ai.pillarList.map(pl => `<div class="bz-pillar card"><div class="bz-plabel">${pl.label}${pl.sx?'·'+pl.sx:''}</div><div class="bz-pgan">${pl.gan}</div><div class="bz-pzhi">${pl.zhi}</div><div class="bz-pdesc">${pl.desc}</div></div>`).join('')}</div>
      <div class="bz-radar card"><h3>⚡ 五行能量图</h3><div class="radar-wrap"><canvas id="wx-radar"></canvas></div></div>
      <div class="bz-analysis card">
        <div class="reading-badge">${ai.usedAI ? '🤖 解析' : '📊 命理分析'}</div>
        <div class="bz-reading">
          ${reading ? `<div class="bz-section"><span class="bz-label">解读</span><span>${reading}</span></div>` : ''}
          <div class="bz-section"><span class="bz-label">日主</span><span>${ai.dayGanName} — ${ai.dayGanMeaning}</span></div>
          <div class="bz-section"><span class="bz-label">五行分布</span><span>${ai.wuxingAnalysis}</span></div>
          <div class="bz-section"><span class="bz-label">大运建议</span><span>${ai.daYun.shengAdvice} · ${ai.daYun.keAdvice}</span></div>
          <div class="bz-section"><span class="bz-label">性格特质</span><span>${ai.elemInfo?.positive || ''}</span></div>
          <div class="bz-section"><span class="bz-label">注意事项</span><span>${ai.elemInfo?.negative || ''}</span></div>
        </div>
      </div>
    </section>
  `)
  setTimeout(() => drawRadarChart('wx-radar', wxData, wxLabels), 100)
}

// ===== ZODIAC =====
async function renderZodiac() {
  if (!store.hasProfile()) return renderNoProfile('星座占星')
  const p = store.getProfile()
  const root = document.getElementById('app')
  root.innerHTML = getLoadingShell('AI正在解读你的星座命盘')

  const ai = await getAIEnhancedZodiacReading(p, store)
  const elemBg = { '火':'linear-gradient(135deg,#e74c3c20,#e67e2210)', '土':'linear-gradient(135deg,#2ecc7120,#27ae6010)', '风':'linear-gradient(135deg,#3498db20,#2980b910)', '水':'linear-gradient(135deg,#9b59b620,#8e44ad10)' }
  const reading = ai.aiReading || ai.overallReading

  root.innerHTML = getShell(`
    <section class="page-zodiac">
      <div class="zo-header"><h1>⭐ 星座占星 · 综合解读</h1><p>${p.name} 的三星星盘</p></div>
      <div class="zo-sun card" style="${elemBg[ai.sunElement]||''}">
        <h2>☀️ 太阳 ${ai.sunSign}</h2>
        <div class="zo-meta"><span>${ai.sunElement}象 · ${ai.sunQuality}</span><span>🎨${ai.luckyColor}</span><span>🔢${ai.luckyNumber}</span></div>
        <p>${ai.sunDesc}</p>
        <div class="zo-traits"><div class="zo-t"><strong>✨优势</strong> ${ai.sunStrength}</div><div class="zo-t"><strong>⚡挑战</strong> ${ai.sunWeakness}</div><div class="zo-t"><strong>💖爱情</strong> ${ai.sunLove}</div></div>
        <div class="zo-tags"><span class="tag">旺：${ai.compatibleSigns.slice(0,3).join(' ')}</span><span class="tag">克：${ai.incompatibleSigns.slice(0,2).join(' ')}</span></div>
      </div>
      <div class="zo-grid">
        <div class="card"><h3>🌙 月亮 ${ai.moonSign}</h3><p>${ai.moonTrait}</p><div class="zo-insight">${ai.moonInsight}</div></div>
        <div class="card"><h3>⬆️ 上升 ${ai.risingSign}</h3><p>${ai.risingDesc}</p><div class="zo-insight">${ai.risingInsight}</div></div>
      </div>
      <div class="card"><div class="reading-badge">${ai.usedAI?'🤖 解读':'📊 综合解读'}</div><p class="zo-reading">${reading}</p></div>
    </section>
  `)
}

// ===== LIFE PATH =====
async function renderLifePath() {
  if (!store.hasProfile()) return renderNoProfile('生命灵数')
  const p = store.getProfile()
  const root = document.getElementById('app')
  root.innerHTML = getLoadingShell('AI正在计算你的数字命理')

  const ai = await getAIEnhancedLifePathReading(p, store)
  const reading = ai.aiReading || ai.overallReading

  root.innerHTML = getShell(`
    <section class="page-lifepath">
      <div class="lp-header"><h1>🔢 生命灵数</h1><p>${p.name} 的数字密码</p></div>
      <div class="lp-main card">
        <div class="lp-big-num">${ai.lifePath.number}</div>
        <h2>生命道路 · ${ai.lifePath.name}</h2>
        <p>${ai.lifePath.trait}</p>
        <div class="lp-details"><p><strong>适合职业：</strong>${ai.lifePath.career}</p><p><strong>人生挑战：</strong>${ai.lifePath.challenge}</p></div>
      </div>
      <div class="lp-grid">
        <div class="card"><div class="lp-sm-num">${ai.birthday.number}</div><h3>🎂 生日数</h3><p>${ai.birthday.trait}</p></div>
        <div class="card"><div class="lp-sm-num">${ai.soul?ai.soul.number:'?'}</div><h3>💫 灵魂渴望</h3><p>${ai.soul?ai.soul.trait:'需英文名'}</p></div>
        <div class="card"><div class="lp-sm-num">${ai.personality?ai.personality.number:'?'}</div><h3>🎭 个性数字</h3><p>${ai.personality?ai.personality.trait:'需英文名'}</p></div>
      </div>
      <div class="lp-cycle card">
        <div class="reading-badge">${ai.usedAI?'🤖 预测':'📊 周期分析'}</div>
        ${reading ? `<p class="lp-reading" style="margin-bottom:12px">${reading}</p>` : ''}
        <p><strong>📅 个人年 ${ai.personalYear}</strong> — ${ai.personalYearMeaning}</p>
        <p><strong>📆 当前周期</strong> ${ai.currentCycle}</p>
        <p><strong>☯️ 八字呼应</strong> ${ai.baziInsight}</p>
      </div>
    </section>
  `)
}

// ===== PERSONALITY =====
async function renderPersonality() {
  if (!store.hasProfile()) return renderNoProfile('性格解码')
  const p = store.getProfile()
  const root = document.getElementById('app')
  root.innerHTML = getLoadingShell('AI正在生成你的综合人格画像')

  const ai = await getAIEnhancedPersonalityReading(p, store)
  const emojiMap = { '领袖型':'👑', '创造型':'🌱', '智慧型':'🧠', '热情型':'🔥', '稳健型':'🏔️', '综合型':'🌟' }
  const colorMap = { '领袖型':'#d4a84b', '创造型':'#2ecc71', '智慧型':'#3498db', '热情型':'#e74c3c', '稳健型':'#8B4513', '综合型':'#9b59b6' }
  const reading = ai.aiReading || ai.overallReading

  root.innerHTML = getShell(`
    <section class="page-personality">
      <div class="pp-header"><h1>🧠 性格解码</h1><p>${p.name} 的命理人格画像</p></div>
      <div class="pp-hero card">
        <div class="pp-archetype" style="background:${colorMap[ai.archetype]||'#d4a84b'}">${emojiMap[ai.archetype]||'🌟'}</div>
        <h2>${p.name}</h2>
        <p>命理人格 · <strong>${ai.archetype}</strong></p>
        <p class="pp-archetype-desc">${ai.archetypeDesc}</p>
        <div class="pp-tags">${[ai.sunSign+'座','上升'+ai.risingSign,'灵数'+ai.lifepathNum,ai.dominantWx+'元素',ai.animal+'年'].map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      </div>
      <div class="card">
        <div class="reading-badge">${ai.usedAI?'🤖 综合画像':'📊 综合画像'}</div>
        <div class="pp-reading">${reading}</div>
      </div>
      <div class="pp-grid">
        <div class="card"><h3>✨ 性格优势</h3><ul>${ai.strengths.map(s=>`<li>• ${s}</li>`).join('')}</ul></div>
        <div class="card"><h3>⚡ 成长建议</h3><ul>${ai.challenges.map(s=>`<li>• ${s}</li>`).join('')}</ul></div>
      </div>
      <div class="card"><h3>🤝 人际适配</h3><p>${ai.compatibility}</p><p class="pp-animal">${ai.zodiacAnimal}</p></div>
    </section>
  `)
}

// ===== TAROT =====
function renderTarot(params) {
  const count = params.count ? parseInt(params.count) : 1
  document.getElementById('app').innerHTML = getShell(`
    <section class="page-tarot">
      <div class="tarot-header"><h1>🃏 塔罗秘境</h1><p>集中意念，点击抽取</p></div>
      <div class="tarot-mode">
        <a href="#tarot/1" class="btn ${count===1?'btn-primary':'btn-ghost'}">每日一牌</a>
        <a href="#tarot/3" class="btn ${count===3?'btn-primary':'btn-ghost'}">三张牌阵</a>
      </div>
      <div class="tarot-table-wrap card">
        <div class="tarot-table" id="ttable"><div class="tarot-hint">点击下方按钮，${count===1?'抽取一张塔罗牌':'抽取三张牌阵'}</div></div>
      </div>
      <button class="btn btn-primary draw-btn" id="tdraw">✨ ${count===1?'抽取一张':'抽取三张'}</button>
    </section>
  `)
  document.getElementById('tdraw').addEventListener('click', () => {
    const table = document.getElementById('ttable'); const btn = document.getElementById('tdraw')
    btn.disabled = true; btn.textContent = '🔮 连接命运中...'
    table.innerHTML = ''
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div'); el.className = 'tarot-back-card'
      el.style.animationDelay = `${i*0.3}s`
      el.innerHTML = '<div class="tbc-pattern">✦</div><div class="tbc-label">?</div>'
      table.appendChild(el)
    }
    setTimeout(() => {
      const cards = count === 1 ? [drawSingleCard()] : drawThreeCards()
      const posNames = count === 1 ? [''] : ['过去','现在','未来']
      table.innerHTML = ''
      cards.forEach((item, i) => {
        const card = item.card || item; const pos = posNames[i] || ''
        setTimeout(() => {
          const wrap = document.createElement('div'); wrap.className = 'tarot-card-wrap'
          wrap.innerHTML = `<div class="tci ${card.isReversed?'reversed':''}"><div class="tci-front"><div class="tci-top">${pos?'<span class="tci-pos">'+pos+'</span>':''}<span class="tci-or">${card.isReversed?'↕逆位':'↑正位'}</span></div><div class="tci-name">${card.name}</div><div class="tci-mean">${card.meaning}</div></div><div class="tci-back"><div class="tbc-pattern">✦</div></div></div>`
          wrap.querySelector('.tci').classList.add('flipped')
          table.appendChild(wrap)
          const mt = document.createElement('div'); mt.className = 'tci-meaning-text'
          mt.style.animationDelay = '0.5s'
          mt.innerHTML = `${pos?'<div class="tci-plabel">—— '+pos+' ——</div>':''}<div>${card.meaning}</div>`
          table.appendChild(mt)
          store.addCard(card.name)
        }, i*800+300)
      })
      store.addInspiration(count===1?2:3)
      btn.textContent = '🔮 再抽一次'; btn.disabled = false
    }, count*300+1000)
  })
}

// ===== LOTTERY =====
function renderLottery() {
  const fortunes = [
    { level:'上上签·大吉', t:'万物皆顺，心想事成。你所期待的好消息即将到来，保持开放的心态迎接惊喜。', icon:'🌟', a:'今天适合开启新计划，你的能量场格外强大。' },
    { level:'上签·吉', t:'运势平稳向上，努力将看到成效。保持耐心，一切都在向好的方向发展。', icon:'⭐', a:'稳步推进已有计划，小确幸会在不经意间降临。' },
    { level:'中签·平', t:'运势平稳，无大喜亦无大忧。适合反思和规划，静下心来梳理思路。', icon:'☀️', a:'今天适合处理日常事务，心态决定一切。' },
    { level:'下签·凶', t:'稍遇阻碍，谨慎应对。沟通上可能出现误会，重要事宜最好书面确认。', icon:'🌤️', a:'保持冷静，避开锋芒，等待时机转好。' },
    { level:'下下签·大凶', t:'运势低迷，诸事不宜。低调行事，保存实力，最困难的时刻往往是转机的前奏。', icon:'🌧️', a:'减少社交，给自己独处的空间。' },
  ]
  document.getElementById('app').innerHTML = getShell(`
    <section class="page-lottery">
      <div class="lottery-header"><h1>🎯 幸运灵签</h1><p>心诚则灵，点击摇签</p></div>
      <div class="lottery-area card">
        <div class="lottery-jar" id="ljar">
          <div class="ljar-body"><div class="ljar-sticks" id="lsticks"><div class="lst"></div><div class="lst"></div><div class="lst"></div><div class="lst"></div><div class="lst"></div></div><div class="ljar-label">签</div></div>
        </div>
        <div class="lresult" id="lresult"><div class="lresult-placeholder">点击摇签，获取指引</div></div>
        <button class="btn btn-primary draw-btn" id="ldraw">✨ 摇一签</button>
      </div>
    </section>
  `)
  document.getElementById('ldraw').addEventListener('click', () => {
    const btn = document.getElementById('ldraw'); const jar = document.getElementById('ljar')
    const sticks = document.getElementById('lsticks'); const res = document.getElementById('lresult')
    btn.disabled = true; btn.textContent = '🔮 摇签中...'
    jar.classList.add('shaking'); res.innerHTML = '<div class="lresult-placeholder">🔮 签筒摇动中...</div>'
    setTimeout(() => {
      jar.classList.remove('shaking')
      const idx = Math.floor(Math.random() * fortunes.length); const f = fortunes[idx]
      sticks.innerHTML = ''; const fly = document.createElement('div')
      fly.className = 'lst fly'; fly.textContent = '✧'; sticks.appendChild(fly)
      setTimeout(() => {
        res.innerHTML = `<div class="ldisplay"><div class="ld-icon">${f.icon}</div><h2 class="ld-level">${f.level}</h2><p class="ld-text">${f.t}</p><div class="advice-box">💡 ${f.a}</div></div>`
        btn.textContent = '🔄 再摇一签'; btn.disabled = false; store.addInspiration(1)
      }, 500)
    }, 1800)
  })
}

// ===== PROFILE =====
function renderProfile() {
  const profile = store.getProfile()
  const hasAI = store.hasAIConfig()

  if (!profile) {
    document.getElementById('app').innerHTML = getShell(`
      <section class="page-profile"><div class="profile-header"><h1>👤 个人中心</h1><p>创建命理档案，开启AI探索之旅</p><a href="#profile-create" class="btn btn-primary">创建档案</a></div></section>
    `)
    return
  }
  const hi = Math.floor((profile.birthHour+1)/2)%12; const hp = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
  const gm = { male:'男', female:'女', other:'其他' }

  document.getElementById('app').innerHTML = getShell(`
    <section class="page-profile">
      <div class="profile-header"><h1>👤 个人中心</h1></div>
      <div class="profile-card card">
        <div class="profile-avatar">${profile.name.charAt(0)}</div>
        <h2>${profile.name}</h2>
        <p>${gm[profile.gender]||''} · ${profile.birthYear}年${profile.birthMonth}月${profile.birthDay}日 ${hp[hi]}时</p>
        <a href="#profile-create" class="btn btn-ghost">编辑档案</a>
      </div>
      <div class="profile-stats">
        <div class="card ps-card"><div class="ps-icon">✦</div><div class="ps-val">${store.getInspiration()}</div><div class="ps-label">灵感值</div></div>
        <div class="card ps-card"><div class="ps-icon">🃏</div><div class="ps-val">${store.getCollectionCount()}</div><div class="ps-label">卡牌收藏</div></div>
        <div class="card ps-card"><div class="ps-icon">🏆</div><div class="ps-val">${store.getAchievementCount()}</div><div class="ps-label">成就</div></div>
        <div class="card ps-card"><div class="ps-icon">📅</div><div class="ps-val">${store.getCheckInStreak()}天</div><div class="ps-label">连续签到</div></div>
      </div>
      <div class="card checkin-card" style="margin-bottom:16px">
        ${store.isCheckedIn() ? '<div class="checked-in"><span class="ci-icon">✓</span> 今日已签到</div>' : '<button class="btn btn-primary" id="ckbtn">签到 +10 ✦</button>'}
      </div>
      <div class="card ai-config-card">
        <h3>🤖 智能配置</h3>
        <p style="color:var(--muted);font-size:0.85rem;margin-bottom:12px">
          ${hasAI ? '✅ 已配置API · 增强功能已开启' : '❌ 未配置API · 当前使用本地规则引擎'}
        </p>
        <a href="#ai-settings" class="btn btn-ghost">${hasAI ? '修改配置' : '⚙️ 配置API'}</a>
      </div>
    </section>
  `)
  const ck = document.getElementById('ckbtn')
  if (ck) ck.addEventListener('click', () => { if (store.checkIn()) { ck.textContent = '✓ 签到成功!'; ck.disabled = true; setTimeout(renderProfile, 800) } })
}

// ===== AI SETTINGS =====
function renderAISettings() {
  const config = store.getAIConfig()

  document.getElementById('app').innerHTML = getShell(`
    <section class="page-ai-settings">
      <div class="ais-header"><h1>⚙️ 智能配置</h1><p>配置API以启用增强分析功能</p></div>
      <div class="card">
        <form id="ais-form" class="ais-form">
          <div class="fg">
            <label>API Key <span style="color:var(--accent3)">*</span></label>
            <input type="password" id="ais-key" class="fi" placeholder="sk-..." value="${config.apiKey}">
            <span class="fg-hint">支持 OpenAI / DeepSeek / 任何兼容接口</span>
          </div>
          <div class="fg">
            <label>API 地址</label>
            <input type="url" id="ais-url" class="fi" placeholder="https://api.openai.com/v1" value="${config.baseUrl}">
            <span class="fg-hint">默认 OpenAI，DeepSeek 填 https://api.deepseek.com/v1</span>
          </div>
          <div class="fg">
            <label>模型</label>
            <select id="ais-model" class="fi">
              ${['gpt-4o-mini','gpt-4o','gpt-4-turbo','deepseek-chat','deepseek-reasoner','qwen-turbo','qwen-plus','glm-4','moonshot-v1-8k'].map(m =>
                `<option value="${m}" ${config.model === m ? 'selected' : ''}>${m}</option>`
              ).join('')}
            </select>
            <span class="fg-hint">可选择其他模型，请确保API地址兼容</span>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%">💾 保存配置</button>
        </form>
      </div>
      <div class="card" style="margin-top:12px">
        <h3>💡 说明</h3>
        <p style="font-size:0.85rem;color:var(--muted);line-height:1.8">
          配置API后，相关功能将使用真实AI生成个性化分析。<br>
          未配置时自动使用本地规则引擎（无需联网，功能同样可用）。<br>
          API Key仅存储在浏览器本地，不会上传到任何服务器。<br>
          推荐模型：OpenAI gpt-4o-mini（性价比高）/ DeepSeek 免费模型。
        </p>
      </div>
    </section>
  `)

  document.getElementById('ais-form').addEventListener('submit', e => {
    e.preventDefault()
    const apiKey = document.getElementById('ais-key').value.trim()
    const baseUrl = document.getElementById('ais-url').value.trim() || 'https://api.openai.com/v1'
    const model = document.getElementById('ais-model').value
    store.setAIConfig({ apiKey, baseUrl, model })
    const btn = e.target.querySelector('button')
    btn.textContent = '✅ 已保存'
    btn.disabled = true
    setTimeout(() => { btn.textContent = '💾 保存配置'; btn.disabled = false }, 1500)
  })
}

// ===== PROFILE CREATE =====
function renderProfileCreate() {
  const ex = store.getProfile(); const isEdit = ex !== null
  const opts = [['23','子时(23-01)'],['1','丑时(01-03)'],['3','寅时(03-05)'],['5','卯时(05-07)'],['7','辰时(07-09)'],['9','巳时(09-11)'],['11','午时(11-13)'],['13','未时(13-15)'],['15','申时(15-17)'],['17','酉时(17-19)'],['19','戌时(19-21)'],['21','亥时(21-23)']]

  document.getElementById('app').innerHTML = getShell(`
    <section class="page-profile-create">
      <div class="pch"><h1>${isEdit?'✏️ 编辑档案':'📝 创建命理档案'}</h1><p>输入个人信息，开启AI智能分析</p></div>
      <div class="card">
        <form id="pf" class="pff">
          <div class="fg"><label>姓名</label><input type="text" id="pn" class="fi" placeholder="输入姓名" value="${ex?ex.name:''}" required></div>
          <div class="fg"><label>性别</label><select id="pg" class="fi"><option value="male" ${ex&&ex.gender==='male'?'selected':''}>男</option><option value="female" ${ex&&ex.gender==='female'?'selected':''}>女</option><option value="other" ${ex&&ex.gender==='other'?'selected':''}>其他</option></select></div>
          <div class="fg"><label>出生日期</label><div class="fr"><input type="number" id="py" class="fi" placeholder="年" min="1900" max="2100" value="${ex?ex.birthYear:''}" required><input type="number" id="pm" class="fi" placeholder="月" min="1" max="12" value="${ex?ex.birthMonth:''}" required><input type="number" id="pd" class="fi" placeholder="日" min="1" max="31" value="${ex?ex.birthDay:''}" required></div></div>
          <div class="fg"><label>出生时辰</label><select id="ph" class="fi">${opts.map(([v,l])=>`<option value="${v}" ${ex&&ex.birthHour===parseInt(v)?'selected':''}>${l}</option>`).join('')}</select></div>
          <button type="submit" class="btn btn-primary" style="width:100%">${isEdit?'保存修改':'✨ 创建档案'}</button>
        </form>
      </div>
    </section>
  `)
  document.getElementById('pf').addEventListener('submit', e => {
    e.preventDefault()
    const name = document.getElementById('pn').value.trim()
    const gender = document.getElementById('pg').value
    const birthYear = parseInt(document.getElementById('py').value)
    const birthMonth = parseInt(document.getElementById('pm').value)
    const birthDay = parseInt(document.getElementById('pd').value)
    const birthHour = parseInt(document.getElementById('ph').value)
    if (!name || !birthYear || !birthMonth || !birthDay) return
    store.setProfile({ name, gender, birthYear, birthMonth, birthDay, birthHour })
    if (!isEdit) store.addInspiration(10)
    window.location.hash = '#profile'
  })
}

function renderNoProfile(name) {
  document.getElementById('app').innerHTML = getShell(`
    <section class="page-noprofile"><div class="nop-header"><h1>${name}</h1><p>需要先创建命理档案才能使用</p><a href="#profile-create" class="btn btn-primary">📝 创建档案</a></div></section>
  `)
}

const routes = [
  { path:'home', render:renderHome }, { path:'plaza', render:renderPlaza },
  { path:'ai-settings', render:renderAISettings },
  { path:'daily', render:() => renderWithAI(renderDaily, 'AI正在分析今日运势') },
  { path:'tarot', render:renderTarot }, { path:'tarot/:count', render:renderTarot },
  { path:'bazi', render:() => renderWithAI(renderBaZi, 'AI正在解析八字命盘') },
  { path:'zodiac', render:() => renderWithAI(renderZodiac, 'AI正在解读星座命盘') },
  { path:'lifepath', render:() => renderWithAI(renderLifePath, 'AI正在计算数字命理') },
  { path:'lottery', render:renderLottery },
  { path:'personality', render:() => renderWithAI(renderPersonality, 'AI正在生成人格画像') },
  { path:'profile', render:renderProfile }, { path:'profile-create', render:renderProfileCreate },
]

const router = new Router(routes, to => {
  const guarded = ['daily','bazi','zodiac','lifepath','personality']
  return !guarded.includes(to.path) || store.hasProfile()
})

const App = {
  router, store,
  init() {
    particleBg = new ParticleBackground('particle-canvas')
    particleBg.start()
    router.init()
  },
  refreshAllPages() {
    const r = router.getCurrentRoute()
    if (r && r.render) r.render(router.getParams())
  }
}

export { App }
