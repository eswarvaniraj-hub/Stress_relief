/**
 * InterventionSheet Component — Breathly Design System (Phase 5)
 * 
 * Purpose: Polished bottom sheet intervention flow.
 * Shows:
 * 1. Why it was suggested.
 * 2. What to do step-by-step.
 * 3. Estimated duration.
 * 4. Start button.
 * 5. Post-completion "How do you feel now?" feedback (Better / Same / Worse).
 * 6. Saves feedback with existing API (POST /api/interventions/complete).
 */

(function () {
  const { createElement: h, useState } = React;

  function InterventionSheet({
    isOpen = false,
    onClose,
    intervention = null,
    onStartActivity,
    onSaveFeedback
  }) {
    const UI = window.BreathlyUI || {};
    const { BottomSheet, Button } = UI;

    const [isFeedbackMode, setIsFeedbackMode] = useState(false);
    const [selectedFeeling, setSelectedFeeling] = useState('better'); // 'better' | 'same' | 'worse'
    const [feedbackNotes, setFeedbackNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!intervention) return null;

    const handleStart = () => {
      if (intervention.type === 'breathing') {
        if (onStartActivity) onStartActivity(intervention);
        onClose();
      } else {
        // For non-breathing activities (e.g. walk, connection, screen-free break), show feedback directly after completion
        setIsFeedbackMode(true);
      }
    };

    const handleSave = async () => {
      setIsSaving(true);
      try {
        if (onSaveFeedback) {
          await onSaveFeedback({
            interventionId: intervention.id,
            title: intervention.title,
            feeling: selectedFeeling,
            notes: feedbackNotes
          });
        }
        setIsFeedbackMode(false);
        onClose();
      } catch (err) {
        console.warn('Feedback save note:', err);
      } finally {
        setIsSaving(false);
      }
    };

    const title = isFeedbackMode ? 'How do you feel now?' : (intervention.title || 'Recommended Reset');
    const subtitle = isFeedbackMode
      ? 'Your honest feedback helps calibrate future recommendations.'
      : `Estimated time: ~${intervention.durationMinutes || 3} mins`;

    return h(BottomSheet, {
      isOpen,
      onClose: () => {
        setIsFeedbackMode(false);
        onClose();
      },
      title,
      subtitle
    }, [
      // 1. INTRO / EXPLANATION VIEW
      !isFeedbackMode && h('div', { key: 'intro', className: 'space-y-5' }, [
        // Why suggested
        h('div', { className: 'p-3.5 rounded-xl bg-[#f0f6f3] border border-[#cfe1d7] text-xs text-[#1b4332]' }, [
          h('div', { className: 'font-bold mb-0.5' }, 'Why this was suggested:'),
          h('div', null, intervention.reason || 'Designed to shift autonomic arousal and relieve mental friction.')
        ]),

        // What to do
        h('div', { className: 'space-y-2' }, [
          h('h4', { className: 'text-xs font-bold text-[#18201d] uppercase tracking-wider' }, 'What to do:'),
          h('div', { className: 'space-y-2 text-xs text-[#55645e]' }, [
            intervention.type === 'connection'
              ? h('div', { className: 'p-3 rounded-xl bg-[#fef7ee] border border-[#f4ddbe] text-[#7c4f16] font-medium' },
                  '“You don’t have to handle everything alone.” Reach out with a short text or share a quick thought with someone you trust.'
                )
              : h('p', null, intervention.steps || 'Step away from your workspace. Let your shoulders soften, unclench your jaw, and give your full attention to this gentle reset.'),
            h('p', null, 'There is no goal to achieve. Any few moments you give to yourself count as a complete reset.')
          ])
        ]),

        // Start Action
        h('div', { className: 'pt-3 flex justify-end gap-2.5' }, [
          Button ? h(Button, {
            variant: 'ghost',
            size: 'md',
            onClick: onClose
          }, 'Cancel') : h('button', { onClick: onClose }, 'Cancel'),

          Button ? h(Button, {
            variant: 'primary',
            size: 'md',
            onClick: handleStart
          }, intervention.type === 'breathing' ? 'Open Breathing Player →' : 'I Did This →') : h('button', { onClick: handleStart }, 'Start')
        ])
      ]),

      // 2. POST-COMPLETION FEEDBACK VIEW (Better / Same / Worse)
      isFeedbackMode && h('div', { key: 'feedback', className: 'space-y-5 py-2' }, [
        h('div', { className: 'grid grid-cols-3 gap-3' }, [
          { id: 'better', label: 'Better', emoji: '🌿', desc: 'Feeling lighter' },
          { id: 'same', label: 'Same', emoji: '⚖️', desc: 'No big change' },
          { id: 'worse', label: 'Worse', emoji: '🌧️', desc: 'Still tense' }
        ].map(item => {
          const selected = selectedFeeling === item.id;
          return h('button', {
            key: item.id,
            type: 'button',
            onClick: () => setSelectedFeeling(item.id),
            className: `p-3.5 rounded-xl border text-center transition-all ${
              selected
                ? 'border-[#1b4332] bg-[#e8f3ed] ring-2 ring-[#1b4332]'
                : 'border-[#e2e8e4] bg-white hover:border-[#cfe1d7]'
            }`
          }, [
            h('div', { className: 'text-2xl mb-1' }, item.emoji),
            h('div', { className: 'text-xs font-bold text-[#18201d]' }, item.label),
            h('div', { className: 'text-[10px] text-[#82928b]' }, item.desc)
          ]);
        })),

        // Optional short note
        h('div', { className: 'space-y-1' }, [
          h('label', { className: 'text-xs font-semibold text-[#55645e]' }, 'Optional reflection:'),
          h('input', {
            type: 'text',
            value: feedbackNotes,
            onChange: e => setFeedbackNotes(e.target.value),
            placeholder: 'e.g. helped clear head, nice quick break',
            className: 'w-full min-h-[44px] px-3.5 py-2 text-xs rounded-xl border border-[#e2e8e4] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20'
          })
        ]),

        // Save Button
        h('div', { className: 'pt-2 flex justify-end gap-2' }, [
          Button ? h(Button, {
            variant: 'primary',
            size: 'md',
            isLoading: isSaving,
            onClick: handleSave
          }, 'Save Feedback') : h('button', { onClick: handleSave }, 'Save Feedback')
        ])
      ])
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.InterventionSheet = InterventionSheet;
})();
