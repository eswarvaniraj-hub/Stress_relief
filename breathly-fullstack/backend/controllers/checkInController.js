const pool = require('../config/db');

function formatCheckIn(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    checkInDate: row.check_in_date,
    timeOfDay: row.time_of_day,
    overallFeeling: row.overall_feeling,
    workloadRating: row.workload_rating,
    sleepQuality: row.sleep_quality,
    stressRating: row.stress_rating,
    stressfulEvent: !!row.stressful_event,
    eventContext: row.event_context,
    notes: row.notes,
    createdAt: row.created_at
  };
}

// POST /api/check-ins
// Creates a new daily 1-3 contextual question check-in
async function createCheckIn(req, res) {
  try {
    const {
      timeOfDay,
      overallFeeling,
      workloadRating,
      sleepQuality,
      stressRating,
      stressfulEvent,
      eventContext,
      notes
    } = req.body;

    const stressVal = Number.isFinite(Number(stressRating)) 
      ? Math.min(10, Math.max(1, Math.round(Number(stressRating)))) 
      : null;

    const tod = timeOfDay || (new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening');

    const { rows } = await pool.query(
      `INSERT INTO daily_check_ins 
        (user_id, check_in_date, time_of_day, overall_feeling, workload_rating, sleep_quality, stress_rating, stressful_event, event_context, notes)
       VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.userId,
        tod,
        overallFeeling || 'neutral',
        workloadRating || 'manageable',
        sleepQuality || 'normal',
        stressVal,
        !!stressfulEvent,
        eventContext ? String(eventContext).slice(0, 255) : null,
        notes ? String(notes).slice(0, 1000) : null
      ]
    );

    // If a stress score was supplied, also preserve in stress_records for backwards compatibility
    if (stressVal !== null) {
      await pool.query(
        `INSERT INTO stress_records (user_id, stress_level, notes)
         VALUES ($1, $2, $3)`,
        [req.userId, stressVal, eventContext || notes || 'Daily Monitoring']
      ).catch(err => console.warn('Sync stress record note:', err.message));
    }

    res.status(201).json({
      checkIn: formatCheckIn(rows[0]),
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
