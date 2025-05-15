// @ts-check

/** @type {string} */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** @type {Object.<string, Function>} */
export const api = {
  async login(username, password) {
    try {
      console.log('Attempting login to:', `${API_URL}/api/users/login`); // Debug log
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      console.log('Login response status:', response.status); // Debug log
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.msg || error.message || 'Login failed');
      }
      
      const data = await response.json();
      console.log('Login successful:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Login error:', error); // Debug log
      throw error;
    }
  },

  async checkAuth() {
    try {
      console.log('Checking auth at:', `${API_URL}/api/users/check-auth`); // Debug log
      const response = await fetch(`${API_URL}/api/users/check-auth`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Auth check response status:', response.status); // Debug log
      
      if (!response.ok) {
        throw new Error('Authentication check failed');
      }
      
      const data = await response.json();
      console.log('Auth check response:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Auth check error:', error); // Debug log
      throw error;
    }
  }
};
