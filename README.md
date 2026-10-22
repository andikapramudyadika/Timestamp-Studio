# Timestamp Studio

Web app pribadi untuk menambahkan tujuh baris timestamp dan gambar peta ke foto. Versi ini sudah dikalibrasi terhadap foto referensi Timestamp Camera dan siap diunggah melalui situs GitHub.

**Tidak perlu build, npm install, API key, backend, atau akun ChatGPT untuk menjalankan versi ini.** Semua berkas yang diperlukan sudah berada di folder ini. Font Roboto disertakan secara lokal.

## Membuatnya online lewat GitHub web

1. Masuk ke GitHub, lalu buat repository baru, misalnya `timestamp-studio`.
2. Untuk memakai GitHub Pages pada paket GitHub Free, pilih repository **Public**. Aplikasi web yang diterbitkan juga dapat diakses orang lain; versi ini tidak memiliki sistem login.
3. Pada repository, pilih **Add file → Upload files**.
4. Buka folder `timestamp-studio-github` di komputer. Unggah **isinya**, termasuk folder `fonts` dan berkas `.nojekyll`. Jangan mengunggah ZIP sebagai satu berkas dan jangan menaruh seluruh aplikasi di dalam satu subfolder tambahan.
5. Pilih **Commit changes**. Pastikan `index.html`, `app.js`, `renderer.js`, `style.css`, dan folder `fonts` terlihat langsung pada halaman utama repository.
6. Buka **Settings → Pages**.
7. Pada **Build and deployment**, pilih **Source: Deploy from a branch**.
8. Pada **Branch**, pilih **main** dan **/(root)**, lalu **Save**. Jika nama branch Anda berbeda, pilih branch tempat berkas tadi diunggah.
9. Tunggu proses penerbitan selesai. Buka alamat yang diberikan GitHub, biasanya `https://USERNAME.github.io/timestamp-studio/`.

Saat memperbarui aplikasi, unggah ulang berkas yang berubah ke lokasi yang sama. GitHub Pages akan menerbitkan perubahan tersebut. Bila tampilan lama masih muncul, muat ulang halaman tanpa cache.

Panduan resmi:
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Berkas utama

| Berkas | Fungsi |
| --- | --- |
| `index.html` | Formulir, pratinjau, pengaturan, dan tombol unduh |
| `style.css` | Tampilan desktop dan ponsel |
| `app.js` | Unggah, isian, simpan preset, interaksi, serta ekspor |
| `renderer.js` | Perhitungan ukuran, susunan, margin, dan bayangan timestamp |
| `fonts/Roboto-Regular.ttf` | Font timestamp bawaan |
| `fonts/LICENSE.txt` | Lisensi font Roboto |
| `.nojekyll` | Menyajikan berkas statis langsung di GitHub Pages |
| `KALIBRASI.md` | Hasil pengukuran dan penjelasan preset |
| `tests/renderer.test.mjs` | Pemeriksaan fungsi waktu, gambar, teks, dan bayangan |

Semua jalur aset relatif sehingga aplikasi juga berjalan pada alamat project Pages yang memiliki subfolder repository.

## Pemakaian

1. Unggah foto JPG, PNG, atau WebP.
2. Isi hari/tanggal/waktu, koordinat, jalan/lorong, kelurahan, kecamatan, kabupaten/kota, serta provinsi.
3. Unggah gambar peta bila diperlukan. Peta tidak diambil otomatis dari koordinat.
4. Sesuaikan tampilan atau geser teks/peta pada pratinjau.
5. Unduh JPG atau PNG pada resolusi asli, atau pilih 2448 × 3264 dengan opsi foto utuh atau potong tengah.

Gunakan tombol **Reset pengaturan** untuk mengembalikan preset hasil kalibrasi. Preset lama yang pernah Anda simpan akan mempertahankan nilai pilihan Anda ketika dimuat.

## Privasi dan penyimpanan

Foto, peta, dan font unggahan dibaca dan diproses di browser. Aplikasi tidak memiliki kode untuk mengunggahnya ke server. Foto/koordinat pribadi, APK, dan gambar perbandingan referensi tidak disertakan dalam paket ini.

Tombol **Simpan preset** menyimpan isi teks dan pengaturan pada browser/perangkat itu saja, melalui localStorage. Berkas foto, peta, dan font unggahan tidak ikut disimpan; unggah kembali jika halaman dibuka ulang. Hindari mengunggah berkas pribadi ke repository GitHub yang bersifat publik.

## Pengembangan lokal (opsional)

Untuk memeriksa dengan Node.js: `node --test tests/renderer.test.mjs`.

Untuk pratinjau lokal, jalankan server statis dari folder ini, misalnya `python -m http.server 8000`, lalu buka `http://localhost:8000`. Membuka `index.html` dengan klik ganda dapat diblokir browser karena aplikasi memakai modul JavaScript. GitHub Pages tidak memerlukan Python atau Node.js.
