'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';

const GamificationContext = createContext();

export const useGamification = () => useContext(GamificationContext);

export function GamificationProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [xpPopup, setXpPopup] = useState(null);
  const [levelUpModal, setLevelUpModal] = useState(false);
  const [badgeUnlockModal, setBadgeUnlockModal] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/gamification/profile');
      setProfile(res.data.data);
    } catch (err) {
      console.error('Failed to fetch gamification profile:', err);
    }
  }, [user]);

  const showXPGain = (amount, reason) => {
    setXpPopup({ amount, reason });
    setTimeout(() => setXpPopup(null), 2000);
  };

  const showLevelUp = (newLevel) => {
    setLevelUpModal(newLevel);
    setTimeout(() => setLevelUpModal(false), 4000);
  };

  const showBadgeUnlock = (badge) => {
    setBadgeUnlockModal(badge);
    setTimeout(() => setBadgeUnlockModal(null), 4000);
  };

  return (
    <GamificationContext.Provider value={{
      profile, fetchProfile, showXPGain, showLevelUp, showBadgeUnlock,
      xpPopup, levelUpModal, badgeUnlockModal,
    }}>
      {children}
    </GamificationContext.Provider>
  );
}
