/**
 * ProfileSettingsPage Component — Breathly Design System (Phase 7)
 * 
 * Purpose: Unified profile identity, account management, and grouped settings.
 * 
 * Groups:
 * 1. Account & Identity: Name, email, Google session, Sign Out, Retake Onboarding.
 * 2. Preferences: Soundscape audio toggle, Daily distraction limit.
 * 3. Privacy & Data: Data retention information, Wipe local data option.
 * 4. About: Breathly version & calming philosophy.
 * 
 * Rules:
 * - Every button works. Dead buttons removed.
 * - Sign out clears session and returns to Welcome.
 * - Re-signing in restores existing data without repeating onboarding.
 */

(function () {
  const { createElement: h, useState } = React;

  function ProfileSettingsPage({
    user,
    profile = {},
    preferences = {},
    onUpdatePreferences,
    onRetakeOnboarding,
    onSignOut,
    onWipeData,
    onBack
  }) {
    const UI = window.BreathlyUI || {};
    const { Button, Card, CardHeader, Modal, TextInput } = UI;

    const [soundEnabled, setSoundEnabled] = useState(preferences.soundEnabled ?? true);
    const [distractionGoal, setDistractionGoal] = useState(preferences.distractionGoalMinutes ?? 45);
    const [isConfirmingWipe, setIsConfirmingWipe] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSavePreferences = async () => {
      setIsSaving(true);
      try {
        if (onUpdatePreferences) {
          await onUpdatePreferences({
            soundEnabled,
            distractionGoalMinutes: parseInt(distractionGoal, 10) || 45
          });
        }
        UI.toast?.success('Preferences updated');
      } catch (err) {
        console.warn('Preferences update error:', err);
      } finally {
        setIsSaving(false);
      }
    };

    return h('div', {
      className: 'space-y-6 max-w-3xl mx-auto animate-fade-in'
    }, [
      // Top Header
      h('div', { key: 'header', className: 'flex items-center justify-between pb-2 border-b border-[#e2e8e4]' }, [
        h('div', { className: 'space-y-0.5' }, [
          h('h1', { className: 'text-2xl font-bold font-heading text-[#18201d]' }, 'Profile & Settings'),
          h('p', { className: 'text-xs text-[#55645e]' }, 'Manage your identity, wellbeing rhythm, and application settings.')
        ]),
        onBack && h('button', {
          type: 'button',
          onClick: onBack,
          className: 'min-h-[44px] px-3.5 py-1.5 rounded-xl border border-[#e2e8e4] bg-white text-xs font-semibold text-[#55645e] hover:text-[#18201d]'
        }, '← Back')
      ]),

      // 1. ACCOUNT & IDENTITY
      h(Card, { key: 'account-card', padding: 'md' }, [
        h(CardHeader, {
          title: 'Account & Identity',
          subtitle: 'Google OAuth session details',
          icon: '👤'
        }),
        h('div', { className: 'flex items-center gap-4 py-2' }, [
          user?.picture ? h('img', {
            src: user.picture,
            alt: user.name || 'User',
            className: 'w-14 h-14 rounded-full border border-[#cfe1d7] shadow-xs'
          }) : h('div', {
            className: 'w-14 h-14 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold text-xl'
          }, (user?.name || 'U').charAt(0)),

          h('div', { className: 'min-w-0 flex-1' }, [
            h('h3', { className: 'text-base font-bold text-[#18201d] truncate' }, user?.name || 'Guest User'),
            h('p', { className: 'text-xs text-[#55645e] truncate' }, user?.email || 'Local browser session')
          ]),

          onSignOut && h(Button, {
            variant: 'danger',
            size: 'sm',
            onClick: onSignOut
          }, 'Sign Out')
        ]),

        h('div', { className: 'mt-4 pt-3 border-t border-[#edf2ee] flex items-center justify-between' }, [
          h('div', null, [
            h('div', { className: 'text-xs font-bold text-[#18201d]' }, 'Lifestyle Profile Calibration'),
            h('div', { className: 'text-[11px] text-[#55645e]' },
              profile?.occupation ? `Configured for ${profile.occupation} • ${profile.dailyHours || '6-8h'}` : 'Not yet calibrated'
            )
          ]),
          onRetakeOnboarding && h(Button, {
            variant: 'secondary',
            size: 'sm',
            onClick: onRetakeOnboarding
          }, 'Retake Onboarding')
        ])
      ]),

      // 2. PREFERENCES (Sound & Focus)
      h(Card, { key: 'prefs-card', padding: 'md' }, [
        h(CardHeader, {
          title: 'Preferences',
          subtitle: 'Sensory feedback & focus pacing',
          icon: '⚙️'
        }),
        h('div', { className: 'space-y-4' }, [
          // Sound toggle
          h('div', { className: 'flex items-center justify-between py-1' }, [
            h('div', null, [
              h('div', { className: 'text-xs font-bold text-[#18201d]' }, 'Ambient Sound & Chimes'),
              h('div', { className: 'text-[11px] text-[#55645e]' }, 'Gentle audio cues during breathing and mini-games')
            ]),
            h('button', {
              type: 'button',
              onClick: () => setSoundEnabled(s => !s),
              className: `w-12 h-7 rounded-full p-1 transition-colors ${
                soundEnabled ? 'bg-[#1b4332]' : 'bg-[#d5ddd8]'
              }`
            }, h('div', {
              className: `w-5 h-5 rounded-full bg-white transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`
            }))
          ]),

          // Distraction Goal
          h('div', { className: 'space-y-2 pt-2 border-t border-[#edf2ee]' }, [
            h('div', { className: 'flex justify-between items-center' }, [
              h('label', { className: 'text-xs font-bold text-[#18201d]' }, 'Daily Distraction Threshold'),
              h('span', { className: 'text-xs font-bold text-[#1b4332]' }, `${distractionGoal} mins`)
            ]),
            h('input', {
              type: 'range',
              min: 15,
              max: 120,
              step: 5,
              value: distractionGoal,
              onChange: e => setDistractionGoal(e.target.value),
              className: 'w-full accent-[#1b4332] cursor-pointer'
            }),
            h('div', { className: 'flex justify-between text-[10px] text-[#82928b]' }, [
              h('span', null, '15 min (Strict)'),
              h('span', null, '45 min (Balanced)'),
              h('span', null, '120 min (Lenient)')
            ])
          ]),

          h('div', { className: 'pt-2 flex justify-end' },
            h(Button, {
              variant: 'primary',
              size: 'sm',
              isLoading: isSaving,
              onClick: handleSavePreferences
            }, 'Save Preferences')
          )
        ])
      ]),

      // 3. PRIVACY & DATA
      h(Card, { key: 'privacy-card', padding: 'md' }, [
        h(CardHeader, {
          title: 'Privacy & Data Protection',
          subtitle: 'Zero ads, zero data selling, complete ownership',
          icon: '🛡️'
        }),
        h('div', { className: 'space-y-3 text-xs text-[#55645e] leading-relaxed' }, [
          h('p', null,
            'Breathly stores your routine completions and check-ins securely. Your personal reflections remain completely private.'
          ),
          h('div', { className: 'pt-2 flex items-center justify-between' }, [
            h('span', null, 'Clear all stored local session data:'),
            h(Button, {
              variant: 'danger',
              size: 'sm',
              onClick: () => setIsConfirmingWipe(true)
            }, 'Wipe Local Data')
          ])
        ])
      ]),

      // 4. ABOUT BREATHLY
      h('div', { key: 'about', className: 'text-center pt-2 space-y-1' }, [
        h('div', { className: 'text-xs font-bold text-[#18201d]' }, 'Breathly v2.0 • Digital Well-Being Platform'),
        h('div', { className: 'text-[11px] text-[#82928b]' },
          'Built with forgiving consistency, minimum mode, and calm aesthetics.'
        )
      ]),

      // Confirmation Modal for Data Wipe
      h(Modal, {
        key: 'wipe-modal',
        isOpen: isConfirmingWipe,
        onClose: () => setIsConfirmingWipe(false),
        title: 'Clear local session data?',
        subtitle: 'This will reset your local offline cache on this device.',
        footer: [
          h(Button, { key: 'c', variant: 'ghost', size: 'sm', onClick: () => setIsConfirmingWipe(false) }, 'Cancel'),
          h(Button, {
            key: 'w',
            variant: 'danger',
            size: 'sm',
            onClick: () => {
              setIsConfirmingWipe(false);
              if (onWipeData) onWipeData();
              UI.toast?.info('Local session data cleared.');
            }
          }, 'Yes, Clear Local Data')
        ]
      }, [
        h('p', { className: 'text-xs text-[#55645e] leading-relaxed' },
          'If you are signed in with Google, your account data in the cloud database will remain preserved.'
        )
      ])
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.ProfileSettingsPage = ProfileSettingsPage;
})();
