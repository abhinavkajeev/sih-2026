'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const { toggleTheme, isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const role = user?.role || 'student';

  const navItems = {
    student: [
      { href: '/dashboard/student', label: t('dashboard'), icon: '🏠' },
      { href: '/dashboard/student/lessons', label: t('lessons'), icon: '📚' },
      { href: '/dashboard/student/doubts', label: t('doubts'), icon: '❓' },
      { href: '/dashboard/student/quizzes', label: t('quizzes'), icon: '📝' },
      { href: '/dashboard/student/progress', label: t('progress'), icon: '📊' },
      { href: '/dashboard/student/achievements', label: t('achievements'), icon: '🏅' },
      { href: '/dashboard/student/leaderboard', label: t('leaderboard'), icon: '🏆' },
      { href: '/dashboard/student/rewards', label: t('rewards'), icon: '🎁' },
      { href: '/dashboard/student/challenges', label: t('challenges'), icon: '🎯' },
      { href: '/dashboard/student/profile', label: t('profile'), icon: '👤' },
    ],
    teacher: [
      { href: '/dashboard/teacher', label: t('dashboard'), icon: '🏠' },
      { href: '/dashboard/teacher/lessons', label: t('lessons'), icon: '📚' },
      { href: '/dashboard/teacher/lessons/upload', label: t('uploadLesson'), icon: '⬆️' },
      { href: '/dashboard/teacher/students', label: 'Students', icon: '👩‍🎓' },
      { href: '/dashboard/teacher/quizzes', label: t('quizzes'), icon: '📝' },
      { href: '/dashboard/teacher/doubts', label: t('doubts'), icon: '❓' },
      { href: '/dashboard/teacher/analytics', label: 'Analytics', icon: '📊' },
      { href: '/dashboard/teacher/schedule', label: 'Schedule', icon: '📅' },
      { href: '/dashboard/teacher/profile', label: t('profile'), icon: '👤' },
    ],
    parent: [
      { href: '/dashboard/parent', label: t('dashboard'), icon: '🏠' },
      { href: '/dashboard/parent/children', label: 'My Children', icon: '👨‍👧‍👦' },
      { href: '/dashboard/parent/notifications', label: 'Notifications', icon: '🔔' },
      { href: '/dashboard/parent/profile', label: t('profile'), icon: '👤' },
    ],
    admin: [
      { href: '/dashboard/admin', label: t('dashboard'), icon: '🏠' },
      { href: '/dashboard/admin/schools', label: 'Schools', icon: '🏫' },
      { href: '/dashboard/admin/users', label: 'Users', icon: '👥' },
      { href: '/dashboard/admin/content', label: 'Content', icon: '📄' },
      { href: '/dashboard/admin/analytics', label: 'Analytics', icon: '📊' },
      { href: '/dashboard/admin/call-logs', label: 'Call Logs', icon: '📞' },
      { href: '/dashboard/admin/settings', label: 'Settings', icon: '⚙️' },
    ],
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r flex flex-col`} style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}>
        <div className="p-4 flex items-center gap-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-2xl">📚</span>
          {sidebarOpen && <h1 className="text-lg font-bold gradient-text">Vidya Setu</h1>}
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {(navItems[role] || navItems.student).map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-purple-50 transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full hover:bg-red-50 text-red-500 transition-colors">
            <span>🚪</span>
            {sidebarOpen && <span>{t('logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b flex items-center justify-between px-6" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-xl">☰</button>
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <select value={language} onChange={(e) => changeLanguage(e.target.value)} className="text-sm border rounded-lg px-2 py-1" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
              <option value="en">EN</option>
              <option value="hi">हि</option>
              <option value="pa">ਪੰ</option>
            </select>
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="text-xl">{isDark ? '☀️' : '🌙'}</button>
            {/* Notifications */}
            <Link href={`/dashboard/${role}/profile`} className="text-xl">🔔</Link>
            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              {user && <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</span>}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto" style={{ background: 'var(--bg-secondary)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
