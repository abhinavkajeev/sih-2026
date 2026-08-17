'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/lib/api';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ xp: 0, level: 1, levelName: 'Beginner', streak: 0, coins: 0, xpProgress: 0, lessonsCompleted: 0, quizzesAttempted: 0, doubtsAsked: 0 });
  const [challenges, setChallenges] = useState([]);
  const [recentLessons, setRecentLessons] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [gamRes, challengeRes, lessonRes] = await Promise.allSettled([
        api.get('/gamification/profile'),
        api.get('/gamification/challenges'),
        api.get('/lessons?limit=4'),
      ]);
      if (gamRes.status === 'fulfilled') setStats(gamRes.value.data.data);
      if (challengeRes.status === 'fulfilled') setChallenges(challengeRes.value.data.data);
      if (lessonRes.status === 'fulfilled') setRecentLessons(lessonRes.value.data.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-purple-200 text-sm">{t('welcome')} 👋</p>
          <h1 className="text-2xl font-bold mt-1">{user?.name || 'Student'}</h1>
          <p className="text-purple-100 text-sm mt-1">Keep going! You&apos;re doing great today 🔥</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-7xl opacity-20">🎓</div>
      </div>

      {/* XP Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <span className="font-semibold">Level {stats.level} — {stats.levelName}</span>
          </div>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stats.xp} {t('xp')}</span>
        </div>
        <div className="w-full h-3 rounded-full" style={{ background: 'var(--gray-200)' }}>
          <div className="xp-bar h-3" style={{ width: `${stats.xpProgress || 0}%` }}></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '🔥', label: t('streak'), value: `${stats.streak?.current || 0} days`, color: 'from-orange-500 to-red-500' },
          { icon: '💰', label: t('coins'), value: stats.coins || 0, color: 'from-yellow-500 to-amber-500' },
          { icon: '📚', label: t('lessons'), value: stats.lessonsCompleted || 0, color: 'from-blue-500 to-cyan-500' },
          { icon: '📝', label: t('quizzes'), value: stats.quizzesAttempted || 0, color: 'from-green-500 to-emerald-500' },
        ].map((stat) => (
          <div key={stat.label} className="card text-center hover:scale-105 transition-transform">
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Daily Challenges */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">🎯 {t('challenges')}</h2>
          <Link href="/dashboard/student/challenges" className="text-sm text-purple-500 hover:underline">View All</Link>
        </div>
        <div className="space-y-3">
          {challenges.length > 0 ? challenges.slice(0, 3).map((challenge) => (
            <div key={challenge._id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
              <div>
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{challenge.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{challenge.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-purple-500">+{challenge.xpReward} XP</span>
                {challenge.isCompleted && <span className="block text-xs text-green-500">✅ Done</span>}
              </div>
            </div>
          )) : (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>No challenges today</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/dashboard/student/doubts/ask', icon: '❓', label: t('askDoubt'), color: 'bg-purple-50 hover:bg-purple-100' },
          { href: '/dashboard/student/lessons', icon: '📖', label: t('lessons'), color: 'bg-blue-50 hover:bg-blue-100' },
          { href: '/dashboard/student/quizzes', icon: '📝', label: t('quizzes'), color: 'bg-green-50 hover:bg-green-100' },
          { href: '/dashboard/student/leaderboard', icon: '🏆', label: t('leaderboard'), color: 'bg-yellow-50 hover:bg-yellow-100' },
        ].map((action) => (
          <Link key={action.label} href={action.href} className={`${action.color} rounded-xl p-4 text-center transition-colors`}>
            <span className="text-3xl">{action.icon}</span>
            <p className="text-sm font-medium mt-2" style={{ color: 'var(--text-primary)' }}>{action.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Lessons */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">📚 Recent {t('lessons')}</h2>
          <Link href="/dashboard/student/lessons" className="text-sm text-purple-500 hover:underline">View All</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {recentLessons.length > 0 ? recentLessons.map((lesson) => (
            <Link key={lesson._id} href={`/dashboard/student/lessons/${lesson._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:shadow-md transition-all" style={{ background: 'var(--bg-secondary)' }}>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-xl">📖</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{lesson.title}</p>
                <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{lesson.subject} • Class {lesson.grade}</p>
              </div>
              <span className="text-xs text-purple-500">+{lesson.xpReward} XP</span>
            </Link>
          )) : (
            <p className="text-sm py-4 col-span-2 text-center" style={{ color: 'var(--text-secondary)' }}>No lessons yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
