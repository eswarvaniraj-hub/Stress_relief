// ==========================================================================
// RESET — Personal Adaptive Habit & Digital Well-Being Coach
// Intelligent early stress & pressure detection, contextual daily monitoring,
// 7-question lifestyle onboarding, and adaptive minimum-mode habit coaching.
// ==========================================================================

const { useState, useEffect, useRef, useMemo } = React;

// --- STORAGE KEYS ---
const STORAGE_KEY = 'coach_app_state_v3';
const USER_STORAGE_KEY = 'reset_auth_user_v1';
const GOOGLE_CLIENT_ID_KEY = 'reset_google_client_id_v1';

const DEFAULT_GOOGLE_CLIENT_ID = '566164333122-o2u5sgtqueto8d2t9b7ufquugiqq8g7l.apps.googleusercontent.com';

// --- THEME WORK & FOCUS MODES (ASSIGNED FUNCTIONAL WORK) ---
const THEME_WORK_MODES = {
  porcelain: {
    id: 'porcelain',
    name: 'Porcelain Studio',
    modeTitle: 'Daytime Deep Work & Focus',
    badge: '🎯 Deep Focus Mode',
    icon: '🎯',
    color: '#4f46e5',
    tagline: 'Standard target habit pacing & high-contrast daytime focus',
    recommendedAmbient: 'none',
    recommendedReset: 'breathing-426',
    encouragementFlavor: 'Precision focus and steady daily execution.',
    workDescription: 'Daytime productivity mode: Full duration habit blocks, active study/work tracking & balanced energy.'
  },
  sage: {
    id: 'sage',
    name: 'Sage Herbal Mint',
    modeTitle: 'Gentle Recovery & Minimum Mode',
    badge: '🌿 Recovery & Min-Mode',
    icon: '🌿',
    color: '#059669',
    tagline: 'Low energy & burnout safeguard: Prioritizes 2-min Minimum Mode micro-doses',
    recommendedAmbient: 'rain',
    recommendedReset: 'breathing-box',
    encouragementFlavor: 'Gentle pacing — micro-doses protect your consistency without fatigue.',
    workDescription: 'Recovery mode: Scaled-down 2-min micro-doses, gentle rain audio & Box Breathing for fatigue.'
  },
  azure: {
    id: 'azure',
    name: 'Azure Ocean Flow',
    modeTitle: 'Deep Flow & Focus Sprints',
    badge: '🌊 Deep Flow & Sprints',
    icon: '🌊',
    color: '#0284c7',
    tagline: 'High-immersion state: Calming ocean soundscape & uninterrupted study sprints',
    recommendedAmbient: 'waves',
    recommendedReset: 'breathing-box',
    encouragementFlavor: 'Riding the calm wave of deep immersion with zero distractions.',
    workDescription: 'Flow sprint mode: Ambient ocean flow, timer sprints & maximum cognitive immersion.'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Peach Warmth',
    modeTitle: 'Evening Wind-Down & Sleep Prep',
    badge: '🌅 Wind-Down & Sleep Prep',
    icon: '🌅',
    color: '#ea580c',
    tagline: 'Nighttime decompression: 4-7-8 relaxing breath & warm light for sleep',
    recommendedAmbient: 'none',
    recommendedReset: 'breathing-478',
    encouragementFlavor: 'Soft evening decompression — calming your nervous system for deep sleep.',
    workDescription: 'Wind-down mode: Warm eye-strain-free hues, relaxing 4-7-8 breath & evening reflection.'
  }
};

// --- 1. INITIAL ONBOARDING PROFILE SCHEMA (7 CORE QUESTIONS) ---
const DEFAULT_PROFILE = {
  isCompleted: false,
  occupation: 'Student', // Q1
  weekdayPattern: 'Structured & fixed routine', // Q2
  dailyHours: '6-8 hours', // Q3
  peakTime: 'evening', // Q4
  sleepDuration: '7-8 hours', // Q5
  stressCauses: ['Exams & academic evaluations', 'Tight deadlines & time urgency', 'Overthinking & mental chatter'], // Q6
  recoveryActivities: ['Take a walk / light movement', 'Listen to music / calming audio', 'Guided breathing & mindfulness reset'], // Q7
  hurdles: ['Late nights & irregular sleep', 'Procrastination / Overthinking'],
  motivationStyle: 'streaks',
  stressBaseline: 5,
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
    currentStreak: 0,
    bestStreak: 0,
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
    currentStreak: 0,
    bestStreak: 0,
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
    currentStreak: 0,
    bestStreak: 0,
    difficultyLevel: 1,
    todayStatus: null,
    todayCompletedAt: null
  }
];

// --- DISTRACTION CATEGORIES & METADATA ---
const DISTRACTION_CATEGORIES = [
  { id: 'social', label: 'Social Media', icon: '📱', color: '#db2777', badgeClass: 'category-badge-social' },
  { id: 'gaming', label: 'Gaming', icon: '🎮', color: '#7c3aed', badgeClass: 'category-badge-gaming' },
  { id: 'video', label: 'Videos / Entertainment', icon: '🎬', color: '#2563eb', badgeClass: 'category-badge-video' },
  { id: 'chat', label: 'Chatting / Messages', icon: '💬', color: '#0891b2', badgeClass: 'category-badge-chat' },
  { id: 'browsing', label: 'Web Browsing', icon: '🌐', color: '#16a34a', badgeClass: 'category-badge-browsing' },
  { id: 'calls', label: 'Phone Calls', icon: '📞', color: '#ca8a04', badgeClass: 'category-badge-calls' },
  { id: 'sleep', label: 'Rest / Nap Break', icon: '😴', color: '#475569', badgeClass: 'category-badge-sleep' },
  { id: 'food', label: 'Food / Snack Break', icon: '🍔', color: '#ea580c', badgeClass: 'category-badge-food' },
  { id: 'notifications', label: 'Phone Notifications', icon: '🔔', color: '#e11d48', badgeClass: 'category-badge-notifications' },
  { id: 'other', label: 'Other Distraction', icon: '📌', color: '#64748b', badgeClass: 'category-badge-other' }
];

const DEFAULT_INITIAL_STATE = {
  theme: 'porcelain', // 'porcelain' | 'sage' | 'azure' | 'sunset'
  soundEnabled: true,
  soundVolume: 0.5,
  ambientSound: 'none',
  profile: DEFAULT_PROFILE,
  goals: DEFAULT_INITIAL_GOALS,
  habits: DEFAULT_INITIAL_HABITS,
  dailyCheckIns: [],
  lastCheckInDate: null,
  distractionGoalMinutes: 45,
  distractions: [],
  focusSessions: [],
  failureLogs: [],
  stressCheckIns: [],
  upcomingPressures: [],
  resetsHistory: []
};

// Sanitizer to clean legacy demo/mock items from browser localStorage
function sanitizeLoadedState(savedState) {
  if (!savedState || typeof savedState !== 'object') return DEFAULT_INITIAL_STATE;
  const sanitized = { ...DEFAULT_INITIAL_STATE, ...savedState };

  // Filter out any legacy mock distraction objects with dist-1..dist-6 IDs
  if (Array.isArray(sanitized.distractions)) {
    sanitized.distractions = sanitized.distractions.filter(d => d && !String(d.id || '').startsWith('dist-'));
  } else {
    sanitized.distractions = [];
  }

  // Filter out any legacy mock focus session objects with focus-1..focus-3 IDs
  if (Array.isArray(sanitized.focusSessions)) {
    sanitized.focusSessions = sanitized.focusSessions.filter(s => s && !String(s.id || '').startsWith('focus-'));
  } else {
    sanitized.focusSessions = [];
  }

  // Filter out legacy mock failure logs
  if (Array.isArray(sanitized.failureLogs)) {
    sanitized.failureLogs = sanitized.failureLogs.filter(f => f && !String(f.id || '').startsWith('fail-'));
  } else {
    sanitized.failureLogs = [];
  }

  // Filter out legacy mock pressures
  if (Array.isArray(sanitized.upcomingPressures)) {
    sanitized.upcomingPressures = sanitized.upcomingPressures.filter(p => p && !String(p.id || '').startsWith('press-'));
  } else {
    sanitized.upcomingPressures = [];
  }

  // Filter out legacy mock resets
  if (Array.isArray(sanitized.resetsHistory)) {
    sanitized.resetsHistory = sanitized.resetsHistory.filter(r => r && !String(r.id || '').startsWith('reset-'));
  } else {
    sanitized.resetsHistory = [];
  }

  return sanitized;
}

// ==========================================================================
// PROCEDURAL WEB AUDIO SYNTHESIZER
// ==========================================================================
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

// ==========================================================================
// EXPANDED TAILORED WELL-BEING & RESET ACTIVITIES
// ==========================================================================
const ACTIVITIES = {
  'breathing-426': {
    id: 'breathing-426',
    title: '60s Calming Reset (4-2-6)',
    category: 'Breathing',
    duration: 60,
    icon: 'wind',
    tag: 'All-Day Balance',
    description: 'Gently stimulates the parasympathetic nervous system to slow heart rate and lower tension.',
    pattern: { inhale: 4, hold: 2, exhale: 6 }
  },
  'breathing-box': {
    id: 'breathing-box',
    title: 'Box Breathing (4-4-4-4)',
    category: 'Focus & Study',
    duration: 64,
    icon: 'square',
    tag: 'Exam & Deadline Focus',
    description: 'Equal-ratio breathing used by high-performance athletes to regain laser focus and eliminate study fatigue.',
    pattern: { inhale: 4, hold: 4, exhale: 4, hold2: 4 }
  },
  'breathing-478': {
    id: 'breathing-478',
    title: '4-7-8 Restorative Wind-Down',
    category: 'Rest & Sleep',
    duration: 76,
    icon: 'moon',
    tag: 'Sleep Deficit Recovery',
    description: 'A natural tranquilizer for the nervous system that eases mental chatter and prepares for deep rest.',
    pattern: { inhale: 4, hold: 7, exhale: 8 }
  },
  'breathing-sigh': {
    id: 'breathing-sigh',
    title: 'Physiological Sigh (Double Inhale)',
    category: 'Tension Release',
    duration: 60,
    icon: 'zap',
    tag: 'Instant Workload Reset',
    description: 'Two quick inhales through the nose followed by a slow sigh exhale to rapidly re-inflate alveoli and relieve stress in seconds.',
    pattern: { inhale: 4, hold: 1, exhale: 6 }
  },
  'breathing-coherent': {
    id: 'breathing-coherent',
    title: '5-5 Coherent Flow Breath',
    category: 'Clarity',
    duration: 60,
    icon: 'activity',
    tag: 'Daily Steady Flow',
    description: 'Resonant frequency breathing at 6 breaths per minute for optimal autonomic and heart rate variability balance.',
    pattern: { inhale: 5, hold: 0, exhale: 5 }
  }
};

// ==========================================================================
// MULTI-SIGNAL EARLY STRESS & PRESSURE DETECTION ENGINE
// Compares real-time signals to the user's personal baseline
// ==========================================================================

function evaluateEarlyStressSignals(appState, recentCheckIns = []) {
  const profile = appState.profile || DEFAULT_PROFILE;
  const checkIns = (recentCheckIns && recentCheckIns.length > 0) ? recentCheckIns : (appState.dailyCheckIns || []);
  const failureLogs = appState.failureLogs || [];
  const pressures = (appState.upcomingPressures || []).filter(p => p.isActive);

  // 1. Parse Baseline metrics from 7-question onboarding profile
  let baselineSleepHours = 7.5;
  const sleepStr = profile.sleepDuration || '';
  if (sleepStr.includes('< 5')) baselineSleepHours = 4.5;
  else if (sleepStr.includes('5–6') || sleepStr.includes('5-6')) baselineSleepHours = 5.5;
  else if (sleepStr.includes('7–8') || sleepStr.includes('7-8')) baselineSleepHours = 7.5;
  else if (sleepStr.includes('8+')) baselineSleepHours = 8.5;

  const baselineStress = Number.isFinite(profile.stressBaseline) ? profile.stressBaseline : 5;

  // 2. Multi-Signal Analysis of Recent Check-ins
  let recentSleepDeficit = false;
  let recentWorkloadSpike = false;
  let stressScoreAvg = baselineStress;
  let negativeFeelingCount = 0;
  let stressfulEventReported = false;

  if (checkIns.length > 0) {
    const recent = checkIns.slice(0, 5);
    const sleepPoors = recent.filter(c => c.sleepQuality === 'poor' || c.sleepQuality === 'very_little');
    if (sleepPoors.length >= 1 || (recent[0] && (recent[0].sleepQuality === 'poor' || recent[0].sleepQuality === 'very_little'))) {
      recentSleepDeficit = true;
    }

    const heavyLoads = recent.filter(c => c.workloadRating === 'heavy' || c.workloadRating === 'overload');
    if (heavyLoads.length >= 1) {
      recentWorkloadSpike = true;
    }

    negativeFeelingCount = recent.filter(c => c.overallFeeling === 'demanding' || c.overallFeeling === 'exhausted' || c.overallFeeling === 'anxious').length;

    const stressRatings = recent.filter(c => Number.isFinite(c.stressRating)).map(c => Number(c.stressRating));
    if (stressRatings.length > 0) {
      stressScoreAvg = stressRatings.reduce((a, b) => a + b, 0) / stressRatings.length;
    }

    stressfulEventReported = recent.some(c => c.stressfulEvent);
  }

  // 3. Upcoming High-Pressure Horizon (Exams/Deadlines within 1-7 days)
  const now = new Date();
  const upcomingNearPressures = pressures.filter(p => {
    if (!p.startDate) return true;
    const pDate = new Date(p.startDate);
    const diffDays = (pDate - now) / (1000 * 60 * 60 * 24);
    return diffDays >= -1 && diffDays <= 7;
  });

  // 4. Habit Obstacles in last 3 days
  const recentSkips = failureLogs.filter(f => (Date.now() - (f.timestamp || 0)) < 86400000 * 3);
  const fatigueSkips = recentSkips.filter(f => {
    const r = (f.reason || '').toLowerCase();
    return r.includes('sleep') || r.includes('fatigue') || r.includes('workload') || r.includes('procrastination');
  });

  // 5. Synthesize Early Warning Signals
  const riskSignals = [];
  let score = 88;

  if (upcomingNearPressures.length > 0) {
    const pTitle = upcomingNearPressures[0].title || 'Upcoming Milestone';
    riskSignals.push(`Upcoming deadline: "${pTitle}"`);
    score -= 15;
  }

  if (recentSleepDeficit) {
    riskSignals.push('Sleep lighter than your baseline');
    score -= 18;
  }

  if (recentWorkloadSpike) {
    riskSignals.push('Workload / screen demand climbing');
    score -= 14;
  }

  if (stressScoreAvg > baselineStress + 1.2) {
    riskSignals.push(`Daily reported pressure (${Math.round(stressScoreAvg)}/10) above baseline`);
    score -= 16;
  }

  if (negativeFeelingCount >= 2 || stressfulEventReported) {
    riskSignals.push('Demanding or depleted days logged');
    score -= 14;
  }

  if (fatigueSkips.length >= 2) {
    riskSignals.push(`${fatigueSkips.length} habit friction logs due to fatigue`);
    score -= 10;
  }

  // 4b. Distraction Analysis & Friction Signals
  const distractions = appState.distractions || [];
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDistractions = distractions.filter(d => {
    const dDate = d.loggedAt ? new Date(d.loggedAt).toISOString().split('T')[0] : todayStr;
    return dDate === todayStr;
  });
  const todayDistractionMinutes = todayDistractions.reduce((acc, d) => acc + (Number(d.durationMinutes) || 0), 0);
  const distractionGoal = Number(appState.distractionGoalMinutes) || 45;

  if (todayDistractionMinutes > distractionGoal * 1.5 && todayDistractionMinutes >= 50) {
    riskSignals.push(`Distraction volume (${todayDistractionMinutes}m) higher than ${distractionGoal}m daily target`);
    score -= 8;
  }

  // Historical correlation note (without medical diagnosis)
  let distractionStressCorrelation = null;
  const highDistractionDays = distractions.filter(d => (Number(d.durationMinutes) || 0) >= 30);
  if (highDistractionDays.length >= 2 && checkIns.length >= 2) {
    distractionStressCorrelation = "Higher distraction time has coincided with higher self-reported stress on several days.";
  }

  // Score clamping (10-100)
  score = Math.max(15, Math.min(100, score));

  // Determine Level & Respectful Non-Medical Language
  let statusLevel = 'calm';
  let statusTitle = 'Calm & In Flow';
  let badgeClass = 'status-badge-balanced';
  let gentleNudge = 'Your recent routine matches your baseline nicely. Maintain your steady pace.';
  let recommendedActivity = ACTIVITIES['breathing-426'];
  let tacticalAdvice = 'Steady execution. Keep regular micro-breaks between tasks.';

  const isStudent = (profile.occupation || '').toLowerCase().includes('student') || (profile.occupation || '').toLowerCase().includes('both');

  if (score < 48) {
    statusLevel = 'demanding';
    statusTitle = 'High Pressure Pattern';
    badgeClass = 'status-badge-demanding';

    if (isStudent && upcomingNearPressures.length > 0) {
      gentleNudge = 'Your recent pattern looks more demanding than usual with upcoming exams. Would you like to take a 2-minute focus reset?';
      recommendedActivity = ACTIVITIES['breathing-box'] || ACTIVITIES['breathing-426'];
      tacticalAdvice = 'Use Minimum Mode on secondary habits and protect your sleep boundary tonight.';
    } else if (recentSleepDeficit) {
      gentleNudge = 'Your recent pattern shows lighter sleep than your normal baseline. A restorative wind-down will help recharge your energy.';
      recommendedActivity = ACTIVITIES['breathing-478'] || ACTIVITIES['breathing-426'];
      tacticalAdvice = 'Prioritize an early night. Scale habit targets down to 2-minute micro-doses.';
    } else if (recentWorkloadSpike) {
      gentleNudge = 'You have had a more demanding few days than usual. A 2-minute decompression reset will help steady your momentum.';
      recommendedActivity = ACTIVITIES['breathing-sigh'] || ACTIVITIES['breathing-426'];
      tacticalAdvice = 'Activate Minimum Mode for today’s habits so your streaks stay protected without burnout.';
    } else {
      gentleNudge = 'Your recent pattern suggests you could benefit from a break. Take things one small step at a time today.';
      recommendedActivity = ACTIVITIES['breathing-426'];
      tacticalAdvice = 'Lighten your expectations today. Focus only on 1 core habit.';
    }
  } else if (score < 68) {
    statusLevel = 'elevated';
    statusTitle = 'Elevated Load Detected';
    badgeClass = 'status-badge-elevated';

    if (upcomingNearPressures.length > 0) {
      gentleNudge = 'You may be under increasing pressure ahead of your upcoming deadline. Schedule short study breaks to prevent fatigue.';
      recommendedActivity = ACTIVITIES['breathing-box'] || ACTIVITIES['breathing-426'];
    } else if (recentWorkloadSpike) {
      gentleNudge = 'Your workload has been heavier than usual. A 60-second breathing reset can help steady your mental clarity.';
      recommendedActivity = ACTIVITIES['breathing-sigh'] || ACTIVITIES['breathing-426'];
    } else {
      gentleNudge = 'Your recent pattern suggests a slight increase in friction. Consider lighter versions of demanding goals today.';
      recommendedActivity = ACTIVITIES['breathing-426'];
    }
    tacticalAdvice = 'Take 1–2 minute movement and breathing pauses between deep work blocks.';
  } else if (score < 82) {
    statusLevel = 'steady';
    statusTitle = 'Steady & Balanced';
    badgeClass = 'status-badge-balanced';
    gentleNudge = 'Your routine is running smoothly near your baseline. Keep up your healthy daily rhythm.';
    recommendedActivity = ACTIVITIES['breathing-426'];
    tacticalAdvice = 'Maintain your consistency rhythm.';
  }

  return {
    score,
    statusLevel,
    statusTitle,
    badgeClass,
    gentleNudge,
    riskSignals,
    recommendedActivity,
    tacticalAdvice,
    todayDistractionMinutes,
    distractionGoalMinutes: distractionGoal,
    distractionStressCorrelation,
    baseline: {
      sleep: profile.sleepDuration,
      hours: profile.dailyHours,
      stress: baselineStress,
      occupation: profile.occupation
    }
  };
}

function calculateWellbeingIndex(appState) {
  const signalData = evaluateEarlyStressSignals(appState);
  return {
    score: signalData.score,
    statusLevel: signalData.statusLevel,
    statusTitle: signalData.statusTitle,
    badgeClass: signalData.badgeClass,
    advice: signalData.tacticalAdvice,
    gentleNudge: signalData.gentleNudge,
    todayDistractionMinutes: signalData.todayDistractionMinutes,
    distractionGoalMinutes: signalData.distractionGoalMinutes,
    distractionStressCorrelation: signalData.distractionStressCorrelation
  };
}

function generateAIInsights(appState) {
  const profile = appState.profile || DEFAULT_PROFILE;
  const failureLogs = appState.failureLogs || [];
  const distractions = appState.distractions || [];
  const focusSessions = appState.focusSessions || [];
  const signals = evaluateEarlyStressSignals(appState);

  const insights = [];

  if (signals.riskSignals.length > 0) {
    insights.push({
      icon: 'sparkles',
      title: 'Early Pattern Detection',
      text: signals.gentleNudge
    });
  }

  // Distraction Pattern Analysis & Smart Supportive Recommendations
  if (distractions.length > 0) {
    // 1. Most frequent category
    const catCounts = {};
    distractions.forEach(d => {
      catCounts[d.category] = (catCounts[d.category] || 0) + 1;
    });
    const topCategory = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a])[0];
    
    if (topCategory) {
      insights.push({
        icon: 'target',
        title: 'Top Distraction Pattern',
        text: `"${topCategory}" was your most frequent distraction category recently. Consider placing a short planned break or turning off notifications before your focus blocks.`
      });
    }

    // 2. Evening vs Daytime Distraction Distribution
    const eveningDistractions = distractions.filter(d => {
      if (!d.loggedAt) return false;
      const hour = new Date(d.loggedAt).getHours();
      return hour >= 18 && hour <= 22;
    });
    if (eveningDistractions.length >= 2) {
      insights.push({
        icon: 'clock',
        title: 'Time Window Insight',
        text: 'You had the most distractions between 7 PM and 9 PM. Try scheduling your most demanding study tasks earlier during your peak focus window.'
      });
    }
  }

  // 3. Focus Session Trend
  if (focusSessions.length >= 2) {
    const avgFocusRate = Math.round(focusSessions.reduce((acc, s) => acc + (s.focusRate || 100), 0) / focusSessions.length);
    insights.push({
      icon: 'flame',
      title: 'Focus Session Flow',
      text: `Your average focus rate across recent sessions is ${avgFocusRate}%. Try a 25-minute focus session sprint to keep uninterrupted cognitive momentum.`
    });
  }

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
      title: 'Habit Obstacle Pattern',
      text: `Your most frequent habit hurdle is "${mostCommon}". Minimum Mode helps protect your streak during heavy days.`
    });
  } else {
    insights.push({
      icon: 'shield-check',
      title: 'Digital Well-Being Safeguard',
      text: 'Remember: Take a short planned break instead of switching tasks repeatedly. On exhausting days, a 2-minute "Minimum Mode" protects your consistency.'
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
      if (saved) return sanitizeLoadedState(JSON.parse(saved));
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

  const [checkInStatus, setCheckInStatus] = useState({
    hasCheckedInToday: false,
    todayCheckIn: null
  });

  // Verify server session and load user profile & habits from PostgreSQL
  useEffect(() => {
    let cancelled = false;
    if (window.api && window.api.me) {
      window.api.me()
        .then(({ user: sessionUser }) => {
          if (cancelled) return;
          setUser(sessionUser);

          // If authenticated, fetch profile from PostgreSQL to check if onboarding was completed
          window.api.getProfile()
            .then(profileRes => {
              if (cancelled) return;
              if (profileRes && profileRes.hasCompletedOnboarding && profileRes.profile) {
                setAppState(prev => ({
                  ...prev,
                  profile: { ...profileRes.profile, isCompleted: true }
                }));
              }
            })
            .catch(console.warn);

          // Fetch daily check-in status
          window.api.getCheckInStatus()
            .then(statusRes => {
              if (cancelled) return;
              if (statusRes) {
                setCheckInStatus({
                  hasCheckedInToday: !!statusRes.hasCheckedInToday,
                  todayCheckIn: statusRes.todayCheckIn || null
                });
              }
            })
            .catch(console.warn);

          // Fetch recent check-ins
          window.api.getRecentCheckIns()
            .then(recentRes => {
              if (cancelled) return;
              if (recentRes && recentRes.checkIns) {
                setAppState(prev => ({ ...prev, dailyCheckIns: recentRes.checkIns }));
              }
            })
            .catch(console.warn);

          // Fetch distractions & focus sessions if on server
          if (window.api.listDistractions) {
            window.api.listDistractions()
              .then(distRes => {
                if (cancelled) return;
                if (distRes && Array.isArray(distRes.distractions)) {
                  setAppState(prev => ({ ...prev, distractions: distRes.distractions }));
                }
              })
              .catch(console.warn);
          }

          if (window.api.listFocusSessions) {
            window.api.listFocusSessions()
              .then(focusRes => {
                if (cancelled) return;
                if (focusRes && Array.isArray(focusRes.sessions)) {
                  setAppState(prev => ({ ...prev, focusSessions: focusRes.sessions }));
                }
              })
              .catch(console.warn);
          }

          if (window.api.getPreferences) {
            window.api.getPreferences()
              .then(prefRes => {
                if (cancelled) return;
                if (prefRes && prefRes.preferences) {
                  setAppState(prev => ({
                    ...prev,
                    theme: prefRes.preferences.theme || prev.theme,
                    soundEnabled: prefRes.preferences.notification_enabled !== false,
                    distractionGoalMinutes: Number(prefRes.preferences.daily_distraction_goal_minutes) || prev.distractionGoalMinutes || 45
                  }));
                }
              })
              .catch(console.warn);
          }
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
  const [showAddDistractionModal, setShowAddDistractionModal] = useState(false);
  const [activeFocusSession, setActiveFocusSession] = useState(null);
  const [activeQuickReset, setActiveQuickReset] = useState(ACTIVITIES['breathing-426']);

  // Active Routine Countdown Timer Session State
  const [activeTimingHabit, setActiveTimingHabit] = useState(null); // { habit, mode: 'full' | 'min' }
  const [unmarkModalHabit, setUnmarkModalHabit] = useState(null);

  const earlySignals = useMemo(() => evaluateEarlyStressSignals(appState, appState.dailyCheckIns), [appState]);
  const wellbeing = useMemo(() => calculateWellbeingIndex(appState), [appState]);
  const insights = useMemo(() => generateAIInsights(appState), [appState]);

  // --- DISTRACTION & FOCUS SESSION ACTION HANDLERS ---
  const handleSaveDistraction = async (distData) => {
    const newDist = {
      id: 'dist-' + Date.now(),
      category: distData.category || 'Other',
      durationMinutes: Number(distData.durationMinutes) || 5,
      note: distData.note || '',
      loggedAt: distData.loggedAt || new Date().toISOString()
    };

    setAppState(prev => ({
      ...prev,
      distractions: [newDist, ...(prev.distractions || [])]
    }));

    if (user && window.api?.createDistraction) {
      try {
        await window.api.createDistraction(distData);
      } catch (err) {
        console.warn('Sync distraction error:', err);
      }
    }

    if (window.confetti) window.confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
    setShowAddDistractionModal(false);
  };

  const handleDeleteDistraction = async (id) => {
    setAppState(prev => ({
      ...prev,
      distractions: (prev.distractions || []).filter(d => d.id !== id)
    }));

    if (user && window.api?.deleteDistraction) {
      try {
        await window.api.deleteDistraction(id);
      } catch (err) {
        console.warn('Delete distraction error:', err);
      }
    }
  };

  const handleSaveFocusSession = async (sessionData) => {
    const newSession = {
      id: 'focus-' + Date.now(),
      taskName: sessionData.taskName || 'Focus Session',
      plannedDurationMinutes: Number(sessionData.plannedDurationMinutes) || 25,
      actualDurationMinutes: Number(sessionData.actualDurationMinutes) || 25,
      distractionsCount: Number(sessionData.distractionsCount) || 0,
      totalDistractionMinutes: Number(sessionData.totalDistractionMinutes) || 0,
      focusRate: Number(sessionData.focusRate) || 100,
      habitId: sessionData.habitId || null,
      notes: sessionData.notes || '',
      completedAt: new Date().toISOString()
    };

    setAppState(prev => {
      let updatedHabits = prev.habits;
      if (sessionData.habitId) {
        updatedHabits = prev.habits.map(h => {
          if (h.id !== sessionData.habitId) return h;
          const newStreak = h.currentStreak + 1;
          return {
            ...h,
            todayStatus: 'full',
            currentStreak: newStreak,
            bestStreak: Math.max(h.bestStreak, newStreak),
            todayCompletedAt: Date.now()
          };
        });
      }

      return {
        ...prev,
        focusSessions: [newSession, ...(prev.focusSessions || [])],
        habits: updatedHabits
      };
    });

    if (user && window.api?.createFocusSession) {
      try {
        await window.api.createFocusSession(sessionData);
      } catch (err) {
        console.warn('Sync focus session error:', err);
      }
    }

    if (window.confetti) window.confetti({ particleCount: 65, spread: 80, origin: { y: 0.5 } });
    setActiveFocusSession(null);
  };

  const handleUpdateDistractionGoal = async (newGoalMin) => {
    const val = Math.max(5, Math.min(300, Number(newGoalMin) || 45));
    setAppState(prev => ({
      ...prev,
      distractionGoalMinutes: val
    }));

    if (user && window.api?.updatePreferences) {
      try {
        await window.api.updatePreferences(appState.theme, appState.soundEnabled, val);
      } catch (err) {
        console.warn('Sync distraction goal error:', err);
      }
    }
  };

  // --- GOOGLE AUTH HANDLERS ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { user: verifiedUser } = await window.api.loginWithGoogle(credentialResponse.credential);
      setUser(verifiedUser);
      if (window.confetti) window.confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });

      // Check if user has already completed onboarding on the server
      try {
        const profileRes = await window.api.getProfile();
        if (profileRes && profileRes.hasCompletedOnboarding && profileRes.profile) {
          setAppState(prev => ({
            ...prev,
            profile: { ...profileRes.profile, isCompleted: true }
          }));
          setCurrentView('dashboard');
        } else {
          // FIRST-TIME USER: show 7-question onboarding!
          setCurrentView('onboarding');
        }
      } catch (e) {
        setCurrentView(appState.profile?.isCompleted ? 'dashboard' : 'onboarding');
      }
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      alert('Could not sign you in with Google. Please verify server connection.');
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

  // --- HABIT ACTION HANDLERS (LAUNCHES COUNTDOWN TIMER & ENCOURAGEMENT) ---
  const handleToggleHabit = (habitId, mode = 'full') => {
    const habit = appState.habits.find(h => h.id === habitId);
    if (!habit) return;

    // If already marked complete today, show prompt to unmark or start another focus timer
    if (habit.todayStatus === 'full' || habit.todayStatus === 'min') {
      setUnmarkModalHabit({ habit, mode });
      return;
    }

    // Launch active countdown session with encouraging motivation!
    audioService.init();
    if (appState.soundEnabled) audioService.playChime('inhale');
    setActiveTimingHabit({ habit, mode });
  };

  const handleCompleteRoutineSession = (habitId, mode = 'full', durationElapsed = 0) => {
    audioService.init();
    if (appState.soundEnabled) audioService.playChime('exhale');

    setAppState(prev => {
      const updated = prev.habits.map(h => {
        if (h.id !== habitId) return h;
        const newStreak = h.currentStreak + 1;
        const bestStreak = Math.max(h.bestStreak, newStreak);

        return {
          ...h,
          todayStatus: mode,
          currentStreak: newStreak,
          bestStreak,
          todayCompletedAt: Date.now()
        };
      });

      return { ...prev, habits: updated };
    });

    if (window.confetti) {
      window.confetti({ particleCount: mode === 'min' ? 35 : 65, spread: 70, origin: { y: 0.6 } });
    }

    if (user && window.api?.createBreathingSession) {
      const habit = appState.habits.find(h => h.id === habitId);
      const title = habit ? `Routine: ${habit.title} (${mode === 'min' ? 'Minimum Mode' : 'Full Target'})` : 'Daily Routine';
      window.api.createBreathingSession(title, durationElapsed || 60).catch(console.warn);
    }

    setActiveTimingHabit(null);
  };

  const handleUnmarkHabit = (habitId) => {
    setAppState(prev => ({
      ...prev,
      habits: prev.habits.map(h => {
        if (h.id !== habitId) return h;
        return {
          ...h,
          todayStatus: null,
          currentStreak: Math.max(0, h.currentStreak - 1),
          todayCompletedAt: null
        };
      })
    }));
    setUnmarkModalHabit(null);
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

  // --- DAILY MONITORING CHECK-IN HANDLER (1-3 CONTEXTUAL QUESTIONS) ---
  const handleSaveDailyCheckIn = async (checkInData) => {
    const newEntry = {
      id: 'checkin-' + Date.now(),
      checkInDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      ...checkInData
    };

    setAppState(prev => ({
      ...prev,
      dailyCheckIns: [newEntry, ...prev.dailyCheckIns],
      lastCheckInDate: new Date().toISOString().split('T')[0]
    }));

    setCheckInStatus({
      hasCheckedInToday: true,
      todayCheckIn: newEntry
    });

    if (user && window.api?.logDailyCheckIn) {
      try {
        await window.api.logDailyCheckIn(checkInData);
      } catch (err) {
        console.warn('Failed to sync check-in with server:', err);
      }
    }

    if (window.confetti) window.confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
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

    if (user && window.api?.createPressureEvent) {
      window.api.createPressureEvent(pressureData).catch(console.warn);
    }
    setShowPressureModal(false);
  };

  // Launch Quick Reset
  const startQuickReset = (activity = ACTIVITIES['breathing-426']) => {
    audioService.init();
    setActiveQuickReset(activity || ACTIVITIES['breathing-426']);
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

  // --- FINISH 7-QUESTION ONBOARDING ---
  const handleCompleteOnboarding = (profileData) => {
    const newProfile = { ...profileData, isCompleted: true };

    // Generate personalized starter habits tailored to their occupation & routine
    const isStudent = (profileData.occupation || '').toLowerCase().includes('student');
    const isBoth = (profileData.occupation || '').toLowerCase().includes('both');

    const initialHabits = [
      {
        id: 'habit-auto-1',
        goalId: 'goal-1',
        title: isStudent ? 'Deep Focus Study Block' : isBoth ? 'Focused Study / Task Sprint' : 'Deep Work Block',
        category: 'Focus',
        icon: '📚',
        targetVal: 30,
        targetUnit: 'min',
        minModeVal: 5,
        minModeUnit: 'min',
        preferredTime: profileData.peakTime || 'evening',
        currentStreak: 0,
        bestStreak: 0,
        difficultyLevel: 2,
        todayStatus: null,
        todayCompletedAt: null
      },
      {
        id: 'habit-auto-2',
        goalId: 'goal-2',
        title: 'Daily Movement & Posture Reset',
        category: 'Movement',
        icon: '🏃',
        targetVal: 20,
        targetUnit: 'min',
        minModeVal: 2,
        minModeUnit: 'min',
        preferredTime: 'morning',
        currentStreak: 0,
        bestStreak: 0,
        difficultyLevel: 2,
        todayStatus: null,
        todayCompletedAt: null
      },
      {
        id: 'habit-auto-3',
        goalId: 'goal-3',
        title: isStudent ? '60s Exam & Study Reset' : '60s Decompression Breath',
        category: 'Mindfulness',
        icon: '🫁',
        targetVal: 1,
        targetUnit: 'session',
        minModeVal: 1,
        minModeUnit: 'session',
        preferredTime: 'anytime',
        currentStreak: 0,
        bestStreak: 0,
        difficultyLevel: 1,
        todayStatus: null,
        todayCompletedAt: null
      }
    ];

    setAppState(prev => ({
      ...prev,
      profile: newProfile,
      habits: initialHabits
    }));

    if (user && window.api?.updateProfile) {
      window.api.updateProfile(newProfile).catch(console.warn);
    }

    if (window.confetti) window.confetti({ particleCount: 65, spread: 80, origin: { y: 0.5 } });
    setCurrentView('dashboard');
  };

  // --- THEME WORK & FOCUS MODE HANDLER ---
  const handleSetThemeAndMode = (newThemeId) => {
    const modeConfig = THEME_WORK_MODES[newThemeId];
    if (!modeConfig) return;

    setAppState(prev => {
      let newAmbient = prev.ambientSound;
      if (prev.soundEnabled && modeConfig.recommendedAmbient && modeConfig.recommendedAmbient !== 'none') {
        newAmbient = modeConfig.recommendedAmbient;
      }
      return {
        ...prev,
        theme: newThemeId,
        ambientSound: newAmbient
      };
    });

    audioService.init();
    if (appState.soundEnabled) audioService.playChime('hold');
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
        onQuickReset={() => startQuickReset(earlySignals.recommendedActivity || ACTIVITIES['breathing-426'])}
        onOpenSafety={() => setShowSafetyModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        theme={appState.theme}
        setTheme={handleSetThemeAndMode}
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
            theme={appState.theme}
            setTheme={handleSetThemeAndMode}
            wellbeing={wellbeing}
            earlySignals={earlySignals}
            insights={insights}
            upcomingPressures={appState.upcomingPressures}
            checkInStatus={checkInStatus}
            distractions={appState.distractions}
            focusSessions={appState.focusSessions}
            distractionGoalMinutes={appState.distractionGoalMinutes}
            onSaveDailyCheckIn={handleSaveDailyCheckIn}
            onToggleHabit={handleToggleHabit}
            onAddHabit={() => { setEditingHabit(null); setShowHabitModal(true); }}
            onEditHabit={(h) => { setEditingHabit(h); setShowHabitModal(true); }}
            onDeleteHabit={handleDeleteHabit}
            onOpenFailureModal={(habit) => { setActiveFailureHabit(habit); setShowFailureModal(true); }}
            onQuickReset={startQuickReset}
            onOpenCoach={() => setCurrentView('coach')}
            onOpenGoals={() => setCurrentView('goals')}
            onOpenWeeklyReport={() => setCurrentView('weekly-report')}
            onOpenDistractions={() => setCurrentView('distractions')}
            onStartFocusSession={(cfg) => setActiveFocusSession(cfg || { taskName: 'Deep Focus Study Block', durationMin: 25 })}
            onAddDistraction={() => setShowAddDistractionModal(true)}
            onAddPressure={() => setShowPressureModal(true)}
            onSignIn={() => setCurrentView('login')}
          />
        )}

        {currentView === 'distractions' && (
          <DistractionTrackerHubView
            user={user}
            distractions={appState.distractions || []}
            focusSessions={appState.focusSessions || []}
            distractionGoalMinutes={appState.distractionGoalMinutes || 45}
            habits={appState.habits || []}
            wellbeing={wellbeing}
            earlySignals={earlySignals}
            insights={insights}
            onBack={() => setCurrentView('dashboard')}
            onAddDistraction={() => setShowAddDistractionModal(true)}
            onDeleteDistraction={handleDeleteDistraction}
            onStartFocusSession={(cfg) => setActiveFocusSession(cfg || { taskName: 'Deep Focus Study Block', durationMin: 25 })}
            onUpdateGoal={handleUpdateDistractionGoal}
            onQuickReset={startQuickReset}
            onSignIn={() => setCurrentView('login')}
          />
        )}

        {currentView === 'coach' && (
          <CoachView
            user={user}
            appState={appState}
            wellbeing={wellbeing}
            earlySignals={earlySignals}
            distractions={appState.distractions}
            focusSessions={appState.focusSessions}
            onToggleHabit={handleToggleHabit}
            onQuickReset={startQuickReset}
            onBack={() => setCurrentView('dashboard')}
            onOpenDistractions={() => setCurrentView('distractions')}
            onStartFocusSession={(cfg) => setActiveFocusSession(cfg || { taskName: 'Focused Study Sprint', durationMin: 25 })}
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
            earlySignals={earlySignals}
            distractions={appState.distractions}
            focusSessions={appState.focusSessions}
            distractionGoalMinutes={appState.distractionGoalMinutes}
            onBack={() => setCurrentView('dashboard')}
            onQuickReset={() => startQuickReset(ACTIVITIES['breathing-426'])}
            onOpenDistractions={() => setCurrentView('distractions')}
          />
        )}

        {currentView === 'login' && (
          <LoginView
            user={user}
            googleClientId={googleClientId}
            setGoogleClientId={setGoogleClientId}
            onGoogleSuccess={handleGoogleSuccess}
            onContinueAsGuest={() => setCurrentView(appState.profile?.isCompleted ? 'dashboard' : 'onboarding')}
            onBack={() => setCurrentView(appState.profile?.isCompleted ? 'dashboard' : 'landing')}
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
      {/* Interactive Live Focus Session Player */}
      {activeFocusSession && (
        <FocusSessionModal
          activeFocusSession={activeFocusSession}
          habits={appState.habits}
          theme={appState.theme}
          onSaveDistraction={handleSaveDistraction}
          onComplete={handleSaveFocusSession}
          onCancel={() => setActiveFocusSession(null)}
          soundEnabled={appState.soundEnabled}
          ambientSound={appState.ambientSound}
          setAmbientSound={(s) => setAppState(prev => ({ ...prev, ambientSound: s }))}
        />
      )}

      {/* Quick Add Distraction Modal */}
      {showAddDistractionModal && (
        <AddDistractionModal
          onSave={handleSaveDistraction}
          onClose={() => setShowAddDistractionModal(false)}
        />
      )}

      {/* Interactive Routine Focus & Countdown Player */}
      {activeTimingHabit && (
        <RoutineCountdownModal
          activeTimingHabit={activeTimingHabit}
          theme={appState.theme}
          onComplete={handleCompleteRoutineSession}
          onCancel={() => setActiveTimingHabit(null)}
          soundEnabled={appState.soundEnabled}
          ambientSound={appState.ambientSound}
          setAmbientSound={(s) => setAppState(prev => ({ ...prev, ambientSound: s }))}
        />
      )}

      {/* Habit Unmark / Repeat Dialog */}
      {unmarkModalHabit && (
        <HabitUnmarkDialog
          habit={unmarkModalHabit.habit}
          onClose={() => setUnmarkModalHabit(null)}
          onUnmark={handleUnmarkHabit}
          onStartNewSession={(habit, mode) => {
            setUnmarkModalHabit(null);
            setActiveTimingHabit({ habit, mode: mode || 'full' });
          }}
        />
      )}

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
                WELL-BEING
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">Personal Adaptive Habit & Well-Being Intelligence</p>
          </div>
        </div>

        {/* Action Center */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Quick Reset 60s CTA */}
          <button
            onClick={onQuickReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 hover:border-teal-400 text-teal-700 hover:text-teal-900 text-xs font-semibold transition-all shadow-sm"
            title="Start instant tailored breathing reset"
          >
            <i data-lucide="wind" className="w-3.5 h-3.5 text-teal-600"></i>
            <span className="hidden sm:inline">⚡ Quick Reset</span>
          </button>

          {/* Distraction & Focus Hub CTA */}
          <button
            onClick={() => setCurrentView('distractions')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              currentView === 'distractions'
                ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'bg-white border-slate-200 hover:border-amber-300 text-slate-700 hover:text-slate-900'
            }`}
            title="Track distractions and manage focus sessions"
          >
            <i data-lucide="target" className={`w-3.5 h-3.5 ${currentView === 'distractions' ? 'text-white' : 'text-amber-600'}`}></i>
            <span className="hidden sm:inline">Focus & Distractions</span>
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

          {/* Theme Work Mode Selector */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
            {Object.values(THEME_WORK_MODES).map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                  theme === t.id 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200 scale-105' 
                    : 'text-slate-500 hover:text-slate-900 opacity-70 hover:opacity-100'
                }`}
                title={`${t.modeTitle}: ${t.tagline}`}
              >
                <span>{t.icon}</span>
                <span className="hidden md:inline">{t.name.split(' ')[0]}</span>
              </button>
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
// 2. ONBOARDING WIZARD (STRICTLY 7 CAREFULLY SELECTED QUESTIONS)
// ==========================================================================

function OnboardingWizard({ initialProfile, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const [profile, setProfile] = useState({
    occupation: initialProfile?.occupation || 'Student', // Q1
    weekdayPattern: initialProfile?.weekdayPattern || 'Structured & fixed routine', // Q2
    dailyHours: initialProfile?.dailyHours || '6-8 hours', // Q3
    peakTime: initialProfile?.peakTime || 'evening', // Q4
    sleepDuration: initialProfile?.sleepDuration || '7-8 hours', // Q5
    stressCauses: initialProfile?.stressCauses || ['Exams & academic evaluations', 'Tight deadlines & time urgency', 'Overthinking & mental chatter'], // Q6
    recoveryActivities: initialProfile?.recoveryActivities || ['Take a walk / light movement', 'Listen to music / calming audio', 'Guided breathing & mindfulness reset'], // Q7
    hurdles: initialProfile?.hurdles || ['Late nights & irregular sleep', 'Procrastination / Overthinking'],
    motivationStyle: initialProfile?.motivationStyle || 'streaks',
    stressBaseline: initialProfile?.stressBaseline || 5,
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
        {/* Step 1: What do you mainly do? */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">✨ Step 1 of 7 • Your Daily Role</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">What do you mainly do?</h2>
              <p className="text-sm text-slate-600 mt-1">This helps us tailor habit durations, reminders, and reset exercises to your role.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'Student', label: '🎓 Student / Academics', desc: 'Classes, study blocks, exam preparation' },
                { id: 'Working Professional', label: '💼 Working Professional', desc: 'Work hours, deliverables, meetings' },
                { id: 'Work & Study Both', label: '📚 Work & Study Both', desc: 'Balancing job shifts with coursework' },
                { id: 'Freelancer / Creative', label: '🎨 Freelancer / Creative', desc: 'Self-directed projects & flexible pacing' },
                { id: 'Other', label: '🌐 Other / General', desc: 'Personal projects & daily lifestyle' }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setProfile({ ...profile, occupation: item.id })}
                  className={`onboard-option-card ${profile.occupation === item.id ? 'selected' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-900">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                  {profile.occupation === item.id && (
                    <i data-lucide="check-circle-2" className="w-5 h-5 text-indigo-600 flex-shrink-0"></i>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: What does a normal weekday look like for you? */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">✨ Step 2 of 7 • Daily Rhythm</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">What does a normal weekday look like for you?</h2>
              <p className="text-sm text-slate-600 mt-1">Understanding your daily structure helps the coach prevent overloaded schedules.</p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'Structured & fixed routine', label: '⏰ Structured & Fixed Routine', desc: 'Predictable daily hours, fixed class/work schedules' },
                { id: 'Fast-paced & deadline-driven', label: '⚡ Fast-Paced & Deadline-Driven', desc: 'High urgency, frequent tasks, sudden pressure bursts' },
                { id: 'Heavy screen time & sedentary', label: '💻 Heavy Screen Time & Desk Work', desc: 'Long computer hours, mental strain, posture fatigue' },
                { id: 'Highly variable & shifting', label: '🌊 Highly Variable & Shifting', desc: 'Changing shifts, travel, unpredictable daily demands' },
                { id: 'Flexible & creative', label: '🎨 Flexible & Self-Paced', desc: 'Self-managed schedule with creative flow' }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setProfile({ ...profile, weekdayPattern: item.id })}
                  className={`onboard-option-card ${profile.weekdayPattern === item.id ? 'selected' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-900">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                  {profile.weekdayPattern === item.id && (
                    <i data-lucide="check-circle-2" className="w-5 h-5 text-indigo-600 flex-shrink-0"></i>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: How many hours do you usually spend studying/working? */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">✨ Step 3 of 7 • Work & Study Load</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">How many hours do you usually spend studying/working?</h2>
              <p className="text-sm text-slate-600 mt-1">We will scale habit targets so you never feel overwhelmed on demanding days.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: '< 4 hours', label: '🌱 Under 4 hours', desc: 'Light or part-time focus load' },
                { id: '4–6 hours', label: '🌿 4 to 6 hours', desc: 'Moderate, balanced workload' },
                { id: '6–8 hours', label: '💼 6 to 8 hours', desc: 'Standard full day schedule' },
                { id: '8–10 hours', label: '⚡ 8 to 10 hours', desc: 'Demanding work or intensive study' },
                { id: '10+ hours', label: '🔥 10+ hours', desc: 'High intensity / exam crunch' }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setProfile({ ...profile, dailyHours: item.id })}
                  className={`onboard-option-card ${profile.dailyHours === item.id ? 'selected' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-900">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                  {profile.dailyHours === item.id && (
                    <i data-lucide="check-circle-2" className="w-5 h-5 text-indigo-600 flex-shrink-0"></i>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: When do you usually feel the most pressure during the day? */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">✨ Step 4 of 7 • Peak Energy Window</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">When do you usually feel the most pressure during the day?</h2>
              <p className="text-sm text-slate-600 mt-1">Knowing your friction peak allows Breathly to proactively position micro-resets.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'morning', label: '🌅 Early Morning (6 AM – 10 AM)', desc: 'Starting friction, morning rush, dawn deadlines' },
                { id: 'midday', label: '☀️ Midday / Afternoon (11 AM – 4 PM)', desc: 'Heavy meetings, task peak, mental fatigue' },
                { id: 'evening', label: '🌆 Late Evening (5 PM – 9 PM)', desc: 'Winding down difficulties, cramming, backlog' },
                { id: 'night', label: '🌙 Night / Late Night (10 PM – 2 AM)', desc: 'Overthinking in bed, sleep resistance' },
                { id: 'unpredictable', label: '🔄 Unpredictable / Bursts', desc: 'Fluctuates based on daily emergencies' }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setProfile({ ...profile, peakTime: item.id })}
                  className={`onboard-option-card ${profile.peakTime === item.id ? 'selected' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-900">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                  {profile.peakTime === item.id && (
                    <i data-lucide="check-circle-2" className="w-5 h-5 text-indigo-600 flex-shrink-0"></i>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: How much do you usually sleep? */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">✨ Step 5 of 7 • Sleep Baseline</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">How much do you usually sleep?</h2>
              <p className="text-sm text-slate-600 mt-1">Sleep is the master regulator. When sleep drops below baseline, Breathly initiates Minimum Mode.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: '< 5 hours', label: '🥱 Under 5 hours (Deficit)', desc: 'Chronic fatigue & energy crashes' },
                { id: '5–6 hours', label: '🛏️ 5 to 6 hours (Lighter)', desc: 'Functional but prone to afternoon brain fog' },
                { id: '7–8 hours', label: '😴 7 to 8 hours (Optimal)', desc: 'Restorative, steady mental energy' },
                { id: '8+ hours', label: '✨ 8+ hours (Generous)', desc: 'Deep recovery & long sleep cycles' }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setProfile({ ...profile, sleepDuration: item.id })}
                  className={`onboard-option-card ${profile.sleepDuration === item.id ? 'selected' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-900">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                  {profile.sleepDuration === item.id && (
                    <i data-lucide="check-circle-2" className="w-5 h-5 text-indigo-600 flex-shrink-0"></i>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: What are the main things that cause pressure in your life? */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">✨ Step 6 of 7 • Daily Pressure Factors</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">What are the main things that cause pressure in your life?</h2>
              <p className="text-sm text-slate-600 mt-1">Select all that apply. (You can select multiple or skip)</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'Exams & academic evaluations', label: '🎓 Exams & Academic Evaluations' },
                { id: 'Heavy workload & deliverable volume', label: '💼 Heavy Workload & Volume' },
                { id: 'Tight deadlines & time urgency', label: '⏳ Tight Deadlines & Time Crunch' },
                { id: 'Lack of sleep & energy depletion', label: '😴 Sleep Deficit & Low Energy' },
                { id: 'Overthinking & mental chatter', label: '🧠 Overthinking & Mental Friction' },
                { id: 'Balancing work/study & personal life', label: '⚖️ Balancing Work/Study & Life' },
                { id: 'Social & family expectations', label: '👥 Social & Family Expectations' }
              ].map(item => {
                const isSelected = profile.stressCauses.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleArrayItem('stressCauses', item.id)}
                    className={`onboard-option-card ${isSelected ? 'selected' : ''}`}
                  >
                    <span className="font-semibold text-sm flex-1 text-slate-900">{item.label}</span>
                    <i data-lucide={isSelected ? 'check-circle-2' : 'circle'} className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}></i>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 7: What do you normally do when you feel stressed or mentally tired? */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">✨ Step 7 of 7 • Coping & Recharging Habits</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">What do you normally do when you feel stressed or mentally tired?</h2>
              <p className="text-sm text-slate-600 mt-1">Select your instinctive coping habits. (Select all that apply)</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'Take a walk / light movement', label: '🚶 Take a Walk / Movement' },
                { id: 'Listen to music / calming audio', label: '🎵 Music / Calming Audio' },
                { id: 'Scroll phone / social media', label: '📱 Scroll Phone / Social Media' },
                { id: 'Rest, nap, or sleep early', label: '😴 Rest, Nap, or Early Sleep' },
                { id: 'Guided breathing & mindfulness reset', label: '🫁 Guided Breathing & Reset' },
                { id: 'Talk with friends or family', label: '💬 Talk with Friends / Family' },
                { id: 'Step away for tea/coffee break', label: '☕ Step Away for a Warm Drink' }
              ].map(item => {
                const isSelected = profile.recoveryActivities.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleArrayItem('recoveryActivities', item.id)}
                    className={`onboard-option-card ${isSelected ? 'selected' : ''}`}
                  >
                    <span className="font-semibold text-sm flex-1 text-slate-900">{item.label}</span>
                    <i data-lucide={isSelected ? 'check-circle-2' : 'circle'} className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}></i>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs flex items-center gap-2">
              <i data-lucide="shield-check" className="w-4 h-4 text-emerald-600 flex-shrink-0"></i>
              <span>Your lifestyle responses are saved securely to automatically personalize your habit difficulty and digital resets.</span>
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
            <span>{step === totalSteps ? 'Personalize & Launch Flow 🚀' : 'Continue'}</span>
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
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-16 text-center space-y-8 animate-fade-in">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
        <i data-lucide="shield-check" className="w-4 h-4 text-emerald-600"></i>
        <span>Adaptive Habits • Early Pressure Detection • Digital Well-Being</span>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Achieve your goals without burning out.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          Reset learns your daily rhythm, detects early friction before stress spikes, and scales habit difficulty with Minimum Mode.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onStartOnboarding}
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 hover:scale-105"
        >
          <span>✨ Personalize My Daily Flow</span>
          <i data-lucide="arrow-right" className="w-4 h-4"></i>
        </button>

        <button
          onClick={onQuickReset}
          className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <i data-lucide="wind" className="w-4 h-4 text-teal-600"></i>
          <span>Try 60s Breathing Reset</span>
        </button>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 text-left">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-lg">⚡</div>
          <h3 className="font-bold text-sm text-slate-900">Minimum Mode (2-Min)</h3>
          <p className="text-xs text-slate-500">Scale habit difficulty down on exhausting days so you never break identity streaks.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-lg">📈</div>
          <h3 className="font-bold text-sm text-slate-900">Early Pressure Detection</h3>
          <p className="text-xs text-slate-500">Multi-signal pattern analysis detects workload spikes and sleep drops before burnout occurs.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-lg">🫁</div>
          <h3 className="font-bold text-sm text-slate-900">Contextual Micro-Resets</h3>
          <p className="text-xs text-slate-500">Tailored 60s & 2-min guided breathing for exam crunch, sleep deficit, and work fatigue.</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 4. DAILY WELL-BEING MONITORING COMPONENT (CONTEXTUAL 1-3 QUESTIONS)
// ==========================================================================

function DailyCheckInCard({ profile, upcomingPressures, checkInStatus, onSave }) {
  const [overallFeeling, setOverallFeeling] = useState('steady');
  const [workloadRating, setWorkloadRating] = useState('manageable');
  const [sleepQuality, setSleepQuality] = useState('normal');
  const [stressRating, setStressRating] = useState(5);
  const [stressfulEvent, setStressfulEvent] = useState(false);
  const [notes, setNotes] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [checkInStatus, isDismissed]);

  const isStudent = (profile?.occupation || '').toLowerCase().includes('student') || (profile?.occupation || '').toLowerCase().includes('both');
  
  // Find if user has an active upcoming exam/deadline in next 3 days
  const now = new Date();
  const nearPressure = (upcomingPressures || []).find(p => {
    if (!p.isActive) return false;
    if (!p.startDate) return true;
    const diffDays = (new Date(p.startDate) - now) / (1000 * 60 * 60 * 24);
    return diffDays >= -1 && diffDays <= 4;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      overallFeeling,
      workloadRating,
      sleepQuality,
      stressRating: Number(stressRating),
      stressfulEvent,
      eventContext: nearPressure ? nearPressure.title : null,
      notes
    });
  };

  if (isDismissed) return null;

  if (checkInStatus?.hasCheckedInToday) {
    return (
      <div className="daily-checkin-panel bg-emerald-50/50 border-emerald-200 flex items-center justify-between py-3.5 px-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
            <i data-lucide="check" className="w-4 h-4"></i>
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950">Today’s Well-Being Pulse Recorded</h4>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Habit difficulty and coaching signals are synced with your answers.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200">
          Cooldown Active
        </span>
      </div>
    );
  }

  return (
    <div className="daily-checkin-panel space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
            <i data-lucide="heart-pulse" className="w-4 h-4"></i>
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Daily Well-Being Check-in</h3>
            <p className="text-[11px] text-slate-500">1–3 quick contextual questions to adapt your day</p>
          </div>
        </div>

        <button 
          onClick={() => setIsDismissed(true)} 
          className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
          title="Dismiss for now"
        >
          Later
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Question 1: How is your day feeling overall? */}
        <div>
          <label className="text-slate-700 font-bold block mb-2">1. How is your day feeling overall?</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { id: 'great', label: '🌟 Great' },
              { id: 'steady', label: '🍃 Steady' },
              { id: 'demanding', label: '⚡ Demanding' },
              { id: 'exhausted', label: '😴 Exhausted' },
              { id: 'anxious', label: '🧠 Overthinking' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOverallFeeling(item.id)}
                className={`checkin-pill-btn ${overallFeeling === item.id ? 'selected' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: Workload / Contextual demands */}
        <div>
          <label className="text-slate-700 font-bold block mb-2">
            {nearPressure 
              ? `2. How are you feeling about upcoming "${nearPressure.title}"?`
              : isStudent 
              ? '2. How is your study / class workload today?' 
              : '2. How is your work and screen load today?'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'light', label: '🍃 Light / Easy' },
              { id: 'manageable', label: '💼 Manageable' },
              { id: 'heavy', label: '⚡ Heavy Load' },
              { id: 'overload', label: '🔥 Overloaded' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setWorkloadRating(item.id)}
                className={`checkin-pill-btn ${workloadRating === item.id ? 'selected' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 3: Sleep quality or Stress events */}
        <div>
          <label className="text-slate-700 font-bold block mb-2">3. How was your sleep last night?</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'restful', label: '😴 Restful (7h+)' },
              { id: 'normal', label: '🛏️ Normal / Decent' },
              { id: 'poor', label: '🥱 Disrupted / Restless' },
              { id: 'very_little', label: '💤 Very Little (<5h)' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSleepQuality(item.id)}
                className={`checkin-pill-btn ${sleepQuality === item.id ? 'selected' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional stress slider & quick note */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Pressure:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={stressRating}
              onChange={(e) => setStressRating(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <span className="text-xs font-bold text-indigo-700 w-7 text-right">{stressRating}/10</span>
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm"
          >
            Save Daily Pulse ✓
          </button>
        </div>
      </form>
    </div>
  );
}

// ==========================================================================
// 4B. DISTRACTION DASHBOARD CARD (OVERVIEW WIDGET ON MAIN DASHBOARD)
// ==========================================================================

function DistractionDashboardCard({
  user,
  distractions = [],
  focusSessions = [],
  distractionGoalMinutes = 45,
  onOpenDistractions,
  onStartFocusSession,
  onAddDistraction,
  onSignIn
}) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [user, distractions, focusSessions, distractionGoalMinutes]);

  // Unauthenticated view: show clean sign-in invitation with zero mock data
  if (!user) {
    return (
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100/80 border border-indigo-200 flex items-center justify-center text-2xl flex-shrink-0">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">Distraction & Focus Radar</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Personalized
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                Sign in with Google to monitor study interruptions, track focus sprints, and analyze attention trends with real-time intelligence.
              </p>
            </div>
          </div>

          <button
            onClick={onSignIn}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 flex-shrink-0 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign In with Google</span>
          </button>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayDistractions = (distractions || []).filter(d => {
    const dDate = d.loggedAt ? new Date(d.loggedAt).toISOString().split('T')[0] : todayStr;
    return dDate === todayStr;
  });

  const todayDistractionMin = todayDistractions.reduce((acc, d) => acc + (Number(d.durationMinutes) || 0), 0);
  const todayDistractionCount = todayDistractions.length;
  const avgDuration = todayDistractionCount > 0 ? Math.round(todayDistractionMin / todayDistractionCount) : 0;

  // Most common distraction category today
  const catCount = {};
  todayDistractions.forEach(d => {
    const cat = d.category || 'Other';
    catCount[cat] = (catCount[cat] || 0) + (Number(d.durationMinutes) || 0);
  });
  let topCategory = 'None yet';
  let topCategoryMin = 0;
  let topCatObj = null;
  Object.keys(catCount).forEach(c => {
    if (catCount[c] > topCategoryMin) {
      topCategoryMin = catCount[c];
      topCategory = c;
      topCatObj = DISTRACTION_CATEGORIES.find(dc => dc.label === c || dc.id === c);
    }
  });

  // Focus time today
  const todaySessions = (focusSessions || []).filter(s => {
    const sDate = s.completedAt ? new Date(s.completedAt).toISOString().split('T')[0] : todayStr;
    return sDate === todayStr;
  });
  const todayFocusMin = todaySessions.reduce((acc, s) => acc + (Number(s.actualDurationMinutes) || 0), 0);

  // Focus vs Distraction ratio
  const totalActivityMin = todayFocusMin + todayDistractionMin;
  const focusPercent = totalActivityMin > 0 ? Math.round((todayFocusMin / totalActivityMin) * 100) : 0;
  const distractionPercent = totalActivityMin > 0 ? (100 - focusPercent) : 0;

  // Daily goal progress
  const goalTarget = Number(distractionGoalMinutes) || 45;
  const goalPercent = Math.min(100, Math.round((todayDistractionMin / goalTarget) * 100));
  const isOverGoal = todayDistractionMin > goalTarget;

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">Distraction & Focus Radar</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Today's Pulse
              </span>
            </div>
            <p className="text-xs text-slate-500">Track interruptions, protect focus blocks & balance study energy</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddDistraction}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
          >
            <i data-lucide="plus-circle" className="w-3.5 h-3.5 text-rose-500"></i>
            <span>+ Log Interruption</span>
          </button>
          <button
            onClick={onOpenDistractions}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all flex items-center gap-1"
          >
            <span>Full Hub</span>
            <i data-lucide="arrow-right" className="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

      {/* 4-Stat Micro Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Distraction Time</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-xl font-black ${isOverGoal ? 'text-amber-600' : 'text-slate-800'}`}>
              {todayDistractionMin}
            </span>
            <span className="text-xs font-semibold text-slate-500">min</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">{todayDistractionCount} interruptions</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Focus Time</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-emerald-600">{todayFocusMin}</span>
            <span className="text-xs font-semibold text-slate-500">min</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">{todaySessions.length} active sessions</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Top Interruption</span>
          <div className="flex items-center gap-1.5 mt-1 truncate">
            <span className="text-base">{topCatObj?.icon || '📌'}</span>
            <span className="text-xs font-bold text-slate-800 truncate">{todayDistractionCount > 0 ? topCategory : '--'}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">{todayDistractionCount > 0 ? `${topCategoryMin}m logged` : 'Clean focus'}</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Duration</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-indigo-600">{avgDuration > 0 ? avgDuration : '--'}</span>
            <span className="text-xs font-semibold text-slate-500">{avgDuration > 0 ? 'm / pause' : ''}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">{avgDuration > 0 ? 'Quick recovery' : 'No data yet'}</span>
        </div>
      </div>

      {/* Focus vs Distraction Ratio Bar & Goal Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Ratio Split */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${totalActivityMin > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
              Focus ({focusPercent}%) vs <span className={`w-2 h-2 rounded-full ${totalActivityMin > 0 ? 'bg-rose-400' : 'bg-slate-300'} ml-1`}></span> Distraction ({distractionPercent}%)
            </span>
            <span className="text-[11px] font-semibold text-slate-500">{todayFocusMin}m vs {todayDistractionMin}m</span>
          </div>
          {totalActivityMin > 0 ? (
            <div className="h-2.5 w-full rounded-full bg-rose-100 overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-700 rounded-l-full"
                style={{ width: `${focusPercent}%` }}
                title={`Focus Time: ${todayFocusMin} min (${focusPercent}%)`}
              ></div>
              <div
                className="h-full bg-rose-400 transition-all duration-700"
                style={{ width: `${distractionPercent}%` }}
                title={`Distraction Time: ${todayDistractionMin} min (${distractionPercent}%)`}
              ></div>
            </div>
          ) : (
            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden" title="No activity recorded today">
              <div className="h-full w-0 bg-slate-200"></div>
            </div>
          )}
        </div>

        {/* Daily Distraction Goal Meter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <span>🎯 Daily Target:</span>
              <span className="font-extrabold text-indigo-600">{todayDistractionMin}/{goalTarget} min</span>
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              isOverGoal ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {isOverGoal ? `+${todayDistractionMin - goalTarget}m above target` : `${Math.max(0, goalTarget - todayDistractionMin)}m buffer left`}
            </span>
          </div>
          <div className="distraction-goal-bar">
            <div
              className={`distraction-goal-fill ${isOverGoal ? 'over-goal' : ''}`}
              style={{ width: `${goalPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Interactive Sprints Launcher */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <i data-lucide="timer" className="w-3.5 h-3.5 text-indigo-600"></i>
          <span className="font-semibold">Ready for uninterrupted study?</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartFocusSession({ taskName: 'Deep Focus Study Sprint', durationMin: 25 })}
            className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 transition-colors flex items-center gap-1"
          >
            <span>⚡ 25m Focus Block</span>
          </button>
          <button
            onClick={() => onStartFocusSession({ taskName: 'Deep Immersion 45m Block', durationMin: 45 })}
            className="px-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-colors"
          >
            <span>45m Immersion</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 5. DASHBOARD VIEW (PERSONALIZED DIGITAL WELL-BEING EXPERIENCE)
// ==========================================================================

function DashboardView({
  user,
  profile,
  habits,
  goals,
  theme,
  setTheme,
  wellbeing,
  earlySignals,
  insights,
  upcomingPressures,
  checkInStatus,
  distractions = [],
  focusSessions = [],
  distractionGoalMinutes = 45,
  onSaveDailyCheckIn,
  onToggleHabit,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
  onOpenFailureModal,
  onQuickReset,
  onOpenCoach,
  onOpenGoals,
  onOpenWeeklyReport,
  onOpenDistractions,
  onStartFocusSession,
  onAddDistraction,
  onAddPressure,
  onSignIn
}) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [habits, wellbeing, upcomingPressures, earlySignals, theme, distractions, focusSessions]);

  const completedCount = habits.filter(h => h.todayStatus === 'full' || h.todayStatus === 'min').length;
  const totalHabits = habits.length;
  const activeModeConfig = THEME_WORK_MODES[theme] || THEME_WORK_MODES.porcelain;

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
            <div className={`px-3.5 py-2 rounded-2xl border flex items-center gap-2.5 ${earlySignals.badgeClass}`}>
              <div className="w-2.5 h-2.5 rounded-full bg-current animate-pulse"></div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Well-Being Index</div>
                <div className="text-xs font-extrabold">{earlySignals.statusTitle}</div>
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

        {/* Early-Pressure Multi-Signal Proactive Alert */}
        {earlySignals.statusLevel !== 'calm' && (
          <div className={`early-signal-banner ${earlySignals.statusLevel} mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white/80 border border-current/10 flex-shrink-0">
                <i data-lucide="shield-alert" className="w-4 h-4"></i>
              </div>
              <div>
                <h4 className="text-xs font-bold">
                  {earlySignals.statusTitle}: {earlySignals.gentleNudge}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-[11px] mt-1 opacity-90">
                  {earlySignals.riskSignals.slice(0, 2).map((sig, idx) => (
                    <span key={idx} className="bg-white/60 px-2 py-0.5 rounded-md font-medium">
                      • {sig}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onQuickReset(earlySignals.recommendedActivity)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold border border-slate-200 shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5 self-start sm:self-center"
            >
              <i data-lucide="wind" className="w-3.5 h-3.5 text-teal-600"></i>
              <span>{earlySignals.recommendedActivity?.title || 'Start Tailored Reset'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Theme Work Mode Banner */}
      <div className="work-mode-banner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{activeModeConfig.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">{activeModeConfig.modeTitle}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-slate-800 border border-slate-200 shadow-2xs">
                  Active Work Mode
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{activeModeConfig.workDescription}</p>
            </div>
          </div>
        </div>

        {/* 4-Pill Work Mode Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {Object.values(THEME_WORK_MODES).map((mode) => {
            const isSelected = theme === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setTheme(mode.id)}
                className={`work-mode-pill-btn ${isSelected ? `active-${mode.id}` : ''}`}
                title={mode.workDescription}
              >
                <span className="text-base">{mode.icon}</span>
                <div className="flex-1 truncate text-left">
                  <div className="text-xs font-bold leading-tight truncate">{mode.name.split(' ')[0]}</div>
                  <div className="text-[10px] opacity-75 truncate">{mode.modeTitle.split('&')[0]}</div>
                </div>
                {isSelected && (
                  <i data-lucide="check" className="w-3.5 h-3.5 flex-shrink-0"></i>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* NEW FEATURE: Distraction & Focus Dashboard Widget */}
      <DistractionDashboardCard
        user={user}
        distractions={distractions}
        focusSessions={focusSessions}
        distractionGoalMinutes={distractionGoalMinutes}
        onOpenDistractions={onOpenDistractions}
        onStartFocusSession={onStartFocusSession}
        onAddDistraction={onAddDistraction}
        onSignIn={onSignIn}
      />

      {/* Daily Well-Being Monitoring Widget */}
      <DailyCheckInCard
        profile={profile}
        upcomingPressures={upcomingPressures}
        checkInStatus={checkInStatus}
        onSave={onSaveDailyCheckIn}
      />

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
                  className={`habit-card ${isFull ? 'completed-full' : isMin ? 'completed-min' : 'cursor-pointer'}`}
                  onClick={(e) => {
                    if (e.target.closest('button')) return;
                    onToggleHabit(habit.id, 'full');
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Checkbox & Details */}
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleHabit(habit.id, 'full');
                        }}
                        className={`habit-checkbox ${isFull ? 'checked-full' : isMin ? 'checked-min' : ''}`}
                        title={isFull || isMin ? "Completed today - click to review or unmark" : "Touch to start countdown timer"}
                      >
                        {(isFull || isMin) ? (
                          <i data-lucide="check" className="w-4 h-4 text-white"></i>
                        ) : (
                          <i data-lucide="play" className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600"></i>
                        )}
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
                          {!isFull && !isMin && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-600 font-bold flex items-center gap-1">
                                <i data-lucide="timer" className="w-3 h-3"></i>
                                Touch to start timer
                              </span>
                            </>
                          )}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditHabit(habit);
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleHabit(habit.id, 'min');
                        }}
                        className={`min-mode-pill ${isMin ? 'bg-amber-400 text-slate-950 font-extrabold' : ''}`}
                        title="Start Minimum Mode countdown (micro-dose)"
                      >
                        <span>⚡ Min: {habit.minModeVal} {habit.minModeUnit}</span>
                      </button>
                      
                      {isMin ? (
                        <span className="text-[10px] text-amber-700 font-semibold">Streak saved!</span>
                      ) : !isFull && (
                        <span className="text-[10px] text-slate-400">Micro-timer</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenFailureModal(habit);
                      }}
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

        {/* Right Column: AI Pattern Insights & Quick Hub */}
        <div className="space-y-4">
          {/* AI Pattern Insights Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="sparkles" className="w-3.5 h-3.5"></i>
                <span>Well-Being Intelligence</span>
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

          {/* Tailored Resets Hub */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="wind" className="w-3.5 h-3.5 text-teal-600"></i>
              <span>Tailored Digital Resets</span>
            </h3>

            <div className="space-y-2">
              {[
                ACTIVITIES['breathing-box'],
                ACTIVITIES['breathing-sigh'],
                ACTIVITIES['breathing-478']
              ].map(act => (
                <div
                  key={act.id}
                  onClick={() => onQuickReset(act)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🫁</span>
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{act.title}</div>
                      <div className="text-[10px] text-teal-700 font-medium">{act.tag}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{act.duration}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Hub Navigation */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quick Navigation</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenDistractions}
                className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-semibold flex items-center gap-2 transition-all shadow-2xs"
              >
                <span>🎯</span>
                <span>Focus Radar</span>
              </button>
              <button
                onClick={onOpenGoals}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold flex items-center gap-2 transition-all"
              >
                <span>🏆</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 5B. DISTRACTION TRACKER HUB VIEW (DEDICATED FULL FEATURE HUB)
// ==========================================================================

function DistractionTrackerHubView({
  user,
  distractions = [],
  focusSessions = [],
  distractionGoalMinutes = 45,
  habits = [],
  wellbeing,
  earlySignals,
  insights,
  onBack,
  onAddDistraction,
  onDeleteDistraction,
  onStartFocusSession,
  onUpdateGoal,
  onQuickReset,
  onSignIn
}) {
  const [filterPeriod, setFilterPeriod] = useState('all'); // 'all' | 'today' | 'week'
  const [filterCategory, setFilterCategory] = useState('all');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(distractionGoalMinutes || 45);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [user, distractions, focusSessions, filterPeriod, filterCategory, isEditingGoal]);

  // Unauthenticated view: show dedicated sign-in invitation card
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6 animate-fade-in">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
        >
          <i data-lucide="arrow-left" className="w-4 h-4"></i>
          <span>Back to Dashboard</span>
        </button>

        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-white text-center shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-indigo-100/80 border border-indigo-200 flex items-center justify-center text-3xl mx-auto">
            🎯
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Sign in to Access Your Distraction Hub</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Connect your Google account to log focus sprints, track study interruptions, and unlock full 7-day cognitive attention analytics.
            </p>
          </div>
          <button
            onClick={onSignIn}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign In with Google</span>
          </button>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Today's metrics
  const todayDistractions = (distractions || []).filter(d => {
    const dDate = d.loggedAt ? new Date(d.loggedAt).toISOString().split('T')[0] : todayStr;
    return dDate === todayStr;
  });

  const todayDistractionMin = todayDistractions.reduce((acc, d) => acc + (Number(d.durationMinutes) || 0), 0);
  const todayDistractionCount = todayDistractions.length;
  const avgDuration = todayDistractionCount > 0 ? Math.round(todayDistractionMin / todayDistractionCount) : 0;

  // Most common category today
  const todayCatCounts = {};
  todayDistractions.forEach(d => {
    const cat = d.category || 'Other';
    todayCatCounts[cat] = (todayCatCounts[cat] || 0) + (Number(d.durationMinutes) || 0);
  });
  let topTodayCategory = 'None yet';
  let topTodayCategoryMin = 0;
  let topCatObj = null;
  Object.keys(todayCatCounts).forEach(c => {
    if (todayCatCounts[c] > topTodayCategoryMin) {
      topTodayCategoryMin = todayCatCounts[c];
      topTodayCategory = c;
      topCatObj = DISTRACTION_CATEGORIES.find(dc => dc.label === c || dc.id === c);
    }
  });

  // Focus time today
  const todaySessions = (focusSessions || []).filter(s => {
    const sDate = s.completedAt ? new Date(s.completedAt).toISOString().split('T')[0] : todayStr;
    return sDate === todayStr;
  });
  const todayFocusMin = todaySessions.reduce((acc, s) => acc + (Number(s.actualDurationMinutes) || 0), 0);
  const totalActivityMin = todayFocusMin + todayDistractionMin;
  const focusPercent = totalActivityMin > 0 ? Math.round((todayFocusMin / totalActivityMin) * 100) : 0;
  const distractionPercent = totalActivityMin > 0 ? (100 - focusPercent) : 0;

  // Daily Goal
  const goalTarget = Number(distractionGoalMinutes) || 45;
  const goalPercent = Math.min(100, Math.round((todayDistractionMin / goalTarget) * 100));
  const isOverGoal = todayDistractionMin > goalTarget;

  // 2. 7-Day Trend data preparation
  const last7DaysData = useMemo(() => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const dateObj = new Date(Date.now() - 86400000 * i);
      const dateKey = dateObj.toISOString().split('T')[0];
      const dayLabel = i === 0 ? 'Today' : dayNames[dateObj.getDay()];

      const dayDists = (distractions || []).filter(d => {
        const dKey = d.loggedAt ? new Date(d.loggedAt).toISOString().split('T')[0] : '';
        return dKey === dateKey;
      });
      const distMin = dayDists.reduce((acc, d) => acc + (Number(d.durationMinutes) || 0), 0);

      const dayFocs = (focusSessions || []).filter(s => {
        const sKey = s.completedAt ? new Date(s.completedAt).toISOString().split('T')[0] : '';
        return sKey === dateKey;
      });
      const focMin = dayFocs.reduce((acc, s) => acc + (Number(s.actualDurationMinutes) || 0), 0);

      days.push({
        dateKey,
        label: dayLabel,
        distractionMin: distMin,
        focusMin: focMin,
        totalMin: distMin + focMin
      });
    }
    return days;
  }, [distractions, focusSessions]);

  const total7DayActivityMin = last7DaysData.reduce((acc, d) => acc + d.totalMin, 0);
  const maxDailyMin = Math.max(60, ...last7DaysData.map(d => Math.max(d.distractionMin, d.focusMin)));

  // 3. Category Breakdown (All Time / Filtered)
  const categoryStats = useMemo(() => {
    const totalDistMinAll = (distractions || []).reduce((acc, d) => acc + (Number(d.durationMinutes) || 0), 0) || 1;
    return DISTRACTION_CATEGORIES.map(cat => {
      const matching = (distractions || []).filter(d => d.category === cat.label || d.category === cat.id);
      const minutes = matching.reduce((acc, d) => acc + (Number(d.durationMinutes) || 0), 0);
      const count = matching.length;
      const percent = totalDistMinAll > 0 && minutes > 0 ? Math.round((minutes / totalDistMinAll) * 100) : 0;
      return {
        ...cat,
        minutes,
        count,
        percent
      };
    }).sort((a, b) => b.minutes - a.minutes);
  }, [distractions]);

  // 4. Filtered History Log
  const filteredHistory = useMemo(() => {
    let list = [...(distractions || [])];

    if (filterPeriod === 'today') {
      list = list.filter(d => {
        const dDate = d.loggedAt ? new Date(d.loggedAt).toISOString().split('T')[0] : todayStr;
        return dDate === todayStr;
      });
    } else if (filterPeriod === 'week') {
      const oneWeekAgo = Date.now() - 86400000 * 7;
      list = list.filter(d => {
        const dTime = d.loggedAt ? new Date(d.loggedAt).getTime() : Date.now();
        return dTime >= oneWeekAgo;
      });
    }

    if (filterCategory !== 'all') {
      list = list.filter(d => d.category === filterCategory);
    }

    return list.sort((a, b) => {
      const tA = a.loggedAt ? new Date(a.loggedAt).getTime() : 0;
      const tB = b.loggedAt ? new Date(b.loggedAt).getTime() : 0;
      return tB - tA;
    });
  }, [distractions, filterPeriod, filterCategory, todayStr]);

  const handleSaveGoal = () => {
    onUpdateGoal(tempGoal);
    setIsEditingGoal(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold self-start"
        >
          <i data-lucide="arrow-left" className="w-4 h-4"></i>
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddDistraction}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 shadow-sm transition-all flex items-center gap-1.5"
          >
            <i data-lucide="plus-circle" className="w-4 h-4 text-rose-500"></i>
            <span>+ Log Distraction</span>
          </button>

          <button
            onClick={() => onStartFocusSession({ taskName: 'Deep Focus Study Block', durationMin: 25 })}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <i data-lucide="play" className="w-3.5 h-3.5 fill-current"></i>
            <span>Start Focus Timer</span>
          </button>
        </div>
      </div>

      {/* Main Title & Well-Being Subtitle */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎯</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Distraction & Focus Radar</h1>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Monitor interruption patterns, study balance, and cognitive recovery to protect deep focus without burnout.
        </p>
      </div>

      {/* 4 Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="metric-card">
          <span className="text-slate-500 text-[11px] font-semibold uppercase">Distraction Today</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-black ${isOverGoal ? 'text-amber-600' : 'text-slate-900'}`}>
              {todayDistractionMin}
            </span>
            <span className="text-xs font-semibold text-slate-500">min</span>
          </div>
          <span className={`text-[10px] font-bold ${isOverGoal ? 'text-amber-600' : 'text-emerald-600'}`}>
            {isOverGoal ? `+${todayDistractionMin - goalTarget}m above target` : `${Math.max(0, goalTarget - todayDistractionMin)}m buffer left`}
          </span>
        </div>

        <div className="metric-card">
          <span className="text-slate-500 text-[11px] font-semibold uppercase">Interruptions</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-indigo-600">{todayDistractionCount}</span>
            <span className="text-xs font-semibold text-slate-500">times</span>
          </div>
          <span className="text-[10px] text-slate-400">{todayDistractionCount > 0 ? 'Logged today' : 'No interruptions today'}</span>
        </div>

        <div className="metric-card">
          <span className="text-slate-500 text-[11px] font-semibold uppercase">Top Distraction</span>
          <div className="flex items-center gap-1.5 mt-1 truncate">
            <span className="text-lg">{topCatObj?.icon || '📌'}</span>
            <span className="text-sm font-bold text-slate-900 truncate">{todayDistractionCount > 0 ? topTodayCategory : '--'}</span>
          </div>
          <span className="text-[10px] text-slate-400">{todayDistractionCount > 0 ? `${topTodayCategoryMin} min today` : 'No distractions logged'}</span>
        </div>

        <div className="metric-card">
          <span className="text-slate-500 text-[11px] font-semibold uppercase">Avg Interruption</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-teal-700">{avgDuration > 0 ? avgDuration : '--'}</span>
            <span className="text-xs font-semibold text-slate-500">{avgDuration > 0 ? 'min / pause' : ''}</span>
          </div>
          <span className="text-[10px] text-slate-400">{avgDuration > 0 ? 'Recovery duration' : 'No data yet'}</span>
        </div>
      </div>

      {/* Focus vs Distraction Balance & Daily Target Setting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Balance Card */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="scale" className="w-4 h-4 text-indigo-600"></i>
              <span>Focus Time vs. Distraction Time</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">Today</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${totalActivityMin > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                Focus: {todayFocusMin}m ({focusPercent}%)
              </span>
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${totalActivityMin > 0 ? 'bg-rose-400' : 'bg-slate-300'}`}></span>
                Distraction: {todayDistractionMin}m ({distractionPercent}%)
              </span>
            </div>

            {totalActivityMin > 0 ? (
              <div className="h-3 w-full rounded-full bg-rose-100 overflow-hidden flex shadow-inner">
                <div
                  className="h-full bg-emerald-500 transition-all duration-700 rounded-l-full"
                  style={{ width: `${focusPercent}%` }}
                ></div>
                <div
                  className="h-full bg-rose-400 transition-all duration-700"
                  style={{ width: `${distractionPercent}%` }}
                ></div>
              </div>
            ) : (
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                <div className="h-full w-0 bg-slate-200"></div>
              </div>
            )}

            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              {totalActivityMin === 0
                ? "No focus or distraction activity logged today. Start a focus session or log an interruption to see your balance."
                : focusPercent >= 70
                ? "🌟 Excellent cognitive ratio! You are maintaining strong, continuous study flow."
                : "💡 Take small 2-minute mindful breathing resets before tasks to keep your focus ratio high."}
            </p>
          </div>
        </div>

        {/* Daily Distraction Target / Goal Card */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="target" className="w-4 h-4 text-indigo-600"></i>
              <span>Daily Distraction Cap & Target</span>
            </h3>

            <button
              onClick={() => setIsEditingGoal(!isEditingGoal)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {isEditingGoal ? 'Cancel' : 'Edit Target'}
            </button>
          </div>

          {isEditingGoal ? (
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(parseInt(e.target.value) || 15)}
                  className="w-20 px-3 py-1.5 rounded-xl border border-indigo-300 text-slate-900 font-bold text-center text-xs"
                />
                <span className="text-xs text-slate-600 font-medium">minutes per day</span>
                <button
                  onClick={handleSaveGoal}
                  className="ml-auto px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                >
                  Save Target
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex gap-1.5 flex-wrap">
                {[20, 30, 45, 60, 90].map(val => (
                  <button
                    key={val}
                    onClick={() => setTempGoal(val)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                      tempGoal === val ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {val}m
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Logged: <span className="text-indigo-600 font-extrabold">{todayDistractionMin}m</span> / {goalTarget}m Target
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isOverGoal ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {isOverGoal ? 'Over Target' : 'Within Target ✓'}
                </span>
              </div>

              <div className="distraction-goal-bar">
                <div
                  className={`distraction-goal-fill ${isOverGoal ? 'over-goal' : ''}`}
                  style={{ width: `${goalPercent}%` }}
                ></div>
              </div>

              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {isOverGoal
                  ? "Gentle reminder: You've exceeded your daily target today. Take a quick 60s breathing reset."
                  : `You have ${Math.max(0, goalTarget - todayDistractionMin)} minutes of distraction buffer remaining today.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 7-Day Distraction & Focus Trend Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="bar-chart-3" className="w-5 h-5 text-indigo-600"></i>
              <span>7-Day Attention & Study Trends</span>
            </h3>
            <p className="text-xs text-slate-500">Compare daily uninterrupted focus blocks against logged distraction time</p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-indigo-500"></span>
              Focus Time
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-400"></span>
              Distraction
            </span>
          </div>
        </div>

        {/* Visual Chart Columns */}
        <div className="distraction-trend-chart pt-4 pb-2">
          {last7DaysData.map((d, idx) => {
            const focHeight = d.focusMin > 0 ? Math.min(100, Math.round((d.focusMin / maxDailyMin) * 100)) : 0;
            const distHeight = d.distractionMin > 0 ? Math.min(100, Math.round((d.distractionMin / maxDailyMin) * 100)) : 0;

            return (
              <div key={idx} className="distraction-trend-col group">
                <div className="distraction-trend-bars-group">
                  {/* Focus Bar */}
                  <div
                    className="distraction-bar-focus"
                    style={{ height: `${focHeight > 0 ? Math.max(6, focHeight) : 2}%`, opacity: focHeight > 0 ? 1 : 0.3 }}
                    title={`Focus: ${d.focusMin} min on ${d.label}`}
                  ></div>
                  {/* Distraction Bar */}
                  <div
                    className="distraction-bar-distraction"
                    style={{ height: `${distHeight > 0 ? Math.max(6, distHeight) : 2}%`, opacity: distHeight > 0 ? 1 : 0.3 }}
                    title={`Distraction: ${d.distractionMin} min on ${d.label}`}
                  ></div>
                </div>
                <span className="distraction-trend-day-label">{d.label}</span>
                <span className="text-[9px] text-slate-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.distractionMin}m / {d.focusMin}m
                </span>
              </div>
            );
          })}
        </div>

        {total7DayActivityMin === 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
            No focus or distraction activity recorded in the past 7 days. Start your first focus session to build your trends.
          </div>
        )}
      </div>

      {/* Category Breakdown & Progress Bars */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="pie-chart" className="w-5 h-5 text-indigo-600"></i>
              <span>Distraction Categories Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500">See which triggers occupy the most cognitive bandwidth</p>
          </div>
          <span className="text-xs font-bold text-slate-400">{distractions.length} Total Events</span>
        </div>

        {distractions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {categoryStats.map(cat => (
              <div key={cat.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <span className="font-bold text-slate-900">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-800">{cat.minutes}m</span>
                    <span className="text-[10px] text-slate-400">({cat.count}x • {cat.percent}%)</span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(cat.minutes > 0 ? 5 : 0, cat.percent)}%`,
                      backgroundColor: cat.color || '#64748b'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
            <p className="text-xs font-semibold text-slate-600">No distraction events logged yet</p>
            <p className="text-[11px] text-slate-400">Once you record interruptions, category distributions will appear here.</p>
          </div>
        )}
      </div>

      {/* Stress & Multi-Signal Behavioral Correlation Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <i data-lucide="sparkles" className="w-5 h-5 text-indigo-600"></i>
            <span>Cognitive Correlation & Well-Being Intelligence</span>
          </h3>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Behavioral Insight
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-slate-700 space-y-1.5">
            <div className="font-bold text-indigo-950 flex items-center gap-1.5">
              <i data-lucide="shield-check" className="w-4 h-4 text-indigo-600"></i>
              <span>Distraction & Stress Synergy</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              {earlySignals.distractionStressCorrelation ||
                "Tracking shows that taking intentional micro-breaks instead of involuntary multi-tasking prevents cognitive fatigue and elevates daily consistency."}
            </p>
          </div>

          {/* Smart Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>📱</span>
                <span>Notification Hygiene</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-snug">
                Put your phone on 'Do Not Disturb' or place it in another room during the first 25 minutes of your study session.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>🫁</span>
                <span>Pre-Study Reset</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-snug">
                A 60-second Coherent (5-5) breathing reset calms autonomic arousal and increases sustained attention before high-focus tasks.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onQuickReset(ACTIVITIES['breathing-box'])}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
            >
              <i data-lucide="wind" className="w-3.5 h-3.5"></i>
              <span>Start 60s Focus Reset</span>
            </button>
            <button
              onClick={() => onStartFocusSession({ taskName: '25m Pomodoro Sprint', durationMin: 25 })}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-all flex items-center gap-1.5"
            >
              <i data-lucide="play" className="w-3.5 h-3.5"></i>
              <span>Start 25m Focus Block</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filterable Distraction History Log */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="clock" className="w-5 h-5 text-indigo-600"></i>
              <span>Distraction History Log</span>
            </h3>
            <p className="text-xs text-slate-500">Chronological record of interruptions with context notes</p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Period Pills */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs">
              {['all', 'today', 'week'].map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPeriod(p)}
                  className={`px-3 py-1 rounded-lg capitalize font-bold text-[11px] transition-all ${
                    filterPeriod === p ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Category Filter Dropdown */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {DISTRACTION_CATEGORIES.map(c => (
                <option key={c.id} value={c.label}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List of items */}
        <div className="space-y-2.5 pt-2">
          {filteredHistory.map(d => {
            const catMeta = DISTRACTION_CATEGORIES.find(c => c.label === d.category || c.id === d.category);
            const timeAgoStr = d.loggedAt ? new Date(d.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today';
            const dateStr = d.loggedAt ? new Date(d.loggedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';

            return (
              <div
                key={d.id}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg flex-shrink-0 shadow-2xs">
                    {catMeta?.icon || '📌'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{d.category}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                        {d.durationMinutes} min
                      </span>
                    </div>

                    {d.note && (
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">"{d.note}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {dateStr} {timeAgoStr}
                  </span>

                  <button
                    onClick={() => onDeleteDistraction(d.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete log"
                  >
                    <i data-lucide="trash-2" className="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredHistory.length === 0 && (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <div className="text-3xl">🍃</div>
              <h4 className="font-bold text-sm text-slate-700">
                {distractions.length === 0 ? 'No distractions logged yet' : 'No distractions found for this filter'}
              </h4>
              <p className="text-xs text-slate-500">
                {distractions.length === 0
                  ? 'Start a focus sprint or log an interruption to begin tracking.'
                  : 'Your attention is clear and focused. Keep it up!'}
              </p>
              <button
                onClick={onAddDistraction}
                className="mt-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                + Log Interruption
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 6. AI COACH VIEW ("MY COACH")
// ==========================================================================

function CoachView({
  user,
  appState,
  wellbeing,
  earlySignals,
  distractions = [],
  focusSessions = [],
  onToggleHabit,
  onQuickReset,
  onBack,
  onOpenDistractions,
  onStartFocusSession,
  onActivateMinModeAll
}) {
  const [messages, setMessages] = useState(() => [
    {
      sender: 'ai',
      text: `Hello ${user ? user.name?.split(' ')[0] : 'there'}! I'm your Digital Well-Being & Habit Coach. I continuously analyze your 7 lifestyle baselines, distraction patterns, daily workload, sleep quality, and upcoming milestones so you stay consistent without burnout. How are you feeling right now?`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    { label: "📱 Reduce phone & app distractions", prompt: "How can I reduce phone, social media, and notification distractions while studying?" },
    { label: "🎯 Plan a 25m Pomodoro focus sprint", prompt: "Help me structure a focused 25-minute study sprint with zero distractions." },
    { label: "😴 Exhausted & low energy today", prompt: "I feel completely exhausted and have no energy today." },
    { label: "📚 Overwhelmed with exams & deadlines", prompt: "I feel overwhelmed with upcoming exams and deadlines." },
    { label: "🔍 Analyze my focus vs distraction trends", prompt: "Analyze my recent study focus blocks and distraction patterns." }
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
      if (lower.includes('distract') || lower.includes('phone') || lower.includes('social') || lower.includes('notification')) {
        const topDists = appState.distractions || [];
        const topCat = topDists.length > 0 ? topDists[0].category : 'Social Media';
        aiReply = `Distractions like "${topCat}" typically peak during cognitive friction or energy dips. I recommend putting your phone in another room and starting a 25-minute dedicated Focus Sprint. If you feel tired, take a 60-second breathing reset first.`;
        actionType = 'start-focus-sprint';
      } else if (lower.includes('pomodoro') || lower.includes('focus') || lower.includes('study block') || lower.includes('sprint')) {
        aiReply = `Let's launch a 25-minute Pomodoro focus block right now! During the session, you can log any interruptions with 1 click without losing your timer rhythm. Ready?`;
        actionType = 'start-focus-sprint';
      } else if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('fatigue')) {
        aiReply = `I hear you. When energy is depleted, forcing a full 30-minute task creates friction and burnout. Let's switch today's remaining habits to Minimum Mode (2-minute micro-doses) and schedule a 4-7-8 relaxing breath.`;
        actionType = 'min-mode-all';
      } else if (lower.includes('overwhelm') || lower.includes('deadline') || lower.includes('exam')) {
        aiReply = `During heavy exam or deliverable crunch, cognitive bandwidth is precious. Protect your sleep boundary first. I suggest using Box Breathing (4-4-4-4) for laser focus and scaling down non-essential habits.`;
        actionType = 'quick-reset';
      } else if (lower.includes('pattern') || lower.includes('trend') || lower.includes('analyze') || lower.includes('friction')) {
        const failureCount = (appState.failureLogs || []).length;
        const distCount = (appState.distractions || []).length;
        aiReply = `Based on your profile and recent logs (${distCount} distractions, ${failureCount} habit friction logs), your primary distraction occurs in the evening. Structuring deep work earlier and using Minimum Mode on low-sleep days will protect your momentum.`;
        actionType = 'open-radar';
      } else {
        aiReply = `You are currently in a ${earlySignals.statusTitle} phase. ${earlySignals.gentleNudge}`;
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
      <div className="glass-panel rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-lg flex flex-col h-[540px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={m.sender === 'user' ? 'coach-bubble-user max-w-md' : 'coach-bubble-ai max-w-lg'}>
                <p className="text-sm leading-relaxed">{m.text}</p>

                {m.actionType === 'start-focus-sprint' && (
                  <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                    <button
                      onClick={() => onStartFocusSession({ taskName: '25m Pomodoro Study Sprint', durationMin: 25 })}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <i data-lucide="play" className="w-3.5 h-3.5"></i>
                      <span>🎯 Start 25m Focus Block</span>
                    </button>
                    <button
                      onClick={onOpenDistractions}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all"
                    >
                      <span>View Distractions Radar</span>
                    </button>
                  </div>
                )}

                {m.actionType === 'open-radar' && (
                  <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                    <button
                      onClick={onOpenDistractions}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <i data-lucide="target" className="w-3.5 h-3.5"></i>
                      <span>Open Distraction Radar</span>
                    </button>
                  </div>
                )}

                {m.actionType === 'min-mode-all' && (
                  <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                    <button
                      onClick={onActivateMinModeAll}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>⚡ Switch All to Minimum Mode</span>
                    </button>
                    <button
                      onClick={() => onQuickReset(ACTIVITIES['breathing-478'])}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 flex items-center gap-1.5 transition-all"
                    >
                      <i data-lucide="wind" className="w-3.5 h-3.5 text-teal-600"></i>
                      <span>4-7-8 Sleep Reset</span>
                    </button>
                  </div>
                )}

                {m.actionType === 'quick-reset' && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => onQuickReset(ACTIVITIES['breathing-box'])}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <i data-lucide="wind" className="w-3.5 h-3.5"></i>
                      <span>Start Box Breathing for Focus</span>
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
            placeholder="Ask your coach anything about focus, distractions, habits, or fatigue..."
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
// 7. GOALS & PROGRESS HIERARCHY VIEW
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
// 8. WEEKLY INTELLIGENCE REPORT VIEW
// ==========================================================================

function WeeklyReportView({
  appState,
  wellbeing,
  earlySignals,
  distractions = [],
  focusSessions = [],
  distractionGoalMinutes = 45,
  onBack,
  onQuickReset,
  onOpenDistractions
}) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);

  const habits = appState.habits || [];
  const totalHabits = habits.length;
  const avgStreak = totalHabits ? Math.round(habits.reduce((acc, h) => acc + (h.currentStreak || 0), 0) / totalHabits) : 0;
  const bestHabit = habits.length ? habits.reduce((prev, curr) => ((prev.currentStreak || 0) > (curr.currentStreak || 0) ? prev : curr), habits[0]) : null;

  const consistencyPercent = habits.length > 0 && habits.some(h => (h.currentStreak || 0) > 0)
    ? Math.min(100, Math.round((habits.reduce((acc, h) => acc + Math.min(7, (h.currentStreak || 0)), 0) / (habits.length * 7)) * 100))
    : 0;

  // 7-day totals for distractions and focus
  const oneWeekAgo = Date.now() - 86400000 * 7;
  const weekDistractions = (distractions || []).filter(d => {
    const t = d.loggedAt ? new Date(d.loggedAt).getTime() : Date.now();
    return t >= oneWeekAgo;
  });
  const totalWeeklyDistractionMin = weekDistractions.reduce((acc, d) => acc + (Number(d.durationMinutes) || 0), 0);

  const weekFocusSessions = (focusSessions || []).filter(s => {
    const t = s.completedAt ? new Date(s.completedAt).getTime() : Date.now();
    return t >= oneWeekAgo;
  });
  const totalWeeklyFocusMin = weekFocusSessions.reduce((acc, s) => acc + (Number(s.actualDurationMinutes) || 0), 0);
  const totalWeeklyTime = totalWeeklyFocusMin + totalWeeklyDistractionMin;

  // Top distraction category of the week
  const weekCatCounts = {};
  weekDistractions.forEach(d => {
    const cat = d.category || 'Other';
    weekCatCounts[cat] = (weekCatCounts[cat] || 0) + (Number(d.durationMinutes) || 0);
  });
  let topWeekCategory = 'None yet';
  let topWeekCatMin = 0;
  Object.keys(weekCatCounts).forEach(c => {
    if (weekCatCounts[c] > topWeekCatMin) {
      topWeekCatMin = weekCatCounts[c];
      topWeekCategory = c;
    }
  });

  const avgDailyDistraction = Math.round(totalWeeklyDistractionMin / 7);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold">
          <i data-lucide="arrow-left" className="w-4 h-4"></i>
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDistractions}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold border border-indigo-200 flex items-center gap-1.5 transition-all"
          >
            <span>🎯 Focus Radar</span>
          </button>
          <button
            onClick={() => onQuickReset(earlySignals.recommendedActivity)}
            className="px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold border border-teal-200 flex items-center gap-1.5"
          >
            <i data-lucide="wind" className="w-3.5 h-3.5 text-teal-600"></i>
            <span>Take Well-Being Reset</span>
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Your Digital Well-Being Intelligence Report</h1>
        <p className="text-sm text-slate-600 mt-1">
          Behavioral completion trends, focus vs. distraction balance, and multi-signal pressure detection.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="metric-card">
          <span className="text-slate-500 text-[11px] font-semibold uppercase">Habit Consistency</span>
          <span className="text-2xl font-black text-emerald-600">{consistencyPercent > 0 ? `${consistencyPercent}%` : '0%'}</span>
          <span className="text-[10px] text-slate-400">{consistencyPercent > 0 ? `${consistencyPercent}% 7-day adherence` : 'Start habits to build consistency'}</span>
        </div>

        <div className="metric-card">
          <span className="text-slate-500 text-[11px] font-semibold uppercase">Average Streak</span>
          <span className="text-2xl font-black text-indigo-600">{avgStreak} Days</span>
          <span className="text-[10px] text-slate-400">{avgStreak > 0 ? 'Active momentum' : 'No active streak'}</span>
        </div>

        <div className="metric-card">
          <span className="text-slate-500 text-[11px] font-semibold uppercase">Weekly Focus Time</span>
          <span className="text-2xl font-black text-indigo-700">{totalWeeklyFocusMin}m</span>
          <span className="text-[10px] text-slate-400">{weekFocusSessions.length} sessions logged</span>
        </div>

        <div className="metric-card">
          <span className="text-slate-500 text-[11px] font-semibold uppercase">Weekly Distractions</span>
          <span className="text-2xl font-black text-amber-700">{totalWeeklyDistractionMin}m</span>
          <span className="text-[10px] text-slate-400">Avg {avgDailyDistraction}m / day</span>
        </div>
      </div>

      {/* Section 6: Weekly Habit vs. Distraction Balance Comparison */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="scale" className="w-5 h-5 text-indigo-600"></i>
              <span>Weekly Habit vs. Distraction Balance</span>
            </h3>
            <p className="text-xs text-slate-500">Compare time invested in key habits against distraction volume</p>
          </div>
          <span className="text-xs font-bold text-slate-500">Past 7 Days</span>
        </div>

        <div className="space-y-3 pt-2">
          {habits.map((habit) => {
            const habitTargetWeeklyMin = (habit.targetVal || 20) * 7;
            const habitFocusRatio = Math.min(100, Math.round((((habit.currentStreak || 0) * (habit.targetVal || 20)) / Math.max(1, habitTargetWeeklyMin)) * 100));

            return (
              <div key={habit.id} className="habit-balance-row">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{habit.icon}</span>
                    <span className="font-bold text-slate-900">{habit.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-700 font-bold">🔥 {habit.currentStreak || 0}d streak</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">Target: {habit.targetVal} {habit.targetUnit}</span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max((habit.currentStreak || 0) > 0 ? 10 : 0, habitFocusRatio)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 8: Weekly Distraction & Attention Intelligence Breakdown */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="target" className="w-5 h-5 text-indigo-600"></i>
              <span>Section 8: Weekly Distraction & Focus Intelligence</span>
            </h3>
            <p className="text-xs text-slate-500">Detailed behavioral breakdown of study interruptions and recovery</p>
          </div>

          <button
            onClick={onOpenDistractions}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 self-start sm:self-center"
          >
            <span>Open Distraction Radar</span>
            <i data-lucide="arrow-right" className="w-3.5 h-3.5"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Top Distraction Category</span>
            <div className="text-base font-black text-slate-900">{weekDistractions.length > 0 ? topWeekCategory : '--'}</div>
            <p className="text-[11px] text-slate-500">{weekDistractions.length > 0 ? `${topWeekCatMin}m total across 7 days` : 'No distractions logged'}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Daily Distraction Average</span>
            <div className="text-base font-black text-slate-900">{avgDailyDistraction} min / day</div>
            <p className="text-[11px] text-slate-500">
              {totalWeeklyDistractionMin > 0
                ? (avgDailyDistraction <= (distractionGoalMinutes || 45) ? "Within healthy daily target ✓" : "Slightly above target")
                : "No distractions this week"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Focus Efficiency</span>
            <div className="text-base font-black text-emerald-600">
              {totalWeeklyTime > 0
                ? `${Math.round((totalWeeklyFocusMin / totalWeeklyTime) * 100)}%`
                : '--'}
            </div>
            <p className="text-[11px] text-slate-500">Uninterrupted study share</p>
          </div>
        </div>
      </div>

      {/* Baseline vs Real-Time Pattern Synthesis */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <i data-lucide="bot" className="w-5 h-5 text-indigo-600"></i>
          <span>Multi-Signal Pattern Analysis & Guidance</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="font-bold text-slate-900 mb-1">1. Lifestyle Baseline Alignment</div>
            <p className="text-slate-600 leading-relaxed">
              Your normal baseline is {earlySignals.baseline.hours} daily workload and {earlySignals.baseline.sleep} sleep. {earlySignals.gentleNudge}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="font-bold text-slate-900 mb-1">2. Minimum Mode Utilization</div>
            <p className="text-slate-600 leading-relaxed">
              When pressure or fatigue rises, executing the 2-minute Minimum Mode keeps your identity streak alive without taxing cognitive energy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 8B. FOCUS SESSION LIVE TIMER & IN-SESSION DISTRACTION MODAL
// ==========================================================================

function FocusSessionModal({
  activeFocusSession,
  habits = [],
  theme,
  onSaveDistraction,
  onComplete,
  onCancel,
  soundEnabled,
  ambientSound,
  setAmbientSound
}) {
  const initialDurationMin = Number(activeFocusSession?.durationMin) || Number(activeFocusSession?.plannedDurationMinutes) || 25;
  const initialDurationSec = initialDurationMin * 60;

  const [taskName, setTaskName] = useState(activeFocusSession?.taskName || 'Deep Focus Study Block');
  const [selectedHabitId, setSelectedHabitId] = useState(activeFocusSession?.habitId || '');
  const [totalSeconds, setTotalSeconds] = useState(initialDurationSec);
  const [timeLeft, setTimeLeft] = useState(initialDurationSec);
  const [isRunning, setIsRunning] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  // In-session interruption tracking
  const [sessionDistractions, setSessionDistractions] = useState([]);
  const [showInterruptionDialog, setShowInterruptionDialog] = useState(false);
  const [interruptionCategory, setInterruptionCategory] = useState('Social Media');
  const [interruptionDuration, setInterruptionDuration] = useState(3);
  const [interruptionNote, setInterruptionNote] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');

  const activeModeConfig = THEME_WORK_MODES[theme] || THEME_WORK_MODES.porcelain;

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [isRunning, hasCompleted, showInterruptionDialog, sessionDistractions, ambientSound]);

  // Main countdown interval
  useEffect(() => {
    if (!isRunning || hasCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setHasCompleted(true);
          if (soundEnabled) audioService.playChime('exhale');
          if (window.confetti) window.confetti({ particleCount: 75, spread: 80, origin: { y: 0.5 } });
          return 0;
        }

        // Halfway motivational cue
        if (prev === Math.floor(totalSeconds / 2) && soundEnabled) {
          audioService.playChime('hold');
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, hasCompleted, totalSeconds, soundEnabled]);

  const handleLogInterruption = (e) => {
    e.preventDefault();
    const newInt = {
      id: 'int-' + Date.now(),
      category: interruptionCategory,
      durationMinutes: Number(interruptionDuration) || 3,
      note: interruptionNote || 'In-session interruption',
      loggedAt: new Date().toISOString()
    };

    setSessionDistractions(prev => [...prev, newInt]);
    onSaveDistraction(newInt);
    setShowInterruptionDialog(false);
    setInterruptionNote('');
  };

  const handleFinishSession = () => {
    const elapsedSeconds = totalSeconds - timeLeft;
    const actualMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const plannedMinutes = Math.round(totalSeconds / 60);
    const totalDistractionMin = sessionDistractions.reduce((acc, d) => acc + d.durationMinutes, 0);
    const focusRate = Math.max(0, Math.min(100, Math.round(((actualMinutes - totalDistractionMin) / actualMinutes) * 100)));

    onComplete({
      taskName,
      habitId: selectedHabitId || null,
      plannedDurationMinutes: plannedMinutes,
      actualDurationMinutes: actualMinutes,
      distractionsCount: sessionDistractions.length,
      totalDistractionMinutes: totalDistractionMin,
      focusRate,
      notes: sessionNotes || ''
    });
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) : 0;
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent * circumference);

  const totalInterruptionMinutes = sessionDistractions.reduce((acc, d) => acc + d.durationMinutes, 0);

  return (
    <div className="routine-timer-overlay animate-fade-in">
      <div className="routine-timer-card max-w-lg">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-left">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">{taskName}</h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-200">
                  Focus Sprint
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {activeModeConfig.badge}
                </span>
                {sessionDistractions.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    ⚡ {sessionDistractions.length} interruptions ({totalInterruptionMinutes}m)
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Exit Session"
          >
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        {/* Circular Countdown Ring */}
        <div className="timer-circle-container">
          <div className="timer-pulse-glow mode-full"></div>
          <svg className="timer-progress-ring" width="230" height="230">
            <circle
              className="timer-progress-circle-bg"
              strokeWidth="10"
              r={radius}
              cx="115"
              cy="115"
            />
            <circle
              className="timer-progress-circle-bar mode-full"
              strokeWidth="10"
              r={radius}
              cx="115"
              cy="115"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {hasCompleted ? (
              <div className="space-y-1 animate-fade-in">
                <div className="text-4xl">🏆</div>
                <div className="text-xs font-black uppercase tracking-wider text-emerald-600">Sprint Complete!</div>
              </div>
            ) : (
              <>
                <div className="timer-digits">{formatTime(timeLeft)}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {isRunning ? 'Deep Focus Flow' : 'Paused'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* In-Session Interruption Trigger Button */}
        {!hasCompleted && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              onClick={() => setShowInterruptionDialog(true)}
              className="in-session-distraction-btn"
              title="Log a quick interruption without losing your timer"
            >
              <i data-lucide="zap" className="w-4 h-4 text-amber-500"></i>
              <span>⚡ Log Quick Interruption ({sessionDistractions.length})</span>
            </button>
          </div>
        )}

        {/* Ambient Sound Bar */}
        <div className="flex items-center justify-between pb-3 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="font-semibold flex items-center gap-1">
            <i data-lucide="volume-2" className="w-3.5 h-3.5"></i>
            Ambient Soundscape:
          </span>
          <div className="flex gap-1.5">
            {['none', 'rain', 'waves'].map(s => (
              <button
                key={s}
                onClick={() => setAmbientSound(s)}
                className={`px-2 py-0.5 rounded-lg border font-semibold text-[10px] capitalize transition-all ${
                  ambientSound === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s === 'none' ? 'Mute' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Post-Session Summary or Action Row */}
        {hasCompleted ? (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-left space-y-1">
              <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                <span>🌟 Focus Sprint Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                <div>Duration: <span className="font-bold">{Math.round(totalSeconds / 60)} min</span></div>
                <div>Focus Rate: <span className="font-bold text-emerald-700">
                  {Math.max(0, Math.min(100, Math.round(((Math.round(totalSeconds/60) - totalInterruptionMinutes) / Math.round(totalSeconds/60)) * 100)))}%
                </span></div>
                <div>Interruptions: <span className="font-bold">{sessionDistractions.length}</span></div>
                <div>Distraction Time: <span className="font-bold">{totalInterruptionMinutes}m</span></div>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Optional reflection note (e.g., Reviewed chapter 3)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none"
              />
            </div>

            <button
              onClick={handleFinishSession}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <i data-lucide="check-circle-2" className="w-5 h-5"></i>
              <span>Save Focus Session & Record Progress</span>
            </button>
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <i data-lucide={isRunning ? 'pause' : 'play'} className="w-4 h-4"></i>
              <span>{isRunning ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              onClick={handleFinishSession}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <i data-lucide="check" className="w-4 h-4"></i>
              <span>Finish & Save Sprint</span>
            </button>
          </div>
        )}

        {/* Modal Interruption Logger Dialog */}
        {showInterruptionDialog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
            <div className="glass-panel max-w-sm w-full rounded-3xl p-5 border border-slate-200 bg-white shadow-2xl space-y-3.5 text-left">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="text-base">⚡</span>
                  <span>Log Interruption</span>
                </h4>
                <button
                  onClick={() => setShowInterruptionDialog(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <i data-lucide="x" className="w-4 h-4"></i>
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                Timer remains active! Record what happened so you can review attention leaks later.
              </p>

              <form onSubmit={handleLogInterruption} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {DISTRACTION_CATEGORIES.map(c => (
                      <div
                        key={c.id}
                        onClick={() => setInterruptionCategory(c.label)}
                        className={`p-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                          interruptionCategory === c.label ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{c.icon}</span>
                        <span className="truncate">{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duration: {interruptionDuration} min</label>
                  <div className="flex gap-1.5">
                    {[1, 3, 5, 10, 15].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setInterruptionDuration(m)}
                        className={`flex-1 py-1 rounded-lg border font-bold text-[11px] transition-all ${
                          interruptionDuration === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={interruptionNote}
                    onChange={(e) => setInterruptionNote(e.target.value)}
                    placeholder="Quick note (e.g. checked phone message)"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowInterruptionDialog(false)}
                    className="px-3 py-1.5 rounded-xl text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm"
                  >
                    Log & Resume Focus
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================================
// 8C. QUICK ADD DISTRACTION MODAL
// ==========================================================================

function AddDistractionModal({ onSave, onClose }) {
  const [category, setCategory] = useState('Social Media');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      category,
      durationMinutes: Number(durationMinutes) || 5,
      note,
      loggedAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-slate-200 bg-white shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📱</span>
            <h3 className="text-base font-bold text-slate-900">Log Distraction Interruption</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Tracking interruptions helps your coach identify focus friction and protect your cognitive energy.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Category Chips Grid */}
          <div>
            <label className="block text-slate-700 font-semibold mb-2">Select Category</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {DISTRACTION_CATEGORIES.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.label)}
                  className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                    category === cat.label
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-700 font-semibold">Duration: {durationMinutes} Minutes</label>
              <span className="text-[11px] text-slate-400 font-semibold">Estimate duration</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {[5, 10, 15, 30, 45].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMinutes(m)}
                  className={`py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    durationMinutes === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>

            <input
              type="range"
              min="1"
              max="120"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 1)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Optional Context Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Scrolled Instagram reels during study sprint"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
              Save Distraction Log ✓
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// 9. HABIT CREATION & EDIT MODAL
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
              placeholder="e.g. Deep Study, Workout, Reading"
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
// 10. HABIT FAILURE REASON MODAL ("What got in the way?")
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
// 10B. ROUTINE COUNTDOWN TIMER & ENCOURAGEMENT MODAL
// ==========================================================================

function RoutineCountdownModal({
  activeTimingHabit,
  theme,
  onComplete,
  onCancel,
  soundEnabled,
  ambientSound,
  setAmbientSound
}) {
  const { habit, mode } = activeTimingHabit;
  const isMin = mode === 'min';
  const activeModeConfig = THEME_WORK_MODES[theme] || THEME_WORK_MODES.porcelain;

  // Compute duration in seconds based on habit targets
  const rawTargetVal = isMin ? (habit.minModeVal || 2) : (habit.targetVal || 15);
  const rawUnit = (isMin ? habit.minModeUnit : habit.targetUnit) || 'min';
  const initialDuration = rawUnit === 'min' ? rawTargetVal * 60 : (rawTargetVal <= 10 ? rawTargetVal * 60 : rawTargetVal);

  const [totalSeconds, setTotalSeconds] = useState(initialDuration);
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Motivational & encouraging quotes tailored for active work mode and habit progress
  const motivationalQuotes = useMemo(() => [
    activeModeConfig.encouragementFlavor || "You've got this! Building unbreakable momentum one second at a time.",
    "Stay locked in — every moment of consistency shapes your identity!",
    "Great work keeping the flow. Feel the calm focus taking over.",
    "Small daily micro-wins create massive lifelong transformations.",
    "Consistency isn't about perfection — it's showing up today. You're doing it!",
    "Halfway or beyond! Notice how steady and natural focus feels.",
    "Almost at the finish line! Finish strong and claim your streak."
  ], [activeModeConfig]);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [isRunning, hasCompleted, quoteIndex, ambientSound, theme]);

  // Rotate encouraging quotes dynamically every 15 seconds
  useEffect(() => {
    if (!isRunning || hasCompleted) return;
    const quoteInterval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % motivationalQuotes.length);
    }, 15000);
    return () => clearInterval(quoteInterval);
  }, [isRunning, hasCompleted, motivationalQuotes.length]);

  // Main countdown timer interval
  useEffect(() => {
    if (!isRunning || hasCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setHasCompleted(true);
          if (soundEnabled) audioService.playChime('exhale');
          if (window.confetti) window.confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          return 0;
        }

        // Halfway motivational chime
        if (prev === Math.floor(totalSeconds / 2) && soundEnabled) {
          audioService.playChime('hold');
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, hasCompleted, totalSeconds, soundEnabled]);

  const handleSelectPace = (seconds) => {
    setTotalSeconds(seconds);
    setTimeLeft(seconds);
    setIsRunning(true);
    setHasCompleted(false);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) : 0;
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent * circumference);

  return (
    <div className="routine-timer-overlay animate-fade-in">
      <div className="routine-timer-card">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-left">
            <span className="text-2xl">{habit.icon || '⚡'}</span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">{habit.title}</h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isMin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                }`}>
                  {isMin ? '⚡ Minimum Mode' : '🎯 Full Session'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {activeModeConfig.badge}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">• Streak: {habit.currentStreak}d</span>
              </div>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Exit Session"
          >
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        {/* Circular Countdown Display */}
        <div className="timer-circle-container">
          <div className={`timer-pulse-glow ${isMin ? 'mode-min' : 'mode-full'}`}></div>
          <svg className="timer-progress-ring" width="230" height="230">
            <circle
              className="timer-progress-circle-bg"
              strokeWidth="10"
              r={radius}
              cx="115"
              cy="115"
            />
            <circle
              className={`timer-progress-circle-bar ${isMin ? 'mode-min' : 'mode-full'}`}
              strokeWidth="10"
              r={radius}
              cx="115"
              cy="115"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {hasCompleted ? (
              <div className="space-y-1 animate-fade-in">
                <div className="text-4xl">🏆</div>
                <div className="text-xs font-black uppercase tracking-wider text-emerald-600">Goal Reached!</div>
              </div>
            ) : (
              <>
                <div className="timer-digits">{formatTime(timeLeft)}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {isRunning ? 'Counting Down' : 'Paused'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Encouragement Box */}
        <div className="encouragement-card">
          <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600">
            <i data-lucide="sparkles" className="w-4 h-4 text-indigo-600"></i>
          </div>
          <p className="encouragement-quote">
            {hasCompleted ? "Outstanding dedication! You showed up today and did great." : motivationalQuotes[quoteIndex]}
          </p>
        </div>

        {/* Quick Pace Selector */}
        {!hasCompleted && (
          <div className="flex items-center justify-center gap-1.5 mb-4 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Pace:</span>
            <button
              onClick={() => handleSelectPace(initialDuration)}
              className={`timer-pace-chip ${totalSeconds === initialDuration ? (isMin ? 'active-min' : 'active') : ''}`}
            >
              Default ({Math.round(initialDuration / 60)}m)
            </button>
            <button
              onClick={() => handleSelectPace(60)}
              className={`timer-pace-chip ${totalSeconds === 60 ? (isMin ? 'active-min' : 'active') : ''}`}
            >
              1 Min Sprint
            </button>
            <button
              onClick={() => handleSelectPace(30)}
              className={`timer-pace-chip ${totalSeconds === 30 ? (isMin ? 'active-min' : 'active') : ''}`}
            >
              30s Micro
            </button>
            {initialDuration > 300 && (
              <button
                onClick={() => handleSelectPace(300)}
                className={`timer-pace-chip ${totalSeconds === 300 ? (isMin ? 'active-min' : 'active') : ''}`}
              >
                5 Min Dose
              </button>
            )}
          </div>
        )}

        {/* Ambient Soundscape Quick Bar */}
        <div className="flex items-center justify-between pb-3 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="font-semibold flex items-center gap-1">
            <i data-lucide="volume-2" className="w-3.5 h-3.5"></i>
            Ambient Sound:
          </span>
          <div className="flex gap-1.5">
            {['none', 'rain', 'waves'].map(s => (
              <button
                key={s}
                onClick={() => setAmbientSound(s)}
                className={`px-2 py-0.5 rounded-lg border font-semibold text-[10px] capitalize transition-all ${
                  ambientSound === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s === 'none' ? 'Mute' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          {hasCompleted ? (
            <button
              onClick={() => onComplete(habit.id, mode, totalSeconds - timeLeft)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <i data-lucide="check-circle-2" className="w-5 h-5"></i>
              <span>Save & Record Streak (+1 Day)</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <i data-lucide={isRunning ? 'pause' : 'play'} className="w-4 h-4"></i>
                <span>{isRunning ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                onClick={() => onComplete(habit.id, mode, totalSeconds - timeLeft)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <i data-lucide="check" className="w-4 h-4"></i>
                <span>Finish & Complete Now</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 10C. HABIT UNMARK / REPEAT DIALOG
// ==========================================================================

function HabitUnmarkDialog({ habit, onClose, onUnmark, onStartNewSession }) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-sm w-full rounded-3xl p-6 border border-slate-200 bg-white shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-2xl">
          {habit.icon || '✓'}
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{habit.title}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Already marked complete for today (🔥 {habit.currentStreak}d streak).
          </p>
        </div>
        <div className="space-y-2 pt-2 text-xs">
          <button
            onClick={() => onStartNewSession(habit, 'full')}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <i data-lucide="timer" className="w-4 h-4"></i>
            <span>Start Another Focus Timer</span>
          </button>
          <button
            onClick={() => onUnmark(habit.id)}
            className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold transition-colors"
          >
            Mark as Incomplete
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 11. PRESSURE PLANNER MODAL
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
          Tell your coach about upcoming exams, project deliveries, or milestones so it can proactively suggest Minimum Mode.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Event / Milestone Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Semester Final Exams, Project Launch"
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
// 12. PRIVACY CENTER MODAL
// ==========================================================================

function PrivacyModal({ profile, appState, onWipeData, onClose }) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `reset_wellbeing_export_${Date.now()}.json`);
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
            <h4 className="font-bold text-slate-900 mb-1">Local & Authenticated PostgreSQL Privacy</h4>
            <p>
              Your habits, daily check-ins, and 7-question lifestyle answers belong solely to your verified Google session. We do not share or monetize personal well-being information.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-1">Non-Medical Digital Well-Being Platform</h4>
            <p>
              The Early Pressure & Well-Being Index is a transparent behavioral pattern index derived from completed habits, sleep hours, and workload. It is not a psychological or medical diagnosis.
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
// 13. EXERCISE ENGINE & BREATHING PLAYER (SUPPORTS ALL PATTERNS)
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
      let targetDuration = pattern.inhale || 4;
      if (currentPhase === 'hold') targetDuration = pattern.hold || 2;
      else if (currentPhase === 'exhale') targetDuration = pattern.exhale || 6;
      else if (currentPhase === 'hold2') targetDuration = pattern.hold2 || 4;

      if (phaseTime >= targetDuration) {
        phaseTime = 0;
        if (currentPhase === 'inhale') {
          if (pattern.hold > 0) {
            currentPhase = 'hold';
            if (soundEnabled) audioService.playChime('hold');
          } else {
            currentPhase = 'exhale';
            if (soundEnabled) audioService.playChime('exhale');
          }
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          if (soundEnabled) audioService.playChime('exhale');
        } else if (currentPhase === 'exhale') {
          if (pattern.hold2 > 0) {
            currentPhase = 'hold2';
            if (soundEnabled) audioService.playChime('hold');
          } else {
            currentPhase = 'inhale';
            if (soundEnabled) audioService.playChime('inhale');
          }
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
  }, [activity]);

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
          {phase === 'inhale' ? '🌬️ Breathe in gently...' : phase === 'hold' || phase === 'hold2' ? '✨ Hold calmly...' : '🍃 Exhale and release tension...'}
        </p>
      </div>

      {/* Visual Breathing Circle */}
      <div className="flex items-center justify-center py-6">
        <div className={`w-52 h-52 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${
          phase === 'inhale' 
            ? 'scale-125 border-teal-500 bg-teal-50 shadow-[0_0_40px_rgba(13,148,136,0.25)]' 
            : phase === 'hold' || phase === 'hold2'
            ? 'scale-125 border-indigo-500 bg-indigo-50 shadow-[0_0_40px_rgba(79,70,229,0.2)]' 
            : 'scale-90 border-slate-300 bg-slate-50'
        }`}>
          <span className="text-lg font-extrabold uppercase tracking-widest text-slate-900">
            {phase === 'hold2' ? 'Hold' : phase}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 14. LOGIN VIEW
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
          <p className="text-xs text-slate-600 mt-1">Sign in with Google to sync your adaptive habits & well-being baseline across all devices.</p>
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
// 15. SAFETY & SETTINGS MODALS
// ==========================================================================

function SafetyModal({ onClose }) {
  useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-slate-200 bg-white shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <i data-lucide="heart" className="w-4 h-4 text-rose-500"></i>
            <span>Well-Being & Crisis Resources</span>
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

        {/* Theme Work & Focus Modes Selection */}
        <div className="space-y-2">
          <label className="text-slate-700 font-semibold block">Active Work & Well-Being Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.values(THEME_WORK_MODES).map(m => (
              <div
                key={m.id}
                onClick={() => setTheme(m.id)}
                className={`theme-mode-card ${m.id} ${theme === m.id ? `selected ${m.id}` : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{m.icon}</span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{m.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{m.modeTitle}</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-snug">{m.tagline}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ambient Sound Selection */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
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

        {/* Retake Personalization */}
        <div className="pt-2 border-t border-slate-200">
          <button
            onClick={onRedoOnboarding}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>✨ Re-Personalize My Daily Routine & Baseline</span>
          </button>
        </div>

        {/* User Account Session */}
        {user && (
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-700 truncate max-w-[200px]">Signed in as {user.email}</span>
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
// 16. FOOTER NAVIGATION
// ==========================================================================

function FooterNav({ user, currentView, setCurrentView, onOpenSafety, onOpenPrivacy, onOpenSettings }) {
  useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, []);
  return (
    <footer className="border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 bg-white/70 z-10">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 Reset — Personal Adaptive Habit & Digital Well-Being Coach.</p>
        <div className="flex items-center space-x-4">
          <button onClick={() => setCurrentView('distractions')} className="hover:text-slate-900 font-medium">Distractions & Focus</button>
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
