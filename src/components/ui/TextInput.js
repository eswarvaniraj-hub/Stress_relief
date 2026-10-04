/**
 * TextInput Component — Breathly Design System
 * 
 * Purpose: Accessible single-line text input with label, optional icons,
 * helper text, friendly error message, and 44px min touch target.
 * 
 * Usage:
 * <TextInput
 *   label="Your Name"
 *   id="user-name"
 *   value={name}
 *   onChange={e => setName(e.target.value)}
 *   placeholder="e.g. Alex"
 *   helperText="This is how Breathly will greet you."
 *   error={errors.name}
 * />
 */

(function () {
  const { createElement: h } = React;

  function TextInput({
    label,
    id,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    helperText = null,
    error = null,
    disabled = false,
    required = false,
    leftIcon = null,
    rightIcon = null,
    className = '',
    ...props
  }) {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);

    const borderClass = error
      ? 'border-[#c25e40] focus:border-[#c25e40] focus:ring-[#c25e40]/20 bg-[#fdf1ee]/30'
      : 'border-[#e2e8e4] focus:border-[#2d6a4f] focus:ring-[#2d6a4f]/20 bg-white hover:border-[#cfe1d7]';

    const disabledClass = disabled
      ? 'opacity-60 bg-[#f8faf8] cursor-not-allowed'
      : '';

    const paddingLeftClass = leftIcon ? 'pl-11' : 'pl-4';
    const paddingRightClass = rightIcon ? 'pr-11' : 'pr-4';

    return h('div', { className: `w-full text-left space-y-1.5 ${className}`.trim() }, [
      // Label
      label && h('label', {
        key: 'label',
        htmlFor: inputId,
        className: 'block text-xs sm:text-sm font-semibold text-[#18201d]'
      }, [
        label,
        required && h('span', { key: 'req', className: 'text-[#c25e40] ml-1' }, '*')
      ]),

      // Input Wrapper with relative positioning for icons
      h('div', { key: 'wrapper', className: 'relative flex items-center' }, [
        // Left Icon
        leftIcon && h('div', {
          key: 'left-icon',
          className: 'absolute left-3.5 flex items-center pointer-events-none text-[#55645e]'
        }, leftIcon),

        // Native Input
        h('input', {
          key: 'input',
          id: inputId,
          type,
          value: value ?? '',
          onChange,
          placeholder,
          disabled,
          required,
          'aria-invalid': !!error,
          'aria-describedby': error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined,
          className: `w-full min-h-[44px] ${paddingLeftClass} ${paddingRightClass} py-2.5 text-sm text-[#18201d] rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 placeholder-[#82928b] ${borderClass} ${disabledClass}`.trim(),
          ...props
        }),

        // Right Icon
        rightIcon && h('div', {
          key: 'right-icon',
          className: 'absolute right-3.5 flex items-center text-[#55645e]'
        }, rightIcon)
      ]),

      // Error Message
      error && h('p', {
        key: 'error',
        id: `${inputId}-error`,
        className: 'text-xs text-[#c25e40] flex items-center gap-1 font-medium animate-fade-in'
      }, [
        h('svg', {
          key: 'alert-icon',
          className: 'w-3.5 h-3.5 shrink-0',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor'
        }, h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })),
        error
      ]),

      // Helper Text (when no error)
      !error && helperText && h('p', {
        key: 'helper',
        id: `${inputId}-helper`,
        className: 'text-xs text-[#55645e]'
      }, helperText)
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.TextInput = TextInput;
})();
