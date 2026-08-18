'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
export default function AchievementsPage() {
  const [badges, setBadges] = useState([]);
  useEffect(() => { api.get('/gamification/badges').then(r => setBadges(r.data.data)).catch(console.error); }, []);
  const rarityStyle = { common: 'border-slate-200', uncommon: 'border-green-400', rare: 'border-blue-500 shadow-blue-200', epic: 'border-purple-500 shadow-purple-200', legendary: 'border-yellow-400 shadow-yellow-200' };

  // Group by category
  const categories = ['learning', 'streak', 'improvement', 'mastery', 'social', 'special'];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-2xl text-white shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">🏅 Trophy Room</h1>
        <p className="text-amber-100 text-sm mt-1">Unlock badges by learning, improving, and helping others.</p>
      </div>

      {categories.map(category => {
        const catBadges = badges.filter(b => b.category === category);
        if (catBadges.length === 0) return null;
        
        return (
          <div key={category} className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
              {category === 'learning' ? '📚' : category === 'streak' ? '🔥' : category === 'improvement' ? '📈' : category === 'mastery' ? '💪' : category === 'social' ? '💬' : '👑'} {category} Badges
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {catBadges.map((badge) => (
                <div key={badge._id} className={`bg-white rounded-xl p-4 text-center border-2 transition-all hover:-translate-y-1 ${badge.isEarned ? rarityStyle[badge.rarity] || 'border-slate-200 shadow-sm' : 'border-dashed border-slate-300 bg-slate-50 opacity-60'}`}>
                  {badge.isEarned ? (
                    <>
                      <span className="text-5xl block mb-2">{badge.icon}</span>
                      <h3 className="font-bold text-sm text-slate-800">{badge.name}</h3>
                      <p className="text-xs mt-1 text-slate-500 font-medium">{badge.description}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-md uppercase ${badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' : badge.rarity === 'epic' ? 'bg-purple-100 text-purple-700' : badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' : badge.rarity === 'uncommon' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{badge.rarity}</span>
                        <span className="text-xs font-bold text-purple-600">+{badge.xpBonus} XP</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto bg-slate-200 rounded-full flex items-center justify-center mb-2">
                        <span className="text-3xl grayscale opacity-30">❓</span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-600">Mystery Badge</h3>
                      <p className="text-xs mt-1 text-slate-400 font-medium">Hint: {badge.description}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {badges.length === 0 && <p className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>Loading badges...</p>}
    </div>
  );
}
