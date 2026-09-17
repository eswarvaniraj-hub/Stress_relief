const pool = require('../config/db');

function formatProfileResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    occupation: row.occupation_type || 'Student',
    weekdayPattern: row.weekday_pattern || 'Structured routine',
    dailyHours: row.daily_hours || '6-8 hours',
    peakTime: row.peak_time || 'evening',
    sleepDuration: row.sleep_duration || '7-8 hours',
    hurdles: Array.isArray(row.hurdles) ? row.hurdles : JSON.parse(row.hurdles || '[]'),
    motivationStyle: row.motivation_style || 'streaks',
    stressBaseline: Number.isFinite(row.stress_baseline) ? row.stress_baseline : 5,
    stressCauses: Array.isArray(row.stress_causes) ? row.stress_causes : JSON.parse(row.stress_causes || '[]'),
    recoveryActivities: Array.isArray(row.recovery_activities) ? row.recovery_activities : JSON.parse(row.recovery_activities || '[]'),
    recoverySuperpowers: Array.isArray(row.recovery_activities) ? row.recovery_activities : JSON.parse(row.recovery_activities || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isCompleted: true
  };
}

// GET /api/profile
async function getProfile(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM user_onboarding_profiles WHERE user_id = $1 LIMIT 1',
      [req.userId]
    );
    const profile = formatProfileResponse(rows[0]);
    res.json({
      profile,
      hasCompletedOnboarding: !!rows[0]
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Could not fetch profile' });
  }
}

// PUT /api/profile
async function updateProfile(req, res) {
  try {
    const { profile } = req.body;
    if (!profile) return res.status(400).json({ error: 'Profile data is required' });

    const {
      occupation,
      occupationType,
      weekdayPattern,
      dailyHours,
      peakTime,
      sleepDuration,
      hurdles,
      motivationStyle,
      stressBaseline,
      stressCauses,
      recoveryActivities,
      recoverySuperpowers
    } = profile;

    const occ = occupation || occupationType || 'Student';
    const wp = weekdayPattern || 'Structured routine';
    const hours = dailyHours || '6-8 hours';
    const peak = peakTime || 'evening';
    const sleep = sleepDuration || '7-8 hours';
    const hurd = Array.isArray(hurdles) ? hurdles : [];
    const mot = motivationStyle || 'streaks';
    const base = Number.isFinite(Number(stressBaseline)) ? Math.min(10, Math.max(1, Number(stressBaseline))) : 5;
    const causes = Array.isArray(stressCauses) ? stressCauses : [];
    const recovery = Array.isArray(recoveryActivities) ? recoveryActivities : Array.isArray(recoverySuperpowers) ? recoverySuperpowers : [];

    const { rows } = await pool.query(
      `INSERT INTO user_onboarding_profiles 
        (user_id, occupation_type, weekday_pattern, daily_hours, peak_time, sleep_duration, hurdles, motivation_style, stress_baseline, stress_causes, recovery_activities)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (user_id) DO UPDATE SET
        occupation_type = EXCLUDED.occupation_type,
        weekday_pattern = EXCLUDED.weekday_pattern,
        daily_hours = EXCLUDED.daily_hours,
        peak_time = EXCLUDED.peak_time,
        sleep_duration = EXCLUDED.sleep_duration,
        hurdles = EXCLUDED.hurdles,
        motivation_style = EXCLUDED.motivation_style,
        stress_baseline = EXCLUDED.stress_baseline,
        stress_causes = EXCLUDED.stress_causes,
        recovery_activities = EXCLUDED.recovery_activities
       RETURNING *`,
      [
        req.userId,
        occ,
        wp,
        hours,
        peak,
        sleep,
        JSON.stringify(hurd),
        mot,
        base,
        JSON.stringify(causes),
        JSON.stringify(recovery)
      ]
    );

    res.json({
      profile: formatProfileResponse(rows[0]),
      hasCompletedOnboarding: true
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Could not update profile' });
  }
}

module.exports = { getProfile, updateProfile };

