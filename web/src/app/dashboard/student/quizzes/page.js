'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  useEffect(() => { api.get('/quizzes').then(res => setQuizzes(res.data.data)).catch(console.error); }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📝 Quizzes</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {quizzes.map((quiz) => (
          <Link key={quiz._id} href={`/dashboard/student/quizzes/${quiz._id}`} className="card group">
            <div className="flex items-center gap-2 mb-2">
              {quiz.isAIGenerated && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">🤖 AI</span>}
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full capitalize">{quiz.subject}</span>
            </div>
            <h3 className="font-semibold group-hover:text-purple-600 transition-colors" style={{ color: 'var(--text-primary)' }}>{quiz.title}</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{quiz.questions?.length || 0} questions • {quiz.duration} min</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-purple-500 font-medium">+{quiz.xpReward} XP</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Class {quiz.grade}</span>
            </div>
          </Link>
        ))}
        {quizzes.length === 0 && <p className="col-span-3 text-center py-10" style={{ color: 'var(--text-secondary)' }}>No quizzes available yet</p>}
      </div>
    </div>
  );
}
