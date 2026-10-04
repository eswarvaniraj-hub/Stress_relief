/**
 * AppShell Component — Breathly Design System & Layout
 * 
 * Purpose: Responsive, mobile-first application shell.
 * - Desktop: fixed left sidebar (width 256px), clean top header, main content offset.
 * - Mobile: bottom tab bar (5 main tabs: Home, Insights, Reset, Journal, Profile).
 * - Immersive Mode: Automatically hides sidebar, header, and bottom bar for breathing & mini-games.
 * - Predictable Back Navigation: Shows current location with a dedicated Back button whenever canGoBack is true.
 */

(function () {
  const { createElement: h, useState, useEffect } = React;

  function AppShell({
    currentRoute = 'home',
    onNavigate,
    onGoBack,
    canGoBack = false,
    isImmersive = false,
    user = null,
    onSignOut,
    children
  }) {
    const UI = window.BreathlyUI || {};
    const { Button, ToastContainer } = UI;
    const router = window.BreathlyRouter;

    // 5 Main Navigation Tabs
    const tabs = [
      {
        id: 'home',
        label: 'Home',
        icon: h('svg', { className: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
          h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' }))
      },
      {
        id: 'insights',
        label: 'Insights',
        icon: h('svg', { className: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
          h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }))
      },
      {
        id: 'reset',
        label: 'Reset',
        icon: h('svg', { className: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
          h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }))
      },
      {
        id: 'journal',
        label: 'Journal',
        icon: h('svg', { className: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
          h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }))
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: h('svg', { className: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
          h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }))
      }
    ];

    // Secondary sub-tools organized under main tabs
    const subTools = [
      { id: 'companion', label: 'AI Companion', icon: '✨', parent: 'reset' },
      { id: 'games', label: 'Mindful Games', icon: '🫧', parent: 'reset' },
      { id: 'distractions', label: 'Focus & Distractions', icon: '⏱️', parent: 'reset' }
    ];

    // If immersive mode is active, render children without navigation bars
    if (isImmersive) {
      return h('div', { className: 'min-h-screen bg-[#111815] text-white flex flex-col relative select-none' }, [
        children,
        h(ToastContainer, { key: 'toast' })
      ]);
    }

    const routeTitleMap = {
      home: 'Dashboard',
      insights: 'Well-Being Insights',
      reset: 'Mindful Resets',
      journal: 'Private Journal',
      profile: 'Profile & Settings',
      companion: 'Breathly AI Companion',
      games: 'Mindful Mini-Games',
      distractions: 'Focus & Distractions',
      checkin: 'Daily Check-In'
    };

    const currentTitle = routeTitleMap[currentRoute] || 'Breathly';

    return h('div', {
      className: 'min-h-screen bg-[#f8faf8] text-[#18201d] flex flex-col relative selection:bg-[#e8f3ed] selection:text-[#1b4332]'
    }, [
      // 1. DESKTOP FIXED SIDEBAR
      h('aside', {
        key: 'desktop-sidebar',
        className: 'hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-[#e2e8e4] z-30 select-none'
      }, [
        // App Logo & Brand Header
        h('div', {
          key: 'brand',
          onClick: () => onNavigate('home'),
          className: 'h-16 px-6 border-b border-[#edf2ee] flex items-center gap-3 cursor-pointer'
        }, [
          h('div', { className: 'w-9 h-9 rounded-xl bg-[#1b4332] text-white flex items-center justify-center font-black text-lg shadow-xs' }, 'B'),
          h('div', { className: 'min-w-0' }, [
            h('span', { className: 'font-bold text-base text-[#18201d] tracking-tight font-heading block leading-none' }, 'Breathly'),
            h('span', { className: 'text-[11px] text-[#82928b] font-medium tracking-wide' }, 'Digital Well-Being')
          ])
        ]),

        // Primary Navigation Items
        h('nav', {
          key: 'nav-list',
          className: 'flex-1 px-3 py-4 space-y-1 overflow-y-auto'
        }, [
          h('div', { key: 'main-heading', className: 'px-3 py-1 text-[11px] font-bold text-[#82928b] uppercase tracking-wider' }, 'Main'),
          tabs.map((tab) => {
            const isActive = currentRoute === tab.id;
            return h('button', {
              key: tab.id,
              type: 'button',
              onClick: () => onNavigate(tab.id),
              className: `w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all duration-150 ${
                isActive
                  ? 'bg-[#e8f3ed] text-[#1b4332] shadow-xs'
                  : 'text-[#55645e] hover:text-[#18201d] hover:bg-[#f0f4f1]'
              }`
            }, [
              h('span', { className: isActive ? 'text-[#1b4332]' : 'text-[#82928b]' }, tab.icon),
              h('span', { className: 'truncate' }, tab.label)
            ]);
          }),

          // Secondary Tools Section
          h('div', { key: 'tools-heading', className: 'pt-4 px-3 py-1 text-[11px] font-bold text-[#82928b] uppercase tracking-wider' }, 'Mindful Tools'),
          subTools.map((tool) => {
            const isActive = currentRoute === tool.id;
            return h('button', {
              key: tool.id,
              type: 'button',
              onClick: () => onNavigate(tool.id),
              className: `w-full min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-3 transition-all duration-150 ${
                isActive
                  ? 'bg-[#e8f3ed] text-[#1b4332] font-semibold shadow-xs'
                  : 'text-[#55645e] hover:text-[#18201d] hover:bg-[#f0f4f1]'
              }`
            }, [
              h('span', { className: 'text-base' }, tool.icon),
              h('span', { className: 'truncate' }, tool.label)
            ]);
          })
        ]),

        // Bottom User Account Card
        h('div', {
          key: 'user-footer',
          className: 'p-3 border-t border-[#edf2ee]'
        }, [
          h('div', {
            className: 'p-2.5 rounded-xl bg-[#f8faf8] border border-[#e2e8e4] flex items-center justify-between'
          }, [
            h('div', {
              className: 'flex items-center gap-2.5 min-w-0 cursor-pointer',
              onClick: () => onNavigate('profile')
            }, [
              user?.picture ? h('img', {
                src: user.picture,
                alt: user.name || 'User',
                className: 'w-8 h-8 rounded-full border border-[#cfe1d7] shrink-0'
              }) : h('div', {
                className: 'w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-xs font-bold shrink-0'
              }, (user?.name || 'U').charAt(0)),
              h('div', { className: 'min-w-0' }, [
                h('div', { className: 'text-xs font-bold text-[#18201d] truncate' }, user?.name || 'Guest User'),
                h('div', { className: 'text-[10px] text-[#82928b] truncate' }, user?.email || 'Local Session')
              ])
            ]),
            onSignOut && h('button', {
              type: 'button',
              onClick: onSignOut,
              title: 'Sign Out',
              'aria-label': 'Sign out',
              className: 'p-1.5 rounded-lg text-[#82928b] hover:text-[#c25e40] hover:bg-[#fdf1ee] transition-colors'
            }, [
              h('svg', { className: 'w-4 h-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
                h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' }))
            ])
          ])
        ])
      ]),

      // 2. MAIN CONTENT AREA (Offset for desktop sidebar)
      h('div', {
        key: 'main-wrapper',
        className: 'md:pl-64 flex-1 flex flex-col min-h-screen pb-20 md:pb-8'
      }, [
        // Top Responsive App Header
        h('header', {
          key: 'top-header',
          className: 'h-16 px-4 sm:px-8 border-b border-[#e2e8e4] bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between'
        }, [
          // Left: Back button or mobile brand
          h('div', { key: 'header-left', className: 'flex items-center gap-3 min-w-0' }, [
            canGoBack && h('button', {
              key: 'back-btn',
              type: 'button',
              onClick: onGoBack,
              'aria-label': 'Go back to previous screen',
              className: 'min-h-[44px] min-w-[44px] px-2.5 rounded-xl border border-[#e2e8e4] hover:bg-[#f0f4f1] text-[#18201d] flex items-center gap-1.5 text-xs font-semibold transition-colors'
            }, [
              h('svg', { className: 'w-4 h-4 text-[#55645e]', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
                h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M15 19l-7-7 7-7' })),
              h('span', { className: 'hidden sm:inline' }, 'Back')
            ]),

            // Mobile Brand Badge (when not showing back)
            !canGoBack && h('div', {
              key: 'mobile-brand',
              className: 'md:hidden flex items-center gap-2 cursor-pointer',
              onClick: () => onNavigate('home')
            }, [
              h('div', { className: 'w-8 h-8 rounded-lg bg-[#1b4332] text-white flex items-center justify-center font-bold text-sm' }, 'B'),
              h('span', { className: 'font-bold text-base text-[#18201d] font-heading' }, 'Breathly')
            ]),

            // Screen Title
            h('h1', {
              key: 'screen-title',
              className: 'hidden sm:block text-base sm:text-lg font-bold text-[#18201d] font-heading truncate ml-1'
            }, currentTitle)
          ]),

          // Right Header Controls: Quick 60s Reset & Profile Avatar
          h('div', { key: 'header-right', className: 'flex items-center gap-2.5' }, [
            h('button', {
              type: 'button',
              onClick: () => onNavigate('reset'),
              className: 'min-h-[44px] px-3.5 py-1.5 rounded-xl bg-[#e8f3ed] hover:bg-[#d8ebd1] text-[#1b4332] text-xs font-semibold border border-[#cfe1d7] flex items-center gap-1.5 transition-all shadow-2xs'
            }, [
              h('span', { className: 'text-sm' }, '🌬️'),
              h('span', { className: 'hidden sm:inline' }, 'Quick Reset')
            ]),

            // Profile Link avatar
            h('button', {
              type: 'button',
              onClick: () => onNavigate('profile'),
              'aria-label': 'Open Profile & Settings',
              className: 'min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center p-0.5 hover:ring-2 hover:ring-[#2d6a4f]/20 transition-all'
            }, [
              user?.picture ? h('img', {
                src: user.picture,
                alt: user.name || 'User',
                className: 'w-8 h-8 rounded-full border border-[#cfe1d7]'
              }) : h('div', {
                className: 'w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-xs font-bold'
              }, (user?.name || 'U').charAt(0))
            ])
          ])
        ]),

        // Main View Port
        h('main', {
          key: 'main-content',
          className: 'flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6'
        }, children)
      ]),

      // 3. MOBILE BOTTOM TAB BAR (Fixed on phones)
      h('nav', {
        key: 'mobile-tab-bar',
        className: 'md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#e2e8e4] z-30 flex items-center justify-around h-16 px-1 shadow-[0_-2px_10px_rgba(24,32,29,0.03)]'
      }, tabs.map((tab) => {
        const isActive = currentRoute === tab.id;
        return h('button', {
          key: tab.id,
          type: 'button',
          onClick: () => onNavigate(tab.id),
          className: `flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive ? 'text-[#1b4332]' : 'text-[#82928b] hover:text-[#55645e]'
          }`
        }, [
          h('div', { className: `p-1 rounded-lg ${isActive ? 'bg-[#e8f3ed]' : ''}` }, tab.icon),
          h('span', { className: `text-[10px] font-semibold ${isActive ? 'text-[#1b4332]' : ''}` }, tab.label)
        ]);
      })),

      // Global Toast Host
      h(ToastContainer, { key: 'toast-host' })
    ]);
  }

  window.BreathlyUI = window.BreathlyUI || {};
  window.BreathlyUI.AppShell = AppShell;
})();
