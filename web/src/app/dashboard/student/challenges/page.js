'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  useEffect(() => { api.get('/gamification/challenges').then(r => setChallenges(r.data.data)).catch(console.error); }, []);
  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🎯 Daily Challenges</h1>
      <div className="space-y-3">
        {challenges.map((c) => (
          <div key={c._id} className={`card flex items-center justify-between ${c.isCompleted ? 'opacity-60' : ''} ${c.isWeeklyBoss ? 'border-2 border-yellow-400' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{c.isWeeklyBoss ? '👑' : c.difficulty === 'hard' ? '💎' : c.difficulty === 'medium' ? '⭐' : '✨'}</span>
              <div><h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title} {c.isWeeklyBoss && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full ml-2">BOSS</span>}</h3><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.description}</p></div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-purple-600">+{c.xpReward} XP</p>
              <p className="text-xs text-yellow-600">+{c.coinReward} 💰</p>
              {c.isCompleted && <span className="text-green-500 text-xs">✅ Done</span>}
            </div>
          </div>
        ))}
        {challenges.length === 0 && <div className="card text-center py-10"><span className="text-4xl">🎯</span><p className="mt-3" style={{ color: 'var(--text-secondary)' }}>New challenges coming tomorrow!</p></div>}
      </div>
    </div>
  );
}
