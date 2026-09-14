-- Breathly / Reset — Personal Adaptive Habit & Wellbeing Coach MySQL Schema
-- Run with: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS breathly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE breathly;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  google_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  profile_picture VARCHAR(1024),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- User Onboarding & Lifestyle Profile
CREATE TABLE IF NOT EXISTS user_onboarding_profiles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  occupation_type VARCHAR(100),
  daily_hours VARCHAR(50),
  peak_time VARCHAR(100),
  sleep_duration VARCHAR(50),
  hurdles JSON,
  motivation_style VARCHAR(100),
  stress_baseline INT DEFAULT 5,
  stress_causes JSON,
  recovery_activities JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Overarching Goals
CREATE TABLE IF NOT EXISTS user_goals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'Growth',
  icon VARCHAR(50) DEFAULT '🎯',
  target_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_goal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_goal_user (user_id)
) ENGINE=InnoDB;

-- Adaptive Habits
CREATE TABLE IF NOT EXISTS user_habits (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  goal_id INT UNSIGNED NULL,
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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_habit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_habit_goal FOREIGN KEY (goal_id) REFERENCES user_goals(id) ON DELETE SET NULL,
  INDEX idx_habit_user (user_id)
) ENGINE=InnoDB;

-- Habit Failure Logs ("What got in the way?")
CREATE TABLE IF NOT EXISTS habit_failure_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  habit_id INT UNSIGNED NULL,
  reason VARCHAR(255) NOT NULL,
  note TEXT,
  logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fail_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fail_habit FOREIGN KEY (habit_id) REFERENCES user_habits(id) ON DELETE SET NULL,
  INDEX idx_fail_user (user_id, logged_at)
) ENGINE=InnoDB;

-- Upcoming High-Pressure Periods (Exams, Projects, Deadlines)
CREATE TABLE IF NOT EXISTS pressure_events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) DEFAULT 'Exams',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pressure_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pressure_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS journal_entries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  content TEXT,
  mood VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_journal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_journal_user_created (user_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS breathing_sessions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  exercise_name VARCHAR(255) NOT NULL,
  duration_seconds INT UNSIGNED NOT NULL DEFAULT 0,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_breathing_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_breathing_user_completed (user_id, completed_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stress_records (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  stress_level TINYINT UNSIGNED NOT NULL,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_stress_user_created (user_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_preferences (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  theme VARCHAR(50) NOT NULL DEFAULT 'dusk',
  notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_prefs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
