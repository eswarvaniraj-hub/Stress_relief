/**
 * TextArea Component — Breathly Design System
 * 
 * Purpose: Accessible multiline text input for journaling, reflection notes,
 * and feedback with label, helper text, and error states.
 * 
 * Usage:
 * <TextArea
 *   label="Daily Reflection"
 *   id="journal-note"
 *   value={notes}
 *   onChange={e => setNotes(e.target.value)}
 *   placeholder="What was on your mind today?"
 *   rows={4}
 *   helperText="Your notes remain completely private."
 * />
 */

(function () {
  const { createElement: h } = React;

  function TextArea({
    label,
    id,
    value,
    onChange,
    placeholder = '',
    rows = 4,
    helperText = null,
    error = null,
    disabled = false,
    required = false,
    className = '',
    ...props
  }) {
    const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);

    const borderClass = error
      ? 'border-[#c25e40] focus:border-[#c25e40] focus:ring-[#c25e40]/20 bg-[#fdf1ee]/30'
      : 'border-[#e2e8e4] focus:border-[#2d6a4f] focus:ring-[#2d6a4f]/20 bg-white hover:border-[#cfe1d7]';

    const disabledClass = disabled
      ? 'opacity-60 bg-[#f8faf8] cursor-not-allowed'
      : '';

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

      // Native Textarea
      h('textarea', {
        key: 'textarea',
        id: inputId,
        rows,
        value: value ?? '',
        onChange,
        placeholder,
        disabled,
        required,
        'aria-invalid': !!error,
        'aria-describedby': error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined,
        className: `w-full min-h-[96px] p-3.5 text-sm text-[#18201d] rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 placeholder-[#82928b] resize-y ${borderClass} ${disabledClass}`.trim(),
        ...props
      }),

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
  window.BreathlyUI.TextArea = TextArea;
})();
