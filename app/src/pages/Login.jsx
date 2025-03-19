import React, { useState,useNavigate } from 'react';
import { useUserStore } from '../services/atom.js';
import { Route } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
  const { login } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login({ email, password });
      navigate("/homepage")
      alert('Login successful!');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-black to-blue-900 p-10 rounded-2xl shadow-2xl w-96">
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-400">Welcome Back!</h2>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-blue-300">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-blue-500 bg-black text-blue-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-600"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold mb-2 text-blue-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-blue-500 bg-black text-blue-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-600"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 font-semibold"
        >
          Log In
        </button>

        <p className="mt-6 text-center text-blue-400">
          Don't have an account? <a href="/signup" className="text-blue-500 hover:underline">Sign Up</a>
        </p>
      </form>
    </div>
  );
};

export default Login;