import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { GamificationProvider } from '@/context/GamificationContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Vidya Setu - Digital Learning Platform',
  description: 'AI-powered digital learning platform for rural school students in Nabha, Punjab. Learn in Punjabi, Hindi & English.',
  keywords: 'education, rural, Punjab, Nabha, AI learning, gamified education',
  openGraph: {
    title: 'Vidya Setu - Digital Learning Platform',
    description: 'AI-powered learning for rural students',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <GamificationProvider>
                {children}
              </GamificationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
