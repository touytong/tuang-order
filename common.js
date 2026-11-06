// Shared helpers for both LIFF pages.
function $(id) { return document.getElementById(id); }

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function show(id) {
  document.querySelectorAll('.screen').forEach(function (el) { el.hidden = (el.id !== id); });
  window.scrollTo(0, 0);
}

function toast(msg) {
  var t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  setTimeout(function () { t.classList.remove('on'); }, 2600);
}

function fatal(msg) {
  $('errMsg').textContent = msg;
  show('sErr');
}

// Branch is fixed by the Rich Menu link of each branch's OA: https://liff.line.me/<id>?b=ARI
var BRANCH = '';
function readBranch() {
  var p = new URLSearchParams(location.search);
  var b = p.get('b');
  if (!b && p.get('liff.state')) {
    try { b = new URLSearchParams(p.get('liff.state').replace(/^\//, '').replace(/^\?/, '')).get('b'); } catch (e) { b = ''; }
  }
  return (b || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}
BRANCH = readBranch();

async function boot(liffId) {
  if (!BRANCH) BRANCH = readBranch();
  await liff.init({ liffId: liffId });
  if (!BRANCH) BRANCH = readBranch();
  if (!BRANCH) { fatal('เปิดหน้านี้จากเมนูของ LINE OA สาขาของคุณ (ไม่พบรหัสสาขา)'); return false; }
  if (!liff.isLoggedIn()) { liff.login(); return false; }
  return true;
}

// No Content-Type header on purpose: avoids a CORS preflight against Apps Script.
async function api(action, data) {
  var body = Object.assign({ action: action, idToken: liff.getIDToken(), branch: BRANCH }, data || {});
  var res = await fetch(CONFIG.API_URL, { method: 'POST', body: JSON.stringify(body) });
  var j = await res.json();
  if (!j.ok) throw new Error(j.error || 'เกิดข้อผิดพลาด');
  return j;
}

function closeOrBack() {
  if (liff.isInClient && liff.isInClient()) liff.closeWindow();
  else location.reload();
}

function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }

function fmtQty(q) { return String(Math.round(Number(q) * 100) / 100); }
