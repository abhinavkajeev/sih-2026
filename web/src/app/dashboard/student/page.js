'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/lib/api';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ xp: 0, level: 1, levelName: 'Beginner', streak: { current: 0 }, coins: 0, xpProgress: 0, activeMissions: [], gradeCategory: 'middle', stream: null });
  const [challenges, setChallenges] = useState([]);
  const [dailyDiscovery, setDailyDiscovery] = useState(null);
  const [recentLessons, setRecentLessons] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [gamRes, challengeRes, lessonRes, discoveryRes] = await Promise.allSettled([
        api.get('/gamification/profile'),
        api.get('/gamification/challenges'),
        api.get('/lessons?limit=4'),
        api.get('/gamification/daily-discovery')
      ]);
      if (gamRes.status === 'fulfilled') setStats(gamRes.value.data.data);
      if (challengeRes.status === 'fulfilled') setChallenges(challengeRes.value.data.data);
      if (lessonRes.status === 'fulfilled') setRecentLessons(lessonRes.value.data.data);
      if (discoveryRes.status === 'fulfilled') setDailyDiscovery(discoveryRes.value.data.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  };

  // Grade-adaptive UI configurations
  const isPrimary = stats.gradeCategory === 'primary';
  const isSenior = stats.gradeCategory === 'senior';
  const isCS = stats.stream === 'Computer Science';
  
  const bannerBg = isPrimary ? 'from-pink-500 to-orange-400' : isSenior ? (isCS ? 'from-emerald-700 to-teal-900' : 'from-slate-800 to-slate-900') : 'from-purple-600 to-indigo-600';
  const bannerIcon = isPrimary ? '🦄' : isSenior ? (isCS ? '💻' : '⚡') : '🌍';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className={`rounded-2xl p-6 bg-gradient-to-r ${bannerBg} text-white relative overflow-hidden shadow-lg`}>
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">Good evening, {user?.name || 'Student'}!</p>
          <h1 className="text-3xl font-extrabold mt-1">
            {isPrimary ? `⭐ ${stats.streak?.current || 0} Days of Fun!` : `🔥 ${stats.streak?.current || 0}-Day Knowledge Streak`}
          </h1>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">
                {isPrimary ? '✨ Explorer Level' : `⭐ Level ${stats.level} — ${stats.levelName}`}
              </span>
              {!isPrimary && <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-md">{stats.xp} XP</span>}
            </div>
            <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
              <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${stats.xpProgress || 0}%` }}></div>
            </div>
          </div>
        </div>
        <div className="absolute right-2 -top-4 text-9xl opacity-10">{bannerIcon}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '🔥', label: t('streak'), value: `${stats.streak?.current || 0} days` },
          { icon: '💰', label: t('coins'), value: stats.coins || 0 },
          { icon: '📈', label: 'Improvement', value: `+${stats.improvementScore || 0}` },
          { icon: '🏆', label: 'Badges', value: stats.badges?.length || 0 },
        ].map((stat) => (
          <div key={stat.label} className="card text-center hover:-translate-y-1 transition-transform border border-slate-100 shadow-sm">
            <span className="text-3xl">{stat.icon}</span>
            <p className="text-xl font-bold mt-2 text-slate-800">{stat.value}</p>
            <p className="text-xs mt-1 text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Active AI Missions */}
        <div className="card border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">🎯 Today&apos;s Missions</h2>
          </div>
          <div className="space-y-3">
            {stats.activeMissions && stats.activeMissions.length > 0 ? (
              stats.activeMissions.map((mission, i) => (
                <div key={i} className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-orange-900 text-sm">{mission.title}</p>
                      <p className="text-xs text-orange-700 mt-1">{mission.description}</p>
                    </div>
                    <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded-md">+{mission.xpReward} XP</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-orange-200 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: `${(mission.progress / mission.target) * 100}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-orange-800">{mission.progress} / {mission.target}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                <p className="text-sm text-slate-500">You&apos;re all caught up! Keep exploring.</p>
              </div>
            )}
          </div>
        </div>

        {/* Daily Discovery */}
        {dailyDiscovery && (
          <div className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
            <div className="absolute right-0 top-0 text-7xl opacity-10 group-hover:scale-110 transition-transform duration-500">🌌</div>
            <h2 className="text-sm font-bold text-blue-300 mb-1">{dailyDiscovery.title}</h2>
            <p className="text-lg font-bold mb-3">{dailyDiscovery.description}</p>
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm mb-4">
              <p className="text-xs text-slate-300 mb-2 font-medium">Quick Question (Read time: {dailyDiscovery.readTime})</p>
              <p className="text-sm font-semibold text-white">{dailyDiscovery.question}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-400">Unlock: {dailyDiscovery.reward}</span>
              <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
                Discover (+{dailyDiscovery.xpReward} XP)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/dashboard/student/doubts/ask', icon: '❓', label: 'Ask AI', desc: 'Got a doubt?', color: 'bg-purple-50 hover:bg-purple-100 text-purple-900' },
          { href: '/dashboard/student/lessons', icon: '🌍', label: 'Explore', desc: 'Knowledge World', color: 'bg-blue-50 hover:bg-blue-100 text-blue-900' },
          { href: '/dashboard/student/quizzes', icon: '⚡', label: 'Play', desc: 'Mini-games', color: 'bg-green-50 hover:bg-green-100 text-green-900' },
          { href: '/dashboard/student/leaderboard', icon: '🏆', label: 'Compete', desc: 'Leaderboard', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-900' },
        ].map((action) => (
          <Link key={action.label} href={action.href} className={`${action.color} rounded-2xl p-4 text-center transition-all hover:shadow-md border border-black/5`}>
            <span className="text-4xl block mb-2">{action.icon}</span>
            <p className="text-sm font-bold">{action.label}</p>
            <p className="text-xs opacity-70 mt-1 font-medium">{action.desc}</p>
          </Link>
        ))}
      </div>
      <div className="pb-8"></div>
    </div>
  );
}
