/**
 * 404 Not Found Page — Breathly Design System
 * 
 * Purpose: Friendly, peaceful 404 screen when a user navigates to an unrecognized URL.
 * 
 * Usage:
 * <NotFoundPage onReturnHome={() => router.navigate('home')} />
 */

(function () {
  const { createElement: h } = React;

  function NotFoundPage({ onReturnHome }) {
    const UI = window.BreathlyUI || {};
    const Button = UI.Button;

    const handleHome = () => {
      if (onReturnHome) {
        onReturnHome();
      } else if (window.BreathlyRouter) {
        window.BreathlyRouter.navigate('home');
      }
    };

    return h('div', {
      className: 'min-h-[70vh] flex items-center justify-center p-4 sm:p-6 text-center animate-fade-in'
    }, [
      h('div', {
        className: 'w-full max-w-md p-8 sm:p-12 rounded-[24px] bg-white border border-[#e2e8e4] shadow-[0_2px_12px_rgba(24,32,29,0.03)] space-y-5'
      }, [
        h('div', {
          className: 'w-16 h-16 rounded-2xl bg-[#e8f3ed] text-[#1b4332] text-2xl flex items-center justify-center mx-auto'
        }, '🧭'),

        h('div', { className: 'space-y-2' }, [
          h('h1', { className: 'text-2xl font-bold font-heading text-[#18201d]' }, 'Page Not Found'),
          h('p', { className: 'text-xs sm:text-sm text-[#55645e] leading-relaxed max-w-xs mx-auto' },
            'The step or resource you were looking for doesn’t exist or has moved. Take a moment to reset.'
          )
        ]),

        h('div', { className: 'pt-2' },
          Button ? h(Button, {
            variant: 'primary',
            size: 'md',
            onClick: handleHome
          }, 'Return to Home') : h('button', {
            onClick: handleHome,
            className: 'min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1b4332] text-white text-sm font-semibold'
          }, 'Return to Home')
        )
      ])
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.NotFoundPage = NotFoundPage;
})();
