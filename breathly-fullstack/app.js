// ==========================================================================
// RESET - Personal Adaptive Habit & Wellbeing Coach (Clean Light Theme)
// Learns your routine, adapts habit difficulty, predicts high pressure,
// and provides personalized AI coaching.
// ==========================================================================

const { useState, useEffect, useRef, useMemo } = React;

// --- STORAGE KEYS ---
const STORAGE_KEY = 'coach_app_state_v2';
const USER_STORAGE_KEY = 'reset_auth_user_v1';
const GOOGLE_CLIENT_ID_KEY = 'reset_google_client_id_v1';
const PROFILE_KEY = 'coach_user_profile_v2';

const DEFAULT_GOOGLE_CLIENT_ID = '928374829102-demo.apps.googleusercontent.com';

// --- INITIAL ONBOARDING PROFILE SCHEMA ---
const DEFAULT_PROFILE = {
  isCompleted: false,
  occupation: 'Student',
  dailyHours: '6-8 hours',
  peakTime: 'evening',
  sleepDuration: '7-8 hours',
  targetHabitCategories: ['Daily Focus / Study', 'Movement & Exercise', '60s Quick Reset'],
  hurdles: ['Late nights & irregular sleep', 'Procrastination / Overthinking'],
  motivationStyle: 'streaks',
  stressBaseline: 6,
  stressCauses: ['Exams / Studies', 'Lack of time', 'Overthinking'],
  recoverySuperpowers: ['60s Breathing & Reset', 'Walking in nature', 'Music & Soundscapes'],
  privacyConsent: true
};

// --- INITIAL DEFAULT GOALS ---
const DEFAULT_INITIAL_GOALS = [
  {
    id: 'goal-1',
    title: 'Academic & Career Excellence',
    category: 'Growth',
    icon: '🎓',
    targetDate: '2026-12-31'
  },
  {
    id: 'goal-2',
    title: 'Physical Vitality & Energy',
    category: 'Health',
    icon: '🏃',
    targetDate: '2026-12-31'
  },
  {
    id: 'goal-3',
    title: 'Calm Nervous System & Balance',
    category: 'Wellbeing',
    icon: '🧘',
    targetDate: '2026-12-31'
  }
];

// --- INITIAL ADAPTIVE HABITS ---
const DEFAULT_INITIAL_HABITS = [
  {
    id: 'habit-1',
    goalId: 'goal-1',
    title: 'Deep Focus Study / Work',
    category: 'Focus',
    icon: '📚',
    targetVal: 30,
    targetUnit: 'min',
    minModeVal: 5,
    minModeUnit: 'min',
    preferredTime: 'evening',
    currentStreak: 4,
    bestStreak: 7,
    difficultyLevel: 2,
    todayStatus: null,
    todayCompletedAt: null
  },
  {
    id: 'habit-2',
    goalId: 'goal-2',
    title: 'Daily Movement or Workout',
    category: 'Movement',
    icon: '🏃',
    targetVal: 20,
    targetUnit: 'min',
    minModeVal: 2,
    minModeUnit: 'min',
    preferredTime: 'morning',
    currentStreak: 2,
    bestStreak: 5,
    difficultyLevel: 2,
    todayStatus: null,
    todayCompletedAt: null
  },
  {
    id: 'habit-3',
    goalId: 'goal-3',
    title: '60-Second Mindful Reset',
    category: 'Mindfulness',
    icon: '🫁',
    targetVal: 1,
    targetUnit: 'session',
    minModeVal: 1,
    minModeUnit: 'session',
    preferredTime: 'anytime',
    currentStreak: 6,
    bestStreak: 12,
    difficultyLevel: 1,
    todayStatus: null,
    todayCompletedAt: null
  }
];

const DEFAULT_INITIAL_STATE = {
  theme: 'porcelain', // 'porcelain' | 'sage' | 'azure' | 'sunset'
  soundEnabled: true,
  soundVolume: 0.5,
  ambientSound: 'none',
  profile: DEFAULT_PROFILE,
  goals: DEFAULT_INITIAL_GOALS,
  habits: DEFAULT_INITIAL_HABITS,
  failureLogs: [
    {
      id: 'fail-1',
      habitId: 'habit-2',
      habitTitle: 'Daily Movement or Workout',
      timestamp: Date.now() - 86400000 * 2,
      reason: 'Late night / Overslept',
      note: 'Slept after 2 AM working on deadlines.'
    }
  ],
  stressCheckIns: [
    { timestamp: Date.now() - 86400000 * 3, score: 7, tags: ['Exams', 'Lack of time'] },
    { timestamp: Date.now() - 86400000 * 2, score: 6, tags: ['Workload'] },
    { timestamp: Date.now() - 86400000 * 1, score: 5, tags: ['Better sleep'] }
  ],
  upcomingPressures: [
    {
      id: 'press-1',
      title: 'Upcoming Exam / Review Period',
      type: 'Exams',
      startDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      daysDuration: 7,
      isActive: true
    }
  ],
  resetsHistory: [
    {
      id: 'reset-1',
      timestamp: Date.now() - 86400000 * 1,
      feeling: 'Restored',
      feelingEmoji: '🫁',
      trigger: 'Study Session',
      activityId: 'breathing-426',
      activityTitle: '60s Calming Breathing (4-2-6)',
      stressBefore: 7,
      stressAfter: 3,
      rating: 'Much better',
      durationSec: 60
    }
  ]
};

// --- PROCEDURAL WEB AUDIO SYNTHESIZER ---
class CalmAudioEngine {
  constructor() {
    this.ctx = null;
    this.ambientNode = null;
    this.gainNode = null;
    this.masterGain = null;
    this.currentAmbientType = 'none';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  playChime(type = 'soft') {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      const freqs = type === 'inhale' ? [432, 648] : type === 'hold' ? [528] : [384, 576];
      const rootFreq = freqs[0];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(rootFreq, t);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freqs[1] || rootFreq * 1.5, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.2, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

      gain2.gain.setValueAtTime(0.001, t);
      gain2.gain.exponentialRampToValueAtTime(0.08, t + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 2.0);

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(this.masterGain);
      gain2.connect(this.masterGain);

      osc.start(t);
      osc2.start(t);
      osc.stop(t + 2.6);
      osc2.stop(t + 2.6);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  stopAmbient() {
    if (this.ambientNode) {
      try {
        if (this.ambientNode.stop) this.ambientNode.stop();
        if (this.ambientNode.disconnect) this.ambientNode.disconnect();
      } catch (e) {}
      this.ambientNode = null;
    }
    this.currentAmbientType = 'none';
  }

  playAmbient(type) {
    this.init();
    if (!this.ctx) return;
    if (this.currentAmbientType === type) return;
    this.stopAmbient();

    if (type === 'none') return;
    this.currentAmbientType = type;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
        } else if (type === 'waves') {
          const t = i / this.ctx.sampleRate;
          const waveMod = Math.sin(t * 0.8) * 0.5 + 0.5;
          data[i] = ((lastOut + 0.05 * white) / 1.05) * waveMod;
          lastOut = data[i];
        } else {
          data[i] = (lastOut + 0.03 * white) / 1.03;
          lastOut = data[i];
        }
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(type === 'rain' ? 850 : 420, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();
      this.ambientNode = noise;
    } catch (e) {
      console.warn('Ambient error:', e);
    }
  }
}

const audioService = new CalmAudioEngine();

// --- PRESERVED RESET / BREATHING ACTIVITIES ---
const ACTIVITIES = {
  'breathing-426': {
    id: 'breathing-426',
    title: '60s Calming Breathing (4-2-6)',
    category: 'Breathing',
    duration: 60,
    icon: 'wind',
    description: 'Activates the parasympathetic system to gently slow your heart rate in under a minute.',
    pattern: { inhale: 4, hold: 2, exhale: 6 }
  },
  'breathing-box': {
    id: 'breathing-box',
    title: 'Box Breathing (4-4-4-4)',
    category: 'Breathing',
    duration: 60,
    icon: 'square',
    description: 'A balanced equal-ratio technique used to regain focus and steady mental turbulence.',
    pattern: { inhale: 4, hold: 4, exhale: 4, hold2: 4 }
  },
  'breathing-478': {
    id: 'breathing-478',
    title: '4-7-8 Relaxing Breath',
    category: 'Breathing',
    duration: 76,
    icon: 'moon',
    description: 'A natural tranquilizer for the nervous system that eases tension and aids sleep.',
    pattern: { inhale: 4, hold: 7, exhale: 8 }
  }
};

// ==========================================================================
// HEURISTIC INTELLIGENCE & PATTERN ANALYZER
// ==========================================================================

function calculateWellbeingIndex(appState) {
  let score = 85;

  const recentCheckIns = appState.stressCheckIns || [];
  if (recentCheckIns.length > 0) {
    const latest = recentCheckIns[recentCheckIns.length - 1];
    if (latest.score >= 8) score -= 25;
    else if (latest.score >= 6) score -= 12;
  }

  const recentFailures = (appState.failureLogs || []).filter(f => Date.now() - f.timestamp < 86400000 * 3);
  score -= recentFailures.length * 8;

  const activePressures = (appState.upcomingPressures || []).filter(p => p.isActive);
  if (activePressures.length > 0) score -= 15;

  score = Math.max(10, Math.min(100, score));

  let statusLevel = 'balanced';
  let statusTitle = 'Balanced & Steady';
  let badgeClass = 'status-badge-balanced';
  let advice = 'Your routine is consistent and manageable. Keep up your steady momentum.';

  if (score < 40) {
    statusLevel = 'demanding';
    statusTitle = 'Demanding Load';
    badgeClass = 'status-badge-demanding';
    advice = 'Heavy workload and pressure detected. Switch high-effort habits to Minimum Mode and take 60s resets.';
  } else if (score < 60) {
    statusLevel = 'pressure';
    statusTitle = 'High Pressure Ahead';
    badgeClass = 'status-badge-pressure';
    advice = 'Demanding week detected. Prioritize sleep boundaries and use micro-doses instead of skipping.';
  } else if (score < 75) {
    statusLevel = 'elevated';
    statusTitle = 'Elevated Load';
    badgeClass = 'status-badge-elevated';
    advice = 'Your recent schedule shows increased friction. Consider lighter versions of demanding goals today.';
  }

  return { score, statusLevel, statusTitle, badgeClass, advice };
}

function generateAIInsights(appState) {
  const profile = appState.profile || DEFAULT_PROFILE;
  const failureLogs = appState.failureLogs || [];

  const insights = [];

  if (profile.peakTime) {
    const timeLabel = profile.peakTime === 'morning' ? 'morning (6-11 AM)' : profile.peakTime === 'evening' ? 'evening (5-9 PM)' : 'midday';
    insights.push({
      icon: 'zap',
      title: 'Peak Energy Window',
      text: `Your profile indicates peak productivity in the ${timeLabel}. Schedule deep-focus tasks here for optimal completion.`
    });
  }

  if (failureLogs.length >= 2) {
    const reasons = failureLogs.map(f => f.reason);
    const mostCommon = reasons.sort((a,b) => reasons.filter(v => v===a).length - reasons.filter(v => v===b).length).pop();
    insights.push({
      icon: 'compass',
      title: 'Pattern Detected',
      text: `Your most frequent habit obstacle is "${mostCommon}". Minimum Mode can help maintain your streak during these days.`
    });
  } else {
    insights.push({
      icon: 'shield-check',
      title: 'Consistency Safeguard',
      text: 'Remember: On exhausting days, a 2-minute "Minimum Mode" keeps the identity streak alive without burnout.'
    });
  }

  return insights;
}

// ==========================================================================
// MAIN APPLICATION COMPONENT
// ==========================================================================

function App() {
  const [appState, setAppState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('State load error:', e);
    }
    return DEFAULT_INITIAL_STATE;
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {}
    return null;
  });

  const [googleClientId, setGoogleClientId] = useState(() => {
    return localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || DEFAULT_GOOGLE_CLIENT_ID;
  });

  // Verify server session
  useEffect(() => {
    let cancelled = false;
    if (window.api && window.api.me) {
      window.api.me()
        .then(({ user: sessionUser }) => {
          if (!cancelled) setUser(sessionUser);
        })
        .catch(() => {
          if (!cancelled) setUser(null);
        });
    }
    return () => { cancelled = true; };
  }, []);

  // Save state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {}
  }, [appState]);

  // Save User
  useEffect(() => {
    try {
      if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {}
  }, [user]);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appState.theme);
  }, [appState.theme]);

  // Audio Sync
  useEffect(() => {
    audioService.setMasterVolume(appState.soundEnabled ? appState.soundVolume : 0);
  }, [appState.soundEnabled, appState.soundVolume]);

  useEffect(() => {
    if (appState.soundEnabled) audioService.playAmbient(appState.ambientSound);
    else audioService.stopAmbient();
  }, [appState.ambientSound, appState.soundEnabled]);

  // View States
  const [currentView, setCurrentView] = useState(() => {
    return appState.profile?.isCompleted ? 'dashboard' : 'landing';
  });

  // Modals
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [activeFailureHabit, setActiveFailureHabit] = useState(null);
  const [showPressureModal, setShowPressureModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeQuickReset, setActiveQuickReset] = useState(ACTIVITIES['breathing-426']);

  const wellbeing = useMemo(() => calculateWellbeingIndex(appState), [appState]);
  const insights = useMemo(() => generateAIInsights(appState), [appState]);

  // --- GOOGLE AUTH HANDLERS ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { user: verifiedUser } = await window.api.loginWithGoogle(credentialResponse.credential);
      setUser(verifiedUser);
      if (window.confetti) window.confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      setCurrentView(appState.profile?.isCompleted ? 'dashboard' : 'onboarding');
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      alert('Could not sign you in. Please try again.');
    }
  };

  const handleSignOut = async () => {
    if (window.google?.accounts?.id) {
      try { window.google.accounts.id.disableAutoSelect(); } catch (e) {}
    }
    try { await window.api.logout(); } catch (e) {}
    setUser(null);
    setCurrentView('landing');
  };

  // --- HABIT ACTION HANDLERS ---
  const handleToggleHabit = (habitId, mode = 'full') => {
    audioService.init();
    audioService.playChime('hold');

    setAppState(prev => {
      const updated = prev.habits.map(h => {
        if (h.id !== habitId) return h;
        const isCurrentSame = h.todayStatus === mode;
        const newStatus = isCurrentSame ? null : mode;
        const newStreak = isCurrentSame ? Math.max(0, h.currentStreak - 1) : h.currentStreak + 1;
        const bestStreak = Math.max(h.bestStreak, newStreak);

        return {
          ...h,
          todayStatus: newStatus,
          currentStreak: newStreak,
          bestStreak,
          todayCompletedAt: newStatus ? Date.now() : null
        };
      });

      return { ...prev, habits: updated };
    });

    if (window.confetti) {
      window.confetti({ particleCount: mode === 'min' ? 25 : 45, spread: 55, origin: { y: 0.7 } });
    }
  };

  const handleLogFailureReason = (habitId, reason, note = '') => {
    const habit = appState.habits.find(h => h.id === habitId);
    const newLog = {
      id: 'fail-' + Date.now(),
      habitId,
      habitTitle: habit ? habit.title : 'Habit',
      timestamp: Date.now(),
      reason,
      note
    };

    setAppState(prev => ({
      ...prev,
      failureLogs: [newLog, ...prev.failureLogs],
      habits: prev.habits.map(h => h.id === habitId ? { ...h, todayStatus: 'missed' } : h)
    }));

    if (user && window.api?.logHabitFailure) {
      window.api.logHabitFailure(habitId, reason, note).catch(console.warn);
    }

    setShowFailureModal(false);
    setActiveFailureHabit(null);
  };

  const handleSaveHabit = (habitData) => {
    setAppState(prev => {
      let updatedHabits;
      if (editingHabit) {
        updatedHabits = prev.habits.map(h => h.id === editingHabit.id ? { ...h, ...habitData } : h);
      } else {
        const newHabit = {
          id: 'habit-' + Date.now(),
          currentStreak: 0,
          bestStreak: 0,
          difficultyLevel: 2,
          todayStatus: null,
          todayCompletedAt: null,
          ...habitData
        };
        updatedHabits = [...prev.habits, newHabit];
      }
      return { ...prev, habits: updatedHabits };
    });

    setEditingHabit(null);
    setShowHabitModal(false);
  };

  const handleDeleteHabit = (habitId) => {
    if (window.confirm('Delete this habit?')) {
      setAppState(prev => ({
        ...prev,
        habits: prev.habits.filter(h => h.id !== habitId)
      }));
    }
  };

  const handleLogStressCheckIn = (score, tags = []) => {
    const newCheckIn = {
      timestamp: Date.now(),
      score,
      tags
    };
    setAppState(prev => ({
      ...prev,
      stressCheckIns: [...prev.stressCheckIns, newCheckIn]
    }));
    if (user && window.api?.createStressRecord) {
      window.api.createStressRecord(score, tags.join(', ')).catch(console.warn);
    }
    if (window.confetti) window.confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  const handleSavePressureEvent = (pressureData) => {
    const newEvent = {
      id: 'press-' + Date.now(),
      isActive: true,
      ...pressureData
    };
    setAppState(prev => ({
      ...prev,
      upcomingPressures: [newEvent, ...prev.upcomingPressures]
    }));
    setShowPressureModal(false);
  };

  // Launch Quick Reset
  const startQuickReset = (activity = ACTIVITIES['breathing-426']) => {
    audioService.init();
    setActiveQuickReset(activity);
    setCurrentView('exercise');
  };

  const handleExerciseComplete = (sessionDetails) => {
    const newReset = {
      id: 'reset-' + Date.now(),
      timestamp: Date.now(),
      feeling: 'Restored',
      feelingEmoji: '🫁',
      trigger: 'Adaptive Coach Reset',
      activityId: activeQuickReset.id,
      activityTitle: activeQuickReset.title,
      stressBefore: 7,
      stressAfter: 3,
      rating: 'Much better',
      durationSec: sessionDetails?.durationSec || activeQuickReset.duration
    };

    setAppState(prev => ({
      ...prev,
      resetsHistory: [newReset, ...prev.resetsHistory]
    }));

    if (user && window.api?.createBreathingSession) {
      window.api.createBreathingSession(activeQuickReset.title, newReset.durationSec).catch(console.warn);
    }

    if (window.confetti) window.confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
    setCurrentView('dashboard');
  };

  // Finish Onboarding
  const handleCompleteOnboarding = (profileData) => {
    const newProfile = { ...profileData, isCompleted: true };

    const initialHabits = profileData.targetHabitCategories.map((title, idx) => ({
      id: `habit-auto-${idx + 1}`,
      goalId: idx === 0 ? 'goal-1' : idx === 1 ? 'goal-2' : 'goal-3',
      title: title,
      category: title.includes('Study') ? 'Focus' : title.includes('Movement') || title.includes('Workout') ? 'Movement' : 'Mindfulness',
      icon: title.includes('Study') ? '📚' : title.includes('Movement') ? '🏃' : '🫁',
      targetVal: title.includes('Study') ? 30 : title.includes('Movement') ? 20 : 1,
      targetUnit: title.includes('Reset') ? 'session' : 'min',
      minModeVal: title.includes('Study') ? 5 : title.includes('Movement') ? 2 : 1,
      minModeUnit: title.includes('Reset') ? 'session' : 'min',
      preferredTime: profileData.peakTime || 'evening',
      currentStreak: 0,
      bestStreak: 0,
      difficultyLevel: 2,
      todayStatus: null,
      todayCompletedAt: null
    }));

    setAppState(prev => ({
      ...prev,
      profile: newProfile,
      habits: initialHabits.length > 0 ? initialHabits : prev.habits
    }));

    if (user && window.api?.updateProfile) {
      window.api.updateProfile(newProfile).catch(console.warn);
    }

    if (window.confetti) window.confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 } });
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-[#f8fafc] text-slate-900">
      {/* Soft Ambient Background Glows */}
      <div className="ambient-glow-orb-1"></div>
      <div className="ambient-glow-orb-2"></div>

      {/* Header Navigation */}
      <HeaderNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onSignOut={handleSignOut}
        onGoToLogin={() => setCurrentView('login')}
        onQuickReset={() => startQuickReset(ACTIVITIES['breathing-426'])}
        onOpenSafety={() => setShowSafetyModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        theme={appState.theme}
        setTheme={(t) => setAppState(prev => ({ ...prev, theme: t }))}
        soundEnabled={appState.soundEnabled}
        toggleSound={() => setAppState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
        ambientSound={appState.ambientSound}
        setAmbientSound={(s) => setAppState(prev => ({ ...prev, ambientSound: s }))}
      />

      {/* Main Dynamic View Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 z-10">
        {currentView === 'landing' && (
          <LandingView
            user={user}
            onStartOnboarding={() => setCurrentView('onboarding')}
            onDirectDashboard={() => setCurrentView('dashboard')}
            onQuickReset={() => startQuickReset(ACTIVITIES['breathing-426'])}
          />
        )}

        {currentView === 'onboarding' && (
          <OnboardingWizard
            initialProfile={appState.profile}
            onComplete={handleCompleteOnboarding}
            onCancel={() => setCurrentView(appState.profile?.isCompleted ? 'dashboard' : 'landing')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            user={user}
            profile={appState.profile}
            habits={appState.habits}
            goals={appState.goals}
            wellbeing={wellbeing}
            insights={insights}
            upcomingPressures={appState.upcomingPressures}
            onToggleHabit={handleToggleHabit}
            onAddHabit={() => { setEditingHabit(null); setShowHabitModal(true); }}
            onEditHabit={(h) => { setEditingHabit(h); setShowHabitModal(true); }}
            onDeleteHabit={handleDeleteHabit}
            onOpenFailureModal={(habit) => { setActiveFailureHabit(habit); setShowFailureModal(true); }}
            onLogStress={handleLogStressCheckIn}
            onQuickReset={startQuickReset}
            onOpenCoach={() => setCurrentView('coach')}
            onOpenGoals={() => setCurrentView('goals')}
            onOpenWeeklyReport={() => setCurrentView('weekly-report')}
            onAddPressure={() => setShowPressureModal(true)}
          />
        )}

        {currentView === 'coach' && (
          <CoachView
            user={user}
            appState={appState}
            wellbeing={wellbeing}
            onToggleHabit={handleToggleHabit}
            onQuickReset={startQuickReset}
            onBack={() => setCurrentView('dashboard')}
            onActivateMinModeAll={() => {
              setAppState(prev => ({
                ...prev,
                habits: prev.habits.map(h => h.todayStatus === null ? { ...h, todayStatus: 'min', currentStreak: h.currentStreak + 1 } : h)
              }));
              alert('⚡ All remaining daily goals adjusted to Minimum Mode! Streaks protected.');
            }}
          />
        )}

        {currentView === 'goals' && (
          <GoalsView
            goals={appState.goals}
            habits={appState.habits}
            onBack={() => setCurrentView('dashboard')}
            onAddHabit={() => { setEditingHabit(null); setShowHabitModal(true); }}
          />
        )}

        {currentView === 'weekly-report' && (
          <WeeklyReportView
            appState={appState}
            wellbeing={wellbeing}
            onBack={() => setCurrentView('dashboard')}
            onQuickReset={() => startQuickReset(ACTIVITIES['breathing-426'])}
          />
        )}

        {currentView === 'login' && (
          <LoginView
            user={user}
            googleClientId={googleClientId}
            setGoogleClientId={setGoogleClientId}
            onGoogleSuccess={handleGoogleSuccess}
            onContinueAsGuest={() => setCurrentView(appState.profile?.isCompleted ? 'dashboard' : 'onboarding')}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'exercise' && (
          <ExerciseEngine
            activity={activeQuickReset}
            onComplete={handleExerciseComplete}
            onCancel={() => setCurrentView('dashboard')}
            soundEnabled={appState.soundEnabled}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      {showHabitModal && (
        <HabitModal
          goals={appState.goals}
          habit={editingHabit}
          onSave={handleSaveHabit}
          onClose={() => { setEditingHabit(null); setShowHabitModal(false); }}
        />
      )}

      {showFailureModal && activeFailureHabit && (
        <FailureReasonModal
          habit={activeFailureHabit}
          onSave={handleLogFailureReason}
          onClose={() => { setActiveFailureHabit(null); setShowFailureModal(false); }}
        />
      )}

      {showPressureModal && (
        <PressurePlannerModal
          onSave={handleSavePressureEvent}
          onClose={() => setShowPressureModal(false)}
        />
      )}

      {showPrivacyModal && (
        <PrivacyModal
          profile={appState.profile}
          appState={appState}
          onWipeData={() => {
            if (window.confirm('Wipe all local personal profile & habit data?')) {
              setAppState(DEFAULT_INITIAL_STATE);
              setShowPrivacyModal(false);
              setCurrentView('landing');
            }
          }}
          onClose={() => setShowPrivacyModal(false)}
        />
      )}

      {showSafetyModal && <SafetyModal onClose={() => setShowSafetyModal(false)} />}
      
      {showSettingsModal && (
        <SettingsModal
          user={user}
          onSignOut={handleSignOut}
          googleClientId={googleClientId}
          setGoogleClientId={setGoogleClientId}
          theme={appState.theme}
          setTheme={(t) => setAppState(prev => ({ ...prev, theme: t }))}
          soundEnabled={appState.soundEnabled}
          toggleSound={() => setAppState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
          ambientSound={appState.ambientSound}
          setAmbientSound={(s) => setAppState(prev => ({ ...prev, ambientSound: s }))}
          onRedoOnboarding={() => { setShowSettingsModal(false); setCurrentView('onboarding'); }}
          onClearData={() => {
            if (window.confirm('Reset all your local coach and habit logs?')) {
              setAppState(DEFAULT_INITIAL_STATE);
              setShowSettingsModal(false);
              setCurrentView('landing');
            }
          }}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Footer Nav */}
      <FooterNav
        user={user}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenSafety={() => setShowSafetyModal(true)}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />
    </div>
  );
}

// ==========================================================================
// 1. HEADER NAVIGATION
// ==========================================================================

function HeaderNav({
  currentView,
  setCurrentView,
  user,
  onSignOut,
  onGoToLogin,
  onQuickReset,
  onOpenSafety,
  onOpenSettings,
  onOpenPrivacy,
  theme,
  setTheme,
  soundEnabled,
  toggleSound,
  ambientSound,
  setAmbientSound
}) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [currentView, user, soundEnabled, ambientSound]);

  const themes = [
    { id: 'porcelain', name: 'White', color: '#4f46e5' },
    { id: 'sage', name: 'Sage', color: '#059669' },
    { id: 'azure', name: 'Sky', color: '#0284c7' },
    { id: 'sunset', name: 'Peach', color: '#ea580c' }
  ];

  return (
    <header className="sticky top-0 z-40 glass-nav px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <i data-lucide="sparkles" className="w-5 h-5 text-white"></i>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                RESET
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-widest">
                COACH
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">Adaptive Habit & Wellbeing Intelligence</p>
          </div>
        </div>

        {/* Action Center */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Quick Reset 60s CTA */}
          <button
            onClick={onQuickReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 hover:border-teal-400 text-teal-700 hover:text-teal-900 text-xs font-semibold transition-all shadow-sm"
            title="Start instant 60-second breathing reset"
          >
            <i data-lucide="wind" className="w-3.5 h-3.5 text-teal-600"></i>
            <span className="hidden sm:inline">⚡ Quick Reset</span>
          </button>

          {/* AI Coach Button */}
          <button
            onClick={() => setCurrentView('coach')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              currentView === 'coach'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-slate-900'
            }`}
          >
            <i data-lucide="bot" className="w-3.5 h-3.5 text-indigo-600"></i>
            <span className="hidden sm:inline">My Coach</span>
          </button>

          {/* Theme Selector */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`w-5 h-5 rounded-full transition-transform mx-0.5 flex items-center justify-center ${
                  theme === t.id ? 'scale-110 ring-2 ring-indigo-500' : 'opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: t.color }}
                title={`${t.name} Theme`}
              />
            ))}
          </div>

          {/* Ambient Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled ? 'text-teal-700 bg-teal-50 border-teal-200' : 'text-slate-400 border-transparent hover:text-slate-700'
            }`}
            title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
          >
            <i data-lucide={soundEnabled ? 'volume-2' : 'volume-x'} className="w-4 h-4"></i>
          </button>

          {/* Privacy Center */}
          <button
            onClick={onOpenPrivacy}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Privacy Center"
          >
            <i data-lucide="shield" className="w-4 h-4"></i>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Settings"
          >
            <i data-lucide="settings" className="w-4 h-4"></i>
          </button>

          {/* User Auth Avatar / Login CTA */}
          {user ? (
            <div className="flex items-center pl-1">
              <button 
                onClick={onOpenSettings}
                className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm"
              >
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-5 h-5 rounded-full" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-800 hidden md:inline">
                  {user.name?.split(' ')[0]}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={onGoToLogin}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ==========================================================================
// 2. ONBOARDING WIZARD (STRICTLY 7 FRIENDLY QUESTIONS)
// ==========================================================================

function OnboardingWizard({ initialProfile, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const [profile, setProfile] = useState({
    occupation: initialProfile?.occupation || 'Student',
    dailyHours: initialProfile?.dailyHours || '6-8 hours',
    peakTime: initialProfile?.peakTime || 'evening',
    sleepDuration: initialProfile?.sleepDuration || '7-8 hours',
    targetHabitCategories: initialProfile?.targetHabitCategories || ['Daily Focus / Study', 'Movement & Exercise', '60s Quick Reset'],
    hurdles: initialProfile?.hurdles || ['Late nights & irregular sleep', 'Procrastination / Overthinking'],
    motivationStyle: initialProfile?.motivationStyle || 'streaks',
    stressBaseline: initialProfile?.stressBaseline || 6,
    stressCauses: initialProfile?.stressCauses || ['Exams / Studies', 'Lack of time', 'Overthinking'],
    recoverySuperpowers: initialProfile?.recoverySuperpowers || ['60s Breathing & Reset', 'Walking in nature', 'Music & Soundscapes'],
    privacyConsent: true
  });

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [step]);

  const toggleArrayItem = (key, item) => {
    setProfile(prev => {
      const current = prev[key] || [];
      const updated = current.includes(item) ? current.filter(x => x !== item) : [...current, item];
      return { ...prev, [key]: updated };
    });
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else onComplete(profile);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
    else onCancel();
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 animate-fade-in">
      {/* Step Header & Progress Track */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="onboard-step-pill">
            <i data-lucide="sparkles" className="w-3.5 h-3.5 text-indigo-600"></i>
            <span>Step {step} of {totalSteps}</span>
          </div>
          <button 
            onClick={() => onComplete(profile)} 
            className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-4"
          >
            Skip & use defaults
          </button>
        </div>
        <div className="onboard-progress-bar">
          <div 
            className="onboard-progress-fill" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Dynamic Step Content Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg relative overflow-hidden bg-white">
        {/* Step 1: Occupation & Daily Load */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">What is your primary focus?</h2>
              <p className="text-sm text-slate-600 mt-1">This helps us tailor habit durations and pacing around your core routine.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'Student', label: '🎓 Student / Academics', desc: 'Classes, study blocks, exam prep' },
                { id: 'Employed', label: '💼 Employed (Full/Part-Time)', desc: 'Work schedule, meetings, deliverables' },
                { id: 'Self-employed', label: '🚀 Founder / Self-Employed', desc: 'Flexible yet demanding daily hours' },
                { id: 'Freelancer', label: '🎨 Freelancer / Creative', desc: 'Project bursts & self-directed timing' }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setProfile({ ...profile, occupation: item.id })}
                  className={`onboard-option-card ${profile.occupation === item.id ? 'selected' : ''}`}
                >
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                Typical daily study / work hours
              </label>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {['< 4 hours', '4–6 hours', '6–8 hours', '8+ hours'].map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setProfile({ ...profile, dailyHours: h })}
                    className={`py-2 px-1 rounded-xl border transition-all ${
                      profile.dailyHours === h 
                        ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-sm' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Peak Energy & Sleep */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">When do you feel most productive?</h2>
              <p className="text-sm text-slate-600 mt-1">We will adapt your habit schedule to match your natural circadian rhythms.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'morning', label: '🌅 Early Morning (6 AM – 10 AM)', desc: 'Fresh mental clarity before the day starts' },
                { id: 'midday', label: '☀️ Midday / Afternoon (11 AM – 4 PM)', desc: 'Steady execution & collaborative energy' },
                { id: 'evening', label: '🌆 Evening Flow (5 PM – 9 PM)', desc: 'Deep focus when daily demands settle' },
                { id: 'night', label: '🌙 Night Owl (10 PM – 2 AM)', desc: 'Quiet, uninterrupted late hours' }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setProfile({ ...profile, peakTime: item.id })}
                  className={`onboard-option-card ${profile.peakTime === item.id ? 'selected' : ''}`}
                >
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                Typical sleep duration
              </label>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {['< 6 hours', '6–7 hours', '7–8 hours', '8+ hours'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setProfile({ ...profile, sleepDuration: s })}
                    className={`py-2 px-1 rounded-xl border transition-all ${
                      profile.sleepDuration === s 
                        ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-sm' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Target Habits */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">What habits would you like to build?</h2>
              <p className="text-sm text-slate-600 mt-1">Select 2 to 4 key areas. We will automatically create starter routines with Minimum Mode.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'Daily Focus / Study', label: '📚 Deep Focus Study / Work', min: '30 min (⚡ Min: 5 min)' },
                { id: 'Movement & Exercise', label: '🏃 Movement & Workout', min: '20 min (⚡ Min: 2 min)' },
                { id: '60s Quick Reset', label: '🫁 60s Breathing & Reset', min: '1 min session' },
                { id: 'Mindful Reading', label: '📖 Daily Book / Learning', min: '10 pages (⚡ Min: 2 pages)' },
                { id: 'Sleep Consistency', label: '😴 Consistent Sleep Schedule', min: 'Nightly anchor' },
                { id: 'Hydration & Nutrition', label: '💧 Hydration & Mindful Meals', min: 'Daily check-in' }
              ].map(item => {
                const isSelected = profile.targetHabitCategories.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleArrayItem('targetHabitCategories', item.id)}
                    className={`onboard-option-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-slate-900">{item.label}</div>
                      <div className="text-[11px] text-amber-700 font-medium mt-0.5">{item.min}</div>
                    </div>
                    <i data-lucide={isSelected ? 'check-circle-2' : 'circle'} className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}></i>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Habit Hurdles */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">What usually gets in the way?</h2>
              <p className="text-sm text-slate-600 mt-1">Understanding your obstacles helps the coach propose realistic recovery steps.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'Late nights & irregular sleep', label: '😴 Late nights / Sleep disruption' },
                { id: 'Procrastination / Overthinking', label: '🧠 Procrastination & overthinking' },
                { id: 'Overloaded schedule / Fatigue', label: '📚 Heavy workload & energy crashes' },
                { id: 'Digital distraction', label: '📱 Screen time & notifications' },
                { id: 'Lack of clear planning', label: '⏰ Lack of time & structure' },
                { id: 'All-or-nothing perfectionism', label: '🎯 All-or-nothing mindset' }
              ].map(item => {
                const isSelected = profile.hurdles.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleArrayItem('hurdles', item.id)}
                    className={`onboard-option-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="flex-1 font-semibold text-sm text-slate-900">{item.label}</div>
                    <i data-lucide={isSelected ? 'check-circle-2' : 'circle'} className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}></i>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Motivation Style */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">How do you prefer to stay motivated?</h2>
              <p className="text-sm text-slate-600 mt-1">Choose the coaching feedback loop that drives your consistency.</p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'streaks', label: '🔥 Streaks & Daily Momentum', desc: 'Visual streaks and consecutive day milestones' },
                { id: 'goals', label: '🎯 Clear Goal Milestones', desc: 'Connecting daily habits directly to major life ambitions' },
                { id: 'analytics', label: '📈 Visual Trends & Weekly Insights', desc: 'Clear metrics, completion percentages, and pattern data' },
                { id: 'micro', label: '🧠 Micro-Habits & Minimum Mode', desc: 'Low friction, 2-minute minimum doses to beat resistance' }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setProfile({ ...profile, motivationStyle: item.id })}
                  className={`onboard-option-card ${profile.motivationStyle === item.id ? 'selected' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-900">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                  {profile.motivationStyle === item.id && (
                    <i data-lucide="check" className="w-5 h-5 text-indigo-600"></i>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Stress Baseline & Pressures */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Baseline weekly pressure</h2>
              <p className="text-sm text-slate-600 mt-1">Establish a baseline so the coach can detect early when pressure spikes.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>Normal Weekly Stress Level:</span>
                <span className="text-base text-indigo-600 font-bold">{profile.stressBaseline} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={profile.stressBaseline}
                onChange={(e) => setProfile({ ...profile, stressBaseline: parseInt(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 - Very Low</span>
                <span>5 - Moderate</span>
                <span>10 - High Pressure</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                Primary sources of pressure
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['Exams / Studies', 'Work / Deadlines', 'Lack of time', 'Overthinking', 'Screen fatigue', 'Demanding routine'].map(cause => {
                  const isSelected = profile.stressCauses.includes(cause);
                  return (
                    <button
                      key={cause}
                      type="button"
                      onClick={() => toggleArrayItem('stressCauses', cause)}
                      className={`py-2 px-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-medium' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cause}</span>
                      {isSelected && <i data-lucide="check" className="w-3.5 h-3.5 text-indigo-600"></i>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Recovery Superpowers & Synthesis */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Your Recovery Superpowers</h2>
              <p className="text-sm text-slate-600 mt-1">What genuinely helps you recharge when fatigue or stress sets in? (Optional)</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: '60s Breathing & Reset', label: '🫁 60s Breathing & Resets' },
                { id: 'Walking in nature', label: '🌿 Outdoor Walk / Nature' },
                { id: 'Music & Soundscapes', label: '🎵 Calming Music / Audio' },
                { id: 'Deep restorative sleep', label: '😴 Early Night & Sleep' },
                { id: 'Being alone & quiet time', label: '🧘 Quiet Solitude' },
                { id: 'Intense physical workout', label: '🏋️ Exercise & Movement' }
              ].map(item => {
                const isSelected = profile.recoverySuperpowers.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleArrayItem('recoverySuperpowers', item.id)}
                    className={`onboard-option-card ${isSelected ? 'selected' : ''}`}
                  >
                    <span className="font-semibold text-sm flex-1 text-slate-900">{item.label}</span>
                    <i data-lucide={isSelected ? 'check-circle-2' : 'circle'} className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}></i>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs flex items-center gap-2">
              <i data-lucide="shield-check" className="w-4 h-4 text-emerald-600 flex-shrink-0"></i>
              <span>All responses are stored privately on your device to personalize your adaptive habits.</span>
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
          <button
            onClick={handlePrev}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <i data-lucide="arrow-left" className="w-4 h-4"></i>
            <span>{step === 1 ? 'Cancel' : 'Back'}</span>
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 hover:scale-105"
          >
            <span>{step === totalSteps ? 'Generate My Adaptive Plan 🚀' : 'Continue'}</span>
            <i data-lucide="arrow-right" className="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 3. LANDING VIEW
// ==========================================================================

function LandingView({ user, onStartOnboarding, onDirectDashboard, onQuickReset }) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [user]);

  return (
    <div className="flex flex-col items-center text-center space-y-10 py-6 sm:py-12 animate-fade-in">
      {/* Top Greeting Badge */}
      <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span>Adaptive Habits • Stress Early-Warning • AI Coach</span>
      </div>

      {/* Main Headline */}
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Don’t just track habits. <br />
          <span className="text-indigo-600">
            Let them adapt to you.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          A personal wellness & habit coach that learns your lifestyle, prevents burnout during high-pressure weeks, and scales habit difficulty so you never fail.
        </p>
      </div>

      {/* Core Action CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <button
          onClick={onStartOnboarding}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 flex items-center justify-center space-x-2"
        >
          <i data-lucide="sparkles" className="w-5 h-5 text-indigo-200"></i>
          <span>Personalize My Coach (7 Questions)</span>
        </button>

        <button
          onClick={onQuickReset}
          className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 text-teal-800 hover:text-teal-950 font-semibold text-base transition-all shadow-sm flex items-center justify-center space-x-2"
        >
          <i data-lucide="wind" className="w-5 h-5 text-teal-600"></i>
          <span>Instant 60s Reset</span>
        </button>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full pt-8 text-left">
        <div className="glass-panel p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <i data-lucide="zap" className="w-5 h-5"></i>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Minimum Mode</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Exhausted today? Switch to a 2-minute micro-habit to keep your streak unbroken without overwhelm.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <i data-lucide="bell-ring" className="w-5 h-5"></i>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Early-Warning System</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Detects upcoming exam & high-pressure deadlines beforehand to preemptively lighten your schedule.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
            <i data-lucide="bot" className="w-5 h-5"></i>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Interactive AI Coach</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tells you what got in the way when you miss a habit and suggests smart schedule shifts.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 4. MAIN DASHBOARD VIEW
// ==========================================================================

function DashboardView({
  user,
  profile,
  habits,
  goals,
  wellbeing,
  insights,
  upcomingPressures,
  onToggleHabit,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
  onOpenFailureModal,
  onLogStress,
  onQuickReset,
  onOpenCoach,
  onOpenGoals,
  onOpenWeeklyReport,
  onAddPressure
}) {
  const [dailyStressInput, setDailyStressInput] = useState(5);
  const [hasLoggedTodayStress, setHasLoggedTodayStress] = useState(false);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [habits, wellbeing, upcomingPressures]);

  const completedCount = habits.filter(h => h.todayStatus === 'full' || h.todayStatus === 'min').length;
  const totalHabits = habits.length;

  const handleSaveStress = (e) => {
    e.preventDefault();
    onLogStress(dailyStressInput, ['Daily Check-in']);
    setHasLoggedTodayStress(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Welcome & Wellbeing Bar */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm bg-white relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
                {user ? `, ${user.name?.split(' ')[0]}` : ''} 👋
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              🎯 {totalHabits - completedCount} habits remaining today • Consistency: {totalHabits ? Math.round((completedCount / totalHabits) * 100) : 0}%
            </p>
          </div>

          {/* Wellbeing Status Badge */}
          <div className="flex items-center gap-3">
            <div className={`px-3.5 py-2 rounded-2xl border flex items-center gap-2.5 ${wellbeing.badgeClass}`}>
              <div className="w-2.5 h-2.5 rounded-full bg-current animate-pulse"></div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Wellbeing Status</div>
                <div className="text-xs font-extrabold">{wellbeing.statusTitle}</div>
              </div>
            </div>

            <button
              onClick={onOpenCoach}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
            >
              <i data-lucide="bot" className="w-4 h-4"></i>
              <span>Ask Coach</span>
            </button>
          </div>
        </div>

        {/* High-Pressure Warning Banner */}
        {upcomingPressures && upcomingPressures.some(p => p.isActive) && (
          <div className="pressure-alert-card mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <i data-lucide="alert-triangle" className="w-4 h-4"></i>
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  Upcoming High-Pressure Period: {upcomingPressures.find(p => p.isActive)?.title}
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Based on your historical rhythm, we suggest using Minimum Mode on heavy days and scheduling 60s resets.
                </p>
              </div>
            </div>

            <button
              onClick={() => onQuickReset(ACTIVITIES['breathing-426'])}
              className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold border border-amber-300 transition-colors whitespace-nowrap"
            >
              ⚡ Quick 60s Reset
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Today's Habits & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Habits */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Today’s Adaptive Habits</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {completedCount}/{totalHabits}
              </span>
            </div>

            <button
              onClick={onAddHabit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-indigo-700 shadow-sm transition-colors"
            >
              <i data-lucide="plus" className="w-3.5 h-3.5"></i>
              <span>Add Habit</span>
            </button>
          </div>

          {/* Habit Card List */}
          <div className="space-y-3">
            {habits.map((habit) => {
              const isFull = habit.todayStatus === 'full';
              const isMin = habit.todayStatus === 'min';

              return (
                <div
                  key={habit.id}
                  className={`habit-card ${isFull ? 'completed-full' : isMin ? 'completed-min' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Checkbox & Details */}
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => onToggleHabit(habit.id, 'full')}
                        className={`habit-checkbox ${isFull ? 'checked-full' : isMin ? 'checked-min' : ''}`}
                        title="Click to complete full habit"
                      >
                        {(isFull || isMin) && <i data-lucide="check" className="w-4 h-4 text-white"></i>}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{habit.icon || '⚡'}</span>
                          <h3 className={`font-bold text-sm text-slate-900 ${isFull || isMin ? 'line-through opacity-70' : ''}`}>
                            {habit.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                          <span>Target: {habit.targetVal} {habit.targetUnit}</span>
                          <span>•</span>
                          <span className="capitalize">{habit.preferredTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Streak Badge */}
                    <div className="flex items-center gap-2">
                      <div className="streak-pill" title={`${habit.currentStreak} day streak`}>
                        <span>🔥</span>
                        <span>{habit.currentStreak}d</span>
                      </div>

                      <button
                        onClick={() => onEditHabit(habit)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title="Edit habit"
                      >
                        <i data-lucide="edit-3" className="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Action Row: Minimum Mode & Failure Reason Trigger */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleHabit(habit.id, 'min')}
                        className={`min-mode-pill ${isMin ? 'bg-amber-400 text-slate-950 font-extrabold' : ''}`}
                        title="Complete 2-min micro-dose instead of skipping"
                      >
                        <span>⚡ Min: {habit.minModeVal} {habit.minModeUnit}</span>
                      </button>
                      
                      {isMin && (
                        <span className="text-[10px] text-amber-700 font-semibold">Streak saved!</span>
                      )}
                    </div>

                    <button
                      onClick={() => onOpenFailureModal(habit)}
                      className="text-[11px] text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 font-medium"
                    >
                      <i data-lucide="help-circle" className="w-3 h-3"></i>
                      <span>What got in the way?</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Daily Stress Check-in, AI Insights & Quick Actions */}
        <div className="space-y-4">
          {/* Daily Stress Check-In Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="heart-pulse" className="w-4 h-4 text-rose-500"></i>
                <span>Daily Stress Check-in</span>
              </h3>
              <span className="text-xs font-bold text-indigo-700">{dailyStressInput}/10</span>
            </div>

            {hasLoggedTodayStress ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-semibold">
                ✓ Check-in saved for today!
              </div>
            ) : (
              <form onSubmit={handleSaveStress} className="space-y-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={dailyStressInput}
                  onChange={(e) => setDailyStressInput(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>1 Calm</span>
                  <span>5 Normal</span>
                  <span>10 Overwhelmed</span>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  Log Daily Rating
                </button>
              </form>
            )}
          </div>

          {/* AI Pattern Insights */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="sparkles" className="w-3.5 h-3.5"></i>
                <span>AI Pattern Insight</span>
              </h3>
              <button 
                onClick={onOpenWeeklyReport}
                className="text-[11px] text-slate-500 hover:text-slate-900 font-semibold"
              >
                Full Report →
              </button>
            </div>

            {insights.slice(0, 2).map((ins, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="font-bold text-slate-900 mb-0.5">{ins.title}</div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{ins.text}</p>
              </div>
            ))}
          </div>

          {/* Quick Hub Buttons */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quick Hub</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenGoals}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold flex items-center gap-2 transition-all"
              >
                <span>🎯</span>
                <span>My Goals</span>
              </button>
              <button
                onClick={onOpenWeeklyReport}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold flex items-center gap-2 transition-all"
              >
                <span>📊</span>
                <span>Weekly Stats</span>
              </button>
              <button
                onClick={onAddPressure}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold flex items-center gap-2 transition-all"
              >
                <span>⚠️</span>
                <span>Plan Exams</span>
              </button>
              <button
                onClick={() => onQuickReset(ACTIVITIES['breathing-426'])}
                className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-semibold flex items-center gap-2 transition-all"
              >
                <span>🫁</span>
                <span>60s Breath</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 5. AI COACH VIEW ("MY COACH")
// ==========================================================================

function CoachView({ user, appState, wellbeing, onToggleHabit, onQuickReset, onBack, onActivateMinModeAll }) {
  const [messages, setMessages] = useState(() => [
    {
      sender: 'ai',
      text: `Hello ${user ? user.name?.split(' ')[0] : 'there'}! I'm your Adaptive Habit Coach. I analyze your routine, energy rhythm, and failure reasons so you stay consistent without burnout. How can I assist you right now?`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    { label: "😴 I'm completely exhausted today", prompt: "I'm completely exhausted today." },
    { label: "📚 Overwhelmed with deadlines", prompt: "I feel overwhelmed with work and exams." },
    { label: "⚡ Plan my high-pressure week", prompt: "How should I structure habits for a high-pressure week?" },
    { label: "🔍 What patterns are hurting my habits?", prompt: "Analyze my failure reasons and habit patterns." }
  ];

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      let aiReply = '';
      let actionType = null;

      const lower = text.toLowerCase();
      if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('fatigue')) {
        aiReply = `I understand. When your energy is depleted, attempting a 30-minute full habit often leads to complete abandonment. Instead, let's switch today's remaining habits to Minimum Mode (e.g. 2-minute micro-dose) and schedule a 60-second breathing reset.`;
        actionType = 'min-mode-all';
      } else if (lower.includes('overwhelm') || lower.includes('deadline') || lower.includes('exam')) {
        aiReply = `During heavy exam or project periods, cognitive bandwidth is limited. Protect your sleep boundary first. I recommend keeping only your 1 most essential habit active and deferring secondary goals until the deadline passes.`;
        actionType = 'quick-reset';
      } else if (lower.includes('pattern') || lower.includes('fail') || lower.includes('reason')) {
        const failureCount = (appState.failureLogs || []).length;
        aiReply = `Based on your logs (${failureCount} recorded obstacles), most habit skips occur after irregular late nights. Moving your morning workout to 6:30 PM and using 5-minute study blocks will increase consistency by ~40%.`;
      } else {
        aiReply = `You're currently in a ${wellbeing.statusTitle} phase. Take small, steady actions. Remember: 2 minutes of a habit done consistently beats an ambitious routine that burns you out.`;
      }

      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: aiReply, actionType }
      ]);
    }, 450);
  };

  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-6 animate-fade-in space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold">
          <i data-lucide="arrow-left" className="w-4 h-4"></i>
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-bold text-slate-700">Coach Online & Adaptive</span>
        </div>
      </div>

      {/* Main Conversation Box */}
      <div className="glass-panel rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-lg flex flex-col h-[520px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={m.sender === 'user' ? 'coach-bubble-user max-w-md' : 'coach-bubble-ai max-w-lg'}>
                <p className="text-sm leading-relaxed">{m.text}</p>

                {m.actionType === 'min-mode-all' && (
                  <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                    <button
                      onClick={onActivateMinModeAll}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>⚡ Switch All to Minimum Mode</span>
                    </button>
                    <button
                      onClick={() => onQuickReset(ACTIVITIES['breathing-426'])}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 flex items-center gap-1.5 transition-all"
                    >
                      <i data-lucide="wind" className="w-3.5 h-3.5 text-teal-600"></i>
                      <span>60s Quick Reset</span>
                    </button>
                  </div>
                )}

                {m.actionType === 'quick-reset' && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => onQuickReset(ACTIVITIES['breathing-426'])}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <i data-lucide="wind" className="w-3.5 h-3.5"></i>
                      <span>Start 60-Second Reset Now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="py-3 border-t border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p.prompt)}
              className="coach-chip"
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your coach anything about habits, schedule, or fatigue..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
          >
            <span>Send</span>
            <i data-lucide="send" className="w-3.5 h-3.5"></i>
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// 6. GOALS & PROGRESS HIERARCHY VIEW
// ==========================================================================

function GoalsView({ goals, habits, onBack, onAddHabit }) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [goals, habits]);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold">
          <i data-lucide="arrow-left" className="w-4 h-4"></i>
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={onAddHabit}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <i data-lucide="plus" className="w-3.5 h-3.5"></i>
          <span>Add Linked Habit</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Goal → Habit Hierarchy</h1>
        <p className="text-sm text-slate-600 mt-1">
          Daily micro-habits feed directly into your overarching life ambitions.
        </p>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => {
          const linkedHabits = habits.filter(h => h.goalId === goal.id);
          const totalStreak = linkedHabits.reduce((acc, h) => acc + h.currentStreak, 0);

          return (
            <div key={goal.id} className="glass-panel rounded-3xl p-6 border border-slate-200 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl">
                    {goal.icon || '🎯'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{goal.title}</h3>
                    <p className="text-xs text-slate-500">{linkedHabits.length} daily habits linked</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    🔥 {totalStreak} Total Days Streak
                  </span>
                </div>
              </div>

              {/* Linked Habits Sub-list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {linkedHabits.map((h) => (
                  <div key={h.id} className="goal-item-card flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{h.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{h.title}</div>
                        <div className="text-[11px] text-slate-500">{h.targetVal} {h.targetUnit} (⚡ Min: {h.minModeVal})</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{h.currentStreak}d</span>
                  </div>
                ))}
                {linkedHabits.length === 0 && (
                  <div className="text-xs text-slate-400 italic p-3">No habits linked to this goal yet.</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================================================
// 7. WEEKLY PERSONAL REPORT VIEW
// ==========================================================================

function WeeklyReportView({ appState, wellbeing, onBack, onQuickReset }) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);

  const habits = appState.habits || [];
  const totalHabits = habits.length;
  const avgStreak = totalHabits ? Math.round(habits.reduce((acc, h) => acc + h.currentStreak, 0) / totalHabits) : 0;
  const bestHabit = habits.length ? habits.reduce((prev, curr) => (prev.currentStreak > curr.currentStreak ? prev : curr), habits[0]) : null;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold">
          <i data-lucide="arrow-left" className="w-4 h-4"></i>
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={onQuickReset}
          className="px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold border border-teal-200 flex items-center gap-1.5"
        >
          <i data-lucide="wind" className="w-3.5 h-3.5 text-teal-600"></i>
          <span>Take 60s Reset</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Your Weekly Intelligence Report</h1>
        <p className="text-sm text-slate-600 mt-1">
          Behavioral completion trends, habit consistency, and adaptive guidance.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="metric-card">
          <span className="text-slate-500 text-[11px] font-semibold uppercase">Habit Consistency</span>
          <span className="text-2xl font-black text-emerald-600">82%</span>
          <span className="text-[10px] text-slate-400">+14% vs last week</span>
        </div>

        <div className="metric-card">
          <span className="text-slate-500 text-[11px] font-semibold uppercase">Average Streak</span>
          <span className="text-2xl font-black text-indigo-600">{avgStreak} Days</span>
          <span className="text-[10px] text-slate-400">Unbroken momentum</span>
        </div>

        <div className="metric-card">
          <span className="text-slate-500 text-[11px] font-semibold uppercase">Strongest Anchor</span>
          <span className="text-base font-bold text-amber-800 truncate">{bestHabit ? bestHabit.title : 'Study'}</span>
          <span className="text-[10px] text-slate-400">{bestHabit ? bestHabit.currentStreak : 4} days active</span>
        </div>

        <div className="metric-card">
          <span className="text-slate-500 text-[11px] font-semibold uppercase">Balance Score</span>
          <span className="text-2xl font-black text-teal-700">{wellbeing.score}/100</span>
          <span className="text-[10px] text-slate-400">{wellbeing.statusTitle}</span>
        </div>
      </div>

      {/* AI Tactical Recommendations */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <i data-lucide="bot" className="w-5 h-5 text-indigo-600"></i>
          <span>Coach Weekly Strategic Recommendations</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="font-bold text-slate-900 mb-1">1. Evening Habit Alignment</div>
            <p className="text-slate-600 leading-relaxed">
              You complete habits with 88% higher fidelity in the evening (5–9 PM). Avoid front-loading demanding tasks to early mornings on sleep-deficit days.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="font-bold text-slate-900 mb-1">2. Minimum Mode Utilization</div>
            <p className="text-slate-600 leading-relaxed">
              When fatigue set in this week, using the 2-minute Minimum Mode prevented 3 complete drop-offs. Continue utilizing this safety net on heavy days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 8. HABIT CREATION & EDIT MODAL
// ==========================================================================

function HabitModal({ goals, habit, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: habit?.title || '',
    goalId: habit?.goalId || (goals[0]?.id || 'goal-1'),
    category: habit?.category || 'Focus',
    icon: habit?.icon || '📚',
    targetVal: habit?.targetVal || 30,
    targetUnit: habit?.targetUnit || 'min',
    minModeVal: habit?.minModeVal || 5,
    minModeUnit: habit?.minModeUnit || 'min',
    preferredTime: habit?.preferredTime || 'evening'
  });

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-slate-200 bg-white shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{habit ? 'Edit Habit' : 'Create Adaptive Habit'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Habit Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Deep Work, Workout, Reading"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Duration / Quantity</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min="1"
                  value={formData.targetVal}
                  onChange={(e) => setFormData({ ...formData, targetVal: parseInt(e.target.value) || 1 })}
                  className="w-16 px-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-center"
                />
                <input
                  type="text"
                  value={formData.targetUnit}
                  onChange={(e) => setFormData({ ...formData, targetUnit: e.target.value })}
                  className="flex-1 px-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-amber-800 font-semibold mb-1">⚡ Minimum Mode (Low Energy)</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min="1"
                  value={formData.minModeVal}
                  onChange={(e) => setFormData({ ...formData, minModeVal: parseInt(e.target.value) || 1 })}
                  className="w-16 px-2 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-center font-bold"
                />
                <input
                  type="text"
                  value={formData.minModeUnit}
                  onChange={(e) => setFormData({ ...formData, minModeUnit: e.target.value })}
                  className="flex-1 px-2 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-center font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Preferred Time of Day</label>
              <select
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
              >
                <option value="morning">Morning (6-11 AM)</option>
                <option value="midday">Midday (12-4 PM)</option>
                <option value="evening">Evening (5-9 PM)</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Connected Major Goal</label>
              <select
                value={formData.goalId}
                onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
              >
                {goals.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
            >
              Save Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// 9. HABIT FAILURE REASON MODAL ("What got in the way?")
// ==========================================================================

function FailureReasonModal({ habit, onSave, onClose }) {
  const [selectedReason, setSelectedReason] = useState('Late night / Overslept');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);

  const reasons = [
    { id: 'Late night / Overslept', icon: '😴', label: 'Late night / Extreme fatigue' },
    { id: 'Heavy workload / Deadlines', icon: '📚', label: 'Work or study overload' },
    { id: 'Ran out of time', icon: '⏰', label: 'Ran out of time' },
    { id: 'Procrastination / Distracted', icon: '📱', label: 'Distraction / Doomscrolling' },
    { id: 'Family / Unexpected event', icon: '🏠', label: 'Unexpected responsibility' },
    { id: 'Lost motivation', icon: '😐', label: 'Low energy & motivation' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(habit.id, selectedReason, note);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-slate-200 bg-white shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">What got in the way?</h3>
            <p className="text-xs text-slate-500 mt-0.5">Logging obstacles helps your coach adapt future targets.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-2">
            {reasons.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedReason(r.id)}
                className={`failure-tile ${selectedReason === r.id ? 'selected' : ''}`}
              >
                <span className="text-lg">{r.icon}</span>
                <span className="font-semibold text-slate-800 text-[11px]">{r.label}</span>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Optional context note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Worked late until 2 AM on assignment"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm"
            >
              Log & Adapt Routine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// 10. PRESSURE PLANNER MODAL
// ==========================================================================

function PressurePlannerModal({ onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Exams');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [daysDuration, setDaysDuration] = useState(7);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, type, startDate, daysDuration });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-slate-200 bg-white shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Plan Upcoming High-Pressure Period</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Tell your coach about upcoming exams, project deliveries, or travel so it can proactively suggest Minimum Mode.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Event / Milestone Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Semester Final Exams, Product Launch"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Event Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
              >
                <option value="Exams">Exams / Academic</option>
                <option value="Work Deliverable">Work Deliverable</option>
                <option value="Travel / Personal">Travel / Relocation</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Expected Days</label>
              <input
                type="number"
                min="1"
                max="30"
                value={daysDuration}
                onChange={(e) => setDaysDuration(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-center"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
            >
              Activate Adaptation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// 11. PRIVACY CENTER MODAL
// ==========================================================================

function PrivacyModal({ profile, appState, onWipeData, onClose }) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `coach_privacy_export_${Date.now()}.json`);
    dlAnchor.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-lg w-full rounded-3xl p-6 border border-slate-200 bg-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i data-lucide="shield-check" className="w-5 h-5 text-emerald-600"></i>
            <h3 className="text-base font-bold text-slate-900">Privacy & Transparency Center</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-1">Local & Private First</h4>
            <p>
              Your habits, failure logs, and lifestyle answers stay on your browser and inside your private session. We do not sell or share personal wellbeing information.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-1">Non-Medical Behavioral System</h4>
            <p>
              The Wellbeing Score is a transparent behavioral index derived from completed habits, sleep hours, and upcoming workload. It is not a psychological or medical diagnosis.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900">Data Control Actions</h4>
            <div className="flex gap-2">
              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold"
              >
                Export My Data (.JSON)
              </button>
              <button
                onClick={onWipeData}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold"
              >
                Wipe Local Data
              </button>
            </div>
          </div>
        </div>

        <div className="text-right pt-2 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 12. PRESERVED EXERCISE & AUDIO ENGINE COMPONENTS
// ==========================================================================

function ExerciseEngine({ activity, onComplete, onCancel, soundEnabled }) {
  if (!activity) return null;
  return <BreathingCirclePlayer activity={activity} onComplete={onComplete} onCancel={onCancel} soundEnabled={soundEnabled} />;
}

function BreathingCirclePlayer({ activity, onComplete, onCancel, soundEnabled }) {
  const [phase, setPhase] = useState('inhale');
  const [timeLeft, setTimeLeft] = useState(activity.duration || 60);

  const pattern = activity.pattern || { inhale: 4, hold: 2, exhale: 6 };

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [phase]);

  useEffect(() => {
    let currentPhase = 'inhale';
    let phaseTime = 0;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete({ durationSec: activity.duration });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const phaseInterval = setInterval(() => {
      phaseTime += 0.1;
      const targetDuration = currentPhase === 'inhale' ? pattern.inhale : currentPhase === 'hold' ? pattern.hold : pattern.exhale;

      if (phaseTime >= targetDuration) {
        phaseTime = 0;
        if (currentPhase === 'inhale') {
          currentPhase = pattern.hold ? 'hold' : 'exhale';
          if (soundEnabled) audioService.playChime('hold');
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          if (soundEnabled) audioService.playChime('exhale');
        } else {
          currentPhase = 'inhale';
          if (soundEnabled) audioService.playChime('inhale');
        }
        setPhase(currentPhase);
      }
    }, 100);

    return () => {
      clearInterval(timer);
      clearInterval(phaseInterval);
    };
  }, []);

  return (
    <div className="max-w-md mx-auto py-8 text-center space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1">
          <i data-lucide="arrow-left" className="w-4 h-4"></i>
          <span>Exit Reset</span>
        </button>
        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
          {timeLeft}s Remaining
        </span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">{activity.title}</h2>
        <p className="text-sm text-slate-600 capitalize mt-1">
          {phase === 'inhale' ? '🌬️ Breathe in gently...' : phase === 'hold' ? '✨ Hold calmly...' : '🍃 Exhale and release...'}
        </p>
      </div>

      {/* Visual Breathing Circle */}
      <div className="flex items-center justify-center py-6">
        <div className={`w-52 h-52 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${
          phase === 'inhale' 
            ? 'scale-125 border-teal-500 bg-teal-50 shadow-[0_0_40px_rgba(13,148,136,0.25)]' 
            : phase === 'hold'
            ? 'scale-125 border-indigo-500 bg-indigo-50 shadow-[0_0_40px_rgba(79,70,229,0.2)]'
            : 'scale-90 border-slate-300 bg-slate-50'
        }`}>
          <span className="text-lg font-extrabold uppercase tracking-widest text-slate-900">
            {phase}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 13. LOGIN VIEW
// ==========================================================================

function LoginView({ user, googleClientId, setGoogleClientId, onGoogleSuccess, onContinueAsGuest, onBack }) {
  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);

  useEffect(() => {
    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: onGoogleSuccess,
          auto_select: false
        });

        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: 'signin_with',
            width: 300
          });
        }
      } catch (e) {
        console.warn('GIS Init:', e);
      }
    }
  }, [googleClientId]);

  return (
    <div className="login-page max-w-md mx-auto py-8 animate-fade-in text-center">
      <button onClick={onBack} className="login-back-btn mb-4">
        <i data-lucide="arrow-left" className="w-4 h-4"></i>
        <span>Back to App</span>
      </button>

      <div className="glass-panel rounded-3xl p-8 border border-slate-200 bg-white shadow-lg space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20">
          <i data-lucide="sparkles" className="w-6 h-6 text-white"></i>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome to Reset</h2>
          <p className="text-xs text-slate-600 mt-1">Sign in to sync your adaptive habits across all your devices.</p>
        </div>

        <div ref={googleBtnContainerRef} className="flex justify-center min-h-[44px]"></div>

        <div className="login-divider"><span>OR</span></div>

        <button
          onClick={onContinueAsGuest}
          className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2"
        >
          <span>Continue Offline / Guest</span>
          <i data-lucide="arrow-right" className="w-4 h-4"></i>
        </button>
      </div>
    </div>
  );
}

// ==========================================================================
// 14. SAFETY & SETTINGS MODALS
// ==========================================================================

function SafetyModal({ onClose }) {
  useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-slate-200 bg-white shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <i data-lucide="heart" className="w-4 h-4 text-rose-500"></i>
            <span>Wellbeing & Crisis Resources</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700"><i data-lucide="x" className="w-4 h-4"></i></button>
        </div>
        <p className="text-slate-600 leading-relaxed">
          If you are experiencing acute distress or a crisis, please connect with free, confidential professional support:
        </p>
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900">United States & Canada: 988 Suicide & Crisis Lifeline</div>
            <div className="text-indigo-600 font-bold">Call or Text 988 (24/7)</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900">United Kingdom: Samaritans</div>
            <div className="text-indigo-600 font-bold">Call 116 123 (Free, 24/7)</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900">International Resources</div>
            <div className="text-slate-600">Find global hotlines at befrienders.org</div>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Close</button>
      </div>
    </div>
  );
}

function SettingsModal({
  user,
  onSignOut,
  theme,
  setTheme,
  soundEnabled,
  toggleSound,
  ambientSound,
  setAmbientSound,
  onRedoOnboarding,
  onClearData,
  onClose
}) {
  useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-slate-200 bg-white shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Settings & Routine Setup</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700"><i data-lucide="x" className="w-4 h-4"></i></button>
        </div>

        {/* Ambient Sound Selection */}
        <div className="space-y-2">
          <label className="text-slate-700 font-semibold block">Background Ambient Soundscape</label>
          <div className="grid grid-cols-3 gap-2">
            {['none', 'rain', 'waves'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setAmbientSound(s)}
                className={`py-2 px-1 rounded-xl border text-center capitalize transition-all ${
                  ambientSound === s ? 'bg-indigo-600 border-indigo-600 text-white font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {s === 'none' ? 'Mute' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Retake Onboarding */}
        <div className="pt-2 border-t border-slate-200">
          <button
            onClick={onRedoOnboarding}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs"
          >
            🔄 Retake Onboarding Questionnaire (7 Steps)
          </button>
        </div>

        {/* User Account Session */}
        {user && (
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-700">Signed in as {user.email}</span>
            <button onClick={onSignOut} className="text-rose-600 font-semibold hover:underline">Sign Out</button>
          </div>
        )}

        {/* Clear Data */}
        <div className="pt-2 border-t border-slate-200">
          <button onClick={onClearData} className="text-rose-600 font-semibold hover:underline">Reset All Local Logs</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 15. FOOTER NAVIGATION
// ==========================================================================

function FooterNav({ user, currentView, setCurrentView, onOpenSafety, onOpenPrivacy, onOpenSettings }) {
  useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, []);
  return (
    <footer className="border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 bg-white/70 z-10">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 Reset — Personal Adaptive Habit & Wellbeing Coach.</p>
        <div className="flex items-center space-x-4">
          <button onClick={() => setCurrentView('coach')} className="hover:text-slate-900 font-medium">My Coach</button>
          <button onClick={onOpenPrivacy} className="hover:text-slate-900 font-medium">Privacy Center</button>
          <button onClick={onOpenSafety} className="hover:text-slate-900 font-medium">Crisis Safety</button>
          <button onClick={onOpenSettings} className="hover:text-slate-900 font-medium">Settings</button>
        </div>
      </div>
    </footer>
  );
}

// --- RENDER APP ---
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
