'use client';

import { useEffect, useRef } from 'react';
import { useCodex } from '@/context/CodexContext';

export default function CommandPalette() {
  const { state, dispatch, flat } = useCodex();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (state.paletteOpen) inputRef.current?.focus(); }, [state.paletteOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === 'k') {
        e.preventDefault();
        dispatch({ type: state.paletteOpen ? 'CLOSE_PALETTE' : 'OPEN_PALETTE' });
        return;
      }
      if (!state.paletteOpen) return;
      if (k === 'escape') { e.preventDefault(); dispatch({ type: 'CLOSE_PALETTE' }); }
      else if (k === 'arrowdown') { e.preventDefault(); dispatch({ type: 'MOVE_SEL', delta: 1, max: results.length }); }
      else if (k === 'arrowup') { e.preventDefault(); dispatch({ type: 'MOVE_SEL', delta: -1, max: results.length }); }
      else if (k === 'enter') {
        e.preventDefault();
        const pick = results[Math.min(state.selIdx, results.length - 1)];
        if (pick) dispatch({ type: 'SET_ACTIVE', id: pick.id });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const q = state.pq.trim().toLowerCase();
  const results = flat.filter(f => !q || f.title.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  const selIdx = Math.min(state.selIdx, Math.max(0, results.length - 1));

  if (!state.paletteOpen) return null;

  return (
    <div
      onClick={() => dispatch({ type: 'CLOSE_PALETTE' })}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '13vh 16px 16px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-cxpop"
        style={{ width: '100%', maxWidth: 620, background: '#141414', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, boxShadow: '0 20px 70px rgba(0,0,0,.6), 0 0 0 1px rgba(0,0,0,.4)', overflow: 'hidden' }}
      >
        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '0 16px', height: 56, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <svg width="16" height="16" viewBox="0 0 15 15" fill="none" style={{ color: '#838383', flex: 'none' }}>
            <path d="M6.5 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM13 13l-3.2-3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            value={state.pq}
            onChange={e => dispatch({ type: 'SET_PQ', pq: e.target.value })}
            placeholder="Buscar na documentação…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f4f4f4', fontFamily: 'var(--font-geist-sans)', fontSize: 15.5 }}
          />
          <kbd style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 10.5, color: '#838383', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 5, padding: '2px 6px', flex: 'none' }}>esc</kbd>
        </div>

        {/* Results */}
        <div className="cx-scroll" style={{ maxHeight: 340, overflowY: 'auto', padding: 8 }}>
          {results.map((r, i) => {
            const on = i === selIdx;
            return (
              <a key={r.id} href="#"
                onClick={e => { e.preventDefault(); dispatch({ type: 'SET_ACTIVE', id: r.id }); }}
                onMouseEnter={() => dispatch({ type: 'MOVE_SEL', delta: i - selIdx, max: results.length })}
                style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', padding: '10px 12px', borderRadius: 9, background: on ? 'rgba(255,255,255,.07)' : 'transparent' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.07)', flex: 'none' }}>
                  <svg width="13" height="13" viewBox="0 0 15 15" fill="none" style={{ color: on ? '#cfcfcf' : '#7a7a7a' }}>
                    <path d="M3.5 1.5h5L11.5 4.5v9h-8z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                    <path d="M8 1.5v3.5h3.5" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13.5, color: on ? '#f4f4f4' : '#cacaca', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</span>
                  <span style={{ display: 'block', fontSize: 11.5, color: '#6f6f6f', marginTop: 1 }}>{r.category}</span>
                </span>
                <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: on ? '#9a9a9a' : 'transparent', flex: 'none' }}>↵</span>
              </a>
            );
          })}
          {results.length === 0 && (
            <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13.5, color: '#6f6f6f' }}>
              Nenhum resultado para &ldquo;{state.pq}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '9px 16px', borderTop: '1px solid rgba(255,255,255,.07)', fontSize: 11, color: '#6f6f6f' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <kbd style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 10, color: '#9a9a9a', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 4, padding: '1px 5px' }}>↑↓</kbd>navegar
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <kbd style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 10, color: '#9a9a9a', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 4, padding: '1px 5px' }}>↵</kbd>abrir
          </span>
        </div>
      </div>
    </div>
  );
}
