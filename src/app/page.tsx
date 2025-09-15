"use client";
import { useState, useCallback } from 'react';
import { Toolbar } from '@/components/Toolbar';
import { NoteList } from '@/components/NoteList';
import { NoteEditor } from '@/components/NoteEditor';

export default function Page() {
  const [activeId, setActiveId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen(o => !o), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  return (
    <main className="h-dvh flex flex-col">
      <Toolbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="absolute inset-0 z-40 md:hidden" aria-hidden>
            <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={closeSidebar} />
            <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-white dark:bg-neutral-900 border-r dark:border-neutral-800 shadow-xl p-0 flex flex-col animate-slide-in">
              <NoteList activeId={activeId} onSelect={(id) => { setActiveId(id); closeSidebar(); }} />
            </aside>
          </div>
        )}
        <aside className="hidden md:flex flex-col w-[300px] border-r dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
          <NoteList activeId={activeId} onSelect={setActiveId} />
        </aside>
        <div className="flex-1">
          <NoteEditor id={activeId} />
        </div>
      </div>
    </main>
  );
}
