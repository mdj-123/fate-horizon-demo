const DEFAULT_DATA = {
  profile: null,
  inspiration: 0,
  collection: [],
  achievements: [],
  fortuneHistory: [],
  checkIn: {},
  aiConfig: { apiKey: '', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' }
}

class Store {
  constructor(namespace = 'fate-horizon') {
    this.namespace = namespace
    this._data = null
    this._load()
  }

  _load() {
    try {
      const raw = localStorage.getItem(this.namespace)
      if (raw) {
        this._data = JSON.parse(raw)
      } else {
        this._data = JSON.parse(JSON.stringify(DEFAULT_DATA))
        this._save()
      }
    } catch {
      this._data = JSON.parse(JSON.stringify(DEFAULT_DATA))
      this._save()
    }
  }

  _save() {
    try {
      localStorage.setItem(this.namespace, JSON.stringify(this._data))
    } catch {
    }
  }

  getProfile() {
    return this._data.profile ? { ...this._data.profile } : null
  }

  setProfile(profile) {
    this._data.profile = {
      name: profile.name || '',
      gender: profile.gender || '',
      birthYear: profile.birthYear || 0,
      birthMonth: profile.birthMonth || 0,
      birthDay: profile.birthDay || 0,
      birthHour: profile.birthHour !== undefined ? profile.birthHour : 12
    }
    this._save()
  }

  hasProfile() {
    return this._data.profile !== null &&
      this._data.profile.name &&
      this._data.profile.birthYear > 0
  }

  getInspiration() {
    return this._data.inspiration
  }

  addInspiration(amount) {
    this._data.inspiration = Math.max(0, this._data.inspiration + amount)
    this._save()
    return this._data.inspiration
  }

  spendInspiration(amount) {
    if (this._data.inspiration < amount) return false
    this._data.inspiration -= amount
    this._save()
    return true
  }

  getCollection() {
    return [...this._data.collection]
  }

  addCard(cardId) {
    if (!this._data.collection.includes(cardId)) {
      this._data.collection.push(cardId)
      this._save()
      return true
    }
    return false
  }

  hasCard(cardId) {
    return this._data.collection.includes(cardId)
  }

  getCollectionCount() {
    return this._data.collection.length
  }

  getAchievements() {
    return [...this._data.achievements]
  }

  unlockAchievement(achievementId) {
    if (!this._data.achievements.includes(achievementId)) {
      this._data.achievements.push(achievementId)
      this._save()
      return true
    }
    return false
  }

  hasAchievement(achievementId) {
    return this._data.achievements.includes(achievementId)
  }

  getAchievementCount() {
    return this._data.achievements.length
  }

  getFortuneHistory() {
    return [...this._data.fortuneHistory]
  }

  addFortuneRecord(record) {
    this._data.fortuneHistory.push({
      ...record,
      timestamp: Date.now()
    })
    if (this._data.fortuneHistory.length > 200) {
      this._data.fortuneHistory = this._data.fortuneHistory.slice(-200)
    }
    this._save()
  }

  getTodayFortune() {
    const todayKey = this._getTodayKey()
    return this._data.fortuneHistory.find(r => {
      const recordDate = new Date(r.timestamp).toISOString().slice(0, 10)
      return recordDate === todayKey
    }) || null
  }

  _getTodayKey() {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  isCheckedIn() {
    const todayKey = this._getTodayKey()
    return this._data.checkIn[todayKey] === true
  }

  checkIn() {
    const todayKey = this._getTodayKey()
    if (this._data.checkIn[todayKey]) return false
    this._data.checkIn[todayKey] = true
    this._data.inspiration += 10
    this._save()
    return true
  }

  getCheckInStreak() {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const key = `${y}-${m}-${day}`
      if (this._data.checkIn[key]) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    return streak
  }

  reset() {
    this._data = JSON.parse(JSON.stringify(DEFAULT_DATA))
    this._save()
  }

  getAIConfig() {
    return this._data.aiConfig ? { ...this._data.aiConfig } : { apiKey: '', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' }
  }

  setAIConfig(config) {
    this._data.aiConfig = {
      apiKey: config.apiKey || '',
      baseUrl: config.baseUrl || 'https://api.openai.com/v1',
      model: config.model || 'gpt-4o-mini'
    }
    this._save()
  }

  hasAIConfig() {
    return this._data.aiConfig && this._data.aiConfig.apiKey && this._data.aiConfig.apiKey.length > 0
  }
}

export { Store }
