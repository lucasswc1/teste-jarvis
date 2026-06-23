'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useCodex } from '@/context/CodexContext';
import { slug, suggestCat } from '@/lib/docs';
import { UserDoc } from '@/types';
import BlockEditor from '@/components/BlockEditor';

export default function Editor() {
  const { state, dispatch, nav } = useCodex();
  const titleRef = useRef<HTMLInputElement>(null);
  const { draft, catMode } = state;
  const [cancelHov, setCancelHov] = useState(false);
  const [pubHov, setPubHov] = useState(false);
  const [sugHov, setSugHov] = useState(false);
  const [hovChip, setHovChip] = useState<string | null>(null);
  const [hovDashed, setHovDashed] = useState(false);

  const isEditing = draft.editingId !== null;

  useEffect(() => { titleRef.current?.focus(); }, []);

  const sug = suggestCat(draft.title + ' ' + draft.body);
  const targetCat = catMode === 'new'
    ? (draft.newCat.trim() || 'Nova categoria')
    : (draft.category || sug || 'Notas');

  const pubDisabled = !draft.title.trim();

  function publish() {
    if (pubDisabled) return;
    let cat = catMode === 'new' ? draft.newCat.trim() : draft.category;
    if (!cat) cat = suggestCat(draft.title + ' ' + draft.body) || 'Notas';

    if (isEditing) {
      const updated = state.userDocs.map(d =>
        d.id === draft.editingId ? { ...d, title: draft.title, body: draft.body, category: cat! } : d
      );
      try { localStorage.setItem('codex_userdocs', JSON.stringify(updated)); } catch {}
      dispatch({ type: 'SET_USER_DOCS', docs: updated });
      dispatch({ type: 'SET_ACTIVE', id: draft.editingId! });
    } else {
      const id = (slug(draft.title) || 'pagina') + '-' + Date.now().toString(36).slice(-4);
      const newDoc: UserDoc = { id, title: draft.title, category: cat, body: draft.body, created: Date.now() };
      const updatedDocs = [...state.userDocs, newDoc];
      try { localStorage.setItem('codex_userdocs', JSON.stringify(updatedDocs)); } catch {}
      dispatch({ type: 'SET_USER_DOCS', docs: updatedDocs });
      dispatch({ type: 'SET_ACTIVE', id });
    }
    dispatch({ type: 'SET_MODE', mode: 'read' });
    dispatch({ type: 'SET_DRAFT', patch: { title: '', body: '', category: '', newCat: '', editingId: null } });
  }

  const handleBodyChange = useCallback((md: string) => {
    dispatch({ type: 'SET_DRAFT', patch: { body: md } });
  }, [dispatch]);

  const catLabels = nav.map(s => s.label);

  return (
    <div className="animate-cxfade" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', paddingTop: 57 }}>

      {/* Toolbar */}
      <div style={{
        flex: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '16px 28px',
        borderBottom: '1px solid rgba(255,255,255,.07)',
        background: 'rgba(10,10,10,.4)', backdropFilter: 'blur(18px) saturate(180%)', WebkitBackdropFilter: 'blur(18px) saturate(180%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: '#838383' }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: '#d6d6d6' }} />
          <span>{isEditing ? 'Editando' : 'Rascunho'}</span>
          <span style={{ opacity: .5 }}>·</span>
          <span>{isEditing ? 'em' : 'publicar em'}</span>
          <span style={{ color: '#e8e8e8', fontWeight: 500 }}>{targetCat}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onMouseEnter={() => setCancelHov(true)}
            onMouseLeave={() => setCancelHov(false)}
            onClick={() => dispatch({ type: 'SET_MODE', mode: 'read' })}
            style={{
              height: 32, padding: '0 14px', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font-geist-sans)', fontSize: 12.5,
              background: cancelHov ? 'rgba(255,255,255,.07)' : 'transparent',
              border: '1px solid rgba(255,255,255,.1)',
              color: cancelHov ? '#e8e8e8' : '#cacaca',
              transition: 'background .15s, color .15s',
            }}
          >Cancelar</button>
          <button
            onMouseEnter={() => !pubDisabled && setPubHov(true)}
            onMouseLeave={() => setPubHov(false)}
            onClick={publish}
            disabled={pubDisabled}
            style={{
              height: 32, padding: '0 16px', borderRadius: 8, border: 'none',
              fontFamily: 'var(--font-geist-sans)', fontSize: 12.5, fontWeight: 600,
              cursor: pubDisabled ? 'default' : 'pointer',
              background: pubDisabled ? 'rgba(255,255,255,.07)' : pubHov ? '#ffffff' : '#f0f0f0',
              color: pubDisabled ? '#6f6f6f' : '#161616',
              transition: 'background .15s',
            }}
          >{isEditing ? 'Salvar' : 'Publicar'}</button>
        </div>
      </div>

      {/* Content */}
      <div className="cx-scroll" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: 752, margin: '0 auto', padding: '38px 56px 140px' }}>

        {/* Category picker */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6f6f6f', marginBottom: 10 }}>Categoria</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {catLabels.map(lbl => {
              const on = catMode === 'pick' && draft.category === lbl;
              const hov = hovChip === lbl;
              return (
                <button key={lbl}
                  onMouseEnter={() => setHovChip(lbl)}
                  onMouseLeave={() => setHovChip(null)}
                  onClick={() => { dispatch({ type: 'SET_CAT_MODE', catMode: 'pick' }); dispatch({ type: 'SET_DRAFT', patch: { category: lbl } }); }}
                  style={{
                    height: 30, padding: '0 12px', borderRadius: 8, cursor: 'pointer',
                    fontFamily: 'var(--font-geist-sans)', fontSize: 12.5,
                    background: on ? 'rgba(255,255,255,.10)' : hov ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.03)',
                    border: `1px solid ${on ? 'rgba(255,255,255,.28)' : hov ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.09)'}`,
                    color: on ? '#f4f4f4' : hov ? '#d8d8d8' : '#a6a6a6',
                    transition: 'background .15s, border-color .15s, color .15s',
                  }}>
                  {lbl}
                </button>
              );
            })}
            <button
              onMouseEnter={() => setHovDashed(true)}
              onMouseLeave={() => setHovDashed(false)}
              onClick={() => dispatch({ type: 'SET_CAT_MODE', catMode: 'new' })}
              style={{
                height: 30, padding: '0 12px', borderRadius: 8, cursor: 'pointer',
                fontFamily: 'var(--font-geist-sans)', fontSize: 12.5,
                background: catMode === 'new' ? 'rgba(255,255,255,.10)' : hovDashed ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.03)',
                border: `1px dashed ${catMode === 'new' ? 'rgba(255,255,255,.28)' : hovDashed ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.09)'}`,
                color: catMode === 'new' ? '#f4f4f4' : hovDashed ? '#d0d0d0' : '#a6a6a6',
                transition: 'background .15s, border-color .15s, color .15s',
              }}>
              + Nova categoria
            </button>
          </div>

          {catMode === 'new' && (
            <input value={draft.newCat} onChange={e => dispatch({ type: 'SET_DRAFT', patch: { newCat: e.target.value } })}
              placeholder="Nome da nova categoria"
              style={{ marginTop: 10, width: 280, maxWidth: '100%', height: 34, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, color: '#e8e8e8', fontFamily: 'var(--font-geist-sans)', fontSize: 13, padding: '0 12px', outline: 'none' }} />
          )}

          {sug && catMode !== 'new' && draft.category !== sug && (
            <button
              onMouseEnter={() => setSugHov(true)}
              onMouseLeave={() => setSugHov(false)}
              onClick={() => { dispatch({ type: 'SET_CAT_MODE', catMode: 'pick' }); dispatch({ type: 'SET_DRAFT', patch: { category: sug } }); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 12,
                height: 28, padding: '0 11px', borderRadius: 999, cursor: 'pointer',
                background: sugHov ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.1)',
                color: sugHov ? '#e0e0e0' : '#bdbdbd',
                fontFamily: 'var(--font-geist-sans)', fontSize: 12,
                transition: 'background .15s, color .15s',
              }}>
              <svg width="12" height="12" viewBox="0 0 15 15" fill="none" style={{ color: '#9a9a9a' }}>
                <path d="M7.5 1.5l1.6 4.1 4.4.2-3.4 2.8 1.2 4.2-3.8-2.4-3.8 2.4 1.2-4.2L1.5 5.8l4.4-.2z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
              Sugestão: <span style={{ color: '#e8e8e8', fontWeight: 500 }}>{sug}</span>
            </button>
          )}
        </div>

        {/* Title */}
        <input
          ref={titleRef}
          value={draft.title}
          onChange={e => dispatch({ type: 'SET_DRAFT', patch: { title: e.target.value } })}
          placeholder="Título da página"
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#f7f7f7', fontFamily: 'var(--font-geist-sans)', fontSize: 32, fontWeight: 600, letterSpacing: '-.022em', lineHeight: 1.15, padding: 0, marginBottom: 28 }}
        />

        {/* Block editor */}
        <BlockEditor
          key={draft.editingId ?? 'new'}
          initialMd={draft.body}
          onChange={handleBodyChange}
        />

        {/* Markdown hints */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#6f6f6f', fontFamily: 'var(--font-geist-mono)' }}>
          <span style={{ color: '#9a9a9a' }}>##</span> seção
          <span style={{ opacity: .4 }}>·</span>
          <span style={{ color: '#9a9a9a' }}>-</span> lista
          <span style={{ opacity: .4 }}>·</span>
          <span style={{ color: '#9a9a9a' }}>&gt;</span> nota
          <span style={{ opacity: .4 }}>·</span>
          <span style={{ color: '#9a9a9a' }}>```</span> código
          <span style={{ opacity: .4 }}>·</span>
          <span style={{ color: '#6f6f6f' }}>Enter para novo bloco</span>
        </div>
      </div>
      </div>
    </div>
  );
}
