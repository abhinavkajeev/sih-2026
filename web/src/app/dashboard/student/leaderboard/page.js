'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
export default function LeaderboardPage() {
  const [rankings, setRankings] = useState([]);
  const [tab, setTab] = useState('school');
  useEffect(() => { api.get(`/gamification/leaderboard?type=${tab}`).then(r => setRankings(r.data.data)).catch(console.error); }, [tab]);
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🏆 Leaderboard</h1>
      <div className="flex gap-2">
        {['class', 'school', 'district'].map((t) => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-sm capitalize ${tab === t ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>{t}</button>)}
      </div>
      <div className="card space-y-2">
        {rankings.map((r, i) => (
          <div key={r.user?._id || i} className={`flex items-center justify-between p-3 rounded-xl ${i < 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50' : ''}`} style={{ background: i >= 3 ? 'var(--bg-secondary)' : undefined }}>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold w-8 text-center">{i < 3 ? medals[i] : `#${r.rank}`}</span>
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">{r.user?.name?.[0]?.toUpperCase() || '?'}</div>
              <div><p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{r.user?.name || 'Unknown'}</p><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Level {r.level} • {r.levelName}</p></div>
            </div>
            <div className="text-right"><p className="font-bold text-purple-600">{r.xp} XP</p>{r.streak > 0 && <p className="text-xs text-orange-500">🔥 {r.streak}</p>}</div>
          </div>
        ))}
        {rankings.length === 0 && <p className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>No rankings yet</p>}
      </div>
    </div>
  );
}
