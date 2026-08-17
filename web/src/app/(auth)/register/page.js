'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'student', grade: '6', language: 'hi' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.data, res.data.token);
      window.location.href = `/dashboard/${res.data.data.role}`;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="glass rounded-2xl p-8 text-white animate-scaleIn">
      <div className="text-center mb-6">
        <span className="text-4xl">🎓</span>
        <h1 className="text-2xl font-bold mt-3">Join Vidya Setu</h1>
      </div>
      {error && <div className="bg-red-500/20 text-red-300 text-sm p-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="Full Name" className="input-field bg-white/10 border-white/20 text-white placeholder:text-gray-400" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="tel" placeholder="Phone Number" className="input-field bg-white/10 border-white/20 text-white placeholder:text-gray-400" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input type="password" placeholder="Password (min 6 chars)" className="input-field bg-white/10 border-white/20 text-white placeholder:text-gray-400" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select className="input-field bg-white/10 border-white/20 text-white" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
        </select>
        {form.role === 'student' && (
          <select className="input-field bg-white/10 border-white/20 text-white" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
            {Array.from({length: 12}, (_, i) => <option key={i+1} value={String(i+1)}>Class {i+1}</option>)}
          </select>
        )}
        <select className="input-field bg-white/10 border-white/20 text-white" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="pa">ਪੰਜਾਬੀ</option>
        </select>
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-4">Already have an account? <Link href="/login" className="text-purple-400 hover:underline">Login</Link></p>
    </div>
  );
}
