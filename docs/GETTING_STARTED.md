# Panduan penggunaan

1. Buka [Timestamp Studio](https://andikapramudyadika.github.io/Timestamp-Studio/), lalu unggah JPG, PNG, atau WebP. Kanvas contoh tersedia untuk mencoba editor.
2. Isi tanggal/waktu, koordinat, jalan, kelurahan, kecamatan, kabupaten/kota, dan provinsi. Matikan sakelar baris yang tidak diperlukan.
3. **Gunakan waktu sekarang** mengambil waktu WITA; tanggal/waktu juga bisa ditulis manual.
4. Tambahkan peta, sesuaikan tampilan, lalu unduh hasilnya.

Foto asli tidak ditimpa. Unduhan merupakan berkas baru.

## Tampilan v1.4.1

| Pengaturan | Bawaan |
| --- | --- |
| Font / ketebalan | Roboto variabel / 380 |
| Ukuran / jarak antarbaris | 40 (Medium) / 10,25 |
| Warna / posisi | Putih / kanan bawah |
| Bayangan | Tipis: hitam 35%, blur 1, offset X/Y 0,75/0,75 |
| Acuan bayangan | Sisi panjang 1280 |
| Latar teks | Transparan |
| Lebar / opasitas peta | 30% / 65% |

Pada foto 2448 × 3264, blur sekitar 2,55 piksel dan offset sekitar 1,91 piksel. Nilai ini adalah titik awal; sesuaikan sambil membandingkan foto dari aplikasi asli.

## Menyesuaikan bayangan

1. Buka **Bayangan teks**; pada ponsel pilih tab **Teks**.
2. Mulai dari **Tipis · 35%**, atau pilih **Versi 1.3 · 55%** untuk membandingkan tampilan lama. Preset ini hanya mengubah bayangan.
3. Gunakan slider atau ketik angka. Turunkan opasitas bila terlalu hitam, kurangi blur bila terlalu menyebar, dan kecilkan offset bila terlalu jauh. X negatif menggeser ke kiri; Y negatif ke atas.
4. Pilih warna abu-abu gelap bila hitam masih terasa terlalu kuat.
5. Buka **Detail teks · 100%**, pilih latar dan baris, lalu geser area detail untuk menilai pada ukuran hasil unduhan. Bawaan **Putih bersih** memperjelas bayangan; **Abu-abu terang** memperjelas huruf putih dan bayangannya. Pilih **Foto saat ini** untuk menilai dalam konteks foto. Detail mengikuti resolusi dan penyesuaian rasio ekspor.
6. Klik **Simpan preset** untuk menyimpan pilihan Anda. Preset lama tetap mempertahankan nilainya. **Reset pengaturan** mengembalikan bawaan Tipis.

Latar putih/abu-abu hanya digunakan untuk pemeriksaan detail; pratinjau foto utama dan unduhan tetap memakai foto Anda. Pada latar putih, huruf putih menyatu dengan latar sehingga yang terlihat terutama bayangannya. Untuk membandingkan langsung dengan hasil unduhan, pilih **Foto saat ini** dan gunakan PNG tanpa perubahan kompresi JPG.

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
| Bayangan berubah setelah memuat preset | Pilih **Bayangan teks → Tipis · 35%**, atau sesuaikan lalu simpan preset kembali. |
| Peta Google tidak muncul | Periksa key, aktivasi API/billing, izin domain, dan kuota. |
| Peta OSM gagal | Periksa koneksi dan coba lagi; layanan tile dapat membatasi permintaan. |
| Font unggahan hilang setelah membuka ulang | Unggah kembali berkas font. |
| Gagal setelah klik ganda index.html | Gunakan server HTTP lokal atau GitHub Pages. |
