import { Note } from '@/types/note';

export function exportNoteToTxt(note: Note) {
  const lines = [
    `Judul: ${note.title}`,
    note.course ? `Mata Kuliah: ${note.course}` : '',
    note.tags.length ? `Tags: ${note.tags.join(', ')}` : '',
    `Dibuat: ${note.createdAt}`,
    `Diubah: ${note.updatedAt}`,
    '',
    note.body,
  ].filter(Boolean);
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, sanitizeFilename(note.title || 'catatan') + '.txt');
}

export async function exportNoteToPdf(note: Note) {
  // Guard for server side
  if (typeof window === 'undefined') return;
  const mod = await import('jspdf');
  const { jsPDF } = mod;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  let cursorY = margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const title = note.title || 'Tanpa Judul';
  doc.text(title, margin, cursorY);
  cursorY += 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const meta: string[] = [];
  if (note.course) meta.push(`Mata Kuliah: ${note.course}`);
  if (note.tags.length) meta.push(`Tags: ${note.tags.join(', ')}`);
  meta.push(`Dibuat: ${note.createdAt}`);
  meta.push(`Diubah: ${note.updatedAt}`);
  meta.forEach((m) => {
    doc.text(m, margin, cursorY);
    cursorY += 14;
  });
  cursorY += 6;

  doc.setDrawColor(180);
  doc.line(margin, cursorY, doc.internal.pageSize.getWidth() - margin, cursorY);
  cursorY += 20;

  doc.setFontSize(11);
  const body = note.format === 'markdown' ? stripMarkdown(note.body || '') : note.body || '';
  const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
  const paragraphs = body.split(/\n{2,}/g);
  paragraphs.forEach((p) => {
    const lines = doc.splitTextToSize(p.trim().replace(/\s+/g, ' '), maxWidth);
    lines.forEach((line: string) => {
      if (cursorY > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += 16;
    });
    cursorY += 8;
  });

  const blob = new Blob([doc.output('blob')], { type: 'application/pdf' });
  triggerDownload(blob, sanitizeFilename(title) + '.pdf');
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6} +/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`]+?)`/g, '$1');
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function sanitizeFilename(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'catatan'
  );
}
