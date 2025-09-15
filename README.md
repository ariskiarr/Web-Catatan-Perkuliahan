## Aplikasi Catatan Kuliah

Aplikasi Next.js untuk mencatat materi kuliah secara lokal (localStorage) dengan fitur tag, filter, Markdown, ekspor TXT & PDF per catatan. Tidak membutuhkan backend.

### Fitur

- Buat, ubah, hapus catatan
- Field: judul, isi, mata kuliah, tag, format (plain/markdown)
- Pencarian teks sederhana (judul, isi, tag)
- Filter mata kuliah & tag
- Mode gelap / terang (persist)
- Markdown (preview berdampingan) sederhana (# heading, **bold**, _italic_, `inline code`)
- Ekspor per catatan ke TXT & PDF
- (Opsional / sementara dinonaktifkan) Ekspor & impor semua catatan JSON (tombol dikomentari di toolbar)

### Struktur Data

```ts
interface Note {
  id: string;
  title: string;
  body: string;
  course?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  format?: 'plain' | 'markdown';
}
```

### Menjalankan

1. npm install
2. npm run dev
3. Buka http://localhost:3000

### Deploy ke Vercel

1. Login / daftar di https://vercel.com
2. Siapkan repo git (jika belum):

```bash
git init
git add .
git commit -m "init"
```

3. Push ke GitHub / GitLab / Bitbucket.
4. Di dashboard Vercel: Add New → Project → Import repository.
5. Pengaturan otomatis Next.js sudah cukup:

- Build Command: `next build`
- Install Command: `npm install` (default)
- Output: otomatis (standalone sudah diaktifkan di `next.config.mjs`).

6. Klik Deploy.
7. Setelah live, tambahkan custom domain jika perlu.

#### Update Aplikasi

Setiap push ke branch utama akan memicu redeploy. Branch lain akan membuat Preview Deployment.

#### Konfigurasi Keamanan yang Sudah Ada

- Security headers lewat `next.config.mjs` & `vercel.json` (Referrer-Policy, X-Frame-Options, Permissions-Policy, dll).
- `output: 'standalone'` membantu container image / serverless footprint.

### Optimalisasi Opsional

- Gunakan `@next/font` atau `next/font` (misal Inter) untuk loading font lebih baik.
- Tambah PWA (plugin `next-pwa`) untuk offline & installable.
- Content-Security-Policy ketat (perlu audit inline style / script).
- Tambah analytics (Vercel / Umami / Plausible) untuk penggunaan.
- Implementasi versi ZIP ekspor semua catatan.
- Tambah incremental search highlight.

### Ekspor

TXT: File teks dengan metadata + isi.
PDF: Menggunakan `jspdf`, Markdown diringkas jadi teks polos.

### Troubleshooting

Error: Module not found 'jspdf'

1. Jalankan: `npm install jspdf@2.5.1`
2. Hapus folder .next bila perlu.
3. Pastikan file tipe: `src/types/jspdf.d.ts` ada.

### Ide Lanjutan

- Gabung banyak catatan jadi satu PDF
- Folder / kategori
- Sinkronisasi cloud (Supabase / Firestore)
- Pencarian fuzzy & highlight
- Ekspor semua catatan (ZIP) dengan struktur

---

Status: Tombol Ekspor / Impor JSON disembunyikan (dikomentari) tetapi fungsi masih ada di context.
