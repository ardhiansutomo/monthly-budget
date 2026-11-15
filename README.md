# My Money V3 — Personal Finance Dashboard

Aplikasi anggaran bulanan dan laporan Daily mingguan dengan tampilan mobile-first untuk iPhone/Safari.

## Fitur
- Edit nama dan nominal setiap pos anggaran; tambah/hapus pos.
- Perubahan anggaran hanya berlaku pada bulan yang sedang dibuka.
- Riwayat bulan sebelumnya tersimpan terpisah.
- Laporan Daily mingguan: jajan berdua, bensin, kopi/air kerja.
- Grafik tren anggaran, realisasi tercatat, dan sisa alokasi.
- Status pos sudah dibayarkan/diberikan.
- Saldo aktual ringkas dan backup/restore JSON.
- PWA: dapat ditambahkan ke Home Screen iPhone dan aset dasar tersedia untuk offline setelah kunjungan pertama.

## Deploy ke GitHub Pages
1. Buat repository GitHub baru.
2. Upload seluruh isi folder ini ke root repository.
3. Buka Settings → Pages.
4. Pilih Deploy from a branch → `main` → `/ (root)` → Save.
5. Buka URL Pages melalui Safari di iPhone.

## Pasang di iPhone
Buka website dari Safari → tombol Share/Bagikan → Add to Home Screen → Add.

## Penyimpanan dan privasi
Data tersimpan di localStorage browser/perangkat. Data tidak otomatis sinkron antara iPhone dan komputer. Gunakan Backup & pemulihan untuk ekspor/impor JSON. Untuk sinkronisasi cloud lintas perangkat dibutuhkan backend dan autentikasi, yang belum disertakan dalam versi ini.

## Definisi grafik
- Anggaran: total nominal pos anggaran bulan tersebut.
- Realisasi tercatat: pos yang ditandai sudah dibayarkan/diberikan + pemakaian Daily dari laporan mingguan.
- Belum dialokasikan: pemasukan dikurangi total anggaran.
Grafik ini adalah ringkasan anggaran dan status realisasi, bukan mutasi rekening bank otomatis.

## Catatan data
Versi ini mencoba migrasi data dari localStorage My Money V2 (`mymoney_simple_v2`) pada browser yang sama. Untuk jaga-jaga, ekspor backup dari versi sebelumnya sebelum mengganti aplikasi.


## UI update: Responsive Admin + Theme Switch
- Desktop (>=1000px): fixed left navigation, wide admin dashboard layout, responsive cards and charts.
- Mobile/iPhone: compact touch layout, bottom navigation and safe-area spacing.
- Light/dark mode toggle in the top-right; preference persists in localStorage.
- Updated custom My Money mark and PWA icons.
- Existing budget, monthly history, weekly Daily report and backup data model remain unchanged.

## Anggaran Cash / Cashless
Setiap pos memiliki metode pembayaran Cash atau Cashless. Total semua pos bertanda Cash dijumlahkan otomatis sebagai kebutuhan uang tunai. Centang 'Sudah terlaksana/dibayarkan' untuk merekam realisasi anggaran. Tombol simpan pada editor bertindak sebagai submit/simpan anggaran, tetapi anggaran tetap dapat diedit dan ditambah kembali. Pemasukan/gaji dapat diubah per bulan.

## Revisi V3.2 — pemasukan dan metode pembayaran
- Pemasukan/gaji dapat diedit per bulan, termasuk ketika gaji berubah karena status pekerjaan.
- Setiap pos anggaran memiliki status terlaksana dan pilihan metode Cash/Cashless.
- Total kebutuhan tarik tunai otomatis menjumlahkan semua pos yang dipilih Cash.
- Simpan & submit menyimpan anggaran bulan tersebut; anggaran tetap dapat dibuka dan diedit, termasuk tambah/hapus pos.
- Riwayat bulan lain tidak berubah saat bulan aktif diedit.
