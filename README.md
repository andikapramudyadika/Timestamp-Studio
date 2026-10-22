# Timestamp Studio v1.3.1

Editor foto berbahasa Indonesia untuk tujuh baris timestamp dan peta. Foto diproses di browser, dengan unduhan JPG/PNG pada resolusi asli atau 2448 × 3264. Aplikasi statis ini dapat dijalankan di GitHub Pages tanpa build, npm install, atau backend.

Versi 1.3 menambahkan Google Maps melalui API resmi dan memperjelas bayangan tipis tulisan berdasarkan foto referensi. Font, ukuran, susunan teks, dan posisi peta versi 1.2 dipertahankan.

## Menjalankan di GitHub Pages

1. Buat repository GitHub. Untuk GitHub Free, gunakan repository Public agar dapat memakai Pages.
2. Ekstrak ZIP, lalu unggah **isi folder** `timestamp-studio-github` ke halaman utama repository melalui **Add file → Upload files**. Jangan unggah ZIP sebagai satu berkas.
3. Pastikan `index.html`, `app.js`, `renderer.js`, `maps.js`, `style.css`, `mobile.css`, `icon.svg`, `.nojekyll`, dan folder `fonts/` berada langsung di root repository.
4. Buka **Settings → Pages → Deploy from a branch → main → /(root) → Save**. Gunakan nama branch Anda jika berbeda.
5. Buka alamat Pages setelah penerbitan selesai. Footer menampilkan **timestamp studio v1.3.1**.

Untuk memperbarui aplikasi lama, lihat [PEMBARUAN.md](PEMBARUAN.md). Semua aset memakai jalur relatif sehingga mendukung alamat Pages dengan subfolder repository.

## Bayangan tulisan

Versi 1.3.1 memperkuat bayangan berdasarkan screenshot pembanding terbaru; jenis, ketebalan, ukuran, dan posisi huruf tetap sama.

Bawaan **Foto asli · bayangan tegas** memakai hitam 75%, blur 1,25, offset X 1,5 dan Y 2 pada acuan sisi panjang 1280. Pada foto 2448 × 3264, blur menjadi 3,19 piksel dan offset X/Y sekitar 3,83/5,10 piksel. Dibanding v1.3, bayangan lebih gelap dan lebih turun agar lebih terlihat seperti referensi terbaru. Bayangan mengikuti ukuran foto dan diperkecil secara eksplisit pada pratinjau agar sebanding dengan unduhan.

Buka **Penyesuaian tampilan → Acuan bayangan** untuk memilih preset baru, versi 1.3 yang lebih halus, PixelLab lama (34%), atau Kode APK (50%). Kekuatan, kelembutan, offset, dan sakelar bayangan tetap dapat diubah. Preset tersimpan lama mempertahankan pengaturan Anda; pilih **Foto asli · bayangan tegas** untuk menerapkan bayangan baru tanpa mengubah isian teks. **Reset pengaturan** mengembalikan seluruh tampilan bawaan.

## Google Maps

Google Maps menjadi pilihan sumber peta utama. Peta dimuat langsung melalui **Map Tiles API resmi**, menggunakan roadmap, bahasa Indonesia, label beresolusi tinggi, dan pin merah dengan ujung pada koordinat. Ini bukan peta OpenStreetMap yang diganti warnanya. Gaya/label Google dapat berubah dan tidak dijamin identik dengan versi Google Maps pada foto lama.

1. Di Google Cloud, buat/pilih project, aktifkan billing, lalu aktifkan **Map Tiles API**.
2. Buat API key. Batasi key ke **Map Tiles API** dan alamat situs Anda melalui **Websites / HTTP referrers**, misalnya `https://USERNAME.github.io/*`. Untuk pengujian lokal, tambahkan `http://127.0.0.1:8013/*` bila diperlukan. Atur kuota penggunaan di Google Cloud.
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

## Estimasi pemakaian Google Maps

Menurut harga resmi Google yang diperiksa pada 22 Oktober 2026, SKU 2D Map Tiles memiliki 100.000 permintaan tile gratis per bulan pada skema pay-as-you-go. Billing dan API key tetap diperlukan. Aplikasi ini umumnya meminta 9 tile untuk satu pembuatan peta: estimasi konservatif sekitar 11.000 pembuatan peta per bulan bila kuota tidak digunakan aplikasi lain. Permintaan ulang dan perubahan zoom/lokasi ikut menggunakan kuota; mengunduh ulang foto dengan peta yang masih dimuat tidak membuat permintaan tile baru.

Luas wilayah Kendari tidak menentukan harga: yang dihitung adalah permintaan tile. Batasi kuota harian di Google Cloud bila ingin membatasi biaya. Alternatif tanpa API key tersedia melalui OpenStreetMap atau gambar peta unggahan. Lihat [harga resmi](https://developers.google.com/maps/billing-and-pricing/pricing) dan [billing/kuota](https://developers.google.com/maps/documentation/tile/usage-and-billing).

## Pemakaian dan privasi

Unggah foto JPG, PNG, atau WebP; isi waktu dan lokasi; atur peta; lalu unduh JPG/PNG. Waktu otomatis menggunakan WITA. Navigasi bawah **Foto · Teks · Peta · Unduh** tersedia di ponsel. Aktifkan **Geser objek** bila ingin memindahkan teks/peta.

Foto, font, dan gambar peta unggahan diproses di browser. Saat meminta peta otomatis, penyedia yang dipilih menerima permintaan untuk area koordinat tersebut; foto Anda tidak dikirim. OpenStreetMap memakai `tile.openstreetmap.org` dan atribusinya ikut diekspor. Peta otomatis memerlukan internet.

**Simpan preset** menyimpan teks dan pengaturan tampilan pada localStorage perangkat ini. Foto, gambar peta, font unggahan, dan API key tidak disimpan. Jangan unggah foto pribadi atau API key ke repository publik. Berkas pribadi dan foto referensi tidak disertakan dalam paket aplikasi.

Font Roboto variabel disertakan di `fonts/` bersama lisensinya. Pengaturan ketebalan huruf menyediakan 250–500, dengan bawaan 380.

## Pemeriksaan lokal

Jalankan `node --test tests/*.test.mjs` untuk memeriksa koordinat, viewport, pesan kesalahan Google, waktu WITA, susunan teks, atribusi, serta skala bayangan.

Untuk menjalankan aplikasi, sajikan folder ini dengan server statis, misalnya `python -m http.server 8000`, lalu buka `http://localhost:8000`. Jangan hanya klik ganda `index.html` karena browser dapat memblokir modul JavaScript pada URL berkas.
