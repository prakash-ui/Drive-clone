import { useState } from 'react';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL ||'http://localhost:3000';

  const handleSubmit = async (e) => {
    console.log('API URL:', API_URL);
    e.preventDefault();
    setError('');
    setLoading(true);
  
    const loginData = {
      username: e.target.username.value,
      password: e.target.password.value
    };
  
    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
        credentials: 'include'
      });
  
      const data = await res.json();
  
      if (res.ok) {
         await new Promise(resolve => setTimeout(resolve, 500));
        window.location.href = '/';
      } else {
        // Match your backend's error response format
        setError(data.errors?.[0]?.msg || data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0f172a] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#1e293b] p-8 rounded-2xl shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-white text-center mb-6">Login</h1>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-sm text-center shadow">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Username
          </label>
          <input
            name="username"
            type="text"
            required
            className="w-full px-4 py-2 rounded-md bg-[#334155] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter username"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            className="w-full px-4 py-2 rounded-md bg-[#334155] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition duration-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-sm text-center text-gray-400 mt-4">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-500 hover:underline font-medium">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}