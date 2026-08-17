'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { SUBJECTS } from '@/lib/constants';

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [subject, setSubject] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLessons(); }, [subject]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (search) params.append('search', search);
      const res = await api.get(`/lessons?${params}`);
      setLessons(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📚 Lessons</h1>
      </div>
      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search lessons..." className="input-field max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchLessons()} />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSubject('')} className={`px-3 py-1.5 rounded-full text-sm ${!subject ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>All</button>
          {SUBJECTS.map((s) => (
            <button key={s.id} onClick={() => setSubject(s.id)} className={`px-3 py-1.5 rounded-full text-sm ${subject === s.id ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="card h-40 animate-pulse" style={{ background: 'var(--bg-secondary)' }}></div>)}</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {lessons.map((lesson) => (
            <Link key={lesson._id} href={`/dashboard/student/lessons/${lesson._id}`} className="card group">
              <div className="w-full h-32 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-4xl mb-3">📖</div>
              <h3 className="font-semibold truncate group-hover:text-purple-600 transition-colors" style={{ color: 'var(--text-primary)' }}>{lesson.title}</h3>
              <p className="text-xs mt-1 capitalize" style={{ color: 'var(--text-secondary)' }}>{lesson.subject} • Class {lesson.grade} • {lesson.difficulty}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-purple-500 font-medium">+{lesson.xpReward} XP</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{lesson.viewCount} views</span>
              </div>
            </Link>
          ))}
          {lessons.length === 0 && <p className="col-span-3 text-center py-10" style={{ color: 'var(--text-secondary)' }}>No lessons found</p>}
        </div>
      )}
    </div>
  );
}
