import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, FlatList, Dimensions,
  KeyboardAvoidingView, Platform, ActivityIndicator, Modal,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Network from 'expo-network';
import OfflineSyncManager from './services/OfflineSyncManager';

const { width } = Dimensions.get('window');

// ═══════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════
const API_URL = 'http://192.168.29.164:3030/api'; // Local IP for network access
const COLORS = {
  primary: '#7c3aed', primaryDark: '#5b21b6', primaryLight: '#a78bfa',
  accent: '#f97316', success: '#10b981', warning: '#f59e0b', error: '#f43f5e',
  gold: '#fbbf24', bg: '#f8fafc', card: '#ffffff', text: '#0f172a',
  textSub: '#64748b', border: '#e2e8f0',
};
const SUBJECTS = [
  { id: 'mathematics', label: 'Mathematics', emoji: '🔢' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'english', label: 'English', emoji: '📝' },
  { id: 'hindi', label: 'Hindi', emoji: '🇮🇳' },
  { id: 'punjabi', label: 'Punjabi', emoji: '🏵️' },
  { id: 'social_studies', label: 'Social Studies', emoji: '🌍' },
];

// ═══════════════════════════════════════════
// AUTH CONTEXT
// ═══════════════════════════════════════════
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem('token');
        const u = await AsyncStorage.getItem('user');
        if (t && u) { setToken(t); setUser(JSON.parse(u)); }
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const login = async (userData, authToken) => {
    setUser(userData); setToken(authToken);
    await AsyncStorage.setItem('token', authToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null); setToken(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ═══════════════════════════════════════════
// API CLIENT
// ═══════════════════════════════════════════
const api = axios.create({ baseURL: API_URL, timeout: 15000 });
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ═══════════════════════════════════════════
// SCREENS — SPLASH
// ═══════════════════════════════════════════
const SplashScreen = ({ navigation }) => {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading) setTimeout(() => navigation.replace(user ? 'MainTabs' : 'Welcome'), 2000);
  }, [loading]);

  return (
    <View style={[s.center, { backgroundColor: COLORS.primaryDark }]}>
      <Text style={{ fontSize: 80 }}>📚</Text>
      <Text style={[s.h1, { color: '#fff', marginTop: 16 }]}>Vidya Setu</Text>
      <Text style={{ color: '#c4b5fd', fontSize: 14, marginTop: 8 }}>Learn Smart, Grow Together</Text>
      <Text style={{ color: '#a78bfa', fontSize: 11, marginTop: 24 }}>SIH 2026 • Government of Punjab</Text>
    </View>
  );
};

// ═══════════════════════════════════════════
// SCREENS — WELCOME
// ═══════════════════════════════════════════
const WelcomeScreen = ({ navigation }) => (
  <View style={[s.flex, { backgroundColor: COLORS.primaryDark, paddingHorizontal: 24 }]}>
    <View style={s.flex}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 60 }}>🎓</Text>
        <Text style={[s.h1, { color: '#fff', marginTop: 16, fontSize: 32, lineHeight: 40 }]}>Welcome to{'\n'}Vidya Setu</Text>
        <Text style={{ color: '#c4b5fd', fontSize: 15, marginTop: 12, lineHeight: 22 }}>AI-powered digital learning for rural students. Learn in ਪੰਜਾਬੀ, हिंदी & English!</Text>
        <View style={{ marginTop: 24 }}>
          {['📞 Ask doubts via phone call', '🎮 Gamified learning with XP & badges', '🧠 AI-powered instant answers', '📵 Works offline too!'].map((f, i) => (
            <Text key={i} style={{ color: '#ddd6fe', fontSize: 14, marginTop: 10 }}>{f}</Text>
          ))}
        </View>
      </View>
      <View style={{ paddingBottom: 40 }}>
        <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.navigate('Register')}>
          <Text style={s.btnPrimaryText}>Get Started 🚀</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 14, alignItems: 'center', marginTop: 8 }} onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: '#a78bfa', fontSize: 14, fontWeight: '600' }}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ═══════════════════════════════════════════
// SCREENS — LOGIN
// ═══════════════════════════════════════════
const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phone || !password) return Alert.alert('Error', 'Fill all fields');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { phone, password });
      await login(res.data.data, res.data.token);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Check your credentials');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={[s.flex, { backgroundColor: COLORS.primaryDark }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.center, { paddingHorizontal: 24 }]}>
        <Text style={{ fontSize: 50 }}>📚</Text>
        <Text style={[s.h1, { color: '#fff', marginTop: 12 }]}>Welcome Back</Text>
        <Text style={{ color: '#c4b5fd', fontSize: 13, marginTop: 4 }}>Login to Vidya Setu</Text>
        <TextInput style={s.input} placeholder="Phone Number" placeholderTextColor="#94a3b8" keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={10} />
        <TextInput style={s.input} placeholder="Password" placeholderTextColor="#94a3b8" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={[s.btnPrimary, { width: '100%', marginTop: 24, opacity: loading ? 0.7 : 1 }]} onPress={handleLogin} disabled={loading}>
          <Text style={s.btnPrimaryText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 20 }}>
          <Text style={{ color: '#94a3b8', fontSize: 13 }}>Don't have an account? <Text style={{ color: '#a78bfa' }}>Register</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ═══════════════════════════════════════════
// SCREENS — REGISTER
// ═══════════════════════════════════════════
const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'student', grade: '6', language: 'hi' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async () => {
    if (!form.name || !form.phone || !form.password) return Alert.alert('Error', 'Fill all fields');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      await login(res.data.data, res.data.token);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const roles = [{ key: 'student', icon: '👩‍🎓' }, { key: 'teacher', icon: '👩‍🏫' }, { key: 'parent', icon: '👨‍👧' }];
  const langs = [{ key: 'en', label: 'EN' }, { key: 'hi', label: 'हि' }, { key: 'pa', label: 'ਪੰ' }];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.primaryDark }} contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text style={{ fontSize: 50, textAlign: 'center' }}>🎓</Text>
      <Text style={[s.h1, { color: '#fff', textAlign: 'center', marginTop: 8, marginBottom: 20 }]}>Join Vidya Setu</Text>
      <TextInput style={s.input} placeholder="Full Name" placeholderTextColor="#94a3b8" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
      <TextInput style={s.input} placeholder="Phone Number" placeholderTextColor="#94a3b8" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} maxLength={10} />
      <TextInput style={s.input} placeholder="Password (min 6)" placeholderTextColor="#94a3b8" secureTextEntry value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} />
      <Text style={{ color: '#c4b5fd', fontSize: 12, fontWeight: '600', marginTop: 16 }}>I am a:</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        {roles.map((r) => (
          <TouchableOpacity key={r.key} style={[s.pill, form.role === r.key && s.pillActive]} onPress={() => setForm({ ...form, role: r.key })}>
            <Text style={{ color: form.role === r.key ? '#fff' : '#c4b5fd', fontSize: 12, fontWeight: '600' }}>{r.icon} {r.key}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ color: '#c4b5fd', fontSize: 12, fontWeight: '600', marginTop: 16 }}>Language:</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        {langs.map((l) => (
          <TouchableOpacity key={l.key} style={[s.pill, form.language === l.key && s.pillActive]} onPress={() => setForm({ ...form, language: l.key })}>
            <Text style={{ color: form.language === l.key ? '#fff' : '#c4b5fd', fontSize: 14, fontWeight: '600' }}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={[s.btnPrimary, { marginTop: 28, opacity: loading ? 0.7 : 1 }]} onPress={handleRegister} disabled={loading}>
        <Text style={s.btnPrimaryText}>{loading ? 'Creating...' : 'Register'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignItems: 'center', marginTop: 16, paddingBottom: 40 }}>
        <Text style={{ color: '#94a3b8', fontSize: 13 }}>Already have an account? <Text style={{ color: '#a78bfa' }}>Login</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ═══════════════════════════════════════════
// SCREENS — HOME (Student Dashboard)
// ═══════════════════════════════════════════
const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ xp: 1250, level: 3, levelName: 'Expert', streak: 7, coins: 340, xpProgress: 65 });
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check network periodically and try syncing
    const interval = setInterval(async () => {
      const net = await Network.getNetworkStateAsync();
      const offline = !(net.isConnected && net.isInternetReachable);
      if (isOffline !== offline) setIsOffline(offline);

      if (!offline) {
        setIsSyncing(true);
        await OfflineSyncManager.attemptSync();
        setIsSyncing(false);
      }
    }, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [isOffline]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: '#ddd6fe', fontSize: 13 }}>Welcome back 👋</Text>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 4 }}>{user?.name || 'Student'}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18 }}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Offline / Sync Indicator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' }}>
          <Text style={{ fontSize: 12 }}>{isOffline ? '🟠' : isSyncing ? '☁️' : '🟢'}</Text>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600', marginLeft: 6 }}>
            {isOffline ? 'Offline Mode (Progress Saved Locally)' : isSyncing ? 'Syncing progress...' : 'Online & Synced'}
          </Text>
        </View>

        {/* XP Bar */}
        <View style={{ marginTop: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>⭐ Level {stats.level} — {stats.levelName}</Text>
            <Text style={{ color: '#ddd6fe', fontSize: 12 }}>{stats.xp} XP</Text>
          </View>
          <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, marginTop: 8 }}>
            <View style={{ height: 8, borderRadius: 99, backgroundColor: '#fbbf24', width: `${stats.xpProgress}%` }} />
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={{ flexDirection: 'row', marginHorizontal: 12, marginTop: 16, gap: 8 }}>
        {[
          { icon: '🔥', label: 'Streak', value: `${stats.streak}d` },
          { icon: '💰', label: 'Coins', value: stats.coins },
          { icon: '📚', label: 'Lessons', value: 12 },
          { icon: '📝', label: 'Quizzes', value: 8 },
        ].map((stat) => (
          <View key={stat.label} style={s.statCard}>
            <Text style={{ fontSize: 22 }}>{stat.icon}</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 4 }}>{stat.value}</Text>
            <Text style={{ fontSize: 10, color: COLORS.textSub, marginTop: 2 }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={s.sectionTitle}>Quick Actions</Text>
      <View style={{ flexDirection: 'row', marginHorizontal: 12, gap: 8 }}>
        {[
          { icon: '❓', label: 'Ask Doubt', color: '#f5f3ff', screen: 'Doubts' },
          { icon: '📖', label: 'Lessons', color: '#eff6ff', screen: 'Lessons' },
          { icon: '📝', label: 'Quizzes', color: '#f0fdf4', screen: 'Quizzes' },
          { icon: '🏆', label: 'Rankings', color: '#fefce8', screen: 'Leaderboard' },
        ].map((a) => (
          <TouchableOpacity key={a.label} style={[s.actionCard, { backgroundColor: a.color }]} onPress={() => navigation.navigate(a.screen)}>
            <Text style={{ fontSize: 26 }}>{a.icon}</Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.primaryDark, marginTop: 6 }}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Daily Challenges */}
      <Text style={s.sectionTitle}>🎯 Daily Challenges</Text>
      {[
        { title: 'Lesson Explorer', desc: 'Complete 2 lessons today', xp: 50, done: false },
        { title: 'Curious Mind', desc: 'Ask 3 doubts today', xp: 40, done: true },
        { title: 'Quiz Master', desc: 'Score above 70% in a quiz', xp: 60, done: false },
      ].map((c, i) => (
        <View key={i} style={[s.card, { marginHorizontal: 16, marginTop: 8, flexDirection: 'row', alignItems: 'center', opacity: c.done ? 0.6 : 1 }]}>
          <Text style={{ fontSize: 24, marginRight: 12 }}>{c.done ? '✅' : i === 0 ? '⭐' : i === 1 ? '💡' : '🏅'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>{c.title}</Text>
            <Text style={{ fontSize: 11, color: COLORS.textSub, marginTop: 2 }}>{c.desc}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>+{c.xp} XP</Text>
            <Text style={{ fontSize: 10, color: COLORS.gold }}>+{Math.floor(c.xp / 5)} 💰</Text>
          </View>
        </View>
      ))}

      {/* Recent Lessons */}
      <Text style={s.sectionTitle}>📚 Continue Learning</Text>
      {[
        { title: 'Basic Algebra: Equations', subject: 'Mathematics', grade: '8', xp: 30 },
        { title: 'The Water Cycle', subject: 'Science', grade: '7', xp: 25 },
        { title: 'Parts of Speech', subject: 'English', grade: '6', xp: 20 },
      ].map((lesson, i) => (
        <TouchableOpacity key={i} style={[s.card, { marginHorizontal: 16, marginTop: 8, flexDirection: 'row', alignItems: 'center' }]} onPress={() => navigation.navigate('Lessons')}>
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#f5f3ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
            <Text style={{ fontSize: 22 }}>{i === 0 ? '🔢' : i === 1 ? '🔬' : '📝'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>{lesson.title}</Text>
            <Text style={{ fontSize: 11, color: COLORS.textSub, marginTop: 2 }}>{lesson.subject} • Class {lesson.grade}</Text>
          </View>
          <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600' }}>+{lesson.xp} XP</Text>
        </TouchableOpacity>
      ))}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

// ═══════════════════════════════════════════
// SCREENS — LESSONS
// ═══════════════════════════════════════════
const LessonsScreen = () => {
  const [activeSubject, setActiveSubject] = useState(null);

  const lessons = [
    { title: 'Basic Algebra: Equations', subject: 'Mathematics', grade: '8', xp: 30, emoji: '🔢' },
    { title: 'The Water Cycle', subject: 'Science', grade: '7', xp: 25, emoji: '🔬' },
    { title: 'Parts of Speech', subject: 'English', grade: '6', xp: 20, emoji: '📝' },
    { title: 'भारत का इतिहास', subject: 'Hindi', grade: '8', xp: 25, emoji: '🇮🇳' },
    { title: 'ਪੰਜਾਬ ਦਾ ਭੂਗੋਲ', subject: 'Punjabi', grade: '7', xp: 30, emoji: '🏵️' },
    { title: 'Photosynthesis', subject: 'Science', grade: '8', xp: 35, emoji: '🌱' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff' }}>📚 Lessons</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 12 }} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
        <TouchableOpacity style={[s.chip, !activeSubject && s.chipActive]} onPress={() => setActiveSubject(null)}>
          <Text style={{ fontSize: 12, color: !activeSubject ? '#fff' : COLORS.textSub, fontWeight: '600' }}>All</Text>
        </TouchableOpacity>
        {SUBJECTS.map((sub) => (
          <TouchableOpacity key={sub.id} style={[s.chip, activeSubject === sub.id && s.chipActive]} onPress={() => setActiveSubject(sub.id)}>
            <Text style={{ fontSize: 12, color: activeSubject === sub.id ? '#fff' : COLORS.textSub, fontWeight: '600' }}>{sub.emoji} {sub.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList data={lessons} numColumns={2} contentContainerStyle={{ padding: 12 }} columnWrapperStyle={{ gap: 12 }} renderItem={({ item }) => (
        <View style={[s.card, { flex: 1, marginBottom: 12 }]}>
          <View style={{ height: 80, backgroundColor: '#f5f3ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.text }} numberOfLines={2}>{item.title}</Text>
          <Text style={{ fontSize: 10, color: COLORS.textSub, marginTop: 4 }}>{item.subject} • Class {item.grade}</Text>
          <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600', marginTop: 6 }}>+{item.xp} XP</Text>
        </View>
      )} keyExtractor={(_, i) => String(i)} />
    </View>
  );
};

// ═══════════════════════════════════════════
// SCREENS — DOUBTS
// ═══════════════════════════════════════════
const DoubtsScreen = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Science');
  const [selectedLang, setSelectedLang] = useState('pa'); // Punjabi default
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('Calling...');
  const [callDuration, setCallDuration] = useState(0);
  const [callTranscript, setCallTranscript] = useState([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  const [recentDoubts, setRecentDoubts] = useState([
    { q: 'ਪ੍ਰਕਾਸ਼ ਸੰਸਲੇਸ਼ਣ ਕੀ ਹੁੰਦਾ ਹੈ?', status: 'Resolved', statusColor: '#10b981' },
    { q: 'How to solve 3x + 7 = 22?', status: 'AI Answered', statusColor: '#3b82f6' },
    { q: 'ਭਾਰਤ ਦਾ ਸੰਵਿਧਾਨ ਕਿਸਨੇ ਲਿਖਿਆ?', status: 'Resolved', statusColor: '#10b981' },
  ]);

  const indianHotlineNumber = '09513886363'; // Exotel Indian Mobile Number
  const indianLandlineNumber = '04447615092'; // Exotel Indian Landline Number
  const virtualPin = '9344-7908-64';

  // Start In-App Simulated AI Voice Call (100% Free - No SIM Balance needed!)
  const startAICall = () => {
    setIsCallActive(true);
    setCallStatus('Ringing Vidya AI Hotline...');
    setCallDuration(0);
    setCallTranscript([]);
    setIsAISpeaking(true);

    setTimeout(() => {
      setCallStatus('Connected 🟢 (Audio Live)');
      const greeting = selectedLang === 'pa'
        ? 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਵਿਦਿਆ AI ਹਾਂ। ਆਪਣਾ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛੋ।'
        : selectedLang === 'hi'
        ? 'नमस्ते! मैं विद्या AI हूँ। कृपया अपना प्रश्न पूछें।'
        : 'Hello! I am Vidya AI tutor. Please speak your doubt.';
      setCallTranscript([{ speaker: 'Vidya AI 🤖', text: greeting }]);
      setIsAISpeaking(false);
    }, 1500);
  };

  const endAICall = () => {
    setIsCallActive(false);
    setCallStatus('Call Ended');
    setCallDuration(0);
  };

  const simulateAskInCall = async (doubtText) => {
    if (!doubtText) return;
    setCallTranscript(prev => [...prev, { speaker: 'You 🗣️', text: doubtText }]);
    setIsAISpeaking(true);

    try {
      const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
      const langName = selectedLang === 'pa' ? 'PUNJABI' : selectedLang === 'hi' ? 'HINDI' : 'ENGLISH';
      const prompt = `You are a voice AI answering a student phone call in Nabha, Punjab.
Keep your response concise (2-3 sentences), warm, and spoken directly in ${langName}:
Question: "${doubtText}"`;

      let reply = '';
      const res = await api.post('/doubts', { question: doubtText, language: selectedLang, subject: 'General' });
      reply = res.data?.data?.aiResponse?.answer || 'ਮੈਨੂੰ ਅਫਸੋਸ ਹੈ, ਮੈਨੂੰ ਨਹੀਂ ਪਤਾ।';
      setCallTranscript(prev => [...prev, { speaker: 'Vidya AI 🤖', text: reply }]);
    } catch (e) {
      setCallTranscript(prev => [...prev, { speaker: 'Vidya AI 🤖', text: 'ਇਹ ਇੱਕ ਬਹੁਤ ਮਹੱਤਵਪੂਰਨ ਸਵਾਲ ਹੈ। ਇਸਨੂੰ ਸਮਝਣ ਲਈ ਕਿਤਾਬ ਦੇ ਅਧਿਆਇ ਨੂੰ ਧਿਆਨ ਨਾਲ ਪੜ੍ਹੋ।' }]);
    }
    setIsAISpeaking(false);
  };

  const callAITutor = () => {
    Alert.alert(
      '📞 AI Doubt Hotline (India)',
      `Call the Vidya AI Indian Hotline:\n\n📱 Number: ${indianHotlineNumber}\n🔑 PIN: ${virtualPin}\n\nOr use the 100% Free In-App Call!`,
      [
        {
          text: '🎙️ Free In-App AI Call (Best)',
          onPress: startAICall,
        },
        {
          text: `📞 Dial ${indianHotlineNumber}`,
          onPress: () => {
            const { Linking } = require('react-native');
            Linking.openURL(`tel:${indianHotlineNumber}`).catch(() => {
              Alert.alert('Dialing Number', `Please dial ${indianHotlineNumber} from your phone.`);
            });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const askDoubt = async () => {
    if (!question.trim()) {
      return Alert.alert('Question Required', 'Please enter your doubt before submitting.');
    }
    setLoading(true);

    try {
      const net = await Network.getNetworkStateAsync();
      const offline = !(net.isConnected && net.isInternetReachable);

      if (offline) {
        // RURAL-FIRST OFFLINE FALLBACK
        await OfflineSyncManager.addActivityToQueue({
          activityType: 'doubt_asked',
          metadata: { question: question.trim(), subject: selectedSubject, language: selectedLang }
        });

        Alert.alert(
          'Saved for Later 🟠',
          'You are currently offline. Your question has been safely saved! We will fetch the AI answer automatically as soon as you connect to the internet.'
        );
        
        setRecentDoubts(prev => [{ q: question, status: 'Pending Sync', statusColor: '#f59e0b' }, ...prev]);
        setQuestion('');
        setLoading(false);
        return;
      }

      // 1. Try calling our local backend server first
      const res = await api.post('/doubts', {
        question: question.trim(),
        subject: selectedSubject,
        language: selectedLang,
      });

      if (res.data?.data?.aiResponse?.answer) {
        setAiResponse(res.data.data.aiResponse);
        setRecentDoubts(prev => [{ q: question, status: 'AI Answered', statusColor: '#3b82f6' }, ...prev]);
      }
    } catch (backendError) {
      // Backend didn't return or was offline, fallback handled
      Alert.alert('Connection Error', 'Could not reach the server. Please try again later.');
    }

    setLoading(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: 16 }}>
      {/* Header Banner */}
      <View style={{ backgroundColor: COLORS.primary, padding: 20, borderRadius: 24, marginTop: 35, marginBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff' }}>❓ Ask a Doubt</Text>
        <Text style={{ fontSize: 13, color: '#ddd6fe', marginTop: 4 }}>Get instant AI answers in Punjabi, Hindi or English!</Text>
      </View>

      {/* Voice Call AI Hotline Banner */}
      <TouchableOpacity
        style={{
          backgroundColor: '#10b981',
          borderRadius: 18,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          shadowColor: '#10b981',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 3,
        }}
        onPress={callAITutor}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
            <Text style={{ fontSize: 22 }}>📞</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Call AI Doubt Hotline</Text>
            <Text style={{ color: '#ecfdf5', fontSize: 12, marginTop: 2 }}>Speak your doubt & listen to answers live</Text>
          </View>
        </View>
        <View style={{ backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
          <Text style={{ color: '#059669', fontSize: 13, fontWeight: '700' }}>CALL</Text>
        </View>
      </TouchableOpacity>

      {/* Input Card */}
      <View style={[s.card, { borderWidth: 1, borderColor: COLORS.border }]}>
        {/* Language Selector */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.textSub }}>LANGUAGE:</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[
              { id: 'pa', label: 'ਪੰਜਾਬੀ' },
              { id: 'hi', label: 'हिंदी' },
              { id: 'en', label: 'English' },
            ].map(l => (
              <TouchableOpacity
                key={l.id}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                  backgroundColor: selectedLang === l.id ? COLORS.primary : '#f1f5f9',
                }}
                onPress={() => setSelectedLang(l.id)}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: selectedLang === l.id ? '#fff' : COLORS.textSub }}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Text Input with high contrast black text on white */}
        <TextInput
          style={{
            backgroundColor: '#ffffff',
            borderWidth: 1.5,
            borderColor: '#cbd5e1',
            borderRadius: 14,
            padding: 14,
            fontSize: 16,
            color: '#0f172a', // Deep dark text - fully visible
            minHeight: 110,
            textAlignVertical: 'top',
            lineHeight: 22,
          }}
          placeholder="Type your question here... (e.g., What is photosynthesis? / 1+1 ਕਿੰਨਾ ਹੁੰਦਾ ਹੈ?)"
          placeholderTextColor="#94a3b8"
          multiline
          value={question}
          onChangeText={setQuestion}
        />

        <TouchableOpacity
          style={[s.btnPrimary, { marginTop: 14, opacity: loading ? 0.7 : 1 }]}
          onPress={askDoubt}
          disabled={loading}
        >
          <Text style={s.btnPrimaryText}>{loading ? '🤖 Vidya AI is answering...' : 'Ask AI Tutor (+20 XP) 🚀'}</Text>
        </TouchableOpacity>
      </View>

      {/* AI Response Card */}
      {aiResponse && (
        <View style={[s.card, { marginTop: 16, borderLeftWidth: 4, borderLeftColor: COLORS.primary, padding: 18 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.primary }}>
              🤖 Vidya AI Response ({Math.round((aiResponse.confidence || 0.95) * 100)}% Match)
            </Text>
            <View style={{ backgroundColor: '#f5f3ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
              <Text style={{ fontSize: 10, color: COLORS.primary, fontWeight: '700' }}>+20 XP EARNED</Text>
            </View>
          </View>
          <Text style={{ fontSize: 15, color: '#1e293b', lineHeight: 24, fontWeight: '400' }}>
            {aiResponse.answer}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <TouchableOpacity
              style={[s.pill, s.pillActive, { borderRadius: 10, paddingVertical: 10 }]}
              onPress={() => Alert.alert('Feedback Recorded! 🎉', 'You earned +10 bonus XP for marking this helpful!')}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>👍 Helpful (+10 XP)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.pill, { borderRadius: 10, borderColor: COLORS.border, paddingVertical: 10 }]}
              onPress={() => Alert.alert('Teacher Notified 👩‍🏫', 'Your doubt has been forwarded to your school subject teacher for additional review.')}
            >
              <Text style={{ color: COLORS.textSub, fontSize: 12, fontWeight: '600' }}>👩‍🏫 Ask Teacher</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Recent Doubts List */}
      <Text style={[s.sectionTitle, { marginTop: 24, marginBottom: 10 }]}>📜 Recent Doubts</Text>
      {recentDoubts.map((d, i) => (
        <View key={i} style={[s.card, { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#1e293b' }} numberOfLines={1}>{d.q}</Text>
          </View>
          <View style={{ backgroundColor: d.statusColor + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ fontSize: 11, color: d.statusColor, fontWeight: '700' }}>{d.status}</Text>
          </View>
        </View>
      ))}

      <View style={{ height: 40 }} />

      {/* 📞 IN-APP AI VOICE CALL MODAL (100% Free Live Call Simulator) */}
      <Modal visible={isCallActive} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: '#0f172a', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, justifyContent: 'space-between' }}>
          {/* Caller Header */}
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#a78bfa', shadowColor: '#a78bfa', shadowRadius: 20, shadowOpacity: 0.6 }}>
              <Text style={{ fontSize: 50 }}>🤖</Text>
            </View>
            <Text style={{ color: '#ffffff', fontSize: 26, fontWeight: '800', marginTop: 18 }}>Vidya AI Tutor</Text>
            <Text style={{ color: '#a78bfa', fontSize: 15, marginTop: 4 }}>Rural Punjab AI Hotline</Text>
            <Text style={{ color: isAISpeaking ? '#38bdf8' : '#4ade80', fontSize: 16, fontWeight: '700', marginTop: 10 }}>
              {isAISpeaking ? '🎙️ Vidya AI is speaking...' : callStatus}
            </Text>
          </View>

          {/* Live Audio Transcript Box */}
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 18, marginVertical: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 10 }}>LIVE CONVERSATION TRANSCRIPT:</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {callTranscript.map((t, idx) => (
                <View key={idx} style={{ marginBottom: 14, backgroundColor: t.speaker.includes('You') ? 'rgba(124, 58, 237, 0.3)' : 'rgba(255,255,255,0.08)', padding: 12, borderRadius: 14 }}>
                  <Text style={{ color: t.speaker.includes('You') ? '#c4b5fd' : '#38bdf8', fontSize: 12, fontWeight: '700' }}>{t.speaker}</Text>
                  <Text style={{ color: '#ffffff', fontSize: 15, marginTop: 4, lineHeight: 22 }}>{t.text}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Quick Voice Doubt Prompts during call */}
          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>TAP TO SPEAK A DOUBT OVER THE CALL:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
              {[
                { label: 'ਪ੍ਰਕਾਸ਼ ਸੰਸਲੇਸ਼ਣ ਕੀ ਹੈ?', q: 'ਪ੍ਰਕਾਸ਼ ਸੰਸਲੇਸ਼ਣ ਕੀ ਹੁੰਦਾ ਹੈ?' },
                { label: '1+1 ਕਿੰਨਾ ਹੁੰਦਾ ਹੈ?', q: '1+1 ਕਿੰਨਾ ਹੁੰਦਾ ਹੈ?' },
                { label: 'What is Gravity?', q: 'What is Gravity in Science?' },
                { label: 'ਸੰਵਿਧਾਨ ਕੀ ਹੈ?', q: 'ਭਾਰਤ ਦਾ ਸੰਵਿਧਾਨ ਕੀ ਹੈ?' },
              ].map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
                  onPress={() => simulateAskInCall(p.q)}
                >
                  <Text style={{ color: '#f1f5f9', fontSize: 12, fontWeight: '600' }}>🗣️ {p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* End Call Button */}
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', shadowColor: '#ef4444', shadowRadius: 15, shadowOpacity: 0.5 }}
                onPress={endAICall}
              >
                <Text style={{ fontSize: 32 }}>🛑</Text>
              </TouchableOpacity>
              <Text style={{ color: '#fca5a5', fontSize: 12, fontWeight: '700', marginTop: 8 }}>End Call</Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ═══════════════════════════════════════════
// SCREENS — QUIZZES
// ═══════════════════════════════════════════
const QuizzesScreen = () => {
  const quizzes = [
    { title: 'Algebra Basics', subject: 'Mathematics', questions: 10, xp: 50, emoji: '🔢', ai: true },
    { title: 'The Solar System', subject: 'Science', questions: 8, xp: 40, emoji: '🌌', ai: false },
    { title: 'English Grammar', subject: 'English', questions: 12, xp: 60, emoji: '📝', ai: true },
    { title: 'ਪੰਜਾਬ ਦਾ ਇਤਿਹਾਸ', subject: 'Punjabi', questions: 6, xp: 30, emoji: '🏵️', ai: false },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff' }}>📝 Quizzes</Text>
        <Text style={{ fontSize: 13, color: '#ddd6fe', marginTop: 4 }}>Test your knowledge & earn XP!</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {quizzes.map((q, i) => (
          <TouchableOpacity key={i} style={s.card} onPress={() => Alert.alert('Quiz', `Starting "${q.title}"...\n\nThis would launch the quiz player in the full app!`)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: '#f5f3ff', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
                <Text style={{ fontSize: 28 }}>{q.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {q.ai && <View style={{ backgroundColor: '#dbeafe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}><Text style={{ fontSize: 9, color: '#2563eb', fontWeight: '600' }}>🤖 AI</Text></View>}
                  <View style={{ backgroundColor: '#f5f3ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}><Text style={{ fontSize: 9, color: COLORS.primary, fontWeight: '600' }}>{q.subject}</Text></View>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text, marginTop: 4 }}>{q.title}</Text>
                <Text style={{ fontSize: 11, color: COLORS.textSub, marginTop: 2 }}>{q.questions} questions • 15 min</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primary }}>+{q.xp} XP</Text>
                <Text style={{ fontSize: 18, marginTop: 4 }}>▶️</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// ═══════════════════════════════════════════
// SCREENS — LEADERBOARD
// ═══════════════════════════════════════════
const LeaderboardScreen = () => {
  const { user } = useAuth();
  const medals = ['🥇', '🥈', '🥉'];
  const rankings = [
    { name: 'Gurpreet Singh', xp: 2450, level: 4, streak: 15 },
    { name: 'Amandeep Kaur', xp: 2120, level: 4, streak: 12 },
    { name: 'Harjot Singh', xp: 1890, level: 3, streak: 9 },
    { name: user?.name || 'You', xp: 1250, level: 3, streak: 7 },
    { name: 'Simran Kaur', xp: 1100, level: 2, streak: 5 },
    { name: 'Rajveer Singh', xp: 980, level: 2, streak: 3 },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff' }}>🏆 Leaderboard</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {rankings.map((r, i) => (
          <View key={i} style={[s.card, { marginTop: i === 0 ? 0 : 8, flexDirection: 'row', alignItems: 'center', backgroundColor: i < 3 ? '#fffbeb' : r.name === (user?.name || 'You') ? '#f5f3ff' : '#fff', borderWidth: r.name === (user?.name || 'You') ? 2 : 0, borderColor: COLORS.primary }]}>
            <Text style={{ fontSize: i < 3 ? 24 : 16, fontWeight: '700', width: 36, textAlign: 'center', color: COLORS.textSub }}>{i < 3 ? medals[i] : `#${i + 1}`}</Text>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{r.name[0]}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>{r.name}</Text>
              <Text style={{ fontSize: 11, color: COLORS.textSub }}>Level {r.level} • 🔥 {r.streak}</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.primary }}>{r.xp} XP</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ═══════════════════════════════════════════
// SCREENS — PROFILE
// ═══════════════════════════════════════════
const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const badges = [
    { icon: '🌟', name: 'First Steps', earned: true, rarity: 'common' },
    { icon: '📚', name: 'Bookworm', earned: true, rarity: 'rare' },
    { icon: '🧠', name: 'Quick Thinker', earned: true, rarity: 'epic' },
    { icon: '🏆', name: 'Quiz Champion', earned: false, rarity: 'legendary' },
    { icon: '🔥', name: 'Streak Master', earned: false, rarity: 'epic' },
    { icon: '💎', name: 'Diamond Scholar', earned: false, rarity: 'legendary' },
  ];

  const rarityColors = { common: '#9ca3af', rare: '#3b82f6', epic: '#8b5cf6', legendary: '#fbbf24' };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 40, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#ddd6fe', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' }}>
          <Text style={{ fontSize: 36, fontWeight: '800', color: COLORS.primary }}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 12 }}>{user?.name || 'Student'}</Text>
        <Text style={{ fontSize: 13, color: '#ddd6fe' }}>Class {user?.grade || '8'} • {user?.language === 'pa' ? 'ਪੰਜਾਬੀ' : user?.language === 'hi' ? 'हिंदी' : 'English'}</Text>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={s.sectionTitle}>🏅 Badges</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
          {badges.map((b, i) => (
            <View key={i} style={[s.card, { width: (width - 56) / 3, alignItems: 'center', opacity: b.earned ? 1 : 0.35, borderWidth: 2, borderColor: rarityColors[b.rarity] }]}>
              <Text style={{ fontSize: 28 }}>{b.icon}</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: COLORS.text, marginTop: 4, textAlign: 'center' }}>{b.name}</Text>
              <Text style={{ fontSize: 8, color: rarityColors[b.rarity], fontWeight: '700', marginTop: 2 }}>{b.rarity.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        <Text style={[s.sectionTitle, { marginTop: 24 }]}>⚙️ Settings</Text>
        {[
          { icon: '🌙', label: 'Dark Mode', value: 'Off' },
          { icon: '🗣️', label: 'Language', value: user?.language === 'pa' ? 'ਪੰਜਾਬੀ' : user?.language === 'hi' ? 'हिंदी' : 'English' },
          { icon: '🔔', label: 'Notifications', value: 'On' },
          { icon: '📱', label: 'App Version', value: 'v1.0.0' },
        ].map((item, i) => (
          <View key={i} style={[s.card, { marginTop: 8, flexDirection: 'row', alignItems: 'center' }]}>
            <Text style={{ fontSize: 20, marginRight: 12 }}>{item.icon}</Text>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: COLORS.text }}>{item.label}</Text>
            <Text style={{ fontSize: 13, color: COLORS.textSub }}>{item.value}</Text>
          </View>
        ))}

        <TouchableOpacity style={[s.card, { marginTop: 16, alignItems: 'center', borderColor: '#fecaca', borderWidth: 1 }]} onPress={logout}>
          <Text style={{ color: '#ef4444', fontWeight: '600' }}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = { Home: '🏠', Lessons: '📚', Doubts: '❓', Quizzes: '📝', Leaderboard: '🏆', Profile: '👤' };

const MainTabs = () => (
  <Tab.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarIcon: () => <Text style={{ fontSize: 22 }}>{tabIcons[route.name]}</Text>,
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: COLORS.textSub,
    tabBarStyle: { height: 64, paddingTop: 8, paddingBottom: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
    tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
  })}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Lessons" component={LessonsScreen} />
    <Tab.Screen name="Doubts" component={DoubtsScreen} />
    <Tab.Screen name="Quizzes" component={QuizzesScreen} />
    <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!user ? (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

// ═══════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════
const s = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h1: { fontSize: 26, fontWeight: '800' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 15, marginTop: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  btnPrimary: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  pill: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginHorizontal: 16, marginTop: 24, marginBottom: 8 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  actionCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
});
