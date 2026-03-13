/**
 * cloud-sync.js — Arx Sapientiae
 * Reemplaza localStorage con Redis via /api/sync
 * Uso: await CloudStorage.get('key') / await CloudStorage.set('key', value)
 */

const CloudStorage = {
  BASE: '/api/sync',
  _cache: {},

  async get(key) {
    try {
      const res = await fetch(`${this.BASE}?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (data.value !== null && data.value !== undefined) {
        this._cache[key] = data.value;
        return data.value;
      }
      // Fallback to localStorage if cloud empty
      const local = localStorage.getItem(key);
      return local ? JSON.parse(local) : null;
    } catch (e) {
      console.warn('CloudStorage.get failed, using localStorage', e);
      const local = localStorage.getItem(key);
      return local ? JSON.parse(local) : null;
    }
  },

  async set(key, value) {
    // Always save to localStorage as backup
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
    // Save to cloud
    try {
      await fetch(`${this.BASE}?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });
      this._cache[key] = value;
    } catch (e) {
      console.warn('CloudStorage.set failed, saved to localStorage only', e);
    }
  }
};
