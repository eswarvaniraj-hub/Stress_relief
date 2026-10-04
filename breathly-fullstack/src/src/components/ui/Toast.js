/**
 * Toast Notifications Component & Service — Breathly Design System
 * 
 * Purpose: Non-intrusive floating notifications for action confirmations,
 * network errors, and friendly guidance.
 * 
 * Usage:
 * // Trigger globally from anywhere:
 * window.BreathlyUI.toast.success("Check-in saved!");
 * window.BreathlyUI.toast.error("Could not reach the server. Please try again.");
 * window.BreathlyUI.toast.warning("2 grace days left this week.");
 * window.BreathlyUI.toast.info("Session completed.");
 * 
 * // Mount container once in App shell:
 * <ToastContainer />
 */

(function () {
  const { createElement: h, useState, useEffect } = React;

  // Global event listener bus for toasts
  const TOAST_EVENT = 'breathly-toast-event';

  const toastService = {
    show: (message, type = 'info', duration = 4000) => {
      const event = new CustomEvent(TOAST_EVENT, {
        detail: { id: Date.now() + Math.random(), message, type, duration }
      });
      window.dispatchEvent(event);
    },
    success: (msg, duration) => toastService.show(msg, 'success', duration),
    error: (msg, duration) => toastService.show(msg, 'error', duration || 5000),
    warning: (msg, duration) => toastService.show(msg, 'warning', duration),
    info: (msg, duration) => toastService.show(msg, 'info', duration)
  };

  function ToastItem({ toast, onDismiss }) {
    useEffect(() => {
      if (!toast.duration) return;
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onDismiss]);

    const styles = {
      success: {
        bg: 'bg-[#eef7f2] border-[#c5dcce] text-[#1b4332]',
        icon: h('svg', { className: 'w-4 h-4 text-[#2d6a4f] shrink-0', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
          h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M5 13l4 4L19 7' }))
      },
      error: {
        bg: 'bg-[#fdf1ee] border-[#f6d1c7] text-[#8a3922]',
        icon: h('svg', { className: 'w-4 h-4 text-[#c25e40] shrink-0', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
          h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }))
      },
      warning: {
        bg: 'bg-[#fef7ee] border-[#f4ddbe] text-[#7c4f16]',
        icon: h('svg', { className: 'w-4 h-4 text-[#b8772a] shrink-0', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
          h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }))
      },
      info: {
        bg: 'bg-white border-[#e2e8e4] text-[#18201d]',
        icon: h('svg', { className: 'w-4 h-4 text-[#2a6b74] shrink-0', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
          h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }))
      }
    };

    const currentStyle = styles[toast.type] || styles.info;

    return h('div', {
      role: toast.type === 'error' ? 'alert' : 'status',
      className: `flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border shadow-[0_4px_16px_rgba(24,32,29,0.08)] text-xs sm:text-sm font-medium animate-slide-up pointer-events-auto min-w-[280px] max-w-sm ${currentStyle.bg}`
    }, [
      currentStyle.icon,
      h('div', { key: 'msg', className: 'flex-1 leading-snug' }, toast.message),
      h('button', {
        key: 'close',
        type: 'button',
        onClick: () => onDismiss(toast.id),
        'aria-label': 'Dismiss notification',
        className: 'p-1 -mr-1 rounded-lg hover:bg-black/5 text-current opacity-70 hover:opacity-100 transition-opacity'
      }, [
        h('svg', { className: 'w-3.5 h-3.5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
          h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M6 18L18 6M6 6l12 12' }))
      ])
    ]);
  }

  function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
      const handleToast = (e) => {
        if (e.detail) {
          setToasts((prev) => [...prev.slice(-4), e.detail]); // keep max 5 toasts
        }
      };
      window.addEventListener(TOAST_EVENT, handleToast);
      return () => window.removeEventListener(TOAST_EVENT, handleToast);
    }, []);

    const dismissToast = (id) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return h('div', {
      'aria-live': 'polite',
      className: 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2.5 pointer-events-none'
    }, toasts.map((t) => h(ToastItem, { key: t.id, toast: t, onDismiss: dismissToast })));
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.toast = toastService;
  window.BreathlyUI.ToastContainer = ToastContainer;
})();
