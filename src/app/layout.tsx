import './globals.css';
import { NotesProvider } from '@/context/NotesContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catatan Perkuliahan Desain',
  description: 'Aplikasi catatan kuliah desain - Next.js + localStorage',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <NotesProvider>{children}</NotesProvider>
      </body>
    </html>
  );
}
