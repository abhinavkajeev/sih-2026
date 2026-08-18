'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
export default function LeaderboardPage() {
  const [rankings, setRankings] = useState([]);
  const [tab, setTab] = useState('xp');
  useEffect(() => { api.get(`/gamification/leaderboard?sortBy=${tab}`).then(r => setRankings(r.data.data)).catch(console.error); }, [tab]);
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">🏆 Hall of Fame</h1>
        <p className="text-indigo-200 text-sm mt-1">Healthy competition. Celebrate growth.</p>
      </div>
      <div className="flex gap-2">
        {[
          { id: 'xp', label: 'Overall XP 🌟' },
          { id: 'streak', label: 'Longest Streaks 🔥' },
          { id: 'most_improved', label: 'Most Improved 📈' }
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tab === t.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t.label}</button>
        ))}
      </div>
      <div className="card space-y-2 border-0 shadow-sm">
        {rankings.map((r, i) => (
          <div key={r.user?._id || i} className={`flex items-center justify-between p-3 rounded-xl transition-all hover:scale-[1.01] ${i < 3 ? 'bg-gradient-to-r from-amber-50 to-yellow-100 border border-yellow-200' : 'bg-slate-50 border border-slate-100'}`}>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold w-8 text-center text-slate-400">{i < 3 ? medals[i] : `#${r.rank}`}</span>
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">{r.user?.name?.[0]?.toUpperCase() || '?'}</div>
              <div>
                <p className="font-bold text-slate-800">{r.user?.name || 'Unknown'}</p>
                <p className="text-xs font-medium text-slate-500">Level {r.level} • {r.levelName}</p>
              </div>
            </div>
            <div className="text-right">
              {tab === 'xp' && <p className="font-bold text-indigo-600 text-lg">{r.xp} <span className="text-xs">XP</span></p>}
              {tab === 'streak' && <p className="font-bold text-orange-500 text-lg">{r.streak} <span className="text-xs">Days</span></p>}
              {tab === 'most_improved' && <p className="font-bold text-green-600 text-lg">+{r.improvementScore || r.xp} <span className="text-xs">Pts</span></p>}
              {tab === 'xp' && r.streak > 0 && <p className="text-xs font-bold text-orange-500">🔥 {r.streak} day streak</p>}
            </div>
          </div>
        ))}
        {rankings.length === 0 && <p className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>No rankings yet</p>}
      </div>
    </div>
  );
}
