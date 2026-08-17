'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
export default function ProgressPage() {
  const [progress, setProgress] = useState([]);
  useEffect(() => { api.get('/progress').then(r => setProgress(r.data.data)).catch(console.error); }, []);
  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📊 My Progress</h1>
      {progress.length > 0 ? progress.map((p) => (
        <div key={p._id} className="card">
          <h3 className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{p.subject}</h3>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div className="text-center"><p className="text-2xl font-bold text-purple-600">{p.lessonsCompleted?.length || 0}</p><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Lessons</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-blue-600">{p.averageQuizScore || 0}%</p><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Avg Score</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-green-600">{p.doubtsAsked || 0}</p><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Doubts</p></div>
          </div>
          <div className="mt-3"><div className="w-full h-2 rounded-full" style={{ background: 'var(--gray-200)' }}><div className="h-2 rounded-full bg-purple-500" style={{ width: `${Math.min((p.lessonsCompleted?.length || 0) * 10, 100)}%` }}></div></div></div>
        </div>
      )) : <div className="card text-center py-10"><span className="text-4xl">📊</span><p className="mt-3" style={{ color: 'var(--text-secondary)' }}>Start learning to see your progress!</p></div>}
    </div>
  );
}
