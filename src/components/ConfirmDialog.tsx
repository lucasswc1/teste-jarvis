'use client';

import { useState } from 'react';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirmar', danger = false, onConfirm, onCancel }: Props) {
  const [cancelHov, setCancelHov] = useState(false);
  const [confirmHov, setConfirmHov] = useState(false);

  return (
    <div
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-cxpop"
        style={{ width: '100%', maxWidth: 380, background: '#141414', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, padding: '22px 22px 20px', boxShadow: '0 20px 70px rgba(0,0,0,.6), 0 0 0 1px rgba(0,0,0,.4)' }}
      >
        <h3 style={{ margin: '0 0 8px', fontSize: 14.5, fontWeight: 600, color: '#f4f4f4', letterSpacing: '-.01em' }}>{title}</h3>
        <p style={{ margin: '0 0 22px', fontSize: 13, lineHeight: 1.65, color: '#838383' }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onMouseEnter={() => setCancelHov(true)}
            onMouseLeave={() => setCancelHov(false)}
            onClick={onCancel}
            style={{
              height: 32, padding: '0 14px', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font-geist-sans)', fontSize: 12.5,
              background: cancelHov ? 'rgba(255,255,255,.07)' : 'transparent',
              border: '1px solid rgba(255,255,255,.1)',
              color: cancelHov ? '#e8e8e8' : '#cacaca',
              transition: 'background .15s, color .15s',
            }}
          >
            Cancelar
          </button>
          <button
            onMouseEnter={() => setConfirmHov(true)}
            onMouseLeave={() => setConfirmHov(false)}
            onClick={onConfirm}
            style={{
              height: 32, padding: '0 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-geist-sans)', fontSize: 12.5, fontWeight: 600,
              background: danger
                ? (confirmHov ? '#a93226' : '#c0392b')
                : (confirmHov ? '#ffffff' : '#f0f0f0'),
              color: danger ? '#fff' : '#161616',
              transition: 'background .15s',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
