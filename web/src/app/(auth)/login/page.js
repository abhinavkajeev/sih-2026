'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function LoginPage() {
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.data, res.data.token);
      window.location.href = `/dashboard/${res.data.data.role}`;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="glass rounded-2xl p-8 text-white animate-scaleIn">
      <div className="text-center mb-8">
        <span className="text-4xl">📚</span>
        <h1 className="text-2xl font-bold mt-3">Welcome Back</h1>
        <p className="text-gray-400 text-sm mt-1">Login to Vidya Setu</p>
      </div>
      {error && <div className="bg-red-500/20 text-red-300 text-sm p-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="tel" placeholder="Phone Number" className="input-field bg-white/10 border-white/20 text-white placeholder:text-gray-400" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input type="password" placeholder="Password" className="input-field bg-white/10 border-white/20 text-white placeholder:text-gray-400" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-6">Don&apos;t have an account? <Link href="/register" className="text-purple-400 hover:underline">Register</Link></p>
    </div>
  );
}
