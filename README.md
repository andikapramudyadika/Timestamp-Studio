# Timestamp Studio v1.7.0

Editor foto statis berbahasa Indonesia. Foto diproses di browser, dengan timestamp tujuh baris, peta, dan ekspor JPG/PNG pada resolusi penuh. Tetap menggunakan HTML, CSS, dan modul JavaScript tanpa build atau backend.

## Yang baru

- Bayangan selalu memakai hasil kalibrasi v1.6.1. Seluruh kontrol bayangan dihapus. Pengaturan lama tetap memulihkan teks, font, posisi dan peta; bagian bayangan memakai nilai tetap terbaru.
- Tempel koordinat atau URL Google Maps pada **Teks → Isi dari lokasi**. Koordinat, waktu WITA saat pengisian dan detail alamat yang tersedia terisi otomatis. Semua kolom dapat langsung diedit. Suntingan selama pencarian tidak ditimpa oleh respons yang terlambat.
- **Peta → Foto Timestamp asli** mendeteksi dan memotong peta persegi di sudut kiri bawah. **Gambar peta** menerima peta yang sudah dipotong. Hasil crop mempertahankan piksel, logo dan label sumber. Penyesuaian potongan tersedia bila deteksi kurang tepat.
- Pratinjau gelap, kontrol konsisten, empat bagian Foto/Teks/Peta/Unduh, dan navigasi bawah pada ponsel. Gerak antarmuka 180 ms mengikuti preferensi reduced motion.

![Editor desktop](docs/images/preview-desktop.jpg)

## Memakai aplikasi

1. Unggah foto di **Foto**; kanvas contoh tersedia untuk mencoba.
2. Buka **Teks**, tempel `-4.0034, 122.5286` atau URL Google Maps lengkap. Tunggu alamat, kemudian edit kolom mana pun. Waktu memakai WITA saat pengisian, bukan jam yang terus menimpa teks manual.
3. Buka **Peta**, unggah gambar peta atau foto Timestamp asli. Periksa potongannya. Peta online Google Maps dan OpenStreetMap tersedia pada **Buat peta dari koordinat**.
4. Pilih **Unduh**, tentukan JPG/PNG dan resolusi, kemudian unduh hasilnya.

URL panjang dengan `q`, `query`, `ll`, `destination`, `@lat,lon`, atau pin `!3d…!4d…` didukung. Pin lokasi didahulukan dari pusat kamera Maps. Tautan pendek `maps.app.goo.gl` / `goo.gl/maps` perlu dibuka dulu; salin URL lengkap dari bilah alamat atau koordinat titiknya. GitHub Pages tidak memiliki backend untuk membuka redirect Google yang dibatasi CORS.

Pencarian alamat memakai [Photon](https://github.com/komoot/photon) dengan nama lokal OpenStreetMap, terpisah dari sumber gambar peta. Kelengkapan data berbeda menurut wilayah. Jika suatu tingkat administrasi belum jelas/tersedia, kolom dibiarkan kosong untuk diisi manual; nama wilayah tidak ditebak. Data alamat bisa berbeda dari Google Maps. Foto, peta unggahan dan API key tidak dikirim ke Photon. Koordinat dikirim hanya setelah pengguna memasukkan titik yang valid; tersedia sakelar untuk mematikan pengisian otomatis. Layanan publik tidak menjamin ketersediaan; permintaan dibatasi dengan debounce dan cache sesi.

## GitHub Pages

Unggah isi folder aplikasi, termasuk `location.js`, `map-crop.js`, `fonts/`, dan `.nojekyll`, ke root repository. Aktifkan **Settings → Pages → Deploy from a branch → main → /(root)**. Seluruh aset memakai jalur relatif dan mendukung subfolder repository. Tidak perlu npm install.

[Petunjuk pembaruan](PEMBARUAN.md) · [Panduan penggunaan](docs/GETTING_STARTED.md) · [Google Maps](docs/GOOGLE_MAPS.md) · [Desain](DESIGN.md) · [Pemeliharaan](AGENTS.md) · [Hasil verifikasi](docs/VERIFICATION-v1.7.md)

## Setelan dan ekspor

Kunci localStorage `timestamp-studio-preset-v1` dipertahankan. Simpan/Muat pengaturan tetap manual. Foto, peta, font unggahan dan API key tidak disimpan. Reset tampilan mempertahankan isi timestamp dan gambar. Font Roboto variabel lokal dan font unggahan tetap didukung.

Bayangan tetap: sisi `#929292`, depth `1.1`, opasitas sisi `100%`, bayangan hitam `70%`, blur Android `2`, offset X/Y `1.5`. Geometri teks dan renderer v1.6.1 dipertahankan. Pratinjau memakai resolusi tampilan; ekspor selalu dirender ulang pada resolusi asli atau 2448 × 3264. Pemeriksaan detail 100% tersedia dalam Teks.

Google Maps online tetap memakai Map Tiles API resmi; memerlukan API key dan billing aktif. Key hanya berada di memori. OSM tile tidak memerlukan key. Atribusi penyedia peta ikut diekspor; gambar unggahan sebaiknya menyertakan atribusi sumbernya.

## Pemeriksaan lokal

Jalankan server statis pada folder ini, misalnya `python -m http.server 8000`, lalu buka `http://localhost:8000`. Hindari membuka index.html dengan file:// karena modul dapat diblokir browser.

Node.js 22+:

```sh
node --test tests/*.test.mjs
node --check app.js
node --check renderer.js
node --check maps.js
node --check location.js
node --check map-crop.js
```

GitHub Actions menjalankan pemeriksaan sintaks dan unit test. Tidak ada layanan berbayar yang dipanggil oleh unit test.
