const pool = require('../config/db');

function formatCheckIn(row) {
  if (!row) return null;
  let parsedNotes = null;
  if (row.notes && typeof row.notes === 'string' && row.notes.startsWith('{') && row.notes.endsWith('}')) {
    try { parsedNotes = JSON.parse(row.notes); } catch (e) {}
  }
  const dateStr = row.check_in_date 
    ? (typeof row.check_in_date === 'string' ? row.check_in_date.split('T')[0] : (row.check_in_date.toISOString ? row.check_in_date.toISOString().split('T')[0] : String(row.check_in_date)))
    : null;

  return {
    id: row.id,
    userId: row.user_id,
    date: dateStr,
    checkInDate: dateStr,
    timeOfDay: row.time_of_day,
    overallFeeling: row.overall_feeling,
    workloadRating: row.workload_rating,
    sleepQuality: row.sleep_quality,
    stressRating: row.stress_rating,
    mood: parsedNotes?.mood ?? (row.mood !== undefined ? row.mood : (row.overall_feeling === 'calm' ? 5 : 3)),
    energy: parsedNotes?.energy ?? (row.energy !== undefined ? row.energy : 3),
    stress: parsedNotes?.stress ?? (row.stress !== undefined ? row.stress : (row.stress_rating ? Math.round(row.stress_rating / 2) : 3)),
    workload: parsedNotes?.workload ?? (row.workload !== undefined ? row.workload : 3),
    sleep: parsedNotes?.sleep !== undefined ? Number(parsedNotes.sleep) : (row.sleep !== undefined ? Number(row.sleep) : 7),
    stressfulEvent: !!row.stressful_event,
    eventContext: row.event_context,
    notes: row.notes,
    createdAt: row.created_at
  };
}

// POST /api/check-ins
// Creates or updates today's daily 20-second check-in (1 entry per user per day)
async function createCheckIn(req, res) {
  try {
    const {
      mood,
      energy,
      stress,
      workload,
      sleep,
      timeOfDay,
      overallFeeling,
      workloadRating,
      sleepQuality,
      stressRating,
      stressfulEvent,
      eventContext,
      notes
    } = req.body;

    const moodVal = Number.isFinite(Number(mood)) ? Math.min(5, Math.max(1, Math.round(Number(mood)))) : 3;
    const energyVal = Number.isFinite(Number(energy)) ? Math.min(5, Math.max(1, Math.round(Number(energy)))) : 3;
    const stressVal = Number.isFinite(Number(stress)) ? Math.min(5, Math.max(1, Math.round(Number(stress)))) : (Number.isFinite(Number(stressRating)) ? Math.min(5, Math.max(1, Math.round(Number(stressRating) / 2))) : 3);
    const workloadVal = Number.isFinite(Number(workload)) ? Math.min(5, Math.max(1, Math.round(Number(workload)))) : 3;
    const sleepVal = Number.isFinite(Number(sleep)) ? Math.min(14, Math.max(0, Number(sleep))) : 7;

    const tod = timeOfDay || (new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening');

    // JSON payload preserving exact fields: mood, energy, stress, workload, sleep
    const checkInPayload = JSON.stringify({
      mood: moodVal,
      energy: energyVal,
      stress: stressVal,
      workload: workloadVal,
      sleep: sleepVal
    });

    // Check if an entry already exists for today for this user
    const existing = await pool.query(
      `SELECT id FROM daily_check_ins 
       WHERE user_id = $1 AND check_in_date = CURRENT_DATE 
       ORDER BY created_at DESC LIMIT 1`,
      [req.userId]
    );

    let row;
    if (existing.rows.length > 0) {
      // UPDATE today's entry instead of creating a duplicate!
      const updateRes = await pool.query(
        `UPDATE daily_check_ins 
         SET time_of_day = $1,
             overall_feeling = $2,
             workload_rating = $3,
             sleep_quality = $4,
             stress_rating = $5,
             notes = $6,
             created_at = CURRENT_TIMESTAMP
         WHERE id = $7
         RETURNING *`,
        [
          tod,
          overallFeeling || `Mood ${moodVal}/5`,
          workloadRating || `Workload ${workloadVal}/5`,
          sleepQuality || `${sleepVal}h`,
          stressVal,
          checkInPayload,
          existing.rows[0].id
        ]
      );
      row = updateRes.rows[0];
    } else {
      // INSERT new entry for today
      const insertRes = await pool.query(
        `INSERT INTO daily_check_ins 
          (user_id, check_in_date, time_of_day, overall_feeling, workload_rating, sleep_quality, stress_rating, stressful_event, event_context, notes)
         VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          req.userId,
          tod,
          overallFeeling || `Mood ${moodVal}/5`,
          workloadRating || `Workload ${workloadVal}/5`,
          sleepQuality || `${sleepVal}h`,
          stressVal,
          !!stressfulEvent,
          eventContext ? String(eventContext).slice(0, 255) : null,
          checkInPayload
        ]
      );
      row = insertRes.rows[0];
    }

    res.status(201).json({
      checkIn: formatCheckIn(row),
      message: 'Daily check-in recorded successfully'
    });
  } catch (err) {
    console.error('createCheckIn error:', err);
    res.status(500).json({ error: 'Could not record daily check-in' });
  }
}

// GET /api/check-ins/status
// Determines if user has already checked in today or if within cooldown
async function getCheckInStatus(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM daily_check_ins 
       WHERE user_id = $1 AND check_in_date = CURRENT_DATE 
       ORDER BY created_at DESC LIMIT 1`,
      [req.userId]
    );

    const hasCheckedInToday = rows.length > 0;
    const todayCheckIn = hasCheckedInToday ? formatCheckIn(rows[0]) : null;

    res.json({
      hasCheckedInToday,
      todayCheckIn,
      cooldownActive: hasCheckedInToday
    });
  } catch (err) {
    console.error('getCheckInStatus error:', err);
    res.status(500).json({ error: 'Could not fetch check-in status' });
  }
}

// GET /api/check-ins/recent
// Retrieves up to 14 recent check-ins for multi-signal pattern analysis
async function getRecentCheckIns(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM daily_check_ins 
       WHERE user_id = $1 
       ORDER BY created_at DESC LIMIT 14`,
      [req.userId]
    );

    res.json({
      checkIns: rows.map(formatCheckIn)
    });
  } catch (err) {
    console.error('getRecentCheckIns error:', err);
    res.status(500).json({ error: 'Could not fetch recent check-ins' });
  }
}

module.exports = {
  createCheckIn,
  getCheckInStatus,
  getRecentCheckIns
};
