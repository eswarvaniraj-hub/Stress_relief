/**
 * ErrorState Component — Breathly Design System
 * 
 * Purpose: Gentle, non-alarming error presentation when an API request fails,
 * network times out, or data cannot be parsed. Includes a "Try again" retry button.
 * 
 * Usage:
 * <ErrorState
 *   title="Unable to load insights"
 *   message="We had trouble reaching your wellbeing records. Check your internet connection and try again."
 *   onRetry={fetchInsights}
 *   isRetrying={loading}
 * />
 */

(function () {
  const { createElement: h } = React;

  function ErrorState({
    title = 'Something didn’t go as planned',
    message = 'We could not reach the server right now. Your existing offline data is completely safe.',
    onRetry = null,
    retryLabel = 'Try again',
    isRetrying = false,
    onBack = null,
    backLabel = 'Go back',
    className = ''
  }) {
    const Button = window.BreathlyUI?.Button;

    return h('div', {
      className: `p-8 sm:p-10 text-center rounded-[22px] bg-[#fdf1ee]/40 border border-[#f6d1c7] flex flex-col items-center justify-center max-w-md mx-auto my-4 animate-fade-in ${className}`.trim(),
      role: 'alert'
    }, [
      // Soft Warning Icon Bubble
      h('div', {
        key: 'icon-bubble',
        className: 'w-14 h-14 rounded-2xl bg-[#fdf1ee] text-[#c25e40] flex items-center justify-center mb-4 border border-[#f6d1c7]/80 shadow-sm'
      }, [
        h('svg', {
          className: 'w-7 h-7',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
          strokeWidth: 2
        }, h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }))
      ]),

      // Title
      h('h3', {
        key: 'title',
        className: 'text-base sm:text-lg font-bold text-[#8a3922] font-heading tracking-tight'
      }, title),

      // Message
      h('p', {
        key: 'msg',
        className: 'text-xs sm:text-sm text-[#55645e] mt-2 max-w-xs leading-relaxed'
      }, message),

      // Action Buttons
      (onRetry || onBack) && h('div', {
        key: 'actions',
        className: 'mt-6 flex items-center justify-center gap-3 flex-wrap'
      }, [
        onBack && (Button ? h(Button, {
          key: 'back-btn',
          variant: 'ghost',
          size: 'md',
          onClick: onBack
        }, backLabel) : h('button', { key: 'back-btn', onClick: onBack }, backLabel)),

        onRetry && (Button ? h(Button, {
          key: 'retry-btn',
          variant: 'primary',
          size: 'md',
          isLoading: isRetrying,
          onClick: onRetry
        }, retryLabel) : h('button', { key: 'retry-btn', onClick: onRetry }, retryLabel))
      ])
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.ErrorState = ErrorState;
})();
