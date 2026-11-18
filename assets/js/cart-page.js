/* ============================================================
   iKomers Cookies — assets/js/cart-page.js
   Logika halaman Menu Pesanan (cart.html)
   ============================================================ */
(function () {
  "use strict";

  const { money, esc, byId, Cart } = IK;
  const PROMO_KEY = IK.KEY.PROMO;

  let promoCode = "";
  try { promoCode = JSON.parse(localStorage.getItem(PROMO_KEY)) || ""; } catch (e) { promoCode = ""; }

  /* ---------- Render daftar item ---------- */
  function rowHTML(line) {
    const p = line.product;
    const out = p.stock === 0;
    return (
      '<div class="order-item align-items-center" data-line="' + p.id + '">' +
        '<div class="order-thumb" style="--tone:' + esc(p.tone) + '">' + IK.mediaHTML(p) + "</div>" +
        '<div class="flex-grow-1">' +
          '<div class="d-flex justify-content-between align-items-start gap-2">' +
            "<div>" +
              '<div class="order-name">' + esc(p.name) + "</div>" +
              '<div class="order-price">' + money(p.price) + " · " + esc(p.weight) +
                ' · <span class="badge-soft ' + (out ? "danger" : p.stock <= 5 ? "warn" : "ok") + '">stok ' + p.stock + "</span>" +
              "</div>" +
            "</div>" +
            '<div class="text-end">' +
              '<div class="fw-bold">' + money(line.total) + "</div>" +
              '<button class="btn btn-sm text-danger p-0 small" data-remove="' + p.id + '"><i class="bi bi-trash3"></i> Hapus</button>' +
            "</div>" +
          "</div>" +
          '<div class="d-flex align-items-center gap-2 mt-2">' +
            '<div class="qty sm">' +
              '<button data-dec="' + p.id + '"><i class="bi bi-dash"></i></button>' +
              '<input type="text" inputmode="numeric" value="' + line.qty + '" data-qty="' + p.id + '">' +
              '<button data-inc="' + p.id + '"' + (line.qty >= p.stock ? " disabled" : "") + '><i class="bi bi-plus"></i></button>' +
            "</div>" +
            '<a href="index.html#produk" class="btn btn-ghost btn-sm">Tambah lagi</a>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function renderList() {
    const panel = byId("cartPanel");
    const lines = Cart.lines();

    if (!lines.length) {
      panel.innerHTML =
        '<div class="empty-state">' +
          '<span class="big">🛒</span>' +
          "<h5>Keranjang kamu masih kosong</h5>" +
          '<p class="small">Belum ada cookies yang dipilih. Yuk mulai dari varian best seller kami.</p>' +
          '<a href="index.html#produk" class="btn btn-cookie"><i class="bi bi-grid-3x3-gap me-1"></i>Lihat Menu Cookies</a>' +
        "</div>";
      return;
    }

    panel.innerHTML =
      '<div class="d-flex justify-content-between align-items-center mb-2">' +
        '<h5 class="panel-title mb-0">Item Terpilih</h5>' +
        '<span class="badge-soft">' + Cart.count() + " item</span>" +
      "</div>" +
      lines.map(rowHTML).join("");
  }

  /* ---------- Render ringkasan ---------- */
  function renderSummary() {
    const body = byId("summaryBody");
    const lines = Cart.lines();
    const subtotal = Cart.subtotal();
    const shipping = IK.shippingCostFor("delivery", subtotal);
    const promo = promoCode ? IK.applyPromo(promoCode, subtotal, shipping) : null;
    const discount = promo && promo.valid ? promo.discount : 0;
    const total = Math.max(0, subtotal - discount);

    body.innerHTML =
      '<div class="summary-line"><span>Subtotal (' + Cart.count() + " item)</span><b>" + money(subtotal) + "</b></div>" +
      '<div class="summary-line"><span>Estimasi ongkir (delivery)</span><b>' + (shipping === 0 ? "Gratis" : money(shipping)) + "</b></div>" +
      '<div class="summary-line"><span>Total berat</span><b>' + Cart.weight() + " gr</b></div>" +
      (promo && promo.valid
        ? '<div class="summary-line text-success"><span><i class="bi bi-ticket-perforated me-1"></i>' + esc(promo.label) + " (" + esc(promo.code) + ')</span><b>-' + money(discount) + "</b></div>"
        : "") +
      '<div class="summary-line total"><span>Total bayar</span><span>' + money(total) + "</span></div>" +
      '<div class="small text-muted-2 mt-2"><i class="bi bi-info-circle me-1"></i>Ongkir final dihitung di langkah checkout sesuai metode pengiriman.</div>';

    if (promoCode) byId("promoInput").value = promoCode;

    // tombol checkout
    const go = byId("goCheckout");
    if (go) {
      if (!lines.length) {
        go.classList.add("disabled");
        go.setAttribute("aria-disabled", "true");
      } else {
        go.classList.remove("disabled");
        go.removeAttribute("aria-disabled");
      }
    }
  }

  function renderAll() {
    renderList();
    renderSummary();
  }

  /* ---------- Promo ---------- */
  function applyPromoFromInput() {
    const input = byId("promoInput");
    const code = (input.value || "").trim();
    if (!code) {
      promoCode = "";
      localStorage.removeItem(PROMO_KEY);
      renderSummary();
      return;
    }
    const res = IK.applyPromo(code, Cart.subtotal(), IK.shippingCostFor("delivery", Cart.subtotal()));
    if (!res.valid) {
      promoCode = "";
      localStorage.removeItem(PROMO_KEY);
      IK.alertErr("Kode promo tidak valid", "Coba COOKIE10 atau ONGKIRGRATIS.");
      renderSummary();
      return;
    }
    promoCode = res.code;
    localStorage.setItem(PROMO_KEY, JSON.stringify(promoCode));
    IK.toast(res.label + " berhasil dipakai!", "success");
    renderSummary();
  }

  /* ---------- Bind ---------- */
  function bind() {
    document.addEventListener("ik:cart", renderAll);

    byId("applyPromoBtn").addEventListener("click", applyPromoFromInput);
    byId("promoInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); applyPromoFromInput(); }
    });

    byId("clearCartBtn").addEventListener("click", () => {
      if (!Cart.count()) return;
      IK.confirmBox("Kosongkan keranjang?", "Semua item akan dihapus dari pesanan.", "Ya, kosongkan").then((ok) => {
        if (ok) { Cart.clear(); IK.toast("Keranjang dikosongkan", "success"); }
      });
    });

    byId("goCheckout").addEventListener("click", (e) => {
      if (!Cart.count()) {
        e.preventDefault();
        IK.alertErr("Keranjang kosong", "Tambahkan minimal 1 produk sebelum checkout.");
      }
    });
  }

  /* ---------- Start ---------- */
  IK.boot().then(() => {
    renderAll();
    bind();
  });
})();
