/* ============================================================
   iKomers Cookies — assets/js/app.js
   Logika bersama untuk semua halaman:
   - Memuat produk dari data/products.json (+ fallback)
   - Keranjang belanja (localStorage)
   - Stok (bisa dioverride & dikurangi setelah order)
   - Render Navbar, Footer, dan Menu Pesanan (offcanvas)
   - Helper: format rupiah, notifikasi, QR generator
   ============================================================ */
window.IK = (function () {
  "use strict";

  /* ---------------- Konfigurasi ---------------- */
  const KEY = {
    CART: "ikomers.cart.v1",
    STOCK: "ikomers.stock.v1",
    ORDERS: "ikomers.orders.v1",
    PROMO: "ikomers.promo.v1"
  };

  const SHIPPING = {
    pickup: { label: "Ambil di toko (Pickup)", cost: 0 },
    delivery: { label: "Dikirim (Delivery)", cost: 15000, freeFrom: 150000 }
  };

  const PROMOS = {
    COOKIE10: { type: "percent", value: 10, label: "Diskon 10%" },
    ONGKIRGRATIS: { type: "shipping", value: 100, label: "Gratis Ongkir" }
  };

  const WA_NUMBER = "6281234567890"; // ganti dengan nomor WhatsApp tokomu

  /* ---------------- Helper dasar ---------------- */
  const money = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  const read = (k, fb) => {
    try {
      const v = JSON.parse(localStorage.getItem(k));
      return v === null || v === undefined ? fb : v;
    } catch (e) {
      return fb;
    }
  };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const byId = (id) => document.getElementById(id);

  /* ---------------- Media produk (foto + fallback emoji) ---------------- */
  // Mengembalikan isi kontainer media: emoji sebagai lapisan dasar,
  // lalu foto asli di atasnya. Bila foto gagal dimuat, foto dihapus
  // sehingga emoji otomatis terlihat kembali.
  function mediaHTML(p, opts) {
    const o = opts || {};
    const emoji = '<span class="emoji">' + esc(p.emoji) + "</span>";
    if (!p.image) return emoji;
    const img =
      '<img class="media-photo" src="' + esc(p.image) + '" alt="' + esc(p.name) + '" ' +
      'loading="' + (o.eager ? "eager" : "lazy") + '" decoding="async" ' +
      'onerror="this.remove()">';
    return emoji + img;
  }

  /* ---------------- Notifikasi (SweetAlert2) ---------------- */
  const hasSwal = () => typeof window.Swal !== "undefined";

  const toast = (title, icon) => {
    if (hasSwal()) {
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: icon || "success",
        title: title,
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true
      });
    } else {
      console.log("[toast]", title);
    }
  };

  const alertOk = (title, text) =>
    hasSwal()
      ? Swal.fire({ icon: "success", title: title, text: text || "", confirmButtonColor: "#c9803f" })
      : window.alert(title + (text ? "\n" + text : ""));

  const alertErr = (title, text) =>
    hasSwal()
      ? Swal.fire({ icon: "error", title: title, text: text || "", confirmButtonColor: "#c9803f" })
      : window.alert(title + (text ? "\n" + text : ""));

  const confirmBox = (title, text, okText) =>
    hasSwal()
      ? Swal.fire({
          icon: "question",
          title: title,
          text: text || "",
          showCancelButton: true,
          confirmButtonText: okText || "Ya",
          cancelButtonText: "Batal",
          confirmButtonColor: "#c9803f",
          cancelButtonColor: "#8a6547",
          reverseButtons: true
        }).then((r) => r.isConfirmed)
      : Promise.resolve(window.confirm(title));

  /* ---------------- Produk ---------------- */
  let products = [];
  let fallbackUsed = false;

  function stockOverrides() {
    return read(KEY.STOCK, {});
  }
  function baseStockOf(p) {
    const ov = stockOverrides();
    return ov[p.id] !== undefined ? Number(ov[p.id]) : Number(p.stock) || 0;
  }
  function setStock(id, value) {
    const v = Math.max(0, Number(value) || 0);
    const ov = stockOverrides();
    ov[id] = v;
    write(KEY.STOCK, ov);
    // sinkronkan juga dengan data di memori agar tampilan langsung akurat
    const p = products.find((x) => x.id === id);
    if (p) p.stock = v;
  }
  function resetStock() {
    localStorage.removeItem(KEY.STOCK);
  }

  async function loadProducts() {
    let raw = null;
    try {
      const res = await fetch("data/products.json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      raw = await res.json();
    } catch (err) {
      fallbackUsed = true;
      raw = (window.COOKIE_PRODUCTS || []).slice();
      console.warn("[iKomers] data/products.json tidak bisa dibaca. Memakai data cadangan.", err);
    }
    products = raw.map((p) => Object.assign({}, p, { stock: baseStockOf(p) }));
    return products;
  }

  const getProducts = () => products;
  const getProduct = (id) => products.find((p) => p.id === id) || null;
  const getCategories = () => {
    const set = [];
    products.forEach((p) => {
      if (set.indexOf(p.category) === -1) set.push(p.category);
    });
    return set;
  };

  /* ---------------- Keranjang ---------------- */
  function cartRaw() {
    const c = read(KEY.CART, []);
    return Array.isArray(c) ? c : [];
  }
  function cartSave(items) {
    write(KEY.CART, items);
    document.dispatchEvent(new CustomEvent("ik:cart"));
  }
  function qtyInCart(id) {
    const it = cartRaw().find((x) => x.id === id);
    return it ? it.qty : 0;
  }
  function availableStock(product) {
    return Math.max(0, product.stock - qtyInCart(product.id));
  }

  const Cart = {
    items: cartRaw,
    count() {
      return cartRaw().reduce((s, i) => s + i.qty, 0);
    },
    qtyOf: qtyInCart,
    add(id, qty) {
      const p = getProduct(id);
      if (!p) return { ok: false, msg: "Produk tidak ditemukan." };
      const add = Number(qty) || 1;
      const max = availableStock(p);
      if (max <= 0) return { ok: false, msg: "Stok " + p.name + " sudah habis." };
      if (add > max) return { ok: false, msg: "Sisa stok hanya " + max + " pcs." };

      const items = cartRaw();
      const found = items.find((x) => x.id === id);
      if (found) found.qty += add;
      else items.push({ id: id, qty: add });
      cartSave(items);
      return { ok: true, product: p };
    },
    setQty(id, qty) {
      const p = getProduct(id);
      const items = cartRaw();
      const it = items.find((x) => x.id === id);
      if (!it || !p) return;
      let q = Math.floor(Number(qty) || 0);
      if (q <= 0) return Cart.remove(id);
      if (q > p.stock) q = p.stock;
      it.qty = q;
      cartSave(items);
    },
    remove(id) {
      cartSave(cartRaw().filter((x) => x.id !== id));
    },
    clear() {
      cartSave([]);
    },
    lines() {
      return cartRaw()
        .map((it) => {
          const p = getProduct(it.id);
          if (!p) return null;
          return { product: p, qty: it.qty, total: p.price * it.qty };
        })
        .filter(Boolean);
    },
    subtotal() {
      return Cart.lines().reduce((s, l) => s + l.total, 0);
    },
    weight() {
      return Cart.lines().reduce((s, l) => s + (parseInt(l.product.weight, 10) || 0) * l.qty, 0);
    }
  };

  /* ---------------- Promo & ongkir ---------------- */
  function applyPromo(code, subtotal, shippingCost) {
    const promo = PROMOS[String(code || "").trim().toUpperCase()];
    if (!promo) return { valid: false, code: code, discount: 0, shippingCost: shippingCost };
    let discount = 0;
    let ship = shippingCost;
    if (promo.type === "percent") discount = Math.round((subtotal * promo.value) / 100);
    if (promo.type === "shipping") ship = 0;
    return { valid: true, code: String(code).trim().toUpperCase(), label: promo.label, discount: discount, shippingCost: ship };
  }

  function shippingCostFor(method, subtotal) {
    const m = SHIPPING[method] || SHIPPING.pickup;
    if (method === "delivery" && m.freeFrom && subtotal >= m.freeFrom) return 0;
    return m.cost;
  }

  /* ---------------- Order ---------------- */
  function saveOrder(order) {
    const list = read(KEY.ORDERS, []);
    list.unshift(order);
    write(KEY.ORDERS, list.slice(0, 50));
    // kurangi stok
    order.items.forEach((it) => {
      const p = getProduct(it.id);
      if (p) setStock(it.id, Math.max(0, p.stock - it.qty));
    });
    return order;
  }
  const getOrders = () => read(KEY.ORDERS, []);
  const orderCode = () =>
    "IKC-" +
    new Date().toISOString().slice(2, 10).replace(/-/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 6).toUpperCase();

  function resetDemo() {
    localStorage.removeItem(KEY.CART);
    localStorage.removeItem(KEY.STOCK);
    localStorage.removeItem(KEY.ORDERS);
    document.dispatchEvent(new CustomEvent("ik:cart"));
  }

  /* ---------------- QR Code (simulasi, offline) ---------------- */
  function drawQR(canvas, text) {
    if (!canvas) return;
    const N = 29;
    const size = canvas.width;
    const cell = size / N;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    const rnd = () => {
      h ^= h << 13; h >>>= 0;
      h ^= h >>> 17;
      h ^= h << 5; h >>>= 0;
      return h / 4294967296;
    };

    const inFinder = (x, y) =>
      (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);

    ctx.fillStyle = "#1b1b1b";
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (inFinder(x, y)) continue;
        if (x === 6 || y === 6) {
          if ((x + y) % 2 === 0) ctx.fillRect(x * cell, y * cell, cell, cell);
          continue;
        }
        if (rnd() > 0.52) ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    const finder = (fx, fy) => {
      ctx.fillStyle = "#1b1b1b"; ctx.fillRect(fx * cell, fy * cell, 7 * cell, 7 * cell);
      ctx.fillStyle = "#ffffff"; ctx.fillRect((fx + 1) * cell, (fy + 1) * cell, 5 * cell, 5 * cell);
      ctx.fillStyle = "#1b1b1b"; ctx.fillRect((fx + 2) * cell, (fy + 2) * cell, 3 * cell, 3 * cell);
    };
    finder(0, 0);
    finder(N - 7, 0);
    finder(0, N - 7);
  }

  /* ---------------- Navbar & Footer ---------------- */
  const NAV = [
    { href: "index.html", label: "Beranda", icon: "bi-house-door", page: "home" },
    { href: "index.html#produk", label: "Produk", icon: "bi-grid-3x3-gap", page: "produk" },
    { href: "cart.html", label: "Menu Pesanan", icon: "bi-bag-heart", page: "cart" },
    { href: "about.html", label: "Tentang", icon: "bi-info-circle", page: "about" }
  ];

  function renderNavbar() {
    const mount = byId("navbarMount");
    if (!mount) return;
    const active = document.body.dataset.page || "";
    const links = NAV.map(
      (n) =>
        '<li class="nav-item"><a class="nav-link ' +
        (n.page === active ? "active" : "") +
        '" href="' + n.href + '"><i class="bi ' + n.icon + ' me-1"></i>' + n.label + "</a></li>"
    ).join("");

    mount.innerHTML =
      '<nav class="site-nav navbar navbar-expand-lg fixed-top">' +
        '<div class="container">' +
          '<a class="navbar-brand d-flex align-items-center gap-2" href="index.html">' +
            '<span class="brand-mark">🍪</span>' +
            "<span><span class=\"brand-name d-block\">iKomers</span>" +
            '<span class="brand-sub">Cookies Artisan</span></span>' +
          "</a>" +
          '<button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">' +
            '<i class="bi bi-list fs-3"></i>' +
          "</button>" +
          '<div class="collapse navbar-collapse" id="mainNav">' +
            '<ul class="navbar-nav mx-auto gap-lg-1">' + links + "</ul>" +
            '<div class="d-flex align-items-center gap-2 mt-3 mt-lg-0">' +
              '<button class="cart-pill" type="button" data-open-order>' +
                '<i class="bi bi-bag"></i> Menu Pesanan <span class="count" data-cart-count>0</span>' +
              "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</nav>";
  }

  function renderFooter() {
    const mount = byId("footerMount");
    if (!mount) return;
    const year = new Date().getFullYear();
    mount.innerHTML =
      '<footer class="site-footer">' +
        '<div class="container">' +
          '<div class="row g-4">' +
            '<div class="col-lg-4">' +
              '<div class="d-flex align-items-center gap-2 mb-3">' +
                '<span class="brand-mark">🍪</span>' +
                '<span class="brand-name text-white">iKomers</span>' +
              "</div>" +
              "<p class=\"small\">Cookies artisan yang dipanggang segar setiap hari. Dibuat dengan bahan pilihan, tanpa pengawet.</p>" +
              '<div class="d-flex gap-3 fs-5">' +
                '<a href="#"><i class="bi bi-instagram"></i></a>' +
                '<a href="#"><i class="bi bi-tiktok"></i></a>' +
                '<a href="#"><i class="bi bi-whatsapp"></i></a>' +
              "</div>" +
            "</div>" +
            '<div class="col-6 col-lg-2">' +
              "<h6>Navigasi</h6>" +
              '<ul class="list-unstyled small d-grid gap-2">' +
                '<li><a href="index.html">Beranda</a></li>' +
                '<li><a href="index.html#produk">Produk</a></li>' +
                '<li><a href="cart.html">Menu Pesanan</a></li>' +
                '<li><a href="about.html">Tentang</a></li>' +
              "</ul>" +
            "</div>" +
            '<div class="col-6 col-lg-3">' +
              "<h6>Bantuan</h6>" +
              '<ul class="list-unstyled small d-grid gap-2">' +
                '<li><a href="about.html#faq">FAQ</a></li>' +
                '<li><a href="checkout.html">Cara Pesan</a></li>' +
                '<li><a href="about.html#kontak">Hubungi Kami</a></li>' +
              "</ul>" +
            "</div>" +
            '<div class="col-lg-3">' +
              "<h6>Demo Data</h6>" +
              '<p class="small mb-2">Stok &amp; keranjang disimpan di browser kamu. Kembalikan ke kondisi awal kapan saja.</p>' +
              '<button class="btn btn-outline-light btn-sm rounded-pill" data-reset-demo><i class="bi bi-arrow-counterclockwise me-1"></i>Reset Data Demo</button>' +
            "</div>" +
          "</div>" +
          '<div class="footer-bottom d-flex flex-wrap justify-content-between gap-2">' +
            "<span>© " + year + " iKomers Cookies. Semua harga dalam Rupiah.</span>" +
            '<span>Dibuat dengan HTML, CSS &amp; JavaScript.</span>' +
          "</div>" +
        "</div>" +
      "</footer>";
  }

  /* ---------------- Tinggi navbar ---------------- */
  // Dipakai untuk offset konten (body padding) dan posisi sticky toolbar produk.
  // Diukur otomatis agar tetap benar saat navbar membungkus (mobile) atau font selesai dimuat.
  function syncNavHeight() {
    const nav = document.querySelector(".site-nav");
    if (!nav) return;
    const collapse = byId("mainNav");
    if (collapse && collapse.classList.contains("show")) return; // jangan ukur saat menu terbuka
    const h = Math.round(nav.getBoundingClientRect().height);
    if (h > 0) document.documentElement.style.setProperty("--nav-h", h + "px");
  }

  function bindNavHeight() {
    syncNavHeight();
    window.addEventListener("resize", syncNavHeight);
    window.addEventListener("orientationchange", syncNavHeight);
    window.addEventListener("load", syncNavHeight);
    const collapse = byId("mainNav");
    if (collapse) {
      collapse.addEventListener("shown.bs.collapse", syncNavHeight);
      collapse.addEventListener("hidden.bs.collapse", syncNavHeight);
    }
    // jaga-jaga bila font/ikon selesai dimuat setelah render awal
    setTimeout(syncNavHeight, 350);
    setTimeout(syncNavHeight, 1200);
  }

  /* ---------------- Menu Pesanan (offcanvas) ---------------- */
  function renderOrderMenu() {
    if (byId("orderMenu")) return;
    const wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="offcanvas offcanvas-end order-menu" tabindex="-1" id="orderMenu" aria-labelledby="orderMenuLabel">' +
        '<div class="offcanvas-header">' +
          '<h5 class="offcanvas-title mb-0" id="orderMenuLabel"><i class="bi bi-bag-heart text-caramel me-2"></i>Menu Pesanan</h5>' +
          '<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Tutup"></button>' +
        "</div>" +
        '<div class="offcanvas-body d-flex flex-column" id="orderMenuBody"></div>' +
      "</div>";
    document.body.appendChild(wrap.firstChild);
  }

  function orderItemHTML(line) {
    const p = line.product;
    return (
      '<div class="order-item" data-line="' + p.id + '">' +
        '<div class="order-thumb" style="--tone:' + esc(p.tone) + '">' + mediaHTML(p) + "</div>" +
        '<div class="flex-grow-1">' +
          '<div class="d-flex justify-content-between gap-2">' +
            '<div class="order-name">' + esc(p.name) + "</div>" +
            '<button class="btn btn-sm text-danger p-0 px-1" data-remove="' + p.id + '" title="Hapus"><i class="bi bi-trash3"></i></button>' +
          "</div>" +
          '<div class="order-price">' + money(p.price) + " × " + line.qty + " = <b>" + money(line.total) + "</b></div>" +
          '<div class="d-flex justify-content-between align-items-center mt-2">' +
            '<div class="qty sm">' +
              '<button data-dec="' + p.id + '"><i class="bi bi-dash"></i></button>' +
              '<input type="text" inputmode="numeric" value="' + line.qty + '" data-qty="' + p.id + '" aria-label="Jumlah">' +
              '<button data-inc="' + p.id + '"' + (line.qty >= p.stock ? " disabled" : "") + '><i class="bi bi-plus"></i></button>' +
            "</div>" +
            '<small class="text-muted-2">stok ' + p.stock + "</small>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function renderOrderMenuBody() {
    const body = byId("orderMenuBody");
    if (!body) return;
    const lines = Cart.lines();

    if (!lines.length) {
      body.innerHTML =
        '<div class="empty-state my-auto">' +
          '<span class="big">🛒</span>' +
          "<h6 class=\"mb-1\">Menu pesanan masih kosong</h6>" +
          '<p class="small">Yuk pilih cookies favoritmu dulu.</p>' +
          '<a href="index.html#produk" class="btn btn-cookie btn-sm" data-bs-dismiss="offcanvas">Lihat Produk</a>' +
        "</div>";
      return;
    }

    const subtotal = Cart.subtotal();
    const freeShip = subtotal >= SHIPPING.delivery.freeFrom;
    const sisa = Math.max(0, SHIPPING.delivery.freeFrom - subtotal);

    body.innerHTML =
      '<div class="flex-grow-1 overflow-auto">' +
        lines.map(orderItemHTML).join("") +
      "</div>" +
      '<div class="pt-3 mt-2">' +
        (freeShip
          ? '<div class="badge-soft ok d-inline-block mb-2"><i class="bi bi-truck me-1"></i>Selamat! Kamu dapat gratis ongkir.</div>'
          : '<div class="badge-soft mb-2 d-inline-block"><i class="bi bi-truck me-1"></i>Belanja ' + money(sisa) + " lagi untuk gratis ongkir.</div>") +
        '<div class="summary-box">' +
          '<div class="summary-line"><span>Subtotal (' + Cart.count() + " item)</span><b>" + money(subtotal) + "</b></div>" +
          '<div class="summary-line"><span>Total berat</span><b>' + Cart.weight() + " gr</b></div>" +
          '<div class="summary-line total"><span>Total</span><span>' + money(subtotal) + "</span></div>" +
        "</div>" +
        '<div class="d-grid gap-2 mt-3">' +
          '<a href="checkout.html" class="btn btn-cookie"><i class="bi bi-credit-card me-1"></i>Checkout Sekarang</a>' +
          '<div class="d-flex gap-2">' +
            '<a href="cart.html" class="btn btn-ghost flex-fill btn-sm">Kelola Keranjang</a>' +
            '<button class="btn btn-ghost btn-sm" data-clear-cart><i class="bi bi-trash3 me-1"></i>Kosongkan</button>' +
          "</div>" +
        "</div>" +
      "</div>";
  }

  function updateCartBadges() {
    const n = Cart.count();
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = n;
      el.style.display = n ? "" : "none";
    });
    renderOrderMenuBody();
  }

  /* ---------------- Event global (delegasi) ---------------- */
  function bindGlobal() {
    document.addEventListener("click", function (e) {
      const openOrder = e.target.closest("[data-open-order]");
      if (openOrder) {
        e.preventDefault();
        const el = byId("orderMenu");
        if (el && window.bootstrap) bootstrap.Offcanvas.getOrCreateInstance(el).show();
        return;
      }

      const reset = e.target.closest("[data-reset-demo]");
      if (reset) {
        e.preventDefault();
        confirmBox("Reset data demo?", "Keranjang, riwayat pesanan, dan perubahan stok akan dihapus.", "Ya, reset").then((ok) => {
          if (!ok) return;
          resetDemo();
          toast("Data demo berhasil direset", "success");
          setTimeout(() => window.location.reload(), 700);
        });
        return;
      }

      const inc = e.target.closest("[data-inc]");
      if (inc) {
        const id = inc.dataset.inc;
        Cart.setQty(id, Cart.qtyOf(id) + 1);
        return;
      }
      const dec = e.target.closest("[data-dec]");
      if (dec) {
        const id = dec.dataset.dec;
        Cart.setQty(id, Cart.qtyOf(id) - 1);
        return;
      }
      const rm = e.target.closest("[data-remove]");
      if (rm) {
        Cart.remove(rm.dataset.remove);
        toast("Produk dihapus dari keranjang", "info");
        return;
      }
      const clr = e.target.closest("[data-clear-cart]");
      if (clr) {
        confirmBox("Kosongkan keranjang?", "Semua item akan dihapus.", "Ya, kosongkan").then((ok) => {
          if (ok) { Cart.clear(); toast("Keranjang dikosongkan", "success"); }
        });
        return;
      }
    });

    document.addEventListener("change", function (e) {
      const q = e.target.closest("[data-qty]");
      if (q) Cart.setQty(q.dataset.qty, q.value);
    });

    document.addEventListener("ik:cart", updateCartBadges);
    window.addEventListener("storage", updateCartBadges);
  }

  /* ---------------- Boot ---------------- */
  async function boot() {
    renderNavbar();
    bindNavHeight();
    renderFooter();
    renderOrderMenu();
    bindGlobal();
    updateCartBadges();
    return loadProducts().then((list) => {
      updateCartBadges();
      return list;
    });
  }

  return {
    // config
    KEY: KEY,
    SHIPPING: SHIPPING,
    PROMOS: PROMOS,
    WA_NUMBER: WA_NUMBER,
    // helpers
    money: money,
    esc: esc,
    byId: byId,
    mediaHTML: mediaHTML,
    syncNavHeight: syncNavHeight,
    toast: toast,
    alertOk: alertOk,
    alertErr: alertErr,
    confirmBox: confirmBox,
    drawQR: drawQR,
    // data
    boot: boot,
    loadProducts: loadProducts,
    getProducts: getProducts,
    getProduct: getProduct,
    getCategories: getCategories,
    get usedFallback() { return fallbackUsed; },
    setStock: setStock,
    resetStock: resetStock,
    // cart
    Cart: Cart,
    availableStock: availableStock,
    // promo & shipping
    applyPromo: applyPromo,
    shippingCostFor: shippingCostFor,
    // orders
    saveOrder: saveOrder,
    getOrders: getOrders,
    orderCode: orderCode,
    resetDemo: resetDemo,
    updateCartBadges: updateCartBadges
  };
})();
