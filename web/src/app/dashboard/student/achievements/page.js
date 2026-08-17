'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
export default function AchievementsPage() {
  const [badges, setBadges] = useState([]);
  useEffect(() => { api.get('/gamification/badges').then(r => setBadges(r.data.data)).catch(console.error); }, []);
  const rarityStyle = { common: 'border-gray-400', rare: 'border-blue-500 shadow-blue-200', epic: 'border-purple-500 shadow-purple-200', legendary: 'border-yellow-400 shadow-yellow-200' };
  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🏅 Achievements</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div key={badge._id} className={`card text-center ${badge.isEarned ? '' : 'opacity-40 grayscale'} border-2 ${rarityStyle[badge.rarity] || ''}`}>
            <span className="text-4xl">{badge.icon}</span>
            <h3 className="font-semibold text-sm mt-2" style={{ color: 'var(--text-primary)' }}>{badge.name}</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{badge.description}</p>
            <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full capitalize ${badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' : badge.rarity === 'epic' ? 'bg-purple-100 text-purple-700' : badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{badge.rarity}</span>
          </div>
        ))}
        {badges.length === 0 && <p className="col-span-4 text-center py-10" style={{ color: 'var(--text-secondary)' }}>Loading badges...</p>}
      </div>
    </div>
  );
}
