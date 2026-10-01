// ==========================================================================
// BREATHLY — Personalized Well-Being Recommendation Engine
// Multi-Factor Intervention Scoring: Preferences + Context + History + Variety
// ==========================================================================

const pool = require('../config/db');

// The 9 Well-Being Intervention Categories
const INTERVENTIONS = {
  social_connection: {
    type: 'social_connection',
    title: 'Connect With Someone You Trust',
    tag: 'Social Connection',
    icon: 'users',
    shortLabel: 'Connect with someone',
    description: 'Consider spending some time with someone you trust today — a friend, family member, or someone you feel comfortable with.',
    actionRoute: 'social',
    modalType: 'social_connection',
    defaultDurationMin: 15,
    preferredTime: 'anytime'
  },
  outdoor_walk: {
    type: 'outdoor_walk',
    title: 'Outdoor Walk & Change of Scene',
    tag: 'Environment Change',
    icon: 'footprints',
    shortLabel: 'Take a short walk',
    description: 'A short 10–15 minute walk may help you reset. If possible, step outside for fresh air and gentle natural light.',
    actionRoute: 'walk',
    modalType: 'outdoor_walk',
    defaultDurationMin: 12,
    preferredTime: 'daytime'
  },
  breathing: {
    type: 'breathing',
    title: 'Guided Resonant Breathing',
    tag: 'Physiological Reset',
    icon: 'wind',
    shortLabel: 'Try breathing',
    description: 'Take a few minutes for a guided breathing session (such as 4-2-6 or Coherent 5-5) to regulate autonomic balance.',
    actionRoute: 'breathing',
    modalType: 'breathing_session',
    defaultDurationMin: 2,
    preferredTime: 'anytime'
  },
  light_exercise: {
    type: 'light_exercise',
    title: 'Light Movement & Gentle Stretch',
    tag: 'Physical Decompression',
    icon: 'activity',
    shortLabel: 'Light stretch & move',
    description: 'A 5-minute sequence of gentle shoulder rolls, neck releases, and standing stretches to dispel physical tension.',
    actionRoute: 'exercise',
    modalType: 'light_movement',
    defaultDurationMin: 5,
    preferredTime: 'daytime'
  },
  bubble_rhythm: {
    type: 'bubble_rhythm',
    title: 'Bubble Rhythm Tactile Flow',
    tag: 'Sensory Rhythm Reset',
    icon: 'sparkles',
    shortLabel: 'Play Bubble Rhythm',
    description: 'A 2-minute tactile rhythm session to unwind, disrupt racing thoughts, and gently reset working memory.',
    actionRoute: 'minigames',
    modalType: 'bubble_rhythm',
    defaultDurationMin: 2,
    preferredTime: 'anytime'
  },
  companion_chat: {
    type: 'companion_chat',
    title: 'Talk to Breathly Coach',
    tag: 'Reflective Dialogue',
    icon: 'bot',
    shortLabel: 'Talk to Breathly',
    description: 'Share what is taking up mental space right now. Your AI coach will help you break down overwhelm into one small step.',
    actionRoute: 'coach',
    modalType: 'coach_chat',
    defaultDurationMin: 5,
    preferredTime: 'anytime'
  },
  journal: {
    type: 'journal',
    title: '2-Minute Mindful Reflection',
    tag: 'Cognitive Offload',
    icon: 'book-open',
    shortLabel: 'Reflect & journal',
    description: 'Externalize what is swirling in your mind. Putting thoughts onto paper clears cognitive bandwidth.',
    actionRoute: 'journal',
    modalType: 'journal_entry',
    defaultDurationMin: 3,
    preferredTime: 'anytime'
  },
  sleep_wind_down: {
    type: 'sleep_wind_down',
    title: 'Evening Digital Wind-Down',
    tag: 'Restorative Sleep Boundary',
    icon: 'moon',
    shortLabel: 'Prepare for rest',
    description: 'Set a gentle boundary on screens, dim your ambient lights, and try a 4-7-8 breathing rhythm for restorative sleep.',
    actionRoute: 'breathing',
    modalType: 'sleep_wind_down',
    defaultDurationMin: 10,
    preferredTime: 'evening'
  },
  short_break: {
    type: 'short_break',
    title: '5-Minute Screen-Free Break',
    tag: 'Focus Reset',
    icon: 'coffee',
    shortLabel: 'Take a short break',
    description: 'Step away from your screen and workstation completely. Hydrate, rest your eyes, and allow your nervous system to settle.',
    actionRoute: 'break',
    modalType: 'short_break',
    defaultDurationMin: 5,
    preferredTime: 'daytime'
  }
};

/**
 * Fetch historical intervention effectiveness stats for a user
 */
async function getUserInterventionHistory(userId) {
  // 1. Direct intervention sessions
  const sessionsRes = await pool.query(
    `SELECT intervention_type, 
            COUNT(*)::int AS count,
            COALESCE(AVG(improvement), 0)::numeric(4, 2) AS avg_improvement,
            COUNT(CASE WHEN feeling = 'better' THEN 1 END)::int AS feeling_better_count,
            COUNT(CASE WHEN feeling = 'worse' THEN 1 END)::int AS feeling_worse_count,
            MAX(completed_at) AS last_used_at
     FROM intervention_sessions 
     WHERE user_id = $1 AND completed_at IS NOT NULL
     GROUP BY intervention_type`,
    [userId]
  );

  const effectivenessMap = {};
  sessionsRes.rows.forEach(r => {
    effectivenessMap[r.intervention_type] = {
      count: r.count,
      avgImprovement: parseFloat(r.avg_improvement) || 0,
      betterCount: r.feeling_better_count,
      worseCount: r.feeling_worse_count,
      lastUsedAt: r.last_used_at ? new Date(r.last_used_at).getTime() : null
    };
  });

  // 2. Also incorporate game_sessions for bubble_rhythm
  const gamesRes = await pool.query(
    `SELECT COUNT(*)::int AS count,
            COUNT(CASE WHEN feeling = 'better' THEN 1 END)::int AS feeling_better_count,
            MAX(played_at) AS last_played_at
     FROM game_sessions 
     WHERE user_id = $1 AND completed = true`,
    [userId]
  );
  if (gamesRes.rows.length > 0 && gamesRes.rows[0].count > 0) {
    const g = gamesRes.rows[0];
    const existing = effectivenessMap['bubble_rhythm'] || {
      count: 0,
      avgImprovement: 0,
      betterCount: 0,
      worseCount: 0,
      lastUsedAt: null
    };
    existing.count += g.count;
    existing.betterCount += g.feeling_better_count;
    if (g.last_played_at) {
      const pTime = new Date(g.last_played_at).getTime();
      if (!existing.lastUsedAt || pTime > existing.lastUsedAt) {
        existing.lastUsedAt = pTime;
      }
    }
    effectivenessMap['bubble_rhythm'] = existing;
  }

  return effectivenessMap;
}

/**
 * Score and Rank Interventions for the Authenticated User
 * 
 * Formula:
 * Score = UserPreference (0-30)
 *       + ContextFit (0-30)
 *       + HistoricalEffectiveness (-15 to +30)
 *       + StressLevelFit (0-20)
 *       - CooldownPenalty (0 to 30)
 */
async function generateRecommendations(userId, stressPrediction, currentContext = {}) {
  // 1. Fetch user onboarding profile
  const profileRes = await pool.query(
    'SELECT * FROM user_onboarding_profiles WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  const profile = profileRes.rows[0] || null;

  // 2. Fetch user intervention effectiveness history
  const history = await getUserInterventionHistory(userId);

  // 3. Current Context factors
  const hour = new Date().getHours();
  const timeOfDay = currentContext.timeOfDay || (hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening');
  const isEvening = hour >= 20 || hour < 5 || timeOfDay === 'evening';
  const isHighStress = stressPrediction?.level === 'high' || (stressPrediction?.score && stressPrediction.score >= 61);
  const isModerateStress = stressPrediction?.level === 'moderate' || (stressPrediction?.score && stressPrediction.score >= 31);
  const stressTrend = stressPrediction?.trend?.trend || 'stable';

  // Parse recovery activities from onboarding profile
  let recoveryActivities = [];
  if (profile && profile.recovery_activities) {
    try {
      recoveryActivities = Array.isArray(profile.recovery_activities)
        ? profile.recovery_activities
        : JSON.parse(profile.recovery_activities);
    } catch (e) {
      recoveryActivities = [];
    }
  }
  const recoveryStr = recoveryActivities.join(' ').toLowerCase();

  const now = Date.now();
  const scoredList = [];

  // Evaluate each of the 9 interventions
  for (const key of Object.keys(INTERVENTIONS)) {
    const intervention = INTERVENTIONS[key];
    let score = 50; // base score
    const reasonParts = [];

    // --- Factor A: User Preference from Onboarding (0 to 30) ---
    let preferenceBonus = 0;
    if (key === 'social_connection') {
      if (recoveryStr.includes('friend') || recoveryStr.includes('family') || recoveryStr.includes('talk') || recoveryStr.includes('social')) {
        preferenceBonus = 25;
        reasonParts.push('Matches your onboarding preference for spending time with people.');
      } else if (recoveryStr.includes('quiet') || recoveryStr.includes('alone') || recoveryStr.includes('solitude')) {
        preferenceBonus = -10; // Respect user preference for solitude
      }
    } else if (key === 'outdoor_walk') {
      if (recoveryStr.includes('walk') || recoveryStr.includes('nature') || recoveryStr.includes('outdoor')) {
        preferenceBonus = 25;
        reasonParts.push('Matches your preference for walks and fresh air.');
      }
    } else if (key === 'breathing') {
      if (recoveryStr.includes('breath') || recoveryStr.includes('mindful') || recoveryStr.includes('meditat')) {
        preferenceBonus = 25;
        reasonParts.push('Matches your preference for guided breathing.');
      }
    } else if (key === 'light_exercise') {
      if (recoveryStr.includes('stretch') || recoveryStr.includes('exercise') || recoveryStr.includes('movement') || recoveryStr.includes('workout')) {
        preferenceBonus = 25;
        reasonParts.push('Matches your preference for light movement.');
      }
    } else if (key === 'bubble_rhythm') {
      if (recoveryStr.includes('game') || recoveryStr.includes('music') || recoveryStr.includes('rhythm') || recoveryStr.includes('audio')) {
        preferenceBonus = 20;
        reasonParts.push('Matches your interest in sensory music and rhythms.');
      }
    } else if (key === 'journal') {
      if (recoveryStr.includes('journal') || recoveryStr.includes('write') || recoveryStr.includes('reflect')) {
        preferenceBonus = 25;
        reasonParts.push('Matches your preference for written reflection.');
      }
    }
    score += preferenceBonus;

    // --- Factor B: Current Context Fit (0 to 25) ---
    let contextBonus = 0;
    if (isEvening) {
      if (key === 'sleep_wind_down') {
        contextBonus += 25;
        reasonParts.push('Suited for evening rest and unwinding before sleep.');
      } else if (key === 'outdoor_walk') {
        contextBonus -= 15; // less likely late at night
      }
    } else {
      if (key === 'outdoor_walk') {
        contextBonus += 15;
      } else if (key === 'short_break') {
        contextBonus += 15;
      }
    }

    // High screen time context
    if (currentContext.recentDistractionMinutes > 45 || currentContext.workloadRating === 'overload') {
      if (key === 'outdoor_walk' || key === 'short_break') {
        contextBonus += 15;
        reasonParts.push('High screen demand logged — a physical break will help reset your eyes and mind.');
      }
    }
    score += contextBonus;

    // --- Factor C: Stress State Fit (0 to 25) ---
    let stressFitBonus = 0;
    if (isHighStress) {
      if (key === 'breathing') {
        stressFitBonus += 25;
        reasonParts.push('Immediate autonomic relief for high pressure spikes.');
      } else if (key === 'social_connection' && preferenceBonus >= 0) {
        stressFitBonus += 20;
        reasonParts.push('Support from someone you trust eases acute emotional load.');
      } else if (key === 'bubble_rhythm') {
        stressFitBonus += 18;
        reasonParts.push('Tactile rhythm disrupts cognitive overload within 2 minutes.');
      }
    } else if (isModerateStress) {
      if (key === 'outdoor_walk') {
        stressFitBonus += 20;
        reasonParts.push('Gentle physical pace helps steady moderate pressure.');
      } else if (key === 'short_break' || key === 'companion_chat') {
        stressFitBonus += 15;
      }
    } else {
      // Low stress - maintenance & steady clarity
      if (key === 'journal' || key === 'light_exercise' || key === 'bubble_rhythm') {
        stressFitBonus += 15;
        reasonParts.push('Good for maintaining healthy mental clarity.');
      }
    }
    score += stressFitBonus;

    // --- Factor D: Historical Effectiveness (+30 to -15) ---
    let historyBonus = 0;
    const h = history[key];
    if (h && h.count > 0) {
      if (h.betterCount > 0) {
        historyBonus += Math.min(25, h.betterCount * 8);
        reasonParts.push(`Previously helped you feel better ${h.betterCount} time(s).`);
      }
      if (h.avgImprovement > 0) {
        historyBonus += Math.min(15, Math.round(h.avgImprovement * 5));
      }
      if (h.worseCount > 0) {
        historyBonus -= (h.worseCount * 10);
      }
    }
    score += historyBonus;

    // --- Factor E: Recent Usage Cooldown / Variety (-30 to 0) ---
    let cooldownPenalty = 0;
    if (h && h.lastUsedAt) {
      const elapsedHours = (now - h.lastUsedAt) / (1000 * 60 * 60);
      if (elapsedHours < 2) {
        cooldownPenalty = 30; // Strong penalty if used within 2 hours
      } else if (elapsedHours < 6) {
        cooldownPenalty = 15;
      } else if (elapsedHours < 12) {
        cooldownPenalty = 5;
      }
    }
    score -= cooldownPenalty;

    // Clamp score 5 - 100
    const finalScore = Math.max(5, Math.min(100, Math.round(score)));

    // Fallback explanation if empty
    const personalizedReason = reasonParts.length > 0
      ? reasonParts.join(' ')
      : 'Calibrated to steady your pace and protect well-being.';

    scoredList.push({
      ...intervention,
      score: finalScore,
      personalizedReason,
      historySummary: h ? {
        count: h.count,
        betterCount: h.betterCount,
        avgImprovement: h.avgImprovement
      } : null
    });
  }

  // Sort descending by score
  scoredList.sort((a, b) => b.score - a.score);

  const primaryRecommendation = scoredList[0];
  const alternatives = scoredList.slice(1, 5);

  return {
    primary: primaryRecommendation,
    alternatives,
    allScored: scoredList,
    contextSummary: {
      timeOfDay,
      isEvening,
      isHighStress,
      stressTrend
    }
  };
}

module.exports = {
  INTERVENTIONS,
  generateRecommendations,
  getUserInterventionHistory
};
