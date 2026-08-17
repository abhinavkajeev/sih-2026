# SIH 2026 - Digital Learning Platform for Rural School Students

## SIH25019 | Government of Punjab

A comprehensive digital learning platform designed for rural school students in Nabha, Punjab. Features AI-powered voice-based doubt resolution, gamified learning, multi-language support (Punjabi, Hindi, English), and works on both smartphones and basic feature phones via IVR.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend (Web) | Next.js 14 + Tailwind CSS |
| Mobile (APK) | React Native |
| Backend | Node.js + Express |
| Database | MongoDB |
| AI Engine | Python FastAPI + Gemini API |
| Voice/IVR | Twilio / Exotel |
| Speech | Google Cloud STT/TTS |
| Storage | AWS S3 / Cloudinary |

## 📁 Project Structure

```
SIH_2026/
├── web/          # Next.js Frontend (Teacher/Admin/Parent portal)
├── mobile/       # React Native App (Student APK)
├── server/       # Node.js + Express Backend
├── ai-engine/    # Python FastAPI AI Service
└── docs/         # Documentation
```

## 🏃 Quick Start

```bash
# Install all dependencies
npm run install:all

# Run backend + frontend together
npm run dev

# Run individually
npm run dev:server    # Backend on :5000
npm run dev:web       # Frontend on :3000
npm run dev:ai        # AI Engine on :8000
```

## 🔑 Key Features

- 📞 AI Voice Call System (IVR) for feature phones
- 🧠 RAG-based doubt resolution trained on daily lessons
- 🎮 Gamification (XP, Levels, Badges, Leaderboards)
- 🗣️ Multi-language (Punjabi, Hindi, English)
- 📊 Analytics for Teachers, Parents, and Admins
- 📱 Android APK for smartphone users
- 📵 Offline content support

## 👥 Team

SIH Internal Hackathon 2026
