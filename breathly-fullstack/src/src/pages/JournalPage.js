/**
 * JournalPage Component — Breathly Design System (Phase 6)
 * 
 * Purpose: Private, calm reflection space.
 * Features:
 * - New reflection composer with mood tags.
 * - Timeline feed of previous reflection cards with dates and mood badges.
 * - Loading skeletons.
 * - EmptyState ("Your journal is still empty" + "Write your first entry").
 * - ErrorState with "Try again" retry button.
 * - Uses existing backend APIs without modification.
 */

(function () {
  const { createElement: h, useState } = React;

  const MOOD_OPTIONS = [
    { id: 'Calm', label: 'Calm', icon: '🌿' },
    { id: 'Reflective', label: 'Reflective', icon: '✨' },
    { id: 'Stressed', label: 'Stressed', icon: '🌧️' },
    { id: 'Energized', label: 'Energized', icon: '⚡' },
    { id: 'Tired', label: 'Tired', icon: '🌙' }
  ];

  function JournalPage({
    entries = [],
    isLoading = false,
    errorMessage = null,
    onRetry = null,
    onSaveEntry,
    onDeleteEntry
  }) {
    const UI = window.BreathlyUI || {};
    const { Button, Card, CardHeader, EmptyState, ErrorState, CardSkeleton, TextArea } = UI;

    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState('Calm');
    const [isSaving, setIsSaving] = useState(false);
    const [isComposerOpen, setIsComposerOpen] = useState(false);

    const handleSubmit = async (e) => {
      e?.preventDefault();
      if (!content.trim() || isSaving) return;

      setIsSaving(true);
      try {
        if (onSaveEntry) {
          await onSaveEntry(content.trim(), selectedMood);
        }
        setContent('');
        setIsComposerOpen(false);
      } catch (err) {
        console.warn('Journal save error:', err);
      } finally {
        setIsSaving(false);
      }
    };

    if (errorMessage && onRetry) {
      return h('div', { className: 'py-8' },
        h(ErrorState, {
          title: 'Could not load journal entries',
          message: errorMessage,
          onRetry: onRetry
        })
      );
    }

    return h('div', {
      className: 'space-y-6 max-w-3xl mx-auto animate-fade-in'
    }, [
      // Top Header
      h('div', { key: 'header', className: 'flex items-center justify-between pb-2 border-b border-[#e2e8e4]' }, [
        h('div', { className: 'space-y-0.5' }, [
          h('h1', { className: 'text-2xl font-bold font-heading text-[#18201d]' }, 'Private Journal'),
          h('p', { className: 'text-xs text-[#55645e]' }, 'Unclutter your mind with non-judgmental daily reflection.')
        ]),
        !isComposerOpen && h(Button, {
          variant: 'primary',
          size: 'sm',
          onClick: () => setIsComposerOpen(true)
        }, '+ New Entry')
      ]),

      // 1. REFLECTION COMPOSER
      isComposerOpen && h(Card, { key: 'composer', padding: 'md' }, [
        h('form', { onSubmit: handleSubmit, className: 'space-y-4' }, [
          h('div', { className: 'flex items-center justify-between' }, [
            h('h3', { className: 'text-sm font-bold text-[#18201d]' }, 'Write a Reflection'),
            h('button', {
              type: 'button',
              onClick: () => setIsComposerOpen(false),
              className: 'text-xs text-[#82928b] hover:text-[#18201d]'
            }, 'Cancel')
          ]),

          // Mood Tag Picker
          h('div', { className: 'space-y-1.5' }, [
            h('label', { className: 'text-xs font-semibold text-[#55645e]' }, 'How are you feeling right now?'),
            h('div', { className: 'flex flex-wrap gap-2' },
              MOOD_OPTIONS.map(m => {
                const isSelected = selectedMood === m.id;
                return h('button', {
                  key: m.id,
                  type: 'button',
                  onClick: () => setSelectedMood(m.id),
                  className: `min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border-[#1b4332] bg-[#e8f3ed] text-[#1b4332] shadow-2xs'
                      : 'border-[#e2e8e4] bg-white text-[#55645e] hover:border-[#cfe1d7]'
                  }`
                }, [
                  h('span', null, m.icon),
                  h('span', null, m.label)
                ]);
              })
            )
          ]),

          // Text Area
          h('div', { className: 'space-y-1' }, [
            h('textarea', {
              rows: 4,
              value: content,
              onChange: e => setContent(e.target.value),
              placeholder: 'What’s on your mind? What felt heavy or light today?',
              className: 'w-full p-3.5 text-sm text-[#18201d] rounded-xl border border-[#e2e8e4] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 placeholder-[#82928b] resize-y min-h-[100px]'
            })
          ]),

          // Submit Action
          h('div', { className: 'flex items-center justify-end gap-2.5 pt-2' }, [
            h(Button, {
              variant: 'ghost',
              size: 'sm',
              onClick: () => setIsComposerOpen(false)
            }, 'Discard'),
            h(Button, {
              variant: 'primary',
              size: 'sm',
              isLoading: isSaving,
              disabled: !content.trim(),
              type: 'submit'
            }, 'Save Entry')
          ])
        ])
      ]),

      // 2. TIMELINE FEED
      h('div', { key: 'feed', className: 'space-y-3' }, [
        isLoading && h('div', { className: 'space-y-3' }, [
          h(CardSkeleton, { key: 'sk1' }),
          h(CardSkeleton, { key: 'sk2' })
        ]),

        !isLoading && entries.length === 0 && !isComposerOpen && h(EmptyState, {
          icon: '📖',
          title: 'Your journal is still empty',
          description: 'Writing even a single sentence helps release mental loops and ease stress.',
          actionLabel: 'Write your first entry',
          onAction: () => setIsComposerOpen(true)
        }),

        !isLoading && entries.map(entry => {
          const dateStr = entry.created_at ? new Date(entry.created_at).toLocaleDateString(undefined, {
            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          }) : 'Recently';

          return h(Card, { key: entry.id, padding: 'md' }, [
            h('div', { className: 'flex items-start justify-between gap-3 mb-2.5' }, [
              h('div', { className: 'flex items-center gap-2' }, [
                h('span', { className: 'px-2.5 py-0.5 rounded-full bg-[#e8f3ed] text-[#1b4332] text-xs font-bold' },
                  entry.mood || 'Reflection'
                ),
                h('span', { className: 'text-xs text-[#82928b]' }, dateStr)
              ]),
              onDeleteEntry && h('button', {
                type: 'button',
                onClick: () => onDeleteEntry(entry.id),
                title: 'Delete entry',
                className: 'text-xs text-[#82928b] hover:text-[#c25e40] p-1'
              }, '✕')
            ]),
            h('p', { className: 'text-sm text-[#18201d] leading-relaxed whitespace-pre-line' }, entry.content)
          ]);
        })
      ])
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.JournalPage = JournalPage;
})();
