# Kalibrasi preset Timestamp Camera

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
