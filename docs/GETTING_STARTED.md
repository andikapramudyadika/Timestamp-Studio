# Panduan penggunaan

1. Buka [Timestamp Studio](https://andikapramudyadika.github.io/Timestamp-Studio/), lalu unggah JPG, PNG, atau WebP. Kanvas contoh tersedia untuk mencoba editor.
2. Isi tanggal/waktu, koordinat, jalan, kelurahan, kecamatan, kabupaten/kota, dan provinsi. Matikan sakelar baris yang tidak diperlukan.
3. **Gunakan waktu sekarang** mengambil waktu WITA; tanggal/waktu juga bisa ditulis manual.
4. Tambahkan peta, sesuaikan tampilan, lalu unduh hasilnya.

Foto asli tidak ditimpa. Unduhan merupakan berkas baru.

## Tampilan v1.3

| Pengaturan | Bawaan |
| --- | --- |
| Font / ketebalan | Roboto variabel / 380 |
| Ukuran / jarak antarbaris | 40 (Medium) / 10,25 |
| Warna / posisi | Putih / kanan bawah |
| Bayangan | Hitam 55%, blur 1,25, offset X/Y 1,25/1,25 |
| Acuan bayangan | Sisi panjang 1280 |
| Latar teks | Transparan |
| Lebar / opasitas peta | 30% / 65% |

Pada foto 2448 × 3264, blur dan offset sekitar 3,19 piksel. Untuk menerapkan bayangan v1.3 setelah memuat preset lain, pilih **Penyesuaian tampilan → Acuan bayangan → Foto asli · bayangan tipis**. Isi teks tetap dipertahankan. **Reset pengaturan** mengembalikan seluruh tampilan bawaan.

## Peta

- **Google Maps:** memerlukan key, Map Tiles API, dan billing aktif. Lihat [konfigurasi Google Maps](GOOGLE_MAPS.md).
- **OpenStreetMap:** tidak memerlukan API key; internet diperlukan untuk mengambil tile area peta.
- **Gambar sendiri:** unggah gambar peta JPG/PNG/WebP, termasuk atribusi sumbernya.

Koordinat dapat berupa `-3.00000, 122.00000`, `3,00000S 122,00000E`, atau URL Google Maps yang memuat koordinat lengkap. URL pendek perlu dibuka dahulu untuk menyalin koordinat. Tunggu status peta siap sebelum mengunduh.

## Ponsel, unduhan, dan preset

Gunakan navigasi bawah **Foto · Teks · Peta · Unduh**. Aktifkan **Geser objek** untuk memindahkan teks/peta, lalu **Selesai geser** agar area foto kembali nyaman untuk menggulir.

JPG memiliki pengaturan kualitas. PNG menyimpan render tanpa kompresi lossy. Pilih resolusi asli, atau 2448 × 3264 dengan foto utuh/potong tengah. **Simpan preset** menyimpan teks dan pengaturan di browser; foto, peta, font unggahan, dan key tidak ikut disimpan.

## Mengatasi kendala

| Gejala | Langkah |
| --- | --- |
| Tampilan lama masih muncul | Tunggu penerbitan Pages, muat ulang tanpa cache, atau coba tab privat. |
| Bayangan berubah setelah memuat preset | Pilih kembali **Foto asli · bayangan tipis**. |
| Peta Google tidak muncul | Periksa key, aktivasi API/billing, izin domain, dan kuota. |
| Peta OSM gagal | Periksa koneksi dan coba lagi; layanan tile dapat membatasi permintaan. |
| Font unggahan hilang setelah membuka ulang | Unggah kembali berkas font. |
| Gagal setelah klik ganda index.html | Gunakan server HTTP lokal atau GitHub Pages. |
