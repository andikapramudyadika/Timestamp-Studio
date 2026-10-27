# Aturan desain Timestamp Studio

## Tujuan

Foto menjadi pusat perhatian. Antarmuka editor tenang, ringkas dan nyaman dengan satu tangan. Bahasa Indonesia dipakai untuk label, status dan kesalahan. Penjelasan teknis hanya tampil saat membantu keputusan pengguna, misalnya persyaratan API key.

## Sistem visual

| Token | Nilai / aturan |
| --- | --- |
| Teks utama | #252a28 |
| Teks pendukung | #6a716d |
| Aksen | #47634e; satu keluarga hijau untuk tindakan/seleksi |
| Aksen lembut | #edf2ec |
| Latar | #f3f4f1; panel putih |
| Panggung foto | #252a28; memberi kontras pada foto |
| Garis | #e0e4e0 |
| Radius panel | 14 px desktop, 12 px ponsel |
| Radius kontrol | 9 px |
| Tinggi kontrol | 46 px; tab minimal 44 px desktop / 54 px ponsel |
| Spasi | Utamakan kelipatan 4; panel 22/18 px, kelompok 16–24 px |
| Tipografi | CameraRoboto lokal; input ponsel 16 px untuk mencegah zoom otomatis |
| Ikon | SVG garis 1,7; 20 px umum, 16–18 px kontrol rapat |

## Tata letak dan interaksi

- Empat bagian konsisten: Foto, Teks, Peta, Unduh. Satu bagian pengaturan tampil pada satu waktu. Desktop memakai panel kiri 370 px dan pratinjau besar di kanan; tablet memakai 330 px.
- Di bawah 761 px, pratinjau tampil lebih dulu. Navigasi bawah memakai safe-area inset. Pratinjau Foto lebih besar; saat mengedit, pratinjau lebih pendek dan sticky agar kolom tetap mendapat ruang.
- Saat keyboard memperkecil visual viewport, sticky pratinjau dilepas dan tinggi gambar disesuaikan. Jangan mengunci scroll halaman atau menghalangi input.
- Kolom timestamp selalu dapat diedit. Toggle baris hanya mengatur visibilitas hasil, tidak menghapus isinya.
- Font, margin, detail teks dan ukuran peta berada di details/summary. Kontrol bayangan tidak ditampilkan; nilai v1.6.1 tetap.
- Dua unggahan peta memiliki tujuan yang jelas. Foto Timestamp asli menghasilkan crop lokal, menampilkan thumbnail dan ukuran. Jika deteksi kurang pasti, tampilkan status perkiraan dan izinkan penyesuaian.
- Label, fokus keyboard, status aria-live, aria-busy dan keadaan disabled wajib terlihat/terbaca. Umpan balik sukses melalui toast singkat; kesalahan alamat/peta tetap dekat kontrol terkait.

## Gerak dan kinerja

Durasi awal 180 ms dalam rentang 150–220 ms. Utamakan opacity dan transform. Jangan memakai transition:all, animasi tinggi panel, delay sebelum tindakan, atau animasi pemuatan yang menghalangi input. prefers-reduced-motion mematikan transisi dan animasi, termasuk pseudo-element.

Event input dikumpulkan menjadi satu requestAnimationFrame. Jangan mengatur ulang ukuran kanvas jika dimensinya sama. Batasi resolusi pratinjau sesuai layar; ekspor tetap memakai resolusi penuh dan renderer yang sama. Detail 100% dirender setelah jeda 140 ms saat interaksi berhenti, hanya ketika terbuka pada bagian Teks. Tutup detail untuk melepaskan kanvas resolusi penuh. Ukur draw dengan Performance API sebelum mengubah kualitas gambar.

## Pemeriksaan visual

Periksa 360, 393, 430, 1366 CSS px: keempat bagian, kosong/berfoto, input panjang, pengaturan lanjutan, scroll ke kolom terakhir, status gagal/sukses, dan unduhan. Ambil screenshot dan lihat hasilnya. Pastikan tidak ada overflow horizontal, tab/CTA tidak tertutup, dan pratinjau tidak menutupi kolom aktif. Uji reduced motion. Screenshot dokumentasi memakai kanvas contoh/gambar uji yang boleh dibagikan.
