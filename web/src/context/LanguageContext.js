'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
  en: { welcome: 'Welcome', lessons: 'Lessons', doubts: 'Doubts', quizzes: 'Quizzes', profile: 'Profile', leaderboard: 'Leaderboard', achievements: 'Achievements', rewards: 'Rewards', challenges: 'Challenges', progress: 'Progress', dashboard: 'Dashboard', login: 'Login', register: 'Register', logout: 'Logout', askDoubt: 'Ask a Doubt', uploadLesson: 'Upload Lesson', score: 'Score', level: 'Level', streak: 'Streak', xp: 'XP', coins: 'Coins' },
  hi: { welcome: 'स्वागत है', lessons: 'पाठ', doubts: 'सवाल', quizzes: 'प्रश्नोत्तरी', profile: 'प्रोफ़ाइल', leaderboard: 'लीडरबोर्ड', achievements: 'उपलब्धियाँ', rewards: 'पुरस्कार', challenges: 'चुनौतियाँ', progress: 'प्रगति', dashboard: 'डैशबोर्ड', login: 'लॉगिन', register: 'रजिस्टर', logout: 'लॉगआउट', askDoubt: 'सवाल पूछें', uploadLesson: 'पाठ अपलोड करें', score: 'अंक', level: 'स्तर', streak: 'स्ट्रीक', xp: 'XP', coins: 'सिक्के' },
  pa: { welcome: 'ਜੀ ਆਇਆਂ ਨੂੰ', lessons: 'ਪਾਠ', doubts: 'ਸਵਾਲ', quizzes: 'ਕਵਿਜ਼', profile: 'ਪ੍ਰੋਫਾਈਲ', leaderboard: 'ਲੀਡਰਬੋਰਡ', achievements: 'ਪ੍ਰਾਪਤੀਆਂ', rewards: 'ਇਨਾਮ', challenges: 'ਚੁਣੌਤੀਆਂ', progress: 'ਤਰੱਕੀ', dashboard: 'ਡੈਸ਼ਬੋਰਡ', login: 'ਲੌਗਇਨ', register: 'ਰਜਿਸਟਰ', logout: 'ਲੌਗਆਊਟ', askDoubt: 'ਸਵਾਲ ਪੁੱਛੋ', uploadLesson: 'ਪਾਠ ਅੱਪਲੋਡ ਕਰੋ', score: 'ਅੰਕ', level: 'ਪੱਧਰ', streak: 'ਸਟ੍ਰੀਕ', xp: 'XP', coins: 'ਸਿੱਕੇ' },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const stored = localStorage.getItem('language') || 'en';
    setLanguage(stored);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languages: ['en', 'hi', 'pa'] }}>
      {children}
    </LanguageContext.Provider>
  );
}
