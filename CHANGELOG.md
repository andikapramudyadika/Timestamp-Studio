# Riwayat pembaruan

**v1.5.0 adalah versi saat ini**, dengan bayangan Berlapis sebagai bawaan dan Acuan DEX sebagai pembanding. Preset lama tetap tersedia.

## v1.5.0 — 27 Oktober 2026

- Bayangan Berlapis: inti tegas transparan di kanan bawah, dengan bayangan luar lembut terpisah.
- Kontrol kekuatan inti serta offset X/Y; warna bersama dan kontrol bayangan luar tetap tersedia.
- Acuan DEX: konversi radius Android ke blur Canvas, hitam, alpha setengah teks tanpa pengurangan ganda.
- Preview dan ekspor memakai renderer yang sama; potongan detail mencakup kedua lapisan.
- Preset tersimpan lama mempertahankan satu lapisan, font dan tata letak tetap.
- Berlapis merupakan preset visual yang perlu dicocokkan dengan foto asli; DEX tidak membuktikan dua lapisan terpisah.

## v1.4.1 — 26 Oktober 2026

- Pilihan latar pada Detail teks 100%: Putih bersih (bawaan), Abu-abu terang, dan Foto saat ini.
- Latar netral memperjelas bayangan tanpa mengubah ukuran teks, pengaturan bayangan, pratinjau foto utama, atau unduhan.
- Keterangan tentang huruf putih pada latar putih serta cara membandingkan dengan PNG unduhan.
- Pengujian Chrome memeriksa warna latar, skala 100%, kesetaraan PNG sebelum/sesudah pergantian latar, dan tampilan ponsel.

## v1.4 — 26 Oktober 2026

- Panel **Bayangan teks** tersendiri, terlihat pada tab Teks di ponsel.
- Preset **Tipis · 35%** sebagai bawaan: blur 1, offset X/Y 0,75, acuan sisi panjang 1280. Preset v1.3 55%, PixelLab, dan APK tetap tersedia.
- Pilihan warna serta slider/input angka untuk opasitas, blur, dan offset. Offset mendukung arah negatif; blur dan offset mendukung langkah 0,05.
- Detail teks per baris pada skala 100%, diambil dari render pada resolusi ekspor. PNG hasil uji memiliki piksel yang sama dengan area detail.
- Warna dan pengaturan bayangan ikut disimpan dalam preset; preset lama tanpa warna memakai hitam dan mempertahankan nilai lama.
- Font, ukuran, baseline, susunan teks, dan peta dipertahankan.
- 21 pengujian Node lulus; Chrome memeriksa ekspor JPG/PNG, preset, detail 100%, serta ponsel 393/320 piksel.

## v1.3 — 22 Oktober 2026

### Ditambahkan

- Google Maps melalui Map Tiles API resmi sebagai pilihan sumber peta utama.
- Isian API key yang hanya digunakan selama halaman terbuka, tanpa disimpan ke preset.
- Roadmap bahasa Indonesia, label beresolusi tinggi, pin merah, dan atribusi data Google.
- Pesan kegagalan autentikasi, izin domain, kuota, jaringan, dan pembatalan pemuatan.
- Pengujian koordinat viewport dan penanganan kegagalan Google.

### Disempurnakan

- Bayangan bawaan hitam **55%**, blur **1,25**, offset X/Y **1,25 / 1,25**, pada acuan sisi panjang **1280**.
- Panjang bayangan Canvas diskalakan pada pratinjau agar sebanding dengan ekspor resolusi penuh.
- Nama penyedia dan atribusi ikut digambar pada hasil dengan opasitas penuh.
- Pergantian key, sumber peta, dan gambar unggahan menjaga status pemuatan tetap konsisten.

### Dipertahankan

- Roboto variabel dengan ketebalan 380, ukuran Medium 40, dan susunan tujuh baris.
- OpenStreetMap tanpa API key dan peta unggahan sebagai pilihan tambahan.
- Pemrosesan foto di browser serta ekspor JPG/PNG.

## v1.2 — 22 Oktober 2026

- Peta otomatis OpenStreetMap dari koordinat, dengan pin dan atribusi.
- Pembacaan lintang/bujur, hemisfer, desimal koma, dan URL Google Maps yang memuat koordinat.
- Navigasi ponsel **Foto · Teks · Peta · Unduh** serta mode geser objek.
- Roboto variabel dengan ketebalan 250–500; bawaan 380.
- Acuan bayangan PixelLab 34%, APK 50%, serta kontrol offset dan blur.
- Resolusi kerja pratinjau hingga sisi panjang 2000 piksel.
- Pembatalan dan penundaan permintaan saat koordinat diedit.

## v1.1 — 22 Oktober 2026

- Kalibrasi susunan teks menggunakan batas tinta huruf dan baseline dari bawah ke atas.
- Jarak antarbaris 10,25 unit acuan dan inset internal seperempat ukuran font.
- Perataan kanan mengikuti lebar tinta huruf.
- Kontrol kekuatan, blur, dan offset bayangan diperluas.
- Paket statis GitHub Pages dengan font lokal.

Lihat [catatan kalibrasi](KALIBRASI.md) untuk metode pengukuran dan keterbatasannya.

## v1.0 — 22 Oktober 2026

- Unggah JPG, PNG, atau WebP dan editor tujuh baris timestamp dengan sakelar tiap baris.
- Waktu otomatis WITA, pilihan font, ukuran, warna, margin, latar, dan opasitas.
- Unggah gambar peta; atur ukuran, rasio, serta posisi teks/peta.
- Bandingkan foto asli dengan hasil edit.
- Ekspor resolusi asli atau 2448 × 3264 dengan pilihan foto utuh/potong tengah.
- Simpan dan muat preset melalui localStorage.

## Kelengkapan repositori — 23 Oktober 2026

- README, changelog, panduan penggunaan, konfigurasi Google Maps, dan pengembangan ditata ulang.
- Pengujian v1.3 dan pemeriksaan GitHub Actions disertakan.
- Pratinjau memakai kanvas contoh tanpa foto pribadi atau API key.
- Identitas paket diselaraskan ke 1.3.0; runtime dan bayangan tetap v1.3.
