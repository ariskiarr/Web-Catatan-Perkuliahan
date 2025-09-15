'use client';
import { useRef, useState, useEffect } from 'react';
import { useNotes } from '@/context/NotesContext';

interface ToolbarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export function Toolbar({ onToggleSidebar, sidebarOpen }: ToolbarProps) {
  const { createNote, setSearch, search, exportBundle, importBundle, toggleTheme, theme } =
    useNotes();
  const [animKey, setAnimKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleImport = () => fileRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const res = importBundle(reader.result);
        if (!res.ok) alert(res.error);
      }
    };
    reader.readAsText(f);
    e.target.value = '';
  };

  const handleExport = () => {
    const data = exportBundle();
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'catatan-export.json';
    a.click();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 md:px-4 border-b dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-2 mr-2">
        <button
          onClick={onToggleSidebar}
          className="btn btn-ghost md:hidden text-xs font-medium tracking-wide"
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? 'Tutup' : 'Menu'}
        </button>
        <button onClick={() => createNote()} className="btn btn-primary shadow">
          <span className="hidden sm:inline">Catatan Baru</span>
          <span className="sm:hidden">Baru</span>
        </button>
      </div>
      <div className="relative flex-1 max-w-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul / isi / tag..."
          className="input text-sm"
        />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        {/* <button onClick={handleExport} className="btn btn-ghost text-xs" title="Ekspor JSON">
          Ekspor
        </button>
        <button onClick={handleImport} className="btn btn-ghost text-xs" title="Impor JSON">
          Impor
        </button> */}
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={onFileChange}
        />
        <button
          onClick={() => {
            toggleTheme();
            setAnimKey((k) => k + 1); // force re-mount icon to replay animation
          }}
          className="btn btn-ghost text-xs flex items-center gap-1"
          title="Toggle Tema"
          suppressHydrationWarning
        >
          {mounted ? (
            theme === 'dark' ? (
              <SunIcon key={animKey} className="w-4 h-4 theme-icon-animate" />
            ) : (
              <MoonIcon key={animKey} className="w-4 h-4 theme-icon-animate" />
            )
          ) : (
            <span className="w-4 h-4" />
          )}
          <span className="sr-only">Ganti Tema</span>
        </button>
      </div>
    </div>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 10c-3.305 0-6 2.695-6 6s2.695 6 6 6 6-2.695 6-6-2.695-6-6-6Zm15.398 5.031-5.918-2.957 2.094-6.273c.281-.852-.523-1.656-1.367-1.371L19.93 6.523 16.969.602c-.399-.801-1.54-.801-1.938 0L12.074 6.52 5.793 4.426c-.848-.281-1.656.523-1.367 1.367L6.52 12.07.602 15.031c-.801.399-.801 1.54 0 1.938l5.918 2.957-2.094 6.281c-.281.848.523 1.656 1.367 1.367l6.277-2.094 2.953 5.918c.403.801 1.54.801 1.938 0l2.957-5.918 6.277 2.094c.848.281 1.657-.523 1.367-1.367L25.47 19.93l5.918-2.953c.812-.407.812-1.547.011-1.946Zm-9.742 6.625c-3.117 3.117-8.195 3.117-11.312 0-3.117-3.117-3.117-8.195 0-11.312 3.117-3.117 8.195-3.117 11.312 0 3.117 3.117 3.117 8.195 0 11.312Z" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.445 32c4.922 0 9.438-2.238 12.43-5.922 1.766-2.18-.16-5.36-2.89-4.84-5.15.98-9.895-2.953-9.895-8.172a8.323 8.323 0 0 1 4.215-7.242c2.422-1.379 1.812-5.047-.938-5.558A16.292 16.292 0 0 0 17.445 0c-8.836 0-16 7.16-16 16 0 8.836 7.16 16 16 16Zm0-29c.813 0 1.606.074 2.375.219a11.313 11.313 0 0 0-5.73 9.847c0 7.114 6.48 12.45 13.453 11.121A12.978 12.978 0 0 1 17.445 29c-7.18 0-13-5.82-13-13s5.82-13 13-13Z" />
    </svg>
  );
}
