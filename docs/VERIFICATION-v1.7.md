# Verifikasi v1.7.0 — 27 Oktober 2026

Dasar sumber: v1.6.1, commit `ec0504e0757abe2d2c94ce2c68fdac687cd87b75`. Perubahan dikerjakan pada salinan baru; versi lokal lama tidak ditimpa.

## Pemeriksaan otomatis

| Area | Hasil |
| --- | --- |
| Unit test Node 24 | 28/28 lulus |
| Sintaks | app.js, renderer.js, maps.js, location.js, map-crop.js dan scripts/check-browser.cjs lulus |
| Git diff --check | Lulus; hanya pemberitahuan normalisasi CRLF/LF pada lingkungan Windows |
| Playwright / Chrome desktop | 360, 393, 430, 1366 CSS px; empat bagian per ukuran; tidak ada overflow horizontal atau pageerror |
| Navigasi | Target tab minimal 44 px desktop / 54 px ponsel; pergantian panel dan scroll ke kolom manual terakhir lulus |
| Alamat simulasi | Pengisian, edit selama request, cache, matikan otomatis, retry, HTTP 503, pembatalan dan respons lokasi lama lulus |
| Alamat nyata | Photon dapat diakses dari browser dengan CORS; lang=default menghasilkan Sulawesi Tenggara |
| Crop lampiran | Deteksi otomatis dan penyempurnaan tepi menghasilkan 734 × 734 px pada piksel asli; thumbnail diperiksa visual |
| Gambar peta langsung | Unggah peta terpotong lulus; kontrol crop tidak ditampilkan |
| Berkas rusak | Pesan error muncul, peta sebelumnya dan kemampuan unduh dipertahankan |
| Penyimpanan | Kunci/bentuk lama tetap; setelan nonbayangan pulih, bayangan dipaksa ke default v1.6.1; reset menjaga teks |
| Peta online | Google dan OSM lulus memakai sesi/tile/atribusi simulasi; key tidak masuk localStorage |
| Ekspor | JPG/PNG nyata berhasil diunduh dan didekode pada 2448 × 3264 |
| Kesamaan renderer | Nol komponen piksel berbeda terhadap renderer v1.6.1 pada 1536 × 2048 dan 2448 × 3264 untuk scene/font/teks yang sama |
| Reduced motion | Transisi toast menjadi 0 detik; CSS juga mencakup pseudo-element |
| Skrip portabel | scripts/check-browser.cjs lulus memakai fixture generik, 16 kombinasi ukuran/bagian, crop 240 px, pengaturan dan ekspor PNG |

`npm` tidak tersedia pada PATH sesi ini; suite yang sama dijalankan langsung dengan `node --test tests/*.test.mjs`.

## Profil pratinjau

Profil dilakukan pada Chrome desktop lokal, menggunakan kanvas contoh. Baseline mengukur latensi sampai dua requestAnimationFrame: median sekitar 33,3 ms. Versi baru sekitar 33,2 ms; ini terutama mencerminkan interval frame dan bukan bukti percepatan yang besar.

Pada pengukuran terakhir, draw pratinjau median sekitar 8,3 ms dan p95 sekitar 11,3 ms. Seratus event slider dalam satu burst menghasilkan satu draw (sekitar 13 ms). Angka dapat berubah menurut beban mesin; bukan tolok ukur perangkat Android. Optimasi menahan satu frame tertunda, menjaga ukuran kanvas tetap, membatasi preview sesuai layar, dan menghindari render detail penuh di setiap event. Jalur ekspor tidak dikurangi kualitasnya.

## Pemeriksaan visual

Screenshot semua ukuran/bagian diperiksa, termasuk kosong, peta, ekspor, serta input manual saat menggulir. Masalah yang diperbaiki setelah pemeriksaan pertama: panggung desktop terlalu rendah dan hasil crop menyisakan strip foto beberapa piksel pada batas atas/kanan. Navigasi dipindah ke kolom pengaturan, tinggi pratinjau disesuaikan, dan tepi crop ditentukan ulang pada piksel asli.

Screenshot dokumentasi memakai kanvas contoh dan teks generik:

- [Desktop](images/preview-desktop.jpg)
- [Ponsel / pengeditan manual](images/preview-mobile.jpg)

Screenshot lampiran pribadi dan ekspor pengujian disimpan di folder QA workspace di luar repository dan tidak disertakan dalam paket rilis.

## Cara mengulang

```sh
node --test tests/*.test.mjs
node --check app.js
node --check renderer.js
node --check maps.js
node --check location.js
node --check map-crop.js
```

Untuk pengujian browser opsional, sediakan Playwright pada lingkungan pengembangan lalu jalankan `node scripts/check-browser.cjs` atau `npm run test:browser`. `PLAYWRIGHT_MODULE_PATH` dapat menunjuk modul Playwright yang sudah tersedia; `CHROME_PATH` dapat menunjuk executable Chrome. Tanpa CHROME_PATH, Playwright memakai Chromium yang telah dipasangnya. Hasil screenshot masuk test-results/ (diabaikan Git); QA_OUTPUT_DIR dapat mengubah tujuan. Tidak ada dependensi browser ini pada aplikasi yang diterbitkan.

## Batas dan hal yang belum diuji

- Android/iOS fisik, Safari, keyboard perangkat, HEIC, tekanan memori ponsel dan foto sangat besar belum diuji langsung. Viewport dan penyesuaian keyboard diimplementasikan tetapi bukan bukti pengujian IME fisik.
- Google Map Tiles API dengan key/billing nyata belum diuji; alurnya memakai simulasi dan unit test. Layanan tile OSM nyata tidak diperlukan dalam verifikasi ini.
- Data alamat OpenStreetMap dapat berbeda dari Google Maps atau belum lengkap. Pada titik lampiran, layanan nyata menyediakan jalan, Anduonohu, Kendari dan Sulawesi Tenggara, tetapi tidak menyediakan kecamatan yang jelas. Kolom kecamatan dibiarkan kosong untuk koreksi manual, bukan diisi dengan dugaan. Layanan gratis tidak memiliki jaminan ketersediaan.
- Tautan pendek Google Maps perlu dibuka dahulu agar pengguna dapat menyalin URL lengkap/koordinat; redirect lintas domain tidak dapat dibaca dengan andal oleh aplikasi statis tanpa backend.
- Crop otomatis menargetkan peta persegi yang menyentuh sudut kiri bawah, seperti contoh pengguna. Foto dengan peta di sudut lain, bentuk nonpersegi, bingkai besar atau tata letak berbeda dapat memerlukan kontrol penyesuaian.
- Penerbitan memakai sumber GitHub Pages branch `main`, folder `/`. Status deploy dan versi situs diperiksa terpisah setelah push pembaruan.
