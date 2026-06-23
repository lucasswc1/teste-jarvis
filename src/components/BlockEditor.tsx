'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { parseMd } from '@/lib/docs';

// ── Types ───────────────────────────────────────────────────────────────
type BlockKind = 'h2' | 'p' | 'li' | 'code' | 'callout';

interface EBlock {
  id: string;
  kind: BlockKind;
  text: string;
  lang?: string;
  variant?: 'tip' | 'warn' | 'info';
}

// ── Helpers ─────────────────────────────────────────────────────────────
let _uid = 0;
function uid() { return 'b' + (++_uid) + Math.random().toString(36).slice(2, 5); }

function mdToBlocks(md: string): EBlock[] {
  if (!md.trim()) return [{ id: uid(), kind: 'p', text: '' }];
  const parsed = parseMd(md);
  const result: EBlock[] = [];
  for (const b of parsed) {
    if (b.type === 'ul') {
      for (const item of (b.items || [])) result.push({ id: uid(), kind: 'li', text: item });
    } else if (b.type === 'h2') {
      result.push({ id: uid(), kind: 'h2', text: b.text || '' });
    } else if (b.type === 'code') {
      result.push({ id: uid(), kind: 'code', text: b.text || '', lang: b.lang || '' });
    } else if (b.type === 'callout') {
      result.push({ id: uid(), kind: 'callout', text: b.text || '', variant: b.variant || 'info' });
    } else {
      result.push({ id: uid(), kind: 'p', text: b.text || '' });
    }
  }
  return result.length ? result : [{ id: uid(), kind: 'p', text: '' }];
}

function blocksToMd(blocks: EBlock[]): string {
  const parts: string[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.kind === 'li') {
      const items: string[] = [];
      while (i < blocks.length && blocks[i].kind === 'li') {
        if (blocks[i].text.trim()) items.push(`- ${blocks[i].text}`);
        i++;
      }
      if (items.length) parts.push(items.join('\n'));
      continue;
    }
    if (b.kind === 'h2' && b.text.trim()) parts.push(`## ${b.text}`);
    else if (b.kind === 'code') parts.push(`\`\`\`${b.lang || ''}\n${b.text}\n\`\`\``);
    else if (b.kind === 'callout' && b.text.trim()) parts.push(`> ${b.text}`);
    else if (b.text.trim()) parts.push(b.text);
    i++;
  }
  return parts.join('\n\n');
}

function detectPrefix(text: string): { kind: BlockKind; text: string; lang?: string } | null {
  if (/^#{1,3} /.test(text)) return { kind: 'h2',      text: text.replace(/^#{1,3} /, '') };
  if (text.startsWith('> '))  return { kind: 'callout', text: text.slice(2) };
  if (text.startsWith('- '))  return { kind: 'li',      text: text.slice(2) };
  if (/^```(\w*)$/.test(text.trimEnd())) return { kind: 'code', text: '', lang: text.trimEnd().slice(3) };
  return null;
}

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

// ── Styles per block kind ────────────────────────────────────────────────
const KIND_INPUT_STYLE: Record<BlockKind, React.CSSProperties> = {
  h2:      { fontSize: 19, fontWeight: 600, letterSpacing: '-.012em', color: '#f1f1f1', lineHeight: 1.35 },
  p:       { fontSize: 14.5, lineHeight: 1.72, color: '#bdbdbd' },
  li:      { fontSize: 14.5, lineHeight: 1.6, color: '#bdbdbd' },
  code:    { fontFamily: 'var(--font-geist-mono)', fontSize: 12.5, lineHeight: 1.7, color: '#cfcfcf' },
  callout: { fontSize: 14, lineHeight: 1.6, color: '#c4c4c4' },
};

// ── Component ────────────────────────────────────────────────────────────
interface Props {
  initialMd?: string;
  onChange: (md: string) => void;
}

export default function BlockEditor({ initialMd, onChange }: Props) {
  const [blocks, setBlocks] = useState<EBlock[]>(() => mdToBlocks(initialMd || ''));
  const [animIds, setAnimIds] = useState<Set<string>>(new Set());
  const [codeHovered, setCodeHovered] = useState<string | null>(null);
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());
  const pendingFocusId = useRef<string | null>(null);
  const onChangeRef = useRef(onChange);
  const isFirstRender = useRef(true);
  const isMounted = useRef(false);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { isMounted.current = true; }, []);

  // Focus pending block after render
  useEffect(() => {
    if (pendingFocusId.current) {
      const el = blockRefs.current.get(pendingFocusId.current);
      if (el) {
        el.focus();
        if ('setSelectionRange' in el) {
          const len = (el as HTMLTextAreaElement).value?.length ?? 0;
          (el as HTMLTextAreaElement).setSelectionRange(len, len);
        }
      }
      pendingFocusId.current = null;
    }
  });

  // Auto-resize all textareas on mount (for populated editing)
  useEffect(() => {
    blockRefs.current.forEach(el => {
      if (el instanceof HTMLTextAreaElement) autoResize(el);
    });
  }, []);

  // Emit markdown on blocks change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    onChangeRef.current(blocksToMd(blocks));
  }, [blocks]);

  // ── Animation helpers ─────────────────────────────────────────────────
  function markNew(ids: string[]) {
    if (!isMounted.current) return;
    setAnimIds(prev => new Set([...prev, ...ids]));
    setTimeout(() => {
      setAnimIds(prev => {
        const n = new Set(prev);
        ids.forEach(id => n.delete(id));
        return n;
      });
    }, 380);
  }

  // ── Mutations ──────────────────────────────────────────────────────────
  const update = useCallback((id: string, patch: Partial<EBlock>) => {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, ...patch } : b));
  }, []);

  const insertAfter = useCallback((id: string, proto: Omit<EBlock, 'id'>) => {
    const nb = { ...proto, id: uid() } as EBlock;
    pendingFocusId.current = nb.id;
    markNew([nb.id]);
    setBlocks(bs => {
      const idx = bs.findIndex(b => b.id === id);
      const copy = [...bs];
      copy.splice(idx + 1, 0, nb);
      return copy;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = useCallback((id: string) => {
    setBlocks(bs => {
      if (bs.length === 1) return [{ id: bs[0].id, kind: 'p', text: '' }];
      const idx = bs.findIndex(b => b.id === id);
      if (idx > 0) pendingFocusId.current = bs[idx - 1].id;
      else if (bs.length > 1) pendingFocusId.current = bs[1].id;
      return bs.filter(b => b.id !== id);
    });
  }, []);

  // ── Event handlers ─────────────────────────────────────────────────────
  function handleChange(id: string, text: string, el?: HTMLTextAreaElement) {
    const detected = detectPrefix(text);
    if (detected) {
      update(id, { kind: detected.kind, text: detected.text, lang: detected.lang ?? undefined });
      pendingFocusId.current = id;
    } else {
      update(id, { text });
    }
    if (el) autoResize(el);
  }

  function handleKeyDown(id: string, kind: BlockKind, e: React.KeyboardEvent, text: string) {
    if (e.key === 'Enter') {
      if (kind === 'code') {
        setTimeout(() => {
          const el = blockRefs.current.get(id);
          if (el instanceof HTMLTextAreaElement) autoResize(el);
        }, 0);
        return;
      }
      if (!e.shiftKey) {
        e.preventDefault();
        if (kind === 'li') {
          if (!text.trim()) update(id, { kind: 'p', text: '' });
          else insertAfter(id, { kind: 'li', text: '' });
        } else {
          insertAfter(id, { kind: 'p', text: '' });
        }
      }
    }
    if (e.key === 'Backspace') {
      if (!text) { e.preventDefault(); remove(id); }
    }
    if (e.key === 'Tab' && kind === 'code') {
      e.preventDefault();
      const ta = e.currentTarget as HTMLTextAreaElement;
      const s = ta.selectionStart, en = ta.selectionEnd;
      const newText = text.substring(0, s) + '  ' + text.substring(en);
      update(id, { text: newText });
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 2; }, 0);
    }
  }

  // ── Paste handler: parse multi-line markdown into multiple blocks ───────
  function handlePaste(id: string, e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData('text/plain');
    if (!text.includes('\n')) return; // single-line → let browser handle normally

    const parsed = mdToBlocks(text);
    // Only intercept if we got more than 1 block OR the text has markdown structure
    const hasStructure = /^#{1,3} |^> |^- |^```/.test(text);
    if (parsed.length <= 1 && !hasStructure) return;

    e.preventDefault();

    const ids = parsed.map(b => b.id);
    pendingFocusId.current = ids[ids.length - 1];
    markNew(ids);

    setBlocks(bs => {
      const idx = bs.findIndex(b => b.id === id);
      const copy = [...bs];
      // Replace current block if empty, otherwise insert after
      if (!copy[idx]?.text.trim()) {
        copy.splice(idx, 1, ...parsed);
      } else {
        copy.splice(idx + 1, 0, ...parsed);
      }
      return copy;
    });
  }

  function registerRef(id: string) {
    return (el: HTMLElement | null) => {
      if (el) blockRefs.current.set(id, el);
      else blockRefs.current.delete(id);
    };
  }

  // ── Render ─────────────────────────────────────────────────────────────
  const nodes: React.ReactNode[] = [];
  let i = 0;
  const base: React.CSSProperties = {
    background: 'transparent', border: 'none', outline: 'none',
    fontFamily: 'var(--font-geist-sans)', padding: 0, width: '100%',
  };

  while (i < blocks.length) {
    const b = blocks[i];
    const isNew = animIds.has(b.id);

    // ── List items — group adjacent ──────────────────────────────────────
    if (b.kind === 'li') {
      const group: EBlock[] = [];
      const groupStart = b.id;
      while (i < blocks.length && blocks[i].kind === 'li') { group.push(blocks[i]); i++; }
      const groupNew = group.some(li => animIds.has(li.id));
      nodes.push(
        <ul key={groupStart} className={groupNew ? 'cx-block-in' : ''}
          style={{ margin: '0 0 18px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {group.map(li => (
            <li key={li.id} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: '#6e6e6e', marginTop: 10, flex: 'none' }} />
              <input
                ref={registerRef(li.id) as React.RefCallback<HTMLInputElement>}
                value={li.text}
                onChange={e => handleChange(li.id, e.target.value)}
                onKeyDown={e => handleKeyDown(li.id, 'li', e, li.text)}
                onPaste={e => handlePaste(li.id, e as unknown as React.ClipboardEvent<HTMLTextAreaElement>)}
                placeholder="Item da lista"
                style={{ ...base, ...KIND_INPUT_STYLE.li, flex: 1 }}
              />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Heading H2 ───────────────────────────────────────────────────────
    if (b.kind === 'h2') {
      nodes.push(
        <input key={b.id}
          ref={registerRef(b.id) as React.RefCallback<HTMLInputElement>}
          value={b.text}
          onChange={e => handleChange(b.id, e.target.value)}
          onKeyDown={e => handleKeyDown(b.id, 'h2', e, b.text)}
          placeholder="Título de seção"
          className={isNew ? 'cx-block-in' : ''}
          style={{ ...base, ...KIND_INPUT_STYLE.h2, display: 'block', margin: '38px 0 12px' }}
        />
      );
      i++; continue;
    }

    // ── Code block ───────────────────────────────────────────────────────
    if (b.kind === 'code') {
      const codeHov = codeHovered === b.id;
      nodes.push(
        <div key={b.id} className={isNew ? 'cx-block-in' : ''}
          style={{ margin: '0 0 22px', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, overflow: 'hidden', background: '#0d0d10' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <input
              value={b.lang || ''}
              onChange={e => update(b.id, { lang: e.target.value })}
              placeholder="linguagem"
              style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: '#838383', width: 100, padding: 0 }}
            />
            <button
              onMouseEnter={() => setCodeHovered(b.id)}
              onMouseLeave={() => setCodeHovered(null)}
              onClick={() => remove(b.id)}
              style={{ background: 'transparent', border: 'none', color: codeHov ? '#c6c6c6' : '#5c5c5c', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-geist-mono)', padding: 0, transition: 'color .12s' }}
            >
              remover
            </button>
          </div>
          <textarea
            ref={registerRef(b.id) as React.RefCallback<HTMLTextAreaElement>}
            value={b.text}
            onChange={e => { update(b.id, { text: e.target.value }); autoResize(e.target); }}
            onKeyDown={e => handleKeyDown(b.id, 'code', e, b.text)}
            placeholder="// código aqui…"
            className="cx-scroll"
            style={{ ...base, ...KIND_INPUT_STYLE.code, display: 'block', resize: 'none', padding: '14px 16px', minHeight: 80, overflow: 'hidden' }}
          />
        </div>
      );
      i++; continue;
    }

    // ── Callout ──────────────────────────────────────────────────────────
    if (b.kind === 'callout') {
      nodes.push(
        <div key={b.id} className={isNew ? 'cx-block-in' : ''}
          style={{ margin: '0 0 22px', display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 11, background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.10)' }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: '#cfcfcf', marginTop: 7, flex: 'none' }} />
          <div style={{ flex: 1 }}>
            <select
              value={b.variant || 'info'}
              onChange={e => update(b.id, { variant: e.target.value as 'tip' | 'warn' | 'info' })}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#cfcfcf', fontSize: 11.5, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 4, cursor: 'pointer', fontFamily: 'var(--font-geist-sans)', padding: 0, display: 'block' }}
            >
              <option value="info">Nota</option>
              <option value="tip">Dica</option>
              <option value="warn">Atenção</option>
            </select>
            <textarea
              ref={registerRef(b.id) as React.RefCallback<HTMLTextAreaElement>}
              value={b.text}
              onChange={e => { update(b.id, { text: e.target.value }); autoResize(e.target); }}
              onKeyDown={e => handleKeyDown(b.id, 'callout', e, b.text)}
              onPaste={e => handlePaste(b.id, e)}
              placeholder="Adicione uma nota…"
              style={{ ...base, ...KIND_INPUT_STYLE.callout, display: 'block', resize: 'none', minHeight: 24, overflow: 'hidden' }}
            />
          </div>
        </div>
      );
      i++; continue;
    }

    // ── Paragraph (default) ──────────────────────────────────────────────
    nodes.push(
      <textarea
        key={b.id}
        ref={registerRef(b.id) as React.RefCallback<HTMLTextAreaElement>}
        value={b.text}
        onChange={e => handleChange(b.id, e.target.value, e.target)}
        onKeyDown={e => handleKeyDown(b.id, 'p', e, b.text)}
        onPaste={e => handlePaste(b.id, e)}
        placeholder={i === 0
          ? 'Comece a escrever…  •  ## seção  •  - lista  •  > nota  •  ``` código'
          : 'Parágrafo…'}
        rows={1}
        className={isNew ? 'cx-block-in' : ''}
        style={{ ...base, ...KIND_INPUT_STYLE.p, display: 'block', resize: 'none', margin: '0 0 16px', overflow: 'hidden', minHeight: 26 }}
      />
    );
    i++;
  }

  function handleWrapperClick(e: React.MouseEvent) {
    if (e.target !== e.currentTarget) return;
    const last = blocks[blocks.length - 1];
    if (!last) return;
    if (last.text.trim()) insertAfter(last.id, { kind: 'p', text: '' });
    else blockRefs.current.get(last.id)?.focus();
  }

  return (
    <div onClick={handleWrapperClick} style={{ minHeight: 200, cursor: 'text' }}>
      {nodes}
      <div onClick={handleWrapperClick} style={{ minHeight: 60, cursor: 'text' }} />
    </div>
  );
}
