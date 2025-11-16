<img width="322" height="556" alt="image" src="https://github.com/user-attachments/assets/bae36851-5c4d-46a5-acb6-f6b1b33c07ee" />
<img width="320" height="555" alt="image" src="https://github.com/user-attachments/assets/1f3bfda7-96d4-406c-a815-487c63994002" />
<img width="316" height="549" alt="image" src="https://github.com/user-attachments/assets/38ec0e5e-bb68-4a41-a179-55d266361778" />
<img width="317" height="554" alt="image" src="https://github.com/user-attachments/assets/c0aea6a4-0127-4eaa-924c-a7bbd9eaa20f" />
<img width="317" height="552" alt="image" src="https://github.com/user-attachments/assets/94c40ad8-c8bd-49c6-897b-383df17ee919" />


# Buku Log Pak Long

Ringkasan aplikasi — Buku Log Pak Long ialah aplikasi web ringkas untuk merekod dan menjejak perbelanjaan & pendapatan. Aplikasi direka bersifat "mobile-first" supaya pengalaman di telefon lebih baik: modals penuh skrin, butang besar dan navigasi mudah. Ia menyokong penyimpanan tempatan (JSON-first), fail lampiran (File System Access API), dan juga Progressive Web App (PWA).

## Ciri-ciri penting
- Buat, edit dan padam rekod (tajuk, tarikh, masa, jumlah, nota, lampiran imej).
- Sokongan jenis rekod: `Perbelanjaan` dan `Pendapatan`.
- Papan pemuka (Dashboard): jumlah pendapatan, jumlah perbelanjaan, baki bersih, carta tren (pendapatan vs perbelanjaan) dan pecahan mengikut Buku Log.
- Paparan Sejarah: cari, tapis mengikut Buku Log, jenis, dan julat tarikh.
- JSON Export/Import dan File System Access (Chromium) untuk simpan terus ke fail.
- Auto-save apabila fail dilampirkan; jeda automatik apabila offline.
- PWA: manifest + Service Worker untuk pemasangan skrin utama & offline cache.

## Cara jalankan (lokal)
1. Pasang kebergantungan:
   ```pwsh
   npm install
   ```
2. Jalankan dev server:
   ```pwsh
   npm run dev
   ```
3. Akses dari telefon (contoh): http://<your-machine-ip>:3001/ untuk ujian sentuhan dan PWA.

## Storan & Sandaran
- LocalStorage: fallback untuk simpanan ringkas.
- Salin ke JSON: gunakan butang `Export JSON` untuk sandaran manual.
- File System Access API: jika disokong, `Attach / Load` boleh membuka JSON; ia menyimpan handle ke IndexedDB supaya anda boleh `Save to file` semula.
- Import: gunakan `Import JSON` untuk memulihkan sandaran.

## PWA & Offline
- Manifest: `manifest.json` untuk pemasangan A2HS.
- Service Worker: `service-worker.js` untuk caching aset & `offline.html` fallback.

## Nota teknikal ringkas
- `types.ts`: struktur `LogEntry` (termasuk `type?: 'expense'|'income'`).
- `hooks/useFileSystemStorage.ts`: menulis handle fail ke IndexedDB, baca dan simpan fail JSON.
- `components/Dashboard.tsx`: carta tren dan pecahan berasingan untuk pendapatan/perbelanjaan.
- `components/HistoryView.tsx`: penapisan mengikut Buku Log, jenis, dan julat tarikh.

## Roadmap (ringkasan)
- [x] Sokongan pendapatan vs perbelanjaan
- [x] Trend chart (pendapatan vs perbelanjaan)
- [x] Split pie charts per jenis
- [x] PWA & offline caching
- [x] Mobile-first design
- [ ] Bina ikon PWA produksi (192x192 & 512x512 PNG)
- [ ] Ujian unit untuk logik masa & storan

## Sumbangan
- Buat PR di GitHub, sertakan ringkasan perubahan dan ujian jika ada. Terima kasih!

---
Sedia untuk penambahbaikan lain — mahu saya tambahkan laporan bulanan atau ringkasan automatik?

 
