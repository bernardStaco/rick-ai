// github-sync.js — Rick AI song sync via GitHub Contents API
// Each user's songs are stored as songs-{username}.json in the repo root.
"use strict";

const GH = {
  get cfg()    { return (typeof RICKAI_CONFIG !== 'undefined') ? RICKAI_CONFIG.github : null; },
  get users()  { return (typeof RICKAI_CONFIG !== 'undefined') ? RICKAI_CONFIG.users  : []; },
  get user()   { return sessionStorage.getItem('gh_user') || ''; },
  get isAuth() { return !!this.user; },

  // ── AUTH ─────────────────────────────────────────────────────
  login(name, pin) {
    if (!name) throw new Error('Please select your name');
    const u = this.users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (!u) throw new Error('User not found');
    if (String(u.pin) !== String(pin)) throw new Error('Wrong PIN');
    sessionStorage.setItem('gh_user', u.name);
    return u.name;
  },

  logout() {
    sessionStorage.removeItem('gh_user');
  },

  // ── INTERNAL ─────────────────────────────────────────────────
  _filename() {
    return `songs-${this.user.toLowerCase().replace(/\s+/g,'-')}.json`;
  },

  async _headers() {
    return {
      'Authorization': `Bearer ${this.cfg.token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  },

  async _getFile(path) {
    const { owner, repo, branch } = this.cfg;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch || 'main'}`;
    const res = await fetch(url, { headers: await this._headers() });
    if (res.status === 404) return { content: null, sha: null };
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.message || `GitHub error ${res.status}`);
    }
    const data = await res.json();
    // GitHub returns base64-encoded content with newlines
    const decoded = JSON.parse(atob(data.content.replace(/\n/g, '')));
    return { content: decoded, sha: data.sha };
  },

  async _putFile(path, content, sha) {
    const { owner, repo, branch } = this.cfg;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const body = {
      message: `Rick AI: update ${path}`,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
      branch: branch || 'main',
      ...(sha ? { sha } : {}),
    };
    const res = await fetch(url, {
      method: 'PUT',
      headers: { ...(await this._headers()), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.message || `GitHub error ${res.status}`);
    }
    return res.json();
  },

  // ── SONGS API ────────────────────────────────────────────────
  async listSongs() {
    const { content } = await this._getFile(this._filename());
    return content || [];
  },

  async getSong(id) {
    const songs = await this.listSongs();
    const s = songs.find(s => s.id === id);
    if (!s) throw new Error('Song not found');
    return s;
  },

  async saveSong(id, title, state) {
    const { content: songs, sha } = await this._getFile(this._filename());
    const list = songs || [];
    const now  = new Date().toISOString();
    let finalId = id;

    if (id) {
      const idx = list.findIndex(s => s.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], title, state: JSON.stringify(state), updated: now };
      } else {
        list.push({ id, title, state: JSON.stringify(state), created: now, updated: now });
      }
    } else {
      finalId = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).slice(2);
      list.push({ id: finalId, title, state: JSON.stringify(state), created: now, updated: now });
    }

    await this._putFile(this._filename(), list, sha);
    return { id: finalId, title };
  },

  async deleteSong(id) {
    const { content: songs, sha } = await this._getFile(this._filename());
    const list = (songs || []).filter(s => s.id !== id);
    await this._putFile(this._filename(), list, sha);
  },
};
