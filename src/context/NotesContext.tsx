'use client';
import { createContext, useContext, useMemo, useRef, useState, useCallback } from 'react';
import { Note, NotesBundle } from '@/types/note';
// dynamic import helper for nanoid (ESM) to avoid CJS interop issue during build
let _nanoid: ((size?: number) => string) | null = null;
async function getNanoid() {
  if (_nanoid) return _nanoid;
  const lib = await import('nanoid');
  _nanoid = (lib as any).nanoid || (lib as any).default;
  return _nanoid!;
}

interface NotesContextValue {
  notes: Note[];
  createNote(partial?: Partial<Note>): Note;
  updateNote(id: string, patch: Partial<Note>): void;
  deleteNote(id: string): void;
  importBundle(json: string): { ok: boolean; error?: string };
  exportBundle(): string;
  filtered: Note[];
  search: string;
  setSearch(v: string): void;
  courseFilter: string;
  setCourseFilter(v: string): void;
  toggleTagFilter(tag: string): void;
  activeTagFilters: string[];
  theme: 'light' | 'dark';
  toggleTheme(): void;
}

const NotesContext = createContext<NotesContextValue | undefined>(undefined);
const STORAGE_KEY = 'catatan.notes.v1';

interface PersistState {
  notes: Note[];
  meta?: { theme?: 'light' | 'dark' };
}

function loadInitial(): PersistState {
  if (typeof window === 'undefined') return { notes: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { notes: [] };
    return JSON.parse(raw) as PersistState;
  } catch {
    return { notes: [] };
  }
}

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const initial = loadInitial();
  const [notes, setNotes] = useState<Note[]>(initial.notes);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (initial.meta?.theme) return initial.meta.theme;
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);

  // Debounce persist
  const persistRef = useRef<number | null>(null);
  const schedulePersist = () => {
    if (persistRef.current) window.clearTimeout(persistRef.current);
    persistRef.current = window.setTimeout(() => {
      try {
        const data: PersistState = { notes, meta: { theme } };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {}
    }, 400);
  };

  const createNote = (partial: Partial<Note> = {}): Note => {
    const now = new Date().toISOString();
    // use synchronous fallback id while dynamic import resolves (first call)
    const fallback = Math.random().toString(36).slice(2, 12);
    const note: Note = {
      id: fallback,
      title: partial.title || 'Catatan Baru',
      body: partial.body || '',
      course: partial.course || '',
      tags: partial.tags || [],
      createdAt: now,
      updatedAt: now,
      format: partial.format || 'plain',
    };
    setNotes((prev: Note[]) => [note, ...prev]);
    schedulePersist();
    // upgrade id once nanoid loaded (non-critical)
    getNanoid().then((gen) => {
      setNotes((prev: Note[]) => prev.map((n) => (n === note ? { ...n, id: gen(10) } : n)));
      schedulePersist();
    });
    return note;
  };

  const updateNote = (id: string, patch: Partial<Note>) => {
    setNotes((prev: Note[]) =>
      prev.map((n: Note) =>
        n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n,
      ),
    );
    schedulePersist();
  };

  const deleteNote = (id: string) => {
    setNotes((prev: Note[]) => prev.filter((n: Note) => n.id !== id));
    schedulePersist();
  };

  const toggleTheme = () => {
    setTheme((t: 'light' | 'dark') => (t === 'light' ? 'dark' : 'light'));
    schedulePersist();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return notes.filter((n: Note) => {
      const matchesSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.tags.some((t: string) => t.toLowerCase().includes(q));
      const matchesCourse =
        !courseFilter || (n.course || '').toLowerCase() === courseFilter.toLowerCase();
      const matchesTags =
        activeTagFilters.length === 0 ||
        activeTagFilters.every((tag: string) => n.tags.includes(tag));
      return matchesSearch && matchesCourse && matchesTags;
    });
  }, [notes, search, courseFilter, activeTagFilters]);

  const toggleTagFilter = (tag: string) => {
    setActiveTagFilters((prev: string[]) =>
      prev.includes(tag) ? prev.filter((t: string) => t !== tag) : [...prev, tag],
    );
  };

  const importBundle = (json: string) => {
    try {
      const parsed = JSON.parse(json) as NotesBundle | { notes: Note[] };
      const incoming = (parsed as any).notes as Note[];
      if (!Array.isArray(incoming)) return { ok: false, error: 'Format tidak valid' };
      // Basic shape validation
      const sanitized = incoming.filter((n) => n && n.id && n.title !== undefined);
      setNotes(sanitized.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)));
      schedulePersist();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  };

  const exportBundle = () => {
    const bundle: NotesBundle = { version: 1, notes, meta: { theme } } as any;
    return JSON.stringify(bundle, null, 2);
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        createNote,
        updateNote,
        deleteNote,
        importBundle,
        exportBundle,
        filtered,
        search,
        setSearch,
        courseFilter,
        setCourseFilter,
        toggleTagFilter,
        activeTagFilters,
        theme,
        toggleTheme,
      }}
    >
      <ThemeApplier theme={theme} />
      {children}
    </NotesContext.Provider>
  );
}

function ThemeApplier({ theme }: { theme: 'light' | 'dark' }) {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }
  return null;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}
