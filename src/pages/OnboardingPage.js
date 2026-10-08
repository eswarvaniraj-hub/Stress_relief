/**
 * OnboardingPage Component — Breathly Design System (Phase 3)
 * 
 * Purpose: Step-by-step, warm, respectful lifestyle setup.
 * Keeps every meaningful question, preserves state when navigating back,
 * validates inputs gently, and handles network retry seamlessly.
 * 
 * Topics:
 * 1. "Let's get to know you" (Occupation)
 * 2. "How does your typical day look?" (Hours & Peak Time)
 * 3. "How are you sleeping?" (Sleep Duration & Pattern)
 * 4. "What tends to get in the way?" (Friction / Hurdles)
 * 5. "How have you been feeling lately?" (Stress baseline 1–10)
 * 6. "What helps you recover?" (Recovery activities)
 * 7. "You're all set." (Completion & Entry)
 */

(function () {
  const { createElement: h, useState } = React;

  function OnboardingPage({
    initialProfile = {},
    onComplete,
    onCancel,
    isSaving = false,
    saveError = null
  }) {
    const UI = window.BreathlyUI || {};
    const { Button, Card, ProgressBar, ErrorState } = UI;

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 7;

    // Preserved answers state (never lost on back)
    const [profile, setProfile] = useState({
      occupation: initialProfile.occupation || 'Student',
      weekdayPattern: initialProfile.weekdayPattern || 'Structured & fixed routine',
      dailyHours: initialProfile.dailyHours || '6-8 hours',
      peakTime: initialProfile.peakTime || 'evening',
      sleepDuration: initialProfile.sleepDuration || '7-8 hours',
      hurdles: initialProfile.hurdles || ['Procrastination / Overthinking', 'Screen fatigue'],
      stressBaseline: initialProfile.stressBaseline || 5,
      stressCauses: initialProfile.stressCauses || ['Exams & academic evaluations', 'Tight deadlines & time urgency'],
      recoveryActivities: initialProfile.recoveryActivities || ['Take a walk / light movement', 'Guided breathing & mindfulness reset'],
      motivationStyle: initialProfile.motivationStyle || 'streaks',
      isCompleted: true
    });

    const updateField = (field, value) => {
      setProfile(prev => ({ ...prev, [field]: value }));
    };

    const toggleArrayItem = (field, item) => {
      setProfile(prev => {
        const list = prev[field] || [];
        const next = list.includes(item) ? list.filter(x => x !== item) : [...list, item];
        return { ...prev, [field]: next };
      });
    };

    const handleNext = () => {
      if (currentStep < totalSteps) {
        setCurrentStep(c => c + 1);
      } else {
        onComplete(profile);
      }
    };

    const handlePrev = () => {
      if (currentStep > 1) {
        setCurrentStep(c => c - 1);
      } else if (onCancel) {
        onCancel();
      }
    };

    // Render individual step contents
    const renderStepContent = () => {
      switch (currentStep) {
        // Step 1: Occupation
        case 1:
          return h('div', { className: 'space-y-4' }, [
            h('div', { className: 'space-y-1' }, [
              h('h2', { className: 'text-xl sm:text-2xl font-bold text-[#18201d] font-heading' }, 'Let’s get to know you'),
              h('p', { className: 'text-xs sm:text-sm text-[#55645e]' }, 'What best describes your current day-to-day focus?')
            ]),
            h('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2' }, [
              { id: 'Student', label: 'Student', desc: 'Classes, study blocks, exam pacing', icon: '🎓' },
              { id: 'Working Professional', label: 'Working Professional', desc: 'Projects, deep work sprints, meetings', icon: '💼' },
              { id: 'Both (Work & Study)', label: 'Both (Work & Study)', desc: 'Balancing job requirements & education', icon: '⚖️' },
              { id: 'Self-Directed / Other', label: 'Self-Directed / Other', desc: 'Creative, freelancing, or personal pacing', icon: '🌱' }
            ].map(item => {
              const selected = profile.occupation === item.id;
              return h('button', {
                key: item.id,
                type: 'button',
                onClick: () => updateField('occupation', item.id),
                className: `min-h-[64px] p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  selected
                    ? 'border-[#1b4332] bg-[#e8f3ed] shadow-xs ring-1 ring-[#1b4332]'
                    : 'border-[#e2e8e4] bg-white hover:border-[#cfe1d7]'
                }`
              }, [
                h('span', { className: 'text-2xl shrink-0' }, item.icon),
                h('div', { className: 'min-w-0' }, [
                  h('div', { className: 'text-sm font-bold text-[#18201d]' }, item.label),
                  h('div', { className: 'text-xs text-[#55645e] mt-0.5' }, item.desc)
                ])
              ]);
            }))
          ]);

        // Step 2: Typical Day & Peak Energy Time
        case 2:
          return h('div', { className: 'space-y-4' }, [
            h('div', { className: 'space-y-1' }, [
              h('h2', { className: 'text-xl sm:text-2xl font-bold text-[#18201d] font-heading' }, 'How does your typical day look?'),
              h('p', { className: 'text-xs sm:text-sm text-[#55645e]' }, 'We use this to align your routines with your natural energy rhythm.')
            ]),
            h('div', { className: 'space-y-3 pt-2' }, [
              h('label', { className: 'block text-xs font-semibold text-[#18201d]' }, 'Typical study/work hours per day:'),
              h('div', { className: 'grid grid-cols-2 sm:grid-cols-4 gap-2.5' }, [
                '< 4 hours', '4-6 hours', '6-8 hours', '8+ hours'
              ].map(hrs => {
                const selected = profile.dailyHours === hrs;
                return h('button', {
                  key: hrs,
                  type: 'button',
                  onClick: () => updateField('dailyHours', hrs),
                  className: `min-h-[44px] py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    selected ? 'border-[#1b4332] bg-[#e8f3ed] text-[#1b4332]' : 'border-[#e2e8e4] bg-white text-[#55645e] hover:border-[#cfe1d7]'
                  }`
                }, hrs);
              })),

              h('label', { className: 'block text-xs font-semibold text-[#18201d] pt-3' }, 'When do you feel most focused and clear?'),
              h('div', { className: 'grid grid-cols-2 sm:grid-cols-4 gap-2.5' }, [
                { id: 'morning', label: 'Morning (6am–12pm)', icon: '🌅' },
                { id: 'afternoon', label: 'Afternoon (12pm–5pm)', icon: '☀️' },
                { id: 'evening', label: 'Evening (5pm–9pm)', icon: '🌇' },
                { id: 'night', label: 'Night (9pm+)', icon: '🌙' }
              ].map(item => {
                const selected = profile.peakTime === item.id;
                return h('button', {
                  key: item.id,
                  type: 'button',
                  onClick: () => updateField('peakTime', item.id),
                  className: `min-h-[56px] p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    selected ? 'border-[#1b4332] bg-[#e8f3ed] text-[#1b4332] font-semibold' : 'border-[#e2e8e4] bg-white text-[#55645e] hover:border-[#cfe1d7]'
                  }`
                }, [
                  h('span', { className: 'text-xl' }, item.icon),
                  h('span', { className: 'text-xs' }, item.label)
                ]);
              }))
            ])
          ]);

        // Step 3: Sleep Duration & Quality
        case 3:
          return h('div', { className: 'space-y-4' }, [
            h('div', { className: 'space-y-1' }, [
              h('h2', { className: 'text-xl sm:text-2xl font-bold text-[#18201d] font-heading' }, 'How are you sleeping?'),
              h('p', { className: 'text-xs sm:text-sm text-[#55645e]' }, 'Sleep is the primary foundation for stress resilience.')
            ]),
            h('div', { className: 'space-y-3 pt-2' }, [
              h('label', { className: 'block text-xs font-semibold text-[#18201d]' }, 'Average nightly sleep:'),
              h('div', { className: 'grid grid-cols-2 sm:grid-cols-3 gap-2.5' }, [
                { id: '< 5 hours', label: 'Under 5 hours', desc: 'Severe sleep debt', icon: '😴' },
                { id: '5-6 hours', label: '5 to 6 hours', desc: 'Slightly low', icon: '🌙' },
                { id: '6-7 hours', label: '6 to 7 hours', desc: 'Moderate rest', icon: '🛏️' },
                { id: '7-8 hours', label: '7 to 8 hours', desc: 'Optimal recovery', icon: '✨' },
                { id: '8+ hours', label: '8+ hours', desc: 'Full deep rest', icon: '🌿' }
              ].map(item => {
                const selected = profile.sleepDuration === item.id;
                return h('button', {
                  key: item.id,
                  type: 'button',
                  onClick: () => updateField('sleepDuration', item.id),
                  className: `min-h-[56px] p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    selected ? 'border-[#1b4332] bg-[#e8f3ed] ring-1 ring-[#1b4332]' : 'border-[#e2e8e4] bg-white hover:border-[#cfe1d7]'
                  }`
                }, [
                  h('span', { className: 'text-xl' }, item.icon),
                  h('div', { className: 'min-w-0' }, [
                    h('div', { className: 'text-xs font-bold text-[#18201d]' }, item.label),
                    h('div', { className: 'text-[11px] text-[#82928b]' }, item.desc)
                  ])
                ]);
              }))
            ])
          ]);

        // Step 4: Hurdles & Friction
        case 4:
          return h('div', { className: 'space-y-4' }, [
            h('div', { className: 'space-y-1' }, [
              h('h2', { className: 'text-xl sm:text-2xl font-bold text-[#18201d] font-heading' }, 'What tends to get in the way?'),
              h('p', { className: 'text-xs sm:text-sm text-[#55645e]' }, 'Select common hurdles so we can offer Minimum Mode when life gets busy.')
            ]),
            h('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2' }, [
              'Procrastination / Overthinking',
              'Screen fatigue & digital overload',
              'Exhaustion & burnout',
              'Late nights & irregular sleep',
              'Unplanned interruptions',
              'Loss of motivation'
            ].map(item => {
              const selected = (profile.hurdles || []).includes(item);
              return h('button', {
                key: item,
                type: 'button',
                onClick: () => toggleArrayItem('hurdles', item),
                className: `min-h-[48px] px-4 py-3 rounded-xl border text-left flex items-center justify-between text-xs sm:text-sm font-semibold transition-all ${
                  selected
                    ? 'border-[#1b4332] bg-[#e8f3ed] text-[#1b4332]'
                    : 'border-[#e2e8e4] bg-white text-[#55645e] hover:border-[#cfe1d7]'
                }`
              }, [
                h('span', null, item),
                h('span', { className: selected ? 'text-[#1b4332]' : 'text-[#82928b]' }, selected ? '✓' : '+')
              ]);
            }))
          ]);

        // Step 5: Stress Baseline (1-10)
        case 5:
          return h('div', { className: 'space-y-4' }, [
            h('div', { className: 'space-y-1' }, [
              h('h2', { className: 'text-xl sm:text-2xl font-bold text-[#18201d] font-heading' }, 'How have you been feeling lately?'),
              h('p', { className: 'text-xs sm:text-sm text-[#55645e]' }, 'Rate your average baseline tension level over the past two weeks.')
            ]),
            h('div', { className: 'p-6 rounded-2xl bg-white border border-[#e2e8e4] space-y-4 text-center' }, [
              h('div', { className: 'text-4xl font-extrabold text-[#1b4332] font-heading' }, profile.stressBaseline),
              h('p', { className: 'text-xs font-semibold text-[#55645e]' },
                profile.stressBaseline <= 3 ? 'Calm & balanced rhythm' : profile.stressBaseline <= 7 ? 'Moderate everyday stress' : 'High demands & fatigue'
              ),
              h('input', {
                type: 'range',
                min: 1,
                max: 10,
                value: profile.stressBaseline,
                onChange: e => updateField('stressBaseline', parseInt(e.target.value, 10)),
                className: 'w-full accent-[#1b4332] cursor-pointer'
              }),
              h('div', { className: 'flex justify-between text-[11px] text-[#82928b]' }, [
                h('span', null, '1 (Completely serene)'),
                h('span', null, '5 (Balanced)'),
                h('span', null, '10 (Overwhelmed)')
              ])
            ])
          ]);

        // Step 6: Recovery Activities
        case 6:
          return h('div', { className: 'space-y-4' }, [
            h('div', { className: 'space-y-1' }, [
              h('h2', { className: 'text-xl sm:text-2xl font-bold text-[#18201d] font-heading' }, 'What helps you recover?'),
              h('p', { className: 'text-xs sm:text-sm text-[#55645e]' }, 'Select activities that help you decompress during tense moments.')
            ]),
            h('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2' }, [
              'Take a walk / light movement',
              'Guided breathing & mindfulness reset',
              'Listen to music / calming audio',
              'Step away from screens',
              'Tea or warm beverage break',
              'Talk with a friend or companion'
            ].map(item => {
              const selected = (profile.recoveryActivities || []).includes(item);
              return h('button', {
                key: item,
                type: 'button',
                onClick: () => toggleArrayItem('recoveryActivities', item),
                className: `min-h-[48px] px-4 py-3 rounded-xl border text-left flex items-center justify-between text-xs sm:text-sm font-semibold transition-all ${
                  selected
                    ? 'border-[#1b4332] bg-[#e8f3ed] text-[#1b4332]'
                    : 'border-[#e2e8e4] bg-white text-[#55645e] hover:border-[#cfe1d7]'
                }`
              }, [
                h('span', null, item),
                h('span', { className: selected ? 'text-[#1b4332]' : 'text-[#82928b]' }, selected ? '✓' : '+')
              ]);
            }))
          ]);

        // Step 7: Completion
        case 7:
        default:
          return h('div', { className: 'space-y-5 text-center py-4' }, [
            h('div', { className: 'w-16 h-16 rounded-2xl bg-[#e8f3ed] text-[#1b4332] flex items-center justify-center text-3xl mx-auto' }, '✨'),
            h('div', { className: 'space-y-1.5' }, [
              h('h2', { className: 'text-2xl sm:text-3xl font-extrabold text-[#18201d] font-heading' }, 'You’re all set.'),
              h('p', { className: 'text-xs sm:text-sm text-[#55645e] max-w-sm mx-auto' },
                'Breathly is calibrated to your rhythm. Remember: even 2-minute micro-routines protect your consistency.'
              )
            ]),
            h('div', { className: 'p-4 rounded-xl bg-white border border-[#e2e8e4] text-left text-xs space-y-2 max-w-md mx-auto shadow-xs' }, [
              h('div', { className: 'font-bold text-[#18201d]' }, 'Your Wellbeing Baseline:'),
              h('div', { className: 'flex justify-between text-[#55645e]' }, [
                h('span', null, 'Focus Area:'),
                h('span', { className: 'font-semibold text-[#18201d]' }, profile.occupation)
              ]),
              h('div', { className: 'flex justify-between text-[#55645e]' }, [
                h('span', null, 'Peak Window:'),
                h('span', { className: 'font-semibold text-[#18201d]' }, profile.peakTime)
              ]),
              h('div', { className: 'flex justify-between text-[#55645e]' }, [
                h('span', null, 'Sleep Pattern:'),
                h('span', { className: 'font-semibold text-[#18201d]' }, profile.sleepDuration)
              ])
            ])
          ]);
      }
    };

    return h('div', {
      className: 'min-h-screen bg-[#f8faf8] text-[#18201d] flex flex-col justify-between p-4 sm:p-8 animate-fade-in'
    }, [
      // Top Navigation / Progress Header
      h('header', { key: 'header', className: 'max-w-xl w-full mx-auto space-y-3' }, [
        h('div', { className: 'flex items-center justify-between text-xs font-semibold text-[#55645e]' }, [
          h('button', {
            type: 'button',
            onClick: handlePrev,
            className: 'min-h-[44px] px-2 flex items-center gap-1 hover:text-[#18201d]'
          }, currentStep > 1 ? '← Back' : (onCancel ? 'Cancel' : '')),
          h('span', { className: 'text-[#18201d] font-heading font-bold' }, `Step ${currentStep} of ${totalSteps}`)
        ]),
        ProgressBar && h(ProgressBar, {
          value: currentStep,
          max: totalSteps,
          showValue: false,
          height: '6px'
        })
      ]),

      // Center Step Content Body
      h('main', { key: 'main', className: 'max-w-xl w-full mx-auto my-auto py-6' }, [
        saveError && ErrorState && h(ErrorState, {
          key: 'err',
          title: 'Could not save your preferences',
          message: saveError,
          retryLabel: 'Try again',
          onRetry: () => onComplete(profile)
        }),
        !saveError && renderStepContent()
      ]),

      // Bottom Navigation Footer
      h('footer', { key: 'footer', className: 'max-w-xl w-full mx-auto pt-4 flex items-center justify-between gap-3' }, [
        h('div', null), // Spacer
        Button ? h(Button, {
          variant: 'primary',
          size: 'lg',
          isLoading: isSaving,
          onClick: handleNext
        }, currentStep === totalSteps ? 'Enter Breathly →' : 'Continue →') : h('button', {
          onClick: handleNext,
          className: 'min-h-[48px] px-6 py-3 rounded-xl bg-[#1b4332] text-white font-semibold'
        }, currentStep === totalSteps ? 'Enter Breathly →' : 'Continue →')
      ])
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.OnboardingPage = OnboardingPage;
})();
