/**
 * EmptyState Component — Breathly Design System
 * 
 * Purpose: Positive, reassuring empty state for when a user has no habits,
 * no reflections, or no recorded distractions yet. Avoids clinical "No Data" messages.
 * 
 * Usage:
 * <EmptyState
 *   icon="🌱"
 *   title="Your habit garden is ready"
 *   description="Add your first daily habit to start building gentle consistency."
 *   actionLabel="Add Habit"
 *   onAction={handleAddHabit}
 * />
 */

(function () {
  const { createElement: h } = React;

  function EmptyState({
    icon = '🌱',
    title = 'No entries yet',
    description = 'Take your time. Whenever you are ready, you can start here.',
    actionLabel = null,
    onAction = null,
    actionIcon = null,
    className = ''
  }) {
    const Button = window.BreathlyUI?.Button;

    return h('div', {
      className: `p-8 sm:p-12 text-center rounded-[22px] bg-white border border-[#e2e8e4] shadow-[0_2px_8px_rgba(24,32,29,0.02)] flex flex-col items-center justify-center max-w-md mx-auto my-4 animate-fade-in ${className}`.trim()
    }, [
      // Calm Icon / Illustration Bubble
      h('div', {
        key: 'icon-bubble',
        className: 'w-16 h-16 rounded-2xl bg-[#e8f3ed] text-[#1b4332] text-2xl flex items-center justify-center mb-4 shadow-sm'
      }, typeof icon === 'string' ? icon : icon),

      // Title
      h('h3', {
        key: 'title',
        className: 'text-base sm:text-lg font-bold text-[#18201d] font-heading tracking-tight'
      }, title),

      // Description
      h('p', {
        key: 'desc',
        className: 'text-xs sm:text-sm text-[#55645e] mt-1.5 max-w-xs leading-relaxed'
      }, description),

      // Action Button
      actionLabel && onAction && h('div', { key: 'action', className: 'mt-6' },
        Button ? h(Button, {
          variant: 'primary',
          size: 'md',
          icon: actionIcon,
          onClick: onAction
        }, actionLabel) : h('button', {
          onClick: onAction,
          className: 'px-5 py-2.5 bg-[#1b4332] text-white rounded-xl text-sm font-semibold'
        }, actionLabel)
      )
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.EmptyState = EmptyState;
})();
