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

Pengujian memakai `node:test` dan `node:assert/strict`. Suite v1.3 berisi 18 pengujian untuk waktu WITA, ukuran/fit foto, baseline, bayangan, skala pratinjau, atribusi, koordinat, Mercator, viewport, dan penanganan kegagalan Google.

Workflow [Checks](../.github/workflows/checks.yml) menjalankan pemeriksaan sintaks dan pengujian pada push/pull request. Izin workflow hanya membaca isi repository; tidak memakai key Google.

## Pemeriksaan browser

1. Gunakan kanvas contoh atau foto uji yang boleh dibagikan.
2. Periksa baris timestamp, sakelar, preset bayangan, dan pembandingan foto asli.
3. Periksa lebar ponsel sekitar 393 piksel, navigasi bawah, dan geser objek.
4. Periksa peta unggahan serta pergantian sumber peta.
5. Unduh JPG/PNG dan periksa dimensi, teks, bayangan, serta atribusi.
6. Bandingkan pratinjau dengan ekspor saat mengubah renderer. Panjang bayangan Canvas harus diskalakan eksplisit karena tidak mengikuti transform teks secara otomatis.

Alur Google v1.3 telah diperiksa di Chrome dengan respons simulasi, termasuk ekspor, key kosong/ditolak, dan atribusi. Pengujian ini tidak membuktikan akses layanan Google dengan key pengguna. Verifikasi layanan sebenarnya memerlukan key dan billing aktif. Pengujian Node tidak memanggil layanan Google berbayar.

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

v1.3 dan bayangan 55% merupakan acuan stabil saat ini. Perubahan dokumentasi tidak mengubah font, baseline, atau bayangan. Pertahankan jalur relatif untuk mendukung subfolder Pages dan perbarui penanda cache HTML/import secara konsisten bila runtime berubah. Lihat [kalibrasi](../KALIBRASI.md) untuk catatan historis.
