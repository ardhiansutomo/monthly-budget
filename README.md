# Budget-in V3.3

## Pembaruan
- Rebranding My Money menjadi Budget-in, termasuk title, PWA name, dan icon.
- Menghapus punchline pada header bulan.
- Anggaran mingguan Jajan dan Bensin dipisah menjadi section mandiri.
- Section mingguan hanya muncul jika pos diaktifkan sebagai pemantauan mingguan dan nominal mingguannya > 0.
- Di pengaturan anggaran, tiap pos bisa diberi checkbox pemantauan mingguan dan nominal jatah per minggu.
- Riwayat mingguan disimpan per pos anggaran; kompatibel dengan data V3.2 lama (together/fuel).
- Riwayat bulanan, Cash/Cashless, checklist terlaksana, grafik tren, dan light/dark tetap dipertahankan.

## Deploy pembaruan ke GitHub
1. Download dan ekstrak ZIP.
2. Buka repository `ayyunnan/monthly-budget`.
3. Klik Add file → Upload files.
4. Upload seluruh isi folder Budget-in-V3.3 (file di root, jangan upload folder pembungkus).
5. Commit changes, misalnya `Update Budget-in V3.3`.
6. Buka Settings → Pages untuk memastikan deployment tetap `main` dan `/ (root)`.
7. Refresh website. Jika tampilan lama masih tersimpan, lakukan hard refresh atau tutup lalu buka kembali PWA agar service worker V3.3 aktif.

## Cara mengaktifkan Jajan/Bensin mingguan
1. Buka Edit anggaran.
2. Pada pos Jajan berdua, centang Pantau sebagai anggaran mingguan dan isi nominal mingguan.
3. Pada pos Bensin kerja, lakukan hal yang sama.
4. Simpan & submit.
5. Section mingguan akan muncul terpisah. Jika checkbox dimatikan atau nominal mingguan 0, section terkait tidak ditampilkan.

## Data dan kompatibilitas
Aplikasi menggunakan localStorage browser. V3.3 memakai key data yang sama dengan V3.2 dan menormalkan format laporan mingguan lama. Backup JSON sebelum deployment tetap disarankan. Data tidak otomatis tersinkron antar perangkat.
