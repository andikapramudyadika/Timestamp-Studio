# Verifikasi Timestamp Studio v1.7.1

Tanggal: 29 Oktober 2026. Pengujian lokal Windows, Node.js 24.22.1 dan Chrome headless melalui Playwright. Aplikasi tetap HTML/CSS/JavaScript statis, tanpa backend, proxy atau dependensi runtime tambahan. Laporan ini mencatat verifikasi lokal sebelum publikasi; hasil deployment diperiksa secara terpisah.

## Hasil

- `node --test tests/*.test.mjs`: **35/35 lulus**. Mencakup renderer/peta/crop yang sudah ada, penamaan kecamatan, perangkat tidak didukung, konteks tidak aman, izin ditolak, batas waktu dari browser, posisi tidak valid, pembatalan dan callback terlambat; preset jamak, pembaruan nama, hapus, validasi data rusak dan kegagalan penyimpanan.
- `node --check` lulus untuk app.js, renderer.js, maps.js, location.js, location-presets.js, map-crop.js dan kedua skrip pengujian browser.
- `scripts/check-browser.cjs` dan `scripts/check-locations.cjs`: lulus. Empat bagian pada **360, 393, 430, 1366 CSS px** tanpa overflow horizontal. Screenshot diperiksa langsung, termasuk lokasi/preset, tombol sync dan isian manual. Kolom waktu yang berfokus diperiksa agar berada di bawah preview dan di atas navigasi ponsel.
- Pengisian sumber Maps hanya otomatis ketika sakelar dicentang. Saat dimatikan, edit/Enter tidak mengubah tujuh isian timestamp; tombol pengisian eksplisit tetap bekerja.
- Koordinat detail menerima teks bebas, tidak mengubah sumber Maps atau alamat, dan membatalkan debounce/request yang sedang berjalan. Edit manual pada alamat dan sinkron waktu selama request dipertahankan. Respons lama tidak menimpa lokasi baru.
- Lokasi perangkat diuji dengan **geolocation dan izin yang diemulasikan Playwright**. Akurasi tampil, kegagalan izin memulihkan tombol, dan callback perangkat terlambat tidak mengganti sumber yang lebih baru. Tidak ada permintaan GPS otomatis saat halaman dimuat.
- Tautan pendek contoh pengguna tidak memicu pencarian/redirect; tautan Buka Maps tetap tersedia. URL panjang berkoordinat dan contoh dalam aplikasi dapat dibaca.
- Preset bernama dapat disimpan lebih dari satu, dipilih tanpa langsung mengubah teks, dimuat, diperbarui dengan nama yang sama, dihapus dan dipulihkan setelah reload. Muat preset mempertahankan waktu, membatalkan request lama dan tidak mencari alamat ulang. Hapus tidak mengubah detail saat ini. Kegagalan kuota ditampilkan dan tidak menghapus data lama. Simpan/Muat pengaturan `version:1` tetap bekerja terpisah.
- Unggah foto sintetis, perbandingan foto asli, deteksi/crop peta sintetis **240 × 240 px**, simpan/muat/reset pengaturan, ekspor **PNG dan JPG** dari foto **800 × 1000 px**, serta reduced motion: lulus. Tidak ada pageerror selama pengujian.
- Renderer dan parameter bayangan tidak diubah. Tidak ada klaim peningkatan kecepatan atau perubahan geometri ekspor.

Screenshot dan keluaran pengujian tersedia di workspace `qa/v1.7.1/`, di luar paket rilis. Berkas browser test disertakan dalam paket untuk reproduksi; Playwright hanya alat pengujian opsional.

## Batas pengujian

GPS fisik Android/iOS, keyboard fisik/virtual ponsel, jaringan Photon nyata dan Google Map Tiles API nyata **belum diuji** pada perubahan ini. Alamat dalam pengujian browser menggunakan fixture Photon; posisi memakai emulasi. Pengujian ini membuktikan alur aplikasi, bukan kelengkapan nama wilayah layanan eksternal atau akurasi GPS perangkat tertentu. Posisi perangkat saat ini bukan metadata lokasi foto lama. Tingkat administrasi yang tidak tersedia tetap memerlukan masukan manual. Aplikasi memakai WITA; perpindahan ke zona waktu lain tidak dideteksi otomatis.
