/* ============================================================
   iKomers Cookies — assets/js/about.js
   Menampilkan riwayat pesanan dari localStorage.
   ============================================================ */
(function () {
  "use strict";

  const { money, esc, byId } = IK;

  function renderHistory() {
    const mount = byId("orderHistory");
    const orders = IK.getOrders();

    if (!orders.length) {
      mount.innerHTML =
        '<div class="panel empty-state">' +
          '<span class="big">🧾</span>' +
          "<h6>Belum ada pesanan</h6>" +
          '<p class="small mb-3">Riwayat pesanan akan muncul di sini setelah kamu checkout.</p>' +
          '<a href="index.html#produk" class="btn btn-cookie btn-sm">Mulai Belanja</a>' +
        "</div>";
      return;
    }

    mount.innerHTML = orders
      .map(function (o) {
        const date = new Date(o.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
        const badge =
          o.payment === "qris"
            ? '<span class="badge-soft ok">Lunas · QRIS</span>'
            : '<span class="badge-soft warn">Tunai · ' + esc(o.status) + "</span>";
        return (
          '<div class="panel mb-3">' +
            '<div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">' +
              "<div>" +
                '<div class="fw-bold">' + esc(o.code) + "</div>" +
                '<div class="text-muted-2 small">' + esc(date) + " · " + esc(o.customer.name) + "</div>" +
              "</div>" +
              '<div class="text-end">' + badge +
                '<div class="fw-bold mt-1">' + money(o.total) + "</div>" +
              "</div>" +
            "</div>" +
            '<div class="d-flex flex-wrap gap-2">' +
              o.items
                .map(
                  (i) =>
                    '<span class="badge-soft">' + esc(i.emoji) + " " + esc(i.name) + " ×" + i.qty + "</span>"
                )
                .join("") +
            "</div>" +
            '<div class="text-muted-2 small mt-3"><i class="bi bi-truck me-1"></i>' + esc(o.shippingLabel) +
              (o.customer.address && o.customer.address !== "-" ? " · " + esc(o.customer.address) : "") + "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  IK.boot().then(function () {
    renderHistory();
    document.addEventListener("ik:cart", renderHistory);
  });
})();
