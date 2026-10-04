/**
 * Card Component — Breathly Design System
 * 
 * Purpose: Unified container with standard 18px border radius, subtle border,
 * extremely gentle shadow, and consistent padding.
 * 
 * Usage:
 * <Card padding="md" variant="default" onClick={handleClick}>
 *   <CardHeader title="Today's Check-In" subtitle="Quick 20s reflection" />
 *   <div>Card Content</div>
 *   <CardFooter>Action buttons</CardFooter>
 * </Card>
 */

(function () {
  const { createElement: h } = React;

  function Card({
    children,
    padding = 'md',        // 'none' | 'sm' | 'md' | 'lg'
    variant = 'default',   // 'default' | 'elevated' | 'tinted' | 'flat'
    interactive = false,   // adds hover elevation and cursor pointer
    onClick = null,
    className = '',
    ...props
  }) {
    const isClickable = interactive || typeof onClick === 'function';

    const paddingClasses = {
      none: '',
      sm: 'p-3 sm:p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8'
    };

    const variantClasses = {
      default: 'bg-white border border-[#e2e8e4] shadow-[0_2px_8px_rgba(24,32,29,0.03)]',
      elevated: 'bg-white border border-[#e2e8e4] shadow-[0_4px_16px_rgba(24,32,29,0.06)]',
      tinted: 'bg-[#f0f6f3] border border-[#cfe1d7]',
      flat: 'bg-[#f8faf8] border border-[#e2e8e4]'
    };

    const interactiveClasses = isClickable
      ? 'cursor-pointer hover:border-[#cfe1d7] hover:shadow-[0_4px_12px_rgba(24,32,29,0.06)] active:scale-[0.99] transition-all duration-150'
      : '';

    return h('div', {
      onClick,
      role: isClickable ? 'button' : undefined,
      tabIndex: isClickable ? 0 : undefined,
      className: `rounded-[18px] text-[#18201d] transition-colors ${variantClasses[variant] || variantClasses.default} ${paddingClasses[padding] || paddingClasses.md} ${interactiveClasses} ${className}`.trim(),
      ...props
    }, children);
  }

  function CardHeader({
    title,
    subtitle = null,
    action = null,
    icon = null,
    className = ''
  }) {
    return h('div', {
      className: `flex items-start justify-between gap-3 mb-4 ${className}`.trim()
    }, [
      h('div', { key: 'text', className: 'flex items-center gap-3 min-w-0' }, [
        icon && h('div', {
          key: 'icon',
          className: 'w-10 h-10 rounded-xl bg-[#e8f3ed] text-[#1b4332] flex items-center justify-center shrink-0'
        }, icon),
        h('div', { key: 'titles', className: 'min-w-0' }, [
          h('h3', {
            key: 'title',
            className: 'text-base sm:text-lg font-bold text-[#18201d] truncate tracking-tight font-heading'
          }, title),
          subtitle && h('p', {
            key: 'subtitle',
            className: 'text-xs sm:text-sm text-[#55645e] mt-0.5 truncate'
          }, subtitle)
        ])
      ]),
      action && h('div', { key: 'action', className: 'shrink-0' }, action)
    ]);
  }

  function CardFooter({ children, className = '' }) {
    return h('div', {
      className: `mt-4 pt-4 border-t border-[#edf2ee] flex items-center justify-end gap-2.5 ${className}`.trim()
    }, children);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.Card = Card;
  window.BreathlyUI.CardHeader = CardHeader;
  window.BreathlyUI.CardFooter = CardFooter;
})();
