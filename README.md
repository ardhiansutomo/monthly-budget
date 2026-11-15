# Budget-in V3.4 — Personal Finance Admin

## Baseline
V3.4 dibangun dari source V3.2 yang diberikan pengguna pada sesi ini (`index.html`, `styles.css`, `app.js`, manifest, service worker, dan README), bukan dari ZIP lama yang tidak tersedia sebagai source aktif.

## Perubahan V3.4
- Rebranding lengkap My Money menjadi Budget-in: HTML title, PWA title, header wordmark, ikon PWA, README.
- Menghapus punchline pada header bulan.
- Memperbaiki modal editor anggaran: lebar dibatasi, tidak overflow horizontal, responsif di desktop dan iPhone.
- Anggaran mingguan per pos; jajan dan bensin menjadi section terpisah.
- Section mingguan hanya tampil jika opsi pemantauan mingguan diaktifkan dan nominal per minggu > 0.
- Per pos dapat diaktifkan/dinonaktifkan pemantauan mingguan dan diatur jatah per minggu.
- Menyimpan laporan mingguan berdasarkan ID pos dan minggu.
- Migrasi data laporan lama `together`, `fuel`, `work` ke model per-pos untuk Jajan/Bensin yang dikenali.
- Tetap mempertahankan income bulanan, edit kategori, Cash/Cashless, checklist terlaksana, total cash belum terlaksana, riwayat bulanan, tren, backup/restore, theme toggle, PWA.
- Service worker cache dinaikkan ke `budget-in-v3.4-cache`.

## Upload ke GitHub
1. Backup JSON dari website aktif dan simpan salinan repository.
2. Ekstrak ZIP.
3. Upload isi folder `Budget-in-V3.4` langsung ke root repository `ayyunnan/monthly-budget`.
4. Commit dengan pesan `Update Budget-in V3.4`.
5. Pastikan GitHub Pages tetap `main` dan `/ (root)`.
6. Refresh situs dan periksa cache PWA.

## Catatan data
Data menggunakan localStorage dengan key `mymoney_finance_v3` agar data V3.2 pada browser yang sama dapat dipakai. Laporan lama dipetakan ke kategori Jajan/Bensin berdasarkan nama pos; laporan Kopi/air PT lama juga dipertahankan dan pemantauan mingguannya diaktifkan jika data lama tersedia. Backup JSON sebelum update tetap wajib disarankan. Data browser tidak otomatis tersinkron lintas perangkat.

## Anggaran mingguan
Buka Edit Anggaran. Pada pos Jajan berdua dan Bensin kerja, aktifkan `Pantau sebagai anggaran mingguan`, lalu isi jatah per minggu. Jika tidak diaktifkan atau nilainya nol, section tidak ditampilkan. Setiap section menyimpan total pemakaian mingguan secara terpisah.
