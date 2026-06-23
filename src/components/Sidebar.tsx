'use client';

import { useState } from 'react';
import { useCodex } from '@/context/CodexContext';
import ConfirmDialog from '@/components/ConfirmDialog';

const BASE_CAT_LABELS = ['Começando', 'Desenvolvimento', 'Infraestrutura', 'Design', 'Notas'];

type ConfirmState =
  | { kind: 'move'; docId: string; docTitle: string; targetCat: string }
  | { kind: 'delete_cat'; category: string; docCount: number };

export default function Sidebar() {
  const { state, dispatch, nav } = useCodex();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [hoveredNavId, setHoveredNavId] = useState<string | null>(null);
  const [hoveredCatLabel, setHoveredCatLabel] = useState<string | null>(null);

  const userDocIds = new Set(state.userDocs.map(d => d.id));

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  }
  function handleDragOver(e: React.DragEvent, catLabel: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(catLabel);
  }
  function handleDrop(e: React.DragEvent, catLabel: string) {
    e.preventDefault();
    setDropTarget(null);
    if (!draggedId) return;
    const doc = state.userDocs.find(d => d.id === draggedId);
    if (!doc || doc.category === catLabel) { setDraggedId(null); return; }
    setConfirm({ kind: 'move', docId: draggedId, docTitle: doc.title, targetCat: catLabel });
    setDraggedId(null);
  }
  function handleDragEnd() { setDraggedId(null); setDropTarget(null); }

  function handleConfirm() {
    if (!confirm) return;
    if (confirm.kind === 'move')
      dispatch({ type: 'MOVE_DOC_CATEGORY', docId: confirm.docId, newCategory: confirm.targetCat });
    if (confirm.kind === 'delete_cat')
      dispatch({ type: 'DELETE_CATEGORY', category: confirm.category });
    setConfirm(null);
  }

  return (
    <>
      {state.navOpen && (
        <div className="cx-scrim" onClick={() => dispatch({ type: 'SET_NAV', open: false })}
          style={{ display: 'none', position: 'fixed', inset: '57px 0 0 0', background: 'rgba(0,0,0,.5)', zIndex: 35 }} />
      )}

      <aside className="cx-sidebar cx-scroll" data-open={String(state.navOpen)}
        style={{ width: 284, flex: 'none', borderRight: '1px solid rgba(255,255,255,.07)', overflowY: 'auto', padding: '77px 12px 40px', background: '#0a0a0b' }}>

        {nav.map(sec => {
          const isCustom = !BASE_CAT_LABELS.includes(sec.label);
          const userDocsInCat = state.userDocs.filter(d => d.category === sec.label);
          const isDrop = dropTarget === sec.label;
          const catHov = hoveredCatLabel === sec.label;

          return (
            <div key={sec.label} style={{ marginBottom: 18 }}
              onDragOver={e => handleDragOver(e, sec.label)}
              onDragLeave={() => setDropTarget(null)}
              onDrop={e => handleDrop(e, sec.label)}
            >
              {/* Category header */}
              <div
                onMouseEnter={() => setHoveredCatLabel(sec.label)}
                onMouseLeave={() => setHoveredCatLabel(null)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '4px 10px', marginBottom: 6, borderRadius: 7,
                  background: isDrop ? 'rgba(255,255,255,.05)' : 'transparent',
                  border: isDrop ? '1px dashed rgba(255,255,255,.16)' : '1px solid transparent',
                  transition: 'background .15s, border-color .15s',
                }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase',
                  color: isDrop ? '#d0d0d0' : '#6f6f6f',
                  transition: 'color .15s',
                }}>
                  {sec.label}
                </span>
                {isCustom && (
                  <button
                    onClick={() => setConfirm({ kind: 'delete_cat', category: sec.label, docCount: userDocsInCat.length })}
                    title="Excluir categoria"
                    style={{
                      opacity: catHov ? 1 : 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 20, height: 20, borderRadius: 5, background: 'transparent',
                      border: 'none', cursor: 'pointer', padding: 0, color: '#6f6f6f',
                      transition: 'opacity .15s',
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 15 15" fill="none">
                      <path d="M5 5l5 5M10 5l-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Nav items */}
              {sec.items.map(it => {
                const on = it.id === state.activeId;
                const isUserDoc = userDocIds.has(it.id);
                const isDragging = draggedId === it.id;
                const navHov = hoveredNavId === it.id;

                return (
                  <div key={it.id}
                    draggable={isUserDoc}
                    onDragStart={isUserDoc ? e => handleDragStart(e, it.id) : undefined}
                    onDragEnd={isUserDoc ? handleDragEnd : undefined}
                    style={{
                      display: 'flex', alignItems: 'center',
                      opacity: isDragging ? 0.3 : 1,
                      transition: 'opacity .15s',
                      borderRadius: 7, marginBottom: 1,
                    }}
                  >
                    {/* Drag handle */}
                    <span
                      style={{
                        width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: navHov && isUserDoc ? 1 : 0,
                        cursor: 'grab', flex: 'none', color: '#5a5a5a',
                        transition: 'opacity .12s',
                        visibility: isUserDoc ? 'visible' : 'hidden',
                      }}
                    >
                      <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                        <circle cx="2" cy="2"  r="1.1" fill="currentColor"/>
                        <circle cx="6" cy="2"  r="1.1" fill="currentColor"/>
                        <circle cx="2" cy="6"  r="1.1" fill="currentColor"/>
                        <circle cx="6" cy="6"  r="1.1" fill="currentColor"/>
                        <circle cx="2" cy="10" r="1.1" fill="currentColor"/>
                        <circle cx="6" cy="10" r="1.1" fill="currentColor"/>
                      </svg>
                    </span>

                    <a
                      href="#"
                      onMouseEnter={() => setHoveredNavId(it.id)}
                      onMouseLeave={() => setHoveredNavId(null)}
                      onClick={e => { e.preventDefault(); dispatch({ type: 'SET_ACTIVE', id: it.id }); dispatch({ type: 'SET_NAV', open: false }); }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: 9,
                        textDecoration: 'none', fontSize: 13, lineHeight: 1,
                        padding: '7px 10px', borderRadius: 7,
                        color: on ? '#f4f4f4' : navHov ? '#e4e4e4' : '#a6a6a6',
                        background: on ? 'rgba(255,255,255,.06)' : navHov ? 'rgba(255,255,255,.05)' : 'transparent',
                        fontWeight: on ? 600 : 450,
                        transition: 'background .12s, color .12s',
                      }}
                    >
                      <span style={{
                        width: 5, height: 5, borderRadius: 999, flex: 'none',
                        background: on ? '#d6d6d6' : navHov ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.18)',
                        transition: 'background .12s',
                      }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {it.title}
                      </span>
                    </a>
                  </div>
                );
              })}
            </div>
          );
        })}
      </aside>

      {confirm && (
        <ConfirmDialog
          title={confirm.kind === 'move' ? 'Mover nota' : `Excluir "${confirm.category}"`}
          message={
            confirm.kind === 'move'
              ? `Mover "${confirm.docTitle}" para "${confirm.targetCat}"?`
              : confirm.docCount > 0
                ? `As ${confirm.docCount} nota${confirm.docCount > 1 ? 's' : ''} desta categoria serão movidas para "Notas". Esta ação não pode ser desfeita.`
                : `Excluir a categoria "${confirm.category}"? Esta ação não pode ser desfeita.`
          }
          confirmLabel={confirm.kind === 'move' ? 'Mover' : 'Excluir'}
          danger={confirm.kind === 'delete_cat'}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
