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
    LOGIN: 'login',
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
    DISTRACTIONS: 'distractions',
    HABITS: 'habits',
    STRESS: 'stress',
    GOALS: 'goals',
    WEEKLY_REPORT: 'weekly-report',
    COACH: 'coach',
    NOT_FOUND: '404'
  };

  const ROUTE_ALIASES = {
    'dashboard': ROUTES.HOME,
    'landing': ROUTES.WELCOME,
    'breathing': ROUTES.RESET,
    'minigames': ROUTES.GAMES,
    'coach': ROUTES.COMPANION
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

    normalizeRoute(route) {
      if (!route) return ROUTES.HOME;
      const clean = String(route).replace(/^#\/?/, '').replace(/^\//, '').toLowerCase().trim();
      return ROUTE_ALIASES[clean] || clean;
    }

    getInitialRoute() {
      if (typeof window === 'undefined') return ROUTES.WELCOME;
      const rawHash = (window.location.hash || '').replace(/^#\/?/, '').toLowerCase().trim();
      const hash = this.normalizeRoute(rawHash);

      if (hash && Object.values(ROUTES).includes(hash)) return hash;

      return ROUTES.HOME; // Default candidate, protected by evaluateRoute
    }

    initHashListener() {
      if (typeof window === 'undefined') return;
      window.addEventListener('hashchange', () => {
        const rawHash = (window.location.hash || '').replace(/^#\/?/, '').toLowerCase().trim();
        const hash = this.normalizeRoute(rawHash);
        if (hash && Object.values(ROUTES).includes(hash) && hash !== this.currentRoute) {
          this.navigate(hash, {}, false);
        }
      });
    }

    /**
     * Resolves the proper route according to route protection rules:
     * 1. Onboarding incomplete:
     *    - If user exists -> Onboarding (or Login if requested)
     *    - If guest/unauthenticated -> Welcome (or Onboarding / Login if explicitly requested)
     * 2. Onboarding complete -> Target route (or Home if Welcome/Onboarding/Login requested)
     */
    evaluateRoute(targetRoute, user, profile) {
      const normalizedTarget = this.normalizeRoute(targetRoute);
      const hasCompletedOnboarding = Boolean(profile && profile.isCompleted);

      if (!hasCompletedOnboarding) {
        if (user) {
          return normalizedTarget === ROUTES.LOGIN ? ROUTES.LOGIN : ROUTES.ONBOARDING;
        }
        if (normalizedTarget === ROUTES.ONBOARDING || normalizedTarget === ROUTES.LOGIN) {
          return normalizedTarget;
        }
        return ROUTES.WELCOME;
      }

      if (normalizedTarget === ROUTES.WELCOME || normalizedTarget === ROUTES.ONBOARDING || normalizedTarget === ROUTES.LOGIN) {
        return ROUTES.HOME;
      }

      return Object.values(ROUTES).includes(normalizedTarget) ? normalizedTarget : ROUTES.HOME;
    }

    navigate(targetRoute, params = {}, updateHash = true) {
      const normalizedRoute = this.normalizeRoute(targetRoute);

      if (normalizedRoute === this.currentRoute && JSON.stringify(params) === JSON.stringify(this.currentParams)) {
        return;
      }

      // Push current to history stack if navigating to a new destination
      const lastHistory = this.history[this.history.length - 1];
      if (this.currentRoute && (!lastHistory || lastHistory.route !== this.currentRoute) && this.currentRoute !== ROUTES.WELCOME && this.currentRoute !== ROUTES.LOGIN) {
        this.history.push({ route: this.currentRoute, params: this.currentParams });
        if (this.history.length > 20) this.history.shift(); // Limit stack size
      }

      this.currentRoute = normalizedRoute;
      this.currentParams = params;

      if (updateHash && typeof window !== 'undefined') {
        window.location.hash = `#${normalizedRoute}`;
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
