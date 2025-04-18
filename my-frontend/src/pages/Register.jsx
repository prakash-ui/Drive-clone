import { useState } from 'react';

export default function Register() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.target);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        body: form,
        credentials: 'include',
      });

      if (res.ok) {
        alert('Registration successful!');
        window.location.href = '/login';
      } else {
        const data = await res.json();
        setError(data.message || 'Registration failed');
        e.target.reset(); // Reset form on error
      }
    } catch (err) {
      setError('Server error. Please check if the backend is running.');
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
        <h1 className="text-3xl font-bold text-white text-center mb-6">Register</h1>

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
            placeholder="Username"
            required
            minLength={3}
            className="w-full px-4 py-2 rounded-md bg-[#334155] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-2 rounded-md bg-[#334155] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            minLength={5}
            className="w-full px-4 py-2 rounded-md bg-[#334155] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition duration-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-sm text-center text-gray-400 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:underline font-medium">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}