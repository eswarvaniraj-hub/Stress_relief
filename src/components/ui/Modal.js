/**
 * Modal Component — Breathly Design System
 * 
 * Purpose: Centered accessible modal dialogue with dark backdrop, ESC key listener,
 * smooth fade animation, and clean typography.
 * 
 * Usage:
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Edit Habit"
 *   size="md"
 *   footer={<Button onClick={handleSave}>Save</Button>}
 * >
 *   <p>Modal body content</p>
 * </Modal>
 */

(function () {
  const { createElement: h, useEffect } = React;

  function Modal({
    isOpen = false,
    onClose,
    title,
    subtitle = null,
    children,
    footer = null,
    size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
    closeOnBackdrop = true,
    showCloseButton = true,
    className = ''
  }) {
    // ESC key listener
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

    // Prevent body background scroll while open
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

    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl'
    };

    return h('div', {
      className: 'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'modal-title'
    }, [
      // Dark Backdrop
      h('div', {
        key: 'backdrop',
        className: 'fixed inset-0 bg-[#18201d]/45 backdrop-blur-[2px] transition-opacity duration-200',
        onClick: closeOnBackdrop ? onClose : undefined
      }),

      // Dialog Container
      h('div', {
        key: 'dialog',
        className: `relative w-full ${sizeClasses[size] || sizeClasses.md} bg-white rounded-[22px] shadow-[0_20px_48px_-12px_rgba(24,32,29,0.18)] border border-[#e2e8e4] overflow-hidden z-10 my-auto transform transition-all duration-200 ${className}`.trim()
      }, [
        // Header
        (title || showCloseButton) && h('div', {
          key: 'header',
          className: 'flex items-start justify-between p-5 sm:p-6 border-b border-[#edf2ee]'
        }, [
          h('div', { key: 'titles', className: 'min-w-0 pr-4' }, [
            title && h('h2', {
              id: 'modal-title',
              className: 'text-lg sm:text-xl font-bold text-[#18201d] font-heading truncate'
            }, title),
            subtitle && h('p', {
              className: 'text-xs sm:text-sm text-[#55645e] mt-0.5'
            }, subtitle)
          ]),
          showCloseButton && h('button', {
            key: 'close',
            type: 'button',
            onClick: onClose,
            'aria-label': 'Close dialog',
            className: 'w-9 h-9 rounded-full flex items-center justify-center text-[#55645e] hover:text-[#18201d] hover:bg-[#f0f4f1] transition-colors shrink-0'
          }, [
            h('svg', {
              key: 'x',
              className: 'w-5 h-5',
              fill: 'none',
              viewBox: '0 0 24 24',
              stroke: 'currentColor',
              strokeWidth: 2
            }, h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M6 18L18 6M6 6l12 12' }))
          ])
        ]),

        // Body
        h('div', {
          key: 'body',
          className: 'p-5 sm:p-6 max-h-[70vh] overflow-y-auto text-[#18201d] text-sm leading-relaxed'
        }, children),

        // Footer
        footer && h('div', {
          key: 'footer',
          className: 'px-5 py-4 sm:px-6 bg-[#f8faf8] border-t border-[#edf2ee] flex items-center justify-end gap-2.5'
        }, footer)
      ])
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.Modal = Modal;
})();
