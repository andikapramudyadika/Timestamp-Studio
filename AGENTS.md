# Pemeliharaan Timestamp Studio

Baca DESIGN.md sebelum mengubah UI. Proyek ini aplikasi statis HTML/CSS/JavaScript tanpa framework, backend atau langkah build; harus tetap berjalan pada GitHub Pages dalam subfolder repository.

- index.html: struktur semantik dan label; style.css: token/desktop; mobile.css: ponsel; app.js: state, UI, unggahan, render terjadwal, ekspor; renderer.js: geometri/piksel; maps.js: koordinat/tile; location.js: alamat; map-crop.js: crop lokal.
- Pertahankan localStorage key timestamp-studio-preset-v1 dan bentuk data version:1. Jangan menghapus data lama atau menyimpan foto, font, key API, atau token sesi. restoreStyle memulihkan setelan nonbayangan dan menerapkan SHADOW_STYLE tetap. Jangan memulihkan kontrol atau nilai bayangan dari preset lama.
- Bayangan tetap harus identik dengan default v1.6.1: depth 1.1, sisi #929292/100%, hitam 70%, radius 2, offset 1.5/1.5. Jangan mengubah baseline, skala font, blur Android atau ekspor hanya untuk mempercepat pratinjau.
- Semua aset/import memakai path relatif. Naikkan query versi CSS/JS bersamaan dengan package.json dan footer saat rilis. Modul baru wajib disertakan dalam ZIP dan pemeriksaan sintaks CI.
- Jadwalkan maksimal satu frame pratinjau yang tertunda. Ekspor memakai scene penuh; jangan mengunduh kanvas preview. Detail 100% harus sama dengan potongan output PNG.
- Alamat hanya dicari setelah masukan titik yang valid. Gunakan debounce, cache sesi, abort dan nomor urutan; respons lama tidak boleh menimpa lokasi baru. Revisi per kolom melindungi edit manual selama request/debounce. Waktu otomatis mengambil WITA saat pengisian; jangan menambahkan timer yang menimpa waktu manual.
- Photon memakai lang=default agar mengembalikan nama lokal. Klasifikasi district dapat ambigu; jangan menebak atau mengarang nama kecamatan. Tingkat yang tidak tersedia boleh kosong dengan petunjuk manual. Jangan menambahkan proxy publik untuk melewati CORS tautan pendek. Pertahankan tautan sumber/atribusi dan pengungkapan bahwa koordinat dikirim ke layanan alamat.
- Crop dilakukan sepenuhnya lokal. Deteksi pada sampel kecil, haluskan tepi dengan strip piksel asli, lalu ekstrak 1:1 tanpa resampling. Jangan menghilangkan logo/atribusi. Sediakan penyesuaian dan status bila hanya perkiraan. Lepaskan object URL dan kanvas sementara yang tidak digunakan. Jangan menaruh foto pribadi/screenshot lampiran di repository.
- Periksa request yang berlomba: foto/map unggahan baru, hapus peta, ubah provider, toggle, muat pengaturan, perubahan koordinat dan kegagalan jaringan. Status busy/disabled harus pulih pada sukses, gagal dan pembatalan.

## Validasi sebelum menyelesaikan perubahan

1. Jalankan node --test tests/*.test.mjs (atau npm test bila npm tersedia).
2. Jalankan node --check untuk app.js, renderer.js, maps.js, location.js, map-crop.js.
3. Untuk perubahan UI/perilaku, jalankan Playwright bila tersedia pada 360, 393, 430 dan 1366 CSS px. Periksa empat bagian, scroll/manual input, keyboard/fokus, upload/crop, perbandingan foto asli, simpan/muat/reset, JPG/PNG, loading/error/disabled, dan reduced motion.
4. Lihat screenshot, bukan hanya keberhasilan assertion. Foto pengujian pribadi disimpan di luar repository/paket rilis.
5. Jika renderer berubah, bandingkan piksel ekspor terhadap versi dasar pada resolusi asli dan 2448 × 3264. Profilkan burst slider dan draw sebelum mengklaim peningkatan kecepatan.
6. Catat hasil dan batas pengujian dalam docs/VERIFICATION-v1.7.md atau laporan versi berikutnya. Jangan mengklaim pengujian Android/iOS fisik atau Google API nyata bila hanya diuji dengan simulasi.

Jangan memublikasikan ke GitHub/Pages hanya karena ZIP telah siap; penerbitan merupakan tindakan terpisah yang mengikuti permintaan pengguna.
