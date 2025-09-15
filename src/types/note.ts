export type NoteFormat = 'plain' | 'markdown';

export interface Note {
  id: string;
  title: string;
  body: string;
  course?: string;
  tags: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
  format?: NoteFormat; // default plain if undefined
}

export interface NotesStateMeta {
  lastExport?: string;
  theme?: 'light' | 'dark';
}

export interface NotesBundle {
  version: 1;
  notes: Note[];
  meta: NotesStateMeta;
}
