/* ============================================================
   iKomers Cookies — assets/js/checkout.js
   Wizard checkout 4 langkah + simulasi pembayaran (QRIS / Cash)
   ============================================================ */
(function () {
  "use strict";

  const { money, esc, byId, Cart } = IK;
  const PROMO_KEY = IK.KEY.PROMO;
  const QR_TIMEOUT = 15 * 60; // detik

  const state = {
    step: 1,
    shipping: "delivery",
    pay: "qris",
    promo: (function () { try { return JSON.parse(localStorage.getItem(PROMO_KEY)) || ""; } catch (e) { return ""; } })(),
    order: null
  };

  let timerId = null;
  let secondsLeft = QR_TIMEOUT;

  /* ---------------- Perhitungan ---------------- */
  function totals() {
    const subtotal = Cart.subtotal();
    let shipping = IK.shippingCostFor(state.shipping, subtotal);
    let discount = 0;
    let promoLabel = "";
    if (state.promo) {
      const r = IK.applyPromo(state.promo, subtotal, shipping);
      if (r.valid) {
        discount = r.discount;
        shipping = r.shippingCost;
        promoLabel = r.label;
      }
    }
    const total = Math.max(0, subtotal - discount + shipping);
    return { subtotal: subtotal, shipping: shipping, discount: discount, total: total, promoLabel: promoLabel };
  }

  /* ---------------- Render: ringkasan samping ---------------- */
  function renderSide() {
    const t = totals();
    const lines = Cart.lines();
    byId("sideSummary").innerHTML =
      (lines.length
        ? '<div class="mb-3">' +
            lines
              .map(
                (l) =>
                  '<div class="d-flex justify-content-between small mb-1">' +
                    "<span>" + esc(l.product.emoji) + " " + esc(l.product.name) + " <b>×" + l.qty + "</b></span>" +
                    "<span>" + money(l.total) + "</span>" +
                  "</div>"
              )
              .join("") +
          "</div>"
        : '<p class="text-muted-2 small">Belum ada item.</p>') +
      '<div class="summary-line"><span>Subtotal</span><b>' + money(t.subtotal) + "</b></div>" +
      '<div class="summary-line"><span>Ongkir (' + (state.shipping === "pickup" ? "Pickup" : "Delivery") + ")</span><b>" +
        (t.shipping === 0 ? "Gratis" : money(t.shipping)) + "</b></div>" +
      (t.discount ? '<div class="summary-line text-success"><span>' + esc(t.promoLabel) + "</span><b>-" + money(t.discount) + "</b></div>" : "") +
      '<div class="summary-line total"><span>Total</span><span>' + money(t.total) + "</span></div>" +
      '<div class="small text-muted-2 mt-2"><i class="bi bi-box-seam me-1"></i>Total berat ' + Cart.weight() + " gr</div>";
  }

  /* ---------------- Render: langkah 1 ---------------- */
  function renderStep1() {
    const lines = Cart.lines();
    const mount = byId("step1Items");
    if (!lines.length) {
      mount.innerHTML =
        '<div class="empty-state"><span class="big">🛒</span><h6>Keranjang kosong</h6>' +
        '<a href="index.html#produk" class="btn btn-cookie btn-sm">Pilih Produk</a></div>';
      return;
    }
    mount.innerHTML = lines
      .map(function (l) {
        const p = l.product;
        return (
          '<div class="order-item align-items-center">' +
            '<div class="order-thumb" style="--tone:' + esc(p.tone) + '">' + IK.mediaHTML(p) + "</div>" +
            '<div class="flex-grow-1">' +
              '<div class="d-flex justify-content-between gap-2">' +
                "<div>" +
                  '<div class="order-name">' + esc(p.name) + "</div>" +
                  '<div class="order-price">' + money(p.price) + " · stok " + p.stock + "</div>" +
                "</div>" +
                '<div class="text-end"><div class="fw-bold">' + money(l.total) + "</div>" +
                  '<button class="btn btn-sm text-danger p-0 small" data-remove="' + p.id + '"><i class="bi bi-trash3"></i></button>' +
                "</div>" +
              "</div>" +
              '<div class="qty sm mt-2">' +
                '<button data-dec="' + p.id + '"><i class="bi bi-dash"></i></button>' +
                '<input type="text" inputmode="numeric" value="' + l.qty + '" data-qty="' + p.id + '">' +
                '<button data-inc="' + p.id + '"' + (l.qty >= p.stock ? " disabled" : "") + '><i class="bi bi-plus"></i></button>' +
              "</div>" +
            "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  /* ---------------- Langkah ---------------- */
  function setStep(n) {
    state.step = n;
    document.querySelectorAll(".wizard-pane").forEach((p) => p.classList.remove("active"));
    byId("pane" + n).classList.add("active");

    document.querySelectorAll(".wizard-step").forEach((s) => {
      const sn = Number(s.dataset.step);
      s.classList.toggle("active", sn === n);
      s.classList.toggle("done", sn < n);
    });

    const back = byId("btnBack");
    const next = byId("btnNext");
    const toCart = byId("btnToCart");

    back.style.visibility = n === 1 || n === 4 ? "hidden" : "visible";
    toCart.style.display = n === 1 ? "" : "none";

    if (n === 4) {
      next.style.display = "none";
      toCart.style.display = "none";
    } else {
      next.style.display = "";
    }

    if (n === 1) next.innerHTML = 'Lanjut <i class="bi bi-arrow-right ms-1"></i>';
    if (n === 2) next.innerHTML = 'Lanjut ke Pembayaran <i class="bi bi-arrow-right ms-1"></i>';
    if (n === 3) {
      next.innerHTML = state.pay === "qris"
        ? '<i class="bi bi-qr-code me-1"></i>Bayar Sekarang'
        : '<i class="bi bi-check2-circle me-1"></i>Konfirmasi Pesanan';
    }

    if (n === 3) preparePayment();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------------- Pembayaran ---------------- */
  function preparePayment() {
    const t = totals();
    byId("qrisAmount").textContent = money(t.total);
    byId("cashAmount").textContent = money(t.total);
    byId("qrisPanel").classList.toggle("d-none", state.pay !== "qris");
    byId("cashPanel").classList.toggle("d-none", state.pay !== "cash");
    if (state.pay === "qris") {
      newQR();
      startTimer();
    } else {
      stopTimer();
    }
  }

  function newQR() {
    const seed = "IKOMERS|" + state.promo + "|" + totals().total + "|" + Date.now();
    IK.drawQR(byId("qrisCanvas"), seed);
    secondsLeft = QR_TIMEOUT;
    renderTimer();
  }

  function renderTimer() {
    const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const s = String(secondsLeft % 60).padStart(2, "0");
    byId("qrisTimer").textContent = m + ":" + s;
  }

  function startTimer() {
    stopTimer();
    timerId = setInterval(function () {
      secondsLeft--;
      renderTimer();
      if (secondsLeft <= 0) {
        stopTimer();
        IK.alertErr("Waktu pembayaran habis", "Kode QR sudah kedaluwarsa. Silakan muat ulang QR untuk melanjutkan.");
      }
    }, 1000);
  }
  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  /* ---------------- Validasi form ---------------- */
  function validateForm() {
    const name = byId("fName");
    const phone = byId("fPhone");
    const email = byId("fEmail");
    const address = byId("fAddress");
    let ok = true;

    const setState = (el, valid) => {
      el.classList.toggle("is-invalid", !valid);
      el.classList.toggle("is-valid", valid && el.value.trim() !== "");
      if (!valid) ok = false;
    };

    setState(name, name.value.trim().length >= 3);
    setState(phone, /^[0-9+\-\s]{10,16}$/.test(phone.value.trim()));
    setState(email, email.value.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
    if (state.shipping === "delivery") setState(address, address.value.trim().length >= 10);
    else { address.classList.remove("is-invalid"); }

    return ok;
  }

  /* ---------------- Buat pesanan ---------------- */
  function createOrder() {
    const t = totals();
    const order = {
      code: IK.orderCode(),
      createdAt: new Date().toISOString(),
      customer: {
        name: byId("fName").value.trim(),
        phone: byId("fPhone").value.trim(),
        email: byId("fEmail").value.trim(),
        date: byId("fDate").value,
        address: state.shipping === "delivery" ? byId("fAddress").value.trim() : "-",
        note: byId("fNote").value.trim()
      },
      shipping: state.shipping,
      shippingLabel: IK.SHIPPING[state.shipping].label,
      payment: state.pay,
      paymentLabel: state.pay === "qris" ? "QRIS" : "Cash / Tunai",
      status: state.pay === "qris" ? "Lunas (Dibayar)" : "Menunggu pembayaran tunai",
      items: Cart.lines().map((l) => ({
        id: l.product.id,
        name: l.product.name,
        emoji: l.product.emoji,
        tone: l.product.tone,
        price: l.product.price,
        qty: l.qty,
        total: l.total
      })),
      subtotal: t.subtotal,
      discount: t.discount,
      promoLabel: t.promoLabel,
      shippingCost: t.shipping,
      total: t.total
    };

    IK.saveOrder(order);   // simpan + potong stok
    Cart.clear();
    localStorage.removeItem(PROMO_KEY);
    state.order = order;
    return order;
  }

  function processPayment() {
    const isQris = state.pay === "qris";
    const doIt = function () {
      if (window.Swal) {
        Swal.fire({
          title: isQris ? "Memverifikasi pembayaran…" : "Membuat pesanan…",
          html: isQris
            ? "Menghubungkan ke penyedia QRIS (simulasi)"
            : "Menyimpan pesanan tunai kamu",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
      }
      setTimeout(function () {
        const order = createOrder();
        if (window.Swal) Swal.close();
        renderReceipt(order);
        setStep(4);
        IK.toast(isQris ? "Pembayaran berhasil!" : "Pesanan berhasil dibuat!", "success");
      }, 1800);
    };

    if (isQris) {
      IK.confirmBox("Konfirmasi pembayaran QRIS", "Total " + money(totals().total) + ". Lanjutkan simulasi pembayaran?", "Ya, saya sudah bayar")
        .then((ok) => { if (ok) doIt(); });
    } else {
      IK.confirmBox("Konfirmasi pesanan tunai", "Pesanan akan dibuat dan dibayar saat pengambilan/pengiriman.", "Ya, buat pesanan")
        .then((ok) => { if (ok) doIt(); });
    }
  }

  /* ---------------- Struk ---------------- */
  function receiptHTML(o) {
    const date = new Date(o.createdAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });
    return (
      '<div class="receipt" id="receiptContent">' +
        '<div class="text-center mb-2">' +
          '<div class="fw-bold">iKomers Cookies</div>' +
          '<div class="small">Jl. Kenangan Manis No. 12, Bandung</div>' +
          '<div class="small">WhatsApp: +' + IK.WA_NUMBER + "</div>" +
        "</div>" +
        "<hr>" +
        '<div class="row-line"><span>Kode Pesanan</span><b>' + esc(o.code) + "</b></div>" +
        '<div class="row-line"><span>Tanggal</span><span>' + esc(date) + "</span></div>" +
        '<div class="row-line"><span>Status</span><b>' + esc(o.status) + "</b></div>" +
        "<hr>" +
        '<div class="row-line"><span>Pemesan</span><span>' + esc(o.customer.name) + "</span></div>" +
        '<div class="row-line"><span>WhatsApp</span><span>' + esc(o.customer.phone) + "</span></div>" +
        (o.customer.email ? '<div class="row-line"><span>Email</span><span>' + esc(o.customer.email) + "</span></div>" : "") +
        '<div class="row-line"><span>Pengiriman</span><span>' + esc(o.shippingLabel) + "</span></div>" +
        (o.shipping === "delivery" ? '<div class="row-line"><span>Alamat</span><span class="text-end ms-3">' + esc(o.customer.address) + "</span></div>" : "") +
        "<hr>" +
        o.items
          .map(
            (i) =>
              '<div class="row-line"><span>' + esc(i.emoji) + " " + esc(i.name) + " ×" + i.qty + "</span><span>" + money(i.total) + "</span></div>"
          )
          .join("") +
        "<hr>" +
        '<div class="row-line"><span>Subtotal</span><span>' + money(o.subtotal) + "</span></div>" +
        (o.discount ? '<div class="row-line"><span>' + esc(o.promoLabel) + "</span><span>-" + money(o.discount) + "</span></div>" : "") +
        '<div class="row-line"><span>Ongkir</span><span>' + (o.shippingCost === 0 ? "Gratis" : money(o.shippingCost)) + "</span></div>" +
        '<div class="row-line fw-bold" style="font-size:1.05rem"><span>TOTAL</span><span>' + money(o.total) + "</span></div>" +
        '<div class="row-line"><span>Metode Bayar</span><span>' + esc(o.paymentLabel) + "</span></div>" +
        "<hr>" +
        '<div class="text-center small">Terima kasih sudah berbelanja! 🍪<br>Simpan struk ini sebagai bukti pesanan.</div>' +
      "</div>"
    );
  }

  function renderReceipt(o) {
    byId("receiptBox").innerHTML = receiptHTML(o);
    byId("doneTitle").textContent = o.payment === "qris" ? "Pembayaran berhasil!" : "Pesanan berhasil dibuat!";
    byId("doneSub").textContent =
      o.payment === "qris"
        ? "Pesanan " + o.code + " sudah lunas dan sedang disiapkan."
        : "Pesanan " + o.code + " menunggu pembayaran tunai sebesar " + money(o.total) + ".";

    const text =
      "Halo iKomers Cookies! Konfirmasi pesanan saya:%0A" +
      "Kode: " + o.code + "%0A" +
      "Nama: " + o.customer.name + "%0A" +
      "Total: " + money(o.total) + "%0A" +
      "Metode: " + o.paymentLabel + "%0A" +
      "Pengiriman: " + o.shippingLabel;
    byId("waReceipt").href = "https://wa.me/" + IK.WA_NUMBER + "?text=" + text;
  }

  /* ---------------- Bind ---------------- */
  function bind() {
    document.addEventListener("ik:cart", function () {
      if (state.step < 4) {
        renderStep1();
        renderSide();
      }
    });

    // pilihan pengiriman
    document.querySelectorAll("[data-ship]").forEach(function (el) {
      el.addEventListener("click", function () {
        document.querySelectorAll("[data-ship]").forEach((x) => x.classList.remove("selected"));
        el.classList.add("selected");
        el.querySelector("input").checked = true;
        state.shipping = el.dataset.ship;
        byId("addressWrap").style.display = state.shipping === "delivery" ? "" : "none";
        renderSide();
      });
    });

    // pilihan pembayaran
    document.querySelectorAll("[data-pay]").forEach(function (el) {
      el.addEventListener("click", function () {
        document.querySelectorAll("[data-pay]").forEach((x) => x.classList.remove("selected"));
        el.classList.add("selected");
        el.querySelector("input").checked = true;
        state.pay = el.dataset.pay;
        if (state.step === 3) {
          byId("qrisPanel").classList.toggle("d-none", state.pay !== "qris");
          byId("cashPanel").classList.toggle("d-none", state.pay !== "cash");
          byId("btnNext").innerHTML = state.pay === "qris"
            ? '<i class="bi bi-qr-code me-1"></i>Bayar Sekarang'
            : '<i class="bi bi-check2-circle me-1"></i>Konfirmasi Pesanan';
          if (state.pay === "qris") { newQR(); startTimer(); } else { stopTimer(); }
        }
      });
    });

    byId("btnBack").addEventListener("click", function () {
      if (state.step > 1) setStep(state.step - 1);
    });

    byId("btnNext").addEventListener("click", function () {
      if (state.step === 1) {
        if (!Cart.count()) {
          IK.alertErr("Keranjang kosong", "Tambahkan produk dulu sebelum melanjutkan.");
          return;
        }
        setStep(2);
        return;
      }
      if (state.step === 2) {
        if (!validateForm()) {
          IK.alertErr("Data belum lengkap", "Periksa kembali kolom yang ditandai merah.");
          return;
        }
        setStep(3);
        return;
      }
      if (state.step === 3) {
        processPayment();
      }
    });

    byId("refreshQr").addEventListener("click", function () {
      newQR();
      startTimer();
      IK.toast("Kode QR diperbarui", "success");
    });

    byId("simulatePay").addEventListener("click", processPayment);

    byId("printReceipt").addEventListener("click", function () {
      const w = window.open("", "_blank", "width=420,height=680");
      if (!w) { IK.alertErr("Popup diblokir", "Izinkan popup untuk mencetak struk."); return; }
      w.document.write(
        "<html><head><title>Struk " + (state.order ? state.order.code : "") + "</title>" +
        "<style>body{font-family:'Courier New',monospace;font-size:13px;padding:16px;color:#222}" +
        ".row-line{display:flex;justify-content:space-between;gap:12px}.text-center{text-align:center}" +
        ".text-end{text-align:right}hr{border:none;border-top:1px dashed #999;margin:8px 0}" +
        ".fw-bold{font-weight:700}.small{font-size:11px}</style></head><body>" +
        receiptHTML(state.order) +
        "</body></html>"
      );
      w.document.close();
      w.focus();
      setTimeout(function () { w.print(); }, 300);
    });

    // tombol buka order menu tetap berfungsi dari app.js
  }

  /* ---------------- Start ---------------- */
  IK.boot().then(function () {
    const today = new Date().toISOString().slice(0, 10);
    byId("fDate").value = today;
    byId("fDate").min = today;

    if (!Cart.count()) {
      IK.alertErr("Keranjang kosong", "Silakan pilih produk terlebih dahulu.").then(function () {
        window.location.href = "cart.html";
      });
      return;
    }

    renderStep1();
    renderSide();
    bind();
    setStep(1);
  });
})();
