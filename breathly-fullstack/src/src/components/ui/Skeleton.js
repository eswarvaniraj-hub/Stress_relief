/**
 * Skeleton Loader Component — Breathly Design System
 * 
 * Purpose: Gentle pulsing placeholder elements that prevent layout shifts
 * while async backend queries (habits, check-ins, journal) are loading.
 * 
 * Usage:
 * <Skeleton variant="text" width="60%" />
 * <Skeleton variant="avatar" size="44px" />
 * <Skeleton variant="card" height="120px" />
 */

(function () {
  const { createElement: h } = React;

  function Skeleton({
    variant = 'text', // 'text' | 'avatar' | 'card' | 'button' | 'custom'
    width = null,
    height = null,
    className = '',
    count = 1,
    ...props
  }) {
    const baseClasses = 'bg-[#edf2ee] animate-pulse rounded-lg';

    const getVariantStyles = () => {
      switch (variant) {
        case 'text':
          return 'h-4 w-full rounded-md';
        case 'avatar':
          return 'w-11 h-11 rounded-full shrink-0';
        case 'card':
          return 'w-full h-32 rounded-[18px] border border-[#e2e8e4]/60';
        case 'button':
          return 'h-11 w-28 rounded-xl';
        case 'custom':
        default:
          return '';
      }
    };

    const style = {};
    if (width) style.width = width;
    if (height) style.height = height;

    if (count > 1) {
      return h('div', { className: 'space-y-2.5 w-full' },
        Array.from({ length: count }).map((_, i) =>
          h('div', {
            key: i,
            className: `${baseClasses} ${getVariantStyles()} ${className}`.trim(),
            style,
            ...props
          })
        )
      );
    }

    return h('div', {
      className: `${baseClasses} ${getVariantStyles()} ${className}`.trim(),
      style,
      ...props
    });
  }

  // Pre-configured Card Skeleton helper
  function CardSkeleton({ className = '' }) {
    return h('div', {
      className: `p-5 sm:p-6 rounded-[18px] bg-white border border-[#e2e8e4] shadow-[0_2px_8px_rgba(24,32,29,0.03)] space-y-4 ${className}`.trim()
    }, [
      h('div', { key: 'h', className: 'flex items-center gap-3' }, [
        h(Skeleton, { key: 'icon', variant: 'avatar', className: 'w-10 h-10 rounded-xl' }),
        h('div', { key: 'lines', className: 'space-y-2 flex-1' }, [
          h(Skeleton, { key: 'l1', variant: 'text', width: '50%' }),
          h(Skeleton, { key: 'l2', variant: 'text', width: '30%', height: '12px' })
        ])
      ]),
      h(Skeleton, { key: 'body1', variant: 'text', width: '90%' }),
      h(Skeleton, { key: 'body2', variant: 'text', width: '75%' })
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.Skeleton = Skeleton;
  window.BreathlyUI.CardSkeleton = CardSkeleton;
})();
