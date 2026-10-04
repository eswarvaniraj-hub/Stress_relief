/**
 * Temporary Design Preview Page — /design-preview
 * 
 * Purpose: Allows visual inspection of all design system tokens and reusable UI components
 * in every state (default, hover, loading, disabled, error, empty, active).
 * 
 * NOTE: This is a TEMPORARY development inspection page and will be removed in Phase 8.
 */

(function () {
  const { createElement: h, useState } = React;

  function DesignPreviewPage({ onBackToApp }) {
    const UI = window.BreathlyUI || {};
    const {
      Button,
      Card,
      CardHeader,
      CardFooter,
      Modal,
      BottomSheet,
      TextInput,
      TextArea,
      toast,
      ToastContainer,
      Skeleton,
      CardSkeleton,
      EmptyState,
      ErrorState,
      ProgressBar
    } = UI;

    // Interactive Demo States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [inputValue, setInputValue] = useState('Alex Rivers');
    const [inputError, setInputError] = useState('');
    const [textareaValue, setTextareaValue] = useState('Took a 5-minute walk outside after feeling tension in my shoulders.');
    const [progressVal, setProgressVal] = useState(60);
    const [isRetrying, setIsRetrying] = useState(false);

    const handleSimulateRetry = () => {
      setIsRetrying(true);
      setTimeout(() => {
        setIsRetrying(false);
        toast?.success('Data refreshed successfully!');
      }, 1200);
    };

    return h('div', {
      className: 'min-h-screen bg-[#f8faf8] text-[#18201d] pb-20 selection:bg-[#e8f3ed] selection:text-[#1b4332]'
    }, [
      // Top Temporary Notice Banner
      h('div', {
        key: 'top-banner',
        className: 'sticky top-0 z-40 bg-[#1b4332] text-white px-4 py-3 shadow-md flex items-center justify-between'
      }, [
        h('div', { key: 'banner-text', className: 'flex items-center gap-2.5 text-xs sm:text-sm font-medium' }, [
          h('span', { className: 'px-2 py-0.5 rounded-full bg-[#e8f3ed] text-[#1b4332] font-bold text-[10px] uppercase tracking-wider' }, 'Temporary'),
          h('span', null, 'Breathly Visual Design System & Component Preview')
        ]),
        onBackToApp && h(Button, {
          key: 'back-btn',
          variant: 'secondary',
          size: 'sm',
          onClick: onBackToApp
        }, '← Back to App')
      ]),

      // Main Content Area
      h('main', { key: 'content', className: 'max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12' }, [

        // Section: Introduction
        h('section', { key: 'intro', className: 'space-y-2' }, [
          h('h1', { className: 'text-2xl sm:text-3xl font-extrabold font-heading text-[#18201d]' }, 'Visual Design System'),
          h('p', { className: 'text-sm text-[#55645e] max-w-2xl leading-relaxed' },
            'Calm, premium, modern, friendly, and trustworthy. Built with an 8px grid, WCAG AA compliant contrast, 44px minimum touch targets, and gentle micro-animations.'
          )
        ]),

        // Section 1: Color Palette
        h('section', { key: 'colors', className: 'space-y-4' }, [
          h('h2', { className: 'text-lg font-bold font-heading text-[#18201d] border-b border-[#e2e8e4] pb-2' }, '1. Color Palette Tokens'),
          h('div', { className: 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3' }, [
            { name: 'Primary Forest', hex: '#1b4332', bg: 'bg-[#1b4332]', text: 'text-white' },
            { name: 'Primary Light', hex: '#2d6a4f', bg: 'bg-[#2d6a4f]', text: 'text-white' },
            { name: 'Primary Tint', hex: '#e8f3ed', bg: 'bg-[#e8f3ed]', text: 'text-[#1b4332]' },
            { name: 'Secondary Sage', hex: '#4b6358', bg: 'bg-[#4b6358]', text: 'text-white' },
            { name: 'Surface White', hex: '#ffffff', bg: 'bg-white border border-[#e2e8e4]', text: 'text-[#18201d]' },
            { name: 'Background', hex: '#f8faf8', bg: 'bg-[#f8faf8] border border-[#e2e8e4]', text: 'text-[#18201d]' },
            { name: 'Charcoal Text', hex: '#18201d', bg: 'bg-[#18201d]', text: 'text-white' },
            { name: 'Muted Slate', hex: '#55645e', bg: 'bg-[#55645e]', text: 'text-white' },
            { name: 'Border Subtle', hex: '#e2e8e4', bg: 'bg-[#e2e8e4]', text: 'text-[#18201d]' },
            { name: 'Warm Amber', hex: '#b8772a', bg: 'bg-[#b8772a]', text: 'text-white' },
            { name: 'Calm Teal', hex: '#2a6b74', bg: 'bg-[#2a6b74]', text: 'text-white' },
            { name: 'Terracotta', hex: '#c25e40', bg: 'bg-[#c25e40]', text: 'text-white' }
          ].map((c) =>
            h('div', { key: c.name, className: 'rounded-xl p-3 shadow-xs space-y-1 ' + c.bg }, [
              h('div', { className: 'text-xs font-bold truncate ' + c.text }, c.name),
              h('div', { className: 'text-[11px] font-mono opacity-80 ' + c.text }, c.hex)
            ])
          ))
        ]),

        // Section 2: Buttons
        h('section', { key: 'buttons', className: 'space-y-4' }, [
          h('h2', { className: 'text-lg font-bold font-heading text-[#18201d] border-b border-[#e2e8e4] pb-2' }, '2. Button Component (Variants, Sizes & States)'),
          h('div', { className: 'space-y-4' }, [
            // Variants
            h('div', { className: 'space-y-2' }, [
              h('p', { className: 'text-xs font-semibold text-[#55645e]' }, 'Variants (44px Minimum Tap Target)'),
              h('div', { className: 'flex flex-wrap items-center gap-3' }, [
                h(Button, { variant: 'primary', onClick: () => toast?.success('Primary clicked!') }, 'Primary Button'),
                h(Button, { variant: 'secondary', onClick: () => toast?.info('Secondary clicked!') }, 'Secondary Button'),
                h(Button, { variant: 'ghost', onClick: () => toast?.warning('Ghost clicked!') }, 'Ghost Button'),
                h(Button, { variant: 'danger', onClick: () => toast?.error('Danger clicked!') }, 'Danger Button')
              ])
            ]),
            // Sizes
            h('div', { className: 'space-y-2' }, [
              h('p', { className: 'text-xs font-semibold text-[#55645e]' }, 'Sizes (Small 44px, Medium 44px, Large 48px)'),
              h('div', { className: 'flex flex-wrap items-center gap-3' }, [
                h(Button, { size: 'sm' }, 'Small Button'),
                h(Button, { size: 'md' }, 'Medium Button'),
                h(Button, { size: 'lg' }, 'Large Button')
              ])
            ]),
            // States
            h('div', { className: 'space-y-2' }, [
              h('p', { className: 'text-xs font-semibold text-[#55645e]' }, 'Interactive States (Loading & Disabled)'),
              h('div', { className: 'flex flex-wrap items-center gap-3' }, [
                h(Button, { isLoading: true }, 'Saving...'),
                h(Button, { disabled: true }, 'Disabled Button'),
                h(Button, {
                  icon: h('svg', { className: 'w-4 h-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
                    h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 4v16m8-8H4' }))
                }, 'With Left Icon')
              ])
            ])
          ])
        ]),

        // Section 3: Cards
        h('section', { key: 'cards', className: 'space-y-4' }, [
          h('h2', { className: 'text-lg font-bold font-heading text-[#18201d] border-b border-[#e2e8e4] pb-2' }, '3. Card Component (18px Radius & Subtle Shadow)'),
          h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
            // Default Card
            h(Card, { key: 'c1' }, [
              h(CardHeader, {
                title: 'Daily Well-Being Check-In',
                subtitle: 'Takes ~20 seconds every morning',
                icon: '🌿'
              }),
              h('p', { className: 'text-sm text-[#55645e] leading-relaxed' },
                'Track your mood, stress level, and sleep hours to calibrate personalized reset recommendations.'
              ),
              h(CardFooter, null, [
                h(Button, { variant: 'ghost', size: 'sm' }, 'Skip Today'),
                h(Button, { variant: 'primary', size: 'sm', onClick: () => toast?.info('Check-in opened') }, 'Start Check-In')
              ])
            ]),
            // Interactive Card
            h(Card, {
              key: 'c2',
              variant: 'default',
              interactive: true,
              onClick: () => toast?.success('Interactive card clicked!')
            }, [
              h(CardHeader, {
                title: 'Box Breathing (4-4-4-4)',
                subtitle: 'Recommended mindful reset • 3 mins',
                icon: '🌬️'
              }),
              h('p', { className: 'text-sm text-[#55645e] leading-relaxed' },
                'Four equal counts of inhalation, breath retention, exhalation, and hold to restore vagal tone.'
              ),
              h(CardFooter, null, [
                h('span', { className: 'text-xs text-[#2d6a4f] font-semibold mr-auto' }, '⚡ Ready anytime'),
                h(Button, { variant: 'secondary', size: 'sm' }, 'Begin Reset →')
              ])
            ])
          ])
        ]),

        // Section 4: Modal & BottomSheet Triggers
        h('section', { key: 'modals-section', className: 'space-y-4' }, [
          h('h2', { className: 'text-lg font-bold font-heading text-[#18201d] border-b border-[#e2e8e4] pb-2' }, '4. Modal and BottomSheet Dialogues'),
          h('div', { className: 'flex flex-wrap items-center gap-3' }, [
            h(Button, {
              variant: 'primary',
              onClick: () => setIsModalOpen(true)
            }, 'Preview Standard Modal'),
            h(Button, {
              variant: 'secondary',
              onClick: () => setIsSheetOpen(true)
            }, 'Preview BottomSheet (Mobile-First Drawer)')
          ]),

          // Active Modal Instance
          h(Modal, {
            isOpen: isModalOpen,
            onClose: () => setIsModalOpen(false),
            title: 'Sample Modal Dialogue',
            subtitle: 'Accessible with ESC key handling and backdrop click',
            footer: [
              h(Button, { key: 'cancel', variant: 'ghost', size: 'md', onClick: () => setIsModalOpen(false) }, 'Cancel'),
              h(Button, { key: 'ok', variant: 'primary', size: 'md', onClick: () => { setIsModalOpen(false); toast?.success('Modal action confirmed'); } }, 'Confirm Action')
            ]
          }, [
            h('p', { key: 'p1', className: 'mb-2' }, 'This modal uses a gentle backdrop blur and smooth entrance animation.'),
            h('p', { key: 'p2', className: 'text-[#55645e]' }, 'Press Escape or click outside to dismiss.')
          ]),

          // Active BottomSheet Instance
          h(BottomSheet, {
            isOpen: isSheetOpen,
            onClose: () => setIsSheetOpen(false),
            title: 'Suggested Reset: Physiological Sigh',
            subtitle: '2 deep inhales through nose, slow sigh exhale through mouth',
            footer: [
              h(Button, { key: 'cancel', variant: 'ghost', size: 'md', onClick: () => setIsSheetOpen(false) }, 'Maybe later'),
              h(Button, { key: 'start', variant: 'primary', size: 'md', onClick: () => { setIsSheetOpen(false); toast?.success('Reset started!'); } }, 'Start 60s Reset')
            ]
          }, [
            h('div', { key: 'b-body', className: 'space-y-3' }, [
              h('p', null, 'The physiological sigh is the fastest biological way to bring your autonomic nervous system back into balance in real time.'),
              h('div', { className: 'p-3 rounded-xl bg-[#f0f6f3] border border-[#cfe1d7] text-xs text-[#1b4332]' },
                '💡 Tip: On average, users report a 1.2 point tension drop after 2 minutes.'
              )
            ])
          ])
        ]),

        // Section 5: Form Controls (TextInput & TextArea)
        h('section', { key: 'inputs', className: 'space-y-4' }, [
          h('h2', { className: 'text-lg font-bold font-heading text-[#18201d] border-b border-[#e2e8e4] pb-2' }, '5. Form Controls (TextInput & TextArea)'),
          h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
            // TextInput: Default
            h(TextInput, {
              label: 'Your Preferred Name',
              id: 'demo-name',
              value: inputValue,
              onChange: (e) => setInputValue(e.target.value),
              placeholder: 'e.g. Jordan',
              helperText: 'Used for friendly greetings.'
            }),
            // TextInput: Error State
            h(TextInput, {
              label: 'Daily Distraction Goal (Minutes)',
              id: 'demo-goal',
              value: '180',
              onChange: () => {},
              error: 'Goal must be 120 minutes or fewer for effective focus pacing.',
              placeholder: 'e.g. 45'
            }),
            // TextArea: Default
            h('div', { className: 'md:col-span-2' },
              h(TextArea, {
                label: 'Reflection Note',
                id: 'demo-notes',
                value: textareaValue,
                onChange: (e) => setTextareaValue(e.target.value),
                rows: 3,
                helperText: 'Your notes are encrypted and stored privately.'
              })
            )
          ])
        ]),

        // Section 6: Toast Notifications
        h('section', { key: 'toasts-section', className: 'space-y-4' }, [
          h('h2', { className: 'text-lg font-bold font-heading text-[#18201d] border-b border-[#e2e8e4] pb-2' }, '6. Toast Notifications'),
          h('p', { className: 'text-xs text-[#55645e]' }, 'Click any button below to trigger live non-intrusive floating toasts:'),
          h('div', { className: 'flex flex-wrap items-center gap-3' }, [
            h(Button, { variant: 'secondary', size: 'sm', onClick: () => toast?.success('Daily check-in recorded successfully.') }, 'Success Toast'),
            h(Button, { variant: 'secondary', size: 'sm', onClick: () => toast?.warning('Approaching your 45m daily distraction threshold.') }, 'Warning Toast'),
            h(Button, { variant: 'secondary', size: 'sm', onClick: () => toast?.error('Unable to reach backend. Changes saved locally.') }, 'Error Toast'),
            h(Button, { variant: 'secondary', size: 'sm', onClick: () => toast?.info('Minimum mode activated for today.') }, 'Info Toast')
          ])
        ]),

        // Section 7: Skeletons & Loaders
        h('section', { key: 'skeletons', className: 'space-y-4' }, [
          h('h2', { className: 'text-lg font-bold font-heading text-[#18201d] border-b border-[#e2e8e4] pb-2' }, '7. Skeleton Loaders (Zero Layout Shift)'),
          h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
            h(CardSkeleton, { key: 'sk1' }),
            h(Card, { key: 'sk2', padding: 'md' }, [
              h('div', { className: 'space-y-3' }, [
                h(Skeleton, { variant: 'text', width: '40%' }),
                h(Skeleton, { variant: 'text', count: 3 }),
                h('div', { className: 'flex gap-2 pt-2' }, [
                  h(Skeleton, { variant: 'button', width: '90px' }),
                  h(Skeleton, { variant: 'button', width: '90px' })
                ])
              ])
            ])
          ])
        ]),

        // Section 8: Empty & Error States
        h('section', { key: 'states', className: 'space-y-4' }, [
          h('h2', { className: 'text-lg font-bold font-heading text-[#18201d] border-b border-[#e2e8e4] pb-2' }, '8. EmptyState & ErrorState Components'),
          h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
            // EmptyState Demo
            h(EmptyState, {
              key: 'empty',
              icon: '🌱',
              title: 'No habits logged yet',
              description: 'Start small. Even a 2-minute morning stretch builds durable consistency.',
              actionLabel: 'Create First Habit',
              onAction: () => toast?.info('Add habit dialog triggered')
            }),
            // ErrorState Demo
            h(ErrorState, {
              key: 'error',
              title: 'Could not load your trend data',
              message: 'The network connection timed out. Don’t worry, your offline records are safe.',
              retryLabel: 'Try again',
              isRetrying: isRetrying,
              onRetry: handleSimulateRetry
            })
          ])
        ]),

        // Section 9: ProgressBar
        h('section', { key: 'progress', className: 'space-y-4' }, [
          h('h2', { className: 'text-lg font-bold font-heading text-[#18201d] border-b border-[#e2e8e4] pb-2' }, '9. ProgressBar Component'),
          h('div', { className: 'space-y-4 max-w-md' }, [
            h(ProgressBar, {
              value: progressVal,
              max: 100,
              label: 'Onboarding Progress (Step 3 of 5)',
              variant: 'primary'
            }),
            h('div', { className: 'flex items-center gap-2 pt-2' }, [
              h(Button, { size: 'sm', variant: 'secondary', onClick: () => setProgressVal(p => Math.max(0, p - 20)) }, '-20%'),
              h(Button, { size: 'sm', variant: 'secondary', onClick: () => setProgressVal(p => Math.min(100, p + 20)) }, '+20%')
            ])
          ])
        ])

      ]),

      // Global Toast Container
      h(ToastContainer, { key: 'toast-container' })
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.DesignPreviewPage = DesignPreviewPage;
})();
