# Pengembangan

Gunakan browser modern dengan Canvas 2D, modul JavaScript, dan FontFace. Untuk pengujian, gunakan Node.js 22 atau lebih baru. Aplikasi tidak memiliki dependensi npm atau proses build.

## Menjalankan lokal

```bash
git clone https://github.com/andikapramudyadika/Timestamp-Studio.git
cd Timestamp-Studio
python -m http.server 8000
```

Buka `http://localhost:8000`. Server statis lain juga dapat digunakan. Hindari URL berkas `file://` karena pemuatan modul dapat diblokir browser.

## Pengujian

```bash
npm test
node --check app.js
node --check renderer.js
node --check maps.js
```

Pengujian memakai `node:test` dan `node:assert/strict`. Suite v1.4 berisi 22 pengujian untuk waktu WITA, ukuran/fit foto, baseline, bayangan, skala pratinjau, atribusi, koordinat, Mercator, viewport, dan penanganan kegagalan Google.

Workflow [Checks](../.github/workflows/checks.yml) menjalankan pemeriksaan sintaks dan pengujian pada push/pull request. Izin workflow hanya membaca isi repository; tidak memakai key Google.

## Pemeriksaan browser

1. Gunakan kanvas contoh atau foto uji yang boleh dibagikan.
2. Periksa baris timestamp, sakelar, ketebalan/sisi bayangan, dan pembandingan foto asli.
3. Periksa lebar ponsel sekitar 393 piksel, navigasi bawah, dan geser objek.
4. Periksa peta unggahan serta pergantian sumber peta.
5. Unduh JPG/PNG dan periksa dimensi, teks, bayangan, serta atribusi.
6. Bandingkan pratinjau dengan ekspor saat mengubah renderer. Panjang bayangan Canvas harus diskalakan eksplisit karena tidak mengikuti transform teks secara otomatis.
7. Periksa sinkronisasi angka/slider, warna, offset negatif, dan simpan/muat preset lama tanpa warna.
8. Pilih latar **Foto saat ini**, lalu bandingkan piksel detail 100% dengan potongan PNG unduhan. Kanvas sumber detail merender resolusi penuh hanya selama detail terbuka, lalu memorinya dilepas saat detail ditutup. Potongan memakai koordinat bulat tanpa penskalaan agar identik dengan PNG. Pada gambar uji Chrome, resolusi asli/contain/cover, warna khusus, bayangan mati, dan posisi kiri atas memiliki selisih nol.

Alur Google v1.3 telah diperiksa di Chrome dengan respons simulasi, termasuk ekspor, key kosong/ditolak, dan atribusi. Pengujian ini tidak membuktikan akses layanan Google dengan key pengguna. Verifikasi layanan sebenarnya memerlukan key dan billing aktif. Pengujian Node tidak memanggil layanan Google berbayar.

Detail v1.4.1 menyediakan latar putih (bawaan), abu-abu terang, dan foto. Latar netral memakai scene terpisah dengan foto solid pada rasio output serta tanpa peta. State foto/style dan jalur ekspor tidak diubah. Pengujian Chrome memeriksa putih #FFFFFF, abu-abu #E5E7EB, bayangan terlihat di putih, huruf putih tanpa bayangan menyatu dengan putih, ukuran detail tetap, serta PNG identik sebelum/sesudah mengganti latar. Kontrol juga diperiksa pada lebar ponsel 393/320 px.

## Struktur

| File/folder | Fungsi |
| --- | --- |
| `index.html` | Struktur editor dan kontrol |
| `app.js` | State, unggahan, interaksi, preset, ekspor |
| `renderer.js` | Font, ukuran, baseline, bayangan, peta, atribusi |
| `maps.js` | Koordinat, proyeksi, tile OSM, API Google |
| `style.css`, `mobile.css` | Tata letak desktop dan ponsel |
| `fonts/` | Font lokal dan lisensi |
| `tests/` | Pengujian Node |
| `docs/` | Panduan dan gambar kanvas contoh |

## Bayangan v1.6.0

SHADOW_STYLE adalah satu-satunya gaya. Tidak ada pemilih mode/preset atau template tampilan lama. Gunakan shadowDepth, shadowSideColor (#A6B2C0), shadowSideOpacity untuk sisi; shadowOpacity, shadowBlur, shadowOffsetX/Y untuk bayangan luar hitam. Blur tetap memakai konversi radius Android. Font dan geometri teks dipertahankan.

Siluet sisi dibuat pada kanvas per baris memakai sumber huruf opak di beberapa posisi kontinu, baru dikomposit dengan satu alpha. Ini menghindari penumpukan alpha setiap langkah. Canvas DOM dipakai di browser utama, OffscreenCanvas untuk lingkungan yang mendukungnya. Dimensi masker dilepas setelah drawImage; seluruh foto tidak disalin ke kanvas sementara.

restoreStyle hanya membaca kunci yang dikenal. shadowStyleVersion 2 mempertahankan nilai baru; data lama memigrasikan bayangan ke bawaan baru tanpa mengubah teks/font/peta/status sakelar. localStorage key lama tetap dipakai agar pengaturan tidak hilang.

Validasi: 22 pengujian Node, sintaks, DOM terisolasi (hapus preset, swatch/picker, input angka, simpan/muat, migrasi, reset, sakelar), dan raster Skia (@napi-rs/canvas dengan fixture Roboto 400) memeriksa warna sisi, alpha sekali, blur terpisah, dan geometri tetap. Browser Android/Chrome tidak diuji langsung. Screenshot historis di repository belum mencerminkan antarmuka v1.6.0.

## HEX dan bawaan v1.6.1

normalizeHex memvalidasi 3/6 digit dengan/tanpa # dan menormalisasi ke #rrggbb. Input belum valid tidak menyentuh state renderer/localStorage; blur menampilkan kesalahan. updateOutputs tidak menimpa ketikan saat kolom aktif. Picker/swatch/reset/load menyinkronkan kolom. Bawaan sisi #929292 depth 1,1, hitam 70% berasal dari kalibrasi visual gambar, bukan DEX. 23 pengujian Node serta DOM untuk kasus valid/invalid/blur/swatch/load dan raster Skia lulus.
