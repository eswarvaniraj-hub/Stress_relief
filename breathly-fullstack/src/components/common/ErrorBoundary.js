/**
 * ErrorBoundary Component — Breathly Design System
 * 
 * Purpose: Catches any unhandled JavaScript runtime error in child components,
 * prevents the dreaded blank-screen failure, and displays a calm, reassuring
 * fallback UI with a "Reload Breathly" or "Return Home" action.
 * 
 * Usage:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */

(function () {
  const { createElement: h, Component } = React;

  class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Breathly ErrorBoundary caught an unhandled error:', error, errorInfo);
    }

    handleReload = () => {
      this.setState({ hasError: false, error: null });
      if (typeof window !== 'undefined') {
        window.location.hash = '#home';
        window.location.reload();
      }
    };

    handleResetHome = () => {
      this.setState({ hasError: false, error: null });
      if (window.BreathlyRouter) {
        window.BreathlyRouter.navigate('home');
      }
    };

    render() {
      if (this.state.hasError) {
        return h('div', {
          className: 'min-h-screen bg-[#f8faf8] text-[#18201d] flex items-center justify-center p-4 sm:p-6'
        }, [
          h('div', {
            className: 'w-full max-w-md p-8 sm:p-10 rounded-[24px] bg-white border border-[#e2e8e4] shadow-[0_4px_24px_rgba(24,32,29,0.06)] text-center space-y-5 animate-fade-in'
          }, [
            // Icon
            h('div', {
              className: 'w-16 h-16 rounded-2xl bg-[#fdf1ee] text-[#c25e40] flex items-center justify-center mx-auto border border-[#f6d1c7]'
            }, [
              h('svg', { className: 'w-8 h-8', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
                h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }))
            ]),

            // Text
            h('div', { className: 'space-y-2' }, [
              h('h1', { className: 'text-xl font-bold font-heading text-[#18201d]' }, 'Breathly encountered a hiccup'),
              h('p', { className: 'text-xs sm:text-sm text-[#55645e] leading-relaxed' },
                'Don’t worry — your offline records and check-ins are safe. Take a slow breath while we reset your session.'
              )
            ]),

            // Buttons
            h('div', { className: 'pt-2 flex flex-col sm:flex-row items-center justify-center gap-3' }, [
              h('button', {
                type: 'button',
                onClick: this.handleResetHome,
                className: 'w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl border border-[#cfe1d7] bg-[#e8f3ed] text-[#1b4332] text-sm font-semibold hover:bg-[#d8ebd1] transition-all'
              }, 'Return to Home'),
              h('button', {
                type: 'button',
                onClick: this.handleReload,
                className: 'w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1b4332] text-white text-sm font-semibold hover:bg-[#143326] shadow-sm transition-all'
              }, 'Reload App')
            ])
          ])
        ]);
      }

      return this.props.children;
    }
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.ErrorBoundary = ErrorBoundary;
})();
