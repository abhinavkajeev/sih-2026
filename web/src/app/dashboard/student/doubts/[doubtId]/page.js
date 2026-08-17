'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function DoubtDetailPage() {
  const { doubtId } = useParams();
  const [doubt, setDoubt] = useState(null);

  useEffect(() => {
    const fetch = async () => { try { const res = await api.get(`/doubts/${doubtId}`); setDoubt(res.data.data); } catch (err) { console.error(err); } };
    fetch();
  }, [doubtId]);

  if (!doubt) return <div className="animate-pulse"><div className="h-40 rounded-xl" style={{ background: 'var(--bg-secondary)' }}></div></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
      <Link href="/dashboard/student/doubts" className="text-sm text-purple-500 hover:underline">← Back to Doubts</Link>
      <div className="card"><p className="text-xs uppercase" style={{ color: 'var(--text-secondary)' }}>{doubt.subject} • {doubt.questionType}</p><h2 className="text-lg font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{doubt.question}</h2></div>
      {doubt.aiResponse?.answer && <div className="card border-l-4 border-l-blue-500"><p className="font-medium text-blue-600 text-sm">🤖 AI Answer</p><p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{doubt.aiResponse.answer}</p></div>}
      {doubt.teacherResponse?.answer && <div className="card border-l-4 border-l-green-500"><p className="font-medium text-green-600 text-sm">👩‍🏫 Teacher Answer</p><p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{doubt.teacherResponse.answer}</p></div>}
    </div>
  );
}
