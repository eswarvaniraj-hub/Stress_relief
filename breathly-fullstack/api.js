// ==========================================================================
// Breathly / Reset - Adaptive Habit & Wellbeing Coach Backend API Client
// Talks to the Express/PostgreSQL backend on http://localhost:5000
// Sessions are cookie-based, so every call uses credentials: 'include'.
// ==========================================================================
(function () {
  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === ''
  );

  // In local development: use http://localhost:5000/api
  // In production: use https://stress-relief.onrender.com/api
  const BASE_URL = isLocal
    ? 'http://localhost:5000/api'
    : (window.API_BASE_URL || 'https://stress-relief.onrender.com/api');

  async function request(path, options = {}) {
    const controller = new AbortController();
    const timeoutMs = options.timeout || 8000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(BASE_URL + path, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        ...options
      });
      clearTimeout(timeoutId);
      let data = null;
      try { data = await res.json(); } catch (e) { }
      if (!res.ok) {
        const message = (data && data.error) || `Request failed (${res.status})`;
        throw new Error(message);
      }
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  window.api = {
    // Auth
    loginWithGoogle: (credential) =>
      request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
    me: () => request('/auth/me'),
    logout: async () => {
      try {
        return await request('/auth/logout', { method: 'POST', timeout: 3000 });
      } catch (e) {
        return { success: true };
      }
    },

    // Onboarding & Profile
    getProfile: () => request('/profile'),
    updateProfile: (profile) =>
      request('/profile', { method: 'PUT', body: JSON.stringify({ profile }) }),

    // Habits
    listHabits: () => request('/habits'),
    createHabit: (habit) =>
      request('/habits', { method: 'POST', body: JSON.stringify(habit) }),
    updateHabit: (id, habit) =>
      request(`/habits/${id}`, { method: 'PUT', body: JSON.stringify(habit) }),
    deleteHabit: (id) =>
      request(`/habits/${id}`, { method: 'DELETE' }),
    logHabitCompletion: (id, data) =>
      request(`/habits/${id}/complete`, { method: 'POST', body: JSON.stringify(data) }),

    // Failure Analysis
    logHabitFailure: (habitId, reason, note) =>
      request('/habits/failure', { method: 'POST', body: JSON.stringify({ habitId, reason, note }) }),
    listFailures: () => request('/habits/failures'),

    // Goals
    listGoals: () => request('/goals'),
    createGoal: (goal) =>
      request('/goals', { method: 'POST', body: JSON.stringify(goal) }),
    deleteGoal: (id) =>
      request(`/goals/${id}`, { method: 'DELETE' }),

    // Stress & Pressure Events
    createStressRecord: (stressLevel, notes = '') =>
      request('/stress', { method: 'POST', body: JSON.stringify({ stressLevel, notes }) }),
    listStressRecords: () => request('/stress'),
    createPressureEvent: (event) =>
      request('/pressure-events', { method: 'POST', body: JSON.stringify(event) }),
    listPressureEvents: () => request('/pressure-events'),
    deletePressureEvent: (id) =>
      request(`/pressure-events/${id}`, { method: 'DELETE' }),

    // Daily Well-Being Monitoring (Contextual 1-3 Questions)
    logDailyCheckIn: (checkInData) =>
      request('/check-ins', { method: 'POST', body: JSON.stringify(checkInData) }),
    getCheckInStatus: () => request('/check-ins/status'),
    getRecentCheckIns: () => request('/check-ins/recent'),

    // Distraction Tracking
    listDistractions: () => request('/distractions'),
    getDistractionSummary: () => request('/distractions/summary'),
    createDistraction: (data) =>
      request('/distractions', { method: 'POST', body: JSON.stringify(data) }),
    deleteDistraction: (id) =>
      request(`/distractions/${id}`, { method: 'DELETE' }),

    // Focus Sessions
    listFocusSessions: () => request('/focus-sessions'),
    createFocusSession: (data) =>
      request('/focus-sessions', { method: 'POST', body: JSON.stringify(data) }),
    deleteFocusSession: (id) =>
      request(`/focus-sessions/${id}`, { method: 'DELETE' }),

    // Journal & Resets
    listJournal: () => request('/journal'),
    createJournalEntry: (content, mood) =>
      request('/journal', { method: 'POST', body: JSON.stringify({ content, mood }) }),
    deleteJournalEntry: (id) => request(`/journal/${id}`, { method: 'DELETE' }),

    // Breathing / Quick Reset Sessions
    createBreathingSession: (exerciseName, durationSeconds) =>
      request('/breathing/sessions', { method: 'POST', body: JSON.stringify({ exerciseName, durationSeconds }) }),
    listBreathingSessions: () => request('/breathing/sessions'),

    // Preferences
    getPreferences: () => request('/preferences'),
    updatePreferences: (theme, notificationEnabled, dailyDistractionGoalMinutes) =>
      request('/preferences', { method: 'PUT', body: JSON.stringify({ theme, notificationEnabled, dailyDistractionGoalMinutes }) }),

    // Mini-Games & Bubble Rhythm Sessions
    saveGameSession: (sessionData) =>
      request('/games/sessions', { method: 'POST', body: JSON.stringify(sessionData) }),
    listGameSessions: () => request('/games/sessions'),
    getGameSummary: () => request('/games/summary'),

    // AI Coach Chat (Calls Google Gemini via Render Backend)
    chatWithGemini: async (message, context) => {
      const endpoints = [
        BASE_URL + '/chat/gemini',
        'https://stress-relief.onrender.com/api/chat/gemini'
      ];
      const uniqueEndpoints = [...new Set(endpoints)];

      let lastError = null;
      for (const url of uniqueEndpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 45000);
          const res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          let data = null;
          try { data = await res.json(); } catch (e) {}

          if (res.ok && data && (data.reply || (data.success && data.reply))) {
            return {
              success: true,
              reply: data.reply,
              actionType: data.actionType,
              model: data.model || 'Gemini Flash'
            };
          } else if (data && data.reply) {
            return {
              success: true,
              reply: data.reply,
              actionType: data.actionType,
              model: data.model || 'Gemini Flash'
            };
          }
        } catch (err) {
          lastError = err;
        }
      }
      return { success: false, isOffline: true, error: lastError ? lastError.message : 'Network error' };
    }
  };
})();


