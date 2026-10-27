<div align="center">
  <img src="icon.svg" width="64" height="64" alt="Timestamp Studio">
  <h1>Timestamp Studio</h1>
  <p>Editor timestamp foto dengan peta lokasi dan ekspor resolusi penuh.</p>
  <p>
    <img alt="Versi stabil 1.6.1" src="https://img.shields.io/badge/version-1.6.1-496235">
    <a href="https://github.com/andikapramudyadika/Timestamp-Studio/actions/workflows/checks.yml"><img alt="Pemeriksaan otomatis" src="https://github.com/andikapramudyadika/Timestamp-Studio/actions/workflows/checks.yml/badge.svg"></a>
    <img alt="Foto diproses di browser" src="https://img.shields.io/badge/photo_processing-local-496235">
    <img alt="Tanpa build" src="https://img.shields.io/badge/build-not_required-496235">
  </p>
  <p><a href="https://andikapramudyadika.github.io/Timestamp-Studio/"><strong>Buka aplikasi</strong></a> · <a href="docs/GETTING_STARTED.md">Panduan penggunaan</a> · <a href="CHANGELOG.md">Riwayat pembaruan</a> · <a href="https://github.com/andikapramudyadika/Timestamp-Studio/issues">Laporkan masalah</a></p>
</div>

![Timestamp Studio pada desktop, menggunakan kanvas contoh](docs/images/preview-desktop.jpg)

**Versi saat ini: v1.6.1.** Satu gaya bayangan **3D Halus**: huruf putih, sisi padat abu-abu netral **#929292**, dan bayangan hitam lembut. Pilihan preset/jenis bayangan dan template tampilan lama dihapus agar editor lebih ringkas. Lihat [CHANGELOG.md](CHANGELOG.md).

## Fitur

| Area | Kemampuan |
| --- | --- |
| Timestamp | Tujuh baris dengan sakelar masing-masing; waktu otomatis WITA |
| Tipografi | Roboto variabel lokal, ketebalan 250–500, warna, ukuran, jarak, margin, serta font unggahan |
| Bayangan | Sisi 3D menyambung, color picker + input HEX + tombol #A6B2C0, ketebalan, dan bayangan hitam lembut |
| Peta | Google Maps resmi, OpenStreetMap, atau gambar peta unggahan |
| Pratinjau | Perubahan langsung, detail teks 100% per baris, geser objek, dan pembandingan foto asli |
| Ekspor | JPG/PNG; resolusi asli atau 2448 × 3264; foto utuh atau potong tengah |
| Pengaturan | Simpan teks dan pengaturan di browser melalui localStorage |
| Ponsel | Navigasi Foto · Teks · Peta · Unduh dan kontrol sentuh |

<details>
<summary>Pratinjau tampilan ponsel</summary>

<img src="docs/images/preview-mobile.jpg" width="330" alt="Timestamp Studio di ponsel, menggunakan kanvas contoh">

</details>

Editor foto berbahasa Indonesia untuk tujuh baris timestamp dan peta. Foto diproses di browser, dengan unduhan JPG/PNG pada resolusi asli atau 2448 × 3264. Aplikasi statis ini dapat dijalankan di GitHub Pages tanpa build, npm install, atau backend.

Versi 1.4 menyediakan penyesuaian bayangan yang lebih presisi. Font, ukuran, susunan teks, dan peta dipertahankan.

## Menjalankan di GitHub Pages

1. Buat repository GitHub. Untuk GitHub Free, gunakan repository Public agar dapat memakai Pages.
2. Ekstrak ZIP, lalu unggah **isi folder** `timestamp-studio-github` ke halaman utama repository melalui **Add file → Upload files**. Jangan unggah ZIP sebagai satu berkas.
3. Pastikan `index.html`, `app.js`, `renderer.js`, `maps.js`, `style.css`, `mobile.css`, `icon.svg`, `.nojekyll`, dan folder `fonts/` berada langsung di root repository.
4. Buka **Settings → Pages → Deploy from a branch → main → /(root) → Save**. Gunakan nama branch Anda jika berbeda.
5. Buka alamat Pages setelah penerbitan selesai. Footer menampilkan **timestamp studio v1.6.1**.

Untuk memperbarui aplikasi lama, lihat [PEMBARUAN.md](PEMBARUAN.md). Semua aset memakai jalur relatif sehingga mendukung alamat Pages dengan subfolder repository.

## Bayangan tulisan

Buka panel **Bayangan teks** (tab **Teks** pada ponsel). Tiga pengaturan utama: **Ketebalan 3D**, **Warna sisi huruf**, dan **Kekuatan bayangan lembut**. Kolom HEX menerima 3 atau 6 digit, dengan/tanpa #, untuk sisi dan teks. Input tidak valid tidak mengubah render. Color picker bebas tetap tersedia; tombol **#A6B2C0** mengembalikan warna abu-abu pilihan.

Bagian **Penyesuaian lanjutan** berisi opasitas sisi, kelembutan, dan offset bayangan hitam. Bawaan sisi #929292 padat 100%, kedalaman 1,1; bayangan hitam 70%, radius 2, offset 1,5/1,5 pada acuan sisi panjang 1280. Siluet sisi digabung dahulu, lalu diberi opasitas sekali agar tidak bertumpuk gelap.

**Detail teks · 100%** menyediakan latar putih, abu-abu, dan foto. Pilihan ini hanya memengaruhi detail; unduhan tetap memakai foto. Gunakan latar Foto saat ini dan PNG untuk membandingkan piksel hasil.

**Simpan pengaturan** menyimpan teks dan tampilan. Pengaturan lama tetap dapat dimuat; hanya nilai bayangannya yang dimigrasikan ke gaya 3D Halus. Teks, font, peta, dan sakelar bayangan dipertahankan. **Reset pengaturan** kembali ke bawaan terbaru.

Gambar berikut menunjukkan antarmuka dan perbandingan versi 1.4 sebelum mode Berlapis.

![Panel bayangan dengan detail teks 100%](docs/images/shadow-controls.png)

![Perbandingan bayangan 55% dan Tipis 35% pada latar uji yang sama](docs/images/shadow-comparison.png)

## Google Maps

Google Maps menjadi pilihan sumber peta utama. Peta dimuat langsung melalui **Map Tiles API resmi**, menggunakan roadmap, bahasa Indonesia, label beresolusi tinggi, dan pin merah dengan ujung pada koordinat. Ini bukan peta OpenStreetMap yang diganti warnanya. Gaya/label Google dapat berubah dan tidak dijamin identik dengan versi Google Maps pada foto lama.

1. Di Google Cloud, buat/pilih project, aktifkan billing, lalu aktifkan **Map Tiles API**.
2. Buat API key. Batasi key ke **Map Tiles API** dan alamat situs Anda melalui **Websites / HTTP referrers**, misalnya `https://andikapramudyadika.github.io/*`. Untuk pengujian lokal, tambahkan `http://127.0.0.1:8013/*` bila diperlukan. Atur kuota penggunaan di Google Cloud.
3. Buka bagian **Peta**, pilih **Google Maps**, lalu masukkan key pada kolom aplikasi. Tidak perlu mengirim key lewat chat atau menulisnya di repository.
4. Tempel koordinat `lintang, bujur`, lalu tekan **Buat peta**, atau biarkan pilihan otomatis aktif. Pengambilan peta memakai kuota dan dapat menimbulkan biaya sesuai akun Google Cloud Anda.
5. Tunggu **Peta Google Maps siap**, lalu unduh foto. Nama Google Maps dan atribusi data yang diberikan Google ikut digambar pada hasil dengan opasitas penuh.

Key hanya digunakan selama halaman terbuka, dikirim ke Google untuk autentikasi, dan tidak dimasukkan dalam localStorage/preset. Key aplikasi browser terlihat pada permintaan jaringan; pembatasan domain dan API perlu dikonfigurasi di Google Cloud. Token sesi hanya disimpan di memori. Aplikasi tidak membuat cache tile Google sendiri; cache HTTP mengikuti respons Google.

Tanpa API key, **unggah gambar Google Maps Anda** melalui **Unggah gambar peta**; sertakan logo/atribusi dalam gambar. Anda juga dapat memilih **OpenStreetMap · gratis, tanpa API key**. Aplikasi tidak berpindah ke OpenStreetMap secara diam-diam bila Google gagal. Pesan kesalahan menjelaskan bila key, billing, izin domain, atau kuota perlu diperiksa.

Panduan resmi:

- [Map Tiles API: API key](https://developers.google.com/maps/documentation/tile/get-api-key)
- [Roadmap tiles](https://developers.google.com/maps/documentation/tile/roadmap)
- [Penggunaan dan billing](https://developers.google.com/maps/documentation/tile/usage-and-billing)
- [Atribusi Google Maps](https://developers.google.com/maps/documentation/tile/policies)

## Pemakaian dan privasi

Unggah foto JPG, PNG, atau WebP; isi waktu dan lokasi; atur peta; lalu unduh JPG/PNG. Waktu otomatis menggunakan WITA. Navigasi bawah **Foto · Teks · Peta · Unduh** tersedia di ponsel. Aktifkan **Geser objek** bila ingin memindahkan teks/peta.

Foto, font, dan gambar peta unggahan diproses di browser. Saat meminta peta otomatis, penyedia yang dipilih menerima permintaan untuk area koordinat tersebut; foto Anda tidak dikirim. OpenStreetMap memakai `tile.openstreetmap.org` dan atribusinya ikut diekspor. Peta otomatis memerlukan internet.

**Simpan pengaturan** menyimpan teks dan pengaturan tampilan pada localStorage perangkat ini. Foto, gambar peta, font unggahan, dan API key tidak disimpan. Jangan unggah foto pribadi atau API key ke repository publik. Berkas pribadi dan foto referensi tidak disertakan dalam paket aplikasi.

Font Roboto variabel disertakan di `fonts/` bersama lisensinya. Pengaturan ketebalan huruf menyediakan 250–500, dengan bawaan 380.

## Pemeriksaan lokal

Gunakan Node.js 22 atau lebih baru. Tidak perlu `npm install`: tidak ada dependensi npm. [GitHub Actions](https://github.com/andikapramudyadika/Timestamp-Studio/actions/workflows/checks.yml) menjalankan pemeriksaan sintaks dan 23 pengujian pada push/pull request. Alur Google telah diperiksa dengan respons simulasi; akses Google sebenarnya tetap memerlukan key dan billing aktif.

Jalankan `node --test tests/*.test.mjs` untuk memeriksa koordinat, viewport, pesan kesalahan Google, waktu WITA, susunan teks, atribusi, serta skala bayangan.

Untuk menjalankan aplikasi, sajikan folder ini dengan server statis, misalnya `python -m http.server 8000`, lalu buka `http://localhost:8000`. Jangan hanya klik ganda `index.html` karena browser dapat memblokir modul JavaScript pada URL berkas.

## Dokumentasi dan kontribusi

| Dokumen | Isi |
| --- | --- |
| [Panduan penggunaan](docs/GETTING_STARTED.md) | Alur editor, peta, ekspor, preset, dan pemecahan masalah |
| [Google Maps](docs/GOOGLE_MAPS.md) | API key, pembatasan domain, kuota, dan alternatif |
| [Pengembangan](docs/DEVELOPMENT.md) | Struktur source dan pemeriksaan lokal/browser |
| [Changelog](CHANGELOG.md) | Riwayat fitur v1.0–v1.6 |
| [Kalibrasi](KALIBRASI.md) | Metode pengukuran dan batas interpretasi |
| [Kontribusi](CONTRIBUTING.md) | Laporan bug dan pull request |
| [Aset pihak ketiga](THIRD_PARTY_NOTICES.md) | Font, lisensi, dan sumber peta |

Dikelola oleh [Andika Pramudya](https://github.com/andikapramudyadika). Lisensi font disertakan di `fonts/`; repository belum menetapkan lisensi distribusi terbuka untuk kode aplikasi. Gambar dokumentasi menggunakan kanvas contoh dan tidak menyertakan foto pribadi atau API key.
