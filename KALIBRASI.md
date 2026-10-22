# Kalibrasi preset Timestamp Camera

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
