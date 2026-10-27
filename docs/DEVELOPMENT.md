# Pengembangan v1.7.0

Aplikasi statis tanpa dependensi npm dan tanpa build. Gunakan Node.js 22+ untuk tes dan browser modern untuk Canvas/FontFace.

Jalankan `python -m http.server 8000` dalam folder aplikasi, lalu buka `http://localhost:8000`. Server statis lain dapat dipakai. Jangan mengandalkan URL file:// untuk modul browser.

```sh
node --test tests/*.test.mjs
node --check app.js
node --check renderer.js
node --check maps.js
node --check location.js
node --check map-crop.js
```

Lihat [AGENTS.md](../AGENTS.md) untuk instruksi pemeliharaan, [DESIGN.md](../DESIGN.md) untuk token dan interaksi, dan [hasil verifikasi](VERIFICATION-v1.7.md) untuk bukti/batas pengujian.

## Struktur

| Berkas | Tanggung jawab |
| --- | --- |
| index.html | Semantik, panel, label, navigasi |
| style.css / mobile.css | Token, tata letak, kontrol, responsive dan reduced motion |
| app.js | State, revisi kolom, async lifecycle, crop/unggahan, render terjadwal, ekspor |
| renderer.js | Geometri teks, bayangan tetap, peta dan atribusi |
| maps.js | Parser koordinat/URL, proyeksi, tile Google/OSM |
| location.js | Photon reverse geocoding, nama lokal, cache, abort/timeout |
| map-crop.js | Deteksi sampel, penyempurnaan tepi native, crop persegi 1:1 |
| tests/*.test.mjs | Unit test tanpa network berbayar |

SHADOW_STYLE dibekukan pada default v1.6.1. restoreStyle selalu menerapkannya, termasuk untuk data shadowStyleVersion 2. Kunci penyimpanan lama dipertahankan. Fungsi render tetap menerima scene/style untuk pengujian; app tidak mengekspos pengaturan bayangan.

Photon memakai lang=default karena instance publik tidak mendukung lang=id. Browser berbahasa Inggris tidak boleh membuat nama provinsi menjadi bahasa Inggris. Field district dapat berarti suburb/kelurahan; jangan selalu menambahkan awalan Kecamatan. Jika detail belum jelas, tampilkan kolom kosong dan petunjuk manual. Endpoint publik bukan SLA; pembatasan pemakaian harus dihormati. Permintaan hanya dari input titik pengguna, debounce 1000 ms, cache sesi maksimum 40 titik, dan timeout 12 detik. Tidak ada polling atau permintaan otomatis saat halaman dibuka.

Jangan mencoba melewati CORS redirect Google dengan proxy publik. URL pendek diberi tautan pembuka dan petunjuk menyalin koordinat/URL panjang. Pencarian alamat terpisah dari Map Tiles API, sehingga key Google tidak diperlukan untuk mengisi teks.

Pratinjau dibatasi sesuai layar dan memiliki ukuran kanvas stabil. requestAnimationFrame menggabungkan event input; detail 100% ditunda 140 ms sampai interaksi berhenti. Performance API mencatat studio-preview. Ini tidak mengubah jalur ekspor penuh.

Crop tahap pertama menelusuri batas atas/kanan dari kandidat peta kiri bawah pada sampel maksimum 900 px. Tahap kedua membaca dua strip piksel asli untuk menentukan tepi tanpa menyimpan salinan foto penuh. Hasil diekstrak pada resolusi asli, tanpa penskalaan. Deteksi bukan pengenal semua layout: crop persegi kiri bawah saja, dengan fallback perkiraan 30% serta kontrol penyesuaian.

Pengujian browser portabel opsional: node scripts/check-browser.cjs. Sediakan Playwright di lingkungan dev atau atur PLAYWRIGHT_MODULE_PATH; CHROME_PATH dapat memilih Chrome lokal. Screenshot ditulis ke test-results/ dan tidak menjadi bagian aplikasi.
