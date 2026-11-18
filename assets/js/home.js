/* ============================================================
   iKomers Cookies — assets/js/home.js
   Logika halaman Beranda:
   - Header Product (hero + produk unggulan)
   - Filter kategori + pencarian + sort
   - Card Product & modal detail
   - Add to cart
   ============================================================ */
(function () {
  "use strict";

  const { money, esc, byId } = IK;

  const state = {
    category: "Semua",
    search: "",
    sort: "populer"
  };

  /* ---------- Hero: produk unggulan ---------- */
  function renderFeatured() {
    const mount = byId("featuredProduct");
    if (!mount) return;
    const list = IK.getProducts();
    const feat = list.find((p) => p.featured && p.stock > 0) || list.find((p) => p.stock > 0) || list[0];
    if (!feat) return;

    const off = feat.oldPrice && feat.oldPrice > feat.price
      ? Math.round(((feat.oldPrice - feat.price) / feat.oldPrice) * 100)
      : 0;

    mount.innerHTML =
      '<div class="featured-card">' +
        '<div class="featured-media" style="--tone:' + esc(feat.tone) + '">' +
          IK.mediaHTML(feat, { eager: true }) +
          '<span class="floating-chip tl"><i class="bi bi-star-fill text-warning"></i>' + feat.rating + "</span>" +
          (off ? '<span class="floating-chip br"><i class="bi bi-tag-fill text-caramel"></i>Hemat ' + off + "%</span>" : "") +
        "</div>" +
        '<div class="p-3 pb-1">' +
          '<div class="d-flex justify-content-between align-items-start gap-3">' +
            "<div>" +
              '<span class="badge-soft mb-2 d-inline-block">' + esc(feat.category) + " · Pilihan Editor</span>" +
              '<h3 class="mb-1">' + esc(feat.name) + "</h3>" +
              '<p class="text-muted-2 small mb-0">' + esc(feat.description).slice(0, 96) + "…</p>" +
            "</div>" +
          "</div>" +
          '<div class="d-flex justify-content-between align-items-center mt-3">' +
            "<div><span class=\"display-font fs-4 fw-bold\">" + money(feat.price) + "</span>" +
              (off ? ' <s class="text-muted-2 small">' + money(feat.oldPrice) + "</s>" : "") +
            "</div>" +
            '<button class="btn btn-cookie" data-add="' + feat.id + '"><i class="bi bi-bag-plus me-1"></i>Tambah</button>' +
          "</div>" +
        "</div>" +
      "</div>";
  }

  /* ---------- Filter kategori ---------- */
  function renderCategories() {
    const mount = byId("categoryFilter");
    if (!mount) return;
    const cats = ["Semua"].concat(IK.getCategories());
    mount.innerHTML = cats
      .map(
        (c) =>
          '<button class="pill ' + (c === state.category ? "active" : "") + '" data-cat="' + esc(c) + '">' +
          (c === "Semua" ? '<i class="bi bi-grid-fill me-1"></i>' : "") + esc(c) +
          "</button>"
      )
      .join("");
  }

  /* ---------- Sortir & filter ---------- */
  function sortProducts(list) {
    const arr = list.slice();
    switch (state.sort) {
      case "nama-asc":  return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "nama-desc": return arr.sort((a, b) => b.name.localeCompare(a.name));
      case "harga-asc": return arr.sort((a, b) => a.price - b.price);
      case "harga-desc":return arr.sort((a, b) => b.price - a.price);
      case "stok-desc": return arr.sort((a, b) => b.stock - a.stock);
      case "rating-desc": return arr.sort((a, b) => b.rating - a.rating);
      case "terbaru":   return arr.sort((a, b) => String(b.id).localeCompare(String(a.id)));
      default:          return arr.sort((a, b) => b.sold - a.sold); // populer
    }
  }

  function filtered() {
    const q = state.search.trim().toLowerCase();
    let list = IK.getProducts().filter((p) => {
      const okCat = state.category === "Semua" || p.category === state.category;
      const okQ = !q || (p.name + " " + p.category + " " + p.description).toLowerCase().includes(q);
      return okCat && okQ;
    });
    return sortProducts(list);
  }

  /* ---------- Card product ---------- */
  function stockRow(p) {
    const pct = Math.min(100, Math.round((p.stock / 50) * 100));
    const low = p.stock > 0 && p.stock <= 5;
    const label = p.stock === 0 ? "Stok habis" : low ? "Hampir habis" : "Tersedia";
    return (
      '<div class="stock-row">' +
        '<div class="stock-bar ' + (low || p.stock === 0 ? "low" : "") + '"><span style="width:' + pct + '%"></span></div>' +
        '<div class="stock-text"><span>' + label + '</span><span><b>' + p.stock + "</b> pcs</span></div>" +
      "</div>"
    );
  }

  function cardHTML(p) {
    const off = p.oldPrice && p.oldPrice > p.price
      ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
      : 0;
    const flag = (p.tags && p.tags[0]) || "";
    const out = p.stock === 0;

    return (
      '<div class="col-6 col-lg-4 col-xxl-3">' +
        '<article class="product-card ' + (out ? "is-out" : "") + '" data-id="' + p.id + '">' +
          '<div class="product-media" style="--tone:' + esc(p.tone) + '">' +
            IK.mediaHTML(p) +
            '<span class="badge-cat">' + esc(p.category) + "</span>" +
            (flag && flag !== "Habis" ? '<span class="badge-flag">' + esc(flag) + "</span>" : "") +
            (off ? '<span class="badge-off">-' + off + "%</span>" : "") +
            (out ? '<div class="out-overlay">Stok Habis</div>' : "") +
            '<div class="media-actions"><button class="btn-icon" data-detail="' + p.id + '" title="Lihat detail"><i class="bi bi-eye"></i></button></div>' +
          "</div>" +
          '<div class="product-body">' +
            '<h3 class="product-name">' + esc(p.name) + "</h3>" +
            '<div class="product-meta">' +
              '<span class="star"><i class="bi bi-star-fill"></i> ' + p.rating + "</span>" +
              "<span>·</span><span>" + Number(p.sold).toLocaleString("id-ID") + " terjual</span>" +
              "<span>·</span><span>" + esc(p.weight) + "</span>" +
            "</div>" +
            '<p class="product-desc">' + esc(p.description) + "</p>" +
            stockRow(p) +
            '<div class="product-foot">' +
              '<div class="price"><span class="now">' + money(p.price) + "</span>" +
                (off ? "<s class=\"old\">" + money(p.oldPrice) + "</s>" : "") + "</div>" +
              '<button class="btn btn-cookie" data-add="' + p.id + '"' + (out ? " disabled" : "") + ">" +
                (out ? "Habis" : '<i class="bi bi-plus-lg"></i> Keranjang') +
              "</button>" +
            "</div>" +
          "</div>" +
        "</article>" +
      "</div>"
    );
  }

  function renderGrid() {
    const grid = byId("productGrid");
    const info = byId("resultInfo");
    if (!grid) return;
    const list = filtered();

    if (!list.length) {
      grid.innerHTML =
        '<div class="col-12"><div class="empty-state">' +
        '<span class="big">🔍</span><h5>Produk tidak ditemukan</h5>' +
        '<p class="small">Coba kata kunci lain atau ubah kategori.</p>' +
        '<button class="btn btn-ghost btn-sm" id="clearFilter">Reset filter</button>' +
        "</div></div>";
    } else {
      grid.innerHTML = list.map(cardHTML).join("");
    }

    if (info) info.innerHTML = "Menampilkan <b>" + list.length + "</b> dari " + IK.getProducts().length + " varian cookies";
  }

  /* ---------- Modal detail produk ---------- */
  function openDetail(id) {
    const p = IK.getProduct(id);
    if (!p) return;
    const out = p.stock === 0;
    const off = p.oldPrice && p.oldPrice > p.price;

    const html =
      '<div class="text-start">' +
        '<div class="d-flex gap-3 align-items-start mb-3">' +
          '<div class="order-thumb" style="--tone:' + esc(p.tone) + ';width:84px;height:84px;flex:0 0 84px;font-size:2.4rem">' + IK.mediaHTML(p, { eager: true }) + "</div>" +
          "<div>" +
            '<span class="badge-soft mb-1 d-inline-block">' + esc(p.category) + "</span>" +
            '<h4 class="mb-1">' + esc(p.name) + "</h4>" +
            '<div class="text-muted-2 small"><i class="bi bi-star-fill text-warning"></i> ' + p.rating +
              " · " + Number(p.sold).toLocaleString("id-ID") + " terjual · " + esc(p.weight) + "</div>" +
          "</div>" +
        "</div>" +
        '<p class="text-muted-2">' + esc(p.description) + "</p>" +
        '<div class="summary-box d-flex justify-content-between align-items-center">' +
          "<div><span class=\"display-font fs-4 fw-bold\">" + money(p.price) + "</span>" +
            (off ? ' <s class="text-muted-2 small">' + money(p.oldPrice) + "</s>" : "") + "</div>" +
          "<div>" + (out ? '<span class="badge-soft danger">Stok habis</span>' : '<span class="badge-soft ' + (p.stock <= 5 ? "warn" : "ok") + '">Stok ' + p.stock + " pcs</span>") + "</div>" +
        "</div>" +
        (out ? "" :
          '<div class="d-flex justify-content-between align-items-center mt-3">' +
            "<label class=\"form-label mb-0\">Jumlah</label>" +
            '<div class="qty">' +
              '<button type="button" id="mdDec"><i class="bi bi-dash"></i></button>' +
              '<input type="text" inputmode="numeric" id="mdQty" value="1">' +
              '<button type="button" id="mdInc"><i class="bi bi-plus"></i></button>' +
            "</div>" +
          "</div>") +
      "</div>";

    if (!window.Swal) {
      const res = window.prompt(p.name + "\n\n" + p.description + "\n\nJumlah (maks " + p.stock + "):", "1");
      if (res) addToCart(p.id, res);
      return;
    }

    Swal.fire({
      html: html,
      width: 520,
      showCancelButton: !out,
      showConfirmButton: !out,
      confirmButtonText: '<i class="bi bi-bag-plus"></i> Tambah ke Keranjang',
      cancelButtonText: "Tutup",
      confirmButtonColor: "#c9803f",
      cancelButtonColor: "#8a6547",
      didOpen: () => {
        const qty = document.getElementById("mdQty");
        const dec = document.getElementById("mdDec");
        const inc = document.getElementById("mdInc");
        if (!qty) return;
        const clamp = () => {
          let v = parseInt(qty.value, 10) || 1;
          if (v < 1) v = 1;
          if (v > p.stock) v = p.stock;
          qty.value = v;
          dec.disabled = v <= 1;
          inc.disabled = v >= p.stock;
        };
        clamp();
        dec.addEventListener("click", () => { qty.value = (parseInt(qty.value, 10) || 1) - 1; clamp(); });
        inc.addEventListener("click", () => { qty.value = (parseInt(qty.value, 10) || 1) + 1; clamp(); });
        qty.addEventListener("input", clamp);
      },
      preConfirm: () => {
        const qty = document.getElementById("mdQty");
        return qty ? parseInt(qty.value, 10) || 1 : 1;
      }
    }).then((r) => {
      if (r.isConfirmed) addToCart(p.id, r.value);
    });
  }

  /* ---------- Add to cart ---------- */
  function addToCart(id, qty) {
    const res = IK.Cart.add(id, qty);
    if (!res.ok) {
      IK.alertErr("Gagal menambahkan", res.msg);
      return;
    }
    IK.toast(res.product.emoji + " " + res.product.name + " ditambahkan", "success");
  }

  /* ---------- Bind ---------------- */
  function bind() {
    const grid = byId("productGrid");
    if (grid) {
      grid.addEventListener("click", (e) => {
        const add = e.target.closest("[data-add]");
        if (add) { e.preventDefault(); addToCart(add.dataset.add, 1); return; }
        const det = e.target.closest("[data-detail]");
        if (det) { e.preventDefault(); openDetail(det.dataset.detail); return; }
      });
    }

    const featured = byId("featuredProduct");
    if (featured) {
      featured.addEventListener("click", (e) => {
        const add = e.target.closest("[data-add]");
        if (add) { e.preventDefault(); addToCart(add.dataset.add, 1); }
      });
    }

    const catMount = byId("categoryFilter");
    if (catMount) {
      catMount.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-cat]");
        if (!btn) return;
        state.category = btn.dataset.cat;
        renderCategories();
        renderGrid();
      });
    }

    const search = byId("searchInput");
    if (search) {
      search.addEventListener("input", () => {
        state.search = search.value;
        renderGrid();
      });
    }

    const sort = byId("sortBy");
    if (sort) {
      sort.addEventListener("change", () => {
        state.sort = sort.value;
        renderGrid();
      });
    }

    document.addEventListener("click", (e) => {
      if (e.target.closest("#clearFilter")) {
        state.category = "Semua";
        state.search = "";
        state.sort = "populer";
        if (byId("searchInput")) byId("searchInput").value = "";
        if (byId("sortBy")) byId("sortBy").value = "populer";
        renderCategories();
        renderGrid();
      }
    });
  }

  /* ---------- Start ---------- */
  IK.boot().then(() => {
    if (IK.usedFallback) {
      const note = byId("dataNote");
      if (note) {
        note.classList.remove("d-none");
        note.innerHTML =
          '<i class="bi bi-info-circle me-1"></i> Mode <b>file://</b> terdeteksi — data produk dibaca dari <code>assets/js/products.js</code> (cadangan). ' +
          "Jalankan lewat local server untuk membaca <code>data/products.json</code>.";
      }
    }
    renderFeatured();
    renderCategories();
    renderGrid();
    bind();
  });
})();
