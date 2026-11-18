/* Data cadangan (fallback).
   Dipakai OTOMATIS hanya jika data/products.json tidak bisa dibaca lewat fetch()
   (contoh: halaman dibuka langsung dengan double-click / protokol file://).
   Sumber utama tetap data/products.json - jalankan lewat local server agar JSON dipakai. */
window.COOKIE_PRODUCTS = [
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
    "tags": [
      "Best Seller"
    ],
    "featured": true,
    "description": "Cookies klasik dengan taburan choco chip premium yang lumer di setiap gigitan. Renyah di luar, lembut di dalam, teman terbaik untuk kopi atau susu hangat."
  },
  {
    "id": "CK-002",
    "name": "Double Chocolate Fudge",
    "category": "Cokelat",
    "price": 32000,
    "oldPrice": 38000,
    "stock": 28,
    "rating": 4.9,
    "sold": 980,
    "weight": "200 gr",
    "image": "assets/img/double-chocolate-fudge.jpg",
    "emoji": "🍫",
    "tone": "#6b3f2a",
    "tags": [
      "Favorit"
    ],
    "featured": true,
    "description": "Dua lapis cokelat dark dan susu dengan tekstur fudge yang chewy. Untuk kamu yang tidak bisa kompromi soal cokelat."
  },
  {
    "id": "CK-003",
    "name": "Red Velvet Crunch",
    "category": "Premium",
    "price": 35000,
    "oldPrice": 0,
    "stock": 16,
    "rating": 4.7,
    "sold": 640,
    "weight": "200 gr",
    "image": "assets/img/red-velvet-crunch.jpg",
    "emoji": "🍒",
    "tone": "#b3233b",
    "tags": [
      "Premium"
    ],
    "featured": false,
    "description": "Adonan red velvet lembut dengan white chocolate chunk dan taburan crunch di atasnya. Cantik untuk hantaran, enak untuk diri sendiri."
  },
  {
    "id": "CK-004",
    "name": "Matcha White Choco",
    "category": "Premium",
    "price": 33000,
    "oldPrice": 0,
    "stock": 21,
    "rating": 4.8,
    "sold": 720,
    "weight": "200 gr",
    "image": "assets/img/matcha-white-choco.jpg",
    "emoji": "🍵",
    "tone": "#6f9b52",
    "tags": [
      "Premium",
      "Baru"
    ],
    "featured": true,
    "description": "Matcha Jepang grade ceremonial dipadukan white chocolate manis. Pahit lembut yang elegan dan tidak bikin enek."
  },
  {
    "id": "CK-005",
    "name": "Oatmeal Raisin",
    "category": "Sehat",
    "price": 27000,
    "oldPrice": 0,
    "stock": 35,
    "rating": 4.5,
    "sold": 410,
    "weight": "190 gr",
    "image": "assets/img/oatmeal-raisin.jpg",
    "emoji": "🌾",
    "tone": "#c2a26a",
    "tags": [
      "Sehat"
    ],
    "featured": false,
    "description": "Oatmeal utuh, kismis manis alami, dan sedikit kayu manis. Pilihan paling ramah untuk sarapan atau teman diet seimbang."
  },
  {
    "id": "CK-006",
    "name": "Peanut Butter Blossom",
    "category": "Kacang",
    "price": 30000,
    "oldPrice": 0,
    "stock": 24,
    "rating": 4.6,
    "sold": 560,
    "weight": "190 gr",
    "image": "assets/img/peanut-butter-blossom.jpg",
    "emoji": "🥜",
    "tone": "#d09a4e",
    "tags": [],
    "featured": false,
    "description": "Selai kacang creamy dengan cokelat di tengahnya. Gurih, manis, dan bikin susah berhenti di satu buah."
  },
  {
    "id": "CK-007",
    "name": "Almond Cranberry",
    "category": "Kacang",
    "price": 34000,
    "oldPrice": 0,
    "stock": 18,
    "rating": 4.7,
    "sold": 480,
    "weight": "200 gr",
    "image": "assets/img/almond-cranberry.jpg",
    "emoji": "🌰",
    "tone": "#9c5a3c",
    "tags": [],
    "featured": false,
    "description": "Almond panggang yang renyah bertemu cranberry kering yang asam-manis. Kombinasi tekstur yang bikin ketagihan."
  },
  {
    "id": "CK-008",
    "name": "Lotus Biscoff Caramel",
    "category": "Premium",
    "price": 36000,
    "oldPrice": 42000,
    "stock": 12,
    "rating": 4.9,
    "sold": 890,
    "weight": "200 gr",
    "image": "assets/img/lotus-biscoff-caramel.jpg",
    "emoji": "🍯",
    "tone": "#a9662f",
    "tags": [
      "Best Seller"
    ],
    "featured": true,
    "description": "Biscoff spread melimpah dengan saus karamel asin di atasnya. Varian paling sering dicari dan paling cepat habis."
  },
  {
    "id": "CK-009",
    "name": "Cheese Butter Cookies",
    "category": "Klasik",
    "price": 28000,
    "oldPrice": 0,
    "stock": 30,
    "rating": 4.4,
    "sold": 350,
    "weight": "180 gr",
    "image": "assets/img/cheese-butter-cookies.jpg",
    "emoji": "🧈",
    "tone": "#e0b64a",
    "tags": [],
    "featured": false,
    "description": "Butter cookies gurih dengan keju cheddar parut. Renyah, ringan, dan cocok jadi camilan seluruh keluarga."
  },
  {
    "id": "CK-010",
    "name": "Salted Caramel Brownie",
    "category": "Cokelat",
    "price": 37000,
    "oldPrice": 0,
    "stock": 0,
    "rating": 4.8,
    "sold": 1020,
    "weight": "220 gr",
    "image": "assets/img/salted-caramel-brownie.jpg",
    "emoji": "🍮",
    "tone": "#7a4a2b",
    "tags": [
      "Habis"
    ],
    "featured": false,
    "description": "Brownie cookies dengan salted caramel yang meleleh di tengahnya. Sedang kosong, tapi selalu kembali setiap akhir pekan."
  }
]
;
