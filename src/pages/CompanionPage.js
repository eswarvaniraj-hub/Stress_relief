/**
 * CompanionPage Component — Breathly Design System (Phase 6)
 * 
 * Purpose: Dedicated, warm, empathetic AI companion screen.
 * - Non-generic layout: Friendly calming introduction, 3-4 gentle suggestion chips.
 * - Conversational message stream with typing indicator.
 * - Clear Send button and 44px tap targets.
 * - Honest fallback state: If Gemini is unreachable or returns a default fallback,
 *   clearly states "I couldn't connect to the live AI service just now" rather than pretending.
 * - Never shows raw errors or technical stack traces.
 */

(function () {
  const { createElement: h, useState, useRef, useEffect } = React;

  const SUGGESTED_PROMPTS = [
    'I’m feeling overwhelmed with upcoming deadlines.',
    'I skipped my routine today and feel disappointed.',
    'My brain feels scattered. Help me refocus for 20 minutes.',
    'Guide me through a quick calming exercise before bed.'
  ];

  function CompanionPage({
    onBack,
    onSendMessage
  }) {
    const UI = window.BreathlyUI || {};
    const { Button, Card } = UI;

    const [messages, setMessages] = useState([
      {
        id: 'init-1',
        sender: 'companion',
        text: 'Hello. I’m your Breathly companion. You don’t have to carry everything alone right now. What’s feeling heaviest on your mind?',
        timestamp: 'Just now'
      }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [lastError, setLastError] = useState(null);

    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (textToSend) => {
      const text = (textToSend || inputText).trim();
      if (!text || isTyping) return;

      const userMsgId = 'msg-' + Date.now();
      const newMessages = [...messages, {
        id: userMsgId,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }];

      setMessages(newMessages);
      setInputText('');
      setLastError(null);
      setIsTyping(true);

      try {
        let replyText = null;
        let isFallback = false;

        if (onSendMessage) {
          const res = await onSendMessage(text);
          if (res && res.reply) {
            replyText = res.reply;
            if (res.isOffline || res.model === 'offline_fallback') isFallback = true;
          }
        } else if (window.api?.chatWithGemini) {
          const res = await window.api.chatWithGemini(text);
          if (res && res.reply) {
            replyText = res.reply;
            if (res.isOffline) isFallback = true;
          }
        }

        if (!replyText) {
          replyText = 'Take a slow, deep breath with me. Even when demands feel immense, prioritizing one gentle task at a time protects your peace.';
          isFallback = true;
        }

        setMessages(prev => [...prev, {
          id: 'reply-' + Date.now(),
          sender: 'companion',
          text: replyText,
          isFallback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } catch (err) {
        console.warn('Companion chat notice:', err);
        setLastError('I had trouble connecting just now. Would you like to try again?');
      } finally {
        setIsTyping(false);
      }
    };

    return h('div', {
      className: 'max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-fade-in'
    }, [
      // Header Card
      h('div', {
        key: 'top-bar',
        className: 'flex items-center justify-between pb-2 border-b border-[#e2e8e4]'
      }, [
        h('div', { className: 'flex items-center gap-3' }, [
          h('div', { className: 'w-10 h-10 rounded-2xl bg-[#e8f3ed] text-[#1b4332] text-xl flex items-center justify-center' }, '✨'),
          h('div', null, [
            h('h1', { className: 'text-base sm:text-lg font-bold font-heading text-[#18201d]' }, 'Breathly Companion'),
            h('p', { className: 'text-xs text-[#55645e]' }, 'Gentle, private stress-relief guidance')
          ])
        ]),
        onBack && h('button', {
          type: 'button',
          onClick: onBack,
          className: 'min-h-[44px] px-3.5 py-1.5 rounded-xl border border-[#e2e8e4] bg-white text-xs font-semibold text-[#55645e] hover:text-[#18201d]'
        }, '← Back')
      ]),

      // Chat Message Stream
      h('div', {
        key: 'stream',
        className: 'flex-1 overflow-y-auto pr-1 space-y-3'
      }, [
        messages.map(msg => {
          const isUser = msg.sender === 'user';
          return h('div', {
            key: msg.id,
            className: `flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`
          }, [
            h('div', {
              className: `max-w-[85%] sm:max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                isUser
                  ? 'bg-[#1b4332] text-white rounded-br-xs shadow-xs'
                  : 'bg-white border border-[#e2e8e4] text-[#18201d] rounded-bl-xs shadow-xs'
              }`
            }, [
              msg.isFallback && h('div', {
                className: 'mb-2 pb-1.5 border-b border-[#edf2ee] text-[10px] text-[#b8772a] font-semibold flex items-center gap-1'
              }, [
                h('span', null, 'ℹ️ Note: Live AI service offline. Showing grounding response.')
              ]),
              h('p', { className: 'whitespace-pre-line' }, msg.text)
            ]),
            h('span', { className: 'text-[10px] text-[#82928b] px-1' }, msg.timestamp)
          ]);
        }),

        // Typing indicator
        isTyping && h('div', { key: 'typing', className: 'flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-[#e2e8e4] w-20' }, [
          h('div', { className: 'w-2 h-2 rounded-full bg-[#2d6a4f] animate-bounce', style: { animationDelay: '0ms' } }),
          h('div', { className: 'w-2 h-2 rounded-full bg-[#2d6a4f] animate-bounce', style: { animationDelay: '150ms' } }),
          h('div', { className: 'w-2 h-2 rounded-full bg-[#2d6a4f] animate-bounce', style: { animationDelay: '300ms' } })
        ]),

        // Error Retry Notice
        lastError && h('div', {
          key: 'chat-err',
          className: 'p-3 rounded-xl bg-[#fdf1ee] border border-[#f6d1c7] text-xs text-[#8a3922] flex items-center justify-between'
        }, [
          h('span', null, lastError),
          h('button', {
            type: 'button',
            onClick: () => handleSend(messages[messages.length - 1]?.text),
            className: 'font-bold underline ml-2'
          }, 'Retry')
        ]),

        h('div', { ref: chatEndRef, key: 'anchor' })
      ]),

      // Suggested Prompt Chips (when few messages)
      messages.length <= 3 && h('div', { key: 'suggestions', className: 'space-y-1.5' }, [
        h('span', { className: 'text-[11px] font-semibold text-[#82928b] uppercase tracking-wider' }, 'Suggested prompts:'),
        h('div', { className: 'flex flex-wrap gap-2' },
          SUGGESTED_PROMPTS.map((prompt, i) => h('button', {
            key: i,
            type: 'button',
            onClick: () => handleSend(prompt),
            className: 'min-h-[40px] px-3 py-1.5 rounded-full bg-white hover:bg-[#f0f4f1] border border-[#e2e8e4] text-xs text-[#55645e] hover:text-[#18201d] transition-all text-left shadow-2xs'
          }, prompt))
        )
      ]),

      // Input Form Bar
      h('form', {
        key: 'input-bar',
        onSubmit: (e) => { e.preventDefault(); handleSend(); },
        className: 'flex items-center gap-2 pt-2'
      }, [
        h('input', {
          type: 'text',
          value: inputText,
          onChange: e => setInputText(e.target.value),
          placeholder: 'Share what’s happening...',
          disabled: isTyping,
          className: 'flex-1 min-h-[48px] px-4 py-3 text-sm text-[#18201d] bg-white rounded-2xl border border-[#e2e8e4] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 placeholder-[#82928b]'
        }),
        h('button', {
          type: 'submit',
          disabled: !inputText.trim() || isTyping,
          className: `min-h-[48px] min-w-[48px] px-4 rounded-2xl bg-[#1b4332] text-white flex items-center justify-center font-bold text-sm transition-all ${
            !inputText.trim() || isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#143326] active:scale-[0.98]'
          }`
        }, [
          h('svg', { className: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
            h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' }))
        ])
      ])
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.CompanionPage = CompanionPage;
})();
