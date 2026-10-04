/**
 * resetAnalysis.js
 * 
 * Shared calculation module for measuring the real-world effectiveness of resets
 * (breathing exercises, mindful mini-games, etc.) based on before-and-after
 * tension ratings on a 1-5 scale.
 * 
 * Key Principles:
 * 1. Plain English and strictly honest reporting.
 * 2. Never make medical or clinical claims (e.g. never say "reduces stress" or "cures anxiety").
 * 3. Use strictly: "On average your tension dropped by X points".
 * 4. Only sessions with BOTH tensionBefore and tensionAfter count toward results.
 * 5. Requires at least 3 complete rated sessions for a reset type to display an average.
 * 6. If no type has 3 rated sessions yet, displays:
 *    "Try a few resets and rate them to see what works best for you" alongside the count so far.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node.js environment
    module.exports = factory();
  } else {
    // Browser environment
    const exports = factory();
    root.normalizeResetType = exports.normalizeResetType;
    root.calculateResetInsights = exports.calculateResetInsights;
    root.formatTensionDropWording = exports.formatTensionDropWording;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  /**
   * Normalizes various reset identifiers, titles, and keys into clean, canonical display names.
   * e.g. 'breathing-box', 'Box Breathing (4-4-4-4)' -> 'Box Breathing'
   * e.g. 'bubble-rhythm', 'rhythm_pop', 'Bubble Rhythm' -> 'Bubble Rhythm'
   * e.g. 'zen-garden', 'zen_balance', 'sand_ripple' -> 'Zen Garden'
   */
  function normalizeResetType(rawType) {
    if (!rawType) return 'Mindful Reset';
    const s = String(rawType).toLowerCase().trim();

    // Box Breathing
    if (s.includes('box')) return 'Box Breathing';

    // 4-7-8 Breathing
    if (s.includes('4-7-8') || s.includes('478') || s.includes('vagal')) return '4-7-8 Breathing';

    // 4-2-6 Calming Flow
    if (s.includes('4-2-6') || s.includes('426') || s.includes('calming reset')) return '4-2-6 Calming Flow';

    // Physiological Sigh
    if (s.includes('sigh')) return 'Physiological Sigh';

    // Coherent Breathing
    if (s.includes('coherent')) return 'Coherent Breathing';

    // Bubble Rhythm Mini-Game
    if (s.includes('bubble') || s.includes('pop')) return 'Bubble Rhythm';

    // Zen Garden Mini-Game
    if (s.includes('zen') || s.includes('pebble') || s.includes('cairn') || s.includes('sand')) return 'Zen Garden';

    // General fallback: return cleaned title
    return rawType.replace(/\s*\([^)]*\)/g, '').trim() || 'Mindful Reset';
  }

  /**
   * Identifies whether a given resetType is a mini-game or breathing exercise.
   */
  function getResetCategory(resetType) {
    const canonical = normalizeResetType(resetType);
    if (canonical === 'Bubble Rhythm' || canonical === 'Zen Garden') {
      return 'game';
    }
    return 'breathing';
  }

  /**
   * Formats the user-facing wording for a tension drop without making medical claims.
   * Required wording pattern: "On average your tension dropped by X points"
   */
  function formatTensionDropWording(avgDrop) {
    const num = Math.round(avgDrop * 10) / 10;
    const formattedNum = Number.isInteger(num) ? num.toString() : num.toFixed(1);

    if (num > 0) {
      const unit = (num === 1) ? 'point' : 'points';
      return `On average your tension dropped by ${formattedNum} ${unit}`;
    } else if (num === 0) {
      return 'On average your tension remained unchanged (0 points)';
    } else {
      const absNum = Math.abs(num);
      const formattedAbs = Number.isInteger(absNum) ? absNum.toString() : absNum.toFixed(1);
      const unit = (absNum === 1) ? 'point' : 'points';
      return `On average your tension increased by ${formattedAbs} ${unit}`;
    }
  }

  /**
   * Main calculation function to analyze reset effectiveness.
   * 
   * @param {Array} resetSessions - Array of session objects:
   *   [{ id, userId, dateTime, resetType, tensionBefore, tensionAfter, ... }]
   * @param {string|null} categoryFilter - Optional filter: 'game' | 'breathing' | null (all)
   * @returns {Object} Structured insights with ranking, drops, and honest empty states
   */
  function calculateResetInsights(resetSessions = [], categoryFilter = null) {
    const sessions = Array.isArray(resetSessions) ? resetSessions : [];

    // Filter sessions matching the optional category
    const relevantSessions = sessions.filter(s => {
      if (!s) return false;
      if (!categoryFilter) return true;
      const cat = s.category || getResetCategory(s.resetType);
      return cat === categoryFilter;
    });

    const totalSessions = relevantSessions.length;

    // Group sessions by canonical resetType
    const typeGroups = {};

    let totalRatedSessions = 0;

    relevantSessions.forEach(s => {
      const type = normalizeResetType(s.resetType);
      if (!typeGroups[type]) {
        typeGroups[type] = {
          resetType: type,
          category: s.category || getResetCategory(type),
          totalCount: 0,
          ratedCount: 0,
          drops: [],
          sessions: []
        };
      }

      typeGroups[type].totalCount += 1;
      typeGroups[type].sessions.push(s);

      // Only count sessions where BOTH tensionBefore and tensionAfter are provided numbers (1-5)
      const hasBefore = typeof s.tensionBefore === 'number' && Number.isFinite(s.tensionBefore) && s.tensionBefore >= 1 && s.tensionBefore <= 5;
      const hasAfter = typeof s.tensionAfter === 'number' && Number.isFinite(s.tensionAfter) && s.tensionAfter >= 1 && s.tensionAfter <= 5;

      if (hasBefore && hasAfter) {
        const drop = s.tensionBefore - s.tensionAfter;
        typeGroups[type].ratedCount += 1;
        typeGroups[type].drops.push(drop);
        totalRatedSessions += 1;
      }
    });

    // Compute averages and compile ranked array
    const allTypes = Object.values(typeGroups).map(g => {
      const hasSufficientData = g.ratedCount >= 3;
      let avgDrop = 0;
      if (g.ratedCount > 0) {
        const sum = g.drops.reduce((acc, v) => acc + v, 0);
        avgDrop = Math.round((sum / g.ratedCount) * 10) / 10;
      }

      return {
        resetType: g.resetType,
        category: g.category,
        totalCount: g.totalCount,
        ratedCount: g.ratedCount,
        hasSufficientData,
        avgDrop,
        wording: hasSufficientData ? formatTensionDropWording(avgDrop) : null,
        drops: g.drops
      };
    });

    // Sort: First by qualified (>= 3 rated sessions), then by highest avgDrop, then by ratedCount
    allTypes.sort((a, b) => {
      if (a.hasSufficientData && !b.hasSufficientData) return -1;
      if (!a.hasSufficientData && b.hasSufficientData) return 1;
      if (b.avgDrop !== a.avgDrop) return b.avgDrop - a.avgDrop;
      return b.ratedCount - a.ratedCount;
    });

    const qualifiedTypes = allTypes.filter(t => t.hasSufficientData);
    const unqualifiedTypes = allTypes.filter(t => !t.hasSufficientData);
    const hasAnyQualified = qualifiedTypes.length > 0;

    // Helper text for the count so far
    let countSoFarText = '';
    if (totalRatedSessions === 0) {
      countSoFarText = '0 rated sessions so far';
    } else if (totalRatedSessions === 1) {
      countSoFarText = '1 rated session completed so far (3 needed of one type)';
    } else {
      countSoFarText = `${totalRatedSessions} rated sessions completed so far (3 needed of one type)`;
    }

    return {
      totalSessions,
      totalRatedSessions,
      allTypes,
      rankedTypes: allTypes,
      qualifiedTypes,
      unqualifiedTypes,
      hasAnyQualified,
      emptyMessage: 'Try a few resets and rate them to see what works best for you',
      countSoFarText,
      topType: qualifiedTypes[0] || null
    };
  }

  return {
    normalizeResetType,
    getResetCategory,
    formatTensionDropWording,
    calculateResetInsights
  };
});
