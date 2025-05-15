const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const defaultOptions = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'https://simpledrivee.netlify.app'
  },
  mode: 'cors'
};

/** @type {Object.<string, Function>} */
export const api = {
  async login(username, password) {
    try {
      console.log('Attempting login to:', `${API_URL}/api/users/login`);
      const options = {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify({ username, password })
      };
      const response = await fetch(`${API_URL}/api/users/login`, options);
      
      console.log('Login response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        cookies: document.cookie
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.msg || error.message || 'Login failed');
      }
      
      const data = await response.json();
      console.log('Login successful:', data);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async checkAuth() {
    try {
      console.log('Checking auth at:', `${API_URL}/api/users/check-auth`);
      console.log('Current cookies:', document.cookie);
      
      const options = {
        ...defaultOptions,
        method: 'GET'
      };
      const response = await fetch(`${API_URL}/api/users/check-auth`, options);
      
      console.log('Auth check response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        cookies: document.cookie
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Authentication check failed');
      }
      
      const data = await response.json();
      console.log('Auth check successful:', data);
      return data;
    } catch (error) {
      console.error('Auth check error:', error);
      throw error;
    }
  }
};
