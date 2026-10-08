/**
 * Breathly - Forgiving Routine Consistency & Grace Days Engine
 * 
 * Replaces harsh all-or-nothing daily streaks with a forgiving rolling 7-day consistency measure.
 * 
 * Core Rules:
 * 1. Each day counts as completed if the user completed at least one routine
 *    (including the 2-minute tiny version on a Rough Day).
 * 2. Every user gets 2 grace days per week. A missed day uses a grace day
 *    automatically and does NOT reduce the count shown.
 * 3. Shows "Grace days left this week: N" (where N is 2 minus grace days used).
 * 4. Empty state: If a user has no routines or no history, shows "Add a routine to start"
 *    instead of 0%.
 * 5. Generates 12-month activity heatmap data distinguishing regular completed days,
 *    Rough Days (lighter green), grace days (soft gold), and missed days (gray).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const consistencyLib = factory();
    root.BreathlyConsistency = consistencyLib;
    root.calculateConsistency = consistencyLib.calculateConsistency;
    root.generate12MonthHeatmapData = consistencyLib.generate12MonthHeatmapData;
  }
})(typeof self !== 'undefined' ? self : this, function () {

  /**
   * Calculates forgiving 7-day consistency and grace days.
   * Shared across Dashboard, Habits page, and Reports.
   *
   * @param {Object} appState - Current application state
   * @param {string} [targetDateStr] - Reference date in 'YYYY-MM-DD' format (defaults to today)
   * @returns {Object} Consistency metrics
   */
  function calculateConsistency(appState, targetDateStr) {
    const todayStr = targetDateStr || new Date().toISOString().split('T')[0];

    if (!appState) {
      return {
        hasData: false,
        isEmpty: true,
        displayScore: 'Add a routine to start',
        consistencyRatio: 'Add a routine to start',
        effectiveCount: 0,
        completedDaysCount: 0,
        graceDaysUsed: 0,
        graceDaysLeft: 2,
        consistencyPercent: 0,
        statusText: 'Add a routine to start',
        days: []
      };
    }

    const habits = appState.habits || [];
    const habitHistory = appState.habitHistory || {};

    // Check if any habit was marked completed today
    const hasTodayCompletedInHabits = habits.some(
      h => h.todayStatus === 'full' || h.todayStatus === 'min'
    );

    // Count dates in history where at least one habit was completed
    const historyDates = Object.keys(habitHistory).filter(
      d => habitHistory[d] && habitHistory[d].completed
    );

    const totalCompletedDaysEver = historyDates.length + (hasTodayCompletedInHabits ? 1 : 0);

    // Rule 5: If a user has no routines or no history, show "Add a routine to start" and not 0%
    if (habits.length === 0 || (totalCompletedDaysEver === 0 && !appState.lastActiveDate)) {
      return {
        hasData: false,
        isEmpty: true,
        displayScore: 'Add a routine to start',
        consistencyRatio: 'Add a routine to start',
        effectiveCount: 0,
        completedDaysCount: 0,
        graceDaysUsed: 0,
        graceDaysLeft: 2,
        consistencyPercent: 0,
        statusText: 'Add a routine to start',
        days: []
      };
    }

    // Build the rolling 7-day window ending on todayStr
    // refDate set to noon to avoid daylight saving time offset issues
    const refDate = new Date(todayStr + 'T12:00:00');
    const days = [];
    let rawCompletedCount = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(refDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      let isCompleted = false;
      let isRoughDay = false;

      // 1. Check habit history record for this date
      if (habitHistory[dateStr] && habitHistory[dateStr].completed) {
        isCompleted = true;
        if (habitHistory[dateStr].isRoughDay || appState.minimumModeDate === dateStr) {
          isRoughDay = true;
        }
      }

      // 2. If this is today, also consider live habit statuses in appState
      if (dateStr === todayStr) {
        if (hasTodayCompletedInHabits) {
          isCompleted = true;
        }
        if (appState.minimumModeDate === todayStr) {
          isRoughDay = true;
        }
      }

      if (isCompleted) {
        rawCompletedCount++;
      }

      days.push({
        dateStr,
        isCompleted,
        isRoughDay,
        dayOffset: i, // 0 is today, 1 is yesterday, etc.
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    // Grace Days Calculation:
    // User gets 2 grace days per week.
    // Each missed day automatically consumes 1 grace day (up to 2).
    const missedDaysCount = 7 - rawCompletedCount;
    const graceDaysUsed = Math.min(2, missedDaysCount);
    const graceDaysLeft = Math.max(0, 2 - graceDaysUsed);

    // Consistency count: raw completed days + protected grace days
    const effectiveCount = Math.min(7, rawCompletedCount + graceDaysUsed);
    const consistencyPercent = Math.round((effectiveCount / 7) * 100);

    // Tag the specific missed days that were covered by grace days
    let graceAssigned = 0;
    days.forEach(day => {
      if (!day.isCompleted) {
        if (graceAssigned < graceDaysUsed) {
          day.isGraceDay = true;
          graceAssigned++;
        } else {
          day.isGraceDay = false;
        }
      } else {
        day.isGraceDay = false;
      }
    });

    return {
      hasData: true,
      isEmpty: false,
      displayScore: `Consistency: ${effectiveCount} of last 7 days`,
      consistencyRatio: `${effectiveCount} of 7 days`,
      rawCompletedCount,
      effectiveCount,
      graceDaysUsed,
      graceDaysLeft,
      consistencyPercent,
      statusText: `Grace days left this week: ${graceDaysLeft}`,
      days
    };
  }

  /**
   * Generates a 52-week (12-month) activity calendar heatmap data set.
   * Differentiates:
   * - 'completed': Regular habit completion (Dark green)
   * - 'roughDay': 2-minute Minimum Mode completion (Lighter green)
   * - 'graceDay': Missed day protected by grace day (Soft gold)
   * - 'missed': Uncovered missed day (Gray)
   *
   * @param {Object} appState - Application state
   * @param {string} [targetDateStr] - Reference end date ('YYYY-MM-DD')
   * @returns {Object} Heatmap grid structure with weeks and month labels
   */
  function generate12MonthHeatmapData(appState, targetDateStr) {
    const todayStr = targetDateStr || new Date().toISOString().split('T')[0];
    const habitHistory = (appState && appState.habitHistory) || {};
    const habits = (appState && appState.habits) || [];
    const hasTodayCompleted = habits.some(h => h.todayStatus === 'full' || h.todayStatus === 'min');

    // 52 weeks = 364 days ending today
    const endDate = new Date(todayStr + 'T12:00:00');
    const totalDays = 52 * 7;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (totalDays - 1));

    const weeks = [];
    let currentWeek = [];
    const monthLabels = [];
    let lastMonth = -1;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      let status = 'missed'; // default
      let label = 'No activity';

      let isCompleted = false;
      let isRough = false;

      if (habitHistory[dateStr] && habitHistory[dateStr].completed) {
        isCompleted = true;
        if (habitHistory[dateStr].isRoughDay || appState?.minimumModeDate === dateStr) {
          isRough = true;
        }
      }

      if (dateStr === todayStr) {
        if (hasTodayCompleted) isCompleted = true;
        if (appState?.minimumModeDate === todayStr) isRough = true;
      }

      if (isCompleted) {
        if (isRough) {
          status = 'roughDay';
          label = 'Rough Day (2-min version completed)';
        } else {
          status = 'completed';
          label = 'Completed routine';
        }
      }

      currentWeek.push({
        dateStr,
        dayOfWeek: d.getDay(),
        status,
        label,
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });

      if (currentWeek.length === 7 || i === totalDays - 1) {
        const weekMonth = d.getMonth();
        if (weekMonth !== lastMonth && currentWeek.length === 7) {
          monthLabels.push({
            weekIndex: weeks.length,
            label: d.toLocaleDateString('en-US', { month: 'short' })
          });
          lastMonth = weekMonth;
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Apply 2 grace days per week for missed days in each week
    weeks.forEach(week => {
      let graceLeftInWeek = 2;
      week.forEach(day => {
        if (day.status === 'missed' && graceLeftInWeek > 0) {
          day.status = 'graceDay';
          day.label = 'Missed (Covered by Grace Day)';
          graceLeftInWeek--;
        }
      });
    });

    return {
      weeks,
      monthLabels
    };
  }

  return {
    calculateConsistency,
    generate12MonthHeatmapData
  };
});
