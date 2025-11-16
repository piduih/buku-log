# Pelan Pembangunan (Roadmap) Aplikasi "Buku Log Pak Long"

Dokumen ini menggariskan perancangan untuk pembangunan dan penambahbaikan aplikasi pada masa hadapan.

---

### Fasa 1: Fungsi Teras (MVP) - ✅ Selesai

Ini adalah versi semasa aplikasi yang merangkumi semua fungsi asas yang diperlukan.

- [x] **Pengurusan Buku Log**: Cipta Buku Log (kategori) tanpa had.
- [x] **Kemasukan Rekod**: Tambah rekod dengan tajuk, tarikh, masa, kos, nota, dan lampiran imej.
- [x] **Papan Pemuka (Dashboard)**:
    - [x] Paparan jumlah perbelanjaan.
    - [x] Penapis masa (Hari Ini, Minggu Ini, Bulan Ini, Tahun Ini, Semua).
    - [x] Pecahan kos mengikut Buku Log dengan carta pai.
- [x] **Paparan Sejarah**:
    - [x] Senarai semua rekod secara kronologi.
    - [x] Penapis sejarah mengikut Buku Log.
- [x] **Pengurusan Rekod**: Keupayaan untuk **mengedit (edit)** dan **memadam (delete)** rekod sedia ada.
- [x] **Storan Data**: Menggunakan LocalStorage untuk persistensi data pada peranti pengguna.
- [x] **Reka Bentuk Responsif**: Antara muka yang dioptimumkan untuk peranti mudah alih.

---

### Fasa 2: Penambahbaikan & Kualiti Hidup (Jangka Pendek)

Ciri-ciri ini bertujuan untuk meningkatkan pengalaman pengguna dan menambah fungsi yang berguna.

- [x] **Fungsi Carian (Search)**: Tambah bar carian dalam paparan Sejarah untuk mencari rekod berdasarkan tajuk atau nota.
- [x] **Eksport Data**: Benarkan pengguna mengeksport data mereka ke format CSV untuk sandaran (backup) atau analisis luaran.
- [x] **Pengurusan Buku Log Lanjutan**: Tambah keupayaan untuk mengedit nama atau memadam Buku Log (dengan amaran tentang rekod yang berkaitan).
<!-- Dark mode removed; feature deprecated in roadmap. -->
- [x] **Penapisan Lanjutan**: Tambah penapis mengikut julat tarikh dalam paparan Sejarah.
- [x] **Carta Tren**: Tambah carta tren untuk membandingkan pendapatan vs perbelanjaan dari semasa ke semasa.
- [x] **Pecahan Berasingan**: Pisahkan carta pai untuk pendapatan dan perbelanjaan dalam papan pemuka.
- [ ] **Rekod Berulang (Recurring Entries)**: Sediakan pilihan untuk mencipta rekod berulang secara automatik untuk perbelanjaan tetap (cth: langganan bulanan).
- [x] **Rekod Pendapatan (Income Support)**: Menambah keupayaan untuk menandakan entri sebagai Pendapatan (income) atau Perbelanjaan (expense). Menambah penapisan dan paparan jumlah pendapatan, perbelanjaan, dan baki.

--

### Fasa 2.1: Penambahbaikan Mobile-first (Keutamaan Tinggi)

- [ ] **Reka Bentuk Mobile-first**: Fokus pada pengoptimalan untuk telefon kerana 90% pengguna akan buka pada telefon.
    - [x] Modals jadi penuh skrin pada peranti kecil (telah dikuatkuasakan untuk Log entry & Logbook manager).
    - [x] Toasts responsif (lebar penuh pada telefon supaya mesej mudah dibaca).
    - [x] Menu tindakan header ringkas untuk peranti mudah alih (aksi dibungkus dalam menu '⋯').
    - [x] Kawalan auto-save & butang fail akses dipindahkan ke menu pada telefon untuk menjimatkan ruang.
    - [x] Saiz 'touch target' (butang edit/padam) diperbesarkan untuk kemudahan penggunaan.
    - [ ] Uji pada peranti Android/iOS; perbaiki sebarang isu dengan saiz fon, skala paparan, dan posisi elemen.
    - [ ] Sediakan badge atau onboarding kecil yang mengesyorkan pengguna memasang PWA (untuk pengalaman seperti aplikasi) — Fasa 4.

<!-- Study module removed per user request. -->

---

### Fasa 3: Ciri "Pro" & Pintar (Jangka Sederhana)

Ciri-ciri ini akan menjadikan aplikasi lebih berkuasa dan proaktif.

- [ ] **Peringatan Servis**: Tetapkan peringatan untuk penyelenggaraan akan datang berdasarkan tarikh rekod terakhir (cth: "Servis kereta seterusnya dalam 6 bulan").
- [ ] **Analitis Lanjutan**: Paparkan graf dan carta yang lebih mendalam, seperti tren perbelanjaan dari semasa ke semasa dan perbandingan antara bulan/tahun.
- [ ] **Integrasi AI (Gemini)**:
    - **Kategorisasi Automatik**: Gunakan AI untuk mencadangkan Buku Log secara automatik berdasarkan tajuk rekod.
    - **Ringkasan Pintar**: Hasilkan ringkasan bulanan seperti "Perbelanjaan anda untuk 'Makan Luar' meningkat sebanyak 20% bulan ini."
    - **Soalan Bahasa Semula Jadi**: Benarkan pengguna bertanya soalan seperti "Berapa banyak saya belanja untuk kereta tahun lepas?".

---

### Fasa 4: Platform & Ekosistem (Jangka Panjang)

Meningkatkan kebolehcapaian dan keselamatan data untuk jangka masa panjang.

- [ ] **Akaun Pengguna & Sinkroni Awan (Cloud Sync)**:
    - Pindahkan data dari LocalStorage ke pangkalan data awan (cth: Firebase).
    - Laksanakan sistem akaun pengguna untuk membolehkan data disegerakkan merentasi pelbagai peranti dengan selamat.
- [ ] **Aplikasi Web Progresif (PWA)**: Jadikan aplikasi boleh dipasang pada skrin utama peranti mudah alih untuk pengalaman seperti aplikasi asli dan akses luar talian yang lebih baik.
    - [x] Basic manifest + service worker implemented. Create dedicated app icons (192/512 PNG) for production.
- [ ] **Aplikasi Mudah Alih Asli (Native)**: Bangunkan aplikasi iOS dan Android untuk prestasi terbaik dan integrasi peranti yang lebih mendalam (cth: notifikasi tolak untuk peringatan).

---

<!-- Priorities were removed — roadmap restored to baseline. -->
