'use client';
import { useNotes } from '@/context/NotesContext';
import { useEffect, useState } from 'react';
import { Note } from '@/types/note';
import { relativeTime } from '@/lib/format';

interface Props {
  onSelect(id: string): void;
  activeId?: string;
}

export function NoteList({ onSelect, activeId }: Props) {
  const { filtered, toggleTagFilter, activeTagFilters, courseFilter, setCourseFilter } = useNotes();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const courses: string[] = Array.from(
    new Set(filtered.map((n: Note) => (n.course || '').trim()).filter((c: string) => !!c)),
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b dark:border-neutral-800 space-y-3 bg-white/50 dark:bg-neutral-900/40 backdrop-blur-sm sticky top-0 z-30">
        <CourseFilterDropdown
          mounted={mounted}
          value={courseFilter}
          options={courses}
          onChange={(v: string) => setCourseFilter(v)}
        />
        {activeTagFilters.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {activeTagFilters.map((tag: string) => (
              <button
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className="tag tag-interactive"
                title={`Hapus filter ${tag}`}
              >
                {tag} (x)
              </button>
            ))}
          </div>
        )}
      </div>
      <ul className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.map((note: Note) => (
          <NoteRow key={note.id} note={note} onSelect={onSelect} active={note.id === activeId} />
        ))}
        {filtered.length === 0 && <li className="p-4 text-sm opacity-70">Tidak ada catatan.</li>}
      </ul>
    </div>
  );
}

interface CourseFilterDropdownProps {
  mounted: boolean;
  value: string;
  options: string[];
  onChange(value: string): void;
}

function CourseFilterDropdown({ mounted, value, options, onChange }: CourseFilterDropdownProps) {
  const [open, setOpen] = useState(false);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.('[data-course-filter-root]')) {
        setOpen(false);
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [open]);

  const label = value || 'Semua Mata Kuliah';
  const allOptions = [''].concat(options.filter((o) => o !== ''));

  return (
    <div className="relative min-w-[160px]" data-course-filter-root>
      <button
        type="button"
        disabled={!mounted}
        onClick={() => mounted && setOpen((o) => !o)}
        className={`btn text-xs px-3 w-full justify-between ${!mounted ? 'opacity-0 pointer-events-none select-none' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filter mata kuliah"
      >
        <span className="truncate">{label}</span>
        <span className="opacity-60 text-[10px]">{open ? '▲' : '▼'}</span>
      </button>
      {open && mounted && (
        <ul
          role="listbox"
          className="absolute mt-1 w-full z-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-md overflow-auto max-h-64 animate-scale-in"
        >
          {allOptions.length === 1 && (
            <li className="px-3 py-1.5 text-xs opacity-50 select-none">(Tidak ada mata kuliah)</li>
          )}
          {allOptions.map((opt) => {
            const isActive = opt === value || (opt === '' && value === '');
            return (
              <li
                key={opt || '__ALL__'}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`px-3 py-1.5 text-xs cursor-pointer select-none hover:bg-brand-50 dark:hover:bg-brand-700/30 ${isActive ? 'bg-brand-100/70 dark:bg-brand-700/40 font-medium' : ''}`}
              >
                {opt || 'Semua Mata Kuliah'}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function NoteRow({
  note,
  onSelect,
  active,
}: {
  note: Note;
  onSelect(id: string): void;
  active: boolean;
}) {
  const updated = relativeTime(note.updatedAt || note.createdAt);
  return (
    <li
      onClick={() => onSelect(note.id)}
      className={`surface-soft border border-transparent hover:border-brand-300 dark:hover:border-brand-600 transition cursor-pointer p-3 rounded-lg group shadow-sm hover:shadow-md ${active ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-neutral-900' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-medium text-sm line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400">
          {note.title || 'Tanpa Judul'}
        </h3>
        {note.course && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-300 uppercase tracking-wide">
            {note.course}
          </span>
        )}
      </div>
      <p className="text-[11px] leading-snug line-clamp-2 opacity-70 mb-1">
        {note.body.replace(/\n+/g, ' ').slice(0, 160)}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
          {note.tags.length > 4 && (
            <span className="text-[10px] opacity-60">+{note.tags.length - 4}</span>
          )}
        </div>
        <span className="text-[10px] opacity-50 whitespace-nowrap ml-2">{updated}</span>
      </div>
    </li>
  );
}
