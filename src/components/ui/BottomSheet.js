/**
 * BottomSheet Component — Breathly Design System
 * 
 * Purpose: Mobile-first sliding bottom sheet drawer for interventions,
 * quick reflections, and secondary actions. Slides up smoothly with a drag handle.
 * 
 * Usage:
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Suggested Reset"
 *   footer={<Button onClick={handleStart}>Start Reset</Button>}
 * >
 *   <p>Intervention content</p>
 * </BottomSheet>
 */

(function () {
  const { createElement: h, useEffect } = React;

  function BottomSheet({
    isOpen = false,
    onClose,
    title = null,
    subtitle = null,
    children,
    footer = null,
    showDragHandle = true,
    className = ''
  }) {
    useEffect(() => {
      if (!isOpen) return;
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && onClose) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return h('div', {
      className: 'fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4',
      role: 'dialog',
      'aria-modal': 'true'
    }, [
      // Dark Backdrop
      h('div', {
        key: 'backdrop',
        className: 'fixed inset-0 bg-[#18201d]/45 backdrop-blur-[2px] transition-opacity duration-200 animate-fade-in',
        onClick: onClose
      }),

      // Sheet Container (slides up on mobile, centered card on desktop)
      h('div', {
        key: 'sheet',
        className: `relative w-full sm:max-w-lg bg-white rounded-t-[24px] sm:rounded-[24px] shadow-[0_-8px_32px_rgba(24,32,29,0.12)] sm:shadow-[0_20px_48px_-12px_rgba(24,32,29,0.18)] border border-[#e2e8e4] z-10 max-h-[85vh] flex flex-col overflow-hidden animate-slide-up ${className}`.trim()
      }, [
        // Drag Handle Pill (Mobile affordance)
        showDragHandle && h('div', {
          key: 'handle',
          className: 'pt-3 pb-1 flex justify-center shrink-0 cursor-grab active:cursor-grabbing sm:hidden'
        }, h('div', { className: 'w-12 h-1.5 rounded-full bg-[#d5ddd8]' })),

        // Header
        title && h('div', {
          key: 'header',
          className: 'px-5 sm:px-6 pt-3 pb-4 border-b border-[#edf2ee] flex items-center justify-between shrink-0'
        }, [
          h('div', { key: 'titles', className: 'min-w-0 pr-3' }, [
            h('h3', { className: 'text-lg font-bold text-[#18201d] font-heading truncate' }, title),
            subtitle && h('p', { className: 'text-xs text-[#55645e] mt-0.5' }, subtitle)
          ]),
          h('button', {
            key: 'close-btn',
            type: 'button',
            onClick: onClose,
            'aria-label': 'Close sheet',
            className: 'w-8 h-8 rounded-full flex items-center justify-center text-[#55645e] hover:text-[#18201d] hover:bg-[#f0f4f1] transition-colors shrink-0'
          }, [
            h('svg', {
              key: 'x',
              className: 'w-4 h-4',
              fill: 'none',
              viewBox: '0 0 24 24',
              stroke: 'currentColor',
              strokeWidth: 2
            }, h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M6 18L18 6M6 6l12 12' }))
          ])
        ]),

        // Scrollable Body
        h('div', {
          key: 'body',
          className: 'p-5 sm:p-6 overflow-y-auto text-[#18201d] text-sm leading-relaxed flex-1'
        }, children),

        // Footer Action Bar
        footer && h('div', {
          key: 'footer',
          className: 'px-5 py-4 sm:px-6 bg-[#f8faf8] border-t border-[#edf2ee] flex items-center justify-end gap-2.5 shrink-0'
        }, footer)
      ])
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.BottomSheet = BottomSheet;
})();
