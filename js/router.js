class Router {
  constructor(routes, guard = null) {
    this.routes = routes
    this.guard = guard
    this.currentRoute = null
    this.currentParams = {}
    this.pageAnimClass = 'page-enter'
    this._onHashChange = this._onHashChange.bind(this)
    this._previousHash = ''
  }

  init() {
    window.addEventListener('hashchange', this._onHashChange)
    if (!window.location.hash) {
      window.location.hash = '#home'
    } else {
      this._resolveRoute(window.location.hash)
    }
  }

  destroy() {
    window.removeEventListener('hashchange', this._onHashChange)
  }

  navigate(hash) {
    window.location.hash = hash
  }

  getParams() {
    return { ...this.currentParams }
  }

  getCurrentRoute() {
    return this.currentRoute
  }

  _onHashChange() {
    const hash = window.location.hash || '#home'
    this._resolveRoute(hash)
  }

  _resolveRoute(hash) {
    const cleanHash = hash.replace(/^#/, '')
    const parts = cleanHash.split('/')

    let matchedRoute = null
    let matchedParams = {}

    for (const route of this.routes) {
      const routeParts = route.path.split('/')
      if (routeParts.length !== parts.length) continue

      let match = true
      const params = {}

      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          const paramName = routeParts[i].slice(1)
          params[paramName] = parts[i]
        } else if (routeParts[i] !== parts[i]) {
          match = false
          break
        }
      }

      if (match) {
        matchedRoute = route
        matchedParams = params
        break
      }
    }

    if (!matchedRoute) {
      matchedRoute = this.routes.find(r => r.path === 'home')
      matchedParams = {}
    }

    const from = this.currentRoute
    const to = matchedRoute

    if (this.guard && from !== to) {
      const canProceed = this.guard(to, from)
      if (!canProceed) {
        window.location.hash = this._previousHash || '#home'
        return
      }
    }

    this.currentRoute = matchedRoute
    this.currentParams = matchedParams
    this._previousHash = hash

    document.body.classList.add('page-transitioning')
    setTimeout(() => {
      if (matchedRoute && matchedRoute.render) {
        matchedRoute.render(matchedParams)
      }
      document.body.classList.remove('page-transitioning')
      document.body.classList.add(this.pageAnimClass)
      setTimeout(() => {
        document.body.classList.remove(this.pageAnimClass)
      }, 400)
    }, 200)
  }
}

export { Router }
