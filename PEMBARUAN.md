# Memperbarui GitHub ke v1.3

Ekstrak ZIP, lalu unggah ulang berkas berikut ke lokasi yang sama pada halaman utama repository:

```text
index.html
app.js
renderer.js
maps.js
style.css
mobile.css
```

Pertahankan `fonts/`, `icon.svg`, dan `.nojekyll`. Untuk pemasangan baru, unggah seluruh isi folder `timestamp-studio-github`, termasuk folder `fonts/` dan berkas `.nojekyll`. Jangan mengunggah ZIP langsung; GitHub Pages tidak mengekstraknya.

Gunakan **Add file → Upload files → Commit changes**. Konfigurasi Pages tetap **Deploy from a branch → main → /(root)**. Setelah penerbitan selesai, footer harus menampilkan **timestamp studio v1.3**. Aset memakai versi cache baru; bila masih terlihat versi lama, buka tab privat atau muat ulang tanpa cache.

## Perubahan

- Bayangan bawaan baru **Foto asli · bayangan tipis** lebih tegas, dengan arah kanan bawah. Skala bayangan pratinjau dan ekspor sudah disamakan.
- Sumber peta utama **Google Maps**, melalui Map Tiles API resmi. Masukkan API key pada aplikasi setelah mengaktifkan Map Tiles API dan billing di Google Cloud. Lihat [README.md](README.md) untuk pengaturan key dan kuota.
- Tanpa key: unggah gambar Google Maps Anda, atau pilih OpenStreetMap secara manual. Key tidak disimpan dalam preset atau source.
- Nama penyedia dan atribusi peta tetap ikut pada unduhan.

Jika memuat preset lama, pilih **Penyesuaian tampilan → Acuan bayangan → Foto asli · bayangan tipis** untuk memakai bayangan baru. Isi teks dan pengaturan lainnya tetap dipertahankan. **Reset pengaturan** mengembalikan seluruh tampilan bawaan.
