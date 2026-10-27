# Memperbarui GitHub ke v1.5.0

Jika memperbarui dari paket ZIP, ekstrak terlebih dahulu. Unggah **isi folder timestamp-studio-github** ke lokasi yang sama pada halaman utama repository melalui **Add file → Upload files → Commit changes**. Jangan mengunggah ZIP sebagai satu berkas.

Untuk memperbarui runtime yang sudah ada, ganti berkas berikut bersama-sama:

```text
index.html
app.js
renderer.js
maps.js
style.css
mobile.css
```

Pertahankan fonts/, icon.svg, dan .nojekyll. Sertakan dokumentasi dan pengujian dari paket bila memperbarui repository lengkap. Konfigurasi Pages tetap **Deploy from a branch → main → /(root)**. Setelah penerbitan, footer menampilkan **timestamp studio v1.5.0**. Semua aset memakai penanda cache v1.5.0; jika tampilan masih lama, muat ulang tanpa cache atau gunakan tab privat.

## Perubahan

- Pilihan latar detail: **Putih bersih** (bawaan), **Abu-abu terang**, dan **Foto saat ini**. Pilihan ini hanya untuk pemeriksaan; unduhan tetap menggunakan foto Anda.

- Panel **Bayangan teks** tersendiri (tab **Teks** pada ponsel).
- Bawaan **Berlapis**: inti tegas + luar lembut. **Acuan DEX** tersedia untuk membandingkan model satu bayangan Android. Tampilan lama tetap tersedia sebagai **Versi 1.3 · 55%**.
- Pilihan warna, slider dan input angka, serta offset negatif.
- **Detail teks · 100%** untuk memeriksa satu baris pada resolusi unduhan; gunakan PNG untuk membandingkan tanpa kompresi JPG.
- Warna dan pengaturan ikut tersimpan dalam preset. Preset lama tetap mempertahankan nilainya; pilih Berlapis bila ingin menerapkan bawaan baru.

Memilih preset bayangan hanya mengubah bayangan. **Reset pengaturan** mengembalikan seluruh tampilan ke bawaan v1.5.0 sambil mempertahankan foto, peta, dan isi teks.
