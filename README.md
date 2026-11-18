# 🍪 iKomers Cookies — E-Commerce Cookies (HTML, CSS, JS)

Website e-commerce statis untuk toko cookies artisan. Dibuat murni dengan **HTML + CSS + JavaScript**
(tanpa build tools, tanpa framework), memakai **Bootstrap 5** untuk layout, **Bootstrap Icons** untuk ikon,
dan **SweetAlert2** untuk notifikasi/dialog.

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| **Navbar** | **Fixed top** (selalu menempel di atas), responsif, badge jumlah item di keranjang, di-render otomatis oleh `app.js` |
| **Header Product** | Hero section + kartu produk unggulan (pilihan editor) |
| **Card Product** | 10 varian cookies: **foto asli**, nama, deskripsi, harga, harga coret, rating, jumlah terjual, berat, indikator stok |
| **Order Menu** | Panel keranjang (offcanvas) yang bisa dibuka dari mana saja + halaman `cart.html` |
| **Add to Cart** | Validasi stok otomatis, notifikasi toast, keranjang tersimpan di `localStorage` |
| **Toolbar Sticky Beranimasi** | Pencarian + kategori + sortir full-width yang otomatis "menempel" jadi menu bar di bawah navbar saat di-scroll, lalu lepas kembali saat keluar dari section produk |
| **Sort by Category & Items** | Filter kategori, pencarian nama, dan 8 opsi pengurutan (populer, terbaru, harga, nama A–Z, rating, stok) |
| **Stok dari JSON** | Semua data produk & stok berasal dari `data/products.json` |
| **About** | Halaman cerita, nilai, timeline, FAQ (accordion), kontak, dan riwayat pesanan |
| **Checkout Wizard** | 4 langkah: Keranjang → Data Pemesan → Pembayaran → Selesai (struk) |
| **Simulasi Pembayaran** | **QRIS** (QR code + countdown 15 menit) dan **Cash / Tunai** |
| **Struk & Riwayat** | Struk bisa dicetak, dikirim ke WhatsApp, dan tersimpan sebagai riwayat |
| **Promo** | Kode `COOKIE10` (diskon 10%) dan `ONGKIRGRATIS` |

---

## 📁 Struktur Folder

```
ikomers/
├── index.html            # Beranda: Navbar, Header Product, Card Product
├── cart.html             # Menu Pesanan (kelola keranjang)
├── checkout.html         # Checkout wizard 4 langkah
├── about.html            # Tentang kami, FAQ, riwayat pesanan
│
├── data/
│   └── products.json     # ⭐ SUMBER DATA PRODUK & STOK (edit di sini)
│
├── assets/
│   ├── img/              # Foto produk (10 file .jpg, 900×900 px)
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
│   │   └── style.css     # Seluruh tampilan/tema (warna, kartu, wizard, dll)
│   └── js/
│       ├── products.js   # Cadangan data (fallback, dipakai saat mode file://)
│       ├── app.js        # Core: data, keranjang, navbar, footer, order menu, QR
│       ├── home.js       # Logika beranda (filter, sort, card, modal detail)
│       ├── cart-page.js  # Logika halaman Menu Pesanan
│       ├── checkout.js   # Logika wizard checkout & pembayaran
│       └── about.js      # Logika halaman Tentang (riwayat pesanan)
│
├── server.js             # Server statis sederhana (opsional, tanpa install)
├── jalankan-server.bat   # Klik dua kali untuk menjalankan server di Windows
└── README.md
```

> Setiap halaman punya file JS-nya sendiri supaya **mudah diedit tanpa mengganggu halaman lain**.
> Navbar, footer, dan panel Menu Pesanan cukup diedit di satu tempat: `assets/js/app.js`.

---

## 🚀 Cara Menjalankan

### Cara 1 — Paling mudah (Windows)
Klik dua kali file **`jalankan-server.bat`**. Browser akan terbuka di `http://localhost:5500`.

### Cara 2 — Lewat terminal
```bash
node server.js
# buka http://localhost:5500
```

### Cara 3 — Live Server (VS Code)
Install ekstensi **Live Server**, klik kanan `index.html` → *Open with Live Server*.

### Cara 4 — Langsung buka `index.html`
Masih bisa jalan, tetapi browser akan memblokir `fetch()` pada protokol `file://`.
Aplikasi otomatis beralih ke **data cadangan** di `assets/js/products.js`, dan akan muncul
peringatan kecil di halaman produk. **Untuk memakai `data/products.json`, gunakan Cara 1–3.**

---

## 🛠️ Cara Edit

### 1. Mengubah stok / menambah produk (JSON)
Buka **`data/products.json`**, setiap produk berbentuk:

```json
{
  "id": "CK-001",
  "name": "Choco Chip Classic",
  "category": "Klasik",
  "price": 25000,
  "oldPrice": 30000,
  "stock": 42,
  "rating": 4.8,
  "sold": 1280,
  "weight": "180 gr",
  "image": "assets/img/choco-chip-classic.jpg",
  "emoji": "🍪",
  "tone": "#c98b52",
  "tags": ["Best Seller"],
  "featured": true,
  "description": "Deskripsi produk..."
}
```

Keterangan kolom:

| Kolom | Fungsi |
|---|---|
| `id` | Kode unik produk (jangan sampai sama) |
| `stock` | **Stok** yang tampil di website. Set `0` untuk menandai "Stok Habis" |
| `oldPrice` | Harga coret. Set `0` bila tidak ada diskon |
| `category` | Kategori untuk filter (Klasik, Cokelat, Premium, Kacang, Sehat, …) |
| `image` | **Foto produk**. Path relatif dari root, mis. `assets/img/namafile.jpg` |
| `emoji` + `tone` | Cadangan bila foto gagal dimuat + warna latar kartu |
| `tags` | Label kecil di pojok kartu, mis. `["Best Seller"]` |
| `featured` | `true` agar bisa muncul di kartu unggulan hero |

> Setelah mengubah JSON, cukup **refresh halaman**.
> Karena server memakai `Cache-Control: no-cache`, perubahan langsung terbaca.

**Catatan penting:** setelah kamu menyelesaikan sebuah pesanan, stok dikurangi dan disimpan
sebagai "override" di browser. Untuk kembali ke angka di JSON, klik **Reset Data Demo** di footer.

### 1b. Mengganti foto produk
Semua produk sudah memakai foto asli dari folder `assets/img/`. Untuk menggantinya:

1. Simpan foto barumu ke `assets/img/` (disarankan **persegi / 1:1**, minimal 800×800 px, format `.jpg` atau `.webp`).
2. Ubah nilai `image` pada produk di `data/products.json`, contoh:
   `"image": "assets/img/foto-baru-saya.jpg"`
3. Refresh halaman.

Foto ditampilkan dengan `object-fit: cover`, jadi rasio apa pun akan otomatis terpotong rapi
di tengah. Bila foto gagal dimuat, kartu otomatis kembali menampilkan emoji sebagai cadangan —
jadi tampilan tidak akan pernah rusak.

### 2. Mengubah kategori
Kategori filter diambil **otomatis** dari kolom `category` pada JSON. Tidak perlu edit kode.

### 3. Mengubah ongkir, promo, dan nomor WhatsApp
Semua ada di bagian atas **`assets/js/app.js`**:

```js
const SHIPPING = {
  pickup:   { label: "Ambil di toko (Pickup)", cost: 0 },
  delivery: { label: "Dikirim (Delivery)", cost: 15000, freeFrom: 150000 }
};

const PROMOS = {
  COOKIE10:     { type: "percent",  value: 10,  label: "Diskon 10%" },
  ONGKIRGRATIS: { type: "shipping", value: 100, label: "Gratis Ongkir" }
};

const WA_NUMBER = "6281234567890"; // ganti dengan nomor WhatsApp tokomu
```

### 4. Mengubah warna & tampilan
Seluruh tema memakai CSS variable di bagian atas **`assets/css/style.css`**:

```css
:root {
  --caramel: #c9803f;   /* warna utama */
  --cream:   #fff8ef;   /* latar belakang */
  --brown-900: #2c1a0f; /* teks judul */
  ...
}
```

### 5. Menambah / mengubah menu navbar
Edit array `NAV` di **`assets/js/app.js`** — otomatis berlaku di semua halaman.

### 6. Mengatur navbar fixed & toolbar sticky
- **Navbar** memakai kelas Bootstrap `fixed-top`. Tingginya diukur otomatis oleh
  `IK.syncNavHeight()` (`app.js`) dan disimpan ke CSS variable `--nav-h`, sehingga
  konten tidak pernah tertutup navbar meski tingginya berubah (mis. di HP).
- **Toolbar produk** (pencarian + kategori + sortir) dibungkus `.toolbar-sticky`
  yang `position: sticky` di bawah navbar. Saat menyentuh navbar, `home.js`
  menambahkan kelas `.is-stuck` → latar belakang, bayangan, dan animasi
  `barDrop` muncul (jadi "menu bar"). Kelas dilepas otomatis begitu section
  `#produk` selesai di-scroll.
- Ingin mengubah jarak/offset? Cukup ubah nilai `--nav-h` di `:root`
  (`assets/css/style.css`) — nilai asli akan ditimpa hasil pengukuran otomatis.

---

## 🧭 Alur Checkout (Wizard)

1. **Keranjang** — periksa item, ubah jumlah, hapus item.
2. **Data Pemesan** — nama, WhatsApp, email, tanggal, metode pengiriman (Delivery/Pickup), alamat, catatan. Ada validasi.
3. **Pembayaran**
   - **QRIS** → tampil QR code (digenerate di canvas, tanpa internet) + countdown 15 menit + tombol simulasi bayar.
   - **Cash** → instruksi pembayaran tunai saat ambil di toko / kurir tiba.
4. **Selesai** — struk pesanan, tombol cetak, kirim ke WhatsApp, dan riwayat tersimpan.

Setelah pesanan dikonfirmasi: stok otomatis berkurang, keranjang dikosongkan, dan struk tersimpan
di `localStorage` (bisa dilihat di halaman **Tentang → Riwayat Pesanan**).

> ⚠️ Pembayaran di sini **hanya simulasi** untuk keperluan demo. Tidak ada transaksi uang sungguhan.

---

## 🖼️ Sumber & Lisensi Gambar

Foto produk di `assets/img/` diambil dari penyedia stok gratis dengan lisensi bebas pakai
(termasuk untuk keperluan komersial, tanpa wajib atribusi):

| Varian | Penyedia | Foto |
|---|---|---|
| Choco Chip Classic | Unsplash | `photo-1499636136210-6f4ee915583e` |
| Double Chocolate Fudge | Unsplash | `photo-1558961363-fa8fdf82db35` |
| Red Velvet Crunch | Pexels | `photos/14133144` |
| Matcha White Choco | Unsplash | `photo-1757345016219-7b3b8a1b9fba` |
| Oatmeal Raisin | Unsplash | `photo-1598839950984-034f6dc7b495` |
| Peanut Butter Blossom | Unsplash | `photo-1621353354739-1420ff28ead9` |
| Almond Cranberry | Unsplash | `photo-1757345016207-2c62d597cf6b` |
| Lotus Biscoff Caramel | Unsplash | `photo-1611835116900-9771618852d2` |
| Cheese Butter Cookies | Unsplash | `photo-1630782622114-613e6e9c5dc6` |
| Salted Caramel Brownie | Unsplash | `photo-1654178990976-b88c403b3257` |

- **Unsplash License** — https://unsplash.com/license (gratis, komersial boleh, atribusi tidak wajib).
- **Pexels License** — https://www.pexels.com/license (gratis, komersial boleh, atribusi tidak wajib).

> ⚠️ **Untuk toko sungguhan:** sebaiknya ganti dengan **foto produkmu sendiri**.
> Foto stok itu bagus untuk demo, tetapi foto asli cookies-mu akan jauh lebih meyakinkan pembeli,
> lebih akurat, dan bebas dari risiko foto yang sama dipakai toko lain.

---

## 🔧 Rekomendasi Update Selanjutnya

Bagian ini berisi saran pengembangan berikutnya, diurutkan dari yang paling cepat dikerjakan.

### Prioritas Tinggi (cepat & berdampak besar)
1. ~~**Gambar produk asli** — ganti emoji dengan foto cookies (`assets/img/`).~~ ✅ **Sudah dikerjakan.**
   Sisa pekerjaan: ganti dengan **foto produk sendiri** + buat versi `.webp` dan ukuran kecil (`thumb-*.jpg`) untuk mempercepat loading.
2. **Integrasi WhatsApp asli** — ganti `WA_NUMBER` dengan nomor tokomu, dan tambahkan pengiriman otomatis detail pesanan ke admin setiap checkout.
3. **Halaman detail produk terpisah** (`product.html?id=CK-001`) — lebih ramah SEO dibanding modal, dan memudahkan share link produk.
4. **SEO & sosial media** — tambahkan `meta og:image`, `sitemap.xml`, `robots.txt`, dan JSON-LD `Product` + `Offer` agar muncul di Google Shopping.
5. **Perbaikan aksesibilitas** — `aria-label` pada tombol ikon, kontras warna, dan navigasi keyboard penuh pada wizard.

### Prioritas Menengah
6. **Backend sungguhan** — pindahkan stok & pesanan ke database (Node.js + Express + SQLite/PostgreSQL, atau Firebase/Supabase) supaya stok konsisten di semua perangkat, bukan per-browser.
7. **Autentikasi & akun** — login pelanggan, halaman "Pesanan Saya", alamat tersimpan, dan riwayat lintas perangkat.
8. **Payment gateway asli** — Midtrans / Xendit / Duitku untuk QRIS dinamis yang benar-benar terverifikasi otomatis lewat webhook.
9. **Manajemen stok otomatis** — kurangi stok saat pesanan dibuat, kembalikan bila pesanan batal/kedaluwarsa, dan notifikasi stok menipis ke admin.
10. **Panel admin** — CRUD produk, unggah gambar, kelola pesanan, dan ubah status (Diproses → Dikirim → Selesai).
11. **Ongkos kirim otomatis** — integrasi API RajaOngkir/Biteship berdasarkan berat & kota tujuan.

### Prioritas Lanjutan
12. **Pencarian & rekomendasi lebih pintar** — filter rentang harga, filter "bebas kacang/halal", dan *related products*.
13. **Ulasan & rating pembeli** — hanya bisa diisi setelah pembelian terverifikasi.
14. **Wishlist / favorit** dan tombol **beli lagi** dari riwayat pesanan.
15. **PWA** — `manifest.json` + service worker agar bisa diinstal di HP dan dibuka offline.
16. **Analitik** — Google Analytics / Plausible untuk memantau produk terpopuler dan tingkat konversi.
17. **Optimasi aset** — hosting lokal untuk Bootstrap & SweetAlert2 (agar tidak bergantung CDN), minifikasi CSS/JS, dan *lazy loading* gambar.
18. **Multi-bahasa & multi-mata uang** — struktur i18n sederhana untuk pasar luar negeri.
19. **Test otomatis** — Vitest/Jest untuk logika keranjang & perhitungan total, Playwright untuk alur checkout.
20. **Deploy** — GitHub Pages / Netlify / Vercel untuk versi statis, atau VPS + Docker bila sudah memakai backend.

### Ide Fitur Tambahan (opsional)
- Bundling paket (mis. "Box Hemat 6 pcs") dengan harga khusus.
- Gift card & voucher ulang tahun.
- Langganan bulanan (subscription box cookies).
- Live chat / chatbot untuk pertanyaan cepat.
- Estimasi waktu pengiriman & pelacakan pesanan.

---

## 🧩 Dependensi (via CDN)

| Library | Versi | Kegunaan |
|---|---|---|
| Bootstrap | 5.3.3 | Grid, komponen, offcanvas, accordion |
| Bootstrap Icons | 1.11.3 | Ikon |
| SweetAlert2 | 11 | Alert, konfirmasi, toast |
| Google Fonts | — | Fraunces + Plus Jakarta Sans |

Semua library di atas dimuat dari CDN, jadi **butuh koneksi internet** saat pertama kali dibuka.
Bila ingin sepenuhnya offline, unduh file-nya ke `assets/vendor/` lalu ubah tag `<link>`/`<script>`
di setiap file HTML.

---

## 📝 Lisensi

Bebas dipakai dan dimodifikasi untuk keperluan belajar maupun proyek komersial pribadi.

Selamat berjualan! 🍪
