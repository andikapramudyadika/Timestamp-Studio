# Panduan penggunaan

1. Buka [Timestamp Studio](https://andikapramudyadika.github.io/Timestamp-Studio/), lalu unggah JPG, PNG, atau WebP. Kanvas contoh tersedia untuk mencoba editor.
2. Isi tanggal/waktu, koordinat, jalan, kelurahan, kecamatan, kabupaten/kota, dan provinsi. Matikan sakelar baris yang tidak diperlukan.
3. **Gunakan waktu sekarang** mengambil waktu WITA; tanggal/waktu juga bisa ditulis manual.
4. Tambahkan peta, sesuaikan tampilan, lalu unduh hasilnya.

Foto asli tidak ditimpa. Unduhan merupakan berkas baru.

## Tampilan v1.6.0

| Pengaturan | Bawaan |
| --- | --- |
| Font / ketebalan | Roboto variabel / 380 |
| Ukuran / jarak antarbaris | 40 (Medium) / 10,25 |
| Warna / posisi | Putih / kanan bawah |
| Bayangan | 3D Halus: sisi #A6B2C0 100%, bayangan hitam 30% |
| Acuan bayangan | Sisi panjang 1280 |
| Latar teks | Transparan |
| Lebar / opasitas peta | 30% / 65% |

## Menyesuaikan bayangan

1. Buka **Bayangan teks**; pada ponsel pilih tab **Teks**.
2. Atur **Ketebalan 3D**, **Warna sisi huruf**, dan **Kekuatan bayangan lembut**.
3. Klik tombol **#A6B2C0** untuk memakai abu-abu pilihan, atau pilih warna lain lewat color picker.
4. Buka **Penyesuaian lanjutan** bila perlu mengatur opasitas sisi, blur, dan offset hitam. Sisi selalu mengarah ke kanan bawah.
5. Periksa **Detail teks · 100%** pada latar putih/abu-abu/foto. Latar ini hanya untuk pemeriksaan; hasil unduhan tetap memakai foto.
6. **Simpan pengaturan** menyimpan teks dan tampilan; **Muat pengaturan** memulihkannya. Nilai bayangan lama dimigrasikan ke gaya 3D terbaru. Reset mengembalikan bawaan tanpa membuang foto, peta, atau teks.

Gunakan latar **Foto saat ini** dan format PNG untuk membandingkan detail dengan unduhan tanpa kompresi JPG.

## Peta

- **Google Maps:** memerlukan key, Map Tiles API, dan billing aktif. Lihat [konfigurasi Google Maps](GOOGLE_MAPS.md).
- **OpenStreetMap:** tidak memerlukan API key; internet diperlukan untuk mengambil tile area peta.
- **Gambar sendiri:** unggah gambar peta JPG/PNG/WebP, termasuk atribusi sumbernya.

Koordinat dapat berupa `-3.00000, 122.00000`, `3,00000S 122,00000E`, atau URL Google Maps yang memuat koordinat lengkap. URL pendek perlu dibuka dahulu untuk menyalin koordinat. Tunggu status peta siap sebelum mengunduh.

## Ponsel, unduhan, dan preset

Gunakan navigasi bawah **Foto · Teks · Peta · Unduh**. Aktifkan **Geser objek** untuk memindahkan teks/peta, lalu **Selesai geser** agar area foto kembali nyaman untuk menggulir.

JPG memiliki pengaturan kualitas. PNG menyimpan render tanpa kompresi lossy. Pilih resolusi asli, atau 2448 × 3264 dengan foto utuh/potong tengah. **Simpan pengaturan** menyimpan teks dan pengaturan di browser; foto, peta, font unggahan, dan key tidak ikut disimpan.

## Mengatasi kendala

| Gejala | Langkah |
| --- | --- |
| Tampilan lama masih muncul | Tunggu penerbitan Pages, muat ulang tanpa cache, atau coba tab privat. |
| Bayangan berubah setelah memuat preset | Bayangan lama dimigrasikan ke 3D Halus; sesuaikan sisi dan bayangan lalu simpan pengaturan kembali. |
| Peta Google tidak muncul | Periksa key, aktivasi API/billing, izin domain, dan kuota. |
| Peta OSM gagal | Periksa koneksi dan coba lagi; layanan tile dapat membatasi permintaan. |
| Font unggahan hilang setelah membuka ulang | Unggah kembali berkas font. |
| Gagal setelah klik ganda index.html | Gunakan server HTTP lokal atau GitHub Pages. |
