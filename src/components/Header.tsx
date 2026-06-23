'use client';

import { useState } from 'react';
import { useCodex } from '@/context/CodexContext';

export default function Header() {
  const { dispatch } = useCodex();
  const [searchHov, setSearchHov] = useState(false);
  const [newHov, setNewHov] = useState(false);
  const [menuHov, setMenuHov] = useState(false);

  return (
    <header style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
      height: 57, display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 16px 0 18px', borderBottom: '1px solid rgba(255,255,255,.07)',
      background: 'rgba(10,10,10,.4)', backdropFilter: 'blur(18px) saturate(180%)', WebkitBackdropFilter: 'blur(18px) saturate(180%)',
    }}>

      {/* Mobile menu */}
      <button
        className="cx-menu"
        onMouseEnter={() => setMenuHov(true)}
        onMouseLeave={() => setMenuHov(false)}
        onClick={() => dispatch({ type: 'TOGGLE_NAV' })}
        aria-label="Menu"
        style={{
          display: 'none', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 8, cursor: 'pointer', padding: 0,
          border: '1px solid rgba(255,255,255,.09)',
          background: menuHov ? 'rgba(255,255,255,.06)' : 'transparent',
          color: menuHov ? '#e8e8e8' : '#cacaca',
          transition: 'background .15s, color .15s',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M1.5 3.5h12M1.5 7.5h12M1.5 11.5h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: 'linear-gradient(160deg,#2b2b2b,#161616)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 1px rgba(255,255,255,.08) inset, 0 2px 8px rgba(0,0,0,.55)',
        }}>
          <div style={{ width: 8, height: 8, background: '#fff', borderRadius: 2, transform: 'rotate(45deg)' }} />
        </div>
        <span style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: '-.01em', color: '#f4f4f4' }}>Jarvis</span>
        <span style={{
          fontSize: 10.5, fontFamily: 'var(--font-geist-mono)', color: '#838383',
          border: '1px solid rgba(255,255,255,.09)', borderRadius: 999,
          padding: '1.5px 7px', marginLeft: 2,
        }}>v0.1</span>
      </div>

      {/* Search */}
      <button
        className="cx-search"
        onMouseEnter={() => setSearchHov(true)}
        onMouseLeave={() => setSearchHov(false)}
        onClick={() => dispatch({ type: 'OPEN_PALETTE' })}
        aria-label="Buscar"
        style={{
          flex: 1, maxWidth: 420, marginLeft: 6, position: 'relative', height: 36,
          display: 'flex', alignItems: 'center',
          background: searchHov ? 'rgba(255,255,255,.065)' : 'rgba(255,255,255,.035)',
          border: `1px solid ${searchHov ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.08)'}`,
          borderRadius: 9, cursor: 'pointer', padding: 0, textAlign: 'left',
          fontFamily: 'var(--font-geist-sans)',
          transition: 'background .15s, border-color .15s',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none"
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: searchHov ? '#9a9a9a' : '#6f6f6f', transition: 'color .15s' }}>
          <path d="M6.5 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM13 13l-3.2-3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: 13, color: searchHov ? '#a6a6a6' : '#838383', paddingLeft: 34, transition: 'color .15s' }}>Buscar na documentação…</span>
        <span style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 3, pointerEvents: 'none' }}>
          <kbd style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 10.5, color: '#838383', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 5, padding: '1.5px 5px' }}>⌘</kbd>
          <kbd style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 10.5, color: '#838383', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 5, padding: '1.5px 6px' }}>K</kbd>
        </span>
      </button>

      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
        <button
          onMouseEnter={() => setNewHov(true)}
          onMouseLeave={() => setNewHov(false)}
          onClick={() => dispatch({ type: 'OPEN_EDITOR_NEW' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 32,
            padding: '0 13px 0 11px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: newHov ? '#ffffff' : '#f0f0f0',
            color: '#161616', fontFamily: 'var(--font-geist-sans)', fontSize: 12.5, fontWeight: 600,
            transition: 'background .15s',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 2.2v10.6M2.2 7.5h10.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Nova página
        </button>

        <div style={{ width: 26, height: 26, borderRadius: 999, background: 'linear-gradient(135deg,#3a3a3a,#232323)', border: '1px solid rgba(255,255,255,.1)', marginLeft: 4 }} />
      </div>
    </header>
  );
}
