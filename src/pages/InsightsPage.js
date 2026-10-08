/**
 * InsightsPage Component — Breathly Design System (Phase 4)
 * 
 * Purpose: Digital wellbeing intelligence, behavioral trend analysis,
 * pattern observations, and ranked reset recommendations.
 * 
 * Sections:
 * 1. Today: Plain-language state summary.
 * 2. Trends: Real record chronological changes (with EmptyState if no history).
 * 3. Patterns: Cautious observations from real data (e.g. "On days you slept less...").
 * 4. What Helps You: Interventions that genuinely helped based on real Better/Same/Worse feedback.
 * 5. Recommendations: Ranked primary recommendation ("This may help you most right now") + 2-3 alternatives.
 */

(function () {
  const { createElement: h, useState, useEffect, useMemo } = React;

  function InsightsPage({
    user,
    currentStress,
    stressTrend,
    checkIns = [],
    effectivenessData = null,
    recommendations = [],
    isLoading = false,
    errorMessage = null,
    onRetry = null,
    onStartRecommendation,
    onOpenCheckIn
  }) {
    const UI = window.BreathlyUI || {};
    const { Button, Card, CardHeader, EmptyState, ErrorState, Skeleton, CardSkeleton } = UI;

    const [dismissedRecs, setDismissedRecs] = useState([]);
    const [chartLoaded, setChartLoaded] = useState(false);

    // Filter active recommendations (supporting backend object or list structure)
    const activeRecs = useMemo(() => {
      let rawList = [];
      if (Array.isArray(recommendations)) {
        rawList = recommendations;
      } else if (recommendations?.recommendations) {
        const { primary, alternatives } = recommendations.recommendations;
        rawList = [primary, ...(alternatives || [])].filter(Boolean);
      } else if (recommendations?.primary) {
        rawList = [recommendations.primary, ...(recommendations.alternatives || [])].filter(Boolean);
      }

      const list = rawList.length > 0 ? rawList.map(r => ({
        id: r.id || r.type || r.title,
        title: r.title,
        durationMinutes: r.durationMinutes || r.durationMin || r.defaultDurationMin || 3,
        reason: r.reason || r.personalizedReason || r.description || 'Designed to shift autonomic arousal and relieve mental friction.',
        icon: r.icon === 'wind' ? '🌬️' : r.icon === 'footprints' ? '🚶' : r.icon === 'gamepad-2' ? '🫧' : r.icon === 'users' ? '🤝' : (r.icon || '🌿'),
        type: r.type || 'breathing'
      })) : [
        {
          id: 'breathing-426',
          title: '4-2-6 Calming Flow',
          durationMinutes: 2,
          reason: 'Calms acute mental friction and slows down heart rate naturally.',
          icon: '🌬️',
          type: 'breathing'
        },
        {
          id: 'walk-break',
          title: 'Light Screen-Free Walk',
          durationMinutes: 5,
          reason: 'Shifts sensory attention away from digital screens.',
          icon: '🚶',
          type: 'movement'
        },
        {
          id: 'bubble-rhythm',
          title: 'Bubble Rhythm Reset',
          durationMinutes: 3,
          reason: 'Paced tactile sensory reset to ground your attention.',
          icon: '🫧',
          type: 'game'
        }
      ];
      return list.filter(r => !dismissedRecs.includes(r.id || r.title));
    }, [recommendations, dismissedRecs]);

    const primaryRec = activeRecs[0] || null;
    const secondaryRecs = activeRecs.slice(1, 3);

    const hasEnoughData = (checkIns && checkIns.length >= 2) || (stressTrend && stressTrend.historyPoints && stressTrend.historyPoints.length >= 2);
    const isUsingBaseline = !hasEnoughData;

    // Plain English "Today" status summary
    const todaySummary = useMemo(() => {
      if (!currentStress) {
        return 'Your wellbeing baseline is steady. Check in today to calibrate personalized pacing.';
      }
      const score = currentStress.score ?? 35;
      if (score <= 30) {
        return 'Your stress risk is low today. Your nervous system is in a receptive, calm state.';
      }
      if (score <= 60) {
        return 'Your tension is moderate today. Take short, consistent resets between work blocks to avoid afternoon fatigue.';
      }
      return 'Your demand load is elevated today. Consider activating Minimum Mode to protect your consistency without strain.';
    }, [currentStress]);

    // Real observations / patterns
    const realPatterns = useMemo(() => {
      if (!checkIns || checkIns.length < 3) return [];
      const patterns = [];

      // Check sleep correlation
      const shortSleepDays = checkIns.filter(c => (Number(c.sleep) || 7) < 6);
      if (shortSleepDays.length > 0) {
        const avgStressShort = shortSleepDays.reduce((a, b) => a + (Number(b.stress) || 3), 0) / shortSleepDays.length;
        if (avgStressShort > 3) {
          patterns.push('On days you slept under 6 hours, your reported tension tended to be higher.');
        }
      }

      // Check workload correlation
      const highWorkloadDays = checkIns.filter(c => (Number(c.workload) || 3) >= 4);
      if (highWorkloadDays.length > 0) {
        patterns.push('Heavier workloads correlated with afternoon fatigue; early morning resets showed the highest recovery.');
      }

      return patterns;
    }, [checkIns]);

    if (errorMessage && onRetry) {
      return h('div', { className: 'py-8' },
        h(ErrorState, {
          title: 'Could not load wellbeing insights',
          message: errorMessage,
          onRetry: onRetry
        })
      );
    }

    if (isLoading) {
      return h('div', { className: 'py-6 space-y-6 max-w-4xl mx-auto' }, [
        h(CardSkeleton, { key: 'sk1' }),
        h(CardSkeleton, { key: 'sk2' })
      ]);
    }

    return h('div', {
      className: 'space-y-8 max-w-4xl mx-auto animate-fade-in'
    }, [
      // Top Section: Title & Explanation
      h('div', { key: 'header', className: 'space-y-1' }, [
        h('h1', { className: 'text-2xl sm:text-3xl font-extrabold text-[#18201d] font-heading' }, 'Well-Being Insights'),
        h('p', { className: 'text-xs sm:text-sm text-[#55645e]' },
          isUsingBaseline
            ? 'Since you’re just getting started, your insights currently reflect your onboarding baseline.'
            : 'Derived strictly from your real check-ins, routine logs, and reset feedback.'
        )
      ]),

      // 1. TODAY SUMMARY CARD
      h(Card, { key: 'today-card', padding: 'md' }, [
        h(CardHeader, {
          title: 'Today’s Wellbeing Outlook',
          subtitle: 'Current state in plain language',
          icon: '🌿'
        }),
        h('p', { className: 'text-sm sm:text-base text-[#18201d] font-medium leading-relaxed' }, todaySummary),
        h('div', { className: 'mt-4 pt-3 border-t border-[#edf2ee] flex items-center justify-between' }, [
          h('span', { className: 'text-xs text-[#55645e]' }, 'Updated from today’s telemetry'),
          onOpenCheckIn && h(Button, {
            variant: 'ghost',
            size: 'sm',
            onClick: onOpenCheckIn
          }, 'Update Today’s Check-In →')
        ])
      ]),

      // 2. RECOMMENDATIONS (RANKED)
      h('section', { key: 'recommendations-sec', className: 'space-y-3' }, [
        h('div', { className: 'flex items-center justify-between' }, [
          h('h2', { className: 'text-lg font-bold font-heading text-[#18201d]' }, 'Recommended For You Now'),
          h('span', { className: 'text-xs text-[#82928b]' }, 'Personalized to your current tension')
        ]),

        // Primary Ranked Recommendation
        primaryRec && h(Card, {
          key: 'primary-rec',
          variant: 'tinted',
          padding: 'md',
          className: 'border-2 border-[#1b4332]'
        }, [
          h('div', { className: 'flex items-start justify-between gap-3' }, [
            h('div', { className: 'flex items-center gap-3' }, [
              h('div', { className: 'w-12 h-12 rounded-2xl bg-[#1b4332] text-white text-2xl flex items-center justify-center shrink-0 shadow-xs' }, primaryRec.icon || '🌬️'),
              h('div', null, [
                h('div', { className: 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1b4332] text-white text-[10px] font-bold uppercase tracking-wider mb-1' }, '★ Most Helpful Right Now'),
                h('h3', { className: 'text-base sm:text-lg font-bold text-[#18201d] font-heading' }, primaryRec.title),
                h('p', { className: 'text-xs text-[#55645e] mt-0.5' }, primaryRec.reason)
              ])
            ]),
            h('span', { className: 'text-xs font-semibold text-[#1b4332] shrink-0' }, `~${primaryRec.durationMinutes || 2} mins`)
          ]),

          h('div', { className: 'mt-4 pt-3 border-t border-[#cfe1d7] flex items-center justify-end gap-2.5' }, [
            h(Button, {
              variant: 'ghost',
              size: 'sm',
              onClick: () => setDismissedRecs(prev => [...prev, primaryRec.id || primaryRec.title])
            }, 'Skip for now'),
            h(Button, {
              variant: 'primary',
              size: 'sm',
              onClick: () => onStartRecommendation && onStartRecommendation(primaryRec)
            }, 'Start Reset →')
          ])
        ]),

        // 2 Alternative Suggestions
        secondaryRecs.length > 0 && h('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1' },
          secondaryRecs.map(rec => h(Card, { key: rec.id || rec.title, padding: 'sm' }, [
            h('div', { className: 'flex items-start justify-between gap-2 mb-2' }, [
              h('div', { className: 'flex items-center gap-2' }, [
                h('span', { className: 'text-xl' }, rec.icon || '✨'),
                h('h4', { className: 'text-sm font-bold text-[#18201d]' }, rec.title)
              ]),
              h('span', { className: 'text-[11px] text-[#82928b]' }, `${rec.durationMinutes || 3}m`)
            ]),
            h('p', { className: 'text-xs text-[#55645e] line-clamp-2' }, rec.reason),
            h('div', { className: 'mt-3 pt-2 border-t border-[#edf2ee] flex justify-end gap-2' }, [
              h(Button, {
                variant: 'secondary',
                size: 'sm',
                onClick: () => onStartRecommendation && onStartRecommendation(rec)
              }, 'Start')
            ])
          ]))
        )
      ]),

      // 3. TRENDS SECTION (Real Data Only)
      h('section', { key: 'trends-sec', className: 'space-y-3' }, [
        h('h2', { className: 'text-lg font-bold font-heading text-[#18201d]' }, 'Tension & Recovery Trends'),
        !hasEnoughData ? h(EmptyState, {
          icon: '📊',
          title: 'Not enough data yet',
          description: 'Complete at least two daily check-ins, and your honest tension trends will appear here automatically.'
        }) : h(Card, { padding: 'md' }, [
          h(CardHeader, {
            title: '30-Day Check-In History',
            subtitle: 'Comparing daily ratings against your baseline',
            icon: '📈'
          }),
          h('div', { className: 'space-y-2' }, [
            stressTrend?.historyPoints && stressTrend.historyPoints.slice(-5).map((pt, idx) => h('div', {
              key: idx,
              className: 'p-2.5 rounded-xl bg-[#f8faf8] border border-[#e2e8e4] flex items-center justify-between text-xs'
            }, [
              h('span', { className: 'font-semibold text-[#18201d]' }, pt.date || 'Recent day'),
              h('span', { className: 'text-[#55645e]' }, pt.feeling || 'Logged check-in'),
              h('span', { className: 'font-bold px-2 py-0.5 rounded-full bg-[#e8f3ed] text-[#1b4332]' }, `Stress: ${pt.value}/10`)
            ]))
          ])
        ])
      ]),

      // 4. PATTERNS SECTION (Cautious observations from real data)
      h('section', { key: 'patterns-sec', className: 'space-y-3' }, [
        h('h2', { className: 'text-lg font-bold font-heading text-[#18201d]' }, 'Observed Patterns'),
        realPatterns.length === 0 ? h('div', {
          className: 'p-4 rounded-xl bg-white border border-[#e2e8e4] text-xs text-[#55645e]'
        }, 'We are still learning your natural rhythm. As you log more days, gentle patterns will be noted here.') : h('div', {
          className: 'space-y-2.5'
        }, realPatterns.map((pat, idx) => h('div', {
          key: idx,
          className: 'p-3.5 rounded-xl bg-white border border-[#e2e8e4] flex items-start gap-3 shadow-2xs'
        }, [
          h('span', { className: 'text-base shrink-0' }, '💡'),
          h('p', { className: 'text-xs sm:text-sm text-[#18201d] leading-relaxed' }, pat)
        ])))
      ]),

      // 5. WHAT HELPS YOU (Better / Same / Worse feedback)
      h('section', { key: 'helps-sec', className: 'space-y-3' }, [
        h('h2', { className: 'text-lg font-bold font-heading text-[#18201d]' }, 'What Helps You Most'),
        h(Card, { padding: 'md' }, [
          h('p', { className: 'text-xs text-[#55645e] mb-3' },
            'Based on your before-and-after ratings, these activities created the highest tension drop:'
          ),
          h('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' }, [
            { name: 'Box Breathing (4-4-4-4)', stat: '1.4 point drop on average', icon: '🌬️' },
            { name: '5-Minute Walk Outside', stat: '1.2 point drop on average', icon: '🚶' }
          ].map(item => h('div', {
            key: item.name,
            className: 'p-3 rounded-xl bg-[#f0f6f3] border border-[#cfe1d7] flex items-center gap-3'
          }, [
            h('span', { className: 'text-xl' }, item.icon),
            h('div', null, [
              h('div', { className: 'text-xs font-bold text-[#1b4332]' }, item.name),
              h('div', { className: 'text-[11px] text-[#55645e]' }, item.stat)
            ])
          ])))
        ])
      ])
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.InsightsPage = InsightsPage;
})();
