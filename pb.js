// pb.js — PocketBase client for Rick AI
// Configure your PocketBase URL via the ☁ button in the header.
"use strict";

const PB = {
  get url()       { return localStorage.getItem('pb_url')    || ''; },
  get token()     { return localStorage.getItem('pb_token')  || ''; },
  get userId()    { return localStorage.getItem('pb_userId') || ''; },
  get userEmail() { return localStorage.getItem('pb_email')  || ''; },
  get isAuth()    { return !!(this.url && this.token); },

  // ── HTTP helper ──────────────────────────────────────────────
  async req(method, path, body, token) {
    const t = token || this.token;
    const res = await fetch(this.url.replace(/\/$/, '') + path, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(t    ? { 'Authorization': t } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  },

  // ── AUTH ─────────────────────────────────────────────────────
  async login(url, email, password) {
    localStorage.setItem('pb_url', url.replace(/\/$/, ''));
    const d = await this.req('POST', '/api/collections/users/auth-with-password',
      { identity: email, password });
    localStorage.setItem('pb_token',  d.token);
    localStorage.setItem('pb_userId', d.record.id);
    localStorage.setItem('pb_email',  d.record.email);
    return d;
  },

  async register(url, email, password) {
    localStorage.setItem('pb_url', url.replace(/\/$/, ''));
    await this.req('POST', '/api/collections/users/records',
      { email, password, passwordConfirm: password, name: email.split('@')[0] });
    return this.login(url, email, password);
  },

  logout() {
    ['pb_token','pb_userId','pb_email'].forEach(k => localStorage.removeItem(k));
  },

  // ── SONGS ────────────────────────────────────────────────────
  async listSongs() {
    const d = await this.req('GET',
      `/api/collections/songs/records?sort=-updated&perPage=50&expand=shared_with`);
    return d.items || [];
  },

  async getSong(id) {
    return this.req('GET', `/api/collections/songs/records/${id}`);
  },

  async saveSong(id, title, state) {
    const body = { title, state: JSON.stringify(state), owner: this.userId };
    if (id) {
      return this.req('PATCH', `/api/collections/songs/records/${id}`, body);
    }
    return this.req('POST', '/api/collections/songs/records', body);
  },

  async deleteSong(id) {
    return this.req('DELETE', `/api/collections/songs/records/${id}`);
  },

  // ── SHARING ──────────────────────────────────────────────────
  async shareSong(songId, email, role) {
    // role: "viewer" | "editor"
    return this.req('POST', '/api/collections/song_shares/records',
      { song: songId, invitee_email: email, role, invited_by: this.userId });
  },

  async listShares(songId) {
    const d = await this.req('GET',
      `/api/collections/song_shares/records?filter=(song='${songId}')&perPage=50`);
    return d.items || [];
  },

  async removeShare(shareId) {
    return this.req('DELETE', `/api/collections/song_shares/records/${shareId}`);
  },
};
