/**
 * WelcomePage Component — Breathly Design System (Phase 3)
 * 
 * Purpose: Serene, uncluttered introduction screen for unauthenticated or first-time users.
 * 
 * Headline: "Take a moment. Check in with yourself."
 * Supporting line: "Breathly helps you understand your wellbeing and find small ways to reset."
 * Actions: Primary "Start your journey", Secondary "Continue with Google", Guest entry.
 */

(function () {
  const { createElement: h, useState } = React;

  function WelcomePage({
    onStartJourney,
    onGoogleSignIn,
    onContinueAsGuest,
    onQuickReset,
    isLoading = false,
    errorMessage = null
  }) {
    const UI = window.BreathlyUI || {};
    const { Button } = UI;

    return h('div', {
      className: 'min-h-screen bg-[#f8faf8] text-[#18201d] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden select-none animate-fade-in'
    }, [
      // Top Subtle Logo
      h('header', { key: 'header', className: 'flex items-center justify-between max-w-4xl w-full mx-auto' }, [
        h('div', { className: 'flex items-center gap-2.5' }, [
          h('div', { className: 'w-8 h-8 rounded-xl bg-[#1b4332] text-white flex items-center justify-center font-bold text-sm shadow-xs' }, 'B'),
          h('span', { className: 'text-base font-bold text-[#18201d] font-heading tracking-tight' }, 'Breathly')
        ]),
        onQuickReset && h('button', {
          type: 'button',
          onClick: onQuickReset,
          className: 'min-h-[44px] px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f0f4f1] text-[#1b4332] text-xs font-semibold border border-[#e2e8e4] transition-all shadow-xs flex items-center gap-1.5'
        }, [
          h('span', null, '🌬️'),
          h('span', null, 'Try 60s Reset')
        ])
      ]),

      // Center Hero Visual & Headline
      h('main', { key: 'main', className: 'max-w-xl w-full mx-auto my-auto text-center space-y-8 py-8' }, [
        // Serene Calm Visual (Expanding breathing ripple circles)
        h('div', { key: 'visual', className: 'relative w-28 h-28 mx-auto flex items-center justify-center' }, [
          h('div', { className: 'absolute inset-0 rounded-full bg-[#1b4332]/5 animate-ping', style: { animationDuration: '4s' } }),
          h('div', { className: 'absolute inset-3 rounded-full bg-[#2d6a4f]/10' }),
          h('div', { className: 'relative w-16 h-16 rounded-full bg-[#e8f3ed] border border-[#cfe1d7] flex items-center justify-center text-2xl shadow-xs' }, '🌿')
        ]),

        // Typography
        h('div', { key: 'text', className: 'space-y-3' }, [
          h('h1', {
            className: 'text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#18201d] font-heading tracking-tight leading-tight'
          }, 'Take a moment.\nCheck in with yourself.'),
          h('p', {
            className: 'text-base sm:text-lg text-[#55645e] max-w-md mx-auto leading-relaxed'
          }, 'Breathly helps you understand your wellbeing and find small ways to reset.')
        ]),

        // Error message (if login failed)
        errorMessage && h('div', {
          key: 'err',
          className: 'p-3 rounded-xl bg-[#fdf1ee] border border-[#f6d1c7] text-xs text-[#8a3922] max-w-sm mx-auto'
        }, errorMessage),

        // Action Buttons
        h('div', { key: 'actions', className: 'space-y-3 max-w-xs mx-auto pt-2' }, [
          Button ? h(Button, {
            variant: 'primary',
            size: 'lg',
            fullWidth: true,
            isLoading,
            onClick: onStartJourney
          }, 'Start your journey') : h('button', {
            onClick: onStartJourney,
            className: 'w-full min-h-[48px] px-6 py-3 rounded-xl bg-[#1b4332] text-white text-base font-semibold'
          }, 'Start your journey'),

          // Continue with Google
          h('button', {
            type: 'button',
            onClick: onGoogleSignIn,
            disabled: isLoading,
            className: 'w-full min-h-[48px] px-6 py-3 rounded-xl bg-white hover:bg-[#f0f4f1] text-[#18201d] text-sm font-semibold border border-[#e2e8e4] shadow-xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]'
          }, [
            h('svg', { className: 'w-4 h-4', viewBox: '0 0 24 24' }, [
              h('path', { fill: '#4285F4', d: 'M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z' }),
              h('path', { fill: '#34A853', d: 'M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.25 21.36 7.35 24 12 24z' }),
              h('path', { fill: '#FBBC05', d: 'M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.25C.45 8.22 0 10.06 0 12s.45 3.78 1.25 5.39l4.02-3.15z' }),
              h('path', { fill: '#EA4335', d: 'M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z' })
            ]),
            h('span', null, 'Continue with Google')
          ]),

          // Guest Exploration Link
          onContinueAsGuest && h('button', {
            type: 'button',
            onClick: onContinueAsGuest,
            className: 'w-full min-h-[44px] text-xs text-[#55645e] hover:text-[#18201d] font-medium pt-1'
          }, 'Explore demo mode without signing in')
        ])
      ]),

      // Subtle Trust Footer
      h('footer', {
        key: 'footer',
        className: 'text-center text-xs text-[#82928b] max-w-sm mx-auto'
      }, 'Breathly is completely ad-free and your personal reflections stay private.')
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.WelcomePage = WelcomePage;
})();
