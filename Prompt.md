# Prompt.md — Blueprint "iKomers Cookies"

Dokumen ini adalah **spesifikasi lengkap + prompt siap pakai** untuk membangun ulang website
e-commerce cookies ini **persis sama**, dari nol, dan **langsung bisa di-hosting ke Vercel
tanpa kendala**.

> Cara pakai: salin **Bagian 4 (PROMPT UTAMA)** ke AI coding agent / chat, lalu lampirkan
> **Bagian 5–9** sebagai konteks. Atau serahkan seluruh file ini sebagai instruksi tunggal.

---

## 1. GOALS (Tujuan)

| # | Tujuan | Ukuran keberhasilan |
|---|--------|---------------------|
| G1 | Membuat toko online cookies yang **berfungsi penuh di sisi klien** | Bisa browsing → add to cart → checkout → struk, semua tanpa server |
| G2 | **Mudah di-deploy ke Vercel** | Import repo → Deploy → langsung jalan, 0 konfigurasi, 0 error build |
| G3 | **Murni frontend** (tanpa backend) | Tidak ada API route, serverless function, database, atau rahasia apa pun |
| G4 | **Mudah diedit orang non-programmer** | Ganti produk/stok cukup edit 1 file JSON; ganti warna cukup edit 1 blok CSS |
| G5 | Struktur **multi-halaman** agar tiap file mudah dikelola | 1 halaman = 1 file HTML + 1 file JS pendamping |
| G6 | Tampilan **profesional & responsif** | Rapi di HP (360px) sampai desktop (1920px) |
| G7 | **Tanpa error** di console browser | Console bersih di semua halaman |

---

## 2. RULES (Aturan Wajib — tidak boleh dilanggar)

### 2.1 Arsitektur
1. **100% frontend.** Hanya HTML, CSS, dan JavaScript vanilla. Tidak ada Node.js/Express,
   PHP, Python, atau bahasa server apa pun di dalam aplikasi.
2. **Tanpa backend.** Dilarang membuat: API route, serverless function (`/api/*`), database,
   ORM, autentikasi server, webhook, cron job, atau environment variable rahasia.
3. **Tanpa proses build.** Tidak ada bundler (Webpack/Vite/Rollup), tidak ada transcompiler
   (TypeScript/Babel/Sass), tidak ada `npm install` yang wajib untuk menjalankan aplikasi.
4. **Semua state di `localStorage`.** Keranjang, stok terpakai, riwayat pesanan, dan kode promo.
5. **Semua data produk di satu file JSON** (`data/products.json`) yang diambil dengan `fetch()`.
6. **Tidak ada panggilan ke API pihak ketiga** untuk data inti. QRIS digenerate sendiri di
   `<canvas>` (offline), bukan dari layanan QR online.

### 2.2 Kompatibilitas Vercel
7. **Semua path bersifat relatif** — tulis `assets/css/style.css`, **bukan** `/assets/css/style.css`.
   Ini membuat situs aman di root domain, preview deployment, maupun sub-path.
8. **Nama file & folder wajib huruf kecil, tanzpa spasi, tanpa karakter khusus.**
   Vercel berjalan di Linux yang **case-sensitive**; `Style.css` ≠ `style.css` akan error.
9. **Tidak ada `package.json` dengan `build` script yang bisa gagal.** Situs murni statis.
10. **Tidak ada file server lokal yang ikut ter-deploy** (`server.js`, `*.bat`) — kecualikan
    lewat `.vercelignore`.
11. **Semua resource eksternal memakai `https://`** (Bootstrap, ikon, SweetAlert2, Google Fonts)
    agar tidak ada *mixed content* yang diblokir browser.
12. **Tidak ada karakter non-ASCII pada nama file.** Emoji hanya boleh di dalam isi file
    (JSON/JS/HTML) dengan encoding UTF-8.

### 2.3 Kualitas kode
13. **Nol error di console** pada semua halaman. Peringatan sebaiknya juga nol.
14. **Setiap halaman punya JS sendiri** (`home.js`, `cart-page.js`, `checkout.js`, `about.js`)
    supaya mengedit satu halaman tidak merusak halaman lain.
15. **Logika bersama hanya di `app.js`** (navbar, footer, keranjang, helper, data produk).
16. **Navbar, footer, dan panel Menu Pesanan dirender oleh `app.js`** → diedit sekali, berlaku
    di semua halaman. Jangan menyalin-tempel HTML yang sama ke 4 file.
17. **Selalu ada fallback.** Jika `fetch('data/products.json')` gagal, pakai data cadangan di
    `assets/js/products.js` agar halaman tidak pernah kosong.
18. **Semua input user divalidasi** sebelum lanjut langkah berikutnya.
19. **Semua nilai uang diformat Rupiah** dengan pemisah ribuan (`Rp25.000`).
20. **Semua teks antarmuka berbahasa Indonesia.**

---

## 3. ATURAN DEPLOY VERCEL

### 3.1 Yang harus ada
- `index.html` di **root** folder (Vercel otomatis menjadikannya halaman utama `/`).
- File statis lain (`*.html`, `assets/`, `data/`) di root atau subfolder biasa.
- `.vercelignore` untuk mengecualikan file dev.

### 3.2 Yang dilarang
- ❌ `vercel.json` dengan `builds`/`routes` yang rumit (tidak diperlukan).
- ❌ `api/` folder, `functions`, atau `serverless` config.
- ❌ `package.json` berisi `"build": "..."` yang bergantung dependency.
- ❌ Path absolut (`/assets/...`) karena bisa patah di preview deployment.
- ❌ File dengan huruf besar/kecil tidak konsisten (`Data/products.json` vs `data/products.json`).

### 3.3 Langkah deploy (harus berhasil tanpa setting apa pun)
```
1. Push project ke GitHub.
2. Buka vercel.com → Add New → Project → Import repo tersebut.
3. Framework Preset : Other
   Build Command     : (kosongkan)
   Output Directory  : (kosongkan / .)
   Install Command   : (kosongkan)
4. Klik Deploy.
5. Selesai — situs langsung online.
```
Alternatif tanpa GitHub: `npx vercel` di folder project, tekan Enter pada semua pertanyaan
(default sudah benar).

### 3.4 Hasil yang diharapkan setelah deploy
- `/` menampilkan beranda dengan 10 produk.
- `data/products.json` bisa diakses langsung di browser (`/data/products.json`) dan
  mengembalikan JSON valid.
- Add to cart, checkout, struk, dan riwayat pesanan berfungsi normal.
- Tidak ada error 404 pada aset.

---

## 4. PROMPT UTAMA (siap disalin)

```
Buatkan sebuah website e-commerce bernama "iKomers Cookies" yang menjual cookies artisan.
Bangun PERSIS sesuai spesifikasi di dokumen ini (Bagian 5 sampai 9).

RINGKASAN PRODUK:
- 10 varian cookies, tiap produk punya foto, nama, deskripsi, kategori, harga, harga coret,
  rating, jumlah terjual, berat, stok, dan emoji cadangan.
- Foto produk memakai file lokal di assets/img/ (Unsplash/Pexels, lisensi bebas komersial).

STRUKTUR:
index.html (beranda), cart.html (menu pesanan), checkout.html (wizard 4 langkah),
about.html (tentang + FAQ + riwayat pesanan), data/products.json (sumber data & stok),
assets/css/style.css, assets/js/{app.js, home.js, cart-page.js, checkout.js, about.js, products.js}.

TEKNOLOGI (via CDN, tanpa build step):
Bootstrap 5.3.3, Bootstrap Icons 1.11.3, SweetAlert2 v11, Google Fonts
(Fraunces untuk judul, Plus Jakarta Sans untuk isi). JavaScript vanilla, ES6.

FITUR WAJIB:
1. Navbar fixed-top + badge jumlah item keranjang (dirender oleh app.js). Tinggi navbar
   diukur otomatis ke CSS variable --nav-h dan dipakai sebagai padding-top body.
2. Header Product: hero + kartu produk unggulan.
3. Card Product: foto, badge kategori, badge diskon, rating, terjual, berat, indikator stok.
4. Order Menu: panel keranjang berupa offcanvas Bootstrap + halaman cart.html.
5. Add to cart dengan validasi stok, notifikasi SweetAlert2 toast, tersimpan di localStorage.
6. Sort by category & items: filter kategori, pencarian teks, 8 opsi pengurutan.
7. Toolbar produk (pencarian + kategori + sortir) full-width & sticky di bawah navbar:
   saat menempel jadi menu bar beranimasi (kelas .is-stuck + keyframes barDrop), lalu
   otomatis lepas saat keluar dari section #produk.
8. Stok dibaca dari data/products.json, otomatis berkurang setelah pesanan dikonfirmasi.
9. Halaman About: cerita, timeline, nilai, FAQ accordion, kontak, riwayat pesanan.
10. Checkout wizard 4 langkah: Keranjang → Data Pemesan → Pembayaran → Selesai (struk).
11. Simulasi pembayaran QRIS (QR digenerate di canvas + countdown 15 menit) dan Cash/tunai.
12. Struk yang bisa dicetak dan dikirim ke WhatsApp.
13. Kode promo COOKIE10 (diskon 10%) dan ONGKIRGRATIS.
14. Tombol "Reset Data Demo" di footer.

ATURAN KERAS (WAJIB DIPATUHI):
- MURNI FRONTEND. Tanpa backend, tanpa API route, tanpa serverless function, tanpa database,
  tanpa environment variable rahasia.
- TANPA build step. Tidak ada bundler, tidak ada TypeScript/Sass, tidak ada npm install wajib.
- HARUS langsung bisa di-deploy ke Vercel dengan konfigurasi default (Framework: Other,
  Build Command kosong, Output Directory kosong) TANPA error sedikit pun.
- Semua path relatif (assets/... bukan /assets/...).
- Semua nama file huruf kecil tanpa spasi (Vercel/Linux case-sensitive).
- Semua resource eksternal https.
- Nol error di console pada semua halaman.
- Semua state (keranjang, stok, pesanan, promo) disimpan di localStorage.
- Selalu ada fallback data bila fetch JSON gagal.
- Semua teks antarmuka berbahasa Indonesia, harga diformat Rupiah.

Keluarkan kode lengkap semua file, siap pakai, tanpa placeholder.
```

---

## 5. SPESIFIKASI TEKNIS

### 5.1 Stack
| Bagian | Teknologi | Sumber |
|---|---|---|
| Layout & komponen | Bootstrap 5.3.3 | `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css` |
| Komponen interaktif | Bootstrap Bundle JS 5.3.3 | `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js` |
| Ikon | Bootstrap Icons 1.11.3 | `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css` |
| Notifikasi & dialog | SweetAlert2 v11 | `https://cdn.jsdelivr.net/npm/sweetalert2@11` |
| Font | Fraunces + Plus Jakarta Sans | Google Fonts |

### 5.2 Struktur folder (wajib persis)
```
/
├── index.html
├── cart.html
├── checkout.html
├── about.html
├── data/
│   └── products.json
├── assets/
│   ├── img/                  # 10 foto produk, 900×900 px, .jpg
│   │   ├── choco-chip-classic.jpg
│   │   ├── double-chocolate-fudge.jpg
│   │   ├── red-velvet-crunch.jpg
│   │   ├── matcha-white-choco.jpg
│   │   ├── oatmeal-raisin.jpg
│   │   ├── peanut-butter-blossom.jpg
│   │   ├── almond-cranberry.jpg
│   │   ├── lotus-biscoff-caramel.jpg
│   │   ├── cheese-butter-cookies.jpg
│   │   └── salted-caramel-brownie.jpg
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── products.js       # cadangan data (fallback)
│       ├── app.js            # core / shared
│       ├── home.js
│       ├── cart-page.js
│       ├── checkout.js
│       └── about.js
├── server.js                 # HANYA untuk dev lokal, tidak di-deploy
├── jalankan-server.bat       # HANYA untuk dev lokal, tidak di-deploy
├── .vercelignore
├── README.md
└── Prompt.md
```

### 5.3 Skema data produk (`data/products.json`)
Array objek. Urutan kunci: `id, name, category, price, oldPrice, stock, rating, sold, weight,
image, emoji, tone, tags, featured, description`.

| Kunci | Tipe | Keterangan |
|---|---|---|
| `id` | string | Kode unik, format `CK-0xx` |
| `name` | string | Nama produk |
| `category` | string | Kategori filter: `Klasik`, `Cokelat`, `Premium`, `Kacang`, `Sehat` |
| `price` | number | Harga jual (Rupiah, tanpa desimal) |
| `oldPrice` | number | Harga coret. `0` = tidak ada diskon |
| `stock` | number | Stok. `0` = tampil "Stok Habis" & tombol nonaktif |
| `rating` | number | 0–5, satu desimal |
| `sold` | number | Jumlah terjual |
| `weight` | string | mis. `"180 gr"` |
| `image` | string | Path relatif foto, mis. `assets/img/choco-chip-classic.jpg` |
| `emoji` | string | **Cadangan** bila foto gagal dimuat |
| `tone` | string | Warna hex latar kartu |
| `tags` | string[] | Label di pojok kartu, mis. `["Best Seller"]` |
| `featured` | boolean | Boleh muncul di kartu unggulan hero |
| `description` | string | Deskripsi 1–3 kalimat |

**Data 10 produk (persis):**

| id | name | category | price | oldPrice | stock | rating | sold | weight | image | emoji | tone | tags | featured |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CK-001 | Choco Chip Classic | Klasik | 25000 | 30000 | 42 | 4.8 | 1280 | 180 gr | choco-chip-classic.jpg | 🍪 | #c98b52 | Best Seller | ✔ |
| CK-002 | Double Chocolate Fudge | Cokelat | 32000 | 38000 | 28 | 4.9 | 980 | 200 gr | double-chocolate-fudge.jpg | 🍫 | #6b3f2a | Favorit | ✔ |
| CK-003 | Red Velvet Crunch | Premium | 35000 | 0 | 16 | 4.7 | 640 | 200 gr | red-velvet-crunch.jpg | 🍒 | #b3233b | Premium | – |
| CK-004 | Matcha White Choco | Premium | 33000 | 0 | 21 | 4.8 | 720 | 200 gr | matcha-white-choco.jpg | 🍵 | #6f9b52 | Premium, Baru | ✔ |
| CK-005 | Oatmeal Raisin | Sehat | 27000 | 0 | 35 | 4.5 | 410 | 190 gr | oatmeal-raisin.jpg | 🌾 | #c2a26a | Sehat | – |
| CK-006 | Peanut Butter Blossom | Kacang | 30000 | 0 | 24 | 4.6 | 560 | 190 gr | peanut-butter-blossom.jpg | 🥜 | #d09a4e | – | – |
| CK-007 | Almond Cranberry | Kacang | 34000 | 0 | 18 | 4.7 | 480 | 200 gr | almond-cranberry.jpg | 🌰 | #9c5a3c | – | – |
| CK-008 | Lotus Biscoff Caramel | Premium | 36000 | 42000 | 12 | 4.9 | 890 | 200 gr | lotus-biscoff-caramel.jpg | 🍯 | #a9662f | Best Seller | ✔ |
| CK-009 | Cheese Butter Cookies | Klasik | 28000 | 0 | 30 | 4.4 | 350 | 180 gr | cheese-butter-cookies.jpg | 🧈 | #e0b64a | – | – |
| CK-010 | Salted Caramel Brownie | Cokelat | 37000 | 0 | 0 | 4.8 | 1020 | 220 gr | salted-caramel-brownie.jpg | 🍮 | #7a4a2b | Habis | – |

**Deskripsi (persis):**
- **CK-001** — "Cookies klasik dengan taburan choco chip premium yang lumer di setiap gigitan. Renyah di luar, lembut di dalam, teman terbaik untuk kopi atau susu hangat."
- **CK-002** — "Dua lapis cokelat dark dan susu dengan tekstur fudge yang chewy. Untuk kamu yang tidak bisa kompromi soal cokelat."
- **CK-003** — "Adonan red velvet lembut dengan white chocolate chunk dan taburan crunch di atasnya. Cantik untuk hantaran, enak untuk diri sendiri."
- **CK-004** — "Matcha Jepang grade ceremonial dipadukan white chocolate manis. Pahit lembut yang elegan dan tidak bikin enek."
- **CK-005** — "Oatmeal utuh, kismis manis alami, dan sedikit kayu manis. Pilihan paling ramah untuk sarapan atau teman diet seimbang."
- **CK-006** — "Selai kacang creamy dengan cokelat di tengahnya. Gurih, manis, dan bikin susah berhenti di satu buah."
- **CK-007** — "Almond panggang yang renyah bertemu cranberry kering yang asam-manis. Kombinasi tekstur yang bikin ketagihan."
- **CK-008** — "Biscoff spread melimpah dengan saus karamel asin di atasnya. Varian paling sering dicari dan paling cepat habis."
- **CK-009** — "Butter cookies gurih dengan keju cheddar parut. Renyah, ringan, dan cocok jadi camilan seluruh keluarga."
- **CK-010** — "Brownie cookies dengan salted caramel yang meleleh di tengahnya. Sedang kosong, tapi selalu kembali setiap akhir pekan."

### 5.4 Kunci `localStorage`
| Kunci | Isi |
|---|---|
| `ikomers.cart.v1` | `[{ id, qty }]` |
| `ikomers.stock.v1` | `{ "CK-001": 40, ... }` — override stok setelah pesanan |
| `ikomers.orders.v1` | Array pesanan (maks. 50 terbaru) |
| `ikomers.promo.v1` | String kode promo aktif |

### 5.5 Logika bisnis
- **Keranjang:** array `{id, qty}`. `availableStock = stokProduk - qtyDiKeranjang`.
- **Stok:** dibaca dari JSON. Setelah pesanan dikonfirmasi, stok baru disimpan sebagai
  *override* di `localStorage` (file JSON tidak diubah). Tombol **Reset Data Demo** menghapus
  override agar kembali ke angka JSON.
- **Ongkir:** `pickup` = Rp0; `delivery` = Rp15.000, **gratis** jika subtotal ≥ Rp150.000.
- **Promo:** `COOKIE10` = diskon 10% dari subtotal; `ONGKIRGRATIS` = ongkir jadi Rp0.
- **Total:** `max(0, subtotal − diskon + ongkir)`.
- **Kode pesanan:** `IKC-YYMMDD-XXXX` (XXXX acak alfanumerik).
- **QRIS:** QR digenerate di `<canvas>` 29×29 modul (finder pattern di 3 sudut + pola acak
  deterministik dari *seed* kode pesanan). **Tidak memakai layanan QR online.**
- **Countdown QRIS:** 15 menit, tombol "Muat ulang QR" mereset.
- **Nomor WhatsApp** disimpan sebagai satu konstanta di `app.js`.

---

## 6. SPESIFIKASI HALAMAN

### 6.1 Global (dirender `app.js` di semua halaman)
- **Navbar fixed-top** — brand `🍪 iKomers / Cookies Artisan`, 4 menu
  (Beranda, Produk → `index.html#produk`, Menu Pesanan, Tentang), dan tombol pil
  "Menu Pesanan" dengan badge jumlah item. Menu aktif ditandai dari `document.body.dataset.page`.
  Tinggi navbar diukur otomatis oleh `IK.syncNavHeight()` dan ditulis ke CSS variable
  `--nav-h` (dipakai untuk `body { padding-top }` dan offset elemen sticky).
- **Footer** — 4 kolom: brand + sosial media, Navigasi, Bantuan, dan blok **Demo Data**
  berisi tombol **Reset Data Demo**. Baris bawah: copyright + tahun otomatis.
- **Offcanvas "Menu Pesanan"** — daftar item, tombol +/− jumlah, hapus, subtotal,
  total berat, progres gratis ongkir, tombol Checkout, Kelola Keranjang, Kosongkan.

### 6.2 `index.html` — Beranda
1. **Header Product**: badge promo, judul besar, subjudul, 2 CTA (Lihat Menu, Menu Pesanan),
   3 statistik (10 varian / 4.7★ / 7.300+ box), dan **kartu produk unggulan**.
2. **Toolbar sticky full-width** — input pencarian, pill filter kategori (Semua + 5 kategori),
   dropdown **8 opsi urutan** — Paling Populer, Terbaru, Harga Terendah, Harga Tertinggi,
   Nama A–Z, Nama Z–A, Rating Tertinggi, Stok Terbanyak — plus info jumlah hasil & Reset filter.
   Toolbar dibungkus `.toolbar-sticky` (anak langsung `#produk`) dengan `position: sticky;
   top: var(--nav-h)`. Saat menyentuh navbar, `home.js` menambah kelas `.is-stuck` →
   latar belakang semi-transparan + blur, garis bawah, bayangan, dan animasi `barDrop`
   (turun halus). Kelas dilepas otomatis saat section `#produk` selesai di-scroll, sehingga
   toolbar "naik kembali" bersama section-nya. Di layar ≤ 991.98px: susunan jadi satu kolom,
   pill bisa digeser horizontal, dan baris info disembunyikan saat menempel.
3. **Grid Card Product** — 4 kolom (desktop), 2 kolom (tablet/HP).
4. **3 kartu keunggulan** dan **blok About teaser** gelap menuju `about.html`.

### 6.3 `cart.html` — Menu Pesanan
- Daftar item dengan thumbnail, harga satuan, stepper jumlah, hapus, subtotal per baris.
- Panel ringkasan sticky (kelas `.sticky-panel`, `top: calc(var(--nav-h) + 20px)`; nonaktif di layar kecil):
  subtotal, estimasi ongkir, total berat, diskon, total bayar.
- Input **kode promo** + tombol Pakai.
- Tombol **Lanjut ke Checkout** dan **Kosongkan Keranjang**.
- Empty state bila keranjang kosong.

### 6.4 `checkout.html` — Wizard 4 langkah
Indikator langkah di atas (Keranjang → Data Pemesan → Pembayaran → Selesai), ringkasan sticky
di kanan, dan navigasi Kembali/Lanjut.

1. **Keranjang** — periksa item, ubah jumlah, hapus.
2. **Data Pemesan** — Nama*, No. WhatsApp*, Email, Tanggal, **Metode pengiriman**
   (Delivery/Pickup), Alamat* (wajib & otomatis disembunyikan bila Pickup), Catatan.
   Validasi: nama ≥ 3 karakter, telepon 10–16 digit angka, email format valid, alamat ≥ 10 karakter.
3. **Pembayaran** — pilih **QRIS** atau **Cash**.
   - QRIS: canvas QR, total, countdown 15:00, tombol "Simulasi: Saya Sudah Bayar" & "Muat ulang QR".
   - Cash: instruksi langkah-langkah + total yang harus disiapkan.
4. **Selesai** — struk (kode pesanan, tanggal, status, data pemesan, item, subtotal, diskon,
   ongkir, TOTAL, metode bayar) + tombol **Cetak Struk**, **Kirim ke WhatsApp**, **Kembali ke Beranda**.

Perilaku saat konfirmasi: dialog SweetAlert → indikator loading ±1,8 detik → simpan pesanan →
potong stok → kosongkan keranjang → tampilkan struk.

### 6.5 `about.html` — Tentang
Hero, cerita perusahaan, 4 statistik, **timeline** 4 tahap, 3 kartu nilai, **Riwayat Pesanan**
(dari `localStorage`), **FAQ accordion** 5 pertanyaan (termasuk "bagaimana mengubah stok"),
dan blok kontak (alamat, jam buka, telepon, email).

---

## 7. SPESIFIKASI DESAIN

### 7.1 Design token (di `:root` pada `style.css`)
```css
--cream: #fff8ef;      --cream-2: #fdeedd;   --cream-3: #f7e3cd;
--brown-900: #2c1a0f;  --brown-800: #402516; --brown-700: #5a3520; --brown-500: #8a6547;
--caramel: #c9803f;    --caramel-600: #b06c2f; --caramel-100: #f8e6d1;
--pink: #e2688a;       --ok: #2e9e6b;        --warn: #e0a02f;      --danger: #d9534f;
--line: rgba(90,53,32,.12);
--shadow: 0 10px 30px rgba(70,40,20,.10);
--shadow-lg: 0 22px 55px rgba(70,40,20,.18);
--radius: 20px;
--nav-h: 76px;          /* tinggi navbar fixed; diukur ulang oleh app.js */
```
- **`body { padding-top: var(--nav-h); overflow-x: clip; }`** — `padding-top` memberi ruang
  untuk navbar fixed; `overflow-x: clip` (bukan `hidden`) dipakai agar `position: sticky`
  di dalam tetap bekerja. Tambahkan `scroll-margin-top: calc(var(--nav-h) + 12px)` pada
  `#produk, #faq, #kontak, #riwayat` agar anchor tidak tertutup navbar.
- Judul: **Fraunces** (serif). Isi: **Plus Jakarta Sans**.
- Tombol utama `.btn-cookie`: gradien karamel, teks putih, `border-radius: 999px`,
  bayangan hangat, efek naik saat hover.
- Kartu produk: sudut 20px, foto `object-fit: cover` + zoom halus saat hover, badge di pojok.
- Semua nilai uang: `Rp` + `toLocaleString('id-ID')`.

### 7.2 Foto produk
- Disimpan **lokal** di `assets/img/`, 900×900 px, JPEG kualitas ~75.
- Ditampilkan sebagai `<img class="media-photo" loading="lazy" decoding="async">` yang
  **menimpa** emoji di lapisan bawah.
- **Fallback wajib:** `onerror="this.remove()"` → emoji otomatis terlihat kembali.
- Halaman unggulan memakai `loading="eager"`.

---

## 8. ACCEPTANCE CRITERIA (Definition of Done)

Sebuah build dinyatakan **lulus** jika seluruh poin ini terpenuhi:

**Fungsional**
- [ ] 10 produk tampil dengan foto, nama, deskripsi, harga, rating, terjual, berat, dan stok.
- [ ] Filter kategori + pencarian + 8 opsi pengurutan bekerja dan hasilnya benar.
- [ ] Add to cart menghormati stok; produk stok 0 tidak bisa ditambahkan.
- [ ] Jumlah item di navbar, offcanvas, dan halaman cart selalu sinkron.
- [ ] Keranjang bertahan setelah refresh (localStorage).
- [ ] Wizard checkout tidak bisa lanjut bila form belum valid.
- [ ] QRIS menampilkan QR + countdown; Cash menampilkan instruksi.
- [ ] Setelah konfirmasi: stok berkurang, keranjang kosong, struk tampil, riwayat tersimpan.
- [ ] Kode promo `COOKIE10` dan `ONGKIRGRATIS` mengubah total dengan benar.
- [ ] "Reset Data Demo" mengembalikan semuanya ke kondisi awal.

**Teknis**
- [ ] **Nol error** di console pada `index.html`, `cart.html`, `checkout.html`, `about.html`.
- [ ] Tidak ada request 404 pada aset.
- [ ] Tidak ada satu pun file backend, API route, atau serverless function.
- [ ] Tidak ada `package.json` build script; aplikasi jalan tanpa `npm install`.
- [ ] Semua path relatif; semua nama file huruf kecil.
- [ ] Responsif mulus dari 360px sampai 1920px.
- [ ] `data/products.json` dapat diakses langsung lewat URL.

**Deploy**
- [ ] Import ke Vercel dengan Framework Preset **Other** tanpa mengubah setting apa pun.
- [ ] Deploy sukses tanpa error/warning build.
- [ ] Situs live berfungsi identik dengan versi lokal.

---

## 9. PROMPT TAMBAHAN (opsional)

**Ganti foto produk:**
```
Ganti foto untuk produk <NAMA PRODUK>. Simpan file baru di assets/img/ dengan nama
huruf kecil tanpa spasi, ukuran persegi minimal 800×800 px, lalu perbarui nilai "image"
pada data/products.json. Pastikan tidak ada path absolut dan tidak ada error 404.
```

**Menambah produk baru:**
```
Tambahkan <N> produk baru ke data/products.json mengikuti skema yang sudah ada
(id, name, category, price, oldPrice, stock, rating, sold, weight, image, emoji, tone,
tags, featured, description). Gunakan id unik lanjutan (CK-011, CK-012, ...),
sertakan foto di assets/img/, dan sinkronkan juga assets/js/products.js sebagai cadangan.
```

**Mengubah tema warna:**
```
Ubah tema website dengan mengganti nilai CSS variable di blok :root pada
assets/css/style.css saja (--caramel, --cream, --brown-900, dst).
Jangan mengubah struktur HTML atau logika JavaScript.
```

**Menambah halaman baru (mis. Kontak):**
```
Buat halaman baru contact.html mengikuti pola halaman yang sudah ada:
sertakan <div id="navbarMount"></div> dan <div id="footerMount"></div>,
set data-page pada <body>, muat Bootstrap + SweetAlert2 + assets/js/products.js +
assets/js/app.js, lalu buat file assets/js/contact.js untuk logika khusus halaman itu.
```

---

## 10. CATATAN PENUTUP

- Aplikasi ini **100% statis**. Semua yang "dinamis" (keranjang, stok, pesanan, promo)
  hidup di `localStorage` browser pengguna.
- Konsekuensinya: **stok tidak tersinkron antar perangkat**. Untuk toko sungguhan,
  lihat bagian "Rekomendasi Update" di `README.md` (butuh backend/database).
- Pembayaran QRIS di sini adalah **simulasi** — tidak ada transaksi uang sungguhan.
  Jangan pernah memakai kode QR ini untuk menerima pembayaran nyata.
