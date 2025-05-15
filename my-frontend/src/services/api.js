const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  async login(username, password) {
    const response = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.msg || error.message || 'Login failed');
    }
    
    return response.json();
  },

  async checkAuth() {
    const response = await fetch(`${API_URL}/api/users/check-auth`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Not authenticated');
    }
    
    return response.json();
  }
};
