const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthToken = () => localStorage.getItem('token');

const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const getDefaultOptions = () => {
  const token = getAuthToken();
  return {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
};

export const api = {
  async login(username, password) {
    try {
      console.log('Attempting login to:', `${API_URL}/api/users/login`);
      const options = {
        ...getDefaultOptions(),
        method: 'POST',
        body: JSON.stringify({ username, password })
      };
      const response = await fetch(`${API_URL}/api/users/login`, options);
      
      console.log('Login response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.msg || error.message || 'Login failed');
      }
      
      const data = await response.json();
      const authHeader = response.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        setAuthToken(token);
        console.log('Token saved to localStorage');
      }
      console.log('Login successful');
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async checkAuth() {
    try {
      const token = getAuthToken();
      console.log('Current token:', token);
      console.log('Checking auth at:', `${API_URL}/api/users/check-auth`);
      
      const options = {
        ...getDefaultOptions(),
        method: 'GET'
      };
      
      console.log('Request options:', {
        ...options,
        headers: Object.fromEntries(Object.entries(options.headers))
      });
      
      const response = await fetch(`${API_URL}/api/users/check-auth`, options);
      
      console.log('Auth check response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      if (!response.ok) {
        setAuthToken(null);
        throw new Error('Not authenticated');
      }

      const data = await response.json();
      
      // Update token if a new one is provided
      const authHeader = response.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        setAuthToken(token);
        console.log('Token updated in localStorage');
      }

      return data;
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthToken(null);
      throw error;
    }
  }
};
