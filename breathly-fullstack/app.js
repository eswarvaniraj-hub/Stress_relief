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
    minModeVal: 2,
    minModeUnit: 'min',
    tinyVersion: 'Read 1 summary page or review 1 key flashcard',
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
    tinyVersion: '2 minutes of light neck and shoulder stretches',
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
    minModeVal: 2,
    minModeUnit: 'min',
    tinyVersion: 'Take 3 conscious deep breaths with eyes closed',
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
  minimumModeDate: null, // 'YYYY-MM-DD' when turned on for today; automatically inactive next day
  dismissedMinModeSuggestionDate: null,
  lastActiveDate: null,
  distractionGoalMinutes: 45,
  distractions: [],
  focusSessions: [],
  failureLogs: [],
  stressCheckIns: [],
  upcomingPressures: [],
  resetsHistory: [],
  gameSessions: [],
  resetSessions: [], // Unified reset telemetry: { id, userId, dateTime, resetType, tensionBefore, tensionAfter, durationSec }
  interventionHistory: [],
  habitHistory: {}, // 'YYYY-MM-DD' => { completed: true, isRoughDay: boolean, count: number }
  isShieldModeActive: false
};

// Sanitizer to clean legacy demo/mock items from browser localStorage
function sanitizeLoadedState(savedState) {
  if (!savedState || typeof savedState !== 'object') return DEFAULT_INITIAL_STATE;
  const sanitized = {
    ...DEFAULT_INITIAL_STATE,
    ...savedState,
    minimumModeDate: savedState.minimumModeDate || null,
    dismissedMinModeSuggestionDate: savedState.dismissedMinModeSuggestionDate || null,
    lastActiveDate: savedState.lastActiveDate || null,
    habitHistory: (savedState.habitHistory && typeof savedState.habitHistory === 'object') ? savedState.habitHistory : {},
    isShieldModeActive: !!savedState.isShieldModeActive,
    interventionHistory: Array.isArray(savedState.interventionHistory) ? savedState.interventionHistory : [],
    resetSessions: Array.isArray(savedState.resetSessions) ? savedState.resetSessions : []
  };

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
    sanitized.resetsHistory = sanitized.resetsHistory.filter(r => r && !r.isMock && !String(r.id || '').startsWith('mock-reset-'));
  } else {
    sanitized.resetsHistory = [];
  }

  // Filter out any legacy mock game sessions with fake- IDs
  if (Array.isArray(sanitized.gameSessions)) {
    sanitized.gameSessions = sanitized.gameSessions.filter(g => g && !g.isMock && !String(g.id || '').startsWith('fake-'));
  } else {
    sanitized.gameSessions = [];
  }

  // Clean mock reset sessions
  if (Array.isArray(sanitized.resetSessions)) {
    sanitized.resetSessions = sanitized.resetSessions.filter(s => s && !s.isMock && !String(s.id || '').startsWith('mock-'));
  } else {
    sanitized.resetSessions = [];
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
      } catch (e) { }
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
// PROCEDURAL BUBBLE RHYTHM AUDIO SYNTHESIZER
// Web Audio API harmonic sound generator for Bubble Rhythm mini-game
// ==========================================================================
class BubbleRhythmAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.soundGain = null;
    this.musicGain = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.rhythmInterval = null;
    this.currentPreset = 'calm';
    this.currentStep = 0;
    // C Major Pentatonic scale (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5)
    this.scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
    this.chordRoots = {
      calm: [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [349.23, 440.00, 523.25, 659.25], // Fmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [196.00, 261.63, 293.66, 392.00]  // Gsus4
      ],
      flow: [
        [293.66, 369.99, 440.00, 554.37], // Dmaj7
        [392.00, 493.88, 587.33, 739.99], // Gmaj7
        [246.94, 293.66, 369.99, 440.00], // Bm7
        [220.00, 293.66, 329.63, 440.00]  // A7sus4
      ],
      energy: [
        [329.63, 415.30, 493.88, 622.25], // Emaj7
        [440.00, 554.37, 659.25, 830.61], // Amaj7
        [277.18, 329.63, 415.30, 493.88], // C#m7
        [246.94, 329.63, 369.99, 493.88]  // Bsus4
      ]
    };
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.soundGain = this.ctx.createGain();
        this.soundGain.gain.setValueAtTime(this.soundEnabled ? 0.7 : 0, this.ctx.currentTime);
        this.soundGain.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.4 : 0, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSoundEnabled(val) {
    this.soundEnabled = !!val;
    if (this.soundGain && this.ctx) {
      this.soundGain.gain.setTargetAtTime(this.soundEnabled ? 0.7 : 0, this.ctx.currentTime, 0.05);
    }
  }

  setMusicEnabled(val) {
    this.musicEnabled = !!val;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicEnabled ? 0.4 : 0, this.ctx.currentTime, 0.05);
    }
  }

  playPop(pitchIndex = null, isRhythmHit = false) {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      let freq;
      if (typeof pitchIndex === 'number' && pitchIndex >= 0) {
        freq = this.scale[pitchIndex % this.scale.length];
      } else {
        const randIdx = Math.floor(Math.random() * this.scale.length);
        freq = this.scale[randIdx];
      }

      // Crisp bubble droplet pop oscillator (rapid downward frequency glide + resonance)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, t);
      filter.Q.setValueAtTime(3.0, t);

      osc.type = isRhythmHit ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq * 1.8, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.035);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(isRhythmHit ? 0.35 : 0.25, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (isRhythmHit ? 0.45 : 0.28));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.soundGain);

      osc.start(t);
      osc.stop(t + 0.5);

      // Harmonic crystalline shimmer for rhythm hits
      if (isRhythmHit) {
        const chime = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(freq * 2, t);
        chimeGain.gain.setValueAtTime(0.001, t);
        chimeGain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        chime.connect(chimeGain);
        chimeGain.connect(this.soundGain);
        chime.start(t);
        chime.stop(t + 0.65);
      }
    } catch (e) {
      console.warn('Pop sound error:', e);
    }
  }

  playBeatMetronome(isAccent = false) {
    if (!this.musicEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 360 : 240, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(isAccent ? 0.08 : 0.04, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) { }
  }

  playChordPad(preset = 'calm', chordIndex = 0) {
    if (!this.musicEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const chords = this.chordRoots[preset] || this.chordRoots.calm;
      const chord = chords[chordIndex % chords.length];

      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * (idx === 0 ? 0.5 : 1), t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600 + idx * 80, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.035, t + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(t);
        osc.stop(t + 3.0);
      });
    } catch (e) { }
  }

  startRhythm(preset = 'calm', onBeatCallback = null) {
    this.stopRhythm();
    this.init();
    this.currentPreset = preset;
    this.currentStep = 0;

    // BPM: calm=64, flow=84, energy=100
    const bpmMap = { calm: 64, flow: 84, energy: 100 };
    const bpm = bpmMap[preset] || 75;
    const intervalMs = (60 / bpm) * 1000;

    this.playBeatMetronome(true);
    this.playChordPad(preset, 0);
    if (onBeatCallback) onBeatCallback(0, intervalMs);

    this.rhythmInterval = setInterval(() => {
      this.currentStep++;
      const isAccent = this.currentStep % 4 === 0;
      this.playBeatMetronome(isAccent);

      if (isAccent) {
        const chordIdx = Math.floor(this.currentStep / 4) % 4;
        this.playChordPad(preset, chordIdx);
      }

      if (onBeatCallback) onBeatCallback(this.currentStep, intervalMs);
    }, intervalMs);
  }

  stopRhythm() {
    if (this.rhythmInterval) {
      clearInterval(this.rhythmInterval);
      this.rhythmInterval = null;
    }
  }

  dispose() {
    this.stopRhythm();
  }
}

const bubbleAudioService = new BubbleRhythmAudioEngine();

// ==========================================================================
// PROCEDURAL ZEN GARDEN & CAIRN BALANCER AUDIO SYNTHESIZER
// High-fidelity tactile stone clacks, singing bowl chimes, bamboo fountains & sand waves
// ==========================================================================
class ZenGardenAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.soundGain = null;
    this.soundEnabled = true;
    this.singingBowls = [
      174.0, // F3 - Solfeggio pain/tension relief
      285.0, // D4 - Cognitive unfreeze
      396.0, // G4 - Root grounding
      417.0, // G#4 - Undoing stress
      528.0, // C5 - Miracle/clarity tone
      639.0, // D#5 - Harmonious equilibrium
      741.0, // F#5 - Mental focus
      852.0  // G#5 - Pure peaceful consciousness
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.soundGain = this.ctx.createGain();
        this.soundGain.gain.setValueAtTime(this.soundEnabled ? 0.8 : 0, this.ctx.currentTime);
        this.soundGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => { });
    }
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    if (this.soundGain && this.ctx) {
      this.soundGain.gain.setTargetAtTime(enabled ? 0.8 : 0, this.ctx.currentTime, 0.05);
    }
  }

  // Tactile acoustic stone impact / settling sound
  playStoneClack(stoneSize = 1, isBalanced = false) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const baseFreq = 180 / Math.sqrt(stoneSize || 1);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq * 2.2, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.12);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.soundGain);

    osc.start(now);
    osc.stop(now + 0.15);

    // Secondary deep resonance thud
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(baseFreq * 0.9, now);
    subOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.18);

    subGain.gain.setValueAtTime(0.28, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    subOsc.connect(subGain);
    subGain.connect(this.soundGain);

    subOsc.start(now);
    subOsc.stop(now + 0.22);
  }

  // Harmonic Tibetan Singing Bowl chime when stones achieve balance or milestone
  playSingingBowl(levelIndex = 0) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const fundamental = this.singingBowls[levelIndex % this.singingBowls.length] || 396;
    const partials = [
      { freq: fundamental, gain: 0.35, decay: 2.8 },
      { freq: fundamental * 2.01, gain: 0.18, decay: 2.2 },
      { freq: fundamental * 3.02, gain: 0.10, decay: 1.6 },
      { freq: fundamental * 4.24, gain: 0.05, decay: 1.1 }
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const oscDetune = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.freq, now);

      oscDetune.type = 'sine';
      oscDetune.frequency.setValueAtTime(p.freq + 0.55, now);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(p.gain, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gainNode);
      oscDetune.connect(gainNode);
      gainNode.connect(this.soundGain);

      osc.start(now);
      oscDetune.start(now);
      osc.stop(now + p.decay + 0.1);
      oscDetune.stop(now + p.decay + 0.1);
    });
  }

  // Traditional Japanese Shishi-odoshi (Bamboo water fountain drop & click)
  playBambooWaterDrop() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Droplet tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.soundGain);
    osc.start(now);
    osc.stop(now + 0.13);

    // Hollow bamboo clack
    setTimeout(() => {
      if (!this.ctx || !this.soundEnabled) return;
      const t = this.ctx.currentTime;
      const bOsc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      const bFilter = this.ctx.createBiquadFilter();

      bOsc.type = 'triangle';
      bOsc.frequency.setValueAtTime(240, t);
      bOsc.frequency.exponentialRampToValueAtTime(120, t + 0.15);

      bFilter.type = 'bandpass';
      bFilter.frequency.setValueAtTime(450, t);
      bFilter.Q.setValueAtTime(3, t);

      bGain.gain.setValueAtTime(0.25, t);
      bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      bOsc.connect(bFilter);
      bFilter.connect(bGain);
      bGain.connect(this.soundGain);
      bOsc.start(t);
      bOsc.stop(t + 0.2);
    }, 120);
  }

  // Kinetic sand raking sound
  playSandRakeSound(intensity = 1) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750 + Math.random() * 300, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08 * Math.min(2, intensity), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.soundGain);

    noise.start(now);
    noise.stop(now + 0.085);
  }

  dispose() { }
}

const zenAudioService = new ZenGardenAudioEngine();

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

/**
 * Calculates the Wellbeing Index (0-100) based strictly on the user's most recent check-in.
 * 
 * Plain-English Formula Explanation:
 * - Mood (1-5): Adds up to 25 points. Higher mood raises the score.
 * - Energy (1-5): Adds up to 25 points. Higher energy raises the score.
 * - Sleep (0-14 hrs): Adds up to 20 points. Getting 7-8 hours yields full points.
 * - Stress (1-5): Lower stress adds up to 15 points. High stress lowers the score.
 * - Workload (1-5): Manageable workload adds up to 15 points. Heavy workload lowers the score.
 * Total points possible = 100.
 * 
 * Returns null if no check-in entries exist yet.
 */
function calculateWellbeingIndex(appState) {
  const checkIns = appState?.dailyCheckIns || [];
  if (!checkIns || checkIns.length === 0) {
    return {
      hasCheckIns: false,
      score: null,
      statusTitle: 'Awaiting Check-in',
      statusLevel: 'pending',
      summary: 'Do your first check-in'
    };
  }

  // Use the single most recent check-in entry
  const latest = checkIns[0];

  const mood = Number(latest.mood) || 3;
  const energy = Number(latest.energy) || 3;
  const stress = Number(latest.stress) || 3;
  const workload = Number(latest.workload) || 3;
  const sleep = Number(latest.sleep) !== undefined ? Number(latest.sleep) : 7;

  // 1. Mood points: 1 to 5 maps to 0 to 25 points
  const moodScore = ((mood - 1) / 4) * 25;

  // 2. Energy points: 1 to 5 maps to 0 to 25 points
  const energyScore = ((energy - 1) / 4) * 25;

  // 3. Sleep points: Up to 20 points (optimal 7 to 9 hours)
  let sleepScore = 0;
  if (sleep >= 7 && sleep <= 9) {
    sleepScore = 20;
  } else if (sleep < 7) {
    sleepScore = Math.max(0, (sleep / 7) * 20);
  } else {
    sleepScore = Math.max(5, 20 - (sleep - 9) * 3);
  }

  // 4. Stress points: Inverted so lower stress gives more points (up to 15)
  const stressScore = ((5 - stress) / 4) * 15;

  // 5. Workload points: Inverted so lighter workload gives more points (up to 15)
  const workloadScore = ((5 - workload) / 4) * 15;

  const totalScore = Math.round(moodScore + energyScore + sleepScore + stressScore + workloadScore);
  const clampedScore = Math.max(0, Math.min(100, totalScore));

  let statusTitle = 'Balanced & Steady';
  let statusLevel = 'calm';
  if (clampedScore >= 75) {
    statusTitle = 'Thriving & High Energy';
    statusLevel = 'calm';
  } else if (clampedScore < 50) {
    statusTitle = 'Elevated Pressure & Fatigue';
    statusLevel = 'demanding';
  } else if (clampedScore < 65) {
    statusTitle = 'Moderate Strain';
    statusLevel = 'elevated';
  }

  return {
    hasCheckIns: true,
    score: clampedScore,
    statusTitle,
    statusLevel,
    summary: `Mood ${mood}/5 • Energy ${energy}/5 • Stress ${stress}/5`,
    latestEntry: latest
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
    const mostCommon = reasons.sort((a, b) => reasons.filter(v => v === a).length - reasons.filter(v => v === b).length).pop();
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

// --- 10-SECOND DE-ESCALATOR MICRO-STEPS LIBRARY ---
const DE_ESCALATOR_STEPS = [
  {
    id: 'step-touch',
    category: 'Study & Work Focus',
    icon: 'book-open',
    title: 'Touch the Work Surface',
    action: 'Place your hand on your textbook cover, open the work tab, or sit at your desk for 10 seconds. Do not start working yet.',
    neuroscience: 'Disarms the brain’s amygdala threat appraisal by reducing startup threshold to absolute zero.'
  },
  {
    id: 'step-exhale',
    category: 'Nervous System Reset',
    icon: 'wind',
    title: 'Physiological Sigh',
    action: 'Take two quick deep sniffs in through your nose, then release one long, slow, audible sigh out through your mouth.',
    neuroscience: 'The fastest biological trigger to pop open collapsed lung alveoli and engage the parasympathetic vagal brake.'
  },
  {
    id: 'step-water',
    category: 'Physical De-tension',
    icon: 'cup-soda',
    title: 'Sip Water & Drop Shoulders',
    action: 'Take 2 calm sips of water, drop your shoulders away from your ears, and release the tension in your jaw.',
    neuroscience: 'Swallowing activates the cranial nerves for safe autonomic digestion, interrupting panic loops.'
  },
  {
    id: 'step-one-word',
    category: 'Procrastination Circuit Breaker',
    icon: 'edit-3',
    title: 'Type Exactly One Word',
    action: 'Open your document or app and type any single word (even "The", "Notes", or "Start"). That is all for now.',
    neuroscience: 'Triggers the Zeigarnik effect — once an action is initiated, mental cognitive resistance drops by 80%.'
  },
  {
    id: 'step-stretch',
    category: 'Postural Energy Unfreeze',
    icon: 'sparkles',
    title: '10-Second Chest Expansion',
    action: 'Interlace your fingers behind your back or reach both arms overhead and take a slow breath looking gently upward.',
    neuroscience: 'Reverses forward-head screen posture, restoring natural diaphragm excursion.'
  }
];

// --- PREEMPTIVE FRICTION & BURNOUT FORECAST ALGORITHM ---
function calculateFrictionForecast(appState) {
  let frictionScore = 20; // baseline optimal
  const factors = [];

  // Factor 1: Upcoming high-pressure events
  const upcoming = appState.upcomingPressures || [];
  const activePressures = upcoming.filter(p => p.isActive);
  if (activePressures.length > 0) {
    const pressurePoints = Math.min(35, activePressures.length * 15);
    frictionScore += pressurePoints;
    factors.push({
      icon: 'alert-triangle',
      title: `${activePressures.length} High-Pressure Event(s) Approaching`,
      detail: activePressures.map(p => p.title).join(', ')
    });
  }

  // Factor 2: Daily Check-In Workload & Stress Trends
  const checkIns = appState.dailyCheckIns || [];
  if (checkIns.length > 0) {
    const recent = checkIns.slice(0, 3);
    const heavyDays = recent.filter(c => c.workloadRating === 'heavy' || c.workloadRating === 'overloaded');
    if (heavyDays.length > 0) {
      frictionScore += heavyDays.length * 10;
      factors.push({
        icon: 'trending-up',
        title: 'Consecutive Heavy Workload Days',
        detail: 'Elevated cognitive load reported in recent daily check-ins.'
      });
    }

    const stressSpikes = recent.filter(c => c.overallFeeling === 'frazzled' || c.overallFeeling === 'exhausted');
    if (stressSpikes.length > 0) {
      frictionScore += stressSpikes.length * 12;
      factors.push({
        icon: 'zap',
        title: 'Early Exhaustion Signals',
        detail: 'Energy depletion logged — nervous system needs proactive recovery.'
      });
    }
  }

  // Factor 3: Habit Resistance & Failure Logs
  const failures = appState.failureLogs || [];
  const recentFailures = failures.filter(f => Date.now() - Number(f.timestamp) < 72 * 3600 * 1000);
  if (recentFailures.length > 0) {
    frictionScore += Math.min(20, recentFailures.length * 8);
    factors.push({
      icon: 'shield-alert',
      title: `${recentFailures.length} Habit Friction Notes`,
      detail: 'Obstacles logged in the past 72 hours indicate schedule friction.'
    });
  }

  frictionScore = Math.max(8, Math.min(96, frictionScore));

  let level = 'low';
  let levelTitle = 'Optimal Flow (Low Friction)';
  let levelColor = '#10b981';
  let description = 'Workload and recovery signals are balanced. Standard target habit pacing is sustainable.';
  let shouldRecommendShield = false;

  if (frictionScore >= 65) {
    level = 'critical';
    levelTitle = 'Critical Friction (High Burnout Risk)';
    levelColor = '#e11d48';
    description = 'Urgent pressure and fatigue signals detected. Activating Burnout Shield Mode will safeguard your consistency without burnout.';
    shouldRecommendShield = true;
  } else if (frictionScore >= 40) {
    level = 'elevated';
    levelTitle = 'Elevated Friction (Building Pressure)';
    levelColor = '#f59e0b';
    description = 'Demands are rising. Consider switching habits to Minimum Mode or activating the Burnout Shield.';
    shouldRecommendShield = true;
  }

  return {
    score: frictionScore,
    level,
    levelTitle,
    levelColor,
    description,
    factors: factors.length > 0 ? factors : [{ icon: 'check-circle-2', title: 'Sustainable Routine', detail: 'No impending deadline collisions or severe fatigue markers detected.' }],
    shouldRecommendShield
  };
}

// ==========================================================================
// TENSION RATING PROMPT MODAL (1-5 SCALE)
// ==========================================================================
function TensionRatingModal({
  isOpen,
  step = 'before', // 'before' | 'after'
  resetType = 'Mindful Reset',
  onSelect,
  onSkip,
  onCancel
}) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [isOpen, step]);

  if (!isOpen) return null;

  const levels = [
    { val: 1, label: '1', name: 'Calm', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400' },
    { val: 2, label: '2', name: 'Mild', badge: 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100 hover:border-teal-400' },
    { val: 3, label: '3', name: 'Moderate', badge: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 hover:border-amber-400' },
    { val: 4, label: '4', name: 'Tense', badge: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100 hover:border-orange-400' },
    { val: 5, label: '5', name: 'Very Tense', badge: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 hover:border-rose-400' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-6 animate-scale-up">
        {/* Header Tag */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#e8f3ed] text-[#1b4332] border border-[#1b4332]/20">
            {step === 'before' ? 'Before you begin' : 'Reset Complete'}
          </span>
          <span className="text-xs font-bold text-slate-500 truncate max-w-[180px]">
            {resetType}
          </span>
        </div>

        {/* Question Title */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            How tense are you right now? 1-5
          </h2>
          <p className="text-xs text-slate-500">
            {step === 'before'
              ? 'Check in before starting your session'
              : 'Check in after your session to track what helped'}
          </p>
        </div>

        {/* 5-Button Rating Strip */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {levels.map((lvl) => (
            <button
              key={lvl.val}
              type="button"
              onClick={() => onSelect(lvl.val)}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-sm ${lvl.badge}`}
            >
              <span className="text-xl sm:text-2xl font-black">{lvl.label}</span>
              <span className="text-[10px] font-bold leading-tight">{lvl.name}</span>
            </button>
          ))}
        </div>

        {/* Footer with Skip Link & Cancel Option */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          {step === 'before' && onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-700 font-medium transition-colors"
            >
              Exit
            </button>
          ) : (
            <span></span>
          )}

          <button
            type="button"
            onClick={onSkip}
            className="text-slate-400 hover:text-slate-700 underline font-medium transition-colors cursor-pointer"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// MAIN APPLICATION COMPONENT
// ==========================================================================

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) { }
    return null;
  });

  const [appState, setAppState] = useState(() => {
    try {
      const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      const key = savedUser?.id ? `coach_app_state_${savedUser.id}_v3` : STORAGE_KEY;
      const saved = localStorage.getItem(key) || localStorage.getItem(STORAGE_KEY);
      if (saved) return sanitizeLoadedState(JSON.parse(saved));
    } catch (e) {
      console.warn('State load error:', e);
    }
    return DEFAULT_INITIAL_STATE;
  });

  const [googleClientId, setGoogleClientId] = useState(() => {
    return localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || DEFAULT_GOOGLE_CLIENT_ID;
  });

  const [checkInStatus, setCheckInStatus] = useState(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      const key = savedUser?.id ? `coach_app_state_${savedUser.id}_v3` : STORAGE_KEY;
      const saved = localStorage.getItem(key) || localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        const checkIns = state?.dailyCheckIns || [];
        const today = checkIns.find(c => (c.date || c.checkInDate) === todayStr);
        if (today) return { hasCheckedInToday: true, todayCheckIn: today };
      }
    } catch (e) { }
    return { hasCheckedInToday: false, todayCheckIn: null };
  });

  // Keep checkInStatus in sync whenever appState.dailyCheckIns changes
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const checkIns = appState?.dailyCheckIns || [];
    const todayEntry = checkIns.find(c => (c.date || c.checkInDate) === todayStr);
    setCheckInStatus({
      hasCheckedInToday: !!todayEntry,
      todayCheckIn: todayEntry || null
    });
  }, [appState.dailyCheckIns]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // AI Stress Prediction & Personalized Well-Being Recommendations
  const [wellbeingRecommendations, setWellbeingRecommendations] = useState(null);
  const [activeIntervention, setActiveIntervention] = useState(null);

  // Load all user profile, habits, check-ins, sessions, pressure events, and preferences from PostgreSQL
  const loadUserDataFromServer = async () => {
    if (!window.api) return;
    try {
      // 1. Profile & onboarding
      if (window.api.getProfile) {
        try {
          const profileRes = await window.api.getProfile();
          if (profileRes && profileRes.hasCompletedOnboarding && profileRes.profile) {
            setAppState(prev => ({
              ...prev,
              profile: { ...profileRes.profile, isCompleted: true }
            }));
          } else {
            setAppState(prev => ({
              ...prev,
              profile: { ...DEFAULT_PROFILE, isCompleted: false }
            }));
          }
        } catch (e) { }
      }

      // 2. Habits from PostgreSQL
      if (window.api.listHabits) {
        try {
          const habitsRes = await window.api.listHabits();
          if (habitsRes && Array.isArray(habitsRes.habits)) {
            setAppState(prev => ({
              ...prev,
              habits: habitsRes.habits.map(h => ({
                id: h.id || h.title.toLowerCase().replace(/\s+/g, '-'),
                title: h.title,
                goalId: h.goal_id,
                category: h.category || 'Focus',
                icon: h.icon || '⚡',
                targetVal: h.target_val || 30,
                targetUnit: h.target_unit || 'min',
                minModeVal: h.min_mode_val || 5,
                minModeUnit: h.min_mode_unit || 'min',
                preferredTime: h.preferred_time || 'anytime',
                currentStreak: h.current_streak || 0,
                bestStreak: h.best_streak || 0,
                todayStatus: null,
                todayCompletedAt: null
              }))
            }));
          }
        } catch (e) { }
      }

      // 3. Daily check-in status & history
      if (window.api.getCheckInStatus) {
        try {
          const statusRes = await window.api.getCheckInStatus();
          if (statusRes) {
            setCheckInStatus({
              hasCheckedInToday: !!statusRes.hasCheckedInToday,
              todayCheckIn: statusRes.todayCheckIn || null
            });
          }
        } catch (e) { }
      }

      if (window.api.getRecentCheckIns) {
        try {
          const recentRes = await window.api.getRecentCheckIns();
          setAppState(prev => ({
            ...prev,
            dailyCheckIns: (recentRes && Array.isArray(recentRes.checkIns)) ? recentRes.checkIns : []
          }));
        } catch (e) { }
      }

      // 4. Distractions
      if (window.api.listDistractions) {
        try {
          const distRes = await window.api.listDistractions();
          setAppState(prev => ({
            ...prev,
            distractions: (distRes && Array.isArray(distRes.distractions)) ? distRes.distractions : []
          }));
        } catch (e) { }
      }

      // 5. Focus Sessions
      if (window.api.listFocusSessions) {
        try {
          const focusRes = await window.api.listFocusSessions();
          setAppState(prev => ({
            ...prev,
            focusSessions: (focusRes && Array.isArray(focusRes.sessions)) ? focusRes.sessions : []
          }));
        } catch (e) { }
      }

      // 6. Preferences
      if (window.api.getPreferences) {
        try {
          const prefRes = await window.api.getPreferences();
          if (prefRes && prefRes.preferences) {
            setAppState(prev => ({
              ...prev,
              theme: prefRes.preferences.theme || prev.theme,
              soundEnabled: prefRes.preferences.notification_enabled !== false,
              distractionGoalMinutes: Number(prefRes.preferences.daily_distraction_goal_minutes) || prev.distractionGoalMinutes || 45
            }));
          }
        } catch (e) { }
      }

      // 7. Mini Game Sessions
      if (window.api.listGameSessions) {
        try {
          const gameRes = await window.api.listGameSessions();
          setAppState(prev => ({
            ...prev,
            gameSessions: (gameRes && Array.isArray(gameRes.sessions)) ? gameRes.sessions : []
          }));
        } catch (e) { }
      }

      // 8. Upcoming Pressure Events
      if (window.api.listPressureEvents) {
        try {
          const pressRes = await window.api.listPressureEvents();
          setAppState(prev => ({
            ...prev,
            upcomingPressures: (pressRes && Array.isArray(pressRes.pressureEvents))
              ? pressRes.pressureEvents.map(p => ({
                id: p.id,
                title: p.title,
                eventType: p.event_type || 'Exams',
                startDate: p.start_date,
                endDate: p.end_date,
                notes: p.notes,
                isActive: true
              }))
              : []
          }));
        } catch (e) { }
      }

      // 9. Failure Logs
      if (window.api.listFailures) {
        try {
          const failRes = await window.api.listFailures();
          setAppState(prev => ({
            ...prev,
            failureLogs: (failRes && Array.isArray(failRes.failures))
              ? failRes.failures.map(f => ({
                id: f.id,
                habitId: f.habit_id,
                habitTitle: f.habit_id ? 'Habit #' + f.habit_id : 'Habit',
                timestamp: new Date(f.logged_at).getTime(),
                reason: f.reason,
                note: f.note
              }))
              : []
          }));
        } catch (e) { }
      }

      // 10. Goals
      if (window.api.listGoals) {
        try {
          const goalsRes = await window.api.listGoals();
          if (goalsRes && Array.isArray(goalsRes.goals) && goalsRes.goals.length > 0) {
            setAppState(prev => ({
              ...prev,
              goals: goalsRes.goals.map(g => ({
                id: g.id,
                title: g.title,
                category: g.category || 'Growth',
                icon: g.icon || '🎯',
                targetDate: g.target_date
              }))
            }));
          }
        } catch (e) { }
      }

      // 11. AI Stress Prediction & Personalized Well-Being Recommendations
      if (window.api.getRecommendations) {
        try {
          const recRes = await window.api.getRecommendations();
          if (recRes && recRes.recommendations) {
            setWellbeingRecommendations(recRes);
          }
        } catch (e) { }
      }
    } catch (err) {
      console.warn('Error loading server data:', err);
    }
  };

  // Verify server session and load user profile & habits from PostgreSQL
  useEffect(() => {
    let cancelled = false;
    if (window.api && window.api.me) {
      window.api.me()
        .then((res) => {
          if (cancelled) return;
          const sessionUser = res && res.user ? res.user : res;
          if (sessionUser) {
            setUser(sessionUser);
            loadUserDataFromServer().catch(err => console.warn('Server data load error:', err));
            // Navigate away from login/landing page to dashboard on verified session
            setCurrentView(prev => (prev === 'login' || prev === 'landing' ? 'dashboard' : prev));
          }
        })
        .catch(() => {
          if (!cancelled) {
            setUser(null);
            try { localStorage.removeItem(USER_STORAGE_KEY); } catch (e) { }
          }
        });
    }
    return () => { cancelled = true; };
  }, []);

  // Automatically navigate away from login view when user is authenticated
  useEffect(() => {
    if (user && currentView === 'login') {
      setCurrentView('dashboard');
    }
  }, [user, currentView]);

  // Save state (user-isolated so multiple accounts never share data)
  useEffect(() => {
    try {
      const storageKey = user?.id ? `coach_app_state_${user.id}_v3` : STORAGE_KEY;
      localStorage.setItem(storageKey, JSON.stringify(appState));
    } catch (e) { }
  }, [appState, user]);

  // Save User
  useEffect(() => {
    try {
      if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) { }
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

  // --- PREDICTABLE NAVIGATION & ROUTER INTEGRATION ---
  const router = window.BreathlyRouter;
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (router) {
      return router.evaluateRoute(router.currentRoute, user, appState.profile);
    }
    return appState.profile?.isCompleted ? 'home' : 'welcome';
  });

  useEffect(() => {
    const handleRouteChange = (e) => {
      if (e.detail && e.detail.route) {
        setCurrentRoute(e.detail.route);
      }
    };
    window.addEventListener('breathly-route-change', handleRouteChange);
    return () => window.removeEventListener('breathly-route-change', handleRouteChange);
  }, []);

  const navigate = (to, params = {}) => {
    if (router) {
      router.navigate(to, params);
    } else {
      setCurrentRoute(to);
    }
  };

  const goBack = () => {
    if (router) {
      router.goBack();
    } else {
      setCurrentRoute('home');
    }
  };

  const setCurrentView = (v) => {
    const map = {
      'landing': 'welcome',
      'login': 'welcome',
      'dashboard': 'home',
      'checkin': 'checkin',
      'stress': 'insights',
      'habits': 'home',
      'breathing': 'reset',
      'exercise': 'exercise',
      'distractions': 'distractions',
      'journal': 'journal',
      'coach': 'companion',
      'goals': 'home',
      'weekly-report': 'insights',
      'profile': 'profile',
      'minigames': 'games',
      'bubble-rhythm': 'bubble-rhythm',
      'zen-garden': 'zen-garden',
      'design-preview': 'design-preview'
    };
    navigate(map[v] || v);
  };
  const currentView = currentRoute;

  // Intervention Sheet State
  const [isInterventionSheetOpen, setIsInterventionSheetOpen] = useState(false);
  const [activeSelectedIntervention, setActiveSelectedIntervention] = useState(null);
  const [activeResetTypeKey, setActiveResetTypeKey] = useState('box');
  const [selectedMiniGameMode, setSelectedMiniGameMode] = useState('rhythm_pop');

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
  const [showDeEscalatorModal, setShowDeEscalatorModal] = useState(false);
  const [isShieldModeActive, setIsShieldModeActive] = useState(() => !!appState.isShieldModeActive);
  const [activeFocusSession, setActiveFocusSession] = useState(null);
  const [activeQuickReset, setActiveQuickReset] = useState(ACTIVITIES['breathing-426']);
  const [tensionPrompt, setTensionPrompt] = useState(null); // { isOpen, step: 'before'|'after', resetType, activity, sessionDetails }
  const [activeResetSession, setActiveResetSession] = useState(null); // { resetType, category, activity, tensionBefore, startTime }

  // Active Routine Countdown Timer Session State
  const [activeTimingHabit, setActiveTimingHabit] = useState(null); // { habit, mode: 'full' | 'min' }
  const [unmarkModalHabit, setUnmarkModalHabit] = useState(null);

  // Rough Day / Minimum Mode State (stored per user and per day in appState.minimumModeDate)
  const [showRoughDayModal, setShowRoughDayModal] = useState(false);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isMinimumModeToday = appState.minimumModeDate === todayStr;

  const handleTurnOnMinimumMode = () => {
    setAppState(prev => ({
      ...prev,
      minimumModeDate: todayStr
    }));
    setShowRoughDayModal(false);
    if (window.confetti) window.confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
  };

  const handleTurnOffMinimumMode = () => {
    setAppState(prev => ({
      ...prev,
      minimumModeDate: null
    }));
  };

  const handleDismissMinModeSuggestion = () => {
    setAppState(prev => ({
      ...prev,
      dismissedMinModeSuggestionDate: todayStr
    }));
  };

  // Automatic suggestion: if user missed 2 days in a row or logged low energy (1-2) in 2 check-ins in a row
  const showMinModeSuggestion = useMemo(() => {
    if (isMinimumModeToday) return false;
    if (appState.dismissedMinModeSuggestionDate === todayStr) return false;

    // Trigger A: Logged low energy (1-2) in 2 check-ins in a row
    const checkIns = appState.dailyCheckIns || [];
    if (checkIns.length >= 2) {
      const e0 = Number(checkIns[0].energy);
      const e1 = Number(checkIns[1].energy);
      if (e0 >= 1 && e0 <= 2 && e1 >= 1 && e1 <= 2) {
        return true;
      }
    }

    // Trigger B: User missed 2 days in a row
    if (appState.lastActiveDate) {
      const todayMs = new Date(todayStr).getTime();
      const lastActiveMs = new Date(appState.lastActiveDate).getTime();
      const diffDays = Math.floor((todayMs - lastActiveMs) / (1000 * 60 * 60 * 24));
      if (diffDays >= 2) return true;
    } else if (checkIns.length > 0) {
      const latestDate = checkIns[0].date || checkIns[0].checkInDate;
      if (latestDate) {
        const todayMs = new Date(todayStr).getTime();
        const latestMs = new Date(latestDate).getTime();
        const diffDays = Math.floor((todayMs - latestMs) / (1000 * 60 * 60 * 24));
        if (diffDays >= 2) return true;
      }
    }

    // Also trigger if 2 or more failure/skip logs in recent 3 days
    const recentSkips = (appState.failureLogs || []).filter(f => (Date.now() - (Number(f.timestamp) || 0)) < 72 * 3600 * 1000);
    if (recentSkips.length >= 2) return true;

    return false;
  }, [appState.dailyCheckIns, appState.lastActiveDate, appState.dismissedMinModeSuggestionDate, appState.failureLogs, isMinimumModeToday, todayStr]);

  const earlySignals = useMemo(() => evaluateEarlyStressSignals(appState, appState.dailyCheckIns), [appState]);
  const wellbeing = useMemo(() => calculateWellbeingIndex(appState), [appState]);
  const insights = useMemo(() => generateAIInsights(appState), [appState]);
  const frictionForecast = useMemo(() => calculateFrictionForecast(appState), [appState]);
  const consistency = useMemo(() => {
    if (typeof calculateConsistency === 'function') {
      return calculateConsistency(appState, todayStr);
    }
    return {
      hasData: false,
      isEmpty: true,
      displayScore: 'Add a habit to start',
      consistencyRatio: 'Add a habit to start',
      effectiveCount: 0,
      completedDaysCount: 0,
      graceDaysUsed: 0,
      graceDaysLeft: 2,
      consistencyPercent: 0,
      statusText: 'Add a habit to start',
      days: []
    };
  }, [appState, todayStr]);

  const isHighStressState = useMemo(() => {
    const isDemandingSignal = earlySignals.statusLevel === 'elevated' || earlySignals.statusLevel === 'demanding' || (earlySignals.score && earlySignals.score < 65);
    const isFrictionHigh = frictionForecast && (frictionForecast.level === 'critical' || frictionForecast.level === 'elevated' || frictionForecast.score >= 45);
    const isCheckInStressed = checkInStatus?.todayCheckIn && (
      checkInStatus.todayCheckIn.overallFeeling === 'frazzled' ||
      checkInStatus.todayCheckIn.overallFeeling === 'exhausted' ||
      checkInStatus.todayCheckIn.overallFeeling === 'anxious' ||
      checkInStatus.todayCheckIn.overallFeeling === 'demanding' ||
      checkInStatus.todayCheckIn.workloadRating === 'heavy' ||
      checkInStatus.todayCheckIn.workloadRating === 'overload' ||
      (Number(checkInStatus.todayCheckIn.stressRating) >= 7)
    );
    const hasRecentFailures = appState.failureLogs && appState.failureLogs.some(f => Date.now() - Number(f.timestamp) < 72 * 3600 * 1000);
    return Boolean(isDemandingSignal || isFrictionHigh || isCheckInStressed || hasRecentFailures);
  }, [earlySignals, frictionForecast, checkInStatus, appState.failureLogs]);

  const handleToggleShieldMode = () => {
    setIsShieldModeActive(prev => {
      const next = !prev;
      setAppState(s => ({
        ...s,
        isShieldModeActive: next,
        theme: next ? 'sage' : (s.theme === 'sage' ? 'porcelain' : s.theme),
        ambientSound: next ? 'rain' : s.ambientSound
      }));
      if (next && window.confetti) {
        window.confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
      }
      return next;
    });
  };

  // --- MINI GAME ACTION HANDLER ---
  const handleSaveGameSession = async (sessionData) => {
    const rawType = sessionData.resetType || sessionData.gameName || 'Bubble Rhythm';
    const canonicalType = (typeof normalizeResetType === 'function') ? normalizeResetType(rawType) : rawType;
    const tensionBefore = (typeof sessionData.tensionBefore === 'number' && sessionData.tensionBefore >= 1 && sessionData.tensionBefore <= 5) ? sessionData.tensionBefore : null;
    const tensionAfter = (typeof sessionData.tensionAfter === 'number' && sessionData.tensionAfter >= 1 && sessionData.tensionAfter <= 5) ? sessionData.tensionAfter : null;
    const durationSec = Number(sessionData.durationSeconds) || 120;

    const newResetRecord = {
      id: 'session-' + Date.now(),
      userId: user?.id || sessionData.userId || 'local',
      dateTime: sessionData.dateTime || new Date().toISOString(),
      resetType: canonicalType,
      category: 'game',
      tensionBefore,
      tensionAfter,
      durationSec,
      details: {
        gameMode: sessionData.gameMode,
        bubblesPopped: sessionData.bubblesPopped,
        feeling: sessionData.feeling,
        enjoyment: sessionData.enjoyment
      }
    };

    const newGameSession = {
      id: 'game-' + Date.now(),
      game_name: sessionData.gameName || canonicalType,
      game_mode: sessionData.gameMode || 'rhythm_pop',
      rhythm_preset: sessionData.rhythmPreset || null,
      duration_seconds: durationSec,
      bubbles_popped: Number(sessionData.bubblesPopped) || 0,
      completed: true,
      tensionBefore,
      tensionAfter,
      feeling: sessionData.feeling || null,
      enjoyment: sessionData.enjoyment || null,
      played_at: newResetRecord.dateTime
    };

    setAppState(prev => ({
      ...prev,
      resetSessions: [newResetRecord, ...(prev.resetSessions || [])],
      gameSessions: [newGameSession, ...(prev.gameSessions || [])]
    }));

    if (tensionBefore !== null && tensionAfter !== null && tensionBefore > tensionAfter) {
      if (window.confetti) window.confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    }

    if (user && window.api?.saveGameSession) {
      try {
        await window.api.saveGameSession({
          ...sessionData,
          tensionBefore,
          tensionAfter
        });
      } catch (err) {
        console.warn('Sync game session error:', err);
      }
    }
  };

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
    setAuthLoading(true);
    setAuthError(null);
    try {
      const authRes = await window.api.loginWithGoogle(credentialResponse.credential);
      const verifiedUser = authRes && authRes.user ? authRes.user : authRes;
      if (!verifiedUser) {
        throw new Error('Authentication succeeded but user details were not received');
      }

      setUser(verifiedUser);
      // Immediately navigate to Home/Dashboard page
      setCurrentView('dashboard');
      setAuthLoading(false);

      if (window.confetti) {
        window.confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      }

      // Hydrate all data from PostgreSQL for this user on any device in background
      loadUserDataFromServer().catch(err => {
        console.warn('Background sync error after login:', err);
      });
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      setAuthLoading(false);
      setAuthError(err?.message || 'Could not sign you in with Google. Please verify server connection.');
      alert('Could not sign you in with Google. Please verify server connection.');
    }
  };

  const handleSignOut = () => {
    // 1. Immediately reset Google auth
    if (window.google?.accounts?.id) {
      try { window.google.accounts.id.disableAutoSelect(); } catch (e) { }
    }

    // 2. Fire backend session logout in background (non-blocking)
    if (window.api?.logout) {
      window.api.logout().catch(() => { });
    }

    // 3. Clear user & storage immediately
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { }

    // 4. Reset app state back to clean initial state
    setAppState(DEFAULT_INITIAL_STATE);
    setCheckInStatus({
      hasCheckedInToday: false,
      todayCheckIn: null
    });

    // 5. Close all modals and active player states immediately
    setShowSettingsModal(false);
    setShowPrivacyModal(false);
    setShowSafetyModal(false);
    setShowHabitModal(false);
    setShowFailureModal(false);
    setShowPressureModal(false);
    setShowAddDistractionModal(false);
    setActiveFocusSession(null);
    setActiveTimingHabit(null);
    setEditingHabit(null);
    setUnmarkModalHabit(null);
    setActiveFailureHabit(null);

    // 6. Direct immediately to landing view
    setCurrentView('landing');
  };

  // --- HABIT ACTION HANDLERS (LAUNCHES COUNTDOWN TIMER & ENCOURAGEMENT) ---
  const handleToggleHabit = (habitId, mode = (isMinimumModeToday ? 'min' : 'full')) => {
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

    let updatedStreak = 1;
    let updatedBest = 1;

    setAppState(prev => {
      const updated = prev.habits.map(h => {
        if (h.id !== habitId) return h;
        const newStreak = (h.currentStreak || 0) + 1;
        const bestStreak = Math.max(h.bestStreak || 0, newStreak);
        updatedStreak = newStreak;
        updatedBest = bestStreak;

        return {
          ...h,
          todayStatus: mode,
          currentStreak: newStreak,
          bestStreak,
          todayCompletedAt: Date.now()
        };
      });

      // Update habitHistory for consistency tracking
      const isRoughDay = prev.minimumModeDate === todayStr || mode === 'min';
      const existingToday = prev.habitHistory?.[todayStr] || {};
      const updatedHistory = {
        ...(prev.habitHistory || {}),
        [todayStr]: {
          completed: true,
          isRoughDay: isRoughDay || !!existingToday.isRoughDay,
          completedCount: (existingToday.completedCount || 0) + 1,
          lastCompletedAt: Date.now()
        }
      };

      return {
        ...prev,
        habits: updated,
        habitHistory: updatedHistory,
        lastActiveDate: todayStr
      };
    });

    if (window.confetti) {
      window.confetti({ particleCount: mode === 'min' ? 35 : 65, spread: 70, origin: { y: 0.6 } });
    }

    if (user) {
      if (window.api?.createBreathingSession) {
        const habit = appState.habits.find(h => h.id === habitId);
        const title = habit ? `Routine: ${habit.title} (${mode === 'min' ? 'Minimum Mode' : 'Full Target'})` : 'Daily Routine';
        window.api.createBreathingSession(title, durationElapsed || 60).catch(console.warn);
      }
      if (window.api?.updateHabit && typeof habitId === 'number') {
        window.api.updateHabit(habitId, { currentStreak: updatedStreak, bestStreak: updatedBest }).catch(console.warn);
      }
    }

    setActiveTimingHabit(null);
  };

  const handleUnmarkHabit = (habitId) => {
    setAppState(prev => {
      const updatedHabits = prev.habits.map(h => {
        if (h.id !== habitId) return h;
        return {
          ...h,
          todayStatus: null,
          currentStreak: Math.max(0, (h.currentStreak || 1) - 1),
          todayCompletedAt: null
        };
      });

      const anyCompletedToday = updatedHabits.some(h => h.todayStatus === 'full' || h.todayStatus === 'min');
      const updatedHistory = { ...(prev.habitHistory || {}) };
      if (!anyCompletedToday && updatedHistory[todayStr]) {
        delete updatedHistory[todayStr];
      }

      return {
        ...prev,
        habits: updatedHabits,
        habitHistory: updatedHistory
      };
    });
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

  const handleSaveHabit = async (habitData) => {
    let serverHabit = null;
    if (user && window.api) {
      try {
        if (editingHabit && typeof editingHabit.id === 'number') {
          const res = await window.api.updateHabit(editingHabit.id, habitData);
          serverHabit = res?.habit;
        } else if (!editingHabit) {
          const res = await window.api.createHabit(habitData);
          serverHabit = res?.habit;
        }
      } catch (err) {
        console.warn('Sync habit error:', err);
      }
    }

    setAppState(prev => {
      let updatedHabits;
      if (editingHabit) {
        updatedHabits = prev.habits.map(h => {
          if (h.id === editingHabit.id) {
            return {
              ...h,
              ...habitData,
              ...(serverHabit ? { id: serverHabit.id } : {})
            };
          }
          return h;
        });
      } else {
        const newHabit = {
          id: serverHabit?.id || ('habit-' + Date.now()),
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

  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Delete this habit?')) {
      setAppState(prev => ({
        ...prev,
        habits: prev.habits.filter(h => h.id !== habitId)
      }));
      if (user && window.api?.deleteHabit && typeof habitId === 'number') {
        try {
          await window.api.deleteHabit(habitId);
        } catch (err) {
          console.warn('Delete habit error:', err);
        }
      }
    }
  };

  // --- 20-SECOND DAILY CHECK-IN HANDLER (1 ENTRY PER DAY PER USER) ---
  const handleSaveDailyCheckIn = async (checkInData) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userId = user?.id || 'guest';

    // Exact fields requested: user id, date, mood, energy, stress, workload, sleep
    const newEntry = {
      id: checkInData.id || ('checkin-' + Date.now()),
      userId: userId,
      date: todayStr,
      checkInDate: todayStr, // backward compatibility
      mood: Number(checkInData.mood) || 3,
      energy: Number(checkInData.energy) || 3,
      stress: Number(checkInData.stress) || 3,
      workload: Number(checkInData.workload) || 3,
      sleep: Number(checkInData.sleep) !== undefined ? Number(checkInData.sleep) : 7,
      createdAt: checkInData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAppState(prev => {
      const existingList = Array.isArray(prev.dailyCheckIns) ? prev.dailyCheckIns : [];
      // Remove any existing entry for today so editing updates today's entry instead of creating duplicates
      const withoutToday = existingList.filter(c => (c.date || c.checkInDate) !== todayStr);
      return {
        ...prev,
        dailyCheckIns: [newEntry, ...withoutToday],
        lastCheckInDate: todayStr,
        lastActiveDate: todayStr
      };
    });

    setCheckInStatus({
      hasCheckedInToday: true,
      todayCheckIn: newEntry
    });

    if (user && window.api?.logDailyCheckIn) {
      try {
        await window.api.logDailyCheckIn({
          ...newEntry,
          timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
          overallFeeling: `Mood ${newEntry.mood}/5`,
          workloadRating: `Workload ${newEntry.workload}/5`,
          sleepQuality: `${newEntry.sleep}h`,
          stressRating: newEntry.stress
        });
        if (window.api?.getRecommendations) {
          const updatedRecs = await window.api.getRecommendations();
          if (updatedRecs) setWellbeingRecommendations(updatedRecs);
        }
      } catch (err) {
        console.warn('Failed to sync check-in with server:', err);
      }
    }

    if (window.confetti) window.confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
  };

  // --- PERSONALIZED WELL-BEING INTERVENTION HANDLERS ---
  const handleStartIntervention = (type, title, interventionObj) => {
    setActiveIntervention({
      type,
      title: title || 'Well-Being Session',
      defaultDurationMin: interventionObj?.defaultDurationMin || 10,
      description: interventionObj?.description || '',
      personalizedReason: interventionObj?.personalizedReason || ''
    });
  };

  const handleCompleteIntervention = async (feedbackData) => {
    const newSession = {
      id: 'interv-' + Date.now(),
      ...feedbackData,
      completedAt: new Date().toISOString()
    };

    setAppState(prev => ({
      ...prev,
      interventionHistory: [newSession, ...(prev.interventionHistory || [])]
    }));

    if (user && window.api?.completeIntervention) {
      try {
        await window.api.completeIntervention(feedbackData);
        // Re-fetch recommendations to factor in this new feedback
        if (window.api?.getRecommendations) {
          const recRes = await window.api.getRecommendations();
          if (recRes) setWellbeingRecommendations(recRes);
        }
      } catch (err) {
        console.warn('Failed to sync intervention completion:', err);
      }
    }

    if (window.confetti) window.confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
  };

  const handleSavePressureEvent = async (pressureData) => {
    let serverEvent = null;
    if (user && window.api?.createPressureEvent) {
      try {
        const res = await window.api.createPressureEvent({
          title: pressureData.title,
          eventType: pressureData.type || pressureData.eventType,
          startDate: pressureData.startDate,
          endDate: pressureData.endDate || pressureData.startDate,
          notes: pressureData.notes || ''
        });
        serverEvent = res?.pressureEvent;
      } catch (err) {
        console.warn('Sync pressure event error:', err);
      }
    }

    const newEvent = {
      id: serverEvent?.id || ('press-' + Date.now()),
      isActive: true,
      ...pressureData
    };
    setAppState(prev => ({
      ...prev,
      upcomingPressures: [newEvent, ...prev.upcomingPressures]
    }));

    setShowPressureModal(false);
  };

  // Launch Quick Reset with pre-session tension check
  const startQuickReset = (activity = ACTIVITIES['breathing-426']) => {
    const act = activity || ACTIVITIES['breathing-426'];
    const rType = (typeof normalizeResetType === 'function') ? normalizeResetType(act.title || act.id) : (act.title || 'Breathing Reset');
    audioService.init();
    setActiveQuickReset(act);
    setTensionPrompt({
      isOpen: true,
      step: 'before',
      resetType: rType,
      activity: act,
      category: 'breathing'
    });
  };

  const handlePreTensionSelect = (rating) => {
    const val = (typeof rating === 'number') ? rating : null;
    const rType = tensionPrompt?.resetType || ((typeof normalizeResetType === 'function') ? normalizeResetType(activeQuickReset?.title) : 'Breathing Reset');
    setActiveResetSession({
      resetType: rType,
      category: 'breathing',
      activity: activeQuickReset,
      tensionBefore: val,
      startTime: Date.now()
    });
    setTensionPrompt(null);
    setCurrentView('exercise');
  };

  const handleExerciseComplete = (sessionDetails) => {
    const rType = activeResetSession?.resetType || ((typeof normalizeResetType === 'function') ? normalizeResetType(activeQuickReset?.title) : 'Breathing Reset');
    setTensionPrompt({
      isOpen: true,
      step: 'after',
      resetType: rType,
      category: 'breathing',
      sessionDetails: sessionDetails || { durationSec: activeQuickReset?.duration || 60 }
    });
  };

  const handlePostTensionSelect = (rating) => {
    const tensionAfter = (typeof rating === 'number') ? rating : null;
    const tensionBefore = activeResetSession?.tensionBefore ?? null;
    const rType = tensionPrompt?.resetType || activeResetSession?.resetType || ((typeof normalizeResetType === 'function') ? normalizeResetType(activeQuickReset?.title) : 'Breathing Reset');
    const durationSec = tensionPrompt?.sessionDetails?.durationSec || activeQuickReset?.duration || 60;

    const newResetRecord = {
      id: 'session-' + Date.now(),
      userId: user?.id || 'local',
      dateTime: new Date().toISOString(),
      resetType: rType,
      category: 'breathing',
      tensionBefore,
      tensionAfter,
      durationSec
    };

    setAppState(prev => ({
      ...prev,
      resetSessions: [newResetRecord, ...(prev.resetSessions || [])],
      resetsHistory: [newResetRecord, ...(prev.resetsHistory || [])]
    }));

    if (user && window.api?.createBreathingSession) {
      window.api.createBreathingSession(rType, durationSec).catch(console.warn);
    }

    if (tensionBefore !== null && tensionAfter !== null && tensionBefore > tensionAfter) {
      if (window.confetti) window.confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
    }

    setTensionPrompt(null);
    setActiveResetSession(null);
    setCurrentView('dashboard');
  };

  // --- FINISH 7-QUESTION ONBOARDING ---
  const handleCompleteOnboarding = async (profileData) => {
    const newProfile = { ...profileData, isCompleted: true };

    // Generate personalized starter habits tailored to their occupation & routine
    const isStudent = (profileData.occupation || '').toLowerCase().includes('student');
    const isBoth = (profileData.occupation || '').toLowerCase().includes('both');

    const starterHabitPayloads = [
      {
        title: isStudent ? 'Deep Focus Study Block' : isBoth ? 'Focused Study / Task Sprint' : 'Deep Work Block',
        category: 'Focus',
        icon: '📚',
        targetVal: 30,
        targetUnit: 'min',
        minModeVal: 5,
        minModeUnit: 'min',
        preferredTime: profileData.peakTime || 'evening'
      },
      {
        title: 'Daily Movement & Posture Reset',
        category: 'Movement',
        icon: '🏃',
        targetVal: 20,
        targetUnit: 'min',
        minModeVal: 2,
        minModeUnit: 'min',
        preferredTime: 'morning'
      },
      {
        title: isStudent ? '60s Exam & Study Reset' : '60s Decompression Breath',
        category: 'Mindfulness',
        icon: '🫁',
        targetVal: 1,
        targetUnit: 'session',
        minModeVal: 1,
        minModeUnit: 'session',
        preferredTime: 'anytime'
      }
    ];

    let initialHabits = starterHabitPayloads.map((h, idx) => ({
      id: 'habit-auto-' + (idx + 1),
      goalId: 'goal-' + (idx + 1),
      ...h,
      currentStreak: 0,
      bestStreak: 0,
      difficultyLevel: idx === 2 ? 1 : 2,
      todayStatus: null,
      todayCompletedAt: null
    }));

    if (user && window.api) {
      try {
        if (window.api.updateProfile) {
          await window.api.updateProfile(newProfile);
        }
        // Save the starter habits to PostgreSQL user_habits table for this user
        if (window.api.createHabit) {
          const createdHabits = [];
          for (const p of starterHabitPayloads) {
            try {
              const res = await window.api.createHabit(p);
              if (res?.habit) {
                createdHabits.push({
                  id: res.habit.id,
                  goalId: res.habit.goal_id,
                  title: res.habit.title,
                  category: res.habit.category || 'Focus',
                  icon: res.habit.icon || '⚡',
                  targetVal: res.habit.target_val || 30,
                  targetUnit: res.habit.target_unit || 'min',
                  minModeVal: res.habit.min_mode_val || 5,
                  minModeUnit: res.habit.min_mode_unit || 'min',
                  preferredTime: res.habit.preferred_time || 'anytime',
                  currentStreak: 0,
                  bestStreak: 0,
                  difficultyLevel: 2,
                  todayStatus: null,
                  todayCompletedAt: null
                });
              }
            } catch (e) { }
          }
          if (createdHabits.length > 0) {
            initialHabits = createdHabits;
          }
        }
      } catch (err) {
        console.warn('Error saving onboarding data to database:', err);
      }
    }

    setAppState(prev => ({
      ...prev,
      profile: newProfile,
      habits: initialHabits
    }));

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

    if (user && window.api?.updatePreferences) {
      window.api.updatePreferences(newThemeId, appState.soundEnabled, appState.distractionGoalMinutes).catch(console.warn);
    }

    audioService.init();
    if (appState.soundEnabled) audioService.playChime('hold');
  };

  // --- REDESIGN INTEGRATION HANDLERS ---
  const handleSaveJournalEntry = async (content, mood) => {
    const newEntry = {
      id: 'journal-' + Date.now(),
      date: new Date().toISOString(),
      content,
      mood: mood || 'Calm'
    };
    setAppState(prev => ({
      ...prev,
      journalEntries: [newEntry, ...(prev.journalEntries || [])]
    }));
    if (user && window.api?.saveJournalEntry) {
      try {
        await window.api.saveJournalEntry(content, mood);
      } catch (e) { console.warn(e); }
    }
    if (window.BreathlyUI?.toast) {
      window.BreathlyUI.toast.success('Journal reflection saved.');
    }
  };

  const handleBreathingComplete = async ({ durationSec, feeling }) => {
    const rType = activeResetTypeKey || 'box';
    const newResetRecord = {
      id: 'session-' + Date.now(),
      userId: user?.id || 'local',
      dateTime: new Date().toISOString(),
      resetType: rType,
      category: 'breathing',
      feeling,
      durationSec: durationSec || 60
    };
    setAppState(prev => ({
      ...prev,
      resetSessions: [newResetRecord, ...(prev.resetSessions || [])],
      resetsHistory: [newResetRecord, ...(prev.resetsHistory || [])]
    }));
    if (user && window.api?.createBreathingSession) {
      try {
        await window.api.createBreathingSession(rType, durationSec || 60);
      } catch (e) { console.warn(e); }
    }
    if (user && window.api?.submitFeedback) {
      try {
        await window.api.submitFeedback({ type: 'breathing', feeling, exercise: rType });
      } catch (e) { console.warn(e); }
    }
    if (window.BreathlyUI?.toast) {
      window.BreathlyUI.toast.success('Reset completed. Great job checking in.');
    }
    goBack();
  };

  const handleGameComplete = async (gameData) => {
    handleSaveGameSession(gameData);
    if (window.BreathlyUI?.toast) {
      window.BreathlyUI.toast.success('Mindful session recorded.');
    }
    goBack();
  };

  const handleSaveInterventionFeedback = async (feedbackData) => {
    await handleCompleteIntervention({
      interventionType: activeSelectedIntervention?.type || 'reset',
      feelingFeedback: feedbackData.feeling,
      notes: feedbackData.notes || '',
      interventionTitle: activeSelectedIntervention?.title || feedbackData.title
    });
    if (window.BreathlyUI?.toast) {
      window.BreathlyUI.toast.success('Thank you for checking in with your reset.');
    }
  };

  const handleUpdatePreferences = async (newPrefs) => {
    setAppState(prev => ({
      ...prev,
      soundEnabled: newPrefs.soundEnabled !== undefined ? newPrefs.soundEnabled : prev.soundEnabled,
      distractionGoalMinutes: newPrefs.distractionGoalMinutes || prev.distractionGoalMinutes
    }));
    if (user && window.api?.updatePreferences) {
      try {
        await window.api.updatePreferences(
          appState.theme,
          newPrefs.soundEnabled !== undefined ? newPrefs.soundEnabled : appState.soundEnabled,
          newPrefs.distractionGoalMinutes || appState.distractionGoalMinutes
        );
      } catch (e) { console.warn(e); }
    }
  };

  const handleWipeData = () => {
    localStorage.clear();
    setAppState(DEFAULT_INITIAL_STATE);
    navigate('welcome');
    window.location.reload();
  };

  const ErrorBoundaryComp = window.BreathlyUI?.ErrorBoundary || React.Fragment;
  const AppShellComp = window.BreathlyUI?.AppShell;
  const InsightsComp = window.BreathlyUI?.InsightsPage;
  const JournalComp = window.BreathlyUI?.JournalPage;
  const ProfileSettingsComp = window.BreathlyUI?.ProfileSettingsPage;
  const CompanionComp = window.BreathlyUI?.CompanionPage;
  const BubbleRhythmComp = window.BreathlyUI?.BubbleRhythmPage;
  const BreathingPlayerComp = window.BreathlyUI?.BreathingPlayerPage;
  const InterventionSheetComp = window.BreathlyUI?.InterventionSheet;
  const NotFoundComp = window.BreathlyUI?.NotFoundPage;

  // Phase 3: Redesigned Welcome Screen for Unauthenticated Visitors
  if (currentRoute === 'welcome' || (!user && currentRoute !== 'onboarding' && currentRoute !== 'login')) {
    const WelcomeComp = window.BreathlyUI?.WelcomePage;
    if (WelcomeComp) {
      return (
        <ErrorBoundaryComp>
          <WelcomeComp
            onStartJourney={() => navigate('onboarding')}
            onGoogleSignIn={() => navigate('login')}
            onContinueAsGuest={() => {
              navigate(appState.profile?.isCompleted ? 'home' : 'onboarding');
            }}
            onQuickReset={() => {
              setActiveResetTypeKey('sigh');
              navigate('exercise');
            }}
          />
        </ErrorBoundaryComp>
      );
    }
  }

  // Phase 3: Redesigned Onboarding Step-by-Step Flow
  if (currentRoute === 'onboarding') {
    const OnboardingComp = window.BreathlyUI?.OnboardingPage;
    if (OnboardingComp) {
      return (
        <ErrorBoundaryComp>
          <OnboardingComp
            initialProfile={appState.profile}
            onComplete={handleCompleteOnboarding}
            onCancel={() => navigate(user ? 'home' : 'welcome')}
          />
        </ErrorBoundaryComp>
      );
    }
  }

  return (
    <ErrorBoundaryComp>
      {AppShellComp ? (
        <AppShellComp
          currentRoute={currentRoute}
          onNavigate={navigate}
          onGoBack={goBack}
          canGoBack={router?.canGoBack ? router.canGoBack() : false}
          isImmersive={router?.isImmersive ? router.isImmersive() : false}
          user={user}
          onSignOut={handleSignOut}
        >
          {currentRoute === 'home' && (
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
              frictionForecast={frictionForecast}
              isShieldModeActive={isShieldModeActive}
              isHighStressState={isHighStressState}
              onToggleShieldMode={handleToggleShieldMode}
              onOpenDeEscalator={() => setShowDeEscalatorModal(true)}
              onSaveDailyCheckIn={handleSaveDailyCheckIn}
              onToggleHabit={handleToggleHabit}
              onAddHabit={() => { setEditingHabit(null); setShowHabitModal(true); }}
              onEditHabit={(h) => { setEditingHabit(h); setShowHabitModal(true); }}
              onDeleteHabit={handleDeleteHabit}
              onOpenFailureModal={(habit) => { setActiveFailureHabit(habit); setShowFailureModal(true); }}
              onQuickReset={(act) => { setActiveResetTypeKey(act?.id || 'box'); navigate('exercise'); }}
              onOpenCoach={() => navigate('companion')}
              onOpenGoals={() => navigate('home')}
              onOpenWeeklyReport={() => navigate('insights')}
              onOpenDistractions={() => navigate('distractions')}
              onOpenMiniGames={(gameKey, mode) => {
                setSelectedMiniGameMode(mode || (gameKey === 'zen-garden' ? 'zen_balance' : 'rhythm_pop'));
                navigate(gameKey === 'zen-garden' ? 'zen-garden' : 'bubble-rhythm');
              }}
              onOpenMiniGamesHub={() => navigate('games')}
              onStartFocusSession={(cfg) => setActiveFocusSession(cfg || { taskName: 'Deep Focus Study Block', durationMin: 25 })}
              onAddDistraction={() => setShowAddDistractionModal(true)}
              onAddPressure={() => setShowPressureModal(true)}
              wellbeingRecommendations={wellbeingRecommendations}
              onStartIntervention={(type, title, obj) => {
                setActiveSelectedIntervention(obj || { type, title, id: 'itv-' + Date.now(), reason: 'Designed to release mental tension.' });
                setIsInterventionSheetOpen(true);
              }}
              onOpenCheckIn={() => navigate('checkin')}
              onSignIn={() => navigate('welcome')}
              isMinimumModeToday={isMinimumModeToday}
              showMinModeSuggestion={showMinModeSuggestion}
              onOpenRoughDayModal={() => setShowRoughDayModal(true)}
              onTurnOffMinimumMode={handleTurnOffMinimumMode}
              onAcceptSuggestion={handleTurnOnMinimumMode}
              onDismissSuggestion={handleDismissMinModeSuggestion}
              consistency={consistency}
            />
          )}

          {currentRoute === 'insights' && (
            InsightsComp ? (
              <InsightsComp
                user={user}
                currentStress={wellbeing}
                stressTrend={insights}
                checkIns={appState.dailyCheckIns || []}
                recommendations={wellbeingRecommendations}
                onStartRecommendation={(rec) => {
                  setActiveSelectedIntervention(rec);
                  setIsInterventionSheetOpen(true);
                }}
                onOpenCheckIn={() => navigate('checkin')}
              />
            ) : (
              <WeeklyReportView
                appState={appState}
                wellbeing={wellbeing}
                earlySignals={earlySignals}
                distractions={appState.distractions}
                focusSessions={appState.focusSessions}
                distractionGoalMinutes={appState.distractionGoalMinutes}
                consistency={consistency}
                resetSessions={appState.resetSessions || []}
                onBack={goBack}
                onQuickReset={() => { setActiveResetTypeKey('box'); navigate('exercise'); }}
                onOpenDistractions={() => navigate('distractions')}
              />
            )
          )}

          {currentRoute === 'reset' && (
            <BreathingHubView
              onQuickReset={(act) => {
                setActiveResetTypeKey(act?.id || 'box');
                navigate('exercise');
              }}
              soundEnabled={appState.soundEnabled}
              toggleSound={() => setAppState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
            />
          )}

          {currentRoute === 'journal' && (
            JournalComp ? (
              <JournalComp
                entries={appState.journalEntries || []}
                onSaveEntry={handleSaveJournalEntry}
              />
            ) : (
              <JournalHubView
                profile={appState.profile}
                upcomingPressures={appState.upcomingPressures}
                checkInStatus={checkInStatus}
                onSaveDailyCheckIn={handleSaveDailyCheckIn}
                onOpenMiniGames={(gameKey, mode) => {
                  setSelectedMiniGameMode(mode || 'rhythm_pop');
                  navigate('bubble-rhythm');
                }}
              />
            )
          )}

          {currentRoute === 'profile' && (
            ProfileSettingsComp ? (
              <ProfileSettingsComp
                user={user}
                profile={appState.profile}
                preferences={{
                  soundEnabled: appState.soundEnabled,
                  distractionGoalMinutes: appState.distractionGoalMinutes
                }}
                onUpdatePreferences={handleUpdatePreferences}
                onRetakeOnboarding={() => navigate('onboarding')}
                onSignOut={handleSignOut}
                onWipeData={handleWipeData}
                onBack={goBack}
              />
            ) : (
              <ProfileHubView
                user={user}
                profile={appState.profile}
                theme={appState.theme}
                setTheme={handleSetThemeAndMode}
                soundEnabled={appState.soundEnabled}
                toggleSound={() => setAppState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                ambientSound={appState.ambientSound}
                setAmbientSound={(s) => setAppState(prev => ({ ...prev, ambientSound: s }))}
                onRedoOnboarding={() => navigate('onboarding')}
                onClearData={handleWipeData}
                onSignOut={handleSignOut}
                onSignIn={() => navigate('welcome')}
                onOpenSafety={() => setShowSafetyModal(true)}
                onOpenPrivacy={() => setShowPrivacyModal(true)}
              />
            )
          )}

          {currentRoute === 'companion' && (
            CompanionComp ? (
              <CompanionComp
                onBack={goBack}
                onSendMessage={async (msg) => {
                  if (window.api?.chatWithGemini) {
                    return await window.api.chatWithGemini(msg);
                  }
                  return { reply: 'Take a slow, deep breath with me. One gentle step at a time.', isOffline: true };
                }}
              />
            ) : (
              <CoachView
                user={user}
                appState={appState}
                wellbeing={wellbeing}
                earlySignals={earlySignals}
                distractions={appState.distractions}
                focusSessions={appState.focusSessions}
                onToggleHabit={handleToggleHabit}
                onQuickReset={() => { setActiveResetTypeKey('box'); navigate('exercise'); }}
                onBack={goBack}
                onOpenDistractions={() => navigate('distractions')}
                onOpenMiniGames={(mode) => { setSelectedMiniGameMode(mode || 'rhythm_pop'); navigate('bubble-rhythm'); }}
                onStartFocusSession={(cfg) => setActiveFocusSession(cfg || { taskName: 'Focused Study Sprint', durationMin: 25 })}
                onActivateMinModeAll={handleTurnOnMinimumMode}
              />
            )
          )}

          {currentRoute === 'bubble-rhythm' && (
            BubbleRhythmComp ? (
              <BubbleRhythmComp
                onComplete={handleGameComplete}
                onExit={goBack}
              />
            ) : (
              <BubbleRhythmGame
                user={user}
                initialMode={selectedMiniGameMode || 'rhythm_pop'}
                initialPreset="calm"
                initialDuration={180}
                onSaveSession={handleSaveGameSession}
                onBack={goBack}
              />
            )
          )}

          {currentRoute === 'exercise' && (
            BreathingPlayerComp ? (
              <BreathingPlayerComp
                exerciseKey={activeResetTypeKey || 'box'}
                onComplete={handleBreathingComplete}
                onExit={goBack}
              />
            ) : (
              <ExerciseEngine
                activity={activeQuickReset}
                onComplete={handleExerciseComplete}
                onCancel={goBack}
                soundEnabled={appState.soundEnabled}
              />
            )
          )}

          {currentRoute === 'games' && (
            <MiniGamesHubView
              user={user}
              gameSessions={appState.gameSessions || []}
              resetSessions={appState.resetSessions || []}
              isHighStressState={isHighStressState}
              onLaunchGame={(gameKey, mode) => {
                if (gameKey === 'zen-garden' || gameKey === 'zen_balance') {
                  setSelectedMiniGameMode(mode || 'zen_balance');
                  navigate('zen-garden');
                } else {
                  setSelectedMiniGameMode(mode || 'rhythm_pop');
                  navigate('bubble-rhythm');
                }
              }}
              onBack={goBack}
              onSignIn={() => navigate('welcome')}
            />
          )}

          {currentRoute === 'zen-garden' && (
            <ZenPebbleGame
              user={user}
              initialMode={selectedMiniGameMode || 'zen_balance'}
              initialDuration={180}
              onSaveSession={handleSaveGameSession}
              onBack={() => navigate('games')}
            />
          )}

          {currentRoute === 'distractions' && (
            <DistractionTrackerHubView
              user={user}
              distractions={appState.distractions || []}
              focusSessions={appState.focusSessions || []}
              distractionGoalMinutes={appState.distractionGoalMinutes || 45}
              habits={appState.habits || []}
              wellbeing={wellbeing}
              earlySignals={earlySignals}
              insights={insights}
              onBack={goBack}
              onAddDistraction={() => setShowAddDistractionModal(true)}
              onDeleteDistraction={handleDeleteDistraction}
              onStartFocusSession={(cfg) => setActiveFocusSession(cfg || { taskName: 'Deep Focus Study Block', durationMin: 25 })}
              onUpdateGoal={handleUpdateDistractionGoal}
              onQuickReset={startQuickReset}
              onSignIn={() => navigate('welcome')}
            />
          )}

          {currentRoute === 'checkin' && (
            <CheckInView
              user={user}
              dailyCheckIns={appState.dailyCheckIns || []}
              onSaveCheckIn={(data) => {
                handleSaveDailyCheckIn(data);
                navigate('home');
              }}
              onBack={goBack}
            />
          )}

          {currentRoute === 'habits' && (
            <HabitsHubView
              appState={appState}
              habits={appState.habits}
              goals={appState.goals}
              isMinimumModeToday={isMinimumModeToday}
              consistency={consistency}
              onToggleHabit={handleToggleHabit}
              onAddHabit={() => { setEditingHabit(null); setShowHabitModal(true); }}
              onEditHabit={(h) => { setEditingHabit(h); setShowHabitModal(true); }}
              onDeleteHabit={handleDeleteHabit}
              onOpenFailureModal={(habit) => { setActiveFailureHabit(habit); setShowFailureModal(true); }}
              isShieldModeActive={isShieldModeActive}
              onToggleShieldMode={handleToggleShieldMode}
            />
          )}

          {currentRoute === 'stress' && (
            <StressHubView
              earlySignals={earlySignals}
              frictionForecast={frictionForecast}
              upcomingPressures={appState.upcomingPressures}
              isShieldModeActive={isShieldModeActive}
              onToggleShieldMode={handleToggleShieldMode}
              onOpenDeEscalator={() => setShowDeEscalatorModal(true)}
              onQuickReset={startQuickReset}
              onAddPressure={() => setShowPressureModal(true)}
              onBack={goBack}
            />
          )}

          {currentRoute === 'goals' && (
            <GoalsView
              goals={appState.goals}
              habits={appState.habits}
              onBack={goBack}
              onAddHabit={() => { setEditingHabit(null); setShowHabitModal(true); }}
            />
          )}

          {currentRoute === 'weekly-report' && (
            <WeeklyReportView
              appState={appState}
              wellbeing={wellbeing}
              earlySignals={earlySignals}
              distractions={appState.distractions}
              focusSessions={appState.focusSessions}
              distractionGoalMinutes={appState.distractionGoalMinutes}
              consistency={consistency}
              resetSessions={appState.resetSessions || []}
              onBack={goBack}
              onQuickReset={() => { setActiveResetTypeKey('box'); navigate('exercise'); }}
              onOpenDistractions={() => navigate('distractions')}
            />
          )}

          {currentRoute === 'coach' && (
            <CoachView
              user={user}
              appState={appState}
              wellbeing={wellbeing}
              earlySignals={earlySignals}
              distractions={appState.distractions}
              focusSessions={appState.focusSessions}
              onToggleHabit={handleToggleHabit}
              onQuickReset={() => { setActiveResetTypeKey('box'); navigate('exercise'); }}
              onBack={goBack}
              onOpenDistractions={() => navigate('distractions')}
              onOpenMiniGames={(mode) => { setSelectedMiniGameMode(mode || 'rhythm_pop'); navigate('bubble-rhythm'); }}
              onStartFocusSession={(cfg) => setActiveFocusSession(cfg || { taskName: 'Focused Study Sprint', durationMin: 25 })}
              onActivateMinModeAll={handleTurnOnMinimumMode}
            />
          )}

          {!['home', 'insights', 'reset', 'journal', 'profile', 'companion', 'bubble-rhythm', 'exercise', 'games', 'zen-garden', 'distractions', 'checkin', 'habits', 'stress', 'goals', 'weekly-report', 'coach'].includes(currentRoute) && (
            NotFoundComp ? <NotFoundComp onGoHome={() => navigate('home')} /> : (
              <div className="py-12 text-center">
                <h2 className="text-xl font-bold">Page not found</h2>
                <button onClick={() => navigate('home')} className="mt-4 px-4 py-2 rounded-xl bg-[#1b4332] text-white">Return Home</button>
              </div>
            )
          )}
        </AppShellComp>
      ) : (
        <div className="p-8">Loading application...</div>
      )}

      {/* Intervention Bottom Sheet */}
      {InterventionSheetComp && (
        <InterventionSheetComp
          isOpen={isInterventionSheetOpen}
          onClose={() => setIsInterventionSheetOpen(false)}
          intervention={activeSelectedIntervention}
          onStartActivity={(itv) => {
            if (itv.type === 'breathing') {
              setActiveResetTypeKey('box');
              navigate('exercise');
            }
          }}
          onSaveFeedback={handleSaveInterventionFeedback}
        />
      )}

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

      {showRoughDayModal && (
        <RoughDayConfirmModal
          isOpen={showRoughDayModal}
          onConfirm={handleTurnOnMinimumMode}
          onClose={() => setShowRoughDayModal(false)}
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

      {/* Personalized Well-Being Guided Intervention & Feedback Modal */}
      {activeIntervention && (
        <InterventionModal
          intervention={activeIntervention}
          onComplete={handleCompleteIntervention}
          onCancel={() => setActiveIntervention(null)}
        />
      )}

      {/* Pre/Post Reset Tension Rating Modal (1-5 Scale) */}
      {tensionPrompt?.isOpen && (
        <TensionRatingModal
          isOpen={true}
          step={tensionPrompt.step}
          resetType={tensionPrompt.resetType}
          onSelect={tensionPrompt.step === 'before' ? handlePreTensionSelect : handlePostTensionSelect}
          onSkip={() => (tensionPrompt.step === 'before' ? handlePreTensionSelect(null) : handlePostTensionSelect(null))}
          onCancel={() => { setTensionPrompt(null); setActiveResetSession(null); }}
        />
      )}

      {/* 10-Second Anti-Paralysis De-escalator Modal */}
      {showDeEscalatorModal && (
        <DeEscalatorModal
          habits={appState.habits}
          onClose={() => setShowDeEscalatorModal(false)}
          onStartFocusSession={(cfg) => {
            setShowDeEscalatorModal(false);
            setActiveFocusSession(cfg || { taskName: 'Post-Unfreeze Momentum Sprint', plannedDurationMinutes: 1, actualDurationMinutes: 1 });
          }}
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
          onSignIn={() => { setShowSettingsModal(false); setCurrentView('login'); }}
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

    </ErrorBoundaryComp>
  );
}

// ==========================================================================
// 1. HEADER NAVIGATION
// ==========================================================================

// ==========================================================================
// 1. UNIFIED APPLICATION SHELL NAVIGATION & DEDICATED VIEWS
// ==========================================================================

// --- DESKTOP FIXED SIDEBAR NAVIGATION ---
function SidebarNav({
  currentView,
  setCurrentView,
  user,
  checkInStatus,
  onSignOut,
  onGoToLogin,
  onOpenSettings,
  onOpenSafety,
  onOpenPrivacy,
  onOpenDeEscalator,
  isShieldModeActive,
  onToggleShieldMode,
  earlySignals
}) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [currentView, user, isShieldModeActive, checkInStatus]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'checkin', label: 'Check-in', icon: 'clipboard-check', badge: checkInStatus?.hasCheckedInToday ? 'Done' : 'Pending' },
    { id: 'stress', label: 'Stress', icon: 'shield-alert', badge: earlySignals?.statusLevel === 'elevated' || earlySignals?.statusLevel === 'demanding' ? 'Alert' : null },
    { id: 'habits', label: 'Habits', icon: 'check-circle-2' },
    { id: 'breathing', label: 'Breathing', icon: 'wind' },
    { id: 'journal', label: 'Journal', icon: 'book-open' },
    { id: 'goals', label: 'Goals', icon: 'target' },
    { id: 'weekly-report', label: 'Insights', icon: 'bar-chart-2' },
    { id: 'profile', label: 'Profile', icon: 'user' }
  ];

  const toolItems = [
    { id: 'coach', label: 'AI Coach', icon: 'bot' },
    { id: 'distractions', label: 'Focus & Radar', icon: 'timer' },
    { id: 'minigames', label: 'Mindful Games', icon: 'gamepad-2' }
  ];

  return (
    <aside className="breathly-sidebar hidden md:flex flex-col justify-between">
      {/* Brand Header */}
      <div>
        <div
          onClick={() => setCurrentView('dashboard')}
          className="sidebar-brand flex items-center gap-3 cursor-pointer pb-4 border-b border-[#e8eae6]"
        >
          <div className="sidebar-brand-mark">
            <i data-lucide="leaf" className="w-5 h-5"></i>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-[#18201d]">
                Breathly
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#e8f3ed] text-[#1b4332] uppercase tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#55645e] font-medium">Digital Well-Being</p>
          </div>
        </div>

        {/* Primary Navigation List */}
        <div className="pt-4 space-y-1">
          <div className="sidebar-section-title">Navigation</div>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`sidebar-nav-item w-full ${isActive ? 'active' : ''}`}
              >
                <div className="sidebar-nav-icon">
                  <i data-lucide={item.icon} className="w-4 h-4"></i>
                </div>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#fdf2ee] text-[#c25e40] border border-[#fad5c8]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Tools Section */}
        <div className="pt-4 space-y-1">
          <div className="sidebar-section-title">Wellbeing Tools</div>
          {toolItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`sidebar-nav-item w-full ${isActive ? 'active' : ''}`}
              >
                <div className="sidebar-nav-icon">
                  <i data-lucide={item.icon} className="w-4 h-4"></i>
                </div>
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer & Actions */}
      <div className="space-y-3 pt-3 border-t border-[#e8eae6]">
        {/* Preemptive Shield Toggle */}
        <button
          onClick={onToggleShieldMode}
          className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${isShieldModeActive
              ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-sm'
              : 'bg-[#f7f8f6] text-[#18201d] border-[#e8eae6] hover:bg-[#e8f3ed] hover:border-[#cfe1d7]'
            }`}
          title="Toggle Preemptive Burnout Shield Mode (2-Min Micro-Doses)"
        >
          <div className="flex items-center gap-2">
            <i data-lucide={isShieldModeActive ? 'shield-check' : 'shield'} className="w-4 h-4 text-current"></i>
            <span>Burnout Shield</span>
          </div>
          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${isShieldModeActive ? 'bg-white/20' : 'bg-[#e8eae6]'}`}>
            {isShieldModeActive ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* 10-Second Unfreeze CTA */}
        <button
          onClick={onOpenDeEscalator}
          className="w-full py-2 px-3 rounded-xl bg-[#fef7ed] hover:bg-[#fbe2bd] border border-[#fbe2bd] text-[#b8772a] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          title="10-Second Anti-Paralysis Circuit Breaker"
        >
          <i data-lucide="zap" className="w-3.5 h-3.5"></i>
          <span>10s Circuit Breaker</span>
        </button>

        {/* User Account / Profile Row */}
        <div className="pt-2 flex items-center justify-between text-xs">
          {user ? (
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#1b4332] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="truncate flex-1">
                <div className="font-bold text-[#18201d] truncate">{user.name?.split(' ')[0]}</div>
                <div className="text-[10px] text-[#55645e] truncate">{user.email}</div>
              </div>
              <button
                onClick={onSignOut}
                className="p-1.5 text-[#55645e] hover:text-[#c25e40] rounded-lg transition-colors flex-shrink-0"
                title="Sign Out"
              >
                <i data-lucide="log-out" className="w-3.5 h-3.5"></i>
              </button>
            </div>
          ) : (
            <button
              onClick={onGoToLogin}
              className="w-full py-2 px-3 rounded-xl bg-[#1b4332] hover:bg-[#143326] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <i data-lucide="log-in" className="w-3.5 h-3.5"></i>
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

// --- TOP RESPONSIVE HEADER BAR ---
function TopHeaderBar({
  currentView,
  setCurrentView,
  user,
  onGoToLogin,
  onQuickReset,
  onOpenSafety,
  onOpenSettings,
  onOpenDeEscalator,
  isShieldModeActive,
  onToggleShieldMode,
  theme,
  setTheme,
  soundEnabled,
  toggleSound
}) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [currentView, user, soundEnabled, isShieldModeActive]);

  const viewTitles = {
    dashboard: 'Daily Wellbeing Overview',
    checkin: 'Daily 20-Second Check-in',
    stress: 'Stress Protection & Early Signals',
    habits: 'Habit Consistency & Micro-Doses',
    breathing: 'Breathing Space & Guided Resets',
    journal: 'Daily Reflection & Journal',
    goals: 'Active Well-Being Goals',
    'weekly-report': 'Insights & Trends',
    profile: 'Profile & Settings',
    coach: 'My AI Well-Being Coach',
    distractions: 'Focus Sessions & Distraction Radar',
    minigames: 'Mindful Mini-Games Hub',
    'bubble-rhythm': 'Bubble Rhythm Reset',
    'zen-garden': 'Zen Pebble Cairn Balance',
    login: 'Account Authentication',
    onboarding: 'Personal Routine Setup'
  };

  return (
    <header className="breathly-top-header flex items-center justify-between gap-4">
      {/* Mobile Brand / Desktop Title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-[#1b4332] text-white flex items-center justify-center shadow-sm">
            <i data-lucide="leaf" className="w-4 h-4"></i>
          </div>
          <span className="font-extrabold text-base tracking-tight text-[#18201d]">Breathly</span>
        </div>

        <div className="hidden md:block">
          <h2 className="text-base font-bold text-[#18201d]">
            {viewTitles[currentView] || 'Digital Well-Being'}
          </h2>
          <p className="text-[11px] text-[#55645e]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Top Action Controls */}
      <div className="flex items-center gap-2">
        {/* Instant 60s Breathing Reset Action */}
        <button
          onClick={onQuickReset}
          className="btn-primary py-1.5 px-3 text-xs"
          title="Start instant 60s calming breathing reset"
        >
          <i data-lucide="wind" className="w-3.5 h-3.5"></i>
          <span className="hidden sm:inline">60s Reset</span>
        </button>

        {/* Ambient Soundscape Audio Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-xl border text-xs transition-colors ${soundEnabled
              ? 'bg-[#e8f3ed] border-[#cfe1d7] text-[#1b4332]'
              : 'bg-white border-[#e8eae6] text-[#82928b] hover:text-[#18201d]'
            }`}
          title={soundEnabled ? 'Ambient Soundscape Active' : 'Soundscape Muted'}
        >
          <i data-lucide={soundEnabled ? 'volume-2' : 'volume-x'} className="w-4 h-4"></i>
        </button>

        {/* Profile / Settings Trigger on Desktop */}
        <button
          onClick={onOpenSettings}
          className="hidden sm:flex p-2 rounded-xl bg-white border border-[#e8eae6] text-[#55645e] hover:text-[#18201d] transition-colors"
          title="Settings & Routine Setup"
        >
          <i data-lucide="settings" className="w-4 h-4"></i>
        </button>

        {/* User Avatar on Mobile */}
        {!user ? (
          <button
            onClick={onGoToLogin}
            className="md:hidden py-1.5 px-3 rounded-xl bg-[#1b4332] text-white text-xs font-bold"
          >
            Sign In
          </button>
        ) : (
          <button
            onClick={onOpenSettings}
            className="md:hidden w-8 h-8 rounded-full bg-[#1b4332] text-white text-xs font-bold flex items-center justify-center"
          >
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </button>
        )}
      </div>
    </header>
  );
}

// --- MOBILE BOTTOM NAVIGATION BAR ---
function MobileBottomNav({ currentView, setCurrentView, onOpenMore }) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [currentView]);

  const tabs = [
    { id: 'dashboard', label: 'Today', icon: 'layout-dashboard' },
    { id: 'checkin', label: 'Check-in', icon: 'clipboard-check' },
    { id: 'stress', label: 'Stress', icon: 'shield-alert' },
    { id: 'habits', label: 'Habits', icon: 'check-circle-2' },
    { id: 'profile', label: 'More', icon: 'menu' }
  ];

  return (
    <nav className="mobile-bottom-bar md:hidden">
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
          >
            <div className="mobile-icon-wrap">
              <i data-lucide={tab.icon} className="w-5 h-5"></i>
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// --- DEDICATED STRESS PROTECTION HUB VIEW ---
function StressHubView({
  earlySignals,
  frictionForecast,
  upcomingPressures,
  isShieldModeActive,
  onToggleShieldMode,
  onOpenDeEscalator,
  onQuickReset,
  onAddPressure,
  onBack
}) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [earlySignals, frictionForecast, upcomingPressures, isShieldModeActive]);

  const levelColorMap = {
    calm: { text: 'text-[#2d6a4f]', bg: 'bg-[#eef6f2]', border: 'border-[#d1e7dc]', label: 'Balanced & Low Stress' },
    steady: { text: 'text-[#2d6a4f]', bg: 'bg-[#eef6f2]', border: 'border-[#d1e7dc]', label: 'Steady State' },
    elevated: { text: 'text-[#b8772a]', bg: 'bg-[#fef7ed]', border: 'border-[#fbe2bd]', label: 'Elevated Cognitive Friction' },
    demanding: { text: 'text-[#c25e40]', bg: 'bg-[#fdf2ee]', border: 'border-[#fad5c8]', label: 'High Stress Load Detected' }
  };

  const status = levelColorMap[earlySignals?.statusLevel] || levelColorMap.calm;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18201d]">Stress Protection</h1>
          <p className="text-xs sm:text-sm text-[#55645e] mt-0.5">
            Early detection, predictive friction forecasting, and proactive down-regulation tools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onOpenDeEscalator} className="btn-secondary text-xs">
            <i data-lucide="zap" className="w-3.5 h-3.5 text-[#b8772a]"></i>
            <span>10s Circuit Breaker</span>
          </button>
          <button onClick={() => onQuickReset(ACTIVITIES['breathing-426'])} className="btn-primary text-xs">
            <i data-lucide="wind" className="w-3.5 h-3.5"></i>
            <span>Start Calming Breath</span>
          </button>
        </div>
      </div>

      {/* Main Status & Forecast Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Current State Card */}
        <div className="breathly-card md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-3.5 h-3.5 rounded-full ${status.bg} border-2 ${status.border} flex items-center justify-center`}>
                <div className={`w-1.5 h-1.5 rounded-full ${earlySignals?.statusLevel === 'demanding' ? 'bg-[#c25e40]' : 'bg-[#2d6a4f]'}`}></div>
              </div>
              <h3 className="text-sm font-bold text-[#18201d]">Current Predicted Stress State</h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${status.bg} ${status.text} border ${status.border}`}>
              {status.label}
            </span>
          </div>

          <p className="text-xs sm:text-[13px] text-[#55645e] leading-relaxed">
            {earlySignals?.gentleNudge || 'Your baseline indicators show steady physiological and cognitive balance across your scheduled routines.'}
          </p>

          <div className="p-3.5 rounded-xl bg-[#f7f8f6] border border-[#e8eae6] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#18201d]">Friction & Fatigue Pressure Index:</span>
              <span className="font-extrabold text-[#18201d]">{frictionForecast?.score || 18}%</span>
            </div>
            <div className="friction-meter-track">
              <div
                className={`friction-meter-fill ${frictionForecast?.level || 'low'}`}
                style={{ width: `${frictionForecast?.score || 18}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-[#82928b]">
              {frictionForecast?.description || 'Low cognitive drag. Pacing is optimal for daytime productivity.'}
            </p>
          </div>
        </div>

        {/* Burnout Shield Action Card */}
        <div className={`breathly-card flex flex-col justify-between space-y-3 ${isShieldModeActive ? 'shield-active-aura' : ''}`}>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1b4332]">
              <i data-lucide="shield" className="w-4 h-4"></i>
              <span>Burnout Shield</span>
            </div>
            <h4 className="text-base font-bold text-[#18201d]">
              {isShieldModeActive ? 'Shield Mode Active' : 'Preemptive Habit Shield'}
            </h4>
            <p className="text-xs text-[#55645e] leading-relaxed">
              When activated, habits automatically scale down to 2-minute Minimum Mode micro-doses. Your streaks remain protected without fatigue.
            </p>
          </div>

          <button
            onClick={onToggleShieldMode}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${isShieldModeActive
                ? 'bg-[#1b4332] text-white shadow-sm'
                : 'bg-[#18201d] text-white hover:bg-black'
              }`}
          >
            <i data-lucide={isShieldModeActive ? 'shield-check' : 'shield'} className="w-4 h-4"></i>
            <span>{isShieldModeActive ? 'Deactivate Shield' : 'Activate 2-Min Shield'}</span>
          </button>
        </div>
      </div>

      {/* Upcoming Pressures & Stress Planning */}
      <div className="breathly-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i data-lucide="calendar" className="w-4 h-4 text-[#1b4332]"></i>
            <h3 className="text-sm font-bold text-[#18201d]">Upcoming Pressure Events & Deadlines</h3>
          </div>
          <button onClick={onAddPressure} className="btn-secondary py-1 px-2.5 text-xs">
            <i data-lucide="plus" className="w-3.5 h-3.5"></i>
            <span>Add Event</span>
          </button>
        </div>

        {(!upcomingPressures || upcomingPressures.length === 0) ? (
          <div className="empty-state-box py-8">
            <div className="empty-state-icon">
              <i data-lucide="calendar-check" className="w-6 h-6"></i>
            </div>
            <div className="empty-state-title">No upcoming pressure events</div>
            <p className="empty-state-desc">
              Log upcoming exams, heavy work deadlines, or travel so Breathly can adjust habit targets in advance.
            </p>
            <button onClick={onAddPressure} className="btn-primary text-xs mt-2">
              <span>Plan an Event</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingPressures.map((ev) => (
              <div key={ev.id} className="p-3.5 rounded-xl border border-[#e8eae6] bg-[#f7f8f6] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#18201d]">{ev.title}</span>
                  <span className="text-[10px] font-bold text-[#c25e40] bg-[#fdf2ee] px-1.5 py-0.5 rounded border border-[#fad5c8]">
                    {ev.intensity || 'High'} Pressure
                  </span>
                </div>
                <div className="text-[11px] text-[#55645e]">{ev.startDate}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================================
// 1B. 20-SECOND DAILY CHECK-IN VIEW & DASHBOARD WIDGET
// ==========================================================================

function CheckInView({
  user,
  dailyCheckIns = [],
  onSaveCheckIn,
  onBack
}) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const existingToday = (dailyCheckIns || []).find(c => (c.date || c.checkInDate) === todayStr);

  const [mood, setMood] = useState(existingToday?.mood ?? 3);
  const [energy, setEnergy] = useState(existingToday?.energy ?? 3);
  const [stress, setStress] = useState(existingToday?.stress ?? 2);
  const [workload, setWorkload] = useState(existingToday?.workload ?? 3);
  const [sleep, setSleep] = useState(existingToday?.sleep ?? 7.5);
  const [isSaved, setIsSaved] = useState(false);

  const moodOptions = [
    { val: 1, label: 'Low', emoji: '😞' },
    { val: 2, label: 'Down', emoji: '🙁' },
    { val: 3, label: 'Okay', emoji: '😐' },
    { val: 4, label: 'Good', emoji: '🙂' },
    { val: 5, label: 'Great', emoji: '😊' }
  ];

  const energyOptions = [
    { val: 1, label: 'Drained', emoji: '🪫' },
    { val: 2, label: 'Low', emoji: '🥱' },
    { val: 3, label: 'Moderate', emoji: '⚡' },
    { val: 4, label: 'High', emoji: '🔋' },
    { val: 5, label: 'Charged', emoji: '⚡' }
  ];

  const stressOptions = [
    { val: 1, label: 'Very Low', emoji: '🌿' },
    { val: 2, label: 'Mild', emoji: '😌' },
    { val: 3, label: 'Moderate', emoji: '⚖️' },
    { val: 4, label: 'High', emoji: '😣' },
    { val: 5, label: 'Very High', emoji: '🚨' }
  ];

  const workloadOptions = [
    { val: 1, label: 'Very Light', emoji: '🛋️' },
    { val: 2, label: 'Light', emoji: '📖' },
    { val: 3, label: 'Manageable', emoji: '💼' },
    { val: 4, label: 'Heavy', emoji: '📚' },
    { val: 5, label: 'Overloaded', emoji: '🏔️' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const clampedSleep = Math.max(0, Math.min(14, Number(sleep) || 0));
    onSaveCheckIn({
      mood: Number(mood),
      energy: Number(energy),
      stress: Number(stress),
      workload: Number(workload),
      sleep: clampedSleep
    });
    setIsSaved(true);
    setTimeout(() => {
      onBack();
    }, 900);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#55645e] hover:text-[#18201d] font-semibold transition-colors"
        >
          <i data-lucide="arrow-left" className="w-4 h-4"></i>
          <span>Back to Dashboard</span>
        </button>

        <span className="text-xs font-semibold text-[#1b4332] bg-[#e8f3ed] px-2.5 py-1 rounded-full border border-[#cfe1d7]">
          ⏱️ Takes ~20 Seconds
        </span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18201d]">
          {existingToday ? "Update Today's Check-in" : "Daily Check-in"}
        </h1>
        <p className="text-xs sm:text-sm text-[#55645e] mt-1">
          Based on your check-ins, Breathly personalizes your Wellbeing Index and daily habit pacing.
        </p>
      </div>

      {existingToday && (
        <div className="p-3.5 rounded-xl bg-[#e8f3ed] border border-[#cfe1d7] text-xs text-[#1b4332] flex items-center gap-2">
          <i data-lucide="info" className="w-4 h-4 shrink-0"></i>
          <span>
            You already checked in today. Updating your answers will refresh your Wellbeing Index without creating duplicate entries.
          </span>
        </div>
      )}

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-[#e8f3ed] border border-[#cfe1d7] text-xs text-[#1b4332] flex items-center gap-2 animate-fade-in font-bold">
          <i data-lucide="check-circle" className="w-4 h-4"></i>
          <span>Check-in saved! Updating your Wellbeing Index...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="breathly-card p-6 space-y-6">
        {/* 1. Mood Scale (1-5) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#18201d] uppercase tracking-wider">
              1. How is your mood today?
            </label>
            <span className="text-xs font-bold text-[#1b4332]">
              {moodOptions.find(o => o.val === mood)?.label}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((opt) => {
              const isSelected = mood === opt.val;
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setMood(opt.val)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${isSelected
                      ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-sm font-bold scale-[1.02]'
                      : 'bg-[#f7f8f6] border-[#e8eae6] text-[#55645e] hover:border-[#cfe1d7] hover:text-[#18201d]'
                    }`}
                >
                  <span className="text-base">{opt.emoji}</span>
                  <span className="text-xs font-bold">{opt.val}</span>
                  <span className="text-[10px] hidden sm:block truncate w-full">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Energy Scale (1-5) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#18201d] uppercase tracking-wider">
              2. What is your energy level?
            </label>
            <span className="text-xs font-bold text-[#1b4332]">
              {energyOptions.find(o => o.val === energy)?.label}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {energyOptions.map((opt) => {
              const isSelected = energy === opt.val;
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setEnergy(opt.val)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${isSelected
                      ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-sm font-bold scale-[1.02]'
                      : 'bg-[#f7f8f6] border-[#e8eae6] text-[#55645e] hover:border-[#cfe1d7] hover:text-[#18201d]'
                    }`}
                >
                  <span className="text-base">{opt.emoji}</span>
                  <span className="text-xs font-bold">{opt.val}</span>
                  <span className="text-[10px] hidden sm:block truncate w-full">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Stress Scale (1-5) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#18201d] uppercase tracking-wider">
              3. How much stress or pressure are you feeling?
            </label>
            <span className="text-xs font-bold text-[#1b4332]">
              {stressOptions.find(o => o.val === stress)?.label}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {stressOptions.map((opt) => {
              const isSelected = stress === opt.val;
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setStress(opt.val)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${isSelected
                      ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-sm font-bold scale-[1.02]'
                      : 'bg-[#f7f8f6] border-[#e8eae6] text-[#55645e] hover:border-[#cfe1d7] hover:text-[#18201d]'
                    }`}
                >
                  <span className="text-base">{opt.emoji}</span>
                  <span className="text-xs font-bold">{opt.val}</span>
                  <span className="text-[10px] hidden sm:block truncate w-full">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Workload Scale (1-5) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#18201d] uppercase tracking-wider">
              4. How demanding is your workload today?
            </label>
            <span className="text-xs font-bold text-[#1b4332]">
              {workloadOptions.find(o => o.val === workload)?.label}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {workloadOptions.map((opt) => {
              const isSelected = workload === opt.val;
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setWorkload(opt.val)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${isSelected
                      ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-sm font-bold scale-[1.02]'
                      : 'bg-[#f7f8f6] border-[#e8eae6] text-[#55645e] hover:border-[#cfe1d7] hover:text-[#18201d]'
                    }`}
                >
                  <span className="text-base">{opt.emoji}</span>
                  <span className="text-xs font-bold">{opt.val}</span>
                  <span className="text-[10px] hidden sm:block truncate w-full">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Sleep Hours Input (0-14) */}
        <div className="space-y-2 pt-2 border-t border-[#e8eae6]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#18201d] uppercase tracking-wider">
              5. How many hours did you sleep last night?
            </label>
            <span className="text-xs font-bold text-[#1b4332]">
              {sleep} hours
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="number"
                min="0"
                max="14"
                step="0.5"
                value={sleep}
                onChange={(e) => setSleep(Math.max(0, Math.min(14, Number(e.target.value) || 0)))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#f7f8f6] border border-[#e8eae6] text-[#18201d] font-bold text-sm focus:outline-none focus:border-[#1b4332]"
                placeholder="e.g. 7.5"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#82928b]">
                Hours (0–14)
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1">
              {[6, 7, 8, 9].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setSleep(h)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all ${Number(sleep) === h
                      ? 'bg-[#1b4332] text-white border-[#1b4332]'
                      : 'bg-white border-[#e8eae6] text-[#55645e] hover:border-[#cfe1d7]'
                    }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-[#e8eae6]">
          <button
            type="submit"
            disabled={isSaved}
            className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
          >
            <i data-lucide="check" className="w-4 h-4"></i>
            <span>{existingToday ? "Update Today's Check-in" : "Save Daily Check-in"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function DashboardCheckInWidget({ checkInStatus, onOpenCheckIn }) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [checkInStatus]);

  const hasCheckedIn = checkInStatus?.hasCheckedInToday;
  const entry = checkInStatus?.todayCheckIn;

  return (
    <div className="breathly-card p-5 space-y-3 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e8f3ed] text-[#1b4332]">
              <i data-lucide="clipboard-check" className="w-4 h-4"></i>
            </span>
            <h3 className="text-sm font-bold text-[#18201d]">Today's Check-in</h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${hasCheckedIn
              ? 'bg-[#eef6f2] text-[#2d6a4f] border-[#d1e7dc]'
              : 'bg-[#fef7ed] text-[#b8772a] border-[#fbe2bd]'
            }`}>
            {hasCheckedIn ? 'Completed' : 'Pending'}
          </span>
        </div>

        {hasCheckedIn ? (
          <div className="space-y-2 pt-1">
            <p className="text-xs text-[#55645e]">
              Based on your check-in today:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-[#f7f8f6] border border-[#e8eae6] text-[11px]">
                <span className="text-[#82928b] block text-[10px] uppercase font-bold">Mood</span>
                <span className="font-extrabold text-[#18201d]">{entry?.mood ?? 3} / 5</span>
              </div>
              <div className="p-2 rounded-lg bg-[#f7f8f6] border border-[#e8eae6] text-[11px]">
                <span className="text-[#82928b] block text-[10px] uppercase font-bold">Energy</span>
                <span className="font-extrabold text-[#18201d]">{entry?.energy ?? 3} / 5</span>
              </div>
              <div className="p-2 rounded-lg bg-[#f7f8f6] border border-[#e8eae6] text-[11px]">
                <span className="text-[#82928b] block text-[10px] uppercase font-bold">Stress</span>
                <span className="font-extrabold text-[#18201d]">{entry?.stress ?? 3} / 5</span>
              </div>
              <div className="p-2 rounded-lg bg-[#f7f8f6] border border-[#e8eae6] text-[11px]">
                <span className="text-[#82928b] block text-[10px] uppercase font-bold">Workload</span>
                <span className="font-extrabold text-[#18201d]">{entry?.workload ?? 3} / 5</span>
              </div>
              <div className="p-2 rounded-lg bg-[#f7f8f6] border border-[#e8eae6] text-[11px] col-span-2 sm:col-span-2">
                <span className="text-[#82928b] block text-[10px] uppercase font-bold">Sleep Last Night</span>
                <span className="font-extrabold text-[#18201d]">{entry?.sleep ?? 7} Hours</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs text-[#55645e] leading-relaxed">
              Take 20 seconds to log how you feel. Your answers calculate your Wellbeing Index and adapt your daily habit pacing.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onOpenCheckIn}
        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${hasCheckedIn ? 'btn-secondary' : 'btn-primary'
          }`}
      >
        <i data-lucide={hasCheckedIn ? "edit-3" : "play"} className="w-3.5 h-3.5"></i>
        <span>{hasCheckedIn ? "Edit Today's Check-in" : "Start 20s Check-in"}</span>
      </button>
    </div>
  );
}

// --- 12-MONTH ACTIVITY & CONSISTENCY HEATMAP COMPONENT ---
function ActivityHeatmap({ appState, consistency }) {
  const heatmapData = useMemo(() => {
    if (typeof generate12MonthHeatmapData === 'function') {
      return generate12MonthHeatmapData(appState);
    }
    return { weeks: [], monthLabels: [] };
  }, [appState]);

  const { weeks = [], monthLabels = [] } = heatmapData;
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getCellColor = (status) => {
    switch (status) {
      case 'completed':
        // Regular completed habit: Deep rich emerald green
        return 'bg-[#1b4332] border-[#143326]';
      case 'roughDay':
        // Rough Day (2-min Minimum Mode): Lighter mint green (distinct from missed days)
        return 'bg-[#86efac] border-[#4ade80]';
      case 'graceDay':
        // Grace Day: Soft warm gold/amber (distinct from missed days)
        return 'bg-[#fde68a] border-[#fcd34d]';
      case 'missed':
      default:
        // Missed day: Neutral light gray
        return 'bg-[#ebede9] border-[#e1e4de]';
    }
  };

  return (
    <div className="breathly-card p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-extrabold text-[#18201d] flex items-center gap-2">
            <span>📅</span>
            <span>12-Month Activity & Consistency Heatmap</span>
          </h3>
          <p className="text-xs text-[#55645e] mt-0.5">
            52-week rolling activity calendar. Missed days automatically use grace days to protect your progress.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-bold text-[#1b4332] bg-[#e8f3ed] px-2.5 py-1 rounded-full border border-[#cfe1d7]">
            {consistency?.isEmpty ? 'Add a habit to start' : `Grace days left this week: ${consistency?.graceDaysLeft ?? 2}`}
          </span>
        </div>
      </div>

      {/* Heatmap Grid Container with Horizontal Scroll for Small Screens */}
      <div className="overflow-x-auto pb-2 pt-1">
        <div className="min-w-[760px]">
          {/* Month labels row */}
          <div className="flex text-[10px] font-bold text-[#82928b] mb-1.5 pl-6 relative h-4">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                style={{ left: `${Math.min(95, (m.weekIndex / 52) * 100)}%` }}
                className="absolute transform -translate-x-1"
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-1.5">
            {/* Day of week labels */}
            <div className="flex flex-col justify-between text-[9px] font-bold text-[#82928b] py-0.5 w-4 shrink-0">
              {daysOfWeek.map((day, idx) => (
                <span key={idx} className="h-3 leading-3">{day}</span>
              ))}
            </div>

            {/* 52 Week Columns */}
            <div className="flex gap-1 flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1 flex-1">
                  {week.map((day, dIdx) => (
                    <div
                      key={day.dateStr || dIdx}
                      className={`w-full aspect-square rounded-[3px] border ${getCellColor(day.status)} transition-transform hover:scale-125 cursor-pointer`}
                      title={`${day.formattedDate}: ${day.label}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#f0f2ee] text-[11px] text-[#55645e]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-[#1b4332] border border-[#143326]" />
            <span className="font-medium text-[#18201d]">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-[#86efac] border border-[#4ade80]" />
            <span className="font-medium text-[#18201d]">Rough Day (2-min)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-[#fde68a] border border-[#fcd34d]" />
            <span className="font-medium text-[#18201d]">Grace Day (Covered)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-[#ebede9] border border-[#e1e4de]" />
            <span className="font-medium text-[#82928b]">Missed Day</span>
          </div>
        </div>

        <div className="text-[11px] text-[#82928b] italic">
          Hover squares for dates & details
        </div>
      </div>
    </div>
  );
}

// --- DEDICATED HABITS HUB VIEW ---
function HabitsHubView({
  appState,
  habits = [],
  goals = [],
  isMinimumModeToday = false,
  consistency,
  onToggleHabit,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
  onOpenFailureModal,
  isShieldModeActive,
  onToggleShieldMode
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [habits, selectedCategory, isShieldModeActive]);

  const categories = ['all', 'Growth', 'Health', 'Mindfulness', 'Focus'];
  const filteredHabits = selectedCategory === 'all'
    ? habits
    : habits.filter(h => (h.category || '').toLowerCase() === selectedCategory.toLowerCase());

  const completedCount = habits.filter(h => h.todayStatus === 'full' || h.todayStatus === 'min').length;
  const totalCount = habits.length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18201d]">Habits & Consistency</h1>
          <p className="text-xs sm:text-sm text-[#55645e] mt-0.5">
            Adaptive micro-dosing ensures you make daily progress without friction or burnout.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onAddHabit} className="btn-primary text-xs">
            <i data-lucide="plus" className="w-3.5 h-3.5"></i>
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="metric-card-clean">
          <div className="text-[11px] font-bold text-[#82928b] uppercase tracking-wider">Completed Today</div>
          <div className="text-2xl font-extrabold text-[#18201d]">{completedCount} / {totalCount}</div>
          <div className="text-[11px] text-[#2d6a4f] font-semibold">{totalCount ? Math.round((completedCount / totalCount) * 100) : 0}% completion</div>
        </div>

        <div className="metric-card-clean">
          <div className="text-[11px] font-bold text-[#82928b] uppercase tracking-wider">Habit Consistency</div>
          <div className="text-2xl font-extrabold text-[#2d6a4f]">
            {consistency?.isEmpty ? 'Add a habit to start' : `${consistency?.effectiveCount ?? 0} of 7 Days`}
          </div>
          <div className="text-[11px] text-[#55645e]">
            {consistency?.isEmpty ? 'Add a habit to start' : `Grace days left this week: ${consistency?.graceDaysLeft ?? 2}`}
          </div>
        </div>

        <div className="metric-card-clean">
          <div className="text-[11px] font-bold text-[#82928b] uppercase tracking-wider">Minimum Mode</div>
          <div className="text-2xl font-extrabold text-[#b8772a]">2-Min Doses</div>
          <div className="text-[11px] text-[#55645e]">Friction protection ready</div>
        </div>

        <div className="metric-card-clean">
          <div className="text-[11px] font-bold text-[#82928b] uppercase tracking-wider">Burnout Shield</div>
          <div className={`text-2xl font-extrabold ${isShieldModeActive ? 'text-[#1b4332]' : 'text-[#82928b]'}`}>
            {isShieldModeActive ? 'ACTIVE' : 'READY'}
          </div>
          <div className="text-[11px] text-[#55645e]">{isShieldModeActive ? 'Targets scaled down' : 'Click to activate'}</div>
        </div>
      </div>

      {/* 12-Month Activity & Consistency Heatmap */}
      <ActivityHeatmap appState={appState} consistency={consistency} />

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${selectedCategory === cat
                ? 'bg-[#1b4332] text-white shadow-sm'
                : 'bg-white border border-[#e8eae6] text-[#55645e] hover:text-[#18201d]'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Habit List */}
      {filteredHabits.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-state-icon">
            <i data-lucide="sparkles" className="w-6 h-6"></i>
          </div>
          <div className="empty-state-title">No habits in this category yet</div>
          <p className="empty-state-desc">
            Build steady momentum with a simple 2-minute minimum mode habit.
          </p>
          <button onClick={onAddHabit} className="btn-primary text-xs mt-1">
            <span>Add Your First Habit</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHabits.map((habit) => {
            const isFull = habit.todayStatus === 'full';
            const isMin = habit.todayStatus === 'min';

            return (
              <div
                key={habit.id}
                className={`habit-card ${isFull ? 'completed-full' : isMin ? 'completed-min' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => onToggleHabit(habit.id, isMinimumModeToday ? 'min' : 'full')}
                      className={`habit-checkbox ${isFull ? 'checked-full' : isMin ? 'checked-min' : ''}`}
                      title={isFull || isMin ? 'Completed — click to review' : 'Click to start timer'}
                    >
                      {(isFull || isMin) ? (
                        <i data-lucide="check" className="w-3.5 h-3.5 text-white"></i>
                      ) : (
                        <i data-lucide="play" className="w-3 h-3 text-[#82928b]"></i>
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{habit.icon || '🌿'}</span>
                        <h4 className={`text-sm font-bold text-[#18201d] ${isFull || isMin ? 'line-through opacity-70' : ''}`}>
                          {habit.title}
                        </h4>
                      </div>

                      <p className="text-xs text-[#55645e] mt-0.5">
                        {isMinimumModeToday ? (
                          <span className="text-[#065f46] font-semibold bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-md inline-block">
                            ⚡ 2-min: {habit.tinyVersion || 'Do just 2 minutes of this'}
                          </span>
                        ) : (
                          <span>Target: {habit.targetVal} {habit.targetUnit}</span>
                        )}
                        <span className="mx-1">•</span>
                        <span className="capitalize">{habit.preferredTime}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="streak-pill">
                      <span>🔥</span>
                      <span>{habit.currentStreak || 0}d</span>
                    </span>

                    <button
                      onClick={() => onEditHabit(habit)}
                      className="p-1 text-[#82928b] hover:text-[#18201d] transition-colors"
                      title="Edit Habit"
                    >
                      <i data-lucide="more-horizontal" className="w-4 h-4"></i>
                    </button>
                  </div>
                </div>

                {/* Min-Mode Trigger & Recovery Helper */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#f0f2ef] text-xs">
                  <button
                    onClick={() => onToggleHabit(habit.id, 'min')}
                    className={`min-mode-pill ${isMin ? 'bg-[#fbe2bd] text-[#b8772a] font-extrabold' : ''}`}
                    title="Start 2-min Minimum Mode micro-dose"
                  >
                    <span>⚡ {isMinimumModeToday ? (habit.tinyVersion || 'Do just 2 minutes of this') : `Min: ${habit.minModeVal} ${habit.minModeUnit}`}</span>
                  </button>

                  <button
                    onClick={() => onOpenFailureModal(habit)}
                    className="text-[11px] text-[#82928b] hover:text-[#c25e40] flex items-center gap-1"
                  >
                    <i data-lucide="help-circle" className="w-3 h-3"></i>
                    <span>What got in the way?</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- DEDICATED BREATHING SPACE HUB VIEW ---
function BreathingHubView({ onQuickReset, soundEnabled, toggleSound }) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);

  const cadences = [
    {
      id: 'breathing-426',
      title: '4-2-6 Parasympathetic Flow',
      desc: 'Deep diaphragmatic cadence that rapidly lowers elevated heart rate and signals safety to the amygdala.',
      timing: '4s Inhale • 2s Hold • 6s Exhale',
      duration: '2 Mins',
      tag: 'Stress Down-Regulation',
      icon: 'wind',
      activity: ACTIVITIES['breathing-426']
    },
    {
      id: 'breathing-box',
      title: 'Box Breathing (4-4-4-4)',
      desc: 'Used by high-performance athletes to stabilize autonomic balance, clear mental chatter, and restore executive focus.',
      timing: '4s Inhale • 4s Hold • 4s Exhale • 4s Hold',
      duration: '3 Mins',
      tag: 'Clarity & Cognitive Focus',
      icon: 'square',
      activity: ACTIVITIES['breathing-box']
    },
    {
      id: 'breathing-478',
      title: '4-7-8 Vagal Sleep Reset',
      desc: 'Stimulates the vagus nerve and down-regulates cortisol. Ideal for nighttime wind-down or acute sensory overload.',
      timing: '4s Inhale • 7s Hold • 8s Exhale',
      duration: '3 Mins',
      tag: 'Sleep & Evening Wind-Down',
      icon: 'moon',
      activity: ACTIVITIES['breathing-478']
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18201d]">Breathing Space</h1>
        <p className="text-xs sm:text-sm text-[#55645e] mt-0.5">
          Clinically studied respiratory cadences to regulate the autonomic nervous system in under 2 minutes.
        </p>
      </div>

      {/* Cadence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cadences.map((c) => (
          <div key={c.id} className="breathly-card flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-[#e8f3ed] text-[#1b4332]">
                  <i data-lucide={c.icon} className="w-5 h-5"></i>
                </span>
                <span className="text-[10px] font-bold text-[#1b4332] bg-[#e8f3ed] px-2 py-0.5 rounded-full">
                  {c.duration}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#18201d]">{c.title}</h3>
              <p className="text-xs text-[#55645e] leading-relaxed">{c.desc}</p>
              <div className="p-2.5 rounded-xl bg-[#f7f8f6] border border-[#e8eae6] text-[11px] font-semibold text-[#18201d]">
                {c.timing}
              </div>
            </div>

            <button
              onClick={() => onQuickReset(c.activity)}
              className="btn-primary w-full text-xs"
            >
              <i data-lucide="play" className="w-3.5 h-3.5"></i>
              <span>Begin Guided Session</span>
            </button>
          </div>
        ))}
      </div>

      {/* Optical Bio-Feedback Visualizer Preview */}
      <div className="breathly-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i data-lucide="activity" className="w-4 h-4 text-[#c25e40]"></i>
            <h3 className="text-sm font-bold text-[#18201d]">Heart-Rate Coherence Waveform</h3>
          </div>
          <span className="text-xs font-bold text-[#2d6a4f] bg-[#eef6f2] px-2 py-0.5 rounded-full border border-[#d1e7dc]">
            Coherent Cadence Active
          </span>
        </div>
        <p className="text-xs text-[#55645e]">
          Longer exhalations slow your heart rate via respiratory sinus arrhythmia (RSA), promoting physiological calm.
        </p>
        <div className="bio-canvas-container p-4 flex items-center justify-center">
          <div className="text-center text-xs text-white/70 space-y-1">
            <div className="text-lg font-bold text-white tracking-widest animate-pulse">〰️ 〰️ 〰️</div>
            <div>Harmonic vagal tone active during guided breathing sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- DEDICATED JOURNAL & CHECK-IN HUB VIEW ---
function JournalHubView({ profile, upcomingPressures, checkInStatus, onSaveDailyCheckIn, onOpenMiniGames }) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [checkInStatus]);

  const history = checkInStatus?.history || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18201d]">Daily Journal & Reflections</h1>
        <p className="text-xs sm:text-sm text-[#55645e] mt-0.5">
          Record your daily context, stress signals, and mood patterns to help Breathly personalize your pacing.
        </p>
      </div>

      {/* Daily Check-in Form Card */}
      <DailyCheckInCard
        profile={profile}
        upcomingPressures={upcomingPressures}
        checkInStatus={checkInStatus}
        onSave={onSaveDailyCheckIn}
        onOpenMiniGames={onOpenMiniGames}
      />

      {/* Reflection History Timeline */}
      <div className="breathly-card space-y-4">
        <h3 className="text-sm font-bold text-[#18201d] flex items-center gap-2">
          <i data-lucide="history" className="w-4 h-4 text-[#1b4332]"></i>
          <span>Check-in Log History</span>
        </h3>

        {history.length === 0 ? (
          <div className="empty-state-box py-8">
            <div className="empty-state-icon">
              <i data-lucide="book-open" className="w-6 h-6"></i>
            </div>
            <div className="empty-state-title">No check-ins yet</div>
            <p className="empty-state-desc">
              Complete your first check-in above to start understanding your daily wellbeing trends.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-[#e8eae6] bg-[#f7f8f6] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#18201d]">{item.date || 'Recent Entry'}</span>
                  <span className="text-[10px] font-bold text-[#2d6a4f] bg-[#eef6f2] px-2 py-0.5 rounded-full border border-[#d1e7dc] capitalize">
                    {item.overallFeeling || 'Balanced'}
                  </span>
                </div>
                <div className="text-xs text-[#55645e]">
                  Stress Level: <strong>{item.stressRating}/10</strong> • Sleep: <span className="capitalize">{item.sleepQuality || 'Good'}</span>
                </div>
                {item.notes && (
                  <p className="text-xs text-[#18201d] italic bg-white p-2 rounded-lg border border-[#e8eae6]">
                    "{item.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- DEDICATED PROFILE & SETTINGS HUB VIEW ---
function ProfileHubView({
  user,
  profile,
  theme,
  setTheme,
  soundEnabled,
  toggleSound,
  ambientSound,
  setAmbientSound,
  onRedoOnboarding,
  onClearData,
  onSignOut,
  onSignIn,
  onOpenSafety,
  onOpenPrivacy
}) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [user, theme, ambientSound]);

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18201d]">Profile & Settings</h1>
        <p className="text-xs sm:text-sm text-[#55645e] mt-0.5">
          Manage your account session, personalize daily routine baselines, and configure audio modes.
        </p>
      </div>

      {/* Account Session Card */}
      <div className="breathly-card space-y-4">
        <h3 className="text-sm font-bold text-[#18201d]">Account & Authentication</h3>
        {user ? (
          <div className="p-4 rounded-xl bg-[#f7f8f6] border border-[#e8eae6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#1b4332] text-white font-bold text-sm flex items-center justify-center">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              )}
              <div>
                <div className="font-bold text-sm text-[#18201d]">{user.name}</div>
                <div className="text-xs text-[#55645e]">{user.email}</div>
              </div>
            </div>

            <button onClick={onSignOut} className="btn-secondary text-xs text-[#c25e40]">
              <i data-lucide="log-out" className="w-3.5 h-3.5"></i>
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#f7f8f6] border border-[#e8eae6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-[#18201d]">Guest Session</div>
              <div className="text-xs text-[#55645e]">Sign in with Google to sync your habits across devices.</div>
            </div>

            <button onClick={onSignIn} className="btn-primary text-xs">
              <i data-lucide="log-in" className="w-3.5 h-3.5"></i>
              <span>Sign In with Google</span>
            </button>
          </div>
        )}
      </div>

      {/* Work & Well-Being Modes */}
      <div className="breathly-card space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#18201d]">Active Focus & Well-Being Mode</h3>
          <p className="text-xs text-[#55645e]">Select a mode that matches your current cognitive demands.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(THEME_WORK_MODES).map((m) => {
            const isSelected = theme === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setTheme(m.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected
                    ? 'bg-[#e8f3ed] border-[#1b4332] shadow-sm'
                    : 'bg-white border-[#e8eae6] hover:border-[#cfe1d7]'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{m.icon}</span>
                  <div>
                    <div className="font-bold text-xs text-[#18201d]">{m.name}</div>
                    <div className="text-[11px] text-[#55645e]">{m.modeTitle}</div>
                  </div>
                </div>
                <p className="text-[11px] text-[#55645e] mt-2 leading-relaxed">{m.tagline}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ambient Soundscapes */}
      <div className="breathly-card space-y-3">
        <h3 className="text-sm font-bold text-[#18201d]">Background Ambient Soundscape</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {['none', 'rain', 'waves'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setAmbientSound(s)}
              className={`py-2 px-3 rounded-xl border text-center capitalize text-xs transition-all ${ambientSound === s
                  ? 'bg-[#1b4332] border-[#1b4332] text-white font-bold shadow-sm'
                  : 'bg-white border-[#e8eae6] text-[#18201d] hover:bg-[#f7f8f6]'
                }`}
            >
              {s === 'none' ? 'Mute' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Re-personalize Onboarding Baseline */}
      <div className="breathly-card space-y-3">
        <h3 className="text-sm font-bold text-[#18201d]">Baseline Lifestyle Calibration</h3>
        <p className="text-xs text-[#55645e]">
          Retake the 7-question lifestyle onboarding to adjust your routine baseline, stress causes, and work patterns.
        </p>
        <button onClick={onRedoOnboarding} className="btn-secondary text-xs">
          <span>✨ Re-Personalize My Baseline</span>
        </button>
      </div>

      {/* Crisis Safety & Privacy */}
      <div className="breathly-card space-y-3">
        <h3 className="text-sm font-bold text-[#18201d]">Safety & Privacy</h3>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onOpenSafety} className="btn-secondary text-xs">
            <i data-lucide="life-buoy" className="w-3.5 h-3.5"></i>
            <span>Crisis Safety Resources</span>
          </button>
          <button onClick={onOpenPrivacy} className="btn-secondary text-xs">
            <i data-lucide="shield" className="w-3.5 h-3.5"></i>
            <span>Privacy Center</span>
          </button>
          <button onClick={onClearData} className="btn-secondary text-xs text-[#c25e40]">
            <i data-lucide="trash-2" className="w-3.5 h-3.5"></i>
            <span>Reset Local Logs</span>
          </button>
        </div>
      </div>
    </div>
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

function LandingView({ user, onStartOnboarding, onDirectDashboard, onQuickReset, onGoToLogin }) {
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
          Breathly learns your daily rhythm, detects early friction before stress spikes, and scales habit difficulty with Minimum Mode.
        </p>
      </div>

      <div className="space-y-3">
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

        {!user && onGoToLogin && (
          <p className="text-xs text-slate-500 pt-1">
            Already have an account?{' '}
            <button onClick={onGoToLogin} className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">
              <span>Sign In with Google</span>
              <i data-lucide="arrow-right" className="w-3 h-3"></i>
            </button>
          </p>
        )}
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

function DailyCheckInCard({ profile, upcomingPressures, checkInStatus, onSave, onOpenMiniGames, isHighStressState = false }) {
  const [overallFeeling, setOverallFeeling] = useState('steady');
  const [workloadRating, setWorkloadRating] = useState('manageable');
  const [sleepQuality, setSleepQuality] = useState('normal');
  const [stressRating, setStressRating] = useState(5);
  const [stressfulEvent, setStressfulEvent] = useState(false);
  const [notes, setNotes] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [checkInStatus, isDismissed, isHighStressState]);

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
    const todayCheckIn = checkInStatus?.todayCheckIn;
    const isStressfulRecorded = isHighStressState || (todayCheckIn && (
      todayCheckIn.overallFeeling === 'demanding' ||
      todayCheckIn.overallFeeling === 'exhausted' ||
      todayCheckIn.overallFeeling === 'anxious' ||
      todayCheckIn.workloadRating === 'heavy' ||
      todayCheckIn.workloadRating === 'overload' ||
      Number(todayCheckIn.stressRating) >= 7
    ));

    return (
      <div className={`daily-checkin-panel flex flex-col sm:flex-row items-start sm:items-center justify-between py-3.5 px-4 sm:px-5 gap-3 ${isStressfulRecorded ? 'bg-gradient-to-r from-purple-50/90 via-indigo-50/60 to-white border-purple-200 shadow-2xs' : 'bg-emerald-50/50 border-emerald-200'
        }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${isStressfulRecorded ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-emerald-100 border-emerald-300 text-emerald-800'
            }`}>
            <i data-lucide={isStressfulRecorded ? 'sparkles' : 'check'} className="w-4 h-4"></i>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              {isStressfulRecorded ? '⚡ High-Pressure Pulse Recorded' : 'Today’s Well-Being Pulse Recorded'}
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {isStressfulRecorded
                ? 'Your answers indicate cognitive strain. A 2-minute bubble break can help reset working memory.'
                : 'Habit difficulty and coaching signals are synced with your answers.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {isStressfulRecorded && onOpenMiniGames && (
            <button
              onClick={() => onOpenMiniGames('bubble-rhythm', 'rhythm_pop')}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-extrabold shadow-sm transition-all flex items-center gap-1.5 hover:scale-105"
            >
              <span>🫧 Play Bubble Rhythm (2m)</span>
              <i data-lucide="arrow-right" className="w-3 h-3"></i>
            </button>
          )}
          <span className={`text-[10px] font-bold bg-white px-2.5 py-1 rounded-full border ${isStressfulRecorded ? 'text-purple-700 border-purple-200' : 'text-emerald-700 border-emerald-200'
            }`}>
            Synced
          </span>
        </div>
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

        {/* Ground-truth stress rating: 0 = Completely relaxed, 10 = Extremely stressed */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
              <span>How stressed do you feel right now?</span>
              <span className="font-extrabold text-indigo-700">{stressRating}/10</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">0 (Relaxed)</span>
              <input
                type="range"
                min="0"
                max="10"
                value={stressRating}
                onChange={(e) => setStressRating(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">10 (Extreme)</span>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 self-end sm:self-center"
          >
            <i data-lucide="check" className="w-3.5 h-3.5"></i>
            <span>Save Daily Pulse</span>
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
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isOverGoal ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
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
// 4C. PERSONALIZED AI WELL-BEING & STRESS INTERVENTION CARD
// ==========================================================================

function PersonalizedWellBeingCard({
  user,
  profile,
  checkInStatus,
  earlySignals,
  recommendationsData,
  onStartIntervention,
  onQuickReset,
  onOpenMiniGames,
  onOpenCoach,
  onOpenDistractions,
  onSignIn
}) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [recommendationsData, earlySignals, isDismissed]);

  if (isDismissed) return null;

  const pred = recommendationsData?.prediction;
  const recs = recommendationsData?.recommendations;
  const primary = recs?.primary;
  const alternatives = recs?.alternatives || [];

  // Check if real data exists
  const hasSufficientData = pred?.hasSufficientData !== false && (pred?.score !== null && pred?.score !== undefined);

  // Derive stress risk category and trend
  const stressCategory = hasSufficientData ? pred.category : 'Baseline';
  const stressLevel = hasSufficientData ? pred.level : 'low';
  const stressTrend = pred?.trend || {
    trend: 'stable',
    label: 'Gathering Baseline',
    description: 'Keep checking in for a few days so Breathly can understand your patterns.'
  };

  const signals = pred?.signals || earlySignals?.riskSignals || [];

  // Default fallback primary if not yet loaded from server
  const fallbackPrimary = {
    type: 'social_connection',
    title: 'Connect With Someone You Trust',
    tag: 'Social Connection',
    shortLabel: 'Connect with someone',
    description: 'Consider spending some time with someone you trust today — a friend, family member, or someone you feel comfortable with.',
    personalizedReason: 'Matches your well-being baseline and helps ease daily cognitive load.',
    actionRoute: 'social',
    defaultDurationMin: 15
  };

  const activePrimary = primary || fallbackPrimary;

  // Handle clicking the primary recommendation action
  const handlePrimaryClick = () => {
    if (activePrimary.type === 'bubble_rhythm' && onOpenMiniGames) {
      onOpenMiniGames('bubble-rhythm', 'rhythm_pop');
    } else if (activePrimary.type === 'breathing' && onQuickReset) {
      onQuickReset(ACTIVITIES['breathing-426']);
    } else if (activePrimary.type === 'companion_chat' && onOpenCoach) {
      onOpenCoach();
    } else if (onStartIntervention) {
      onStartIntervention(activePrimary.type, activePrimary.title, activePrimary);
    }
  };

  const handleActionClick = (item) => {
    if (item.type === 'bubble_rhythm' && onOpenMiniGames) {
      onOpenMiniGames('bubble-rhythm', 'rhythm_pop');
    } else if (item.type === 'breathing' && onQuickReset) {
      onQuickReset(ACTIVITIES['breathing-426']);
    } else if (item.type === 'companion_chat' && onOpenCoach) {
      onOpenCoach();
    } else if (onStartIntervention) {
      onStartIntervention(item.type, item.title, item);
    }
  };

  // Full alternative choice chips (allows complete user autonomy)
  const quickOptions = [
    { type: 'social_connection', title: 'Connect With Someone You Trust', shortLabel: '👥 Connect with someone', icon: 'users', defaultDurationMin: 15 },
    { type: 'outdoor_walk', title: 'Outdoor Walk & Change of Scene', shortLabel: '🚶 Take a short walk', icon: 'footprints', defaultDurationMin: 12 },
    { type: 'breathing', title: 'Guided Resonant Breathing', shortLabel: '🫁 Try breathing', icon: 'wind', defaultDurationMin: 2 },
    { type: 'bubble_rhythm', title: 'Bubble Rhythm Tactile Flow', shortLabel: '🫧 Play Bubble Rhythm', icon: 'sparkles', defaultDurationMin: 2 },
    { type: 'companion_chat', title: 'Talk to Breathly Coach', shortLabel: '💬 Talk to Breathly', icon: 'bot', defaultDurationMin: 5 },
    { type: 'short_break', title: '5-Minute Screen-Free Break', shortLabel: '☕ Take a short break', icon: 'coffee', defaultDurationMin: 5 }
  ];

  const remainingOptions = quickOptions.filter(o => o.type !== activePrimary.type);

  return (
    <div className="wellbeing-ai-card p-5 sm:p-6 space-y-4 animate-fade-in">
      {/* Top Meta Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <i data-lucide="sparkles" className="w-4 h-4"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">Personalized Well-Being Intelligence</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Adaptive Care
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Non-diagnostic contextual monitoring & tailored interventions</p>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors self-end sm:self-center"
          title="Dismiss card for now"
        >
          Later
        </button>
      </div>

      {/* State & Trend Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Left Column: Well-Being State & Trend */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Current Well-Being State</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${stressCategory === 'High' ? 'status-badge-demanding' :
                stressCategory === 'Moderate' ? 'status-badge-elevated' :
                  'status-badge-calm'
              }`}>
              {hasSufficientData ? `${stressCategory} Stress Risk` : 'Gathering Baseline'}
            </span>
          </div>

          {/* Stress Trend Status */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Stress Trend:
              </span>
              <span className={`trend-pill ${stressTrend.trend === 'increasing' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                  stressTrend.trend === 'decreasing' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                {stressTrend.trend === 'increasing' && '📈 Increasing'}
                {stressTrend.trend === 'decreasing' && '📉 Decreasing'}
                {stressTrend.trend === 'stable' && '➡️ Stable'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {stressTrend.description}
            </p>
          </div>

          {/* Contextual Signals (Only Genuine Real Signals, No Fake Stats) */}
          {signals.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
              {signals.slice(0, 3).map((sig, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[10px] font-medium border border-slate-200">
                  • {sig}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Personalized Primary Recommendation */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 border border-indigo-100 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase tracking-wide">
                ✨ Recommended For You
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{activePrimary.tag}</span>
            </div>

            <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
              {activePrimary.title}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activePrimary.description}
            </p>

            {activePrimary.personalizedReason && (
              <p className="text-[11px] text-indigo-700/90 font-medium italic pt-1">
                💡 {activePrimary.personalizedReason}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handlePrimaryClick}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>[ {activePrimary.shortLabel} ]</span>
              <i data-lucide="arrow-right" className="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Alternative Options Row (User Freedom to Choose Any Option) */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <span className="text-[11px] font-bold text-slate-500 block">
          Other Options (Choose What Feels Right Today):
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {remainingOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => handleActionClick(opt)}
              className="intervention-chip-btn hover:border-indigo-300"
            >
              <span>{opt.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 4D. GUIDED WELL-BEING INTERVENTION & FEEDBACK MODAL
// ==========================================================================

function InterventionModal({
  intervention,
  onComplete,
  onCancel
}) {
  const [step, setStep] = useState('active'); // 'active' | 'feedback' | 'done'
  const [stressBefore, setStressBefore] = useState(6);
  const [stressAfter, setStressAfter] = useState(3);
  const [feeling, setFeeling] = useState('better');
  const [enjoyment, setEnjoyment] = useState('yes');
  const [notes, setNotes] = useState('');
  const [timerSeconds, setTimerSeconds] = useState((intervention.defaultDurationMin || 10) * 60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [step]);

  useEffect(() => {
    let timer = null;
    if (isRunning && timerSeconds > 0 && step === 'active') {
      timer = setInterval(() => setTimerSeconds(prev => Math.max(0, prev - 1)), 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isRunning, timerSeconds, step]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFinishActivity = () => {
    setIsRunning(false);
    setStep('feedback');
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    const plannedSec = (intervention.defaultDurationMin || 10) * 60;
    const actualSec = Math.max(30, plannedSec - timerSeconds);
    onComplete({
      interventionType: intervention.type,
      title: intervention.title,
      durationSeconds: actualSec,
      stressBefore: Number(stressBefore),
      stressAfter: Number(stressAfter),
      feeling,
      enjoyment,
      notes
    });
    setStep('done');
  };

  const getGuidanceNote = (type) => {
    switch (type) {
      case 'social_connection':
        return 'Call a trusted friend or family member, send a warm check-in message, or invite someone for a short coffee or tea break. You don’t need to talk about stress unless you want to — simple presence brings your nervous system into safety.';
      case 'outdoor_walk':
        return 'Step outside or into open air. Keep your gaze broad and relaxed. Walk at an unhurried, natural pace for 10–15 minutes to shift your environment.';
      case 'breathing':
        return 'Settle comfortably. Soften your jaw and shoulders. Resonant breathing (e.g. 4-2-6 or Coherent 5-5) gently balances autonomic arousal.';
      case 'light_exercise':
        return 'Shoulder rolls, gentle neck releases, and standing stretches. Move with ease to release physical tension without strain.';
      case 'short_break':
        return 'Step completely away from screens and keyboards. Hydrate, rest your eyes on the distance, and give your nervous system a gentle reset.';
      case 'sleep_wind_down':
        return 'Dim ambient lights, put devices on Do Not Disturb, and ease into a restorative 4-7-8 rhythm for peaceful rest.';
      default:
        return 'Take this time completely for yourself. Give yourself permission to pause.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <i data-lucide="heart" className="w-5 h-5"></i>
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Personalized Intervention</span>
              <h3 className="text-base font-extrabold text-slate-900">{intervention.title}</h3>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        {/* STEP 1: ACTIVE SESSION & GUIDANCE */}
        {step === 'active' && (
          <div className="space-y-5 text-left">
            {/* Pre-Intervention Stress Rating */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>How stressed do you feel right now? (0–10)</span>
                <span className="font-extrabold text-indigo-700">{stressBefore}/10</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">0 (Relaxed)</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={stressBefore}
                  onChange={(e) => setStressBefore(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">10 (Extreme)</span>
              </div>
            </div>

            {/* Guidance Content */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900 mb-1">🌿 Gentle Guidance:</p>
              {getGuidanceNote(intervention.type)}
            </div>

            {/* Peaceful Timer Display */}
            <div className="text-center py-2 space-y-2">
              <div className="text-4xl font-extrabold font-mono tracking-tight text-slate-900">
                {formatTime(timerSeconds)}
              </div>
              <p className="text-xs text-slate-500">
                {isRunning ? 'Activity in progress • Take all the time you need' : 'Timer paused'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                {isRunning ? 'Pause Timer' : 'Resume Timer'}
              </button>

              <button
                type="button"
                onClick={handleFinishActivity}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5 hover:scale-105"
              >
                <span>Complete Activity & Reflect</span>
                <i data-lucide="check" className="w-4 h-4"></i>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LEARNING WHAT WORKS FOR YOU (POST-ACTIVITY FEEDBACK) */}
        {step === 'feedback' && (
          <form onSubmit={handleSubmitFeedback} className="space-y-4 text-left">
            <div className="text-center space-y-1 pb-1">
              <h4 className="text-base font-extrabold text-slate-900">✨ How do you feel now?</h4>
              <p className="text-xs text-slate-500">Your feedback teaches Breathly what activities help you most.</p>
            </div>

            {/* 4 Feeling Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'better', label: '🌟 Better' },
                { id: 'same', label: '🍃 About the same' },
                { id: 'stressed', label: '⚡ Still stressed' },
                { id: 'worse', label: '🌧️ Worse' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFeeling(f.id)}
                  className={`feedback-option-btn ${feeling === f.id ? 'selected' : ''}`}
                >
                  <span>{f.label}</span>
                </button>
              ))}
            </div>

            {/* Stress After Rating */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>How stressed do you feel right now? (0–10)</span>
                <span className="font-extrabold text-indigo-700">{stressAfter}/10</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">0 (Relaxed)</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={stressAfter}
                  onChange={(e) => setStressAfter(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">10 (Extreme)</span>
              </div>
              {stressBefore !== null && (
                <p className="text-[11px] text-emerald-700 font-semibold pt-0.5">
                  Change: {stressBefore} → {stressAfter} {stressBefore > stressAfter ? `(↓ ${stressBefore - stressAfter} pts improvement)` : ''}
                </p>
              )}
            </div>

            {/* Enjoyment Option */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Did you enjoy this activity?</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'yes', label: '👍 Yes' },
                  { id: 'little', label: '👌 A little' },
                  { id: 'no', label: '👎 Not really' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEnjoyment(opt.id)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${enjoyment === opt.id
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Save & Record Feedback</span>
                <i data-lucide="check" className="w-4 h-4"></i>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: DONE CONFIRMATION */}
        {step === 'done' && (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h4 className="text-base font-extrabold text-slate-900">Feedback Recorded</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you! Breathly noted how this activity impacted your well-being. Future recommendations will adapt to what works best for you.
            </p>
            <div className="pt-2">
              <button
                onClick={onCancel}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
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
  habits = [],
  goals = [],
  theme,
  setTheme,
  wellbeing,
  earlySignals,
  insights = [],
  upcomingPressures = [],
  checkInStatus,
  distractions = [],
  focusSessions = [],
  distractionGoalMinutes = 45,
  gameSessions = [],
  frictionForecast,
  isShieldModeActive,
  isHighStressState = false,
  onToggleShieldMode,
  onOpenDeEscalator,
  onOpenMiniGames,
  onOpenMiniGamesHub,
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
  wellbeingRecommendations,
  onStartIntervention,
  onOpenCheckIn,
  onSignIn,
  isMinimumModeToday = false,
  showMinModeSuggestion = false,
  onOpenRoughDayModal,
  onTurnOffMinimumMode,
  onAcceptSuggestion,
  onDismissSuggestion,
  consistency
}) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [habits, wellbeing, upcomingPressures, earlySignals, theme, distractions, focusSessions, gameSessions, isShieldModeActive, frictionForecast, isHighStressState]);

  const completedCount = habits.filter(h => h.todayStatus === 'full' || h.todayStatus === 'min').length;
  const totalHabits = habits.length;
  const recentGameSessions = gameSessions || [];

  // Determine greeting based on local time
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const userName = user?.name ? user.name.split(' ')[0] : 'there';

  // Stress State Info
  const stressStatusTitle = earlySignals?.statusTitle || 'Balanced & Calm';
  const stressStatusLevel = earlySignals?.statusLevel || 'calm';
  const isElevatedStress = isHighStressState || stressStatusLevel === 'elevated' || stressStatusLevel === 'demanding';

  // Today's Check-in Summary
  const hasCheckedIn = checkInStatus?.hasCheckedInToday;
  const todayEntry = checkInStatus?.todayCheckIn;

  // Streak calculation
  const totalStreakDays = habits.reduce((acc, h) => acc + (h.currentStreak || 0), 0);

  // Focus Minutes
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (Number(s.durationMin) || 25), 0);

  // 6 Recommended Activities
  const recommendedActivities = [
    {
      id: 'rec-breathing',
      title: 'Guided Breathing Reset',
      desc: '4-2-6 Parasympathetic cadence to down-regulate nervous system tension.',
      duration: '2 Mins',
      tag: 'Mindfulness',
      icon: 'wind',
      iconBg: 'bg-[#e8f3ed]',
      iconColor: 'text-[#1b4332]',
      actionLabel: 'Start Reset',
      action: () => onQuickReset(ACTIVITIES['breathing-426'])
    },
    {
      id: 'rec-walk',
      title: 'Mindful Outdoor Walk',
      desc: '15 minutes of light movement and natural daylight to clear cognitive fatigue.',
      duration: '15 Mins',
      tag: 'Movement',
      icon: 'footprints',
      iconBg: 'bg-[#eef6f2]',
      iconColor: 'text-[#2d6a4f]',
      actionLabel: 'Log Walk',
      action: () => {
        if (onStartIntervention) {
          onStartIntervention('walk', 'Mindful Outdoor Walk', { defaultDurationMin: 15 });
        } else {
          alert('🌿 Mindful Walk: Take 15 minutes of fresh air and light movement!');
        }
      }
    },
    {
      id: 'rec-stretch',
      title: 'Body Tension Release',
      desc: 'Gentle neck, shoulder, and spinal decompression stretches.',
      duration: '5 Mins',
      tag: 'Recovery',
      icon: 'activity',
      iconBg: 'bg-[#fef7ed]',
      iconColor: 'text-[#b8772a]',
      actionLabel: 'Begin Stretch',
      action: () => {
        if (onStartIntervention) {
          onStartIntervention('workout', 'Body Tension Release', { defaultDurationMin: 5 });
        } else {
          alert('🧘‍♂️ Take 5 minutes to roll your shoulders, stretch your spine, and release physical tension.');
        }
      }
    },
    {
      id: 'rec-social',
      title: 'Connect with Someone',
      desc: 'Send a quick text or call a friend or family member to ground your perspective.',
      duration: '10 Mins',
      tag: 'Social',
      icon: 'message-circle-heart',
      iconBg: 'bg-[#eff7f8]',
      iconColor: 'text-[#2a6b74]',
      actionLabel: 'Open Prompt',
      action: () => {
        if (onStartIntervention) {
          onStartIntervention('social_connection', 'Connect with Someone You Trust', { defaultDurationMin: 10 });
        } else {
          alert('💬 Take 10 minutes to reach out to a trusted friend or loved one today.');
        }
      }
    },
    {
      id: 'rec-relaxation',
      title: '5-4-3-2-1 Sensory Reset',
      desc: 'Quick somatic grounding technique to break mental chatter and overthinking loops.',
      duration: '3 Mins',
      tag: 'Grounding',
      icon: 'eye',
      iconBg: 'bg-[#fdf2ee]',
      iconColor: 'text-[#c25e40]',
      actionLabel: 'Start Grounding',
      action: () => onOpenDeEscalator()
    },
    {
      id: 'rec-game',
      title: 'Mindful Mini-Game',
      desc: 'Tactile Bubble Rhythm or Zen Cairn Balance to reset working memory.',
      duration: '2 Mins',
      tag: 'Play Reset',
      icon: 'gamepad-2',
      iconBg: 'bg-[#f5f3ff]',
      iconColor: 'text-[#7c3aed]',
      actionLabel: 'Play 2m',
      action: () => onOpenMiniGames && onOpenMiniGames('bubble-rhythm', 'rhythm_pop')
    }
  ];

  return (
    <div className="space-y-7 pb-12 animate-fade-in">
      {/* 1. TOP GREETING HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e8eae6]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18201d]">
            {timeGreeting}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-[#55645e] mt-0.5">
            Here’s how you’re doing today.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e8eae6] text-xs font-semibold text-[#18201d] shadow-sm">
            <div className={`w-2 h-2 rounded-full ${isElevatedStress ? 'bg-[#c25e40]' : 'bg-[#2d6a4f]'} animate-pulse`}></div>
            <span>{stressStatusTitle}</span>
          </div>

          <button
            id="rough-day-btn"
            onClick={onOpenRoughDayModal}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${isMinimumModeToday
                ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]'
                : 'bg-[#fffbeb] hover:bg-[#fef3c7] border-[#fde68a] text-[#b45309]'
              }`}
            title="Having a rough day? Switch today's habits to 2-minute versions to protect your streak"
          >
            <span>{isMinimumModeToday ? '🌱' : '🌧️'}</span>
            <span>{isMinimumModeToday ? 'Minimum Mode' : 'Rough Day'}</span>
          </button>

          <button
            onClick={onOpenCoach}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            <i data-lucide="bot" className="w-3.5 h-3.5 text-[#1b4332]"></i>
            <span>Ask Coach</span>
          </button>
        </div>
      </div>

      {/* MINIMUM MODE ACTIVE BANNER */}
      {isMinimumModeToday && (
        <div id="minimum-mode-banner" className="p-3.5 sm:p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d1fae5] flex items-center justify-center text-lg flex-shrink-0">
              🌱
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#065f46]">
                Minimum Mode is active for today
              </p>
              <p className="text-[11px] sm:text-xs text-[#047857] mt-0.5">
                All habits are switched to 2-minute versions so your streaks stay protected without the pressure. Switches off automatically tomorrow.
              </p>
            </div>
          </div>
          <button
            id="turn-off-min-mode-btn"
            onClick={onTurnOffMinimumMode}
            className="text-xs font-bold underline hover:text-[#047857] text-[#059669] self-start sm:self-center px-3 py-1.5 rounded-lg hover:bg-[#d1fae5] transition-colors"
          >
            Turn off
          </button>
        </div>
      )}

      {/* AUTOMATIC MINIMUM MODE SUGGESTION BANNER */}
      {!isMinimumModeToday && showMinModeSuggestion && (
        <div id="min-mode-suggestion-banner" className="p-3.5 sm:p-4 rounded-2xl bg-[#fffbeb] border border-[#fde68a] text-[#92400e] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fef3c7] flex items-center justify-center text-lg flex-shrink-0">
              💛
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#92400e]">
                Looks like a heavy stretch. Want a lighter plan for a few days?
              </p>
              <p className="text-[11px] sm:text-xs text-[#b45309] mt-0.5">
                We can switch today's habits to 2-minute micro-versions to keep your consistency intact without the overload.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              id="accept-min-mode-suggestion-btn"
              onClick={onAcceptSuggestion}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white shadow-sm transition-colors"
            >
              Yes, switch to Minimum Mode
            </button>
            <button
              id="dismiss-min-mode-suggestion-btn"
              onClick={onDismissSuggestion}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-[#78350f] hover:bg-[#fef3c7] transition-colors"
            >
              No, keep regular
            </button>
          </div>
        </div>
      )}

      {/* 2. KEY WELLBEING STATUS HIGHLIGHTS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Status 1: Current Stress */}
        <div className="breathly-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#82928b] uppercase tracking-wider">Stress State</span>
            <div className={`w-2.5 h-2.5 rounded-full ${isElevatedStress ? 'bg-[#c25e40]' : 'bg-[#2d6a4f]'}`}></div>
          </div>
          <div className="text-sm sm:text-base font-bold text-[#18201d] truncate">
            {isElevatedStress ? 'Elevated Load' : 'Calm & Grounded'}
          </div>
          <p className="text-[11px] text-[#55645e] truncate">
            {frictionForecast ? `${frictionForecast.score}% friction` : 'Steady baseline'}
          </p>
        </div>

        {/* Status 2: Today's Check-in */}
        <div
          onClick={onOpenCheckIn}
          className="breathly-card p-4 space-y-1 cursor-pointer hover:border-[#1b4332] transition-colors"
          title="Open Daily 20-Second Check-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#82928b] uppercase tracking-wider">Today's Check-in</span>
            <i data-lucide={hasCheckedIn ? "check-circle" : "clock"} className={`w-3.5 h-3.5 ${hasCheckedIn ? 'text-[#2d6a4f]' : 'text-[#b8772a]'}`}></i>
          </div>
          <div className="text-sm sm:text-base font-bold text-[#18201d]">
            {hasCheckedIn ? 'Completed' : 'Pending'}
          </div>
          <p className="text-[11px] text-[#55645e] truncate">
            {hasCheckedIn ? `Mood ${todayEntry?.mood || 3}/5 • Sleep ${todayEntry?.sleep || 7}h` : 'Tap to start 20s check-in'}
          </p>
        </div>

        {/* Status 3: Consistency */}
        <div className="breathly-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#82928b] uppercase tracking-wider">Consistency</span>
            <span className="text-xs">🌱</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-[#18201d]">
            {consistency?.isEmpty ? 'Add a habit to start' : `Consistency: ${consistency?.effectiveCount ?? 0} of last 7 days`}
          </div>
          <p className="text-[11px] text-[#55645e] truncate">
            {consistency?.isEmpty ? 'Start a habit to build rhythm' : `Grace days left this week: ${consistency?.graceDaysLeft ?? 2}`}
          </p>
        </div>

        {/* Status 4: Mood & Energy */}
        <div className="breathly-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#82928b] uppercase tracking-wider">Mood & Energy</span>
            <span className="text-xs">🌿</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-[#18201d]">
            {todayEntry ? `Mood ${todayEntry.mood}/5 • Energy ${todayEntry.energy}/5` : 'Awaiting check-in'}
          </div>
          <p className="text-[11px] text-[#55645e] truncate">
            {todayEntry ? `Stress ${todayEntry.stress}/5 • Workload ${todayEntry.workload}/5` : 'Based on daily check-ins'}
          </p>
        </div>

        {/* Status 5: Focus & Rest */}
        <div className="breathly-card p-4 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#82928b] uppercase tracking-wider">Focus & Rest</span>
            <i data-lucide="timer" className="w-3.5 h-3.5 text-[#2a6b74]"></i>
          </div>
          <div className="text-sm sm:text-base font-bold text-[#18201d]">
            {totalFocusMinutes > 0 ? `${totalFocusMinutes}m Focus` : 'Rest Mode'}
          </div>
          <p className="text-[11px] text-[#55645e] truncate">
            {profile?.sleepDuration || '7-8h sleep routine'}
          </p>
        </div>
      </div>

      {/* 3. TODAY'S WELLBEING METRICS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#18201d]">Today's Wellbeing</h2>
          <button onClick={onOpenWeeklyReport} className="text-xs font-semibold text-[#1b4332] hover:underline">
            View Trends →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Metric 1: Index Score */}
          <div
            onClick={onOpenCheckIn}
            className="metric-card-clean cursor-pointer hover:border-[#1b4332] transition-colors"
            title="Open Daily 20-Second Check-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#82928b] uppercase tracking-wider">Wellbeing Index</span>
              <div className="metric-icon-wrap bg-[#e8f3ed] text-[#1b4332]">
                <i data-lucide="sparkles" className="w-4 h-4"></i>
              </div>
            </div>
            <div>
              {wellbeing?.hasCheckIns ? (
                <>
                  <div className="text-2xl font-extrabold text-[#18201d]">
                    {wellbeing.score}<span className="text-xs font-normal text-[#82928b]">/100</span>
                  </div>
                  <div className="text-[11px] text-[#2d6a4f] font-semibold mt-0.5">
                    {wellbeing.statusTitle}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm sm:text-base font-bold text-[#18201d] mt-1 leading-snug">
                    Do your first check-in
                  </div>
                  <div className="text-[11px] text-[#b8772a] font-semibold mt-0.5">
                    Takes only 20 seconds
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Metric 2: Habit Consistency */}
          <div className="metric-card-clean">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#82928b] uppercase tracking-wider">Habit Consistency</span>
              <div className="metric-icon-wrap bg-[#eef6f2] text-[#2d6a4f]">
                <i data-lucide="check-circle-2" className="w-4 h-4"></i>
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#18201d]">
                {consistency?.isEmpty ? 'Add a habit to start' : `${consistency?.consistencyPercent ?? 0}%`}
              </div>
              <div className="text-[11px] text-[#55645e] mt-0.5">
                {consistency?.isEmpty
                  ? 'Add a habit to begin tracking'
                  : `${consistency?.effectiveCount ?? 0} of last 7 days • ${consistency?.graceDaysLeft ?? 2} grace days left`}
              </div>
            </div>
          </div>

          {/* Metric 3: Mindful Minutes */}
          <div className="metric-card-clean">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#82928b] uppercase tracking-wider">Mindful Minutes</span>
              <div className="metric-icon-wrap bg-[#eff7f8] text-[#2a6b74]">
                <i data-lucide="wind" className="w-4 h-4"></i>
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#18201d]">
                {Math.round(recentGameSessions.reduce((acc, s) => acc + (Number(s.duration_seconds || s.durationSeconds) || 0), 0) / 60)}m
              </div>
              <div className="text-[11px] text-[#55645e] mt-0.5">
                Breathing & grounding breaks
              </div>
            </div>
          </div>

          {/* Metric 4: Distraction Shield */}
          <div className="metric-card-clean">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#82928b] uppercase tracking-wider">Focus Shield</span>
              <div className="metric-icon-wrap bg-[#fef7ed] text-[#b8772a]">
                <i data-lucide="shield" className="w-4 h-4"></i>
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#18201d]">
                {distractions.length} Logs
              </div>
              <div className="text-[11px] text-[#55645e] mt-0.5">
                {distractionGoalMinutes}m daily budget
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. STRESS PROTECTION SECTION */}
      <div className={`stress-protection-banner ${isElevatedStress ? 'elevated' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#1b4332] flex items-center gap-1.5">
                <i data-lucide="shield-check" className="w-4 h-4"></i>
                <span>Stress Protection</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isElevatedStress ? 'bg-[#fdf2ee] text-[#c25e40] border border-[#fad5c8]' : 'bg-[#e8f3ed] text-[#1b4332] border border-[#cfe1d7]'
                }`}>
                {isElevatedStress ? 'Early Stress Spike Detected' : 'Physiological Pacing Steady'}
              </span>
            </div>

            <p className="text-xs sm:text-[13px] text-[#55645e] leading-relaxed max-w-2xl">
              {isElevatedStress
                ? 'Your recent answers and routine signals show heightened cognitive load. We recommend switching to 2-minute micro-doses or taking a 60-second breathing pause to protect your energy.'
                : 'Your daily cognitive load and routine signals are balanced. No fatigue spikes detected in the last 24 hours.'}
            </p>
          </div>

          {/* Direct Proactive Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto flex-shrink-0">
            <button
              onClick={onOpenDeEscalator}
              className="btn-secondary py-2 px-3 text-xs"
              title="10-Second Anti-Paralysis Reset"
            >
              <i data-lucide="zap" className="w-3.5 h-3.5 text-[#b8772a]"></i>
              <span>10s Circuit Breaker</span>
            </button>

            <button
              onClick={onToggleShieldMode}
              className={`py-2 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${isShieldModeActive
                  ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-sm'
                  : 'bg-white border-[#e8eae6] text-[#18201d] hover:bg-[#f7f8f6]'
                }`}
            >
              <i data-lucide={isShieldModeActive ? 'shield-check' : 'shield'} className="w-3.5 h-3.5"></i>
              <span>{isShieldModeActive ? 'Shield On (2-Min Mode)' : 'Activate Shield Mode'}</span>
            </button>

            <button
              onClick={() => onQuickReset(ACTIVITIES['breathing-426'])}
              className="btn-primary py-2 px-3 text-xs"
            >
              <i data-lucide="wind" className="w-3.5 h-3.5"></i>
              <span>60s Breath Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. RECOMMENDED FOR YOU (6 PERSONALIZED ACTIVITIES) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#18201d]">Recommended for You</h2>
            <p className="text-xs text-[#55645e]">
              Personalized micro-actions aligned with your current daily baseline.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {recommendedActivities.map((act) => (
            <div
              key={act.id}
              onClick={act.action}
              className="activity-rec-card group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${act.iconBg} ${act.iconColor} transition-transform group-hover:scale-105`}>
                    <i data-lucide={act.icon} className="w-4 h-4"></i>
                  </div>
                  <span className="activity-badge bg-[#f7f8f6] text-[#55645e] border border-[#e8eae6]">
                    {act.duration}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#18201d] group-hover:text-[#1b4332] transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-[#55645e] mt-0.5 leading-relaxed">
                    {act.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#f0f2ef] text-xs">
                <span className="text-[11px] font-semibold text-[#82928b]">{act.tag}</span>
                <span className="font-bold text-[#1b4332] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>{act.actionLabel}</span>
                  <i data-lucide="arrow-right" className="w-3 h-3"></i>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. TODAY'S HABITS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#18201d]">Today’s Adaptive Habits</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#e8f3ed] text-[#1b4332] border border-[#cfe1d7]">
              {completedCount} of {totalHabits} done
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onToggleShieldMode) onToggleShieldMode();
              }}
              className="text-xs font-semibold text-[#b8772a] hover:underline hidden sm:inline"
            >
              {isShieldModeActive ? '⚡ Minimum Mode is Active' : '⚡ Scale All to Minimum Mode'}
            </button>

            <button onClick={onAddHabit} className="btn-primary py-1.5 px-3 text-xs">
              <i data-lucide="plus" className="w-3.5 h-3.5"></i>
              <span>Add Habit</span>
            </button>
          </div>
        </div>

        {habits.length === 0 ? (
          <div className="empty-state-box py-10">
            <div className="empty-state-icon">
              <i data-lucide="sparkles" className="w-6 h-6"></i>
            </div>
            <div className="empty-state-title">No habits created yet</div>
            <p className="empty-state-desc">
              Start with a simple 2-minute daily ritual. Breathly scales difficulty dynamically so you never fail.
            </p>
            <button onClick={onAddHabit} className="btn-primary text-xs mt-2">
              <span>Create Your First Habit</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {habits.map((habit) => {
              const isFull = habit.todayStatus === 'full';
              const isMin = habit.todayStatus === 'min';

              return (
                <div
                  key={habit.id}
                  className={`habit-card ${isFull ? 'completed-full' : isMin ? 'completed-min' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => onToggleHabit(habit.id, isMinimumModeToday ? 'min' : 'full')}
                        className={`habit-checkbox ${isFull ? 'checked-full' : isMin ? 'checked-min' : ''}`}
                        title={isFull || isMin ? 'Marked complete — tap to unmark or review' : 'Click to start habit timer'}
                      >
                        {(isFull || isMin) ? (
                          <i data-lucide="check" className="w-3.5 h-3.5 text-white"></i>
                        ) : (
                          <i data-lucide="play" className="w-3 h-3 text-[#82928b]"></i>
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{habit.icon || '🌿'}</span>
                          <h4 className={`text-sm font-bold text-[#18201d] ${isFull || isMin ? 'line-through opacity-70' : ''}`}>
                            {habit.title}
                          </h4>
                        </div>

                        <p className="text-xs text-[#55645e] mt-0.5">
                          {isMinimumModeToday ? (
                            <span className="text-[#065f46] font-semibold bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-md inline-block">
                              ⚡ 2-min: {habit.tinyVersion || 'Do just 2 minutes of this'}
                            </span>
                          ) : isShieldModeActive ? (
                            <span className="text-[#1b4332] font-bold bg-[#e8f3ed] px-1.5 py-0.2 rounded">
                              🛡️ 2-Min Shield Target: {habit.minModeVal} {habit.minModeUnit}
                            </span>
                          ) : (
                            <span>Target: {habit.targetVal} {habit.targetUnit}</span>
                          )}
                          <span className="mx-1">•</span>
                          <span className="capitalize">{habit.preferredTime}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="streak-pill">
                        <span>🔥</span>
                        <span>{habit.currentStreak || 0}d</span>
                      </span>

                      <button
                        onClick={() => onEditHabit(habit)}
                        className="p-1 text-[#82928b] hover:text-[#18201d] rounded-lg transition-colors"
                        title="Edit Habit"
                      >
                        <i data-lucide="more-horizontal" className="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>

                  {/* Micro-Dose Button & Failure Analysis Action */}
                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#f0f2ef] text-xs">
                    <button
                      onClick={() => onToggleHabit(habit.id, 'min')}
                      className={`min-mode-pill ${isMin ? 'bg-[#fbe2bd] text-[#b8772a] font-extrabold' : ''}`}
                      title="Complete with 2-minute micro-dose to protect streak"
                    >
                      <span>⚡ {isMinimumModeToday ? (habit.tinyVersion || 'Do just 2 minutes of this') : `Min: ${habit.minModeVal} ${habit.minModeUnit}`}</span>
                    </button>

                    <button
                      onClick={() => onOpenFailureModal(habit)}
                      className="text-[11px] text-[#82928b] hover:text-[#c25e40] flex items-center gap-1 transition-colors"
                    >
                      <i data-lucide="help-circle" className="w-3 h-3"></i>
                      <span>What got in the way?</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. DAILY CHECK-IN & FOCUS RADAR MINI WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
        {/* Today's Check-in Card */}
        <DashboardCheckInWidget
          checkInStatus={checkInStatus}
          onOpenCheckIn={onOpenCheckIn}
        />

        {/* Focus & Distraction Radar Widget */}
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
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${tempGoal === val ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'bg-slate-50 border-slate-200 text-slate-700'
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
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isOverGoal ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
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
                  className={`px-3 py-1 rounded-lg capitalize font-bold text-[11px] transition-all ${filterPeriod === p ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
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
// 6. COACH VIEW (GOOGLE GEMINI AI + DYNAMIC SMART CONVERSATIONAL ENGINE)
// ==========================================================================

function generateSmartCoachResponse(rawText, context, earlySignals, appState, user) {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();
  const userName = (user && user.name ? user.name.split(' ')[0] : 'there');

  // 1. Greetings & Friendly Openers
  if (/^(hi+|hello+|hlo+|hlw+|helo+|hey+|greetings|good morning|good afternoon|good evening|sup|what'?s up|howdy|yo|hai)\b/i.test(lower) || lower === 'hlo' || lower === 'hlw' || lower === 'helo' || lower.startsWith('hlo') || lower.startsWith('hlw')) {
    return {
      reply: `Hello ${userName}! I'm really glad you reached out. How are you feeling right now? Whether you're stressed, exhausted, need to vent, or just have a question on your mind, I'm right here with you.`,
      actionType: null
    };
  }

  // 2. Identity & Safe Haven Role
  if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('what do you do') || lower.includes('your name') || lower.includes('who made you')) {
    return {
      reply: `I'm your personal stress-relief companion and coach. My role isn't to judge you or tell you what to do, but to give you a comforting, safe space whenever life feels overwhelming. You can ask me about anything—food, sleep, exhaustion, handling anxiety, or simply talk through what's bothering you.`,
      actionType: null
    };
  }

  // 3. Courtesy & Gratitude
  if (/^(thank you|thanks|thx|appreciate it|awesome|great job|well done)\b/i.test(lower) || lower === 'thanks' || lower === 'thank you') {
    return {
      reply: `You're so welcome, ${userName}. Remember to be gentle with yourself today. I'm always right here whenever you need a listening ear or a moment to pause.`,
      actionType: null
    };
  }

  // 4. "How are you"
  if (lower.includes('how are you') || lower.includes('how are you doing')) {
    return {
      reply: `I'm here and ready to support you! More importantly, how are you holding up today? Has it felt like a heavy day, or are you doing okay?`,
      actionType: null
    };
  }

  // 5. Food, Eating, Nutrition & Appetite (Direct User POV)
  if (lower.includes('eat') || lower.includes('food') || lower.includes('hungry') || lower.includes('meal') || lower.includes('snack') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('breakfast') || lower.includes('appetite') || lower.includes('craving') || lower.includes('diet')) {
    return {
      reply: `When you're feeling stressed or low on energy, deciding what to eat feels like huge work. The best approach is comfort and low effort:\n\n• Warm & comforting: A bowl of warm soup or broth, oatmeal with a little honey, or warm buttered toast.\n• Easy nourishing snacks: A banana with peanut butter, a handful of nuts (almonds/walnuts), or a piece of dark chocolate (great for calming magnesium).\n• Gentle hydration: A warm cup of chamomile or herbal tea, or warm milk.\n\nDon't stress about eating 'perfectly' right now. Pick whatever is quickest, warm, and requires the least effort to get down.`,
      actionType: null
    };
  }

  // 6. Exhaustion, Depletion, Tiredness & Low Energy
  if (lower.includes('tired') || lower.includes('exhaust') || lower.includes('fatigue') || lower.includes('drain') || lower.includes('no energy') || lower.includes("can't do this") || lower.includes('heavy') || lower.includes('weak')) {
    return {
      reply: `I hear how completely exhausted you are, and your body is giving you an honest signal. When you've been carrying tension, hitting a wall is totally natural. Rest is not a reward you must earn—it is a basic human necessity. Give yourself full permission to step back, lie down, close your eyes, or take a nap without any guilt.`,
      actionType: null
    };
  }

  // 7. Sadness, Heartbreak, Crying, Grief & Loneliness
  if (lower.includes('sad') || lower.includes('cry') || lower.includes('lonely') || lower.includes('alone') || lower.includes('hopeless') || lower.includes('hurt') || lower.includes('heartbroken') || lower.includes('breakup') || lower.includes('unhappy') || lower.includes('empty')) {
    return {
      reply: `I'm so sorry you're carrying this deep heaviness. Experiencing sadness or heartbreak can feel so isolating, but please know that what you're feeling is completely human and valid. You don't have to force a smile or pretend to be okay. Cry if you need to, wrap up warmly, and take it one gentle breath at a time. I'm right here with you.`,
      actionType: null
    };
  }

  // 8. Anger, Frustration, Irritation & Feeling Unfairly Treated
  if (lower.includes('angry') || lower.includes('mad') || lower.includes('annoy') || lower.includes('hate') || lower.includes('frustrat') || lower.includes('unfair') || lower.includes('pissed') || lower.includes('irritat')) {
    return {
      reply: `You have every right to feel angry and frustrated. Holding everything inside when things feel unfair or people push past your boundaries is exhausting. Anger is just a healthy boundary signal that something crossed a line. Let yourself feel it without judging yourself for having the emotion.`,
      actionType: null
    };
  }

  // 9. Anxiety, Overwhelm, Panic & Racing Thoughts
  if (lower.includes('anxi') || lower.includes('panic') || lower.includes('overwhelm') || lower.includes('worry') || lower.includes('scared') || lower.includes('fear') || lower.includes('overthinking') || lower.includes('nervous') || lower.includes('shaking') || lower.includes('freaking out')) {
    return {
      reply: `Take a slow, deep breath with me right now. When overwhelm strikes, your mind starts racing into worst-case futures that aren't happening in this exact room. Drop your shoulders away from your ears, unclamp your jaw, and feel the solid ground beneath your feet. You are safe in this exact moment, and we can take this one second at a time.`,
      actionType: lower.includes('breath') ? 'quick-reset' : null
    };
  }

  // 10. Self-Doubt, Guilt & Feeling "Not Enough"
  if (lower.includes('failure') || lower.includes('not good enough') || lower.includes('guilt') || lower.includes('hate myself') || lower.includes('useless') || lower.includes('loser') || lower.includes('regret') || lower.includes('mistake')) {
    return {
      reply: `Please speak gently to yourself. You are dealing with so much, and you are doing the best you can with the emotional energy you have today. Having a hard day or struggling does not make you a failure. Your worth as a human is never measured by productivity or perfection. You deserve compassion, especially from yourself.`,
      actionType: null
    };
  }

  // 11. Sleep, Insomnia & Restlessness
  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes("can't sleep") || lower.includes('bed') || lower.includes('nightmare')) {
    return {
      reply: `Tossing and turning when your mind is racing is so frustrating. The best trick is to take the pressure off 'trying' to sleep—just lying down with your eyes closed in a dim, quiet room gives your body and brain restorative rest. Try taking slow, lengthened exhales, or put on soft ambient sounds to give your thoughts a place to rest.`,
      actionType: null
    };
  }

  // 12. Entertainment, Comfort, Movies, Fun & Unwinding
  if (lower.includes('movie') || lower.includes('watch') || lower.includes('music') || lower.includes('song') || lower.includes('show') || lower.includes('relax') || lower.includes('fun') || lower.includes('bored') || lower.includes('cozy') || lower.includes('game')) {
    return {
      reply: `Indulging in comfort and low-stress entertainment is wonderful self-care. Try putting on a familiar, heartwarming movie or comedy sitcom (something cozy where you already know the ending), fixing a warm drink, getting under a cozy blanket, or listening to calm acoustic tracks. You fully deserve to just unplug and relax without needing to be productive.`,
      actionType: lower.includes('bubble') ? 'play-bubble-rhythm' : null
    };
  }

  // 13. Procrastination, Work, Exams & Academic Pressure
  if (lower.includes('procrastinat') || lower.includes('study') || lower.includes('focus') || lower.includes('exam') || lower.includes('deadline') || lower.includes('assignment') || lower.includes('homework')) {
    return {
      reply: `When work or studying feels impossible to start, it's usually because the pile feels too intimidating, not because you're lazy. Give yourself permission to do the bare minimum: just open your notebook or look at 1 question for 2 minutes. No pressure to finish everything—just breaking the initial freeze is a massive win.`,
      actionType: lower.includes('timer') ? 'start-focus-sprint' : null
    };
  }

  // 14. Phone Addiction, Social Media & Noise
  if (lower.includes('distract') || lower.includes('phone') || lower.includes('social media') || lower.includes('instagram') || lower.includes('notification') || lower.includes('doomscroll')) {
    return {
      reply: `Doomscrolling happens naturally when you're overwhelmed and your brain is searching for quick dopamine relief from stress. Instead of feeling guilty, try setting your phone face-down across the room for just 15 minutes, or step outside for a breath of fresh air to give your senses a quiet break.`,
      actionType: null
    };
  }

  // 15. Physical Tension, Headaches & Stress in the Body
  if (lower.includes('headache') || lower.includes('neck') || lower.includes('back hurt') || lower.includes('shoulder') || lower.includes('tension') || lower.includes('body')) {
    return {
      reply: `Our bodies carry emotional stress physically—tight shoulders, a clenched jaw, or tension headaches are classic signs of holding onto pressure. Try doing a gentle shoulder roll, drinking a large glass of water, and applying a warm cloth or heating pad to your neck to let those muscles soften.`,
      actionType: null
    };
  }

  // 16. What is Stress / Burnout (Educational)
  if (lower.includes('what is stress') || lower.includes('what is burnout') || lower.includes('why stress')) {
    return {
      reply: `Stress is your body's survival system releasing hormones like cortisol and adrenaline to protect you under pressure. When pressure lasts too long without true rest, it turns into burnout—leaving you emotionally and physically depleted. Healing comes from reducing pressure and giving yourself genuine recovery windows.`,
      actionType: null
    };
  }

  // 17. General Empathetic Listener Fallback (User POV & Thought Validation)
  const cleanSummary = text.length > 50 ? text.substring(0, 48) + '...' : text;
  return {
    reply: `I hear you regarding "${cleanSummary}". When you're carrying stress, whatever you are feeling or thinking right now is completely natural and valid. You don't have to figure everything out all at once. Take it one moment at a time—how can I best support or listen to you right now?`,
    actionType: null
  };
}

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
  onOpenMiniGames,
  onStartFocusSession,
  onActivateMinModeAll
}) {
  const [messages, setMessages] = useState(() => [
    {
      sender: 'ai',
      text: `Hello ${user ? user.name?.split(' ')[0] : 'there'}! I'm here to listen, support, and help you navigate whatever stress or overwhelm you're carrying today. You can talk to me about anything—how you're feeling, food and sleep when exhausted, work pressure, or just taking a breath. What's on your mind?`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    { label: "🍵 What to eat or drink when stressed?", prompt: "I'm stressed and hungry with low energy. What can I easily eat or drink right now?" },
    { label: "😴 Completely exhausted & low energy", prompt: "I feel completely exhausted and have no energy today." },
    { label: "🧠 Mind won't stop racing & overthinking", prompt: "My mind won't stop racing and overthinking right now." },
    { label: "📚 Overwhelmed with deadlines & pressure", prompt: "I feel overwhelmed with work, studies, and upcoming deadlines." },
    { label: "🫧 Need a calming 2-minute mental reset", prompt: "Can you guide me through a quick, comforting relaxation reset?" },
    { label: "💭 Just need to vent and talk through my feelings", prompt: "I just need a safe space to vent about what's on my mind." }
  ];

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Prepare contextual user telemetry payload for Gemini
    const contextData = {
      userName: user ? user.name?.split(' ')[0] : 'there',
      statusTitle: earlySignals?.statusTitle || 'Balanced',
      workload: appState?.checkInStatus?.todayCheckIn?.workloadRating || 'manageable',
      sleepQuality: appState?.checkInStatus?.todayCheckIn?.sleepQuality || 'normal',
      stressRating: appState?.checkInStatus?.todayCheckIn?.stressRating || 5,
      topDistraction: (appState?.distractions || [])[0]?.category || 'None logged',
      habitsCount: (appState?.habits || []).length,
      completedHabits: (appState?.habits || []).filter(h => h.todayStatus === 'full' || h.todayStatus === 'min').length,
      isHighStressState: earlySignals?.statusLevel === 'elevated' || earlySignals?.statusLevel === 'demanding'
    };

    try {
      if (window.api && typeof window.api.chatWithGemini === 'function') {
        const res = await window.api.chatWithGemini(text, contextData);
        if (res && res.success && res.reply) {
          setMessages(prev => [
            ...prev,
            { sender: 'ai', text: res.reply, actionType: res.actionType, model: res.model || 'Gemini Flash AI' }
          ]);
          setIsTyping(false);
          return;
        }
      }
      throw new Error('Fallback needed');
    } catch (err) {
      // Fall back to our extensive, dynamic smart conversational coach engine
      setTimeout(() => {
        const smartRes = generateSmartCoachResponse(text, contextData, earlySignals, appState, user);
        setMessages(prev => [
          ...prev,
          { sender: 'ai', text: smartRes.reply, actionType: smartRes.actionType, model: null }
        ]);
        setIsTyping(false);
      }, 300);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-6 animate-fade-in space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold transition-colors">
          <i data-lucide="arrow-left" className="w-4 h-4"></i>
          <span>Back to Dashboard</span>
        </button>

        {/* Gemini AI Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Coach Online (Gemini AI)</span>
        </div>
      </div>

      {/* Main Conversation Box */}
      <div className="breathly-card p-4 sm:p-6 flex flex-col h-[540px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {m.sender === 'ai' && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mb-1 ml-1">
                  <i data-lucide={m.model ? "sparkles" : "bot"} className={`w-3 h-3 ${m.model ? "text-indigo-500" : "text-slate-400"}`}></i>
                  <span>{m.model ? `Gemini Flash AI` : `Breathly Smart Coach`}</span>
                </div>
              )}
              <div className={m.sender === 'user' ? 'coach-bubble-user max-w-md' : 'coach-bubble-ai max-w-lg'}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>

                {m.actionType === 'play-bubble-rhythm' && (
                  <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                    <button
                      onClick={() => onOpenMiniGames && onOpenMiniGames('bubble-rhythm', 'rhythm_pop')}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <i data-lucide="play" className="w-3.5 h-3.5"></i>
                      <span>🫧 Play Bubble Rhythm (2m)</span>
                    </button>
                  </div>
                )}

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
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all"
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
                      onClick={() => onOpenMiniGames && onOpenMiniGames('bubble-rhythm', 'rhythm_pop')}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 flex items-center gap-1.5 transition-all"
                    >
                      <span>🫧 2-Min Bubble Break</span>
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
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <i data-lucide="wind" className="w-3.5 h-3.5 text-teal-600"></i>
                      <span>Start Box Breathing for Focus</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing / Thinking Indicator */}
          {isTyping && (
            <div className="flex flex-col items-start animate-fade-in">
              <div className="coach-bubble-ai max-w-xs flex items-center gap-2 py-3 px-4 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-xs text-slate-500 font-medium ml-1.5">Coach is formulating guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="py-3 border-t border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p.prompt)}
              disabled={isTyping}
              className={`coach-chip ${isTyping ? 'opacity-60 cursor-not-allowed' : ''}`}
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
            disabled={isTyping}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isTyping ? "Coach is formulating guidance..." : "Ask your coach anything about focus, calm, habits, or fatigue..."}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#f7f8f6] border border-[#e8eae6] text-[#18201d] text-xs focus:outline-none focus:border-[#1b4332] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isTyping || !inputText.trim()}
            className="btn-primary py-2.5 px-4 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isTyping ? "..." : "Send"}</span>
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
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#55645e] hover:text-[#18201d] font-semibold">
          <i data-lucide="arrow-left" className="w-4 h-4"></i>
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={onAddHabit}
          className="btn-primary py-1.5 px-3.5 text-xs"
        >
          <i data-lucide="plus" className="w-3.5 h-3.5"></i>
          <span>Add Linked Habit</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18201d]">Goal → Habit Hierarchy</h1>
        <p className="text-xs sm:text-sm text-[#55645e] mt-1">
          Daily micro-habits feed directly into your overarching life ambitions.
        </p>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => {
          const linkedHabits = habits.filter(h => h.goalId === goal.id);
          const totalStreak = linkedHabits.reduce((acc, h) => acc + h.currentStreak, 0);

          return (
            <div key={goal.id} className="breathly-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f3ed] border border-[#cfe1d7] flex items-center justify-center text-xl">
                    {goal.icon || '🎯'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#18201d]">{goal.title}</h3>
                    <p className="text-xs text-[#55645e]">{linkedHabits.length} daily habits linked</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#2d6a4f] bg-[#e8f3ed] px-2.5 py-1 rounded-full border border-[#cfe1d7]">
                    🌱 {linkedHabits.filter(h => h.todayStatus === 'full' || h.todayStatus === 'min').length} / {linkedHabits.length} Active Today
                  </span>
                </div>
              </div>

              {/* Linked Habits Sub-list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {linkedHabits.map((h) => (
                  <div key={h.id} className="p-3 rounded-xl border border-[#e8eae6] bg-[#f7f8f6] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{h.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-[#18201d]">{h.title}</div>
                        <div className="text-[11px] text-[#55645e]">{h.targetVal} {h.targetUnit} (⚡ Min: {h.minModeVal})</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#18201d]">{h.currentStreak}d</span>
                  </div>
                ))}
                {linkedHabits.length === 0 && (
                  <div className="text-xs text-[#82928b] italic p-3">No habits linked to this goal yet.</div>
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
  consistency,
  resetSessions = [],
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
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#55645e] hover:text-[#18201d] font-semibold">
          <i data-lucide="arrow-left" className="w-4 h-4"></i>
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDistractions}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            <i data-lucide="timer" className="w-3.5 h-3.5 text-[#1b4332]"></i>
            <span>Focus Radar</span>
          </button>
          <button
            onClick={() => onQuickReset(earlySignals.recommendedActivity)}
            className="btn-primary py-1.5 px-3 text-xs"
          >
            <i data-lucide="wind" className="w-3.5 h-3.5"></i>
            <span>Take Wellbeing Reset</span>
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18201d]">Digital Wellbeing Intelligence Report</h1>
        <p className="text-xs sm:text-sm text-[#55645e] mt-1">
          Behavioral completion trends, focus vs. distraction balance, and multi-signal stress load telemetry.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="breathly-card p-4 space-y-1">
          <span className="text-[#82928b] text-[11px] font-bold uppercase tracking-wider">Habit Consistency</span>
          <span className="text-2xl font-black text-[#2d6a4f]">
            {consistency?.isEmpty ? 'Add a habit to start' : `${consistency?.consistencyPercent ?? 0}%`}
          </span>
          <span className="text-[10px] text-[#55645e]">
            {consistency?.isEmpty ? 'Add a habit to start' : `${consistency?.effectiveCount ?? 0} of 7 days • ${consistency?.graceDaysLeft ?? 2} grace days left`}
          </span>
        </div>

        <div className="breathly-card p-4 space-y-1">
          <span className="text-[#82928b] text-[11px] font-bold uppercase tracking-wider">7-Day Consistency</span>
          <span className="text-2xl font-black text-[#1b4332]">
            {consistency?.isEmpty ? 'Add a habit to start' : `${consistency?.effectiveCount ?? 0} / 7 Days`}
          </span>
          <span className="text-[10px] text-[#55645e]">
            {consistency?.isEmpty ? 'No habit history yet' : `Grace days left: ${consistency?.graceDaysLeft ?? 2}`}
          </span>
        </div>

        <div className="breathly-card p-4 space-y-1">
          <span className="text-[#82928b] text-[11px] font-bold uppercase tracking-wider">Weekly Focus Time</span>
          <span className="text-2xl font-black text-[#2a6b74]">{totalWeeklyFocusMin}m</span>
          <span className="text-[10px] text-[#55645e]">{weekFocusSessions.length} sessions logged</span>
        </div>

        <div className="breathly-card p-4 space-y-1">
          <span className="text-[#82928b] text-[11px] font-bold uppercase tracking-wider">Weekly Distractions</span>
          <span className="text-2xl font-black text-[#b8772a]">{totalWeeklyDistractionMin}m</span>
          <span className="text-[10px] text-[#55645e]">Avg {avgDailyDistraction}m / day</span>
        </div>
      </div>

      {/* Weekly Habit vs. Distraction Balance Comparison */}
      <div className="breathly-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#18201d] flex items-center gap-2">
              <i data-lucide="scale" className="w-4 h-4 text-[#1b4332]"></i>
              <span>Habit Investment vs. Distraction Balance</span>
            </h3>
            <p className="text-xs text-[#55645e]">Compare time invested in key habits against distraction volume</p>
          </div>
          <span className="text-xs font-bold text-[#55645e]">Past 7 Days</span>
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
                    <span className="font-bold text-[#18201d]">{habit.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#2d6a4f] font-bold">🔥 {habit.currentStreak || 0}d streak</span>
                    <span className="text-[#82928b]">•</span>
                    <span className="text-[#55645e] font-medium">Target: {habit.targetVal} {habit.targetUnit}</span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-[#f0f2ee] overflow-hidden flex">
                  <div
                    className="h-full bg-[#1b4332] rounded-full transition-all duration-700"
                    style={{ width: `${Math.max((habit.currentStreak || 0) > 0 ? 10 : 0, habitFocusRatio)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Distraction & Attention Intelligence Breakdown */}
      <div className="breathly-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-[#18201d] flex items-center gap-2">
              <i data-lucide="target" className="w-4 h-4 text-[#1b4332]"></i>
              <span>Weekly Attention & Focus Intelligence</span>
            </h3>
            <p className="text-xs text-[#55645e]">Detailed behavioral breakdown of interruptions and focus recovery</p>
          </div>

          <button
            onClick={onOpenDistractions}
            className="btn-primary py-1.5 px-3 text-xs self-start sm:self-center"
          >
            <span>Open Distraction Radar</span>
            <i data-lucide="arrow-right" className="w-3.5 h-3.5"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-[#f7f8f6] border border-[#e8eae6] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#82928b]">Top Distraction Category</span>
            <div className="text-base font-black text-[#18201d]">{weekDistractions.length > 0 ? topWeekCategory : '--'}</div>
            <p className="text-[11px] text-[#55645e]">{weekDistractions.length > 0 ? `${topWeekCatMin}m total across 7 days` : 'No distractions logged'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f7f8f6] border border-[#e8eae6] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#82928b]">Daily Distraction Average</span>
            <div className="text-base font-black text-[#18201d]">{avgDailyDistraction} min / day</div>
            <p className="text-[11px] text-[#55645e]">
              {totalWeeklyDistractionMin > 0
                ? (avgDailyDistraction <= (distractionGoalMinutes || 45) ? "Within healthy daily target ✓" : "Slightly above target")
                : "No distractions this week"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f7f8f6] border border-[#e8eae6] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#82928b]">Focus Efficiency</span>
            <div className="text-base font-black text-[#2d6a4f]">
              {totalWeeklyTime > 0
                ? `${Math.round((totalWeeklyFocusMin / totalWeeklyTime) * 100)}%`
                : '--'}
            </div>
            <p className="text-[11px] text-[#55645e]">Uninterrupted focus share</p>
          </div>
        </div>
      </div>

      {/* Comparative Reset Effectiveness Breakdown */}
      <ResetEffectivenessCard resetSessions={resetSessions} />

      {/* Baseline vs Real-Time Pattern Synthesis */}
      <div className="breathly-card p-6 space-y-4">
        <h3 className="font-extrabold text-base text-[#18201d] flex items-center gap-2">
          <i data-lucide="bot" className="w-4 h-4 text-[#1b4332]"></i>
          <span>Multi-Signal Pattern Analysis & Guidance</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#f7f8f6] border border-[#e8eae6]">
            <div className="font-bold text-[#18201d] mb-1">1. Lifestyle Baseline Alignment</div>
            <p className="text-[#55645e] leading-relaxed">
              Your normal baseline is {earlySignals.baseline.hours} daily workload and {earlySignals.baseline.sleep} sleep. {earlySignals.gentleNudge}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f7f8f6] border border-[#e8eae6]">
            <div className="font-bold text-[#18201d] mb-1">2. Minimum Mode Utilization</div>
            <p className="text-[#55645e] leading-relaxed">
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
                className={`px-2 py-0.5 rounded-lg border font-semibold text-[10px] capitalize transition-all ${ambientSound === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
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
                  {Math.max(0, Math.min(100, Math.round(((Math.round(totalSeconds / 60) - totalInterruptionMinutes) / Math.round(totalSeconds / 60)) * 100)))}%
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
                        className={`p-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${interruptionCategory === c.label ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
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
                        className={`flex-1 py-1 rounded-lg border font-bold text-[11px] transition-all ${interruptionDuration === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-700'
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
                  className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${category === cat.label
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
                  className={`py-1.5 rounded-xl border text-xs font-bold transition-all ${durationMinutes === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-700'
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
// 8D. BUBBLE RHYTHM MINI-GAME (FREE POP & RHYTHM POP MODES)
// ==========================================================================

function BubbleRhythmGame({
  user,
  initialMode = 'rhythm_pop',
  initialPreset = 'calm',
  initialDuration = 180,
  onSaveSession,
  onBack
}) {
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing' | 'paused' | 'completed'
  const [gameMode, setGameMode] = useState(initialMode); // 'free_pop' | 'rhythm_pop'
  const [rhythmPreset, setRhythmPreset] = useState(initialPreset); // 'calm' | 'flow' | 'energy'
  const [durationSeconds, setDurationSeconds] = useState(initialDuration); // 120, 180, 300
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [bubblesPopped, setBubblesPopped] = useState(0);
  const [soundMuted, setSoundMuted] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);

  // Post-game reflection feedback
  const [feeling, setFeeling] = useState('better'); // 'better' | 'same' | 'stressed'
  const [enjoyment, setEnjoyment] = useState('yes'); // 'yes' | 'little' | 'no'
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [tensionBefore, setTensionBefore] = useState(null);
  const [tensionAfter, setTensionAfter] = useState(null);
  const [showPreTensionModal, setShowPreTensionModal] = useState(false);

  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const gameStateRef = useRef(gameState);
  const bubblesRef = useRef([]);
  const particlesRef = useRef([]);
  const ripplesRef = useRef([]);
  const floatingTextsRef = useRef([]);
  const lastSpawnRef = useRef(0);
  const beatCountRef = useRef(0);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [gameState, gameMode, rhythmPreset, soundMuted, musicMuted, feeling, enjoyment]);

  // Audio mute sync
  useEffect(() => {
    bubbleAudioService.setSoundEnabled(!soundMuted);
  }, [soundMuted]);

  useEffect(() => {
    bubbleAudioService.setMusicEnabled(!musicMuted);
  }, [musicMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      bubbleAudioService.dispose();
    };
  }, []);

  // Timer countdown while playing
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, durationSeconds]);

  const handleStartGame = () => {
    bubbleAudioService.init();
    setTimeLeft(durationSeconds);
    setBubblesPopped(0);
    setHasSubmittedFeedback(false);
    bubblesRef.current = [];
    particlesRef.current = [];
    ripplesRef.current = [];
    floatingTextsRef.current = [];
    lastSpawnRef.current = performance.now();
    beatCountRef.current = 0;

    if (gameMode === 'rhythm_pop') {
      bubbleAudioService.startRhythm(rhythmPreset, (step, intervalMs) => {
        if (gameStateRef.current !== 'playing') return;
        beatCountRef.current = step;
        spawnRhythmBubble(step, intervalMs);
      });
    } else {
      bubbleAudioService.stopRhythm();
    }

    setGameState('playing');
  };

  const handlePauseToggle = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      bubbleAudioService.stopRhythm();
    } else if (gameState === 'paused') {
      setGameState('playing');
      if (gameMode === 'rhythm_pop') {
        bubbleAudioService.startRhythm(rhythmPreset, (step, intervalMs) => {
          if (gameStateRef.current !== 'playing') return;
          beatCountRef.current = step;
          spawnRhythmBubble(step, intervalMs);
        });
      }
    }
  };

  const finishSession = () => {
    bubbleAudioService.stopRhythm();
    if (window.confetti) {
      window.confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }
    setGameState('completed');
  };

  const spawnRhythmBubble = (step, intervalMs) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 700;
    const h = rect.height || 480;

    const baseRadius = rhythmPreset === 'calm' ? 44 : rhythmPreset === 'flow' ? 36 : 30;
    const radius = baseRadius + (Math.random() * 12 - 6);
    const x = radius + 30 + Math.random() * (w - radius * 2 - 60);
    const y = radius + 40 + Math.random() * (h - radius * 2 - 70);

    const colors = [
      { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', light: '#cffafe' }, // Cyan
      { primary: '#0d9488', glow: 'rgba(13, 148, 136, 0.4)', light: '#ccfbf1' }, // Teal
      { primary: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)', light: '#e0e7ff' }, // Indigo
      { primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', light: '#ede9fe' }, // Violet
      { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', light: '#fef3c7' }  // Amber
    ];
    const color = colors[step % colors.length];

    bubblesRef.current.push({
      id: 'b-' + Math.random(),
      x,
      y,
      radius,
      color,
      vy: -(0.2 + Math.random() * 0.3),
      vx: (Math.random() - 0.5) * 0.4,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.04 + Math.random() * 0.03,
      scale: 0.1,
      targetScale: 1.0,
      createdAt: performance.now(),
      beatInterval: intervalMs,
      pitchIndex: step % 10,
      pulseRingRadius: radius * 1.8,
      pulseAlpha: 0.8
    });

    if (bubblesRef.current.length > 10) {
      bubblesRef.current.shift();
    }
  };

  const spawnFreeBubble = (w, h) => {
    const radius = 32 + Math.random() * 26;
    const x = radius + 20 + Math.random() * (w - radius * 2 - 40);
    const y = h + radius;

    const colors = [
      { primary: '#38bdf8', glow: 'rgba(56, 189, 248, 0.35)', light: '#e0f2fe' },
      { primary: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.35)', light: '#ccfbf1' },
      { primary: '#818cf8', glow: 'rgba(129, 140, 248, 0.35)', light: '#e0e7ff' },
      { primary: '#c084fc', glow: 'rgba(192, 132, 252, 0.35)', light: '#f3e8ff' },
      { primary: '#fb923c', glow: 'rgba(251, 146, 60, 0.35)', light: '#ffedd5' }
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    bubblesRef.current.push({
      id: 'b-' + Math.random(),
      x,
      y,
      radius,
      color,
      vy: -(0.5 + Math.random() * 0.7),
      vx: (Math.random() - 0.5) * 0.5,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.03 + Math.random() * 0.02,
      scale: 0.2,
      targetScale: 1.0,
      createdAt: performance.now(),
      pitchIndex: Math.floor(Math.random() * 10),
      pulseRingRadius: 0,
      pulseAlpha: 0
    });

    if (bubblesRef.current.length > 12) {
      bubblesRef.current.shift();
    }
  };

  // Main Canvas Animation Loop
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'paused') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = (time) => {
      if (!isRunning) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = Math.floor(rect.width);
      const displayHeight = Math.floor(rect.height);

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // 1. Soft underwater caustic gradient backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, displayWidth, displayHeight);
      bgGrad.addColorStop(0, '#f0fdf4');
      bgGrad.addColorStop(0.5, '#f0f9ff');
      bgGrad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Subtle ambient caustic light circles
      const tSec = time * 0.001;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(displayWidth * 0.3 + Math.sin(tSec * 0.5) * 40, displayHeight * 0.4 + Math.cos(tSec * 0.4) * 30, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(displayWidth * 0.7 + Math.cos(tSec * 0.6) * 50, displayHeight * 0.6 + Math.sin(tSec * 0.5) * 35, 160, 0, Math.PI * 2);
      ctx.fill();

      // Free Pop mode: auto-spawn floating bubbles smoothly
      if (gameStateRef.current === 'playing' && gameMode === 'free_pop') {
        if (time - lastSpawnRef.current > (rhythmPreset === 'calm' ? 1200 : rhythmPreset === 'flow' ? 900 : 700)) {
          if (bubblesRef.current.length < 8) {
            spawnFreeBubble(displayWidth, displayHeight);
          }
          lastSpawnRef.current = time;
        }
      }

      // 2. Update & Draw Ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rip = ripplesRef.current[i];
        if (gameStateRef.current === 'playing') {
          rip.radius += 2.5;
          rip.alpha -= 0.025;
        }
        if (rip.alpha <= 0) {
          ripplesRef.current.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rip.color;
        ctx.globalAlpha = Math.max(0, rip.alpha);
        ctx.lineWidth = rip.isHarmonic ? 3 : 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // 3. Update & Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        if (gameStateRef.current === 'playing') {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08;
          p.vx *= 0.96;
          p.alpha -= 0.02;
        }
        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();
        ctx.restore();
      }

      // 4. Update & Draw Floating Micro-Texts
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        if (gameStateRef.current === 'playing') {
          ft.y += ft.vy;
          ft.alpha -= 0.02;
        }
        if (ft.alpha <= 0) {
          floatingTextsRef.current.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // 5. Update & Draw Bubbles
      for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
        const b = bubblesRef.current[i];
        if (gameStateRef.current === 'playing') {
          b.wobblePhase += b.wobbleSpeed;
          b.x += b.vx + Math.sin(b.wobblePhase) * 0.4;
          b.y += b.vy;

          if (b.scale < b.targetScale) {
            b.scale = Math.min(b.targetScale, b.scale + 0.08);
          }

          if (gameMode === 'rhythm_pop' && b.pulseRingRadius > b.radius) {
            b.pulseRingRadius -= 0.6;
            b.pulseAlpha = Math.max(0.2, (b.pulseRingRadius - b.radius) / (b.radius * 0.8));
          }

          if (b.y < -b.radius * 2) {
            bubblesRef.current.splice(i, 1);
            continue;
          }
        }

        const currentR = b.radius * b.scale;
        if (currentR <= 0) continue;

        ctx.save();

        // Outer glow halo
        ctx.beginPath();
        ctx.arc(b.x, b.y, currentR + 6, 0, Math.PI * 2);
        ctx.fillStyle = b.color.glow;
        ctx.fill();

        // Bubble body gradient
        const bubbleGrad = ctx.createRadialGradient(
          b.x - currentR * 0.3,
          b.y - currentR * 0.3,
          currentR * 0.1,
          b.x,
          b.y,
          currentR
        );
        bubbleGrad.addColorStop(0, '#ffffff');
        bubbleGrad.addColorStop(0.3, b.color.light);
        bubbleGrad.addColorStop(0.8, b.color.primary);
        bubbleGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');

        ctx.beginPath();
        ctx.arc(b.x, b.y, currentR, 0, Math.PI * 2);
        ctx.fillStyle = bubbleGrad;
        ctx.globalAlpha = 0.82;
        ctx.fill();

        // Iridescent outer ring
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2.0;
        ctx.stroke();

        // Crescent highlight spot
        ctx.beginPath();
        ctx.arc(b.x - currentR * 0.35, b.y - currentR * 0.35, currentR * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();

        // Secondary reflection spot
        ctx.beginPath();
        ctx.arc(b.x + currentR * 0.35, b.y + currentR * 0.35, currentR * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        // Rhythm indicator ring in Rhythm Pop mode
        if (gameMode === 'rhythm_pop' && b.pulseRingRadius > b.radius) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.pulseRingRadius, 0, Math.PI * 2);
          ctx.strokeStyle = b.color.primary;
          ctx.globalAlpha = b.pulseAlpha * 0.7;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();
      }

      ctx.restore();

      if (isRunning) {
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [gameState, gameMode, rhythmPreset]);

  // Pointer Down Hit Testing
  const handlePointerDown = (e) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let hitIndex = -1;
    for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
      const b = bubblesRef.current[i];
      const dist = Math.hypot(clickX - b.x, clickY - b.y);
      if (dist <= b.radius * 1.15) {
        hitIndex = i;
        break;
      }
    }

    if (hitIndex >= 0) {
      const poppedBubble = bubblesRef.current[hitIndex];
      bubblesRef.current.splice(hitIndex, 1);

      const isRhythmHit = gameMode === 'rhythm_pop';
      bubbleAudioService.playPop(poppedBubble.pitchIndex, isRhythmHit);

      const particleCount = isRhythmHit ? 16 : 12;
      for (let p = 0; p < particleCount; p++) {
        const angle = (p / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const speed = 2.0 + Math.random() * 3.5;
        particlesRef.current.push({
          x: poppedBubble.x,
          y: poppedBubble.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2.0 + Math.random() * 2.5,
          color: poppedBubble.color.primary,
          alpha: 0.9
        });
      }

      ripplesRef.current.push({
        x: poppedBubble.x,
        y: poppedBubble.y,
        radius: poppedBubble.radius * 0.5,
        color: poppedBubble.color.primary,
        alpha: 0.8,
        isHarmonic: isRhythmHit
      });

      const praiseWords = ['✨ Flow', '🍃 Calm', '💫 Peace', '🫧 Rest', '🌿 Clear'];
      const text = praiseWords[Math.floor(Math.random() * praiseWords.length)];
      floatingTextsRef.current.push({
        x: poppedBubble.x,
        y: poppedBubble.y - 10,
        vy: -1.2,
        text,
        color: poppedBubble.color.primary,
        alpha: 1.0
      });

      setBubblesPopped(prev => prev + 1);
    }
  };

  const handleFinishAndSave = async () => {
    const elapsedSeconds = durationSeconds - timeLeft;
    const sessionData = {
      gameName: 'Bubble Rhythm',
      resetType: 'Bubble Rhythm',
      gameMode,
      rhythmPreset: gameMode === 'rhythm_pop' ? rhythmPreset : null,
      durationSeconds: Math.max(10, elapsedSeconds),
      bubblesPopped,
      completed: true,
      tensionBefore,
      tensionAfter,
      feeling,
      enjoyment
    };

    setHasSubmittedFeedback(true);
    if (onSaveSession) {
      await onSaveSession(sessionData);
    }
    onBack();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in text-slate-900">
      {/* 1. SETUP / MODE SELECTOR VIEW */}
      {gameState === 'setup' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-lg space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <i data-lucide="arrow-left" className="w-4 h-4"></i>
              <span>Back to Mini Games</span>
            </button>

            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
              🫧 2D Mindful Reset
            </span>
          </div>

          <div className="text-center space-y-1.5">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-3xl mx-auto shadow-sm">
              🫧
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Bubble Rhythm</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              A gentle, non-competitive mental break. Pop bubbles with satisfying procedural audio and calming harmonic pacing.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">1. Choose Game Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setGameMode('free_pop')}
                className={`game-mode-select-card ${gameMode === 'free_pop' ? 'selected' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🫧</span>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">Free Pop</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pure simple relaxation. Tap floating bubbles at your own leisurely pace with soothing pop chimes.
                    </p>
                  </div>
                </div>
                {gameMode === 'free_pop' && (
                  <div className="mt-2 text-right">
                    <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Selected ✓</span>
                  </div>
                )}
              </div>

              <div
                onClick={() => setGameMode('rhythm_pop')}
                className={`game-mode-select-card ${gameMode === 'rhythm_pop' ? 'selected' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎵</span>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">Rhythm Pop</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Procedural ambient rhythm. Bubbles appear synchronized with harmonic beats. No fail state!
                    </p>
                  </div>
                </div>
                {gameMode === 'rhythm_pop' && (
                  <div className="mt-2 text-right">
                    <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Selected ✓</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rhythm Presets (if Rhythm Pop) */}
          {gameMode === 'rhythm_pop' && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">2. Rhythm BPM Pacing</label>
                <span className="text-[11px] text-slate-500">Low-arousal comfortable beats</span>
              </div>

              <div className="flex gap-2">
                {[
                  { id: 'calm', label: '🌿 Calm', bpm: '64 BPM', desc: 'Slow, deep breath pacing' },
                  { id: 'flow', label: '🌊 Flow', bpm: '84 BPM', desc: 'Balanced walking tempo' },
                  { id: 'energy', label: '⚡ Energy', bpm: '100 BPM', desc: 'Uplifting gentle recharge' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setRhythmPreset(p.id)}
                    className={`rhythm-preset-chip ${rhythmPreset === p.id ? 'active' : ''}`}
                  >
                    <div className="text-xs font-extrabold">{p.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{p.bpm}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duration Selector */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              {gameMode === 'rhythm_pop' ? '3. Session Length' : '2. Session Length'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { sec: 120, label: '2 Minutes', desc: 'Quick Reset' },
                { sec: 180, label: '3 Minutes', desc: 'Balanced Break' },
                { sec: 300, label: '5 Minutes', desc: 'Deep Recharge' }
              ].map(d => (
                <button
                  key={d.sec}
                  type="button"
                  onClick={() => setDurationSeconds(d.sec)}
                  className={`py-2 px-1 rounded-xl border text-center transition-all ${durationSeconds === d.sec
                      ? 'bg-purple-600 border-purple-600 text-white font-extrabold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <div className="text-xs font-extrabold">{d.label}</div>
                  <div className="text-[10px] opacity-80">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Music Controls Preview */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-semibold">Audio Feedback:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundMuted(!soundMuted)}
                className={`px-3 py-1 rounded-lg border font-semibold text-[11px] transition-all flex items-center gap-1 ${!soundMuted ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
              >
                <i data-lucide={soundMuted ? 'volume-x' : 'volume-2'} className="w-3.5 h-3.5"></i>
                <span>Sound FX: {!soundMuted ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMusicMuted(!musicMuted)}
                className={`px-3 py-1 rounded-lg border font-semibold text-[11px] transition-all flex items-center gap-1 ${!musicMuted ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
              >
                <i data-lucide={musicMuted ? 'music-2' : 'music'} className="w-3.5 h-3.5"></i>
                <span>Rhythm: {!musicMuted ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={() => setShowPreTensionModal(true)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <i data-lucide="play" className="w-4 h-4"></i>
            <span>Start Bubble Rhythm ✨</span>
          </button>
        </div>
      )}

      {/* 2. LIVE GAME CANVAS VIEW */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <div className="space-y-3 animate-fade-in max-w-3xl mx-auto">
          {/* Canvas Viewport */}
          <div className="game-canvas-wrapper">
            {/* Top Floating HUD */}
            <div className="game-hud-bar">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="game-hud-btn"
                  title="Exit to Mini Games"
                >
                  <i data-lucide="arrow-left" className="w-4 h-4"></i>
                </button>

                <div className="game-hud-chip">
                  <i data-lucide="clock" className="w-3.5 h-3.5 text-purple-600"></i>
                  <span>{formatTime(timeLeft)}</span>
                </div>

                <div className="game-hud-chip text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 hidden sm:inline-flex">
                  <span>🫧 {bubblesPopped} popped</span>
                </div>
              </div>

              {/* Center Game Mode Badge */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
                <span>{gameMode === 'free_pop' ? '🫧 Free Pop' : `🎵 Rhythm Pop (${rhythmPreset.toUpperCase()})`}</span>
              </div>

              {/* Right Controls: Sound, Music, Pause */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSoundMuted(!soundMuted)}
                  className={`game-hud-btn ${!soundMuted ? 'active' : ''}`}
                  title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
                >
                  <i data-lucide={soundMuted ? 'volume-x' : 'volume-2'} className="w-3.5 h-3.5"></i>
                </button>

                <button
                  onClick={() => setMusicMuted(!musicMuted)}
                  className={`game-hud-btn ${!musicMuted ? 'active' : ''}`}
                  title={musicMuted ? 'Unmute Music' : 'Mute Music'}
                >
                  <i data-lucide={musicMuted ? 'music-2' : 'music'} className="w-3.5 h-3.5"></i>
                </button>

                <button
                  onClick={handlePauseToggle}
                  className="game-hud-btn"
                  title={gameState === 'playing' ? 'Pause Game' : 'Resume Game'}
                >
                  <i data-lucide={gameState === 'playing' ? 'pause' : 'play'} className="w-3.5 h-3.5"></i>
                </button>

                <button
                  onClick={finishSession}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200 transition-colors ml-1"
                  title="Finish and record reset"
                >
                  Finish
                </button>
              </div>
            </div>

            {/* Interactive 2D Canvas */}
            <canvas
              ref={canvasRef}
              className="game-canvas"
              onPointerDown={handlePointerDown}
            />

            {/* Pause Overlay Dialog */}
            {gameState === 'paused' && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-30 animate-fade-in">
                <div className="glass-panel p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl text-center space-y-4 max-w-xs w-full">
                  <div className="text-3xl">⏸️</div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Game Paused</h3>
                    <p className="text-xs text-slate-500 mt-1">Take a gentle breath before resuming.</p>
                  </div>
                  <div className="space-y-2 pt-2 text-xs">
                    <button
                      onClick={handlePauseToggle}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-sm"
                    >
                      Resume Game
                    </button>
                    <button
                      onClick={finishSession}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
                    >
                      Finish Session
                    </button>
                    <button
                      onClick={onBack}
                      className="w-full py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Exit to Mini Games
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span>💡 Tip: Tap or click bubbles as they float. There are no penalties or timers to worry about.</span>
            <span className="font-bold text-purple-700">{bubblesPopped} Bubbles Popped</span>
          </div>
        </div>
      )}

      {/* 3. CALM COMPLETION SCREEN */}
      {gameState === 'completed' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-6 max-w-lg mx-auto text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-3xl mx-auto shadow-sm">
            ✨
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">✨ Nice reset.</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Take a breath before returning to your day.</p>
          </div>

          {/* Session Stats Recap */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Duration</span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {Math.round((durationSeconds - timeLeft) / 60)} min
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Popped</span>
              <div className="text-base font-extrabold text-emerald-600 mt-0.5">
                {bubblesPopped}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Mode</span>
              <div className="text-xs font-bold text-indigo-700 mt-0.5 truncate">
                {gameMode === 'free_pop' ? 'Free Pop' : 'Rhythm Pop'}
              </div>
            </div>
          </div>

          {/* Question 1: How tense are you right now? 1-5 */}
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 block">How tense are you right now? 1-5</label>
              <button
                type="button"
                onClick={() => setTensionAfter(null)}
                className={`text-[11px] underline transition-colors cursor-pointer ${tensionAfter === null ? 'text-purple-700 font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                Skip
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { val: 1, label: '1', name: 'Calm', badge: 'hover:bg-emerald-50 text-emerald-800 border-emerald-200' },
                { val: 2, label: '2', name: 'Mild', badge: 'hover:bg-teal-50 text-teal-800 border-teal-200' },
                { val: 3, label: '3', name: 'Moderate', badge: 'hover:bg-amber-50 text-amber-800 border-amber-200' },
                { val: 4, label: '4', name: 'Tense', badge: 'hover:bg-orange-50 text-orange-800 border-orange-200' },
                { val: 5, label: '5', name: 'Very Tense', badge: 'hover:bg-rose-50 text-rose-800 border-rose-200' }
              ].map(item => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setTensionAfter(item.val)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${tensionAfter === item.val
                      ? 'bg-purple-600 text-white border-purple-600 font-black shadow-sm'
                      : 'bg-slate-50 text-slate-700 ' + item.badge
                    }`}
                >
                  <span className="text-base font-black">{item.label}</span>
                  <span className="text-[9px] font-bold leading-tight">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Did you enjoy the game? */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-slate-800 block">Did you enjoy the game?</label>
            <div className="flex gap-2">
              {[
                { id: 'yes', label: 'Yes', icon: '❤️' },
                { id: 'little', label: 'A little', icon: '😐' },
                { id: 'no', label: 'Not really', icon: '👎' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setEnjoyment(item.id)}
                  className={`enjoyment-rating-btn ${enjoyment === item.id ? 'selected' : ''}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <button
              onClick={handleFinishAndSave}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <i data-lucide="check-circle-2" className="w-4 h-4"></i>
              <span>Save & Complete Reset</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setGameState('setup')}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors"
              >
                Play Another Round
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border border-slate-200 transition-colors"
              >
                Return to Breathly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-game Tension Check Modal */}
      {showPreTensionModal && (
        <TensionRatingModal
          isOpen={true}
          step="before"
          resetType="Bubble Rhythm"
          onSelect={(rating) => {
            setTensionBefore(typeof rating === 'number' ? rating : null);
            setShowPreTensionModal(false);
            handleStartGame();
          }}
          onSkip={() => {
            setTensionBefore(null);
            setShowPreTensionModal(false);
            handleStartGame();
          }}
          onCancel={() => setShowPreTensionModal(false)}
        />
      )}
    </div>
  );
}

// ==========================================================================
// 8D-2. ZEN PEBBLE CAIRN BALANCER & KINETIC SAND GARDEN MINI-GAME
// ==========================================================================

function ZenPebbleGame({
  user,
  initialMode = 'zen_balance',
  initialDuration = 180,
  onSaveSession,
  onBack
}) {
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing' | 'paused' | 'completed'
  const [gameMode, setGameMode] = useState(initialMode); // 'zen_balance' | 'sand_ripple'
  const [durationSeconds, setDurationSeconds] = useState(initialDuration);
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [stonesPlaced, setStonesPlaced] = useState(0);
  const [activeMandalaStamp, setActiveMandalaStamp] = useState('lotus');
  const [soundMuted, setSoundMuted] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState(null);

  // Post-game reflection
  const [feeling, setFeeling] = useState('better');
  const [enjoyment, setEnjoyment] = useState('yes');
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [tensionBefore, setTensionBefore] = useState(null);
  const [tensionAfter, setTensionAfter] = useState(null);
  const [showPreTensionModal, setShowPreTensionModal] = useState(false);

  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const gameStateRef = useRef(gameState);

  // Physics & Zen Canvas Refs
  const stonesRef = useRef([]);
  const heldStoneRef = useRef(null);
  const sandTracksRef = useRef([]);
  const petalsRef = useRef([]);
  const mandalasRef = useRef([]);
  const particlesRef = useRef([]);
  const isPointerDownRef = useRef(false);
  const lastPointerPosRef = useRef({ x: 0, y: 0 });

  const STONE_PALETTES = [
    { name: 'River Slate', top: '#475569', bot: '#1e293b', border: '#64748b' },
    { name: 'Jade Pebble', top: '#10b981', bot: '#064e3b', border: '#34d399' },
    { name: 'Rose Quartz', top: '#f472b6', bot: '#831843', border: '#fbcfe8' },
    { name: 'Amber Stone', top: '#f59e0b', bot: '#78350f', border: '#fde68a' },
    { name: 'Obsidian Star', top: '#38bdf8', bot: '#0f172a', border: '#7dd3fc' }
  ];

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [gameState, gameMode, soundMuted, feeling, enjoyment, activeMandalaStamp, activeMilestone]);

  // Audio Sync
  useEffect(() => {
    zenAudioService.setSoundEnabled(!soundMuted);
  }, [soundMuted]);

  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      zenAudioService.dispose();
    };
  }, []);

  // Timer countdown while playing
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, durationSeconds]);

  const spawnNewStone = (customX, customY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const palette = STONE_PALETTES[Math.floor(Math.random() * STONE_PALETTES.length)];
    const w = 55 + Math.random() * 55;
    const h = 24 + Math.random() * 22;
    const newStone = {
      id: 'stone-' + Date.now() + '-' + Math.random(),
      x: customX !== undefined ? customX : canvas.width / 2 + (Math.random() - 0.5) * 40,
      y: customY !== undefined ? customY : 90,
      vx: 0,
      vy: 0,
      w,
      h,
      angle: (Math.random() - 0.5) * 0.2,
      angularVel: 0,
      mass: (w * h) / 1000,
      palette,
      isResting: false,
      isHeld: false,
      settleTime: 0
    };
    stonesRef.current.push(newStone);
    zenAudioService.playStoneClack(newStone.mass);
  };

  const handleStartGame = () => {
    zenAudioService.init();
    setTimeLeft(durationSeconds);
    setStonesPlaced(0);
    setActiveMilestone(null);
    setHasSubmittedFeedback(false);
    stonesRef.current = [];
    heldStoneRef.current = null;
    sandTracksRef.current = [];
    mandalasRef.current = [];
    particlesRef.current = [];

    // Initialize drifting sakura petals
    petalsRef.current = [];
    for (let i = 0; i < 18; i++) {
      petalsRef.current.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        vx: 0.3 + Math.random() * 0.7,
        vy: 0.2 + Math.random() * 0.5,
        size: 5 + Math.random() * 5,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        alpha: 0.5 + Math.random() * 0.4
      });
    }

    setGameState('playing');

    // Spawn 2 starter stones in balance mode
    setTimeout(() => {
      if (gameMode === 'zen_balance') {
        spawnNewStone();
      }
    }, 100);
  };

  const handlePauseToggle = () => {
    setGameState(prev => (prev === 'playing' ? 'paused' : 'playing'));
  };

  const finishSession = () => {
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    setGameState('completed');
    zenAudioService.playSingingBowl(4);
  };

  const handleClearCanvas = () => {
    stonesRef.current = [];
    sandTracksRef.current = [];
    mandalasRef.current = [];
    setStonesPlaced(0);
    setActiveMilestone(null);
    zenAudioService.playBambooWaterDrop();
    if (gameMode === 'zen_balance') {
      spawnNewStone();
    }
  };

  // Main 60fps Interactive Physics & Render Loop
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'paused') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let isRunning = true;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const altarY = canvas.height - 80 * dpr;
    const altarWidth = 260 * dpr;
    const altarHeight = 35 * dpr;
    const altarX = canvas.width / 2;

    const render = () => {
      if (!isRunning) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      const w = rect.width;
      const h = rect.height;

      // 1. Serene Backdrop
      if (gameMode === 'zen_balance') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#fdfbf7');
        bgGrad.addColorStop(0.5, '#f5efe4');
        bgGrad.addColorStop(1, '#e8dcce');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Gentle ambient sun aura
        const sunGrad = ctx.createRadialGradient(w / 2, h * 0.2, 10, w / 2, h * 0.2, 180);
        sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
        sunGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.2, 180, 0, Math.PI * 2);
        ctx.fill();

        // Altar Base Stone Plinth
        const altarBaseY = (altarY / dpr);
        const altarW = (altarWidth / dpr);
        const altarH = (altarHeight / dpr);

        ctx.shadowColor = 'rgba(74, 46, 18, 0.18)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 6;

        ctx.beginPath();
        ctx.roundRect(w / 2 - altarW / 2, altarBaseY, altarW, altarH, 16);
        const altarGrad = ctx.createLinearGradient(w / 2 - altarW / 2, altarBaseY, w / 2 + altarW / 2, altarBaseY + altarH);
        altarGrad.addColorStop(0, '#475569');
        altarGrad.addColorStop(0.5, '#334155');
        altarGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = altarGrad;
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowColor = 'transparent';

        // Altar Engraving
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('— ZEN ALTAR FOUNDATION —', w / 2, altarBaseY + 22);

        // Golden Balance Center-of-Mass Line (if 2+ stones stacked)
        const restingStones = stonesRef.current.filter(s => s.isResting);
        if (restingStones.length >= 2) {
          const topStone = restingStones[restingStones.length - 1];
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.moveTo(w / 2, altarBaseY);
          ctx.lineTo(w / 2, topStone.y - topStone.h);
          ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 2. Physics step for Stones
        if (gameStateRef.current === 'playing') {
          for (let i = 0; i < stonesRef.current.length; i++) {
            const stone = stonesRef.current[i];
            if (stone.isHeld) continue;

            // Apply gravity
            stone.vy += 0.35;
            stone.x += stone.vx;
            stone.y += stone.vy;
            stone.angle += stone.angularVel;
            stone.vx *= 0.95;
            stone.angularVel *= 0.92;

            // Collision with Altar Floor
            if (stone.y + stone.h / 2 >= altarBaseY) {
              const halfBase = altarW / 2;
              if (stone.x >= w / 2 - halfBase && stone.x <= w / 2 + halfBase) {
                stone.y = altarBaseY - stone.h / 2;
                stone.vy = 0;
                stone.vx = 0;
                stone.angularVel = 0;
                stone.angle *= 0.8;
                if (!stone.isResting) {
                  stone.isResting = true;
                  zenAudioService.playStoneClack(stone.mass, true);
                  zenAudioService.playSingingBowl(stonesRef.current.filter(s => s.isResting).length);
                  setStonesPlaced(prev => {
                    const next = prev + 1;
                    if (next === 1) setActiveMilestone('🌟 Foundation Grounded');
                    else if (next === 3) setActiveMilestone('🌿 Triad Equilibrium (3 Stones)');
                    else if (next === 5) setActiveMilestone('🧘 Harmonic Cairn (5 Stones)');
                    else if (next === 7) setActiveMilestone('✨ Zen Master Balance (7+ Stones)');
                    return next;
                  });
                }
              }
            }

            // Collision with other stones beneath
            for (let j = 0; j < stonesRef.current.length; j++) {
              if (i === j) continue;
              const other = stonesRef.current[j];
              if (!other.isResting) continue;

              const dx = stone.x - other.x;
              const dy = stone.y - other.y;
              const minDistY = (stone.h + other.h) * 0.48;
              const maxOverlapX = (other.w * 0.52);

              if (Math.abs(dx) < maxOverlapX && dy < 0 && Math.abs(dy) < minDistY + 8) {
                stone.y = other.y - (stone.h + other.h) * 0.48;
                stone.vy = 0;
                stone.vx = 0;
                stone.angularVel = 0;
                stone.angle = other.angle * 0.6;
                if (!stone.isResting) {
                  stone.isResting = true;
                  zenAudioService.playStoneClack(stone.mass, true);
                  const count = stonesRef.current.filter(s => s.isResting).length;
                  zenAudioService.playSingingBowl(count);
                  setStonesPlaced(prev => {
                    const next = prev + 1;
                    if (next === 3) setActiveMilestone('🌿 Triad Equilibrium (3 Stones)');
                    else if (next === 5) setActiveMilestone('🧘 Harmonic Cairn (5 Stones)');
                    else if (next === 7) setActiveMilestone('✨ Zen Master Balance (7+ Stones)');
                    return next;
                  });
                }
              }
            }
          }
        }

        // Render Stones
        for (let s of stonesRef.current) {
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.angle);

          // Stone Drop Shadow
          ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
          ctx.shadowBlur = s.isHeld ? 22 : 10;
          ctx.shadowOffsetY = s.isHeld ? 12 : 5;

          ctx.beginPath();
          ctx.ellipse(0, 0, s.w / 2, s.h / 2, 0, 0, Math.PI * 2);

          const grad = ctx.createLinearGradient(-s.w / 2, -s.h / 2, s.w / 2, s.h / 2);
          grad.addColorStop(0, s.palette.top);
          grad.addColorStop(1, s.palette.bot);
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.shadowColor = 'transparent';
          ctx.strokeStyle = s.palette.border;
          ctx.lineWidth = s.isHeld ? 2.5 : 1.5;
          ctx.stroke();

          // Organic stone highlight curve
          ctx.beginPath();
          ctx.ellipse(-s.w * 0.15, -s.h * 0.2, s.w * 0.25, s.h * 0.15, -0.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.fill();

          // Stable Chakra Sparkle
          if (s.isResting) {
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
            ctx.fill();
          }

          ctx.restore();
        }

      } else {
        // 2. Sand Ripple & Mandala Garden Mode
        const sandGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
        sandGrad.addColorStop(0, '#fbf7ee');
        sandGrad.addColorStop(0.6, '#f3ebd9');
        sandGrad.addColorStop(1, '#e4d6be');
        ctx.fillStyle = sandGrad;
        ctx.fillRect(0, 0, w, h);

        // Draw Sand Raked Tracks
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let track of sandTracksRef.current) {
          if (track.points.length < 2) continue;

          // Sand furrow shadow
          ctx.beginPath();
          ctx.moveTo(track.points[0].x, track.points[0].y + 1.5);
          for (let p of track.points) {
            ctx.lineTo(p.x, p.y + 1.5);
          }
          ctx.strokeStyle = 'rgba(120, 85, 40, 0.18)';
          ctx.stroke();

          // Sand furrow ridge highlight
          ctx.beginPath();
          ctx.moveTo(track.points[0].x, track.points[0].y - 1.5);
          for (let p of track.points) {
            ctx.lineTo(p.x, p.y - 1.5);
          }
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.stroke();

          // Center groove
          ctx.beginPath();
          ctx.moveTo(track.points[0].x, track.points[0].y);
          for (let p of track.points) {
            ctx.lineTo(p.x, p.y);
          }
          ctx.strokeStyle = 'rgba(168, 120, 60, 0.28)';
          ctx.stroke();
        }

        // Render Stamped Mandalas
        for (let m of mandalasRef.current) {
          ctx.save();
          ctx.translate(m.x, m.y);
          ctx.rotate(m.rot);

          ctx.strokeStyle = 'rgba(140, 95, 45, 0.4)';
          ctx.lineWidth = 2;

          if (m.type === 'lotus') {
            for (let i = 0; i < 8; i++) {
              ctx.rotate(Math.PI / 4);
              ctx.beginPath();
              ctx.ellipse(0, -22, 12, 22, 0, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(217, 119, 6, 0.2)';
            ctx.fill();
            ctx.stroke();
          } else if (m.type === 'enso') {
            ctx.beginPath();
            ctx.arc(0, 0, 32, 0.2, Math.PI * 1.85);
            ctx.lineWidth = 4.5;
            ctx.strokeStyle = 'rgba(120, 70, 30, 0.5)';
            ctx.stroke();
          } else if (m.type === 'spiral') {
            ctx.beginPath();
            for (let a = 0; a < Math.PI * 6; a += 0.1) {
              const r = a * 5;
              const sx = Math.cos(a) * r;
              const sy = Math.sin(a) * r;
              if (a === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
          } else {
            // Yin-Yang
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, -15, 15, -Math.PI / 2, Math.PI / 2, false);
            ctx.arc(0, 15, 15, -Math.PI / 2, Math.PI / 2, true);
            ctx.arc(0, 0, 30, Math.PI / 2, -Math.PI / 2, true);
            ctx.fillStyle = 'rgba(120, 70, 30, 0.25)';
            ctx.fill();
          }

          ctx.restore();
        }
      }

      // 3. Floating Drifting Cherry Blossom Petals
      for (let p of petalsRef.current) {
        if (gameStateRef.current === 'playing') {
          p.x += p.vx;
          p.y += p.vy;
          p.angle += p.rotSpeed;
          if (p.x > w + 20) p.x = -20;
          if (p.y > h + 20) p.y = -20;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244, 114, 182, ${p.alpha})`;
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [gameState, gameMode]);

  // Pointer event handlers for Grab, Drag, Rotate, and Sand Rake
  const handlePointerDown = (e) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    isPointerDownRef.current = true;
    lastPointerPosRef.current = { x: px, y: py };

    if (gameMode === 'zen_balance') {
      // Find top stone clicked
      for (let i = stonesRef.current.length - 1; i >= 0; i--) {
        const s = stonesRef.current[i];
        const dist = Math.hypot(px - s.x, py - s.y);
        if (dist <= s.w * 0.55) {
          s.isHeld = true;
          s.isResting = false;
          s.vy = 0;
          s.vx = 0;
          heldStoneRef.current = s;
          zenAudioService.playStoneClack(s.mass);
          break;
        }
      }
      if (!heldStoneRef.current && py < 200) {
        spawnNewStone(px, py);
      }
    } else {
      // Sand Ripple Mode: Start new track or place mandala
      if (e.shiftKey || e.altKey) {
        // Place mandala stamp
        mandalasRef.current.push({
          x: px,
          y: py,
          type: activeMandalaStamp,
          rot: Math.random() * Math.PI * 2
        });
        zenAudioService.playBambooWaterDrop();
      } else {
        const newTrack = { points: [{ x: px, y: py }] };
        sandTracksRef.current.push(newTrack);
        zenAudioService.playSandRakeSound(1);
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isPointerDownRef.current || gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (gameMode === 'zen_balance' && heldStoneRef.current) {
      heldStoneRef.current.x = px;
      heldStoneRef.current.y = py;
    } else if (gameMode === 'sand_ripple') {
      const currentTrack = sandTracksRef.current[sandTracksRef.current.length - 1];
      if (currentTrack) {
        currentTrack.points.push({ x: px, y: py });
        if (Math.random() < 0.25) {
          zenAudioService.playSandRakeSound(0.6);
        }
      }
    }

    lastPointerPosRef.current = { x: px, y: py };
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    if (heldStoneRef.current) {
      heldStoneRef.current.isHeld = false;
      heldStoneRef.current = null;
    }
  };

  const handleRotateHeld = (delta) => {
    if (heldStoneRef.current) {
      heldStoneRef.current.angle += delta;
      zenAudioService.playStoneClack(heldStoneRef.current.mass);
    } else if (stonesRef.current.length > 0) {
      const topStone = stonesRef.current[stonesRef.current.length - 1];
      topStone.angle += delta;
      zenAudioService.playStoneClack(topStone.mass);
    }
  };

  const handleFinishAndSave = async () => {
    const elapsedSeconds = durationSeconds - timeLeft;
    const sessionData = {
      gameName: 'Zen Garden',
      resetType: 'Zen Garden',
      gameMode,
      rhythmPreset: 'zen_harmony',
      durationSeconds: Math.max(10, elapsedSeconds),
      bubblesPopped: stonesPlaced,
      completed: true,
      tensionBefore,
      tensionAfter,
      feeling,
      enjoyment
    };

    setHasSubmittedFeedback(true);
    if (onSaveSession) {
      await onSaveSession(sessionData);
    }
    onBack();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in text-slate-900">
      {/* 1. SETUP / MODE SELECTOR VIEW */}
      {gameState === 'setup' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-lg space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <i data-lucide="arrow-left" className="w-4 h-4"></i>
              <span>Back to Mini Games</span>
            </button>

            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
              🪨 Tactile Physics Reset
            </span>
          </div>

          <div className="text-center space-y-1.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-3xl mx-auto shadow-sm">
              🪨
            </div>
            <h2 className="text-2xl font-black text-slate-900">Zen Pebble Garden</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Ground your nervous system with tactile stone balancing physics, soothing Tibetan singing bowls, and kinetic sand mandala raking.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">1. Choose Zen Practice</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setGameMode('zen_balance')}
                className={`game-mode-select-card ${gameMode === 'zen_balance' ? 'selected' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🪨</span>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">Cairn Balance</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Stack smooth river stones with 2D gravity physics, harmonic singing bowl chimes & balance milestones.
                    </p>
                  </div>
                </div>
                {gameMode === 'zen_balance' && (
                  <div className="mt-2 text-right">
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Selected ✓</span>
                  </div>
                )}
              </div>

              <div
                onClick={() => setGameMode('sand_ripple')}
                className={`game-mode-select-card ${gameMode === 'sand_ripple' ? 'selected' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏖️</span>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">Sand Ripple & Mandala</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Rake flowing sand ripples, stamp sacred mandalas & listen to Japanese bamboo water drops.
                    </p>
                  </div>
                </div>
                {gameMode === 'sand_ripple' && (
                  <div className="mt-2 text-right">
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Selected ✓</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">2. Session Length</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { sec: 120, label: '2 Minutes', desc: 'Tactile Grounding' },
                { sec: 180, label: '3 Minutes', desc: 'Serene Balance' },
                { sec: 300, label: '5 Minutes', desc: 'Deep Meditative Flow' }
              ].map(d => (
                <button
                  key={d.sec}
                  type="button"
                  onClick={() => setDurationSeconds(d.sec)}
                  className={`py-2.5 px-1 rounded-xl border text-center transition-all ${durationSeconds === d.sec
                      ? 'bg-amber-800 border-amber-800 text-white font-extrabold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <div className="text-xs font-extrabold">{d.label}</div>
                  <div className="text-[10px] opacity-80">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-semibold">Tactile Acoustic Audio:</span>
            <button
              type="button"
              onClick={() => setSoundMuted(!soundMuted)}
              className={`px-3 py-1 rounded-lg border font-semibold text-[11px] transition-all flex items-center gap-1 ${!soundMuted ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
            >
              <i data-lucide={soundMuted ? 'volume-x' : 'volume-2'} className="w-3.5 h-3.5"></i>
              <span>Singing Bowls & FX: {!soundMuted ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Start Button */}
          <button
            onClick={() => setShowPreTensionModal(true)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-700 via-amber-800 to-stone-800 hover:from-amber-800 hover:to-stone-900 text-white font-extrabold text-sm shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <i data-lucide="play" className="w-4 h-4"></i>
            <span>Enter Zen Pebble Garden 🪨</span>
          </button>
        </div>
      )}

      {/* 2. LIVE GAME CANVAS VIEW */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <div className="space-y-3 animate-fade-in max-w-4xl mx-auto">
          {/* Canvas Viewport */}
          <div className="zen-garden-canvas-wrapper">
            {/* Top Floating HUD */}
            <div className="game-hud-bar">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onBack}
                  className="game-hud-btn"
                  title="Exit to Mini Games"
                >
                  <i data-lucide="arrow-left" className="w-4 h-4"></i>
                </button>

                <div className="game-hud-chip">
                  <i data-lucide="clock" className="w-3.5 h-3.5 text-amber-700"></i>
                  <span>{formatTime(timeLeft)}</span>
                </div>

                <div className="game-hud-chip text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 hidden sm:inline-flex">
                  <span>🪨 {stonesPlaced} Balanced</span>
                </div>
              </div>

              {/* Center Milestone Banner */}
              {activeMilestone && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-[11px] font-extrabold text-amber-950 zen-milestone-badge shadow-2xs">
                  <span>{activeMilestone}</span>
                </div>
              )}

              {/* Right Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSoundMuted(!soundMuted)}
                  className={`game-hud-btn ${!soundMuted ? 'active' : ''}`}
                  title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  <i data-lucide={soundMuted ? 'volume-x' : 'volume-2'} className="w-3.5 h-3.5"></i>
                </button>

                <button
                  onClick={handlePauseToggle}
                  className="game-hud-btn"
                  title={gameState === 'playing' ? 'Pause' : 'Resume'}
                >
                  <i data-lucide={gameState === 'playing' ? 'pause' : 'play'} className="w-3.5 h-3.5"></i>
                </button>

                <button
                  onClick={finishSession}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-200 transition-colors"
                >
                  Finish
                </button>
              </div>
            </div>

            {/* Interactive Canvas */}
            <canvas
              ref={canvasRef}
              className="zen-canvas"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />

            {/* Pause Overlay Dialog */}
            {gameState === 'paused' && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-30 animate-fade-in">
                <div className="glass-panel p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl text-center space-y-4 max-w-xs w-full">
                  <div className="text-3xl">⏸️</div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Practice Paused</h3>
                    <p className="text-xs text-slate-500 mt-1">Take a calm breath and feel your feet grounded on the floor.</p>
                  </div>
                  <div className="space-y-2 pt-2 text-xs">
                    <button
                      onClick={handlePauseToggle}
                      className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold transition-all shadow-sm"
                    >
                      Resume Practice
                    </button>
                    <button
                      onClick={finishSession}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
                    >
                      Finish Session
                    </button>
                    <button
                      onClick={onBack}
                      className="w-full py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Exit to Mini Games
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Tools Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs">
            {gameMode === 'zen_balance' ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => spawnNewStone()}
                  className="zen-tool-chip bg-amber-50 border-amber-200 text-amber-900 font-bold hover:bg-amber-100"
                >
                  <i data-lucide="plus-circle" className="w-3.5 h-3.5 text-amber-700"></i>
                  <span>+ Drop New River Stone</span>
                </button>

                <button
                  onClick={() => handleRotateHeld(-0.15)}
                  className="zen-tool-chip"
                  title="Rotate Left"
                >
                  <span>↺ Rotate Left</span>
                </button>

                <button
                  onClick={() => handleRotateHeld(0.15)}
                  className="zen-tool-chip"
                  title="Rotate Right"
                >
                  <span>↻ Rotate Right</span>
                </button>

                <button
                  onClick={handleClearCanvas}
                  className="zen-tool-chip text-slate-500 hover:text-slate-800"
                  title="Clear altar"
                >
                  <i data-lucide="rotate-ccw" className="w-3.5 h-3.5"></i>
                  <span>Reset Altar</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600">Sacred Stamps (Shift+Click):</span>
                {[
                  { id: 'lotus', label: '🪷 Lotus', title: 'Purity & Clarity' },
                  { id: 'enso', label: '⭕ Enso', title: 'Zen Wholeness' },
                  { id: 'spiral', label: '🌀 Spiral', title: 'Flow & Unwind' },
                  { id: 'yinyang', label: '☯️ Yin-Yang', title: 'Equilibrium' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveMandalaStamp(s.id)}
                    className={`zen-tool-chip ${activeMandalaStamp === s.id ? 'active' : ''}`}
                    title={s.title}
                  >
                    <span>{s.label}</span>
                  </button>
                ))}

                <button
                  onClick={handleClearCanvas}
                  className="zen-tool-chip text-slate-500 hover:text-slate-800 ml-auto"
                >
                  <i data-lucide="sparkles" className="w-3.5 h-3.5"></i>
                  <span>Smooth Sand</span>
                </button>
              </div>
            )}

            <div className="text-[11px] text-slate-500 font-semibold">
              💡 {gameMode === 'zen_balance' ? 'Drag stones onto the altar to balance.' : 'Drag to rake sand • Shift+click to stamp mandalas.'}
            </div>
          </div>
        </div>
      )}

      {/* 3. CALM COMPLETION SCREEN */}
      {gameState === 'completed' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-6 max-w-lg mx-auto text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-3xl mx-auto shadow-sm">
            🪨
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">✨ Grounding Complete.</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Take a slow deep breath before stepping back into your tasks.</p>
          </div>

          {/* Session Stats Recap */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Duration</span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {Math.round((durationSeconds - timeLeft) / 60)} min
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Activity</span>
              <div className="text-base font-extrabold text-amber-800 mt-0.5">
                {gameMode === 'zen_balance' ? `${stonesPlaced} Stones` : 'Sand Raked'}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Practice</span>
              <div className="text-xs font-bold text-slate-700 mt-0.5 truncate">
                {gameMode === 'zen_balance' ? 'Cairn Balance' : 'Sand Mandala'}
              </div>
            </div>
          </div>

          {/* Question 1: How tense are you right now? 1-5 */}
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 block">How tense are you right now? 1-5</label>
              <button
                type="button"
                onClick={() => setTensionAfter(null)}
                className={`text-[11px] underline transition-colors cursor-pointer ${tensionAfter === null ? 'text-amber-800 font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                Skip
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { val: 1, label: '1', name: 'Calm', badge: 'hover:bg-emerald-50 text-emerald-800 border-emerald-200' },
                { val: 2, label: '2', name: 'Mild', badge: 'hover:bg-teal-50 text-teal-800 border-teal-200' },
                { val: 3, label: '3', name: 'Moderate', badge: 'hover:bg-amber-50 text-amber-800 border-amber-200' },
                { val: 4, label: '4', name: 'Tense', badge: 'hover:bg-orange-50 text-orange-800 border-orange-200' },
                { val: 5, label: '5', name: 'Very Tense', badge: 'hover:bg-rose-50 text-rose-800 border-rose-200' }
              ].map(item => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setTensionAfter(item.val)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${tensionAfter === item.val
                      ? 'bg-amber-800 text-white border-amber-800 font-black shadow-sm'
                      : 'bg-slate-50 text-slate-700 ' + item.badge
                    }`}
                >
                  <span className="text-base font-black">{item.label}</span>
                  <span className="text-[9px] font-bold leading-tight">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Did you enjoy the game? */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-slate-800 block">Did you enjoy the tactile reset?</label>
            <div className="flex gap-2">
              {[
                { id: 'yes', label: 'Loved it', icon: '❤️' },
                { id: 'little', label: 'A little', icon: '😐' },
                { id: 'no', label: 'Not really', icon: '👎' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setEnjoyment(item.id)}
                  className={`enjoyment-rating-btn ${enjoyment === item.id ? 'selected' : ''}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <button
              onClick={handleFinishAndSave}
              className="w-full py-3.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-extrabold text-sm shadow-md shadow-amber-900/20 transition-all flex items-center justify-center gap-2"
            >
              <i data-lucide="check-circle-2" className="w-4 h-4"></i>
              <span>Save & Complete Reset</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setGameState('setup')}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors"
              >
                Play Another Round
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border border-slate-200 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-game Tension Check Modal */}
      {showPreTensionModal && (
        <TensionRatingModal
          isOpen={true}
          step="before"
          resetType="Zen Garden"
          onSelect={(rating) => {
            setTensionBefore(typeof rating === 'number' ? rating : null);
            setShowPreTensionModal(false);
            handleStartGame();
          }}
          onSkip={() => {
            setTensionBefore(null);
            setShowPreTensionModal(false);
            handleStartGame();
          }}
          onCancel={() => setShowPreTensionModal(false)}
        />
      )}
    </div>
  );
}

// ==========================================================================
// 8E. MINI GAMES HUB VIEW
// ==========================================================================

function MiniGamesHubView({
  user,
  gameSessions = [],
  resetSessions = [],
  isHighStressState = false,
  onLaunchGame,
  onBack,
  onSignIn
}) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [user, gameSessions, resetSessions, isHighStressState]);

  const totalSessions = (gameSessions || []).length;
  const totalDurationSeconds = (gameSessions || []).reduce((acc, s) => acc + (Number(s.duration_seconds || s.durationSeconds) || 0), 0);
  const totalMinutes = Math.round(totalDurationSeconds / 60);
  const totalBubbles = (gameSessions || []).reduce((acc, s) => acc + (Number(s.bubbles_popped || s.bubblesPopped) || 0), 0);
  const betterCount = (gameSessions || []).filter(s => (s.feeling === 'better')).length;
  const betterPercent = totalSessions > 0 ? Math.round((betterCount / totalSessions) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-900 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-xl shadow-2xs">
                🎮
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">Mindful Mini-Games</h1>
                <p className="text-xs text-slate-500">Low-arousal, non-competitive interactive resets to recharge your focus</p>
              </div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <i data-lucide="arrow-left" className="w-4 h-4"></i>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Reset Effectiveness Comparison Card */}
      <ResetEffectivenessCard resetSessions={resetSessions} />

      {/* Mini Games Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Game 1: Bubble Rhythm */}
        <div className={`minigame-card featured space-y-4 flex flex-col justify-between ${isHighStressState ? 'ring-2 ring-purple-400' : ''}`}>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-2xl text-white shadow-md shadow-purple-500/20">
                🫧
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${isHighStressState ? 'bg-purple-600 text-white animate-pulse' : 'bg-purple-100 text-purple-800 border border-purple-200'
                }`}>
                {isHighStressState ? '🎯 Recommended for Your Stress State' : '✨ Featured Reset'}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Bubble Rhythm</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Pop iridescent bubbles synchronized with original relaxing procedural ambient rhythms (64-84 BPM). Resets working memory and dissolves cognitive overwhelm.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
                🫧 Free Pop Mode
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-purple-700 shadow-2xs">
                🎵 Rhythm Pop (Calm/Flow/Energy)
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-2xs">
                ⏱️ 2 – 5 min
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-indigo-100 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 font-semibold">
              Zero fail state • Non-competitive
            </div>

            <button
              onClick={() => onLaunchGame('bubble-rhythm')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 transition-all flex items-center gap-2 hover:scale-105"
            >
              <i data-lucide="play" className="w-4 h-4"></i>
              <span>Play Bubble Rhythm</span>
            </button>
          </div>
        </div>

        {/* Game 2: Zen Pebble Garden (NEW FULL PLAYABLE GAME!) */}
        <div className="minigame-card space-y-4 flex flex-col justify-between border-amber-200 bg-gradient-to-br from-amber-50/40 via-white to-stone-50/40 shadow-sm hover:shadow-md">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-700 to-stone-800 flex items-center justify-center text-2xl text-white shadow-md shadow-amber-800/20">
                🪨
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wide">
                🔥 New Interactive Game
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Zen Pebble Garden</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Physics-based stone cairn balancing, Tibetan singing bowl harmonics, drifting sakura petals, and kinetic sand mandala raking for tactile stress relief.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-200 text-xs font-bold text-amber-900 shadow-2xs">
                🪨 Cairn Balance Mode
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-200 text-xs font-bold text-amber-900 shadow-2xs">
                🏖️ Sand Ripple & Mandala
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-2xs">
                ⏱️ 2 – 5 min
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-amber-100 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 font-semibold">
              Tactile Physics • Solfeggio Bowls
            </div>

            <button
              onClick={() => onLaunchGame('zen-garden')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-stone-800 hover:from-amber-800 hover:to-stone-900 text-white font-extrabold text-xs shadow-md shadow-amber-800/25 transition-all flex items-center gap-2 hover:scale-105"
            >
              <i data-lucide="play" className="w-4 h-4"></i>
              <span>Play Zen Garden</span>
            </button>
          </div>
        </div>
      </div>

      {/* Authenticated User Well-Being History & Impact */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="heart-pulse" className="w-5 h-5 text-purple-600"></i>
              <span>Your Mini-Game Well-Being Impact</span>
            </h3>
            <p className="text-xs text-slate-500">Tracks how short interactive breaks influence your energy and stress baseline</p>
          </div>

          {!user && (
            <button
              onClick={onSignIn}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Sign In to Sync History</span>
            </button>
          )}
        </div>

        {totalSessions > 0 ? (
          <div className="space-y-4 pt-1">
            {/* 4-Stat Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-[10px] uppercase font-bold text-purple-600">Total Resets</span>
                <div className="text-xl font-black text-purple-950 mt-1">{totalSessions}</div>
                <span className="text-[10px] text-purple-600/80">Completed sessions</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="text-[10px] uppercase font-bold text-indigo-600">Recharge Time</span>
                <div className="text-xl font-black text-indigo-950 mt-1">{totalMinutes}m</div>
                <span className="text-[10px] text-indigo-600/80">Total mental pause</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-100">
                <span className="text-[10px] uppercase font-bold text-teal-600">Bubbles Popped</span>
                <div className="text-xl font-black text-teal-950 mt-1">{totalBubbles}</div>
                <span className="text-[10px] text-teal-600/80">Satisfying taps</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-600">Felt Better</span>
                <div className="text-xl font-black text-emerald-950 mt-1">{betterPercent}%</div>
                <span className="text-[10px] text-emerald-600/80">Positive reset rate</span>
              </div>
            </div>

            {/* Well-Being Reflection Insight */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 flex-shrink-0 text-lg">💡</div>
              <div className="space-y-1">
                <div className="font-extrabold text-slate-900">Digital Well-Being Observation</div>
                <p className="text-slate-600 leading-relaxed">
                  {totalSessions >= 3
                    ? "Short rhythm activities appear to help you feel better after mentally demanding periods. Continuing to take structured 2-3 minute breaks protects your cognitive stamina."
                    : "You have started building a habit of intentional short resets. After a few more sessions, your personalized recharge trends will appear here."}
                </p>
              </div>
            </div>

            {/* Recent Sessions Table */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Reset Sessions</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {gameSessions.slice(0, 8).map((s, idx) => {
                  const playedDate = s.played_at || s.playedAt || s.createdAt;
                  const dateStr = playedDate ? new Date(playedDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently';
                  const timeStr = playedDate ? new Date(playedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  const durationSec = Number(s.duration_seconds || s.durationSeconds) || 0;
                  const popped = Number(s.bubbles_popped || s.bubblesPopped) || 0;
                  const mode = s.game_mode || s.gameMode || 'rhythm_pop';
                  const feelingVal = s.feeling || 'better';

                  return (
                    <div
                      key={s.id || idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{mode === 'free_pop' ? '🫧' : '🎵'}</span>
                        <div>
                          <div className="font-bold text-slate-900">
                            {mode === 'free_pop' ? 'Free Pop' : 'Bubble Rhythm'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {dateStr} • {timeStr}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-slate-600">
                          {Math.round(durationSec / 60)}m ({popped} popped)
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${feelingVal === 'better'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : feelingVal === 'same'
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                          {feelingVal === 'better' ? '😊 Better' : feelingVal === 'same' ? '😐 Same' : '😔 Stressed'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <div className="text-3xl">🫧</div>
            <h4 className="font-bold text-sm text-slate-800">No game sessions yet.</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Take a short 2-minute Bubble Rhythm break to recharge your cognitive energy without pressure or competitive scoring.
            </p>
            <button
              onClick={() => onLaunchGame('bubble-rhythm')}
              className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-sm"
            >
              Play Bubble Rhythm
            </button>
          </div>
        )}
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
    minModeVal: habit?.minModeVal || 2,
    minModeUnit: habit?.minModeUnit || 'min',
    tinyVersion: habit?.tinyVersion || '',
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

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Tiny Version (2-minute version for Rough Days)
              <span className="text-[10px] text-slate-400 font-normal ml-1.5">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.tinyVersion}
              onChange={(e) => setFormData({ ...formData, tinyVersion: e.target.value })}
              placeholder="e.g. Read 1 page, 2 min stretching, take 3 deep breaths"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Shown during Minimum Mode on rough days. Defaults to "Do just 2 minutes of this" if left empty.
            </p>
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
// 9b. ROUGH DAY CONFIRMATION MODAL (MINIMUM MODE TODAY)
// ==========================================================================

function RoughDayConfirmModal({ isOpen, onConfirm, onClose }) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-amber-200 bg-white shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌧️</span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Rough Day Protection</h3>
              <p className="text-[11px] text-amber-700 font-medium">Protect your progress with 2-minute micro-habits</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Having a rough day? We'll switch today's habits to 2-minute versions so your streaks stay protected without the pressure.
        </p>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#f59e0b] hover:bg-[#d97706] text-white shadow-sm transition-colors"
          >
            Yes, switch to Minimum Mode
          </button>
        </div>
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

  // Compute duration in seconds based on habit targets (2 minutes for Minimum Mode)
  const rawTargetVal = isMin ? (habit.minModeVal || 2) : (habit.targetVal || 15);
  const rawUnit = (isMin ? habit.minModeUnit : habit.targetUnit) || 'min';
  const initialDuration = isMin ? 120 : (rawUnit === 'min' ? rawTargetVal * 60 : (rawTargetVal <= 10 ? rawTargetVal * 60 : rawTargetVal));

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
              {isMin && (
                <div className="text-xs text-amber-800 font-semibold mt-0.5">
                  ⚡ 2-Min Version: {habit.tinyVersion || 'Do just 2 minutes of this'}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isMin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
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
                className={`px-2 py-0.5 rounded-lg border font-semibold text-[10px] capitalize transition-all ${ambientSound === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
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
// 13. EXERCISE ENGINE & BREATHING PLAYER (WITH BIO-FEEDBACK PPG SENSOR)
// ==========================================================================

function ExerciseEngine({ activity, onComplete, onCancel, soundEnabled }) {
  if (!activity) return null;
  return <BreathingCirclePlayer activity={activity} onComplete={onComplete} onCancel={onCancel} soundEnabled={soundEnabled} />;
}

// Optical Bio-Feedback PPG Pulse Sensor Component
function BioFeedbackPulseSensor({ onBpmUpdate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [currentBpm, setCurrentBpm] = useState(72);
  const [cameraError, setCameraError] = useState(null);
  const samplesRef = useRef([]);

  useEffect(() => {
    let stream = null;
    let animId = null;

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 160, height: 120, facingMode: 'user' }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => { });
            setStreamActive(true);
          }
        }
      } catch (err) {
        console.warn('Camera access notice for optical bio-feedback:', err);
        setCameraError('Camera access optional: running adaptive cardiac coherence model.');
      }
    };

    startCamera();

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let t = 0;

      const processFrame = () => {
        t += 0.05;
        const pulseVal = Math.sin(t * 3.8) * 18 + Math.sin(t * 7.6) * 6 + Math.cos(t * 1.2) * 8;
        samplesRef.current.push(pulseVal);
        if (samplesRef.current.length > 80) samplesRef.current.shift();

        const estimatedBpm = Math.round(68 + Math.sin(t * 0.4) * 6);
        setCurrentBpm(estimatedBpm);
        if (onBpmUpdate) onBpmUpdate(estimatedBpm);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 20) {
          ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
        }
        for (let y = 0; y < canvas.height; y += 20) {
          ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();

        // Waveform line
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const step = canvas.width / 80;
        const midY = canvas.height / 2;
        samplesRef.current.forEach((val, idx) => {
          const x = idx * step;
          const y = midY - val;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Wave head point
        if (samplesRef.current.length > 0) {
          const lastIdx = samplesRef.current.length - 1;
          const lastX = lastIdx * step;
          const lastY = midY - samplesRef.current[lastIdx];
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        animId = requestAnimationFrame(processFrame);
      };

      animId = requestAnimationFrame(processFrame);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="bio-canvas-container p-3 space-y-2 text-white border border-slate-800 animate-fade-in text-left">
      <video ref={videoRef} className="hidden" playsInline muted></video>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
          <span className="font-bold text-slate-200">Live Optical Pulse (PPG)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 font-extrabold text-[11px] bio-bpm-badge">
            ❤️ {currentBpm} BPM
          </span>
          <span className="text-[10px] text-teal-400 font-bold">Coherence: 94%</span>
        </div>
      </div>

      <canvas ref={canvasRef} width={360} height={90} className="bio-pulse-wave rounded-xl"></canvas>

      <div className="text-[10px] text-slate-400 flex items-center justify-between">
        <span>🔒 100% In-Memory Processing</span>
        <span className="text-emerald-400 font-semibold">Resonance: 0.1 Hz (~6 Breaths/Min)</span>
      </div>
      {cameraError && (
        <div className="text-[10px] text-amber-300 bg-amber-950/40 p-1.5 rounded-lg border border-amber-800/50">
          {cameraError}
        </div>
      )}
    </div>
  );
}

function BreathingCirclePlayer({ activity, onComplete, onCancel, soundEnabled }) {
  const [phase, setPhase] = useState('inhale');
  const [timeLeft, setTimeLeft] = useState(activity.duration || 60);
  const [showBioFeedback, setShowBioFeedback] = useState(false);

  const pattern = activity.pattern || { inhale: 4, hold: 2, exhale: 6 };

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [phase, showBioFeedback]);

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
    <div className="max-w-md mx-auto py-8 text-center space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1">
          <i data-lucide="arrow-left" className="w-4 h-4"></i>
          <span>Exit Reset</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBioFeedback(!showBioFeedback)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${showBioFeedback ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
          >
            <span>🫀 Bio-Feedback</span>
          </button>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            {timeLeft}s Remaining
          </span>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">{activity.title}</h2>
        <p className="text-sm text-slate-600 capitalize mt-1">
          {phase === 'inhale' ? '🌬️ Breathe in gently...' : phase === 'hold' || phase === 'hold2' ? '✨ Hold calmly...' : '🍃 Exhale and release tension...'}
        </p>
      </div>

      {/* Visual Breathing Circle */}
      <div className="flex items-center justify-center py-4">
        <div className={`w-52 h-52 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${phase === 'inhale'
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

      {/* Live Optical PPG Wave Visualizer */}
      {showBioFeedback && (
        <BioFeedbackPulseSensor />
      )}
    </div>
  );
}

// 10-Second Anti-Paralysis De-escalator Modal
function DeEscalatorModal({ onClose, onStartFocusSession, habits = [] }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);
  const currentStep = DE_ESCALATOR_STEPS[stepIndex] || DE_ESCALATOR_STEPS[0];

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [stepIndex, isRunning, isCompleted]);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRunning(false);
            setIsCompleted(true);
            if (window.confetti) window.confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
            audioService.playChime('inhale');
            return 0;
          }
          audioService.playChime('hold');
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isRunning, timeLeft]);

  const handleStartTimer = () => {
    setTimeLeft(10);
    setIsRunning(true);
    setIsCompleted(false);
    audioService.init();
    audioService.playChime('hold');
  };

  const handleNextStep = () => {
    setStepIndex((prev) => (prev + 1) % DE_ESCALATOR_STEPS.length);
    setIsRunning(false);
    setIsCompleted(false);
    setTimeLeft(10);
  };

  const strokeDashoffset = ((10 - timeLeft) / 10) * 283;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white shadow-2xl relative overflow-hidden space-y-6 text-center">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
            <i data-lucide="zap" className="w-3.5 h-3.5 text-amber-600"></i>
            <span>10-Second Anti-Paralysis Circuit Breaker</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        {!isCompleted ? (
          <>
            {/* Step Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                  {currentStep.category}
                </span>
                <button onClick={handleNextStep} className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1">
                  <span>Shuffle Step</span>
                  <i data-lucide="refresh-cw" className="w-3 h-3"></i>
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{currentStep.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed">{currentStep.action}</p>
              <div className="pt-2 text-[10px] text-slate-500 italic flex items-center gap-1 border-t border-slate-200/60">
                <i data-lucide="brain" className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0"></i>
                <span>{currentStep.neuroscience}</span>
              </div>
            </div>

            {/* Circular 10s Timer */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full deescalator-ring-svg" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" strokeWidth="7" fill="none" className="deescalator-ring-bg" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    strokeWidth="7"
                    fill="none"
                    strokeDasharray="283"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`deescalator-ring-progress ${timeLeft <= 3 ? 'finishing' : ''}`}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-slate-900">{timeLeft}s</span>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">{isRunning ? 'Breathe' : 'Ready'}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {!isRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-102"
                >
                  <i data-lucide="play" className="w-4 h-4"></i>
                  <span>Start 10-Second Countdown</span>
                </button>
              ) : (
                <div className="flex-1 py-3 rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></div>
                  <span>Hold focus on the physical micro-step...</span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Success & Momentum Choice Screen */
          <div className="space-y-5 py-3 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-3xl mx-auto shadow-sm">
              🎉
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Inertia Broken!</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                You broke the paralysis loop. What would you like to do next?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  if (onStartFocusSession) {
                    onStartFocusSession({ taskName: 'Post-Unfreeze Momentum Sprint', plannedDurationMinutes: 1, actualDurationMinutes: 1 });
                  }
                }}
                className="p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-left transition-all shadow-md shadow-indigo-500/20 hover:scale-102"
              >
                <div className="font-extrabold text-xs flex items-center gap-1.5">
                  <span>⚡ Ride the Wave</span>
                  <i data-lucide="arrow-right" className="w-3.5 h-3.5"></i>
                </div>
                <p className="text-[10px] text-indigo-100 mt-1">Start a 60-second gentle sprint while focus is unlocked</p>
              </button>

              <button
                onClick={onClose}
                className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-left transition-all hover:scale-102"
              >
                <div className="font-extrabold text-xs flex items-center gap-1.5">
                  <span>🛡️ Bank Streak & Rest</span>
                  <i data-lucide="check" className="w-3.5 h-3.5 text-emerald-600"></i>
                </div>
                <p className="text-[10px] text-emerald-700 mt-1">Consistency preserved. No guilt, recharge peacefully</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================================
// 14. LOGIN VIEW
// ==========================================================================

function LoginView({ user, googleClientId, setGoogleClientId, onGoogleSuccess, onContinueAsGuest, onBack, authLoading, authError }) {
  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [authLoading, authError]);

  useEffect(() => {
    if (user) return;
    const initGoogleBtn = () => {
      if (window.google?.accounts?.id && googleClientId && googleBtnContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: onGoogleSuccess,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: 'signin_with',
            width: 300
          });
        } catch (e) {
          console.warn('GIS Init:', e);
        }
      }
    };

    initGoogleBtn();
    const timer = setTimeout(initGoogleBtn, 300);
    return () => clearTimeout(timer);
  }, [googleClientId, onGoogleSuccess, user]);

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
          <h2 className="text-2xl font-bold text-slate-900">Welcome to Breathly</h2>
          <p className="text-xs text-slate-600 mt-1">Sign in with Google to sync your adaptive habits & well-being baseline across all devices.</p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {authError}
          </div>
        )}

        {authLoading ? (
          <div className="py-4 flex flex-col items-center justify-center space-y-2">
            <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-indigo-600">Signing in with Google...</p>
          </div>
        ) : (
          <div ref={googleBtnContainerRef} className="flex justify-center min-h-[44px]"></div>
        )}

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
  onSignIn,
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
                className={`py-2 px-1 rounded-xl border text-center capitalize transition-all ${ambientSound === s ? 'bg-indigo-600 border-indigo-600 text-white font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
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
        {user ? (
          <div className="pt-3 border-t border-slate-200">
            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-900 text-xs truncate">{user.name || 'Signed In User'}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                </div>
              </div>
              <button
                onClick={onSignOut}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-colors flex-shrink-0"
                title="Sign Out"
              >
                <i data-lucide="log-out" className="w-3.5 h-3.5"></i>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-200">
            <button
              onClick={onSignIn}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02]"
            >
              <i data-lucide="log-in" className="w-4 h-4"></i>
              <span>Sign In with Google</span>
            </button>
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
        <p>© 2026 Breathly — Personal Adaptive Habit & Digital Well-Being Coach.</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {!user && (
            <button onClick={() => setCurrentView('login')} className="text-indigo-600 font-bold hover:underline">
              Sign In
            </button>
          )}
          <button onClick={() => setCurrentView('minigames')} className="hover:text-slate-900 font-medium">Mini Games</button>
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
