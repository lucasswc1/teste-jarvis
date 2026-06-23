'use client';

import { useEffect, useRef, useState } from 'react';
import { useCodex } from '@/context/CodexContext';
import { BASE_DOCS, parseMd, readTime } from '@/lib/docs';
import { Block } from '@/types';

const CALLOUT_STYLE = {
  tip:  { cbg: 'rgba(255,255,255,.035)', cborder: 'rgba(255,255,255,.10)', cdot: '#cfcfcf', label: 'Dica' },
  warn: { cbg: 'rgba(255,255,255,.035)', cborder: 'rgba(255,255,255,.10)', cdot: '#cfcfcf', label: 'Atenção' },
  info: { cbg: 'rgba(255,255,255,.035)', cborder: 'rgba(255,255,255,.10)', cdot: '#cfcfcf', label: 'Nota' },
};

export function renderBlock(b: Block, idx: number) {
  if (b.type === 'lead') return (
    <p key={idx} style={{ fontSize: 17, lineHeight: 1.65, color: '#bcbcbc', margin: '0 0 26px', fontWeight: 400 }}>{b.text}</p>
  );
  if (b.type === 'h2') return (
    <h2 key={idx} data-h={b.id} style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-.012em', color: '#f1f1f1', margin: '38px 0 12px', scrollMarginTop: 24 }}>{b.text}</h2>
  );
  if (b.type === 'p') return (
    <p key={idx} style={{ fontSize: 14.5, lineHeight: 1.72, color: '#bdbdbd', margin: '0 0 16px' }}>{b.text}</p>
  );
  if (b.type === 'ul') return (
    <ul key={idx} style={{ margin: '0 0 18px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
      {(b.items || []).map((li, i) => (
        <li key={i} style={{ display: 'flex', gap: 11, fontSize: 14.5, lineHeight: 1.6, color: '#bdbdbd' }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: '#6e6e6e', marginTop: 8, flex: 'none' }} />
          <span>{li}</span>
        </li>
      ))}
    </ul>
  );
  if (b.type === 'code') return (
    <div key={idx} style={{ margin: '0 0 22px', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, overflow: 'hidden', background: '#0d0d10' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: '#838383' }}>{b.lang}</span>
      </div>
      <pre className="cx-scroll" style={{ margin: 0, padding: '14px 16px', overflowX: 'auto', fontFamily: 'var(--font-geist-mono)', fontSize: 12.5, lineHeight: 1.7, color: '#cfcfcf', whiteSpace: 'pre' }}>{b.text}</pre>
    </div>
  );
  if (b.type === 'callout') {
    const cs = CALLOUT_STYLE[b.variant || 'info'];
    return (
      <div key={idx} style={{ margin: '0 0 22px', display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 11, background: cs.cbg, border: `1px solid ${cs.cborder}` }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: cs.cdot, marginTop: 7, flex: 'none' }} />
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: cs.cdot, marginBottom: 4 }}>{cs.label}</div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#c4c4c4' }}>{b.text}</p>
        </div>
      </div>
    );
  }
  return null;
}

export default function DocReader() {
  const { state, dispatch, flat } = useCodex();
  const mainRef = useRef<HTMLElement>(null);
  const obsRef = useRef<IntersectionObserver | null>(null);
  const [editHov, setEditHov] = useState(false);
  const [prevHov, setPrevHov] = useState(false);
  const [nextHov, setNextHov] = useState(false);
  const [hovTocId, setHovTocId] = useState<string | null>(null);

  const active = state.activeId;
  const meta = flat.find(f => f.id === active) || flat[0];
  const userDoc = state.userDocs.find(u => u.id === active);

  let rawBlocks: Block[];
  let category: string;
  let updated: string;
  let read: string;

  if (BASE_DOCS[active]) {
    rawBlocks = BASE_DOCS[active].blocks;
    category = BASE_DOCS[active].category;
    updated = BASE_DOCS[active].updated;
    read = BASE_DOCS[active].read;
  } else if (userDoc) {
    rawBlocks = parseMd(userDoc.body);
    category = userDoc.category;
    updated = 'recém-publicado';
    read = readTime(userDoc.body);
  } else {
    rawBlocks = [
      { type: 'lead', text: `Ainda estou consolidando minhas anotações sobre ${meta?.title?.toLowerCase() || 'este tópico'}.` },
      { type: 'callout', variant: 'info', text: 'Rascunho em andamento. Volte em breve — ou comece a escrever você mesmo.' },
    ];
    category = meta?.category || '';
    updated = 'em breve';
    read = '1 min';
  }

  const toc = rawBlocks.filter(b => b.type === 'h2').map(h => ({ id: h.id!, text: h.text! }));
  const idx = flat.findIndex(f => f.id === active);
  const prev = flat[(idx - 1 + flat.length) % flat.length];
  const next = flat[(idx + 1) % flat.length];

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [active]);

  useEffect(() => {
    if (!mainRef.current) return;
    if (obsRef.current) obsRef.current.disconnect();
    const heads = [...mainRef.current.querySelectorAll('[data-h]')] as HTMLElement[];
    if (!heads.length) return;
    obsRef.current = new IntersectionObserver(entries => {
      const vis = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) dispatch({ type: 'SET_ACTIVE_HEAD', id: (vis[0].target as HTMLElement).getAttribute('data-h')! });
    }, { root: mainRef.current, rootMargin: '0px 0px -72% 0px', threshold: 0 });
    heads.forEach(h => obsRef.current!.observe(h));
    dispatch({ type: 'SET_ACTIVE_HEAD', id: heads[0].getAttribute('data-h')! });
    return () => obsRef.current?.disconnect();
  }, [active, dispatch]);

  function handleEdit() {
    if (!userDoc) return;
    const isCustomCat = !['Começando', 'Desenvolvimento', 'Infraestrutura', 'Design', 'Notas'].includes(userDoc.category);
    dispatch({ type: 'OPEN_EDITOR_EDIT', doc: userDoc, catMode: isCustomCat ? 'new' : 'pick' });
  }

  return (
    <main ref={mainRef} className="cx-scroll" style={{ flex: 1, overflowY: 'auto', minWidth: 0, display: 'flex', justifyContent: 'center' }}>
      <article className="animate-cxfade" key={active} style={{ width: '100%', maxWidth: 752, padding: '101px 56px 120px' }}>

        {/* Breadcrumb + edit */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#6f6f6f', fontWeight: 500 }}>
            <span>{category}</span>
            <span style={{ opacity: .5 }}>/</span>
            <span style={{ color: '#a6a6a6' }}>{meta?.title}</span>
          </div>
          {userDoc && (
            <button
              onMouseEnter={() => setEditHov(true)}
              onMouseLeave={() => setEditHov(false)}
              onClick={handleEdit}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 28, padding: '0 11px', borderRadius: 7, cursor: 'pointer',
                background: editHov ? 'rgba(255,255,255,.07)' : 'transparent',
                border: `1px solid ${editHov ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.09)'}`,
                color: editHov ? '#e8e8e8' : '#838383',
                fontFamily: 'var(--font-geist-sans)', fontSize: 12,
                transition: 'background .15s, border-color .15s, color .15s',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 15 15" fill="none">
                <path d="M10.5 1.5l3 3-9 9H1.5v-3l9-9z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              Editar
            </button>
          )}
        </div>

        <h1 style={{ fontSize: 32, lineHeight: 1.15, letterSpacing: '-.022em', fontWeight: 600, color: '#f7f7f7', margin: '0 0 14px' }}>{meta?.title}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12.5, color: '#838383', marginBottom: 30, paddingBottom: 26, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <span>Atualizado {updated}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: '#4f4f4f' }} />
          <span>{read} de leitura</span>
        </div>

        {rawBlocks.map((b, i) => renderBlock(b, i))}

        {/* Footer nav */}
        <div style={{ display: 'flex', gap: 12, marginTop: 48, paddingTop: 26, borderTop: '1px solid rgba(255,255,255,.07)' }}>
          <a href="#"
            onMouseEnter={() => setPrevHov(true)}
            onMouseLeave={() => setPrevHov(false)}
            onClick={e => { e.preventDefault(); dispatch({ type: 'SET_ACTIVE', id: prev.id }); }}
            style={{
              flex: 1, textDecoration: 'none', borderRadius: 11, padding: '13px 16px',
              border: `1px solid ${prevHov ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.08)'}`,
              background: prevHov ? 'rgba(255,255,255,.03)' : 'transparent',
              transition: 'border-color .15s, background .15s',
            }}>
            <div style={{ fontSize: 11, color: '#6f6f6f', marginBottom: 3 }}>Anterior</div>
            <div style={{ fontSize: 13.5, color: prevHov ? '#f0f0f0' : '#dcdcdc', fontWeight: 500, transition: 'color .15s' }}>{prev?.title}</div>
          </a>
          <a href="#"
            onMouseEnter={() => setNextHov(true)}
            onMouseLeave={() => setNextHov(false)}
            onClick={e => { e.preventDefault(); dispatch({ type: 'SET_ACTIVE', id: next.id }); }}
            style={{
              flex: 1, textDecoration: 'none', borderRadius: 11, padding: '13px 16px', textAlign: 'right',
              border: `1px solid ${nextHov ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.08)'}`,
              background: nextHov ? 'rgba(255,255,255,.03)' : 'transparent',
              transition: 'border-color .15s, background .15s',
            }}>
            <div style={{ fontSize: 11, color: '#6f6f6f', marginBottom: 3 }}>Próximo</div>
            <div style={{ fontSize: 13.5, color: nextHov ? '#f0f0f0' : '#dcdcdc', fontWeight: 500, transition: 'color .15s' }}>{next?.title}</div>
          </a>
        </div>
      </article>

      {/* TOC */}
      <nav className="cx-toc" style={{ width: 212, flex: 'none', padding: '105px 24px 40px 0', alignSelf: 'flex-start', position: 'sticky', top: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6f6f6f', marginBottom: 12 }}>
          Nesta página
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderLeft: '1px solid rgba(255,255,255,.08)' }}>
          {toc.map(t => {
            const on = state.activeHead === t.id;
            const hov = hovTocId === t.id;
            return (
              <a key={t.id} href="#"
                onMouseEnter={() => setHovTocId(t.id)}
                onMouseLeave={() => setHovTocId(null)}
                onClick={e => {
                  e.preventDefault();
                  const el = mainRef.current?.querySelector(`[data-h="${t.id}"]`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                style={{
                  fontSize: 12.5, lineHeight: 1.4, textDecoration: 'none',
                  padding: '5px 0 5px 14px', marginLeft: -1,
                  borderLeft: `1.5px solid ${on ? '#d6d6d6' : 'transparent'}`,
                  color: on ? '#e8e8e8' : hov ? '#d0d0d0' : '#838383',
                  transition: 'color .12s',
                }}>
                {t.text}
              </a>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
