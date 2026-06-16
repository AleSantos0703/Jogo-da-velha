const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:3000/api';

// Simple token storage wrapper
const TOKEN_KEY = 'tictactoe_token';
export const tokenStorage = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (token) => {
    try { localStorage.setItem(TOKEN_KEY, token); } catch {}
  },
  clear: () => {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
  }
};

async function apiFetch(path: string, options: any = {}) {
  const url = `${API_BASE}${path}`;
  const token = tokenStorage.get();
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;
  const body = options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body;
  const res = await fetch(url, Object.assign({}, options, { headers, body }));
  if (!res.ok) {
    let errBody = null;
    try { errBody = await res.json(); } catch (e) { errBody = await res.text().catch(()=>null); }
    throw errBody || new Error(res.statusText);
  }
  try { return await res.json(); } catch (e) { return null; }
}

export type Player = { id: string; email: string; iat?: number; exp?: number };

export const auth = {
  register: async (payload: { email: string; password: string }) => {
    return apiFetch('/auth/register', { method: 'POST', body: payload });
  },
  login: async (payload: { email: string; password: string }) => {
    const res = await apiFetch('/auth/login', { method: 'POST', body: payload });
    if (res && res.token) tokenStorage.set(res.token);
    return res;
  },
  logout: async () => {
    // If backend supports logout endpoint, call it; otherwise just clear token
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
    tokenStorage.clear();
  },
  me: async () => {
    return apiFetch('/auth/profile', { method: 'GET' });
  }
};

export default { auth, tokenStorage };
