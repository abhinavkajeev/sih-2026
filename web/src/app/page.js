'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <h1 className="text-xl font-bold gradient-text">Vidya Setu</h1>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/about" className="text-gray-300 hover:text-white transition">About</Link>
          <Link href="/features" className="text-gray-300 hover:text-white transition">Features</Link>
          <Link href="/contact" className="text-gray-300 hover:text-white transition">Contact</Link>
          <Link href="/download" className="text-gray-300 hover:text-white transition">Download APK</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary text-sm">Login</Link>
          <Link href="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`max-w-7xl mx-auto px-6 py-20 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="inline-block px-4 py-1.5 bg-purple-500/20 rounded-full text-sm text-purple-300 mb-6 border border-purple-500/30">
          🏆 SIH 2026 — Government of Punjab
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          Learn Smart,<br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            Grow Together
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          AI-powered digital learning platform for rural school students in Nabha, Punjab.
          Learn in ਪੰਜਾਬੀ, हिंदी & English — even on a basic phone! 📞
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:-translate-y-0.5">
            Start Learning Free →
          </Link>
          <Link href="/features" className="px-8 py-3.5 bg-white/10 rounded-xl text-lg font-medium backdrop-blur border border-white/20 hover:bg-white/20 transition-all">
            Explore Features
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
          {[
            { label: 'Students', value: '10,000+', icon: '👩‍🎓' },
            { label: 'Lessons', value: '500+', icon: '📖' },
            { label: 'Schools', value: '50+', icon: '🏫' },
            { label: 'Languages', value: '3', icon: '🗣️' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6 text-center">
              <span className="text-3xl">{stat.icon}</span>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Why Vidya Setu?</h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">Built specifically for rural students with features that work everywhere</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '📞', title: 'AI Voice Calls', desc: 'Call our AI tutor from any phone — even a basic feature phone. Ask doubts in Punjabi or Hindi!' },
            { icon: '🎮', title: 'Gamified Learning', desc: 'Earn XP, unlock badges, climb leaderboards, and complete daily challenges. Learning is fun!' },
            { icon: '🧠', title: 'Smart AI Tutor', desc: 'AI trained on your daily lessons. Get instant, accurate answers to your doubts 24/7.' },
            { icon: '📊', title: 'Parent Dashboard', desc: 'Parents get daily SMS updates and can track their child\'s progress anytime.' },
            { icon: '📵', title: 'Works Offline', desc: 'Download lessons and study without internet. Perfect for areas with poor connectivity.' },
            { icon: '🗣️', title: 'Multi-Language', desc: 'Learn in Punjabi, Hindi, or English. Switch languages anytime with one tap.' },
          ].map((feature) => (
            <div key={feature.title} className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer">
              <span className="text-4xl group-hover:scale-110 transition-transform inline-block">{feature.icon}</span>
              <h3 className="text-lg font-semibold mt-4 mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="glass rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Learning?</h2>
          <p className="text-gray-300 mb-8">Join thousands of students across Nabha who are learning smarter with AI</p>
          <Link href="/register" className="inline-block px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-lg font-semibold hover:shadow-lg transition-all">
            Join Now — It&apos;s Free 🎉
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-10 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2026 Vidya Setu. Built for SIH 2026 — Government of Punjab</p>
          <div className="flex gap-4 text-gray-500 text-sm">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/download">Download</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
