'use client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>👤 {t('profile')}</h1>
      <div className="card text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto flex items-center justify-center text-3xl text-white font-bold">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
        <h2 className="text-xl font-bold mt-3" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
        <p className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{user?.role} • Class {user?.grade}</p>
      </div>
      <div className="card space-y-3">
        <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Phone</span><span style={{ color: 'var(--text-primary)' }}>{user?.phone || 'N/A'}</span></div>
        <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Email</span><span style={{ color: 'var(--text-primary)' }}>{user?.email || 'N/A'}</span></div>
        <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Language</span><span style={{ color: 'var(--text-primary)' }}>{user?.language === 'pa' ? 'ਪੰਜਾਬੀ' : user?.language === 'hi' ? 'हिंदी' : 'English'}</span></div>
      </div>
    </div>
  );
}
