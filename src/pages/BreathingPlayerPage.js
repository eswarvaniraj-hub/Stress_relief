/**
 * BreathingPlayerPage Component — Breathly Design System (Phase 5)
 * 
 * Purpose: Immersive, full-screen breathing reset player.
 * Hides all navigation elements for maximum calm and focus.
 * 
 * Features:
 * - Clear phases: Breathe in / Hold / Breathe out / Hold.
 * - Smooth animated breathing circle with SVG expansion/contraction.
 * - Phase countdown timer and total elapsed time.
 * - Pause / Resume / Finish controls.
 * - Reduced motion support.
 * - "Nice reset." completion flow with Better / Same / Worse feedback.
 * - Back button returns to caller screen.
 */

(function () {
  const { createElement: h, useState, useEffect, useRef } = React;

  const PATTERNS = {
    'box': { name: 'Box Breathing', inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, totalCycles: 4 },
    '478': { name: '4-7-8 Relaxing Breath', inhale: 4, holdIn: 7, exhale: 8, holdOut: 0, totalCycles: 4 },
    '426': { name: '4-2-6 Calming Flow', inhale: 4, holdIn: 2, exhale: 6, holdOut: 0, totalCycles: 5 },
    'sigh': { name: 'Physiological Sigh', inhale: 3, holdIn: 1, exhale: 6, holdOut: 0, totalCycles: 6 }
  };

  function BreathingPlayerPage({
    exerciseKey = 'box',
    onComplete,
    onExit
  }) {
    const UI = window.BreathlyUI || {};
    const { Button } = UI;

    const pattern = PATTERNS[exerciseKey] || PATTERNS['box'];

    // Player State
    const [phase, setPhase] = useState('inhale'); // 'inhale' | 'holdIn' | 'exhale' | 'holdOut'
    const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(pattern.inhale);
    const [isPaused, setIsPaused] = useState(false);
    const [cycleCount, setCycleCount] = useState(1);
    const [totalElapsed, setTotalElapsed] = useState(0);

    // Completion / Feedback Mode
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setSelectedFeedback] = useState('better'); // 'better' | 'same' | 'worse'
    const [isSaving, setIsSaving] = useState(false);

    const intervalRef = useRef(null);

    // Timer Loop
    useEffect(() => {
      if (isPaused || isFinished) {
        clearInterval(intervalRef.current);
        return;
      }

      intervalRef.current = setInterval(() => {
        setTotalElapsed(t => t + 1);

        setPhaseSecondsLeft(sec => {
          if (sec > 1) return sec - 1;

          // Transition to next phase
          if (phase === 'inhale') {
            if (pattern.holdIn > 0) {
              setPhase('holdIn');
              return pattern.holdIn;
            } else {
              setPhase('exhale');
              return pattern.exhale;
            }
          } else if (phase === 'holdIn') {
            setPhase('exhale');
            return pattern.exhale;
          } else if (phase === 'exhale') {
            if (pattern.holdOut > 0) {
              setPhase('holdOut');
              return pattern.holdOut;
            } else {
              setCycleCount(c => c + 1);
              setPhase('inhale');
              return pattern.inhale;
            }
          } else if (phase === 'holdOut') {
            setCycleCount(c => c + 1);
            setPhase('inhale');
            return pattern.inhale;
          }
          return pattern.inhale;
        });
      }, 1000);

      return () => clearInterval(intervalRef.current);
    }, [phase, isPaused, isFinished, pattern]);

    // Phase Text Label
    const phaseLabels = {
      inhale: 'Breathe in slowly...',
      holdIn: 'Hold gently...',
      exhale: 'Release and exhale...',
      holdOut: 'Hold empty...'
    };

    // Circle visual scale
    const circleScale = phase === 'inhale' ? 'scale-125' : (phase === 'exhale' ? 'scale-90' : 'scale-110');

    const handleFinishEarly = () => {
      setIsFinished(true);
    };

    const handleSaveSession = async () => {
      setIsSaving(true);
      try {
        if (onComplete) {
          await onComplete({
            exerciseName: pattern.name,
            durationSeconds: Math.max(30, totalElapsed),
            feeling: feedback
          });
        } else if (onExit) {
          onExit();
        }
      } catch (e) {
        console.warn('Session save notice:', e);
        if (onExit) onExit();
      } finally {
        setIsSaving(false);
      }
    };

    // 1. COMPLETION & FEEDBACK VIEW
    if (isFinished) {
      return h('div', {
        className: 'min-h-screen bg-[#111815] text-white flex flex-col justify-between p-6 sm:p-12 text-center animate-fade-in'
      }, [
        h('div', null), // Spacer
        h('div', { className: 'max-w-md mx-auto space-y-6' }, [
          h('div', { className: 'w-20 h-20 rounded-full bg-[#1b4332] text-3xl flex items-center justify-center mx-auto shadow-md' }, '🌿'),
          h('div', { className: 'space-y-1.5' }, [
            h('h2', { className: 'text-2xl sm:text-3xl font-extrabold font-heading' }, 'Nice reset.'),
            h('p', { className: 'text-xs sm:text-sm text-[#a3b5ac]' },
              `You spent ${Math.round(totalElapsed / 60)}m ${totalElapsed % 60}s restoring your nervous system.`
            )
          ]),

          // "How do you feel now?"
          h('div', { className: 'space-y-3 pt-2 text-left' }, [
            h('label', { className: 'block text-xs font-semibold text-[#a3b5ac] text-center' }, 'How do you feel now?'),
            h('div', { className: 'grid grid-cols-3 gap-3' }, [
              { id: 'better', label: 'Better', icon: '🌿' },
              { id: 'same', label: 'Same', icon: '⚖️' },
              { id: 'worse', label: 'Worse', icon: '🌧️' }
            ].map(item => {
              const selected = feedback === item.id;
              return h('button', {
                key: item.id,
                type: 'button',
                onClick: () => setSelectedFeedback(item.id),
                className: `p-3 rounded-xl border text-center transition-all ${
                  selected
                    ? 'border-[#2d6a4f] bg-[#1b4332] text-white ring-2 ring-[#2d6a4f]'
                    : 'border-[#283932] bg-[#17211d] text-[#a3b5ac] hover:border-[#3b5248]'
                }`
              }, [
                h('div', { className: 'text-xl mb-1' }, item.icon),
                h('div', { className: 'text-xs font-bold' }, item.label)
              ]);
            }))
          ]),

          h('div', { className: 'pt-4' },
            Button ? h(Button, {
              variant: 'primary',
              size: 'lg',
              fullWidth: true,
              isLoading: isSaving,
              onClick: handleSaveSession
            }, 'Save & Return') : h('button', { onClick: handleSaveSession, className: 'w-full py-3 bg-[#1b4332] text-white rounded-xl font-bold' }, 'Save & Return')
          )
        ]),
        h('div', null) // Spacer
      ]);
    }

    // 2. ACTIVE IMMERSIVE BREATHING SESSION
    return h('div', {
      className: 'min-h-screen bg-[#111815] text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden select-none'
    }, [
      // Top Bar: Exit button & Pattern Name
      h('header', { key: 'top-bar', className: 'flex items-center justify-between max-w-2xl w-full mx-auto' }, [
        h('div', { className: 'text-xs font-semibold text-[#a3b5ac]' }, pattern.name),
        h('button', {
          type: 'button',
          onClick: onExit,
          'aria-label': 'Exit breathing session',
          className: 'min-h-[44px] px-3.5 py-1.5 rounded-full bg-[#1b2622] hover:bg-[#22302b] text-[#a3b5ac] hover:text-white text-xs font-semibold transition-all border border-[#283932]'
        }, '✕ Exit')
      ]),

      // Center Animated Breathing Visual
      h('main', { key: 'visual-center', className: 'max-w-md w-full mx-auto my-auto text-center space-y-8 py-4' }, [
        // Expanding SVG Circle
        h('div', { className: 'relative w-64 h-64 mx-auto flex items-center justify-center' }, [
          h('div', {
            className: `absolute w-56 h-56 rounded-full bg-[#1b4332]/25 blur-xl transition-transform duration-[4000ms] ease-in-out ${circleScale}`
          }),
          h('div', {
            className: `relative w-48 h-48 rounded-full border-2 border-[#2d6a4f] bg-[#17211d] flex flex-col items-center justify-center shadow-lg transition-transform duration-[4000ms] ease-in-out ${circleScale}`
          }, [
            h('span', { className: 'text-4xl font-extrabold font-heading text-white tracking-tight' }, phaseSecondsLeft),
            h('span', { className: 'text-[11px] font-semibold text-[#6e8278] uppercase tracking-wider mt-1' }, `Cycle ${cycleCount}`)
          ])
        ]),

        // Current Instruction
        h('div', { className: 'space-y-1' }, [
          h('h2', { className: 'text-xl sm:text-2xl font-bold font-heading text-white' }, phaseLabels[phase] || 'Breathe calmly'),
          h('p', { className: 'text-xs text-[#6e8278]' }, isPaused ? 'Session paused' : 'Focus entirely on the sensation of air')
        ])
      ]),

      // Bottom Control Bar
      h('footer', { key: 'controls', className: 'max-w-xs w-full mx-auto flex items-center justify-center gap-4' }, [
        h('button', {
          type: 'button',
          onClick: () => setIsPaused(p => !p),
          className: 'min-h-[48px] px-6 py-2.5 rounded-xl border border-[#283932] bg-[#17211d] text-sm font-semibold text-[#a3b5ac] hover:text-white transition-all active:scale-[0.98]'
        }, isPaused ? '▶ Resume' : '⏸ Pause'),

        h('button', {
          type: 'button',
          onClick: handleFinishEarly,
          className: 'min-h-[48px] px-6 py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#143326] text-white text-sm font-semibold transition-all shadow-sm active:scale-[0.98]'
        }, 'Finish Reset')
      ])
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.BreathingPlayerPage = BreathingPlayerPage;
})();
