'use client';
import { useEffect, useState } from 'react';
import { exportNoteToTxt, exportNoteToPdf } from '@/lib/exporters';
import { useNotes } from '@/context/NotesContext';
import { Note, NoteFormat } from '@/types/note';

interface Props {
  id?: string;
}

export function NoteEditor({ id }: Props) {
  const { notes, updateNote, deleteNote } = useNotes();
  const note = notes.find((n: Note) => n.id === id);
  const [local, setLocal] = useState<Note | null>(note || null);

  useEffect(() => {
    setLocal(note || null);
  }, [note]);

  useEffect(() => {
    if (!local) return;
    const handle = setTimeout(() => {
      updateNote(local.id, {
        title: local.title,
        body: local.body,
        course: local.course,
        tags: local.tags,
        format: local.format,
      });
    }, 400);
    return () => clearTimeout(handle);
  }, [local, updateNote]);

  if (!note) {
    return <div className="p-6 text-sm opacity-70">Pilih atau buat catatan baru.</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap gap-2 items-center p-3 border-b dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm sticky top-0 z-20">
        <input
          value={local?.title || ''}
          onChange={(e) => setLocal((l: Note | null) => (l ? { ...l, title: e.target.value } : l))}
          placeholder="Judul"
          className="input font-semibold text-lg flex-1 min-w-[200px]"
        />
        <input
          value={local?.course || ''}
          onChange={(e) => setLocal((l: Note | null) => (l ? { ...l, course: e.target.value } : l))}
          placeholder="Mata Kuliah"
          className="input max-w-[200px]"
        />
        <TagsEditor local={local} setLocal={setLocal} />
        <FormatSelector local={local} setLocal={setLocal} />
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => note && exportNoteToTxt(note)}
            className="btn btn-ghost text-xs"
            title="Ekspor sebagai TXT"
          >
            TXT
          </button>
          <button
            onClick={() => note && exportNoteToPdf(note)}
            className="btn btn-ghost text-xs"
            title="Ekspor sebagai PDF"
          >
            PDF
          </button>
          <button
            onClick={() => {
              if (confirm('Hapus catatan?')) deleteNote(note.id);
            }}
            className="btn btn-danger text-xs"
            title="Hapus catatan"
          >
            Hapus
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {local?.format !== 'markdown' && (
          <textarea
            value={local?.body || ''}
            onChange={(e) => setLocal((l: Note | null) => (l ? { ...l, body: e.target.value } : l))}
            placeholder="Tulis catatan di sini..."
            className="w-full bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-h-[500px] leading-relaxed text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600 shadow-sm"
          />
        )}
        {local?.format === 'markdown' && <MarkdownSplit local={local} setLocal={setLocal} />}
      </div>
    </div>
  );
}

function TagsEditor({
  local,
  setLocal,
}: {
  local: Note | null;
  setLocal: React.Dispatch<React.SetStateAction<Note | null>>;
}) {
  const [draft, setDraft] = useState('');
  if (!local) return null;
  const add = () => {
    const tag = draft.trim();
    if (!tag) return;
    if (local.tags.includes(tag)) return setDraft('');
    setLocal((l: Note | null) => (l ? { ...l, tags: [...l.tags, tag] } : l));
    setDraft('');
  };
  return (
    <div className="flex items-center gap-1 flex-wrap max-w-full">
      {local.tags.map((tag) => (
        <button
          type="button"
          key={tag}
          className="tag tag-interactive"
          onClick={() =>
            setLocal((l: Note | null) =>
              l ? { ...l, tags: l.tags.filter((t: string) => t !== tag) } : l,
            )
          }
          title={`Hapus tag ${tag}`}
        >
          {tag}
        </button>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add();
          }
        }}
        placeholder="+tag"
        className="input max-w-[110px] py-1 text-xs"
      />
    </div>
  );
}

function FormatSelector({
  local,
  setLocal,
}: {
  local: Note | null;
  setLocal: React.Dispatch<React.SetStateAction<Note | null>>;
}) {
  const [open, setOpen] = useState(false);
  if (!local) return null;
  const current = local.format || 'plain';
  const choose = (fmt: NoteFormat) => {
    setLocal((l: Note | null) => (l ? { ...l, format: fmt } : l));
    setOpen(false);
  };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn text-xs px-2 min-w-[120px] justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{current === 'plain' ? 'Plain' : 'Markdown'}</span>
        <span className="opacity-60 text-[10px]">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <ul
          className="absolute mt-1 w-full z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-md overflow-hidden animate-scale-in"
          role="listbox"
        >
          {(['plain', 'markdown'] as NoteFormat[]).map((fmt) => (
            <li
              key={fmt}
              role="option"
              aria-selected={current === fmt}
              onClick={() => choose(fmt)}
              className={`px-3 py-1.5 text-xs cursor-pointer select-none hover:bg-brand-50 dark:hover:bg-brand-700/30 ${current === fmt ? 'bg-brand-100/70 dark:bg-brand-700/40 font-medium' : ''}`}
            >
              {fmt === 'plain' ? 'Plain' : 'Markdown'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MarkdownSplit({
  local,
  setLocal,
}: {
  local: Note;
  setLocal: React.Dispatch<React.SetStateAction<Note | null>>;
}) {
  const html = markdownToHtml(local.body || '');
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <textarea
        value={local.body}
        onChange={(e) => setLocal((l: Note | null) => (l ? { ...l, body: e.target.value } : l))}
        placeholder="Markdown: # Judul, **tebal**, *miring*, `kode`"
        className="w-full bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-h-[500px] leading-relaxed text-sm font-mono placeholder:text-neutral-400 dark:placeholder:text-neutral-600 shadow-sm"
      />
      <div className="w-full bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 min-h-[500px] overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

function markdownToHtml(src: string): string {
  // escape
  let out = src.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // headings
  out = out
    .replace(/^###### (.*)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>');
  // inline styles
  out = out
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+?)`/g, '<code class="inline-code">$1</code>');
  // paragraphs & line breaks (simple)
  out = out.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br/>');
  // wrap
  return `<p>${out}</p>`;
}
