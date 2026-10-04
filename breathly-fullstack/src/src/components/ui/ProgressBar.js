/**
 * ProgressBar Component — Breathly Design System
 * 
 * Purpose: Smooth animated progress indicator for onboarding steps,
 * breathing cycles, daily habit completion, and focus sprints.
 * 
 * Usage:
 * <ProgressBar
 *   value={3}
 *   max={7}
 *   label="Onboarding Progress"
 *   showLabel={true}
 *   variant="primary"
 * />
 */

(function () {
  const { createElement: h } = React;

  function ProgressBar({
    value = 0,
    max = 100,
    label = null,
    showValue = true,
    height = '8px',
    variant = 'primary', // 'primary' | 'teal' | 'amber' | 'coral'
    className = ''
  }) {
    const rawPercent = max > 0 ? (value / max) * 100 : 0;
    const percent = Math.min(100, Math.max(0, Math.round(rawPercent)));

    const variantFills = {
      primary: 'bg-[#1b4332]',
      teal: 'bg-[#2a6b74]',
      amber: 'bg-[#b8772a]',
      coral: 'bg-[#c25e40]'
    };

    return h('div', {
      className: `w-full space-y-1.5 ${className}`.trim(),
      role: 'progressbar',
      'aria-valuenow': value,
      'aria-valuemin': 0,
      'aria-valuemax': max
    }, [
      // Top Label Bar (optional)
      (label || showValue) && h('div', {
        key: 'labels',
        className: 'flex items-center justify-between text-xs font-semibold text-[#55645e]'
      }, [
        label && h('span', { key: 'l', className: 'text-[#18201d]' }, label),
        showValue && h('span', { key: 'v', className: 'text-[#82928b] ml-auto' }, `${percent}%`)
      ]),

      // Track Container
      h('div', {
        key: 'track',
        style: { height },
        className: 'w-full bg-[#edf2ee] rounded-full overflow-hidden'
      }, [
        // Animated Fill
        h('div', {
          key: 'fill',
          style: { width: `${percent}%` },
          className: `h-full rounded-full transition-all duration-300 ease-out ${variantFills[variant] || variantFills.primary}`
        })
      ])
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.ProgressBar = ProgressBar;
})();
