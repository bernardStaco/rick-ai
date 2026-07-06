// github-sync.js — Rick AI song sync via GitHub Contents API
"use strict";

const GH = {
  _stored() {
    try { return JSON.parse(localStorage.getItem('rickai_config') || 'null'); } catch(e) { return null; }
  },
  get cfg()    { const s = this._stored(); return s ? s.github : null; },
  get users()  { const s = this._stored(); return s ? s.users  : []; },
  get user()   { return sessionStorage.getItem('gh_user') || ''; },
  get isAuth() { return !!this.user; },

  login(name, pin) {
    if (!name) throw new Error('Please select your name');
    const u = this.users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (!u) throw new Error('User not found');
    if (String(u.pin) !== String(pin)) throw new Error('Wrong PIN');
    sessionStorage.setItem('gh_user', u.name);
    return u.name;
  },

  logout() { sessionStorage.removeItem('gh_user'); },

  _filename() {
    return 'songs-' + this.user.toLowerCase().replace(/\s+/g, '-') + '.json';
  },

  async _headers() {
    return {
      'Authorization': 'Bearer ' + this.cfg.token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  },

  async _getFile(path) {
    const c = this.cfg;
    const url = 'https://api.github.com/repos/' + c.owner + '/' + c.repo +
                '/contents/' + path + '?ref=' + (c.branch || 'main');
    const res = await fetch(url, { headers: await this._headers() });
    if (res.status === 404) return { content: null, sha: null };
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.message || 'GitHub error ' + res.status);
    }
    const data = await res.json();
    const decoded = JSON.parse(atob(data.content.replace(/\n/g, '')));
    return { content: decoded, sha: data.sha };
  },

  async _putFile(path, content, sha) {
    const c = this.cfg;
    const url = 'https://api.github.com/repos/' + c.owner + '/' + c.repo + '/contents/' + path;
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));
    const body = { message: 'Rick AI: update ' + path, content: encoded, branch: c.branch || 'main' };
    if (sha) body.sha = sha;
    const res = await fetch(url, {
      method: 'PUT',
      headers: Object.assign({}, await this._headers(), { 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.message || 'GitHub error ' + res.status);
    }
    return res.json();
  },

  async listSongs() {
    const r = await this._getFile(this._filename());
    return r.content || [];
  },

  async getSong(id) {
    const songs = await this.listSongs();
    const s = songs.find(function(s) { return s.id === id; });
    if (!s) throw new Error('Song not found');
    return s;
  },

  async saveSong(id, title, state) {
    const r = await this._getFile(this._filename());
    const list = r.content || [];
    const sha  = r.sha;
    const now  = new Date().toISOString();
    let finalId = id;
    if (id) {
      const idx = list.findIndex(function(s) { return s.id === id; });
      if (idx >= 0) {
        list[idx] = Object.assign({}, list[idx], { title: title, state: JSON.stringify(state), updated: now });
      } else {
        list.push({ id: id, title: title, state: JSON.stringify(state), created: now, updated: now });
      }
    } else {
      finalId = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).slice(2);
      list.push({ id: finalId, title: title, state: JSON.stringify(state), created: now, updated: now });
    }
    await this._putFile(this._filename(), list, sha);
    return { id: finalId, title: title };
  },

  async deleteSong(id) {
    const r = await this._getFile(this._filename());
    const list = (r.content || []).filter(function(s) { return s.id !== id; });
    await this._putFile(this._filename(), list, r.sha);
  },
};
