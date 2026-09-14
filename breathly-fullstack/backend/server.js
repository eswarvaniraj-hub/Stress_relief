require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const goalRoutes = require('./routes/goals');
const profileRoutes = require('./routes/profile');
const pressureRoutes = require('./routes/pressure');
const journalRoutes = require('./routes/journal');
const breathingRoutes = require('./routes/breathing');
const stressRoutes = require('./routes/stress');
const preferencesRoutes = require('./routes/preferences');

const app = express();

// --- CORS: allow frontend origin with credentials (cookies) ---
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:5500',
  credentials: true
}));

app.use(express.json());

// --- Sessions, stored in MySQL, exposed as a secure HTTP-only cookie ---
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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
    sameSite: 'lax',
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

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Personal Adaptive Habit & Wellbeing Coach' }));

// --- Central error handler ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Reset Coach backend running at http://localhost:${PORT}`);
});
