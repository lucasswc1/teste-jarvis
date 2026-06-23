'use client';

import { CodexProvider, useCodex } from '@/context/CodexContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import DocReader from '@/components/DocReader';
import Editor from '@/components/Editor';
import CommandPalette from '@/components/CommandPalette';

function CodexApp() {
  const { state } = useCodex();
  return (
    <div style={{ height: '100vh', position: 'relative', background: '#0a0a0b', color: '#e8e8e8', overflow: 'hidden' }}>
      <Header />
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <Sidebar />
        {state.mode === 'read' ? <DocReader /> : <Editor />}
      </div>
      <CommandPalette />
    </div>
  );
}

export default function Home() {
  return (
    <CodexProvider>
      <CodexApp />
    </CodexProvider>
  );
}
