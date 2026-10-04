/**
 * BubbleRhythmPage Component — Breathly Design System (Phase 6)
 * 
 * Purpose: Immersive mindful mini-game.
 * - Intro screen: short calm explanation, duration, sound toggle, Start.
 * - During play: immersive game area, score, rhythm feedback, Pause, Exit. No dashboard UI.
 * - After: result summary, "How do you feel?" (Better / Same / Worse), saved with existing API.
 */

(function () {
  const { createElement: h, useState, useEffect, useRef } = React;

  function BubbleRhythmPage({
    onComplete,
    onExit
  }) {
    const UI = window.BreathlyUI || {};
    const { Button } = UI;

    // Game Screens: 'intro' | 'playing' | 'completed'
    const [gameState, setGameState] = useState('intro');
    const [durationMinutes, setDurationMinutes] = useState(2);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Active Play State
    const [score, setScore] = useState(0);
    const [rhythmNote, setRhythmNote] = useState('Steady pace');
    const [isPaused, setIsPaused] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(120);

    // Completion / Feedback State
    const [feedback, setSelectedFeedback] = useState('better'); // 'better' | 'same' | 'worse'
    const [isSaving, setIsSaving] = useState(false);

    const canvasRef = useRef(null);
    const bubblesRef = useRef([]);
    const animFrameRef = useRef(null);

    // Audio Chime Synthesizer
    const playPopSound = () => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440 + Math.random() * 220, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } catch (e) {}
    };

    // Start Game
    const handleStart = () => {
      setSecondsRemaining(durationMinutes * 60);
      setScore(0);
      setGameState('playing');
    };

    // Timer Loop
    useEffect(() => {
      if (gameState !== 'playing' || isPaused) return;

      const timer = setInterval(() => {
        setSecondsRemaining(sec => {
          if (sec <= 1) {
            clearInterval(timer);
            setGameState('completed');
            return 0;
          }
          return sec - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [gameState, isPaused]);

    // Canvas Animation Loop
    useEffect(() => {
      if (gameState !== 'playing') return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const resize = () => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      // Initialize bubbles
      bubblesRef.current = Array.from({ length: 12 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 24 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(0.5 + Math.random() * 0.8),
        color: ['rgba(45,106,79,0.3)', 'rgba(78,134,107,0.3)', 'rgba(42,107,116,0.3)'][Math.floor(Math.random() * 3)]
      }));

      const loop = () => {
        if (!isPaused) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          bubblesRef.current.forEach(b => {
            b.y += b.vy;
            b.x += b.vx;

            // Wrap around
            if (b.y < -b.r) b.y = canvas.height + b.r;
            if (b.x < -b.r) b.x = canvas.width + b.r;
            if (b.x > canvas.width + b.r) b.x = -b.r;

            // Draw bubble
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.stroke();

            // Highlight glint
            ctx.beginPath();
            ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fill();
          });
        }
        animFrameRef.current = requestAnimationFrame(loop);
      };

      animFrameRef.current = requestAnimationFrame(loop);

      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animFrameRef.current);
      };
    }, [gameState, isPaused]);

    // Handle Bubble Click / Touch
    const handleCanvasClick = (e) => {
      if (isPaused || gameState !== 'playing') return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let hitIndex = -1;
      for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
        const b = bubblesRef.current[i];
        const dist = Math.hypot(clickX - b.x, clickY - b.y);
        if (dist <= b.r + 8) {
          hitIndex = i;
          break;
        }
      }

      if (hitIndex !== -1) {
        playPopSound();
        setScore(s => s + 1);

        // Respawn bubble at bottom
        bubblesRef.current[hitIndex] = {
          x: Math.random() * canvas.width,
          y: canvas.height + 40,
          r: 24 + Math.random() * 20,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(0.5 + Math.random() * 0.8),
          color: ['rgba(45,106,79,0.3)', 'rgba(78,134,107,0.3)', 'rgba(42,107,116,0.3)'][Math.floor(Math.random() * 3)]
        };

        const praises = ['Gentle rhythm', 'Soft breath', 'In the pocket', 'Mindful focus', 'Release tension'];
        setRhythmNote(praises[Math.floor(Math.random() * praises.length)]);
      }
    };

    // Save Game Session
    const handleSaveSession = async () => {
      setIsSaving(true);
      try {
        if (onComplete) {
          await onComplete({
            gameName: 'Bubble Rhythm',
            gameMode: 'rhythm_pop',
            durationSeconds: durationMinutes * 60 - secondsRemaining,
            bubblesPopped: score,
            feeling: feedback
          });
        } else if (onExit) {
          onExit();
        }
      } catch (err) {
        console.warn('Game session save notice:', err);
        if (onExit) onExit();
      } finally {
        setIsSaving(false);
      }
    };

    // 1. INTRO SCREEN
    if (gameState === 'intro') {
      return h('div', {
        className: 'min-h-screen bg-[#111815] text-white flex flex-col justify-between p-6 sm:p-12 text-center animate-fade-in'
      }, [
        h('header', { className: 'flex justify-between items-center max-w-xl w-full mx-auto' }, [
          h('span', { className: 'text-xs text-[#a3b5ac] font-semibold' }, 'Mindful Mini-Game'),
          h('button', {
            type: 'button',
            onClick: onExit,
            className: 'min-h-[44px] px-3.5 text-xs text-[#a3b5ac] hover:text-white'
          }, '✕ Exit')
        ]),

        h('main', { className: 'max-w-md w-full mx-auto space-y-6 my-auto' }, [
          h('div', { className: 'w-20 h-20 rounded-2xl bg-[#1b4332] text-3xl flex items-center justify-center mx-auto shadow-md' }, '🫧'),
          h('div', { className: 'space-y-2' }, [
            h('h1', { className: 'text-2xl sm:text-3xl font-extrabold font-heading' }, 'Bubble Rhythm'),
            h('p', { className: 'text-xs sm:text-sm text-[#a3b5ac] leading-relaxed' },
              'Pop floating bubbles at a relaxed, steady tempo to gently synchronize your sensory focus and ground your attention.'
            )
          ]),

          // Duration picker
          h('div', { className: 'space-y-2 text-left' }, [
            h('label', { className: 'block text-xs font-semibold text-[#a3b5ac] text-center' }, 'Session Duration:'),
            h('div', { className: 'grid grid-cols-3 gap-2.5 max-w-xs mx-auto' }, [1, 2, 3].map(m =>
              h('button', {
                key: m,
                type: 'button',
                onClick: () => setDurationMinutes(m),
                className: `min-h-[44px] py-2 rounded-xl text-xs font-bold border transition-all ${
                  durationMinutes === m ? 'border-[#2d6a4f] bg-[#1b4332] text-white' : 'border-[#283932] bg-[#17211d] text-[#a3b5ac]'
                }`
              }, `${m} min`)
            ))
          ]),

          // Sound Toggle
          h('div', { className: 'flex items-center justify-center gap-2 pt-1' }, [
            h('button', {
              type: 'button',
              onClick: () => setSoundEnabled(s => !s),
              className: 'min-h-[44px] px-3.5 py-1.5 rounded-full bg-[#1b2622] border border-[#283932] text-xs text-[#a3b5ac] flex items-center gap-2'
            }, [
              h('span', null, soundEnabled ? '🔔 Sound On' : '🔕 Sound Muted')
            ])
          ]),

          h('div', { className: 'pt-2' },
            Button ? h(Button, {
              variant: 'primary',
              size: 'lg',
              fullWidth: true,
              onClick: handleStart
            }, 'Start Session →') : h('button', { onClick: handleStart, className: 'w-full py-3 bg-[#1b4332] text-white rounded-xl font-bold' }, 'Start')
          )
        ]),

        h('footer', { className: 'text-xs text-[#6e8278]' }, 'Zero competition or high-score pressure. Pure tactile rhythm.')
      ]);
    }

    // 2. PLAYING SCREEN (Immersive Canvas)
    if (gameState === 'playing') {
      const minutes = Math.floor(secondsRemaining / 60);
      const seconds = secondsRemaining % 60;

      return h('div', {
        className: 'fixed inset-0 bg-[#111815] text-white flex flex-col z-50 select-none overflow-hidden'
      }, [
        // Top HUD
        h('header', {
          className: 'h-16 px-6 flex items-center justify-between z-10 bg-[#111815]/80 backdrop-blur-xs border-b border-[#283932]'
        }, [
          h('div', { className: 'flex items-center gap-4 text-xs font-semibold text-[#a3b5ac]' }, [
            h('span', null, `🫧 Popped: ${score}`),
            h('span', { className: 'hidden sm:inline text-[#2d6a4f]' }, `• ${rhythmNote}`)
          ]),
          h('div', { className: 'text-sm font-bold font-mono text-white' },
            `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
          ),
          h('div', { className: 'flex items-center gap-2' }, [
            h('button', {
              type: 'button',
              onClick: () => setIsPaused(p => !p),
              className: 'min-h-[44px] px-3 rounded-lg border border-[#283932] bg-[#17211d] text-xs text-[#a3b5ac]'
            }, isPaused ? '▶ Resume' : '⏸ Pause'),
            h('button', {
              type: 'button',
              onClick: () => setGameState('completed'),
              className: 'min-h-[44px] px-3 rounded-lg bg-[#1b4332] text-xs font-semibold text-white'
            }, 'Finish')
          ])
        ]),

        // Interactive Canvas Surface
        h('div', {
          className: 'flex-1 relative cursor-crosshair touch-none',
          onClick: handleCanvasClick
        }, [
          h('canvas', { ref: canvasRef, className: 'w-full h-full block' }),
          isPaused && h('div', {
            className: 'absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-lg font-bold'
          }, 'Paused')
        ])
      ]);
    }

    // 3. COMPLETED SCREEN
    return h('div', {
      className: 'min-h-screen bg-[#111815] text-white flex flex-col justify-between p-6 sm:p-12 text-center animate-fade-in'
    }, [
      h('div', null),
      h('main', { className: 'max-w-md w-full mx-auto space-y-6' }, [
        h('div', { className: 'w-20 h-20 rounded-full bg-[#1b4332] text-3xl flex items-center justify-center mx-auto' }, '✨'),
        h('div', { className: 'space-y-1' }, [
          h('h2', { className: 'text-2xl sm:text-3xl font-extrabold font-heading' }, 'Mindful session complete.'),
          h('p', { className: 'text-xs sm:text-sm text-[#a3b5ac]' },
            `You grounded your focus and gently popped ${score} rhythm bubbles.`
          )
        ]),

        // "How do you feel now?"
        h('div', { className: 'space-y-3 pt-2 text-left' }, [
          h('label', { className: 'block text-xs font-semibold text-[#a3b5ac] text-center' }, 'How do you feel now?'),
          h('div', { className: 'grid grid-cols-3 gap-3' }, [
            { id: 'better', label: 'Better', icon: '🌿' },
            { id: 'same', label: 'Same', icon: '⚖️' },
            { id: 'worse', label: 'Worse', icon: '🌧️' }
          ].map(item => {
            const selected = feedback === item.id;
            return h('button', {
              key: item.id,
              type: 'button',
              onClick: () => setSelectedFeedback(item.id),
              className: `p-3 rounded-xl border text-center transition-all ${
                selected
                  ? 'border-[#2d6a4f] bg-[#1b4332] text-white ring-2 ring-[#2d6a4f]'
                  : 'border-[#283932] bg-[#17211d] text-[#a3b5ac] hover:border-[#3b5248]'
              }`
            }, [
              h('div', { className: 'text-xl mb-1' }, item.icon),
              h('div', { className: 'text-xs font-bold' }, item.label)
            ]);
          }))
        ]),

        h('div', { className: 'pt-4' },
          Button ? h(Button, {
            variant: 'primary',
            size: 'lg',
            fullWidth: true,
            isLoading: isSaving,
            onClick: handleSaveSession
          }, 'Save & Return') : h('button', { onClick: handleSaveSession, className: 'w-full py-3 bg-[#1b4332] text-white rounded-xl font-bold' }, 'Save & Return')
        )
      ]),
      h('div', null)
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.BubbleRhythmPage = BubbleRhythmPage;
})();
