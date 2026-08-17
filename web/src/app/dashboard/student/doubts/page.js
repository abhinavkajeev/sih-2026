'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function DoubtsPage() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        const res = await api.get('/doubts/my-doubts');
        setDoubts(res.data.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchDoubts();
  }, []);

  const statusColor = { pending: 'bg-yellow-100 text-yellow-700', ai_answered: 'bg-blue-100 text-blue-700', teacher_answered: 'bg-green-100 text-green-700', resolved: 'bg-emerald-100 text-emerald-700' };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>❓ My Doubts</h1>
        <Link href="/dashboard/student/doubts/ask" className="btn-primary">+ Ask New Doubt</Link>
      </div>
      <div className="space-y-3">
        {doubts.map((doubt) => (
          <Link key={doubt._id} href={`/dashboard/student/doubts/${doubt._id}`} className="card block">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{doubt.question}</p>
                <p className="text-xs mt-1 capitalize" style={{ color: 'var(--text-secondary)' }}>{doubt.subject} • {doubt.questionType} • {new Date(doubt.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ml-3 ${statusColor[doubt.status] || ''}`}>{doubt.status?.replace('_', ' ')}</span>
            </div>
            {doubt.aiResponse?.answer && <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>🤖 {doubt.aiResponse.answer}</p>}
          </Link>
        ))}
        {!loading && doubts.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">💡</span>
            <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>No doubts yet. Ask your first doubt!</p>
            <Link href="/dashboard/student/doubts/ask" className="btn-primary mt-4 inline-block">Ask a Doubt</Link>
          </div>
        )}
      </div>
    </div>
  );
}
