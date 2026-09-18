require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./config/db');

const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const goalRoutes = require('./routes/goals');
const profileRoutes = require('./routes/profile');
const pressureRoutes = require('./routes/pressure');
const journalRoutes = require('./routes/journal');
const breathingRoutes = require('./routes/breathing');
const stressRoutes = require('./routes/stress');
const preferencesRoutes = require('./routes/preferences');
const checkInRoutes = require('./routes/checkIns');
const distractionRoutes = require('./routes/distractions');
const focusSessionRoutes = require('./routes/focusSessions');
const gameRoutes = require('./routes/games');

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// --- CORS: allow frontend origins with credentials (cookies) ---
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://stress-relief-teal.vercel.app',
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());

// --- Sessions, stored in PostgreSQL, exposed as a secure HTTP-only cookie ---
const sessionStore = new pgSession({
  pool: pool,
  tableName: 'session',
  createTableIfMissing: true
});

app.use(session({
  key: 'breathly.sid',
  secret: process.env.SESSION_SECRET || 'development_secret_key_89237482',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/pressure-events', pressureRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/breathing', breathingRoutes);
app.use('/api/stress', stressRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/check-ins', checkInRoutes);
app.use('/api/distractions', distractionRoutes);
app.use('/api/focus-sessions', focusSessionRoutes);
app.use('/api/games', gameRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Personal Adaptive Habit & Wellbeing Coach' }));

// --- Central error handler ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Reset Coach backend running at http://localhost:${PORT}`);
  });
}

module.exports = app;
