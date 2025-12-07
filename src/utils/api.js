// API Client for NamVung CashBack
const API_BASE = '/api';

export const api = {
  // Auth endpoints
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      return response.json();
    },

    register: async (userData) => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      return response.json();
    },

    logout: async () => {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      return response.json();
    },

    getMe: async () => {
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include'
      });
      return response.json();
    }
  },

  // Stores endpoints
  stores: {
    getAll: async () => {
      const response = await fetch(`${API_BASE}/stores`);
      return response.json();
    },

    getBySlug: async (slug) => {
      const response = await fetch(`${API_BASE}/stores/${slug}`);
      return response.json();
    }
  }
};