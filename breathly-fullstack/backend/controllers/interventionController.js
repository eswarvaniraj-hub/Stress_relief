// ==========================================================================
// BREATHLY — Intervention Controller
// Manages Personalized Recommendations, Session Starts, Completions & Feedback
// ==========================================================================

const pool = require('../config/db');
const { predictStressForUser } = require('../services/stressPredictionService');
const { generateRecommendations, getUserInterventionHistory, INTERVENTIONS } = require('../services/recommendationService');

// GET /api/interventions/recommendations
async function getRecommendations(req, res) {
  try {
    const stressPrediction = await predictStressForUser(req.userId);
    const recommendations = await generateRecommendations(req.userId, stressPrediction, {
      timeOfDay: req.query.timeOfDay
    });

    res.json({
      prediction: stressPrediction,
      recommendations: {
        primary: recommendations.primary,
        alternatives: recommendations.alternatives,
        contextSummary: recommendations.contextSummary
      },
      availableInterventions: INTERVENTIONS
    });
  } catch (err) {
    console.error('getRecommendations error:', err);
    res.status(500).json({ error: 'Failed to generate well-being recommendations' });
  }
}

// POST /api/interventions/start
// Body: { interventionType, title, stressBefore }
async function startIntervention(req, res) {
  try {
    const { interventionType, title, stressBefore } = req.body;
    if (!interventionType) {
      return res.status(400).json({ error: 'interventionType is required' });
    }

    const typeDef = INTERVENTIONS[interventionType];
    const sessionTitle = title || (typeDef ? typeDef.title : 'Well-Being Activity');
    const sBefore = Number.isFinite(Number(stressBefore))
      ? Math.max(0, Math.min(10, Math.round(Number(stressBefore))))
      : null;

    const { rows } = await pool.query(
      `INSERT INTO intervention_sessions 
        (user_id, intervention_type, title, stress_before, started_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [req.userId, interventionType, sessionTitle, sBefore]
    );

    res.status(201).json({ session: rows[0] });
  } catch (err) {
    console.error('startIntervention error:', err);
    res.status(500).json({ error: 'Failed to start intervention session' });
  }
}

// POST /api/interventions/complete
// Body: { sessionId, interventionType, title, durationSeconds, stressBefore, stressAfter, feeling, enjoyment, notes }
async function completeIntervention(req, res) {
  try {
    const {
      sessionId,
      interventionType,
      title,
      durationSeconds = 0,
      stressBefore,
      stressAfter,
      feeling,
      enjoyment,
      notes
    } = req.body;

    const sBefore = Number.isFinite(Number(stressBefore))
      ? Math.max(0, Math.min(10, Math.round(Number(stressBefore))))
      : null;

    const sAfter = Number.isFinite(Number(stressAfter))
      ? Math.max(0, Math.min(10, Math.round(Number(stressAfter))))
      : null;

    const improvement = (sBefore !== null && sAfter !== null)
      ? (sBefore - sAfter)
      : null;

    const validFeelings = ['better', 'same', 'stressed', 'worse'];
    const sanitizedFeeling = validFeelings.includes(feeling) ? feeling : null;

    const validEnjoyment = ['yes', 'little', 'no'];
    const sanitizedEnjoyment = validEnjoyment.includes(enjoyment) ? enjoyment : null;

    let sessionRow = null;

    if (sessionId) {
      // Update existing started session
      const updateRes = await pool.query(
        `UPDATE intervention_sessions 
         SET duration_seconds = $1,
             stress_before = COALESCE($2, stress_before),
             stress_after = $3,
             improvement = $4,
             feeling = $5,
             enjoyment = $6,
             notes = $7,
             completed_at = NOW()
         WHERE id = $8 AND user_id = $9
         RETURNING *`,
        [
          Math.max(0, parseInt(durationSeconds, 10) || 0),
          sBefore,
          sAfter,
          improvement,
          sanitizedFeeling,
          sanitizedEnjoyment,
          notes ? String(notes).slice(0, 1000) : null,
          sessionId,
          req.userId
        ]
      );
      sessionRow = updateRes.rows[0];
    }

    // If not updating an existing session or not found, insert a complete record
    if (!sessionRow) {
      const typeDef = INTERVENTIONS[interventionType];
      const sessionTitle = title || (typeDef ? typeDef.title : 'Well-Being Activity');
      const insertRes = await pool.query(
        `INSERT INTO intervention_sessions 
          (user_id, intervention_type, title, duration_seconds, stress_before, stress_after, improvement, feeling, enjoyment, notes, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         RETURNING *`,
        [
          req.userId,
          interventionType || 'short_break',
          sessionTitle,
          Math.max(0, parseInt(durationSeconds, 10) || 0),
          sBefore,
          sAfter,
          improvement,
          sanitizedFeeling,
          sanitizedEnjoyment,
          notes ? String(notes).slice(0, 1000) : null
        ]
      );
      sessionRow = insertRes.rows[0];
    }

    // If post-intervention stress was reported, sync into stress_records for trajectory tracking
    if (sAfter !== null) {
      await pool.query(
        `INSERT INTO stress_records (user_id, stress_level, notes)
         VALUES ($1, $2, $3)`,
        [req.userId, sAfter, `Post-intervention (${interventionType || 'Activity'}): feeling ${sanitizedFeeling || 'recorded'}`]
      ).catch(e => console.warn('Sync post-intervention stress error:', e.message));
    }

    res.json({
      session: sessionRow,
      improvement,
      message: 'Intervention completed and feedback recorded.'
    });
  } catch (err) {
    console.error('completeIntervention error:', err);
    res.status(500).json({ error: 'Failed to record intervention completion' });
  }
}

// GET /api/interventions/history
async function listInterventionHistory(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM intervention_sessions 
       WHERE user_id = $1 AND completed_at IS NOT NULL
       ORDER BY completed_at DESC 
       LIMIT 50`,
      [req.userId]
    );
    res.json({ sessions: rows });
  } catch (err) {
    console.error('listInterventionHistory error:', err);
    res.status(500).json({ error: 'Failed to load intervention history' });
  }
}

// GET /api/interventions/effectiveness
async function getEffectiveness(req, res) {
  try {
    const history = await getUserInterventionHistory(req.userId);
    res.json({ effectiveness: history });
  } catch (err) {
    console.error('getEffectiveness error:', err);
    res.status(500).json({ error: 'Failed to load intervention effectiveness' });
  }
}

module.exports = {
  getRecommendations,
  startIntervention,
  completeIntervention,
  listInterventionHistory,
  getEffectiveness
};
