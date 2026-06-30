/* ─────────────────────────────────────────────
   api.js  —  shared API client for all pages
   Sets APP_URL once; all pages import this file
───────────────────────────────────────────── */

const APP_URL = 'https://script.google.com/macros/s/AKfycbzIB12QjD_5lRsm3nlDHOE429T1ftr52JIy0wwARyLpw_MZ2rdnCeFz2MXICARXZZpm9A/exec';
// Replace YOUR_DEPLOYMENT_ID with your actual Apps Script deployment ID

const SESSION_KEY = 'gfhd_session';

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch(e) { return null; }
}
function setSession(data) { localStorage.setItem(SESSION_KEY, JSON.stringify(data)); }
function clearSession()   { localStorage.removeItem(SESSION_KEY); }

function getToken() {
  const s = getSession();
  return s ? s.token : null;
}

async function api(action, payload = {}) {
  const token = getToken();
  const body  = { action, ...payload };
  if (token) body.token = token;

  const res = await fetch(APP_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'text/plain' }, // avoids CORS preflight
    body:    JSON.stringify(body)
  });

  if (!res.ok) throw new Error('Network error: ' + res.status);
  const data = await res.json();

  if (data.code === 401) {
    clearSession();
    window.location.href = 'login.html?reason=expired';
    return;
  }
  return data;
}

function requireAuth() {
  const s = getSession();
  if (!s || !s.token) {
    window.location.href = 'login.html';
    return null;
  }
  if (s.expires && new Date(s.expires) < new Date()) {
    clearSession();
    window.location.href = 'login.html?reason=expired';
    return null;
  }
  return s;
}
