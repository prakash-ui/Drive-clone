const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('Retrieved token from localStorage:', token);
  return token;
};

const setAuthToken = (token) => {
  if (token) {
    console.log('Setting token in localStorage:', token);
    localStorage.setItem('token', token);
  } else {
    console.log('Removing token from localStorage');
    localStorage.removeItem('token');
  }
};

const getDefaultOptions = () => {
  const options = {
    credentials: 'include', // Always include credentials
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  // Get token from localStorage
  const token = getAuthToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('Request options:', {
    ...options,
    headers: { ...options.headers }
  });
  
  return options;
};

export const api = {
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const options = {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      console.log('Uploading file:', file.name);
      const response = await fetch(`${API_URL}/api/files/upload`, options);
      
      console.log('Upload response:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      console.log('Upload successful:', data);
      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

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
      console.log('Login successful, response:', data);
      
      // Get token from response data
      if (data.token) {
        setAuthToken(data.token);
        console.log('Token saved from response data');
      } else {
        // Fallback to Authorization header
        const authHeader = response.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          setAuthToken(token);
          console.log('Token saved from Authorization header');
        } else {
          console.warn('No token found in response');
          throw new Error('No authentication token received');
        }
      }
      
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
      
      console.log('Auth check request:', {
        url: `${API_URL}/api/users/check-auth`,
        options: {
          ...options,
          headers: { ...options.headers }
        }
      });
      
      const response = await fetch(`${API_URL}/api/users/check-auth`, options);
      
      console.log('Auth check response:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        setAuthToken(null);
        throw new Error('Not authenticated');
      }

      const data = await response.json();
      console.log('Auth check data:', data);
      
      // Update token if a new one is provided
      const authHeader = response.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        setAuthToken(token);
        console.log('Token refreshed from server');
      }

      return data;
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthToken(null);
      throw error;
    }
  },
};
