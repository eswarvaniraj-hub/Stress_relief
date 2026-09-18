-- Reset Coach / Breathly — PostgreSQL Schema
-- Run with: psql -U postgres -d breathly -f database/schema.sql
-- Or inside psql: \i database/schema.sql

-- Helper function to automatically update `updated_at` columns
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Users table (Google OAuth authenticated)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  profile_picture VARCHAR(1024),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

DROP TRIGGER IF EXISTS set_timestamp_users ON users;
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 2. User Onboarding & Lifestyle Profile (7 Questions)
CREATE TABLE IF NOT EXISTS user_onboarding_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  occupation_type VARCHAR(100),
  weekday_pattern VARCHAR(100),
  daily_hours VARCHAR(50),
  peak_time VARCHAR(100),
  sleep_duration VARCHAR(50),
  hurdles JSONB DEFAULT '[]'::jsonb,
  motivation_style VARCHAR(100),
  stress_baseline INT DEFAULT 5,
  stress_causes JSONB DEFAULT '[]'::jsonb,
  recovery_activities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS set_timestamp_profiles ON user_onboarding_profiles;
CREATE TRIGGER set_timestamp_profiles
BEFORE UPDATE ON user_onboarding_profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 3. Overarching Goals
CREATE TABLE IF NOT EXISTS user_goals (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'Growth',
  icon VARCHAR(50) DEFAULT '🎯',
  target_date DATE NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_goal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_goal_user ON user_goals(user_id);

-- 4. Adaptive Habits (with Minimum Mode support)
CREATE TABLE IF NOT EXISTS user_habits (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  goal_id INT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'Focus',
  icon VARCHAR(50) DEFAULT '⚡',
  target_val INT NOT NULL DEFAULT 30,
  target_unit VARCHAR(50) NOT NULL DEFAULT 'min',
  min_mode_val INT NOT NULL DEFAULT 5,
  min_mode_unit VARCHAR(50) NOT NULL DEFAULT 'min',
  preferred_time VARCHAR(50) DEFAULT 'anytime',
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_habit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_habit_goal FOREIGN KEY (goal_id) REFERENCES user_goals(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_habit_user ON user_habits(user_id);

DROP TRIGGER IF EXISTS set_timestamp_habits ON user_habits;
CREATE TRIGGER set_timestamp_habits
BEFORE UPDATE ON user_habits
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 5. Habit Failure Logs ("What got in the way?")
CREATE TABLE IF NOT EXISTS habit_failure_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  habit_id INT NULL,
  reason VARCHAR(255) NOT NULL,
  note TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fail_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fail_habit FOREIGN KEY (habit_id) REFERENCES user_habits(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_fail_user ON habit_failure_logs(user_id, logged_at);

-- 6. Upcoming High-Pressure Periods (Exams, Projects, Deadlines)
CREATE TABLE IF NOT EXISTS pressure_events (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) DEFAULT 'Exams',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pressure_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_pressure_user ON pressure_events(user_id);

-- 7. Preserved Reflection & Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT,
  mood VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_journal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_journal_user_created ON journal_entries(user_id, created_at);

DROP TRIGGER IF EXISTS set_timestamp_journal ON journal_entries;
CREATE TRIGGER set_timestamp_journal
BEFORE UPDATE ON journal_entries
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 8. Preserved 60s Quick Reset & Breathing Sessions
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  exercise_name VARCHAR(255) NOT NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_breathing_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_breathing_user_completed ON breathing_sessions(user_id, completed_at);

-- 9. Stress Check-ins (Quick numeric ratings)
CREATE TABLE IF NOT EXISTS stress_records (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  stress_level SMALLINT NOT NULL,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_stress_user_created ON stress_records(user_id, created_at);

-- 10. Daily Contextual Well-Being Check-Ins (1-3 adaptive questions)
CREATE TABLE IF NOT EXISTS daily_check_ins (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_of_day VARCHAR(50) DEFAULT 'general',
  overall_feeling VARCHAR(100),
  workload_rating VARCHAR(50),
  sleep_quality VARCHAR(50),
  stress_rating SMALLINT NULL,
  stressful_event BOOLEAN DEFAULT FALSE,
  event_context VARCHAR(255) NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_checkin_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_checkin_user_date ON daily_check_ins(user_id, check_in_date);
CREATE INDEX IF NOT EXISTS idx_checkin_user_created ON daily_check_ins(user_id, created_at);

-- Safe column additions for existing installations
ALTER TABLE user_onboarding_profiles ADD COLUMN IF NOT EXISTS weekday_pattern VARCHAR(100);

-- 11. User Preferences & Settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  theme VARCHAR(50) NOT NULL DEFAULT 'porcelain',
  notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  daily_distraction_goal_minutes INT NOT NULL DEFAULT 45,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prefs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS set_timestamp_preferences ON user_preferences;
CREATE TRIGGER set_timestamp_preferences
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Safe column additions for existing user_preferences installations
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS daily_distraction_goal_minutes INT DEFAULT 45;

-- 12. Focus Sessions
CREATE TABLE IF NOT EXISTS focus_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  task_name VARCHAR(255) NOT NULL,
  planned_duration_minutes INT NOT NULL DEFAULT 25,
  actual_duration_minutes INT NOT NULL DEFAULT 0,
  distractions_count INT NOT NULL DEFAULT 0,
  total_distraction_minutes INT NOT NULL DEFAULT 0,
  focus_rate SMALLINT NOT NULL DEFAULT 100,
  habit_id INT NULL,
  notes TEXT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_focus_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_focus_habit FOREIGN KEY (habit_id) REFERENCES user_habits(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_focus_user_completed ON focus_sessions(user_id, completed_at);

-- 13. Distractions Log
CREATE TABLE IF NOT EXISTS distractions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  start_time TIMESTAMPTZ NULL,
  end_time TIMESTAMPTZ NULL,
  duration_minutes INT NOT NULL DEFAULT 0,
  note TEXT NULL,
  focus_session_id INT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_distraction_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_distraction_session FOREIGN KEY (focus_session_id) REFERENCES focus_sessions(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_distraction_user_logged ON distractions(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_distraction_category ON distractions(category);

-- 14. Connect-PG-Simple Session Store Table
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- 15. Mini-Game Well-Being Sessions (Bubble Rhythm & future mini games)
CREATE TABLE IF NOT EXISTS game_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  game_name VARCHAR(100) NOT NULL DEFAULT 'Bubble Rhythm',
  game_mode VARCHAR(50) NOT NULL,
  rhythm_preset VARCHAR(50) NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  bubbles_popped INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  feeling VARCHAR(50) NULL,
  enjoyment VARCHAR(50) NULL,
  played_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_game_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_game_user_played ON game_sessions(user_id, played_at);

