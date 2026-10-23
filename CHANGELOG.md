# Riwayat pembaruan

**v1.3 adalah versi stabil yang dipilih saat ini**, termasuk bayangan font 55%. Catatan ini merangkum perkembangan fitur; [riwayat commit asli](https://github.com/andikapramudyadika/Timestamp-Studio/commits/main) tetap dipertahankan.

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
