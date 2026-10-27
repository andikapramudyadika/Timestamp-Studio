# Catatan v1.7.0

Bayangan dikunci pada default v1.6.1. Semua catatan kontrol bayangan pada bagian historis di bawah tidak lagi berlaku untuk UI saat ini. Renderer dan kalibrasi piksel tetap dipertahankan.

# Kalibrasi preset Timestamp Camera

## Versi 1.6.1: bawaan referensi dan HEX

Sampel pita sisi di bawah angka 2 pada gambar pengguna (sekitar x58–190/y360–369) memuat nilai abu-abu netral sekitar RGB 137–152. Dipilih #929292 (146/146/146) sebagai pendekatan warna sisi. Gambar memiliki pencahayaan/gradien dan tidak menyediakan parameter pembuatannya; ini perkiraan visual, bukan rekonstruksi piksel identik.

Bawaan baru: warna sisi #929292, opacity 100%, depth 1,1; bayangan hitam opacity 70%, radius Android 2, offset 1,5/1,5. #A6B2C0 tetap swatch opsional sesuai permintaan sebelumnya. Font/ukuran/posisi tetap. Preset v1.6 yang tersimpan tetap dibaca utuh, Reset memakai bawaan baru.

Input HEX sisi dan teks menerima #RGB/#RRGGBB atau tanpa #, case-insensitive. State disimpan sebagai #rrggbb. Ketikan belum valid tidak mengubah warna; blur menampilkan kesalahan untuk input tidak valid. Picker, swatch, reset dan load menyinkronkan kolom HEX. 23 tes Node dan pemeriksaan DOM/raster Skia lulus; belum ada uji browser Android langsung.

## Versi 1.6.0: satu gaya 3D Halus

Referensi visual pengguna menunjukkan sisi huruf padat, bukan hanya salinan transparan. Renderer kini membuat siluet menyambung dari beberapa offset bertahap (maksimum 0,25 piksel hasil per langkah), menggabungkannya pada kanvas per baris, lalu menerapkan opasitas satu kali saat komposit. Tidak ada blur pada sisi ini. Teks depan digambar terakhir, sehingga bentuk/font/baseline tetap mengikuti versi sebelumnya.

Bawaan: sisi #A6B2C0 pada opasitas 100%, depth 1 per sumbu; bayangan luar hitam 30%, radius Android 2 dan offset 1,5/1,5. Semua panjang memakai acuan sisi panjang 1280. Konversi radius ke shadowBlur `2 × (0,57735 × radius + 0,5)` tetap dipakai untuk bayangan luar. Nilai sisi/kedalaman merupakan kalibrasi visual, bukan klaim bahwa DEX menerapkan ekstrusi huruf.

Semua pilihan preset/jenis bayangan dan template tampilan dihapus. UI hanya menunjukkan ketebalan, warna sisi (+ swatch #A6B2C0), dan kekuatan bayangan lembut; kontrol lain berada dalam Penyesuaian lanjutan. Sisi selalu mengarah ke kanan bawah. Nilai depth 0 atau opasitas sisi 0 mematikan sisi saja; kekuatan bayangan 0 mematikan blur hitam saja; sakelar mematikan keduanya.

Penyimpanan baru ditandai shadowStyleVersion 2. Preset lama dimigrasikan: nilai bayangan lama diganti dengan bawaan baru, pengaturan nonbayangan dan status sakelar tetap. Preset v1.6.0 mempertahankan warna/depth/opasitas yang disimpan. Masker per baris memakai koordinat resolusi hasil, sama untuk preview/detail/ekspor; setelah komposit, memori masker dilepas.

Validasi: 22 tes Node, pemeriksaan DOM terisolasi untuk swatch/picker, angka, simpan/muat/migrasi/reset, dan pemeriksaan raster Skia dengan font fixture Roboto 400. Piksel sisi #A6B2C0 terdeteksi, setelan 50% tidak mengalami penumpukan opasitas, shadow mati/alpha teks 0 tidak meninggalkan bayangan, dan geometri teks tetap. Chrome/Android belum diuji langsung; screenshot historis dan catatan versi di bawah bukan bukti kesamaan piksel dengan referensi terbaru.

## Versi 1.5.0: inti tegas dan bayangan luar

Bawaan **Berlapis** adalah pendekatan visual terhadap deskripsi pengguna: siluet hitam transparan 30% tanpa blur pada offset X/Y 0,85, di bawah teks utama; di belakangnya bayangan luar hitam 25%, radius Android 2, offset X/Y 1. Semua panjang memakai acuan sisi panjang 1280. Angka inti/luar merupakan titik awal yang dapat diubah, bukan hasil ekstraksi dua lapisan dari DEX. Font, ukuran, perataan, baseline, dan peta tidak diubah.

Preset **Acuan DEX** memakai satu lapisan: radius `2 × unit`, offset `1 × unit`, hitam, dan alpha `floor(floor(opasitasTeks/100 × 255)/2)/255`. Kontrol warna dan opasitas bayangan dikunci pada mode ini. Nilai radius dan offset tetap dapat dikalibrasi. DEX awal/reset juga memiliki alpha 128; alur pengaturan dan pemuatan memakai setengah alpha teks (127 pada teks 100%).

Radius Android dikonversi menjadi Canvas shadowBlur: `radius > 0 ? 2 × (0,57735 × radius + 0,5) : 0`. Konversi dihitung pada resolusi hasil sebelum dikalikan skala preview. Pada acuan 1280: radius 2 menjadi shadowBlur 3,3094. Pada 4096: radius 6,4 menjadi shadowBlur 8,39008. Nilai 2 tidak disalin langsung sebagai shadowBlur.

Sumber teknis:
- Android Paint shadow: https://developer.android.com/reference/android/graphics/Paint#setShadowLayer(float,float,float,int)
- Konversi radius/sigma: https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/libs/hwui/utils/Blur.cpp
- Canvas shadows: https://html.spec.whatwg.org/multipage/canvas.html#shadows

DEX memakai lebar bitmap sensor internal sebelum rotasi. Web tetap memakai sisi panjang foto yang telah dinormalisasi karena acuan ini sudah mendekati foto pengguna; data orientasi buffer sensor asli tidak tersedia dari semua gambar unggahan. Label Acuan DEX berarti mengikuti model/parameter kode yang diperiksa, bukan jaminan kesamaan semua jalur kamera atau piksel foto.

Bayangan luar digambar terpisah dengan sumber huruf berada di luar kanvas dan offset kompensasi; hanya bayangannya yang masuk area foto. Inti digambar berikutnya tanpa shadow, kemudian teks utama tanpa shadow tambahan. Ini mencegah penumpukan huruf utama dan pengurangan alpha dua kali. Radius 0 menonaktifkan bayangan pada mode DEX seperti Android. Pada Berlapis, radius 0 menghasilkan bayangan luar keras bila offset tidak nol.

Preset Tipis, v1.3, PixelLab, dan APK lama tetap mempertahankan jalur render sebelumnya. Preset tersimpan tanpa shadowMode dimuat sebagai satu lapisan. Detail 100% memperhitungkan luas kedua lapisan. Hasil belum dikalibrasi ulang terhadap contoh keluaran aplikasi asli yang menunjukkan inti bayangan; perbandingan visual masih diperlukan.

## Versi 1.4.1: latar pemeriksaan bayangan

Detail teks 100% menyediakan Putih bersih (#FFFFFF, bawaan), Abu-abu terang (#E5E7EB), serta Foto saat ini. Latar netral hanya untuk pemeriksaan teks dan bayangan; peta/foto tidak ditampilkan pada detail netral. Ukuran teks, posisi, warna, blur, offset, opasitas, dan latar teks yang diatur pengguna tetap mengikuti editor.

Untuk membandingkan piksel detail dengan unduhan, gunakan Foto saat ini dan format PNG. Pergantian latar pemeriksaan tidak mengubah pratinjau foto utama atau file ekspor; PNG fixture Chrome identik sebelum/sesudah pergantian latar.

## Versi 1.4: penyesuaian bayangan manual

Bawaan Tipis memakai hitam 35%, blur 1 dan offset X/Y 0,75 pada acuan sisi panjang 1280. Pada ekspor 2448 × 3264, blur menjadi 2,55 px dan offset sekitar 1,91 px. Angka ini adalah titik awal yang disetujui untuk mengurangi kegelapan bayangan; belum dikalibrasi ulang terhadap foto aplikasi asli pengguna.

Preset versi 1.3 mempertahankan hitam 55%, blur dan offset 1,25. Semua preset menyertakan warna; preset tersimpan lama yang belum memiliki warna memakai hitam. Skala blur serta offset PixelLab/APK tidak diubah. Font dan baseline dipertahankan.

Panel bayangan mendukung warna, opasitas 0–100%, blur 0–6, serta offset X/Y −5 sampai 5. Blur/offset memakai langkah 0,05. Detail per baris memakai potongan tanpa penskalaan dari render resolusi penuh; pengujian Chrome membandingkannya dengan PNG unduhan dan memperoleh selisih nol pada fixture.

## Versi 1.3: bayangan foto referensi dan Google Maps

Bawaan baru memakai bayangan hitam 55%, blur 1,25 dan offset X/Y 1,25 pada acuan sisi panjang 1280. Pada ekspor 2448 × 3264 panjang tersebut menjadi sekitar 3,19 piksel. Efek diarahkan ke kanan bawah, lebih tegas daripada acuan PixelLab lama. Nilai ini merupakan penyesuaian visual terhadap foto pengguna terbaru, bukan hasil ekstraksi angka dari aplikasi asli. Ukuran, posisi, dan ketebalan huruf tidak berubah.

Canvas tidak menskalakan shadowBlur/shadowOffset mengikuti transform teks. Renderer kini mengalikan panjang bayangan dengan skala pratinjau secara eksplisit agar pratinjau dan ekspor sebanding. Preset PixelLab dan APK tetap tersedia.

Google Maps ditambahkan melalui Map Tiles API resmi, dengan API key pengguna, roadmap bahasa Indonesia, dan atribusi data dari viewport. OpenStreetMap tetap menjadi pilihan terpisah. Pengujian alur Google menggunakan respons simulasi; akses peta Google sebenarnya memerlukan API key dan billing aktif. Catatan versi 1.2 dan 1.1 berikut dipertahankan sebagai riwayat.

## Versi 1.2: ponsel, ketebalan, dan bayangan

Versi terbaru memakai Roboto variabel dengan weight 380, bukan Regular 400 yang tetap. Pengukuran tinta putih menunjukkan varian Light 300 terlalu tipis pada referensi, sehingga dipilih penyesuaian yang lebih halus. Pengguna tetap dapat memilih weight 250–500. Pratinjau kini dirender hingga sisi panjang 2000 piksel untuk mengurangi kehilangan detail huruf pada layar rapat piksel.

Bayangan bawaan mengikuti angka PixelLab yang diberikan pengguna: opasitas 34%, offset X=2 dan Y=2 pada kanvas referensi 2448 × 3264. Offset diskalakan relatif terhadap sisi panjang 3264; pada ekspor 2448 × 3264 hasilnya tepat 2 piksel per sumbu. Blur tetap dapat diatur karena angka radius PixelLab belum diketahui. Acuan APK (50%, offset 1/1 pada skala 1280) disediakan sebagai pilihan terpisah, bukan diklaim sama dengan acuan PixelLab.

Peta otomatis memakai OpenStreetMap sesuai pilihan pengguna, dengan pin merah dan opasitas 65%. Atribusi digambar terpisah agar tetap terbaca. Tidak menambahkan logo Google pada data OpenStreetMap.

Angka selisih 0,75 piksel di bawah adalah hasil historis **versi 1.1 dengan Roboto Regular 400**, bukan klaim untuk versi 1.2 yang menggunakan font dan ketebalan baru. Pada pembanding yang sama, batas teks versi 1.2 masih dekat (rata-rata sekitar 2 piksel), dengan bentuk yang sedikit lebih ringan. Tidak ada klaim identik per piksel atau pengujian langsung pada perangkat fisik Pixel/Poco.

## Catatan pengukuran versi 1.1

Kalibrasi dilakukan terhadap foto referensi pengguna dengan orientasi tampilan 3072 × 4096 piksel, setelah rotasi EXIF dinormalisasi. Foto dan teks lokasi referensi tidak disertakan dalam repository ini.

## Perubahan

- Ukuran internal Medium tetap **40**, menghasilkan ukuran font **128 piksel** pada sisi panjang referensi 4096 piksel. Tinggi huruf hasil pengukuran sudah dekat dengan foto asli sehingga tidak perlu dibesarkan.
- Jarak tambahan antarbaris berubah dari **4** menjadi **10,25** unit referensi, setara **32,8 piksel** pada foto pembanding.
- Susunan baris dihitung dari bawah ke atas menggunakan tinggi batas tinta huruf tiap baris. Huruf yang turun di bawah garis dasar seperti `g` memengaruhi langkah baris, seperti jalur render aplikasi Android.
- Perataan kanan menggunakan lebar batas tinta huruf, bukan hanya lebar advance tipografis Canvas. Ini mengikuti perilaku `getTextBounds` yang ditemukan pada APK.
- Margin pengguna tetap nol, dengan inset internal seperempat ukuran font: **32 piksel** pada referensi. Margin kanan huruf yang terlihat dapat berbeda karena bentuk dan bearing huruf.
- Bayangan hitam memakai **50% opasitas**, radius **6,4 piksel**, dan pergeseran X/Y **3,2 piksel** pada referensi. Nilai alpha setengah opasitas teks serta skala radius/pergeseran diperiksa pada kode APK. Kekuatan bayangan tidak dapat diukur secara pasti dari latar foto yang sangat gelap saja.
- Kontrol kekuatan, kelembutan, dan pergeseran bayangan kini tersedia di editor.

## Hasil pengukuran

Area teks putih diisolasi dengan ambang RGB minimum lebih dari 180. Untuk tiap baris dibandingkan tepi kiri, kanan, atas, dan bawah. Rata-rata selisih absolut 28 koordinat tersebut:

| Preset | Selisih rata-rata |
| --- | ---: |
| Sebelum kalibrasi | 41,96 piksel |
| Sesudah kalibrasi | 0,75 piksel |

Bagian atas baris pertama berubah dari y=3257 menjadi y=3129, sama dengan foto referensi. Bagian bawah baris terakhir berada di y=4090, juga sama dengan referensi. Perbedaan kecil pada lebar dan antialiasing beberapa kata masih ada.

Ini ukuran kesesuaian posisi batas teks pada satu foto, **bukan persentase kemiripan seluruh gambar**. Peta tidak dimasukkan dalam metrik. Hasil browser, font kustom, resolusi, isi teks, dan rasio foto lain dapat memberikan perbedaan. Pratinjau dan ekspor memakai fungsi render yang sama.

## Menyesuaikan preset lewat source

Nilai bawaan berada dalam `defaultStyle()` pada `renderer.js`. `fontSize` memakai skala sisi panjang foto dibagi 1280; `lineGap`, `shadowBlur`, dan `shadowOffset` memakai skala yang sama. `marginX` dan `marginY` adalah tambahan margin dalam persen ukuran foto. Seluruh nilai tersebut juga dapat diubah melalui antarmuka.
