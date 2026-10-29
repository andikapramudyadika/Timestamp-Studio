# Panduan penggunaan v1.7.1

## Foto

Unggah JPG, PNG atau WebP, atau coba kanvas contoh. Foto asli tetap utuh di perangkat. Unduhan membuat berkas baru. Lanjutkan dengan tombol Lanjut ke Teks atau navigasi Foto/Teks/Peta/Unduh.

## Teks dan lokasi

Nilai awal provinsi adalah Sulawesi Tenggara dan kota Kota Kendari; hasil lokasi yang valid menggantikan nilai awal ini. Kecamatan diberi awalan Kecamatan tanpa menggandakan awalan. Nama kecamatan yang belum diketahui tetap perlu diisi manual.

Untuk lokasi saat ini, tekan **Gunakan lokasi perangkat** lalu izinkan akses lokasi. Gunakan HTTPS atau localhost dan aktifkan lokasi perangkat. Perkiraan akurasi tampil bersama status. Alamat dicari dari koordinat; foto tetap lokal. Posisi perangkat saat ini dapat berbeda dari lokasi pengambilan foto lama.

Contoh URL lengkap yang bisa ditempel: `https://www.google.com/maps/search/?api=1&query=-4.0034,122.5286` dan `https://www.google.com/maps/@-4.0034,122.5286,17z`. Tautan harus memuat koordinat, bukan hanya nama tempat atau Place ID. Pada URL @, titik adalah pusat tampilan peta.

Tombol **Sync hari, tanggal & waktu** tepat di atas isian pertama mengisi waktu WITA sekarang satu kali. Isian tetap bebas diedit. Mengedit koordinat dalam **Detail timestamp** tidak mencari alamat atau mengubah isian sumber lokasi, dan membatalkan pencarian alamat yang masih berjalan. Untuk pengisian otomatis, edit **Link Google Maps atau koordinat** dengan sakelar otomatis dicentang. Bila dimatikan, gunakan tombol pengisian untuk meminta alamat secara eksplisit.

**Preset lokasi:** buka bagian ini di dalam kartu Isi dari lokasi, beri nama (misalnya Rumah), lalu tekan **Simpan lokasi saat ini** setelah detail benar. Pilih preset lalu **Gunakan** untuk memuat enam baris lokasi tanpa mencari alamat ulang atau mengubah waktu. Untuk menyimpan perubahan, pilih nama yang sama lalu tekan **Perbarui lokasi tersimpan**. Untuk lokasi baru, ketik nama berbeda. **Hapus** menghapus preset terpilih tanpa mengubah detail saat ini. Preset bertahan setelah halaman dimuat ulang di browser dan domain yang sama, tetapi terhapus jika data situs dibersihkan. Foto, kunci API, waktu dan tampilan tidak ikut disimpan dalam preset lokasi. Simpan/Muat pengaturan lama tetap terpisah.

Tempel pasangan koordinat atau URL Google Maps lengkap pada Isi dari lokasi. Sakelar Isi timestamp otomatis mencari alamat setelah masukan lengkap; tombol Isi alamat & waktu dapat dipakai kapan saja. Tanggal dan waktu memakai waktu WITA saat pengisian, lalu dapat diubah manual. Semua kolom tetap dapat diedit, termasuk saat pencarian berjalan. Toggle tiap baris menyembunyikan baris dari hasil tanpa menghapus teks.

Alamat berasal dari Photon/OpenStreetMap, dengan nama lokal. Sebagian tingkat administrasi dapat kosong atau berbeda dari Google Maps; periksa hasil dan lengkapi kolom manual. Foto tidak dikirim. Matikan pengisian otomatis bila ingin mengisi sendiri.

URL pendek perlu dibuka dulu. Gunakan tautan Buka tautan Google Maps, kemudian salin URL lengkap pada bilah alamat browser atau koordinat titiknya. Aplikasi statis tidak dapat membuka redirect Google yang dibatasi CORS.

Penyesuaian tampilan menyediakan font, ukuran, ketebalan, jarak, warna, posisi, margin, dan latar. Bayangan tetap memakai default v1.6.1; tidak ada kontrol untuk mengubahnya. Detail teks 100% tersedia di bawahnya. Pilih Foto saat ini untuk membandingkan dengan PNG hasil unduhan.

## Peta

- Gambar peta: unggah gambar yang sudah dipotong, termasuk logo/atribusi sumber.
- Foto Timestamp asli: unggah foto asli dengan peta persegi pada sudut kiri bawah. Peta dideteksi, dipotong pada piksel asli, dan langsung diterapkan. Periksa thumbnail. Bila hasil belum tepat, buka Sesuaikan potongan untuk mengubah ukuran dan jarak kiri/bawah tanpa keluar ke galeri. Foto dengan layout lain mungkin perlu penyesuaian.
- Buat peta dari koordinat: pilihan online Google Maps dengan API key atau OpenStreetMap tanpa key. Koordinat berasal dari bagian Teks. Ini terpisah dari pencarian alamat; mengisi alamat tidak membutuhkan key Google Maps.

Ukuran/posisi, bentuk, opasitas dan garis tepi peta tersedia dalam bagian lanjutan. Hapus gambar peta juga berada di bagian ini. Logo dan atribusi pada gambar peta dipertahankan di hasil.

## Unduh dan pengaturan tersimpan

Pilih JPG/PNG. JPG memiliki kontrol kualitas. Resolusi asli mempertahankan ukuran foto; 2448 × 3264 menyediakan foto utuh atau potong tengah. Unduh dirender ulang pada resolusi penuh.

Simpan pengaturan menyimpan teks dan tampilan pada browser ini; Muat pengaturan memulihkannya, termasuk setelan versi lama kecuali bayangan yang sekarang tetap. Foto, peta, font unggahan dan API key tidak disimpan. Reset tampilan mempertahankan isi teks dan gambar.

Pada ponsel, gunakan navigasi bawah. Geser objek mengaktifkan pemindahan teks/peta; Selesai geser mengembalikan area foto untuk menggulir. Antarmuka mengikuti preferensi reduced motion.
