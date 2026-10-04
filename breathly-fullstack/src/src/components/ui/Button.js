/**
 * Button Component — Breathly Design System
 * 
 * Purpose: Standard interactive button supporting primary, secondary, and ghost variants.
 * Guarantees minimum 44px tap target, accessible focus rings, loading indicator, and disabled states.
 * 
 * Usage:
 * <Button 
 *   variant="primary"   // 'primary' | 'secondary' | 'ghost' | 'danger'
 *   size="md"          // 'sm' | 'md' | 'lg'
 *   isLoading={false}  // shows calm loading spinner & disables button
 *   disabled={false}
 *   icon={<Icon />}    // optional icon element
 *   onClick={handleClick}
 * >
 *   Label
 * </Button>
 */

(function () {
  const { createElement: h } = React;

  function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    icon = null,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    type = 'button',
    onClick,
    ariaLabel,
    ...props
  }) {
    // Base styles: 44px min tap target, font-semibold, inline-flex, center aligned
    const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none';

    // Variant classes
    const variantClasses = {
      primary: 'bg-[#1b4332] text-white hover:bg-[#143326] active:scale-[0.98] focus-visible:ring-[#1b4332] shadow-sm',
      secondary: 'bg-[#e8f3ed] text-[#1b4332] hover:bg-[#d8ebd1] active:scale-[0.98] focus-visible:ring-[#2d6a4f] border border-[#cfe1d7]',
      ghost: 'bg-transparent text-[#55645e] hover:text-[#18201d] hover:bg-[#f0f4f1] active:scale-[0.98] focus-visible:ring-[#55645e]',
      danger: 'bg-[#fdf1ee] text-[#c25e40] hover:bg-[#fbdcd5] active:scale-[0.98] focus-visible:ring-[#c25e40] border border-[#f6d1c7]'
    };

    // Size classes (ensuring minimum 44px touch height)
    const sizeClasses = {
      sm: 'min-h-[44px] px-3.5 py-2 text-xs gap-1.5',
      md: 'min-h-[44px] px-5 py-2.5 text-sm gap-2',
      lg: 'min-h-[48px] px-6 py-3 text-base gap-2.5 rounded-2xl'
    };

    const disabledClasses = (disabled || isLoading) 
      ? 'opacity-50 cursor-not-allowed pointer-events-none' 
      : 'cursor-pointer';

    const widthClass = fullWidth ? 'w-full' : '';

    return h('button', {
      type,
      disabled: disabled || isLoading,
      onClick,
      'aria-label': ariaLabel,
      'aria-busy': isLoading,
      className: `${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${disabledClasses} ${widthClass} ${className}`.trim(),
      ...props
    }, [
      // Loading Spinner
      isLoading && h('svg', {
        key: 'spinner',
        className: 'animate-spin -ml-1 mr-2 h-4 w-4 text-current',
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24'
      }, [
        h('circle', {
          key: 'c',
          className: 'opacity-25',
          cx: '12',
          cy: '12',
          r: '10',
          stroke: 'currentColor',
          strokeWidth: '4'
        }),
        h('path', {
          key: 'p',
          className: 'opacity-75',
          fill: 'currentColor',
          d: 'M4 12a8 8 0 018-8v8H4z'
        })
      ]),

      // Left icon
      !isLoading && icon && iconPosition === 'left' && h('span', { key: 'left-icon', className: 'inline-flex items-center shrink-0' }, icon),

      // Children text
      h('span', { key: 'content', className: 'truncate' }, children),

      // Right icon
      !isLoading && icon && iconPosition === 'right' && h('span', { key: 'right-icon', className: 'inline-flex items-center shrink-0' }, icon)
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.Button = Button;
})();
