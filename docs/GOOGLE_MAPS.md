# Konfigurasi Google Maps

Timestamp Studio memakai **Map Tiles API / 2D roadmap**: membuat sesi, membaca atribusi viewport, mengambil tile pada area yang terlihat, lalu menempatkan pin merah pada koordinat.

## Pengaturan Google Cloud

1. Buat/pilih project Google Cloud dan aktifkan billing.
2. Aktifkan **Map Tiles API**, lalu buat API key.
3. Batasi key ke **Map Tiles API**. Pada pembatasan aplikasi **Websites / HTTP referrers**, gunakan `https://andikapramudyadika.github.io/*` untuk situs repository ini.
4. Untuk pengujian lokal, tambahkan alamat yang digunakan, misalnya `http://localhost:8000/*` atau `http://127.0.0.1:8000/*`.
5. Atur kuota penggunaan pada Google Cloud sesuai kebutuhan.

Masukkan key pada kolom aplikasi. Key tidak perlu ditulis di source, GitHub Secrets, atau repository. Key hanya digunakan selama halaman terbuka dan tidak disimpan dalam preset. Key browser terlihat pada permintaan jaringan; pembatasan domain/API menentukan tempat key dapat digunakan.

## Penggunaan

Buka Peta → Buat peta dari koordinat. Pilih Google Maps dan isi key. Tempel koordinat di bagian Teks, lalu kembali ke Peta dan tekan **Buat peta** atau gunakan pembuatan otomatis. Tunggu pesan **Peta Google Maps siap**. Atribusi penyedia data ikut digambar pada foto. Gaya Google dapat berubah dan tidak dijamin identik dengan foto referensi lama.

Mengubah lokasi atau zoom dapat membuat permintaan tile baru. Mengunduh kembali foto yang memakai peta sama dan masih dimuat tidak memerlukan tile baru. Aplikasi tidak berpindah ke OSM secara otomatis bila Google gagal.

## Biaya dan kuota

Periksa [harga resmi](https://developers.google.com/maps/billing-and-pricing/pricing) dan [penggunaan/billing Map Tiles API](https://developers.google.com/maps/documentation/tile/usage-and-billing) untuk ketentuan yang berlaku pada akun Anda.

Unit permintaan adalah **tile**, bukan satu foto. Peta 512 × 512 di aplikasi ini memerlukan 4–9 tile, umumnya 9. Penggunaan di satu kota tetap dihitung berdasarkan jumlah permintaan, termasuk pemuatan ulang lokasi atau zoom.

## Jika gagal

| Pesan | Periksa |
| --- | --- |
| Akses ditolak | Key, aktivasi Map Tiles API, billing, dan izin domain. |
| Kuota tercapai | Batas penggunaan di Google Cloud. |
| Terlalu lama merespons | Koneksi dan ketersediaan layanan. |
| Atribusi tidak tersedia | Ulangi permintaan; atribusi diperlukan sebelum menerima peta. |

Alternatif: pilih OpenStreetMap tanpa key Google, atau unggah gambar peta sendiri beserta atribusinya. Tile OSM mengikuti [kebijakan sumber](https://operations.osmfoundation.org/policies/tiles/).

Rujukan: [API key](https://developers.google.com/maps/documentation/tile/get-api-key), [sesi/resolusi](https://developers.google.com/maps/documentation/tile/session_tokens), [roadmap](https://developers.google.com/maps/documentation/tile/roadmap), dan [atribusi Google](https://developers.google.com/maps/documentation/tile/policies).
