'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { SUBJECTS } from '@/lib/constants';

function AskDoubtForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ question: '', subject: searchParams.get('subject') || 'mathematics', language: 'hi' });
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/doubts', { ...form, lessonId: searchParams.get('lessonId') });
      setAiResponse(res.data.data);
    } catch (err) { alert(err.response?.data?.message || 'Failed to submit doubt'); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>❓ Ask a Doubt</h1>
      {!aiResponse ? (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Subject</label>
            <select className="input-field mt-1" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Your Question</label>
            <textarea className="input-field mt-1 min-h-[120px]" placeholder="Type your doubt here..." value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required></textarea>
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Language</label>
            <select className="input-field mt-1" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
              <option value="en">English</option><option value="hi">हिंदी</option><option value="pa">ਪੰਜਾਬੀ</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? '🤖 AI is thinking...' : 'Submit Doubt (+20 XP)'}</button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="card border-l-4 border-l-purple-500">
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Your Question:</p>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>{aiResponse.question}</p>
          </div>
          {aiResponse.aiResponse?.answer && (
            <div className="card border-l-4 border-l-blue-500">
              <p className="font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>🤖 AI Response:</p>
              <p className="mt-2 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{aiResponse.aiResponse.answer}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => { setAiResponse(null); setForm({ ...form, question: '' }); }} className="btn-primary">Ask Another Doubt</button>
            <button onClick={() => router.push('/dashboard/student/doubts')} className="btn-secondary">View All Doubts</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AskDoubtPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto p-6 text-muted">Loading...</div>}>
      <AskDoubtForm />
    </Suspense>
  );
}
