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

    // Gemini API Key Management (stored securely in browser localStorage)
    getGeminiKey: () => {
      try {
        return localStorage.getItem('reset_gemini_api_key') || (window.ENV && window.ENV.GEMINI_API_KEY) || '';
      } catch (e) {
        return '';
      }
    },
    setGeminiKey: (key) => {
      try {
        if (key && key.trim()) {
          localStorage.setItem('reset_gemini_api_key', key.trim());
        } else {
          localStorage.removeItem('reset_gemini_api_key');
        }
      } catch (e) {}
    },
    testGeminiKey: async (keyToTest) => {
      const key = (keyToTest && keyToTest.trim()) || (window.api && window.api.getGeminiKey());
      if (!key) throw new Error('Please provide a Google Gemini API Key to test.');
      return await testGeminiApiKey(key);
    },

    // AI Coach Chat (Direct Google Gemini AI with automatic backend fallback)
    chatWithGemini: async (message, context) => {
      const clientKey = (window.api && window.api.getGeminiKey()) || '';

      // 1. If user configured a Gemini key directly in the web app, call Gemini REST API directly
      if (clientKey) {
        try {
          const directResult = await callGeminiDirect(clientKey, message, context);
          if (directResult && directResult.success) {
            return directResult;
          }
        } catch (directErr) {
          console.warn('[Gemini Direct] Direct call error:', directErr.message);
          // If the key specifically failed, return informative error
          if (directErr.message.includes('API_KEY_INVALID') || directErr.message.includes('400') || directErr.message.includes('403')) {
            throw new Error('Your Gemini API key appears invalid or expired. Please check your key in settings.');
          }
        }
      }

      // 2. Try calling backend server if available
      try {
        const backendRes = await request('/chat/gemini', {
          method: 'POST',
          body: JSON.stringify({ message, context, apiKey: clientKey })
        });
        if (backendRes && backendRes.success && backendRes.reply) {
          return backendRes;
        }
      } catch (backendErr) {
        // Backend offline or unreachable
      }

      // 3. If neither worked, inform caller that offline fallback is needed
      return { success: false, isOffline: true };
    }
  };

  // Helper: Test Gemini API key against active Gemini models
  async function testGeminiApiKey(cleanKey) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Ping test. Reply with "OK".' }] }],
            generationConfig: { maxOutputTokens: 10 }
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return { success: true, model };
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          lastError = (errData && errData.error && errData.error.message) || `HTTP error ${res.status}`;
        }
      } catch (e) {
        lastError = e.message;
      }
    }
    throw new Error(lastError || 'Could not connect to Gemini API. Check your internet connection or API key.');
  }

  // Helper: Action tag parsing for proactive interactive buttons
  function parseGeminiAction(replyText, messageText) {
    let actionType = null;
    const lower = ((replyText || '') + ' ' + (messageText || '')).toLowerCase();
    if (lower.includes('bubble rhythm') || lower.includes('bubble break') || lower.includes('pop bubble') || lower.includes('bubble game')) {
      actionType = 'play-bubble-rhythm';
    } else if (lower.includes('pomodoro') || lower.includes('focus block') || lower.includes('focus sprint') || lower.includes('25-minute') || lower.includes('study sprint')) {
      actionType = 'start-focus-sprint';
    } else if (lower.includes('minimum mode') || lower.includes('micro-dose') || lower.includes('micro step')) {
      actionType = 'min-mode-all';
    } else if (lower.includes('box breathing') || lower.includes('breathing reset') || lower.includes('4-7-8') || lower.includes('deep breath')) {
      actionType = 'quick-reset';
    } else if (lower.includes('distraction radar') || lower.includes('interruption') || lower.includes('phone distraction')) {
      actionType = 'open-radar';
    }
    return actionType;
  }

  // Helper: Direct client-side Gemini REST execution
  async function callGeminiDirect(apiKey, message, context) {
    if (!apiKey) return null;
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    let contextSummary = 'No specific habit telemetry provided.';
    if (context && typeof context === 'object') {
      const parts = [];
      if (context.userName) parts.push(`User Name: ${context.userName}`);
      if (context.statusTitle) parts.push(`Status: ${context.statusTitle}`);
      if (context.workload) parts.push(`Daily Workload: ${context.workload}`);
      if (context.sleepQuality) parts.push(`Sleep Quality: ${context.sleepQuality}`);
      if (context.stressRating) parts.push(`Stress: ${context.stressRating}/10`);
      if (context.topDistraction) parts.push(`Top Distraction: ${context.topDistraction}`);
      if (context.habitsCount !== undefined) {
        parts.push(`Habits completed today: ${context.completedHabits || 0}/${context.habitsCount}`);
      }
      if (context.isHighStressState) parts.push('Stress State: High Cognitive Load');
      if (parts.length > 0) contextSummary = parts.join(' | ');
    }

    const systemPrompt = `You are Reset Coach, an empathetic, intelligent, and scientifically-grounded digital well-being and habit mentor built into the Breathly/Reset platform.
Your mission is to help users with focus, overcoming procrastination, daily habits, stress management, sleep, study techniques, and mindful balance.

User Context:
${contextSummary}

Core Guidelines:
1. Directly and accurately answer the user's specific question or request. Whatever the user asks—be it basic science, definitions, study advice, daily routine, or emotional check-in—address their exact inquiry first.
2. Be warm, empathetic, conversational, and concise (keep responses to 2-4 clear sentences or short paragraphs; never lecture or write walls of text).
3. Ground habit or focus advice in behavioral neuroscience (e.g. lowering friction, micro-steps, 25-minute Pomodoro sprints, 4-7-8 breathing, or non-screen recovery).
4. Do NOT repeat canned scripts or force irrelevant recommendations if the user is asking a direct question.
5. Do NOT provide clinical or medical diagnoses. Keep guidance practical, supportive, and actionable.`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nUser Question/Message: "${message.trim()}"` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
        topP: 0.9
      }
    };

    let lastError = null;
    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText && replyText.trim()) {
            return {
              success: true,
              reply: replyText.trim(),
              model,
              actionType: parseGeminiAction(replyText, message)
            };
          }
        } else {
          const errText = await res.text();
          lastError = `${model} returned status ${res.status}: ${errText.substring(0, 150)}`;
          console.warn(`[Gemini Direct] ${lastError}`);
        }
      } catch (networkErr) {
        lastError = `Network error calling ${model}: ${networkErr.message}`;
        console.warn(`[Gemini Direct] ${lastError}`);
      }
    }

    throw new Error(lastError || 'No candidate returned from Gemini models');
  }
})();

