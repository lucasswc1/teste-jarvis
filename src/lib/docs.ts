import { Block, DocData, NavSection, UserDoc } from '@/types';

export const BASE_DOCS: Record<string, DocData> = {
  testes: {
    category: 'Desenvolvimento', updated: 'há 2 dias', read: '6 min',
    blocks: [
      { type: 'lead', text: 'Minhas anotações sobre como estruturo testes em projetos — da pirâmide à automação no CI. Pensado para servir de referência rápida quando começo algo novo.' },
      { type: 'h2', id: 'piramide', text: 'A pirâmide de testes' },
      { type: 'p', text: 'A ideia central é equilibrar custo e confiança. Muitos testes rápidos e baratos na base, poucos testes lentos e caros no topo. Inverter essa proporção é o caminho mais comum para uma suíte frágil e lenta.' },
      { type: 'ul', items: ['Unitários — rápidos, isolados, a maioria dos casos.', 'Integração — verificam fronteiras entre módulos e serviços.', 'End-to-end — validam fluxos reais do usuário, poucos e críticos.'] },
      { type: 'callout', variant: 'tip', text: 'Se um teste demora mais de alguns milissegundos, provavelmente ele não é unitário — repense as dependências antes de adicioná-lo à base.' },
      { type: 'h2', id: 'unitarios', text: 'Testes unitários' },
      { type: 'p', text: 'Escrevo unitários focados em comportamento observável, não em detalhes de implementação. Isso mantém a suíte resistente a refatorações: o teste só quebra quando o contrato muda de fato.' },
      { type: 'code', lang: 'typescript', text: 'test("aplica desconto progressivo", () => {\n  const cart = new Cart([{ price: 100, qty: 3 }]);\n  expect(cart.total()).toBe(255); // 15% acima de 2 itens\n});' },
      { type: 'h2', id: 'integracao', text: 'Testes de integração' },
      { type: 'p', text: 'Aqui o objetivo é confiar nas fronteiras: banco de dados, filas, APIs externas. Uso containers efêmeros para subir dependências reais em vez de mocks frágeis sempre que o custo permite.' },
      { type: 'callout', variant: 'warn', text: 'Evite compartilhar estado entre testes de integração. Cada caso deve preparar e limpar seus próprios dados — flakiness quase sempre nasce daqui.' },
      { type: 'h2', id: 'e2e', text: 'Testes end-to-end' },
      { type: 'p', text: 'Reservo o E2E para os caminhos que, se quebrarem, derrubam o produto: autenticação, checkout, onboarding. São poucos, rodam contra um ambiente próximo de produção e servem como alarme final.' },
      { type: 'h2', id: 'ci', text: 'Automação no CI' },
      { type: 'p', text: 'Toda a suíte roda em paralelo no pipeline. Unitários e lint em cada push; integração e E2E em pull requests e antes do deploy. O sinal precisa ser rápido para ser confiável.' },
      { type: 'code', lang: 'yaml', text: 'jobs:\n  test:\n    strategy:\n      matrix: { shard: [1, 2, 3, 4] }\n    steps:\n      - run: pnpm test --shard=${{ matrix.shard }}/4' },
    ],
  },
  overview: {
    category: 'Começando', updated: 'há 1 semana', read: '2 min',
    blocks: [
      { type: 'lead', text: 'Este é o meu cofre de conhecimento — um lugar único para consolidar tudo que aprendo e quero reencontrar depois, sem depender da memória.' },
      { type: 'h2', id: 'porque', text: 'Por que existe' },
      { type: 'p', text: 'Anotações espalhadas em arquivos, READMEs e mensagens se perdem. Aqui cada assunto vive em um lugar previsível, com busca rápida e leitura confortável.' },
      { type: 'h2', id: 'como-uso', text: 'Como eu uso' },
      { type: 'ul', items: ['Capturo o aprendizado enquanto ainda está fresco.', 'Reviso e refino quando volto ao tema.', 'Conecto tópicos relacionados com links internos.'] },
    ],
  },
  git: {
    category: 'Desenvolvimento', updated: 'há 4 dias', read: '4 min',
    blocks: [
      { type: 'lead', text: 'O fluxo de Git que adoto para manter o histórico legível e os deploys previsíveis.' },
      { type: 'h2', id: 'branches', text: 'Branches' },
      { type: 'p', text: 'Trunk-based com branches curtas. Nada vive isolado por mais de um ou dois dias — integrações longas só acumulam conflito.' },
      { type: 'code', lang: 'bash', text: 'git switch -c feat/busca-fuzzy\n# ...commits pequenos e descritivos\ngit rebase main\ngit push -u origin HEAD' },
      { type: 'h2', id: 'commits', text: 'Mensagens de commit' },
      { type: 'p', text: 'Sigo Conventional Commits. O prefixo padroniza o changelog e deixa claro o tipo da mudança num relance.' },
      { type: 'callout', variant: 'info', text: 'Um commit deve contar uma história completa e reversível. Se você não consegue resumi-lo em uma linha, provavelmente são dois commits.' },
    ],
  },
  tokens: {
    category: 'Design', updated: 'há 3 semanas', read: '3 min',
    blocks: [
      { type: 'lead', text: 'Como organizo design tokens para que tema e escala fiquem consistentes entre produtos.' },
      { type: 'h2', id: 'camadas', text: 'Camadas de tokens' },
      { type: 'ul', items: ['Primitivos — valores crus (cores, espaçamentos).', 'Semânticos — intenção (superfície, texto, borda).', 'Componente — específicos de um componente.'] },
      { type: 'h2', id: 'cor', text: 'Cor' },
      { type: 'p', text: 'Defino cores em OKLCH para manter contraste perceptual constante ao gerar variações de tema claro e escuro a partir da mesma base.' },
      { type: 'code', lang: 'css', text: '--surface: oklch(0.16 0.004 270);\n--text:    oklch(0.94 0.004 270);\n--accent:  oklch(0.66 0.16 285);' },
    ],
  },
};

export const BASE_NAV: NavSection[] = [
  { label: 'Começando',     items: [{ id: 'overview', title: 'Visão geral' }, { id: 'estrutura', title: 'Estrutura do cofre' }] },
  { label: 'Desenvolvimento', items: [{ id: 'padroes', title: 'Padrões de código' }, { id: 'git', title: 'Fluxo de Git' }, { id: 'testes', title: 'Estratégia de testes' }] },
  { label: 'Infraestrutura', items: [{ id: 'docker', title: 'Docker' }, { id: 'cicd', title: 'CI / CD' }, { id: 'observabilidade', title: 'Observabilidade' }] },
  { label: 'Design',        items: [{ id: 'tokens', title: 'Design tokens' }, { id: 'a11y', title: 'Acessibilidade' }] },
  { label: 'Notas',         items: [{ id: 'leituras', title: 'Leituras' }, { id: 'ideias', title: 'Ideias soltas' }] },
];

export function buildNav(userDocs: UserDoc[]): NavSection[] {
  const sections = BASE_NAV.map(s => ({ label: s.label, items: [...s.items] }));
  userDocs.forEach(u => {
    let sec = sections.find(s => s.label === u.category);
    if (!sec) { sec = { label: u.category, items: [] }; sections.push(sec); }
    if (!sec.items.find(i => i.id === u.id)) sec.items.push({ id: u.id, title: u.title });
  });
  return sections;
}

export function flatNav(nav: NavSection[]) {
  return nav.flatMap(s => s.items.map(i => ({ id: i.id, title: i.title, category: s.label })));
}

export function slug(s: string) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

export function readTime(body: string) {
  const w = (body || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(w / 200)) + ' min';
}

export function suggestCat(text: string): string | null {
  const t = ' ' + (text || '').toLowerCase() + ' ';
  const map: Record<string, string[]> = {
    'Desenvolvimento': ['test', 'git ', 'código', 'codigo', 'api', 'bug', 'refator', 'função', 'funcao', 'typescript', 'javascript', 'lint', 'commit', 'branch', 'deploy'],
    'Infraestrutura': ['docker', 'kubernetes', 'ci/cd', ' ci ', ' cd ', 'pipeline', 'servidor', 'observ', 'infra', 'container', 'nginx', 'cloud', 'terraform', 'log'],
    'Design': ['design', 'token', 'cor ', 'color', 'figma', ' ui ', ' ux ', 'acess', 'a11y', 'tipograf', 'layout', 'componente'],
    'Começando': ['introdu', 'visão', 'visao', 'overview', 'guia', 'primeiros passos'],
  };
  let best: string | null = null, score = 0;
  for (const cat in map) {
    const sc = map[cat].reduce((a, k) => a + (t.includes(k) ? 1 : 0), 0);
    if (sc > score) { score = sc; best = cat; }
  }
  return best;
}

export function parseMd(text: string): Block[] {
  const lines = (text || '').replace(/\r/g, '').split('\n');
  const blocks: Block[] = [];
  let i = 0; let firstPara = true;
  const makeSlug = (s: string) => slug(s) || ('s' + blocks.length);
  while (i < lines.length) {
    const ln = lines[i];
    if (/^```/.test(ln.trim())) {
      const lang = ln.trim().slice(3).trim() || 'texto'; const buf: string[] = []; i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) { buf.push(lines[i]); i++; }
      i++; blocks.push({ type: 'code' as const, lang, text: buf.join('\n') }); continue;
    }
    if (/^#{1,3}\s+/.test(ln)) {
      const tt = ln.replace(/^#{1,3}\s+/, '').trim();
      blocks.push({ type: 'h2' as const, id: makeSlug(tt), text: tt }); i++; continue;
    }
    if (/^>\s?/.test(ln)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      blocks.push({ type: 'callout' as const, variant: 'info' as const, text: buf.join(' ').trim() }); continue;
    }
    if (/^[-*]\s+/.test(ln)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^[-*]\s+/, '').trim()); i++; }
      blocks.push({ type: 'ul' as const, items }); continue;
    }
    if (ln.trim() === '') { i++; continue; }
    const buf = [ln]; i++;
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,3}\s|>\s?|[-*]\s|```)/.test(lines[i])) { buf.push(lines[i]); i++; }
    blocks.push({ type: firstPara ? 'lead' as const : 'p' as const, text: buf.join(' ').trim() });
    firstPara = false;
  }
  if (!blocks.length) blocks.push({ type: 'p' as const, text: '(Sem conteúdo ainda.)' });
  return blocks;
}
