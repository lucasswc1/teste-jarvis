'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import { AppMode, UserDoc } from '@/types';
import { buildNav, flatNav } from '@/lib/docs';

interface Draft {
  title: string;
  body: string;
  category: string;
  newCat: string;
  editingId: string | null; // null = nova nota, string = id sendo editado
}

interface State {
  activeId: string;
  mode: AppMode;
  navOpen: boolean;
  paletteOpen: boolean;
  pq: string;
  selIdx: number;
  activeHead: string;
  userDocs: UserDoc[];
  catMode: 'pick' | 'new';
  draft: Draft;
}

type Action =
  | { type: 'SET_ACTIVE'; id: string }
  | { type: 'SET_MODE'; mode: AppMode }
  | { type: 'TOGGLE_NAV' }
  | { type: 'SET_NAV'; open: boolean }
  | { type: 'OPEN_PALETTE' }
  | { type: 'CLOSE_PALETTE' }
  | { type: 'SET_PQ'; pq: string; selIdx?: number }
  | { type: 'MOVE_SEL'; delta: number; max: number }
  | { type: 'SET_ACTIVE_HEAD'; id: string }
  | { type: 'SET_USER_DOCS'; docs: UserDoc[] }
  | { type: 'SET_CAT_MODE'; catMode: 'pick' | 'new' }
  | { type: 'SET_DRAFT'; patch: Partial<Draft> }
  | { type: 'OPEN_EDITOR_NEW' }
  | { type: 'OPEN_EDITOR_EDIT'; doc: UserDoc; catMode: 'pick' | 'new' }
  | { type: 'MOVE_DOC_CATEGORY'; docId: string; newCategory: string }
  | { type: 'DELETE_CATEGORY'; category: string };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'SET_ACTIVE':    return { ...s, activeId: a.id, navOpen: false, paletteOpen: false };
    case 'SET_MODE':      return { ...s, mode: a.mode };
    case 'TOGGLE_NAV':   return { ...s, navOpen: !s.navOpen };
    case 'SET_NAV':      return { ...s, navOpen: a.open };
    case 'OPEN_PALETTE': return { ...s, paletteOpen: true, pq: '', selIdx: 0 };
    case 'CLOSE_PALETTE':return { ...s, paletteOpen: false };
    case 'SET_PQ':       return { ...s, pq: a.pq, selIdx: a.selIdx ?? 0 };
    case 'MOVE_SEL':     return { ...s, selIdx: ((s.selIdx + a.delta) % a.max + a.max) % a.max };
    case 'SET_ACTIVE_HEAD': return { ...s, activeHead: a.id };
    case 'SET_USER_DOCS':return { ...s, userDocs: a.docs };
    case 'SET_CAT_MODE': return { ...s, catMode: a.catMode };
    case 'SET_DRAFT':    return { ...s, draft: { ...s.draft, ...a.patch } };
    case 'OPEN_EDITOR_NEW': return {
      ...s, mode: 'edit', navOpen: false, paletteOpen: false, catMode: 'pick',
      draft: { title: '', body: '', category: '', newCat: '', editingId: null },
    };
    case 'MOVE_DOC_CATEGORY': {
      const updated = s.userDocs.map(d => d.id === a.docId ? { ...d, category: a.newCategory } : d);
      try { localStorage.setItem('codex_userdocs', JSON.stringify(updated)); } catch {}
      return { ...s, userDocs: updated };
    }
    case 'DELETE_CATEGORY': {
      const updated = s.userDocs.map(d => d.category === a.category ? { ...d, category: 'Notas' } : d);
      try { localStorage.setItem('codex_userdocs', JSON.stringify(updated)); } catch {}
      return { ...s, userDocs: updated };
    }
    case 'OPEN_EDITOR_EDIT': return {
      ...s, mode: 'edit', navOpen: false, paletteOpen: false, catMode: a.catMode,
      draft: { title: a.doc.title, body: a.doc.body, category: a.doc.category, newCat: '', editingId: a.doc.id },
    };
    default: return s;
  }
}

const INITIAL: State = {
  activeId: 'testes', mode: 'read', navOpen: false,
  paletteOpen: false, pq: '', selIdx: 0, activeHead: '',
  userDocs: [], catMode: 'pick',
  draft: { title: '', body: '', category: '', newCat: '', editingId: null },
};

interface Ctx {
  state: State;
  dispatch: React.Dispatch<Action>;
  nav: ReturnType<typeof buildNav>;
  flat: ReturnType<typeof flatNav>;
}

const CodexCtx = createContext<Ctx>(null!);

export function CodexProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('codex_userdocs') || '[]');
      dispatch({ type: 'SET_USER_DOCS', docs: saved });
    } catch {}
  }, []);

  const nav = buildNav(state.userDocs);
  const flat = flatNav(nav);

  return <CodexCtx.Provider value={{ state, dispatch, nav, flat }}>{children}</CodexCtx.Provider>;
}

export function useCodex() {
  return useContext(CodexCtx);
}
