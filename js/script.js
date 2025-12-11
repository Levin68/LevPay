// ====== Orkut Credentials (global) ======
// -> dipakai utils.js utk kirim header x-orkut-* dan base_qr_string ke backend Orkut
globalThis.ORKUT_AUTH_USERNAME = "vinzyy";
globalThis.ORKUT_AUTH_TOKEN    = "1331927:cCVk0A4be8WL2ONriangdHJvU7utmfTh";
globalThis.BASE_QR_STRING      = "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214503370116723410303UMI51440014ID.CO.QRIS.WWW0215ID20232921353400303UMI5204541153033605802ID5919NEVERMORE OK13319276013JAKARTA UTARA61051411062070703A0163046C64";

// js/script.js
window.addEventListener('load', () => {
  // ===== Helper =====
  const byId = (id) => document.getElementById(id);
  const toast = (msg, type = 'info', ms = 3000) => (window.showToast || console.log)(msg, type, ms);
  const errBox = (msg) => (window.showError || console.error)(msg);
  const rupiah = (n) => (window.formatCurrency || ((v) => `Rp ${v}`))(n);
  const openSheet = (id) => (window.openBottomSheet || console.log)(id);
  const closeSheet = (id) => (window.closeBottomSheet || console.log)(id);
  const setCreateQRLoading = (b) => (window.setCreateQRLoading || console.log)(b);
  const genOrderId = () => (window.generateOrderId || (() => `ORD-${Date.now()}`))();
  // ===== Helpers ringkas =====
(function () {
  const byId = (id) => document.getElementById(id);

  // --- BACKDROP klik = tutup semua sheet ---
  const backdrop = byId('bottomSheetBackdrop');
  backdrop?.addEventListener('click', () => {
    ['historyBottomSheet', 'paymentBottomSheet'].forEach(id => {
      const el = byId(id);
      if (el?.classList.contains('active')) {
        window.closeBottomSheet?.(id);
      }
    });
  });

  // --- Toggle util utk bottom sheet ---
  function toggleSheet(id, onOpen) {
    const el = byId(id);
    if (!el) return;
    const isOpen = el.classList.contains('active');
    if (isOpen) {
      window.closeBottomSheet?.(id);
    } else {
      window.openBottomSheet?.(id);
      onOpen?.();
    }
  }

  // ===== RIWAYAT: jadikan tombol toggle, dan jangan auto-close saat tap isi sheet =====
  const rebind = (id, handler) => {
    const el = byId(id);
    if (!el) return;
    el.onclick = null;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      Promise.resolve(handler()).catch(console.error);
    });
  };

  rebind('historyBtn', () =>
    toggleSheet('historyBottomSheet', () => window.renderHistory?.())
  );
  rebind('stickyHistoryBtn', () =>
    toggleSheet('historyBottomSheet', () => window.renderHistory?.())
  );
  // Tombol X sudah ada: #closeHistorySheet pakai closeBottomSheet
  rebind('closeHistorySheet', () => window.closeBottomSheet?.('historyBottomSheet'));

  // ===== DASHBOARD: style tombol aktif/non-aktif selalu sinkron =====
  (function () {
    const btn = byId('dashboardBtn');
    const panel = byId('dashboardStats');
    if (!btn || !panel) return;

    function setBtnActive(active) {
      // base class awal: "bg-surface-elevated hover:bg-indigo-600 ..."
      btn.classList.toggle('bg-surface-elevated', !active);
      btn.classList.toggle('bg-indigo-600', active);
      btn.classList.toggle('hover:bg-indigo-600', !active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    // Hook fungsi toggleDashboard yang sudah ada
    const _toggle = window.toggleDashboard || function(){};
    window.toggleDashboard = function () {
      _toggle();
      const isOpen = !panel.classList.contains('hidden');
      setBtnActive(isOpen);
    };

    // Observer: kalau ada yang mengubah panel hidden di tempat lain, tombol ikut update
    const mo = new MutationObserver(() => {
      setBtnActive(!panel.classList.contains('hidden'));
    });
    mo.observe(panel, { attributes: true, attributeFilter: ['class'] });

    // set awal
    setBtnActive(!panel.classList.contains('hidden'));
  })();
})();
  // ====== DASHBOARD BUTTON: aktif/non-aktif warnanya rapi ======
(function () {
  const byId = (id) => document.getElementById(id);
  const btn = byId('dashboardBtn');
  const panel = byId('dashboardStats');

  if (!btn || !panel) return;

  function setBtnActive(active) {
    // base class tombol aslinya ada "bg-surface-elevated hover:bg-indigo-600"
    btn.classList.toggle('bg-surface-elevated', !active);
    btn.classList.toggle('bg-indigo-600', active);
    btn.classList.toggle('hover:bg-indigo-600', !active); // kalau aktif, hilangkan hover yg sama
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  }

  // hook ke fungsi toggleDashboard yang sudah ada
  const _toggle = window.toggleDashboard || function(){};
  window.toggleDashboard = function() {
    _toggle();
    const isOpen = !panel.classList.contains('hidden');
    setBtnActive(isOpen);
  };

  // inisialisasi state saat load
  setBtnActive(!panel.classList.contains('hidden'));
})();
  // ====== AUTO CLOSE: History sheet tutup kalau tap di mana pun ======
(function () {
  const byId = (id) => document.getElementById(id);
  const backdrop = byId('bottomSheetBackdrop');
  let autoCloseOnce = null;

  // klik backdrop: tutup semua sheet yang mungkin terbuka
  backdrop?.addEventListener('click', () => {
    ['historyBottomSheet', 'paymentBottomSheet'].forEach(id => closeBottomSheet(id));
  });

  // inject ke openBottomSheet agar history sheet auto-close on next tap
  const _open = window.openBottomSheet || (()=>{});
  window.openBottomSheet = function(id) {
    _open(id);
    if (id === 'historyBottomSheet') {
      // tunggu 0ms biar klik tombol pembuka nggak ikut menutup
      setTimeout(() => {
        autoCloseOnce = (e) => {
          closeBottomSheet('historyBottomSheet');
        };
        // sekali tap di mana pun -> close
        document.addEventListener('pointerdown', autoCloseOnce, { once: true, capture: true });
      }, 0);
    }
  };

  // bersihkan listener saat sheet ditutup manual
  const _close = window.closeBottomSheet || (()=>{});
  window.closeBottomSheet = function(id) {
    _close(id);
    if (id === 'historyBottomSheet' && autoCloseOnce) {
      document.removeEventListener('pointerdown', autoCloseOnce, { capture: true });
      autoCloseOnce = null;
    }
  };
})();

  // ===== State =====
  let currentTransaction = null;
  let transactionHistory = JSON.parse(localStorage.getItem('transactionHistory') || '[]');
  let quickTemplates = JSON.parse(localStorage.getItem('quickTemplates') || '[]');
  let countdownInterval = null;
  let pollingInterval = null;

  // ===== Templates =====
  function loadTemplates() {
    const container = byId('templateChips');
    if (!container) return;
    container.innerHTML = '';
    quickTemplates = JSON.parse(localStorage.getItem('quickTemplates') || '[]');

    if (!quickTemplates.length) {
      container.innerHTML = '<span class="text-xs text-secondary italic">Belum ada template.</span>';
      return;
    }

    quickTemplates.forEach((t, i) => {
      const chip = document.createElement('div');
      chip.className = 'flex items-center bg-surface-elevated rounded-lg pl-3 pr-1 py-1 text-sm';
      chip.innerHTML = `
        <span class="cursor-pointer hover:text-blue-400">${t.label} (${rupiah(t.amount)})</span>
        <button class="ml-2 text-secondary hover:text-red-400 w-5 h-5 flex items-center justify-center" data-index="${i}">&times;</button>
      `;
      chip.querySelector('span').addEventListener('click', () => {
        const amount = byId('amount');
        if (amount) amount.value = t.amount;
        toast(`Template '${t.label}' diterapkan.`);
      });
      chip.querySelector('button').addEventListener('click', () => {
        quickTemplates.splice(i, 1);
        localStorage.setItem('quickTemplates', JSON.stringify(quickTemplates));
        loadTemplates();
        toast('Template dihapus.', 'info');
      });
      container.appendChild(chip);
    });
  }

  function addTemplate() {
    const amountEl = byId('templateAmount');
    const labelEl = byId('templateLabel');
    const amount = parseInt(amountEl?.value || '0', 10);
    const label = (labelEl?.value || '').trim();
    if (!amount || amount < 1) return toast('Nominal template tidak valid.', 'error');
    if (!label) return toast('Label template tidak boleh kosong.', 'error');

    quickTemplates.unshift({ label, amount });
    localStorage.setItem('quickTemplates', JSON.stringify(quickTemplates));
    toast('Template berhasil disimpan!', 'success');
    loadTemplates();

    const modal = byId('addTemplateModal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); document.body.style.overflow = 'auto'; }
  }

  // ===== Dashboard & History =====
  function updateDashboardStats() {
    const history = JSON.parse(localStorage.getItem('transactionHistory') || '[]');
    const paid = history.filter(tx => tx.status === 'PAID');
    const totalAmount = paid.reduce((s, tx) => s + (tx.amount || 0), 0);
    const rate = history.length ? (paid.length / history.length) * 100 : 0;
    byId('totalTransactions') && (byId('totalTransactions').textContent = paid.length);
    byId('totalAmount') && (byId('totalAmount').textContent = rupiah(totalAmount));
    byId('successRate') && (byId('successRate').textContent = `${rate.toFixed(0)}%`);
  }

  function toggleDashboard() {
    const el = byId('dashboardStats');
    if (!el) return;
    if (el.classList.contains('hidden')) updateDashboardStats();
    el.classList.toggle('hidden');
  }

  function renderHistory() {
    const list = byId('historyList');
    const empty = byId('emptyHistory');
    const history = JSON.parse(localStorage.getItem('transactionHistory') || '[]');
    if (!list || !empty) return;

    if (!history.length) {
      list.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    list.innerHTML = history.map(tx => `
      <div class="bg-surface-elevated rounded-lg p-3 mb-3">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-bold">${rupiah(tx.amount)}</p>
            <p class="text-xs text-secondary">${tx.id || tx.reference_id}</p>
          </div>
          <div class="text-right">
            <span class="text-xs font-semibold px-2 py-1 rounded-full ${tx.status === 'PAID' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}">${tx.status}</span>
            <p class="text-xs text-secondary mt-1">${new Date(tx.paid_at || tx.created_at).toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ===== Payment Flow =====
  async function handleCreateQR() {
    const amountInput = byId('amount');
    const v = parseInt(amountInput?.value || '0', 10);
    if (!v || v < 1) {
      errBox('Nominal minimal Rp 1');
      toast('Nominal minimal Rp 1', 'error');
      amountInput?.classList.add('shake');
      setTimeout(() => amountInput?.classList.remove('shake'), 450);
      return;
    }

    setCreateQRLoading(true);
    try {
      openSheet('paymentBottomSheet');

      const orderId = genOrderId();
      byId('orderId') && (byId('orderId').textContent = orderId);
      byId('modalAmount') && (byId('modalAmount').textContent = rupiah(v));
      byId('autoRefreshIndicator')?.classList.remove('hidden');

      await (window.runProgressiveLoading?.() || Promise.resolve());

      const res = await window.createRealQR(v, orderId);
      console.log('Full Response:', res);
console.log('Possible fields:', {
  qr_image_url: res?.qr_image_url || res?.qris?.qr_image_url || res?.data?.qr_image_url,
  qr_string: res?.qr_string || res?.qris?.qr_string || res?.data?.qr_string,
  reference_id: res?.reference_id, id: res?.id, expires_at: res?.expires_at
});

      const qrImgUrl =
        res?.qris?.qr_image_url || res?.qr_image_url || res?.qrcode_image_url || res?.data?.qr_image_url || null;

      function isLikelyQRIS(s = '') {
  // indikasi sederhana: mulai "000201", ada tag CRC 63 di akhir sepanjang 4 hex
  if (typeof s !== 'string') return false;
  if (!s.startsWith('000201')) return false;
  const i = s.indexOf('6304');
  if (i === -1) return false;
  const crc = s.slice(i + 4, i + 8);
  return /^[0-9A-Fa-f]{4}$/.test(crc);
}
// setelah const res = await window.createRealQR(v, orderId);
const qrString =
  res?.qris?.qr_string || res?.qr_string || res?.qr_code ||
  res?.qrcode || res?.data?.qr_string || res?.data?.qr_code || null;

if (qrString && !isLikelyQRIS(qrString)) {
  console.warn('[QR DEBUG] qr_string bukan format QRIS/EMVCo:', qrString);
  toast('QR dari server bukan format QRIS. Hubungi dev back-end.', 'error', 6000);
}

      const pollId = res?.id || res?.qris?.id || orderId;
      const reference = res?.reference_id || orderId;
      const expires = res?.qris?.expires_at || res?.expires_at;

      currentTransaction = { reference_id: reference, id: pollId, amount: v, created_at: new Date().toISOString() };
      byId('referenceId') && (byId('referenceId').textContent = reference);

      const img = byId('qrImage');
      const qrBox = byId('qrContainer');

      // ==== RENDER QR TANPA LIBRARY ====
// 1) Kalau server sudah kasih gambar → langsung pakai
if (qrImgUrl) {
  if (img) {
    img.src = qrImgUrl;
    img.style.display = 'block';
  }
  qrBox?.classList.remove('hidden');
  byId('transactionInfo')?.classList.remove('hidden');
  byId('actionButtons')?.classList.remove('hidden');
  try { await window.autoSaveQRToGallery?.(qrImgUrl); } catch {}
}
// 2) Kalau tidak ada gambar dari API, tapi ada string → pakai layanan image QR
else if (qrString) {
  const imgUrl =
    'https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=' +
    encodeURIComponent(qrString);

  if (img) {
    img.src = imgUrl;
    img.style.display = 'block';
  }
  qrBox?.classList.remove('hidden');
  try { await window.autoSaveQRToGallery?.(imgUrl); } catch {}
}
// 3) Tidak ada data sama sekali
else {
  console.log('[createRealQR] keys:', Object.keys(res || {}));
  throw new Error('API tidak mengembalikan qr_image_url / qr_string.');
}

      startCountdown(expires);
      startAutoRefresh(pollId);
      toast('QR berhasil dibuat! 🎯', 'success');
    } catch (e) {
      console.error(e);
      toast(e?.message || 'Gagal membuat QR', 'error', 5000);
      closeSheet('paymentBottomSheet');
    } finally {
      setCreateQRLoading(false);
    }
  }

  function handlePaymentSuccess() {
    if (countdownInterval) clearInterval(countdownInterval);
    if (pollingInterval) clearInterval(pollingInterval);
    try { window.clearAllIntervals?.(); } catch {}
    window.createConfetti?.();

    byId('statusBox')?.classList.remove('hidden');
    byId('qrContainer')?.classList.add('hidden');
    byId('actionButtons')?.classList.add('hidden');
    toast('🎉 Pembayaran berhasil!', 'success', 6000);

    const tx = { ...currentTransaction, status: 'PAID', paid_at: new Date().toISOString() };
    const i = transactionHistory.findIndex(t => t.id === tx.id);
    if (i > -1) transactionHistory[i] = tx; else transactionHistory.unshift(tx);
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    updateDashboardStats();
  }

  function startCountdown(expiresAt) {
    if (countdownInterval) clearInterval(countdownInterval);
    const el = byId('countdown');
    const tick = () => {
      if (!expiresAt) { if (countdownInterval) clearInterval(countdownInterval); return; }
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        if (el) el.textContent = '00:00:00';
        byId('expiredBox')?.classList.remove('hidden');
        byId('qrContainer')?.classList.add('hidden');
        byId('actionButtons')?.classList.add('hidden');
        if (pollingInterval) clearInterval(pollingInterval);
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      if (el) el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };
    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  function startAutoRefresh(idOrRef) {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(async () => {
      try {
        const paid = await window.checkRealPaymentStatus?.(idOrRef);
        if (paid) handlePaymentSuccess();
      } catch {}
    }, 5000);
  }

  // ===== Init UI =====
  loadTemplates();
  renderHistory();
  updateDashboardStats();

  const theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  byId('currentYear') && (byId('currentYear').textContent = new Date().getFullYear());

  if (window.CONFIG) {
    const waLinkAdmin = `https://wa.me/${window.CONFIG.WHATSAPP_ADMIN}`;
    const waLinkNum = `https://wa.me/${window.CONFIG.WHATSAPP_NUMBER}`;
    const channelLink = window.CONFIG.WHATSAPP_CHANNEL_URL || '#';
    byId('headerChannelBtn') && (byId('headerChannelBtn').href = channelLink);
    byId('modalChannelBtn') && (byId('modalChannelBtn').href = channelLink);
    byId('headerAdminBtn') && (byId('headerAdminBtn').href = waLinkAdmin);
    byId('contactAdminBtn') && (byId('contactAdminBtn').href = waLinkAdmin);
    byId('footerWhatsAppBtn') && (byId('footerWhatsAppBtn').href = waLinkNum);
    byId('footerChannelBtn') && (byId('footerChannelBtn').href = channelLink);
  }

  // ===== Bind tombol (tanpa delegasi) =====
  function bindClick(id, fn) {
    const el = byId(id);
    if (!el) return;
    el.onclick = null;
    el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); Promise.resolve(fn()).catch(console.error); });
    if (el.tagName === 'A') el.setAttribute('href', 'javascript:void(0)');
  }

  bindClick('createQRBtn', handleCreateQR);
  bindClick('stickyCreateQRBtn', handleCreateQR);
  bindClick('dashboardBtn', toggleDashboard);
  bindClick('historyBtn', () => { openSheet('historyBottomSheet'); renderHistory(); });
  bindClick('stickyHistoryBtn', () => { openSheet('historyBottomSheet'); renderHistory(); });
  bindClick('closeHistorySheet', () => closeSheet('historyBottomSheet'));
  bindClick('closePaymentSheet', () => closeSheet('paymentBottomSheet'));
  bindClick('addTemplateBtn', () => {
    const modal = byId('addTemplateModal');
    if (!modal) return;
    modal.classList.remove('hidden'); modal.classList.add('flex'); document.body.style.overflow = 'hidden';
    byId('templateAmount') && (byId('templateAmount').value = '');
    byId('templateLabel') && (byId('templateLabel').value = '');
  });
  bindClick('closeTemplateBtn', () => {
    const modal = byId('addTemplateModal');
    if (!modal) return;
    modal.classList.add('hidden'); modal.classList.remove('flex'); document.body.style.overflow = 'auto';
  });
  bindClick('saveTemplateBtn', addTemplate);

  bindClick('themeToggleBtn', () => {
    const html = document.documentElement;
    const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // preset chips
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (!t.classList.contains('preset-chip')) return;
    const amt = t.getAttribute('data-amount');
    if (amt && byId('amount')) byId('amount').value = amt;
  });
});
