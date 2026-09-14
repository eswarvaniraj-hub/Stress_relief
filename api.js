// ==========================================================================
// Breathly / Reset - Adaptive Habit & Wellbeing Coach Backend API Client
// Talks to the Express/MySQL backend on http://localhost:5000
// Sessions are cookie-based, so every call uses credentials: 'include'.
// ==========================================================================
(function () {
  const BASE_URL = 'http://localhost:5000/api';

  async function request(path, options = {}) {
    const res = await fetch(BASE_URL + path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    let data = null;
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) {
      const message = (data && data.error) || `Request failed (${res.status})`;
      throw new Error(message);
    }
    return data;
  }

  window.api = {
    // Auth
    loginWithGoogle: (credential) =>
      request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),

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

    // Journal & Resets
    listJournal: () => request('/journal'),
    createJournalEntry: (content, mood) =>
      request('/journal', { method: 'POST', body: JSON.stringify({ content, mood }) }),
    deleteJournalEntry: (id) => request(`/journal/${id}`, { method: 'DELETE' }),

    // Breathing / Quick Reset Sessions
    createBreathingSession: (exerciseName, durationSeconds) =>
      request('/breathing/sessions', { method: 'POST', body: JSON.stringify({ exerciseName, durationSeconds }) }),

    // Preferences
    getPreferences: () => request('/preferences'),
    updatePreferences: (theme, notificationEnabled) =>
      request('/preferences', { method: 'PUT', body: JSON.stringify({ theme, notificationEnabled }) })
  };
})();
