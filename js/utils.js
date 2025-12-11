// js/utils.js
// =====================================================
// LevPay Utils — helper UI, API bridge, dan eksport ke window
// =====================================================

// ===== helpers umum =====
function formatCurrency(n){
  return new Intl.NumberFormat('id-ID',{
    style:'currency', currency:'IDR', minimumFractionDigits:0
  }).format(n||0);
}
function formatDateTime(d){
  return new Intl.DateTimeFormat('id-ID',{
    day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
  }).format(new Date(d));
}
function generateOrderId(){ return `ORD-${Date.now()}`; }

function showError(msg){
  const el=document.getElementById('errorMessage');
  if(!el) return;
  el.textContent=msg;
  el.classList.remove('hidden');
  setTimeout(()=>el.classList.add('hidden'),5000);
}
function showToast(msg,type='info',ms=3000){
  const colors={
    success:'bg-green-600 border-green-500',
    error:'bg-red-600 border-red-500',
    info:'bg-blue-600 border-blue-500',
    warning:'bg-yellow-600 border-yellow-500'
  };
  const icons={
    success:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    error:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    info:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    warning:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  };
  const wrap=document.getElementById('toastContainer');
  const toast=document.createElement('div');
  toast.className=`${colors[type]||colors.info} border-l-4 p-4 rounded-lg shadow-lg mb-2 toast-enter`;
  toast.innerHTML=`
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        ${icons[type]||icons.info}
        <span class="text-white text-sm font-medium">${msg}</span>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="text-white opacity-70 hover:opacity-100 ml-4">&times;</button>
    </div>`;
  wrap?.appendChild(toast);
  setTimeout(()=>{
    toast.classList.add('toast-exit');
    setTimeout(()=>toast.remove(),300);
  },ms);
}

// ===== bottom sheet / theme / loading =====
function openBottomSheet(id){
  document.getElementById('bottomSheetBackdrop')?.classList.add('active');
  document.getElementById(id)?.classList.add('active');
  document.body.style.overflow='hidden';
}
function closeBottomSheet(id){
  document.getElementById('bottomSheetBackdrop')?.classList.remove('active');
  document.getElementById(id)?.classList.remove('active');
  document.body.style.overflow='auto';
  if(id==='paymentBottomSheet'){
    clearAllIntervals();
    resetPaymentSheet();
  }
}
function resetPaymentSheet(){
  ['progressiveLoading','qrContainer','transactionInfo','actionButtons','statusBox','expiredBox','autoRefreshIndicator']
    .forEach(i=>document.getElementById(i)?.classList.add('hidden'));
  ['step1','step2','step3'].forEach((sid,idx)=>{
    const s=document.getElementById(sid);
    const ic=document.getElementById(sid.replace('step','stepIcon'));
    s?.classList.remove('active','completed');
    ic?.classList.remove('active','completed');
    ic?.classList.add('pending');
    if(ic) ic.innerHTML=String(idx+1);
  });
}
function setCreateQRLoading(b){
  const btn=document.getElementById('createQRBtn'); if(btn) btn.disabled=b;
  const sbtn=document.getElementById('stickyCreateQRBtn'); if(sbtn) sbtn.disabled=b;
  document.getElementById('createQRBtnText')?.classList.toggle('hidden',b);
  document.getElementById('createQRBtnLoading')?.classList.toggle('hidden',!b);
}

let pollingInterval=null, countdownInterval=null;
function clearAllIntervals(){
  [pollingInterval,countdownInterval].forEach(t=>t&&clearInterval(t));
  pollingInterval=countdownInterval=null;
}

async function runProgressiveLoading(){
  const el=document.getElementById('progressiveLoading');
  if(!el) return;
  el.classList.remove('hidden');
  const step=(sid)=>{
    const s=document.getElementById(sid);
    const ic=document.getElementById(sid.replace('step','stepIcon'));
    s?.classList.add('active'); ic?.classList.remove('pending'); ic?.classList.add('active');
  };
  const done=(sid)=>{
    const s=document.getElementById(sid);
    const ic=document.getElementById(sid.replace('step','stepIcon'));
    ic?.classList.remove('active'); ic?.classList.add('completed');
    if(ic) ic.innerHTML='✓';
    s?.classList.add('completed');
  };
  step('step1'); await new Promise(r=>setTimeout(r,500)); done('step1');
  step('step2'); await new Promise(r=>setTimeout(r,700)); done('step2');
  step('step3'); await new Promise(r=>setTimeout(r,400)); done('step3');
  setTimeout(()=>{
    el.classList.add('hidden');
    document.getElementById('qrContainer')?.classList.remove('hidden');
    document.getElementById('transactionInfo')?.classList.remove('hidden');
    document.getElementById('actionButtons')?.classList.remove('hidden');
  },150);
}

// ===== build URL + headers + fetch safe (Orkut) =====
function buildApiUrl(path){
  const base=(window.CONFIG?.API_BASE||'').replace(/\/$/,'');
  const pref=(window.CONFIG?.API_PREFIX||'').replace(/\/$/,'');
  return `${base}${pref}${path.startsWith('/')?path:`/${path}`}`;
}

// Ambil kredensial Orkut (boleh didefine di window atau global)
function getOrkutAuthHeaders(){
  const g = (typeof window!=='undefined' && window) || (typeof global!=='undefined' && global) || {};
  const username = g.ORKUT_AUTH_USERNAME || g.ORKUT_USERNAME || '';
  const token    = g.ORKUT_AUTH_TOKEN    || g.ORKUT_TOKEN    || '';
  const h = { 'Content-Type':'application/json' };
  if (username) h['x-orkut-username'] = username;
  if (token)    h['x-orkut-token']    = token;
  return h;
}
function getBaseQRString(){
  const g = (typeof window!=='undefined' && window) || (typeof global!=='undefined' && global) || {};
  return g.BASE_QR_STRING || g.YOUR_BASE_QR_STRING || '';
}

async function fetchJson(url,opts={}){
  const res = await fetch(url,{cache:'no-store',mode:'cors',...opts});
  if(!res.ok){
    let errorData;
    try { errorData = await res.json(); }
    catch { errorData = { message: await res.text() }; }
    throw new Error(errorData.message || errorData.error || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ===== API Calls (Orkut-first; fallback ke varian lama) =====
// Prefer Orkut v1: POST /payments (amount, reference_id, base_qr_string?)
async function _createQR_v1(amount, referenceId){
  const url  = buildApiUrl('/payments');
  const body = {
    amount: Number(amount),
    reference_id: referenceId,
    base_qr_string: getBaseQRString() || undefined
  };
  const headers = { ...getOrkutAuthHeaders() };
  return fetchJson(url, { method:'POST', headers, body: JSON.stringify(body) });
}

// Fallback legacy #1: POST /api/create-qr
async function _createQR_legacy(amount, referenceId){
  const url  = buildApiUrl('/api/create-qr');
  const body = {
    amount: Number(amount),
    reference_id: referenceId,
    base_qr_string: getBaseQRString() || undefined
  };
  const headers = { ...getOrkutAuthHeaders() };
  return fetchJson(url, { method:'POST', headers, body: JSON.stringify(body) });
}

// Fallback legacy #2: POST /qris/create (beberapa backend Orkut pakai path ini)
async function _createQR_alt(amount, referenceId){
  const url  = buildApiUrl('/qris/create');
  const body = {
    amount: Number(amount),
    reference_id: referenceId,
    base_qr_string: getBaseQRString() || undefined
  };
  const headers = { ...getOrkutAuthHeaders() };
  return fetchJson(url, { method:'POST', headers, body: JSON.stringify(body) });
}

// Status v1: GET /payments/:idOrRef
async function _checkStatus_v1(idOrRef){
  const url = buildApiUrl(`/payments/${encodeURIComponent(idOrRef)}`);
  const headers = { ...getOrkutAuthHeaders() };
  return fetchJson(url, { headers });
}

// Legacy #1: POST /api/check-status
async function _checkStatus_legacy(idOrRef){
  const url = buildApiUrl('/api/check-status');
  const headers = { ...getOrkutAuthHeaders() };
  return fetchJson(url, {
    method:'POST',
    headers,
    body: JSON.stringify({ id:idOrRef, reference_id:idOrRef })
  });
}

// Legacy #2: GET /qris/status?reference_id=...
async function _checkStatus_alt(idOrRef){
  const u = new URL(buildApiUrl('/qris/status'));
  u.searchParams.set('reference_id', idOrRef);
  const headers = { ...getOrkutAuthHeaders() };
  return fetchJson(u.toString(), { headers });
}

// — API publik dipakai script.js — (tetap)
async function createRealQR(amount, referenceId){
  try {
    const data = await _createQR_v1(amount, referenceId);
    console.log('Full Response (v1):', data);
    console.log('Possible fields:', {
      qr_image_url: data?.qr_image_url || data?.qris?.qr_image_url || data?.data?.qr_image_url,
      qr_string:    data?.qr_string    || data?.qris?.qr_string    || data?.data?.qr_string,
      reference_id: data?.reference_id, id: data?.id, expires_at: data?.expires_at
    });
    return data;
  } catch (e1) {
    console.warn('createRealQR v1 failed, try legacy:', e1.message);
    try {
      const data = await _createQR_legacy(amount, referenceId);
      console.log('Full Response (legacy):', data);
      return data;
    } catch (e2){
      console.warn('createRealQR legacy failed, try alt:', e2.message);
      const data = await _createQR_alt(amount, referenceId);
      console.log('Full Response (alt):', data);
      return data;
    }
  }
}

async function checkRealPaymentStatus(idOrRef){
  try {
    const data = await _checkStatus_v1(idOrRef);
    const status = String(data?.status||'').toUpperCase();
    return data?.paid===true || ['PAID','SUCCEEDED','SETTLED','SUCCESS','COMPLETED'].includes(status);
  } catch (e1) {
    console.warn('checkStatus v1 failed, try legacy:', e1.message);
    try {
      const data = await _checkStatus_legacy(idOrRef);
      const status = String(data?.status||'').toUpperCase();
      return data?.paid===true || ['PAID','SUCCEEDED','SETTLED','SUCCESS','COMPLETED'].includes(status);
    } catch(e2){
      console.warn('checkStatus legacy failed, try alt:', e2.message);
      try {
        const data = await _checkStatus_alt(idOrRef);
        const status = String(data?.status||'').toUpperCase();
        return data?.paid===true || ['PAID','SUCCEEDED','SETTLED','SUCCESS','COMPLETED'].includes(status);
      } catch(e3){
        console.warn('checkStatus alt failed:', e3.message);
        return false;
      }
    }
  }
}

// ===== misc (UI) =====
function createConfetti(){
  const c=document.getElementById('confettiContainer'); if(!c) return;
  c.classList.remove('hidden');
  const colors=['#ff6b6b','#4ecdc4','#45b7d1','#f9ca24','#f0932b','#eb4d4b','#6c5ce7'];
  for(let i=0;i<50;i++){
    const d=document.createElement('div');
    d.classList.add('confetti');
    d.style.left=Math.random()*100+'%';
    d.style.backgroundColor=colors[Math.floor(Math.random()*colors.length)];
    d.style.animationDelay=Math.random()*3+'s';
    d.style.animationDuration=(Math.random()*3+2)+'s';
    c.appendChild(d);
  }
  setTimeout(()=>{c.innerHTML=''; c.classList.add('hidden');},5000);
}

async function autoSaveQRToGallery(url){
  try{
    const resp=await fetch(url,{mode:'cors'});
    const blob=await resp.blob();
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`LevPay-QR-${document.getElementById('orderId')?.textContent||Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('📸 QR berhasil disimpan ke galeri!','success',4000);
    return true;
  }catch(e){
    console.error('Save QR error',e);
    showToast('❌ Gagal menyimpan QR ke galeri','error');
    return false;
  }
}

function zoomQR(){
  const img=document.getElementById('qrImage');
  if(img?.src){
    document.getElementById('qrZoomImage').src=img.src;
    const m=document.getElementById('qrZoomModal');
    m?.classList.remove('hidden'); m?.classList.add('flex');
  }
}
function closeQRZoom(){
  const m=document.getElementById('qrZoomModal');
  m?.classList.add('hidden'); m?.classList.remove('flex');
}
function downloadQR(){
  const img=document.getElementById('qrImage');
  if(img?.src){
    const a=document.createElement('a');
    a.download=`LevPay-QR-${document.getElementById('orderId')?.textContent||Date.now()}.png`;
    a.href=img.src; a.click();
    showToast('📸 QR berhasil didownload!','success');
  }
}
function printQR(){
  const img=document.getElementById('qrImage');
  if(img?.src){
    document.getElementById('printQRImage').src=img.src;
    document.getElementById('printOrderId').textContent=document.getElementById('orderId')?.textContent||'';
    document.getElementById('printAmount').textContent=document.getElementById('modalAmount')?.textContent||'';
    document.getElementById('printDate').textContent=new Date().toLocaleString('id-ID');
    window.print();
    showToast('🖨️ Memulai print QR...','info');
  }
}
function copyOrderId(){
  const id=document.getElementById('orderId')?.textContent||'';
  try { navigator.clipboard?.writeText(id); } catch {}
  showToast('Order ID tersalin!','success');
}

// ===== expose ke window (dipakai script.js) =====
window.formatCurrency = formatCurrency;
window.formatDateTime = formatDateTime;
window.generateOrderId = generateOrderId;

window.showError = showError;
window.showToast = showToast;

window.openBottomSheet = openBottomSheet;
window.closeBottomSheet = closeBottomSheet;
window.setCreateQRLoading = setCreateQRLoading;

window.runProgressiveLoading = runProgressiveLoading;
window.clearAllIntervals = clearAllIntervals;

window.createRealQR = createRealQR;
window.checkRealPaymentStatus = checkRealPaymentStatus;

window.createConfetti = createConfetti;
window.autoSaveQRToGallery = autoSaveQRToGallery;
window.zoomQR = zoomQR;
window.closeQRZoom = closeQRZoom;
window.downloadQR = downloadQR;
window.printQR = printQR;
window.copyOrderId = copyOrderId;
