# Breathly Comprehensive Application Audit Report

**Date of Audit:** October 4, 2026  
**Audited Directory:** `c:\Users\Eswar\Desktop\stress relief`  
**Git Branch:** `redesign` (Branch isolated from `main`)  
**Scope:** Full application inspection (frontend, backend routes, database schema, state management, UI/UX, navigation, hardware telemetry, production stability risks, and architectural roadmap).

---

## 1. Pages and Routes

Breathly currently operates as a Single Page Application (SPA). There is **no client-side router library** (no React Router) and **no URL hash/pathname changes**. The entire UI navigation is managed in-memory via the React state hook `const [currentView, setCurrentView] = useState(...)` in [`app.js`](file:///c:/Users/Eswar/Desktop/stress%20relief/app.js#L1856). 

The browser URL remains static (`http://localhost:5000/` or `http://localhost:3000/index.html`) at all times.

Below is the complete inventory of all 18 views/screens in the application, their internal route keys, and how a user reaches them:

| View / Screen Name | Internal Route Key | Browser URL | How a User Reaches This Screen | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Landing Page** | `'landing'` | `/` | Default view for unauthenticated visitors without a saved local profile; also reached by clicking "Sign Out" or "Back" from the Login view. | Public |
| **Sign In / Login** | `'login'` | `/` | Reached via "Sign In" in the header, landing hero, settings modal, or footer navigation link. | Public |
| **Onboarding Wizard** | `'onboarding'` | `/` | Reached via "Get Started" on the landing page, "Retake Onboarding" in profile/settings, or guest signup. | Public / New User |
| **Dashboard** | `'dashboard'` | `/` | Default home screen for authenticated users; also reached via sidebar "Dashboard", top logo, or breadcrumb back buttons. | Authenticated / Guest |
| **Daily Check-In** | `'checkin'` | `/` | Reached via "Log Today's Check-In" on Dashboard, top header check-in banner, or sidebar navigation. | Authenticated / Guest |
| **Stress & Pressure Hub** | `'stress'` | `/` | Reached via sidebar "Stress Monitor", Dashboard stress risk card, or "De-escalate Tension" button. | Authenticated / Guest |
| **Habits & Pacing Hub** | `'habits'` | `/` | Reached via sidebar "Habits", mobile bottom navigation "Habits", or Dashboard "View All Habits". | Authenticated / Guest |
| **Mindful Resets Hub** | `'breathing'` | `/` | Reached via sidebar "Mindful Resets", mobile bottom navigation "Resets", or Dashboard quick action cards. | Authenticated / Guest |
| **Exercise Player Engine** | `'exercise'` | `/` | Launched whenever the user initiates a breathing reset (Box Breathing, 4-7-8, 4-2-6, Physiological Sigh, Coherent Breathing). | Authenticated / Guest |
| **Focus & Distraction Hub** | `'distractions'` | `/` | Reached via sidebar "Focus & Distractions", Dashboard distraction card, or footer "Distractions & Focus". | Authenticated / Guest |
| **Journal & Reflection** | `'journal'` | `/` | Reached via sidebar "Journal" or Dashboard reflection link. | Authenticated / Guest |
| **AI Wellbeing Coach** | `'coach'` | `/` | Reached via sidebar "AI Coach", Dashboard coach teaser widget, or footer "My Coach". | Authenticated / Guest |
| **Goals Manager** | `'goals'` | `/` | Reached via Dashboard "View Goals" or linking a goal inside the Habit Modal. | Authenticated / Guest |
| **Weekly Intelligence Report** | `'weekly-report'` | `/` | Reached via Dashboard "Weekly Stats" button or sidebar "Weekly Report". | Authenticated / Guest |
| **Profile & Settings** | `'profile'` | `/` | Reached via sidebar "Profile & Settings", header user avatar, or mobile bottom navigation "More". | Authenticated / Guest |
| **Mini-Games Hub** | `'minigames'` | `/` | Reached via Dashboard "Mindful Games" card, sidebar link, or footer "Mini Games". | Authenticated / Guest |
| **Bubble Rhythm Game** | `'bubble-rhythm'` | `/` | Reached via Mini-Games Hub -> "Play Bubble Rhythm" or quick reset prompt. | Authenticated / Guest |
| **Zen Pebble Cairn Game** | `'zen-garden'` | `/` | Reached via Mini-Games Hub -> "Play Zen Pebble Cairn". | Authenticated / Guest |

---

## 2. Comprehensive Navigation Map

Below is the detailed interaction map for every interactive button and link across the application:

```
Screen -> Button label -> Destination -> API call -> What changes -> How the user goes back
```

### 1. Landing Screen (`'landing'`)
- **Landing -> "Get Started / Start Reset"** -> `'onboarding'` -> *None* -> Advances to Step 1 of the 7-question onboarding wizard -> User clicks "Cancel" to return to Landing.
- **Landing -> "Sign In"** -> `'login'` -> *None* -> Opens the Google OAuth sign-in screen -> User clicks "Back" to return to Landing.
- **Landing -> "Quick 60s Reset"** -> `'exercise'` -> *None* -> Launches 4-2-6 Calming Flow breathing session with pre-tension modal -> User clicks "Exit / Cancel" to return to Landing.
- **Landing -> "Explore Demo / Direct Dashboard"** -> `'dashboard'` -> *None* -> Enters local guest mode and shows dashboard -> User clicks "Sign Out" in settings to return to Landing.

### 2. Login Screen (`'login'`)
- **Login -> "Sign In with Google" (Google SDK Button)** -> `'dashboard'` -> `POST /api/auth/google` -> Exchanges ID token for PostgreSQL session cookie `breathly.sid`, populates user state -> User signs out via Settings to go back.
- **Login -> "Continue as Guest"** -> `'dashboard'` (or `'onboarding'` if new) -> *None* -> Sets temporary guest session in localStorage -> User clicks Sign In to return.
- **Login -> "Back to Welcome"** -> `'landing'` (or `'dashboard'` if logged in) -> *None* -> Returns to previous view.
- **Login -> "Save Custom Client ID"** -> Stays on `'login'` -> *None* -> Writes custom Google OAuth Client ID to `localStorage` (`reset_google_client_id_v1`) -> Stays on screen.

### 3. Onboarding Wizard (`'onboarding'`)
- **Onboarding -> "Next Step" (Steps 1–6)** -> Onboarding Step N+1 -> *None* -> Advances wizard progress bar -> User clicks "Previous Step".
- **Onboarding -> "Previous Step" (Steps 2–7)** -> Onboarding Step N-1 -> *None* -> Decrements wizard progress bar -> User clicks "Next Step".
- **Onboarding -> "Complete Setup" (Step 7)** -> `'dashboard'` -> `PUT /api/profile` -> Persists 7-question lifestyle answers to `user_onboarding_profiles` in PostgreSQL -> Advances to Dashboard.
- **Onboarding -> "Cancel / Exit"** -> `'dashboard'` (if profile exists) or `'landing'` -> *None* -> Aborts onboarding without saving changes.

### 4. Dashboard (`'dashboard'`)
- **Dashboard -> "Log Today's Check-In"** -> `'checkin'` -> *None* -> Opens 5-point well-being check-in questionnaire -> User clicks "Back to Dashboard" or saves.
- **Dashboard -> "Start Habit Routine"** -> Opens `RoutineCountdownModal` -> *None* -> Initiates timed countdown for routine execution -> User clicks "Close (X)".
- **Dashboard -> "Add Habit"** -> Opens `HabitModal` -> *None* -> Displays habit creation form -> User clicks "Cancel" or "Close".
- **Dashboard -> Habit Checkbox (Uncompleted)** -> Stays on `'dashboard'` -> `POST /api/habits/:id/complete` -> Increments streak count, updates 7-day consistency engine, launches confetti -> User can click again to unmark.
- **Dashboard -> Habit Checkbox (Already Completed)** -> Opens `HabitUnmarkDialog` -> *None* -> Prompts user: "Unmark completion" vs "Log extra session" -> User clicks "Cancel" or unmarks.
- **Dashboard -> "Activate Minimum Mode (Rough Day)"** -> Opens `RoughDayConfirmModal` -> *None* -> Displays reassurance dialogue and activates 2-minute micro-habits -> User clicks "Deactivate" to revert.
- **Dashboard -> "Disable Minimum Mode"** -> Stays on `'dashboard'` -> *None* -> Restores full standard habit duration targets -> Stays on screen.
- **Dashboard -> "Take a 60s Reset"** -> Opens `TensionRatingModal` -> *None* -> Collects 1–5 pre-tension score, then launches `'exercise'` -> User exits exercise to return.
- **Dashboard -> "Start Focus Sprint"** -> Opens `FocusSessionModal` -> *None* -> Opens 25-minute Pomodoro timer -> User clicks "Cancel" or finishes session.
- **Dashboard -> "Log Distraction"** -> Opens `AddDistractionModal` -> *None* -> Opens distraction category selector -> User clicks "Cancel".
- **Dashboard -> "Chat with Coach"** -> `'coach'` -> *None* -> Opens conversational AI coach screen -> User clicks "Back to Dashboard".
- **Dashboard -> "Weekly Stats"** -> `'weekly-report'` -> *None* -> Opens digital wellbeing intelligence report -> User clicks "Back to Dashboard".
- **Dashboard -> "Plan Exams / Deadlines"** -> Opens `PressurePlannerModal` -> *None* -> Displays high-pressure event scheduler -> User clicks "Cancel".
- **Dashboard -> "Mindful Games"** -> `'minigames'` -> *None* -> Navigates to mini-games directory -> User clicks "Back to Dashboard".

### 5. Daily Check-In (`'checkin'`)
- **Check-In -> Mood / Energy / Stress / Workload / Sleep Sliders** -> Stays on `'checkin'` -> *None* -> Updates form state -> Stays on screen.
- **Check-In -> "Save Check-In"** -> `'dashboard'` -> `POST /api/check-ins` -> Creates or updates today's record in `daily_check_ins` -> Automatically redirects to Dashboard.
- **Check-In -> "Cancel / Back"** -> `'dashboard'` -> *None* -> Discards unsaved edits and returns to Dashboard.

### 6. Habits Hub (`'habits'`)
- **Habits -> "Create Habit"** -> Opens `HabitModal` -> *None* -> Displays habit creation modal -> User clicks "Cancel".
- **Habits -> "Edit Habit" (Pencil Icon)** -> Opens `HabitModal` -> *None* -> Pre-fills habit parameters -> User clicks "Cancel".
- **Habits -> "Delete Habit" (Trash Icon)** -> Stays on `'habits'` -> `DELETE /api/habits/:id` -> Removes habit from PostgreSQL and refreshes list -> Stays on screen.
- **Habits -> "Log What Got in the Way"** -> Opens `FailureReasonModal` -> *None* -> Prompts user for friction reasons -> User clicks "Cancel" or "Save Reason" (`POST /api/habits/failure`).
- **Habits -> "Back to Dashboard"** -> `'dashboard'` -> *None* -> Returns to Dashboard.

### 7. Mindful Resets Hub (`'breathing'`)
- **Resets -> "Start [Exercise Name]"** -> Opens `TensionRatingModal` -> *None* -> Captures pre-session tension (1–5) and transitions to `'exercise'` -> User clicks "Exit" to cancel.
- **Resets -> "Soundscape Toggle (Rain/Ocean/Forest/White Noise/Mute)"** -> Stays on `'breathing'` -> *None* -> Activates or mutes Web Audio API procedural sound engine -> Stays on screen.
- **Resets -> "Back to Dashboard"** -> `'dashboard'` -> *None* -> Returns to Dashboard.

### 8. Active Exercise Player (`'exercise'`)
- **Exercise -> "Finish Exercise"** -> Opens `TensionRatingModal` -> `POST /api/breathing/sessions` & `POST /api/interventions/complete` -> Records session duration and post-tension rating, calculates drop points -> Returns to `'dashboard'`.
- **Exercise -> "Exit / Cancel"** -> `'dashboard'` (or `'breathing'`) -> *None* -> Halts exercise timer and returns to previous screen.

### 9. Distraction & Focus Hub (`'distractions'`)
- **Focus -> "Start Focus Sprint (25m)"** -> Opens `FocusSessionModal` -> *None* -> Starts countdown timer -> User cancels or logs completion (`POST /api/focus-sessions`).
- **Focus -> "Log Distraction Manually"** -> Opens `AddDistractionModal` -> *None* -> Opens manual entry form -> User clicks "Cancel".
- **Focus -> "Delete Distraction"** -> Stays on `'distractions'` -> `DELETE /api/distractions/:id` -> Deletes record from PostgreSQL -> Stays on screen.
- **Focus -> "Adjust Daily Goal"** -> Stays on `'distractions'` -> `PUT /api/preferences` -> Updates `daily_distraction_goal_minutes` in PostgreSQL -> Stays on screen.
- **Focus -> "Back to Dashboard"** -> `'dashboard'` -> *None* -> Returns to Dashboard.

### 10. AI Coach View (`'coach'`)
- **Coach -> Quick Suggestion Pill** -> Stays on `'coach'` -> `POST /api/chat/gemini` -> Populates chat input, submits prompt, streams/displays Gemini reply -> User navigates back via top button.
- **Coach -> "Send" (Paper plane icon)** -> Stays on `'coach'` -> `POST /api/chat/gemini` -> Submits user message, updates chat history -> Stays on screen.
- **Coach -> "Back to Dashboard"** -> `'dashboard'` -> *None* -> Returns to Dashboard.

### 11. Profile & Settings Hub (`'profile'`)
- **Profile -> "Save Changes"** -> Stays on `'profile'` -> `PUT /api/profile` & `PUT /api/preferences` -> Updates user lifestyle profile and theme preferences -> Stays on screen.
- **Profile -> "Redo Onboarding"** -> `'onboarding'` -> *None* -> Re-opens 7-question wizard -> User clicks "Cancel" to return.
- **Profile -> "Privacy & Data"** -> Opens `PrivacyModal` -> *None* -> Opens data wiping / export options -> User clicks "Close".
- **Profile -> "Sign Out"** -> `'landing'` -> `POST /api/auth/logout` -> Destroys PostgreSQL session, clears cookies and localStorage -> Navigates to Landing page.

### 12. Mini-Games Hub & Game Views (`'minigames'`, `'bubble-rhythm'`, `'zen-garden'`)
- **Mini-Games Hub -> "Play Bubble Rhythm"** -> `'bubble-rhythm'` -> *None* -> Starts bubble game -> User finishes or clicks "Exit" to return.
- **Mini-Games Hub -> "Play Zen Pebble Cairn"** -> `'zen-garden'` -> *None* -> Starts pebble stacking physics simulation -> User finishes or clicks "Exit" to return.
- **Bubble Game -> "Finish Session"** -> Opens `TensionRatingModal` -> `POST /api/games/sessions` -> Saves bubble pops, duration, and feeling -> Returns to `'minigames'`.
- **Zen Pebble Game -> "Finish Session"** -> Opens `TensionRatingModal` -> `POST /api/games/sessions` -> Saves cairn height, duration, and feeling -> Returns to `'minigames'`.
- **Mini-Games Hub -> "Back to Dashboard"** -> `'dashboard'` -> *None* -> Returns to Dashboard.

---

## 3. Problems Found

During thorough inspection of both frontend and backend files, the following architectural and implementation defects were identified:

### 3.1. Monolithic Giant File (`app.js` — 12,736 lines / 553 KB)
- The entire frontend application logic, state, components, modals, audio synthesizers, 2D canvas games, and Chart.js code live inside a single file: [`app.js`](file:///c:/Users/Eswar/Desktop/stress%20relief/app.js).
- This violates standard modularity and beginner-friendly safety rules. Making changes to any component carries an extreme risk of breaking unrelated components.

### 3.2. Blank-Page Fragility via In-Browser Babel Standalone
- [`index.html`](file:///c:/Users/Eswar/Desktop/stress%20relief/index.html#L94) loads `<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>` and compiles `app.js` in the browser at runtime using `<script type="text/babel" src="app.js?v=5.0"></script>`.
- Any syntax error, stray character, or mismatched quote (such as the `}n-all"` bug fixed in commit `b09abcb`) causes Babel to fail silently or log to console without executing React.
- Because there is **no global `<ErrorBoundary>`** and **no fallback HTML inside `<div id="root"></div>`**, any compilation or runtime error renders a **completely white, blank screen**.

### 3.3. Broken Browser Navigation (Back-Button & Page Refresh Defects)
- Because there is no URL router or `window.history.pushState` integration, pressing the browser's physical "Back" button does not navigate back to the previous screen—it exits the website entirely.
- Pressing "Refresh" (`F5`) re-evaluates:
  ```javascript
  const savedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (savedUser) return 'dashboard';
  return appState.profile?.isCompleted ? 'dashboard' : 'landing';
  ```
  This immediately discards whatever sub-screen the user was on (e.g. Coach, Journal, Breathing, Distractions, Focus Timer, or Mini-Games) and resets the view to the Dashboard.

### 3.4. Duplicate Project Files & Workspace Drift
- An identical duplicate of the frontend files exists in two locations:
  - Root directory: `/index.html`, `/app.js`, `/api.js`, `/styles.css`, `/consistency.js`, `/resetAnalysis.js`
  - Subfolder: `/breathly-fullstack/index.html`, `/breathly-fullstack/app.js`, etc.
- If a developer edits files in the root while the backend or server is serving from `breathly-fullstack`, or vice versa, changes fail to appear or conflicting code versions emerge.

### 3.5. Competing and Conflicting CSS Styles
- The app imports Tailwind CSS from CDN (`https://cdn.tailwindcss.com`) while simultaneously loading [`styles.css`](file:///c:/Users/Eswar/Desktop/stress%20relief/styles.css) (23,071 bytes).
- Cards use competing border radii: some cards use `rounded-xl`, others `rounded-2xl`, others `rounded-card` (`18px`), and others `rounded-card-lg` (`22px`).
- Border colors and background tints are inconsistently declared (e.g. `border-slate-100`, `border-slate-200`, `border-brand-border`, `border-[#cfe1d7]`).
- Buttons alternate arbitrarily between class utilities (`.btn-primary`, `.btn-secondary`, `.btn-danger`) and hardcoded utility soups (`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm`).

### 3.6. Redundant and Conflicting Navigation Shells
- Desktop displays a fixed left sidebar (`SidebarNav`), but also renders a floating top bar (`TopHeaderBar`), a desktop footer with redundant links (`FooterNav`), and on mobile devices a bottom navigation bar (`MobileBottomNav`).
- Certain settings and modals can be opened from three different places simultaneously (header avatar, sidebar bottom item, and footer), causing inconsistent modal state and z-index overlap bugs.

### 3.7. Session Expiry & Desynchronization Bug
- User state is stored in `localStorage` (`reset_auth_user_v1`), while the backend relies on an HTTP-only PostgreSQL session cookie (`breathly.sid`).
- If the server session expires after 7 days, or if the user opens the app after an idle period, `localStorage` falsely treats the user as logged in. When the frontend attempts to call `/api/habits` or `/api/profile`, the backend returns `401 Unauthorized`. The frontend does not cleanly handle this across all endpoints, resulting in silent data loading failures.

### 3.8. Hardcoded Hardware Simulation Presented as Real Biometrics
- The `BioFeedbackPulseSensor` component in `app.js` (lines 12024–12070) prompts the user for camera access under the label "Bio-Feedback Pulse Sensor".
- Instead of performing real photoplethysmography (PPG) face color pulse extraction, it computes:
  ```javascript
  const estimatedBpm = Math.round(68 + Math.sin(t * 0.4) * 6);
  ```
  This is a completely simulated sine wave oscillating between 62 and 74 BPM.

---

## 4. Complete API Endpoint List

All frontend network requests pass through [`api.js`](file:///c:/Users/Eswar/Desktop/stress%20relief/api.js) to the Node.js/Express backend running on port 5000 (or Render in production). Sessions use `credentials: 'include'`.

| HTTP Method | API Path | What it Returns | Consuming Screen / Component |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/google` | `{ user: { id, name, email, picture, createdAt, lastLogin } }` | `LoginView` |
| `GET` | `/api/auth/me` | `{ user: { id, name, email, picture, ... } }` | `App` root boot sequence |
| `POST` | `/api/auth/logout` | `{ success: true }` | `ProfileHubView`, `SettingsModal` |
| `GET` | `/api/profile` | `{ profile: { occupation_type, daily_hours, peak_time, sleep_duration, hurdles, stress_baseline, ... } }` | `App`, `ProfileHubView`, `OnboardingWizard` |
| `PUT` | `/api/profile` | `{ profile: { ... }, message: 'Profile updated' }` | `OnboardingWizard`, `ProfileHubView` |
| `GET` | `/api/habits` | `{ habits: [ { id, title, category, icon, target_val, target_unit, min_mode_val, current_streak, best_streak, is_active } ] }` | `DashboardView`, `HabitsHubView`, `WeeklyReportView` |
| `POST` | `/api/habits` | `{ habit: { id, title, target_val, min_mode_val, ... } }` | `HabitModal` |
| `PUT` | `/api/habits/:id` | `{ habit: { ... }, message: 'Habit updated' }` | `HabitModal` |
| `DELETE` | `/api/habits/:id` | `{ message: 'Habit deleted' }` | `HabitsHubView` |
| `POST` | `/api/habits/:id/complete` | `{ habit: { ... }, streakUpdated: true, newStreak: N }` | `DashboardView`, `HabitsHubView`, `RoutineCountdownModal` |
| `POST` | `/api/habits/failure` | `{ log: { id, habit_id, reason, note, logged_at } }` | `FailureReasonModal` |
| `GET` | `/api/habits/failures` | `{ failures: [ { id, habit_id, reason, note, logged_at } ] }` | `HabitsHubView`, early stress evaluator |
| `GET` | `/api/goals` | `{ goals: [ { id, title, category, icon, target_date } ] }` | `GoalsView`, `HabitModal` |
| `POST` | `/api/goals` | `{ goal: { id, title, category, icon, target_date } }` | `GoalsView` |
| `DELETE` | `/api/goals/:id` | `{ message: 'Goal deleted' }` | `GoalsView` |
| `POST` | `/api/stress` | `{ record: { id, stress_level, notes, created_at } }` | `StressHubView` |
| `GET` | `/api/stress` | `{ records: [ { id, stress_level, notes, created_at } ] }` | `StressHubView` |
| `GET` | `/api/stress/current` | `{ current: { score, level, category, color, statusClass, drivers, trend } }` | `DashboardView`, `StressHubView` |
| `GET` | `/api/stress/trend` | `{ trend, baseline, historyPoints: [...], totalDataPoints }` | `StressHubView` |
| `POST` | `/api/stress/predict` | `{ prediction: { score, category, contributingFactors: [...] } }` | `StressHubView` |
| `GET` | `/api/pressure-events` | `{ events: [ { id, title, event_type, start_date, end_date, notes } ] }` | `DashboardView`, `StressHubView`, `WeeklyReportView` |
| `POST` | `/api/pressure-events` | `{ event: { id, title, start_date, end_date, ... } }` | `PressurePlannerModal` |
| `DELETE` | `/api/pressure-events/:id` | `{ message: 'Pressure event deleted' }` | `StressHubView` |
| `POST` | `/api/check-ins` | `{ checkIn: { id, date, timeOfDay, mood, energy, stress, workload, sleep, notes }, message: 'Daily check-in recorded successfully' }` | `CheckInView`, `DailyCheckInCard` |
| `GET` | `/api/check-ins/status` | `{ hasCheckedInToday: boolean, todayCheckIn: { ... } }` | `DashboardView`, `CheckInView` |
| `GET` | `/api/check-ins/recent` | `{ checkIns: [ { id, date, mood, energy, stress, workload, sleep, notes, ... } ] }` | `DashboardView`, `StressHubView`, `WeeklyReportView` |
| `POST` | `/api/breathing/sessions` | `{ session: { id, exercise_name, duration_seconds, completed_at } }` | `ExerciseEngine` |
| `GET` | `/api/breathing/sessions` | `{ sessions: [ { id, exercise_name, duration_seconds, completed_at } ] }` | `BreathingHubView` |
| `GET` | `/api/distractions` | `{ distractions: [ { id, category, duration_minutes, note, logged_at } ] }` | `DistractionTrackerHubView`, `DashboardView` |
| `POST` | `/api/distractions` | `{ distraction: { id, category, duration_minutes, note, logged_at } }` | `AddDistractionModal`, `FocusSessionModal` |
| `DELETE` | `/api/distractions/:id` | `{ message: 'Distraction deleted' }` | `DistractionTrackerHubView` |
| `GET` | `/api/distractions/summary` | `{ totalMinutesToday, countToday, goalMinutes, categoryBreakdown: { ... } }` | `DistractionTrackerHubView`, `DashboardView` |
| `GET` | `/api/focus-sessions` | `{ sessions: [ { id, task_name, planned_duration_minutes, actual_duration_minutes, focus_rate, completed_at } ] }` | `DistractionTrackerHubView`, `WeeklyReportView` |
| `POST` | `/api/focus-sessions` | `{ session: { id, task_name, actual_duration_minutes, focus_rate, ... } }` | `FocusSessionModal` |
| `DELETE` | `/api/focus-sessions/:id` | `{ message: 'Focus session deleted' }` | `DistractionTrackerHubView` |
| `GET` | `/api/journal` | `{ entries: [ { id, content, mood, created_at } ] }` | `JournalHubView` |
| `POST` | `/api/journal` | `{ entry: { id, content, mood, created_at } }` | `JournalHubView` |
| `DELETE` | `/api/journal/:id` | `{ message: 'Journal entry deleted' }` | `JournalHubView` |
| `POST` | `/api/games/sessions` | `{ session: { id, game_name, game_mode, duration_seconds, bubbles_popped, completed } }` | `BubbleRhythmGame`, `ZenPebbleGame` |
| `GET` | `/api/games/sessions` | `{ sessions: [ { id, game_name, duration_seconds, bubbles_popped, ... } ] }` | `MiniGamesHubView` |
| `GET` | `/api/games/summary` | `{ totalSessions, totalMinutes, totalPops, favoriteGame }` | `MiniGamesHubView` |
| `GET` | `/api/interventions/recommendations` | `{ recommendations: [ { type, title, durationMinutes, rationale, matchScore } ] }` | `DashboardView`, `PersonalizedWellBeingCard` |
| `POST` | `/api/interventions/start` | `{ sessionId: N, interventionType, startedAt }` | `PersonalizedWellBeingCard` |
| `POST` | `/api/interventions/complete` | `{ session: { id, tension_before, tension_after, improvement, enjoyment }, message: 'Completed' }` | `InterventionModal`, `ExerciseEngine` |
| `GET` | `/api/interventions/history` | `{ history: [ { id, title, improvement, feeling, completed_at } ] }` | `PersonalizedWellBeingCard` |
| `GET` | `/api/interventions/effectiveness` | `{ byType: { [type]: { count, avgDrop, successRate } }, overallAvgDrop }` | `PersonalizedWellBeingCard`, `BreathingHubView` |
| `GET` | `/api/preferences` | `{ preferences: { theme, notification_enabled, daily_distraction_goal_minutes } }` | `App`, `SettingsModal`, `ProfileHubView` |
| `PUT` | `/api/preferences` | `{ preferences: { ... }, message: 'Preferences updated' }` | `SettingsModal`, `ProfileHubView`, `DistractionTrackerHubView` |
| `POST` | `/api/chat/gemini` | `{ success: true, reply: "...", actionType: "breath" | "journal" | "none" }` | `CoachView` |
| `GET` | `/api/health` | `{ status: 'ok', service: 'Personal Adaptive Habit & Wellbeing Coach' }` | System monitoring |

---

## 5. Data Truth Check

This section distinguishes between numbers derived from live backend database queries, computed metrics, and hardcoded/simulated values:

### 5.1. Real Backend Data (Truthful from PostgreSQL)
- **Habit Streaks (`current_streak`, `best_streak`)**: Stored in `user_habits` and recalculated on completion.
- **Distraction Minutes & Counts**: Direct SQL sums from `distractions` table for the current user and date.
- **Focus Minutes & Focus Rate**: Computed from real entries in `focus_sessions` table.
- **Daily Check-In Metrics (1–5)**: User-entered mood, energy, stress, workload, and sleep hours stored in `daily_check_ins`.
- **Stress History Points**: Timestamped values from `stress_records` and `daily_check_ins`.
- **Tension Drop Points**: Real before-and-after tension scores (1–5) stored in `intervention_sessions` and evaluated via [`resetAnalysis.js`](file:///c:/Users/Eswar/Desktop/stress%20relief/resetAnalysis.js).
- **Mini-Game Stats**: Total bubbles popped and playtime stored in `game_sessions`.

### 5.2. Derived / Computed Client-Side Metrics
- **Well-Being Index (0–100)**: Evaluated in `calculateWellbeingIndex(appState)`. Weighted algorithm:
  - Mood score (0–25 points)
  - Energy score (0–25 points)
  - Habit consistency score (0–20 points)
  - Inverse stress score (0–15 points)
  - Inverse workload score (0–15 points)
- **Forgiving 7-Day Consistency & Grace Days**: Evaluated in `calculateConsistency(appState)` inside [`consistency.js`](file:///c:/Users/Eswar/Desktop/stress%20relief/consistency.js). Replaces all-or-nothing streaks with rolling 7-day completion and 2 weekly grace days.
- **Friction Forecast %**: Evaluated in `calculateFrictionForecast(appState)` based on proximity of high-pressure dates and recent skip logs.
- **AI Stress Prediction Score (0–100)**: Computed by [`stressPredictionService.js`](file:///c:/Users/Eswar/Desktop/stress%20relief/breathly-fullstack/backend/services/stressPredictionService.js) using calibrated baseline + weighted check-in deviations.

### 5.3. Hardcoded, Simulated, or Placeholder Values
- **Heart Rate / BPM**: **SIMULATED**. In `BioFeedbackPulseSensor` ([`app.js:12067`](file:///c:/Users/Eswar/Desktop/stress%20relief/app.js#L12067)), the camera does not read vascular pulse. It executes:
  ```javascript
  const estimatedBpm = Math.round(68 + Math.sin(t * 0.4) * 6);
  ```
  This is a mathematical dummy oscillation (62–74 BPM).
- **Default Google OAuth Client ID**: Hardcoded string `'566164333122-o2u5sgtqueto8d2t9b7ufquugiqq8g7l.apps.googleusercontent.com'` in `app.js`.
- **Default Distraction Goal**: Default fallback of `45` minutes if not customized.
- **Synthesized Ambient Audio**: Uses Web Audio API oscillator nodes and pink/white noise filters with pseudo-random jitter (`750 + Math.random() * 300`).
- **Bubble Game Particle Physics**: Speed, wobble phase, and bubble radii generated via `Math.random()`.

---

## 6. Production Risk Analysis

This audit evaluated all mechanisms that historically caused blank screens or JavaScript errors in the application:

### 6.1. Build-Free In-Browser Babel Transpilation Risk (CRITICAL)
- **The Cause**: The browser downloads Babel Standalone (2.5 MB) and attempts to parse 553 KB of JSX at runtime.
- **The Consequence**: If any syntax error exists in `app.js` (such as an unclosed bracket, stray text, or broken template literal), Babel halts parsing. No React components mount, leaving `<div id="root"></div>` completely empty. The user sees a blank white page.
- **Mitigation**: Move away from monolithic in-browser Babel compilation or modularize the code into clean ES modules/bundled components with strict build-time linting.

### 6.2. Missing Top-Level Error Boundary (HIGH)
- **The Cause**: React 18 will unmount the entire application tree if any unhandled error occurs during component rendering (e.g. attempting to map over an `undefined` array or parsing bad JSON in `notes`).
- **The Consequence**: A minor data anomaly on one widget causes the whole page to disappear into white screen.
- **Mitigation**: Wrap the main application shell in a React `<ErrorBoundary>` component with a graceful, calming fallback view and "Refresh to Dashboard" button.

### 6.3. Fragile Multi-CDN External Dependencies (HIGH)
- **The Cause**: [`index.html`](file:///c:/Users/Eswar/Desktop/stress%20relief/index.html) relies on 6 external CDN scripts:
  - `accounts.google.com/gsi/client`
  - `cdn.tailwindcss.com`
  - `unpkg.com/lucide@latest`
  - `cdn.jsdelivr.net/npm/chart.js`
  - `cdn.jsdelivr.net/npm/canvas-confetti`
  - `unpkg.com/react@18` & `react-dom@18`
  - `unpkg.com/@babel/standalone`
- **The Consequence**: If any CDN host suffers downtime, packet loss, or is blocked by an ad-blocker/firewall, `window.React` is undefined. Line 7 of `app.js` immediately throws `TypeError: Cannot destructure property 'useState' of 'React' as it is undefined`, terminating execution.

### 6.4. Dual-Directory Desynchronization Risk (MEDIUM)
- **The Cause**: Having identical files at the root level (`/app.js`, `/index.html`) and inside `/breathly-fullstack/` leads to accidental split-brain development where changes are made in one location but served from the other.

---

## 7. Proposed New Structure (Beginner-Friendly & Modular)

To eliminate the 12,700-line monolith, prevent syntax breaks, and guarantee beginner-friendly maintainability, the frontend should be reorganized into small, self-contained files (under 200 lines each):

```
c:/Users/Eswar/Desktop/stress relief/
├── index.html                           # Clean application shell with ErrorBoundary fallback
├── styles.css                           # Unified design tokens (8px grid, calming green palette)
├── src/
│   ├── main.js                          # Lightweight application bootstrapper & React root
│   ├── api/                             # Dedicated API service modules
│   │   ├── client.js                    # Base fetch wrapper with credentials & timeouts
│   │   ├── authApi.js                   # Google login, /me, logout
│   │   ├── habitsApi.js                 # Habit CRUD, completion, failure logs
│   │   ├── stressApi.js                 # Stress records, predictions, pressure events
│   │   ├── checkInApi.js                # Daily check-in logging & status
│   │   ├── focusApi.js                  # Focus sessions & distraction tracking
│   │   ├── resetsApi.js                 # Breathing & intervention telemetry
│   │   └── chatApi.js                   # AI Coach Gemini endpoints
│   ├── utils/                           # Pure mathematical / calculation utilities
│   │   ├── consistency.js               # Forgiving 7-day habit score & grace days
│   │   ├── resetAnalysis.js             # Tension drop (1-5) effectiveness calculator
│   │   ├── wellbeingIndex.js            # Composite 0-100 wellbeing formula
│   │   └── soundEngine.js               # Ambient Web Audio synthesis
│   ├── components/                      # Reusable, small UI building blocks
│   │   ├── common/
│   │   │   ├── ErrorBoundary.jsx        # Prevents full-screen crashes
│   │   │   ├── Button.jsx               # Standardized button styles
│   │   │   ├── Card.jsx                 # Uniform 18px radius cards with 8px padding
│   │   │   ├── Modal.jsx                # Universal modal wrapper with ESC & overlay close
│   │   │   └── Badge.jsx                # Low/Moderate/High status pills
│   │   ├── layout/
│   │   │   ├── SidebarNav.jsx           # Fixed desktop navigation sidebar
│   │   │   ├── TopHeaderBar.jsx         # Clean header with profile avatar & title
│   │   │   └── MobileBottomNav.jsx      # Touch-friendly bottom bar for phones
│   │   └── widgets/
│   │       ├── CheckInWidget.jsx        # Dashboard 20-second check-in prompt
│   │       ├── HabitRow.jsx             # Habit list item with min-mode switch
│   │       ├── Heatmap.jsx              # 12-month activity grid
│   │       └── StressRiskMeter.jsx      # Visual 0-100 stress gauge
│   ├── pages/                           # Dedicated screen views (one file per page)
│   │   ├── DashboardPage.jsx            # Clean, tiered daily wellbeing dashboard
│   │   ├── HabitsPage.jsx               # Active habits and failure reflection
│   │   ├── ResetsPage.jsx               # Guided breathing exercises catalog
│   │   ├── ExercisePlayerPage.jsx       # Active breathing animation & timer
│   │   ├── CheckInPage.jsx              # Full daily check-in form
│   │   ├── StressPage.jsx               # Stress monitor & pressure timeline
│   │   ├── FocusPage.jsx                # Distraction blocker & Pomodoro timer
│   │   ├── CoachPage.jsx                # AI wellbeing coach chat interface
│   │   ├── JournalPage.jsx              # Reflection entries & mood logs
│   │   ├── ProfilePage.jsx              # Lifestyle profile & theme preferences
│   │   ├── MiniGamesPage.jsx            # Mindful games launcher
│   │   ├── LoginPage.jsx                # Google OAuth sign-in
│   │   └── LandingPage.jsx              # Public introduction & demo entry
│   └── modals/                          # Individual modal dialogues
│       ├── HabitModal.jsx               # Create / Edit habit form
│       ├── TensionRatingModal.jsx       # 1-5 scale before/after rating
│       ├── FocusSessionModal.jsx        # Active focus timer
│       ├── AddDistractionModal.jsx      # Distraction entry form
│       └── PressurePlannerModal.jsx     # High-pressure period planner
```

### Why this structure solves the existing problems:
1. **No More Blank Screens**: Code is split across small, understandable files. If one modal has a bug, the rest of the application remains fully functional.
2. **Beginner-Friendly**: Each file does one clear thing and is easily readable in 2–3 minutes.
3. **Preserves 100% of Backend Code**: Every API endpoint and database table remains exactly as designed.
4. **Seamless Redesign**: Styling tokens in `styles.css` can be modified in one place without digging through thousands of lines of JSX.

---

*Report generated and saved to `AUDIT.md`.*
