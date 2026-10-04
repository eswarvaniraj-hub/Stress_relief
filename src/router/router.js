/**
 * Breathly Predictable Navigation Router & History Stack
 * 
 * Purpose: Provides reliable navigation state, back-button handling,
 * hash-syncing, and route protection across all screens.
 * 
 * Features:
 * - History stack: Back returns to the exact previous step (e.g., Home -> Intervention -> Breathing returns to Intervention).
 * - Hash sync: #home, #insights, #reset, #journal, #profile, #companion, #games, #onboarding, #welcome.
 * - Route protection: checks auth status and onboarding completion.
 * - Immersive mode detection: automatically hides tab bars for breathing & games.
 */

(function () {
  const ROUTE_CHANGE_EVENT = 'breathly-route-change';

  // Recognized routes
  const ROUTES = {
    WELCOME: 'welcome',
    ONBOARDING: 'onboarding',
    HOME: 'home',
    INSIGHTS: 'insights',
    RESET: 'reset',
    JOURNAL: 'journal',
    PROFILE: 'profile',
    COMPANION: 'companion',
    GAMES: 'games',
    BUBBLE_RHYTHM: 'bubble-rhythm',
    ZEN_GARDEN: 'zen-garden',
    CHECKIN: 'checkin',
    EXERCISE: 'exercise',
    NOT_FOUND: '404'
  };

  // Immersive routes that hide navigation shell
  const IMMERSIVE_ROUTES = new Set([
    ROUTES.EXERCISE,
    ROUTES.BUBBLE_RHYTHM,
    ROUTES.ZEN_GARDEN
  ]);

  // Main navigation tabs
  const MAIN_TABS = [
    { id: ROUTES.HOME, label: 'Home', icon: 'home' },
    { id: ROUTES.INSIGHTS, label: 'Insights', icon: 'bar-chart-2' },
    { id: ROUTES.RESET, label: 'Reset', icon: 'wind' },
    { id: ROUTES.JOURNAL, label: 'Journal', icon: 'book-open' },
    { id: ROUTES.PROFILE, label: 'Profile', icon: 'user' }
  ];

  class Router {
    constructor() {
      this.history = [];
      this.currentRoute = this.getInitialRoute();
      this.currentParams = {};
      this.initHashListener();
    }

    getInitialRoute() {
      if (typeof window === 'undefined') return ROUTES.WELCOME;
      const hash = (window.location.hash || '').replace(/^#\/?/, '').toLowerCase().trim();
      const path = (window.location.pathname || '').replace(/^\//, '').toLowerCase().trim();

      if (hash && Object.values(ROUTES).includes(hash)) return hash;

      return ROUTES.HOME; // Default candidate, protected by evaluateRoute
    }

    initHashListener() {
      if (typeof window === 'undefined') return;
      window.addEventListener('hashchange', () => {
        const hash = (window.location.hash || '').replace(/^#\/?/, '').toLowerCase().trim();
        if (hash && Object.values(ROUTES).includes(hash) && hash !== this.currentRoute) {
          this.navigate(hash, {}, false);
        }
      });
    }

    /**
     * Resolves the proper route according to route protection rules:
     * 1. Logged-out -> Welcome (or design-preview)
     * 2. Logged-in + onboarding incomplete -> Onboarding
     * 3. Logged-in + onboarding complete -> Target route (or Home)
     */
    evaluateRoute(targetRoute, user, profile) {
      const isAuthenticated = Boolean(user && user.id);
      const hasCompletedOnboarding = Boolean(profile && profile.isCompleted);

      if (!isAuthenticated) {
        return ROUTES.WELCOME;
      }

      if (!hasCompletedOnboarding) {
        return ROUTES.ONBOARDING;
      }

      if (targetRoute === ROUTES.WELCOME || targetRoute === ROUTES.ONBOARDING) {
        return ROUTES.HOME;
      }

      return Object.values(ROUTES).includes(targetRoute) ? targetRoute : ROUTES.HOME;
    }

    navigate(targetRoute, params = {}, updateHash = true) {
      if (targetRoute === this.currentRoute && JSON.stringify(params) === JSON.stringify(this.currentParams)) {
        return;
      }

      // Push current to history stack if navigating to a new destination
      if (this.currentRoute && !this.history.includes(this.currentRoute) && this.currentRoute !== ROUTES.WELCOME) {
        this.history.push({ route: this.currentRoute, params: this.currentParams });
        if (this.history.length > 20) this.history.shift(); // Limit stack size
      }

      this.currentRoute = targetRoute;
      this.currentParams = params;

      if (updateHash && typeof window !== 'undefined') {
        window.location.hash = `#${targetRoute}`;
      }

      this.dispatch();
    }

    goBack(fallbackRoute = ROUTES.HOME) {
      if (this.history.length > 0) {
        const previous = this.history.pop();
        this.currentRoute = previous.route;
        this.currentParams = previous.params || {};
        if (typeof window !== 'undefined') {
          window.location.hash = `#${this.currentRoute}`;
        }
        this.dispatch();
        return;
      }

      this.navigate(fallbackRoute);
    }

    canGoBack() {
      return this.history.length > 0 && !MAIN_TABS.some(t => t.id === this.currentRoute);
    }

    isImmersive() {
      return IMMERSIVE_ROUTES.has(this.currentRoute);
    }

    dispatch() {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(ROUTE_CHANGE_EVENT, {
          detail: {
            route: this.currentRoute,
            params: this.currentParams,
            canGoBack: this.canGoBack(),
            isImmersive: this.isImmersive()
          }
        }));
      }
    }
  }

  window.BreathlyRouter = new Router();
  window.BreathlyRouter.ROUTES = ROUTES;
  window.BreathlyRouter.MAIN_TABS = MAIN_TABS;
  window.BreathlyRouter.IMMERSIVE_ROUTES = IMMERSIVE_ROUTES;
  window.BreathlyRouter.ROUTE_CHANGE_EVENT = ROUTE_CHANGE_EVENT;
})();
