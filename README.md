# Códex

Minisite de documentação pessoal com editor estilo Notion. Construído com Next.js 16, TypeScript e Tailwind CSS.

## Stack

- **Next.js 16.2.9** — App Router
- **TypeScript**
- **Tailwind CSS v4**
- **Geist** — fonte da Vercel

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## Build de produção

```bash
npm run build
npm run start
```

## Estrutura do projeto

```
src/
├── app/
│   ├── globals.css       # Estilos globais e animações
│   ├── layout.tsx
│   └── page.tsx          # Entrada da aplicação
├── components/
│   ├── BlockEditor.tsx   # Editor estilo Notion (blocos live)
│   ├── CommandPalette.tsx
│   ├── ConfirmDialog.tsx
│   ├── DocReader.tsx     # Visualizador de documentos
│   ├── Editor.tsx        # Wrapper do editor com toolbar
│   ├── Header.tsx
│   └── Sidebar.tsx       # Navegação com drag & drop
├── context/
│   └── CodexContext.tsx  # Estado global (useReducer)
├── hooks/
│   └── useHover.ts
├── lib/
│   └── docs.ts           # Dados base e parser de markdown
└── types/
    └── index.ts
```

## Funcionalidades

- Editor de blocos em tempo real (markdown → estilos ao digitar)
- Criar, editar e excluir notas pessoais
- Drag & drop de notas entre categorias na sidebar
- Busca com Command Palette (`⌘K`)
- Notas persistidas em `localStorage`
- Suporte a: parágrafos, títulos, listas, blocos de código e callouts
