export type BlockType = 'lead' | 'h2' | 'p' | 'ul' | 'code' | 'callout';
export type CalloutVariant = 'tip' | 'warn' | 'info';

export interface Block {
  type: BlockType;
  text?: string;
  id?: string;
  lang?: string;
  items?: string[];
  variant?: CalloutVariant;
}

export interface DocData {
  category: string;
  updated: string;
  read: string;
  blocks: Block[];
}

export interface NavItem {
  id: string;
  title: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface UserDoc {
  id: string;
  title: string;
  category: string;
  body: string;
  created: number;
}

export type AppMode = 'read' | 'edit';
