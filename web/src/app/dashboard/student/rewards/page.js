'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [coins, setCoins] = useState(0);
  useEffect(() => {
    api.get('/gamification/rewards').then(r => setRewards(r.data.data)).catch(console.error);
    api.get('/gamification/profile').then(r => setCoins(r.data.data.coins)).catch(console.error);
  }, []);
  const handleRedeem = async (id) => { try { const res = await api.post(`/gamification/rewards/${id}/redeem`); setCoins(res.data.remainingCoins); alert('Reward redeemed! 🎉'); } catch (err) { alert(err.response?.data?.message || 'Failed'); } };
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🎁 Rewards Store</h1>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100"><span className="text-lg">💰</span><span className="font-bold text-yellow-700">{coins} coins</span></div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {rewards.map((r) => (
          <div key={r._id} className="card text-center">
            <span className="text-4xl">{r.type === 'virtual' ? '🎨' : '📦'}</span>
            <h3 className="font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>{r.name}</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{r.description}</p>
            <p className="text-lg font-bold text-yellow-600 mt-2">💰 {r.coinCost}</p>
            <button onClick={() => handleRedeem(r._id)} className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium w-full ${coins >= r.coinCost ? 'btn-primary' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`} disabled={coins < r.coinCost}>{coins >= r.coinCost ? 'Redeem' : 'Not enough coins'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
