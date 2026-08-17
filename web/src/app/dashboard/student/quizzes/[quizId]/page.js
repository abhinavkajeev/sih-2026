'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

export default function QuizPlayPage() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => { api.get(`/quizzes/${quizId}`).then(res => { setQuiz(res.data.data); setTimeLeft((res.data.data.duration || 15) * 60); }).catch(console.error); }, [quizId]);

  useEffect(() => { if (!started || timeLeft <= 0) return; const t = setInterval(() => setTimeLeft(p => p - 1), 1000); return () => clearInterval(t); }, [started, timeLeft]);

  const selectOption = (optIdx) => { setAnswers([...answers, { questionIndex: current, selectedOption: optIdx }]); };

  const nextQuestion = () => { if (current < quiz.questions.length - 1) setCurrent(current + 1); else submitQuiz(); };

  const submitQuiz = async () => {
    try {
      const res = await api.post(`/quizzes/${quizId}/attempt`, { answers, timeTaken: (quiz.duration * 60) - timeLeft });
      setResult(res.data.data);
    } catch (err) { alert('Submission failed'); }
  };

  if (!quiz) return <div className="animate-pulse"><div className="h-64 rounded-xl" style={{ background: 'var(--bg-secondary)' }}></div></div>;

  if (result) return (
    <div className="max-w-xl mx-auto text-center space-y-6 animate-scaleIn">
      <span className="text-6xl">{result.isPerfect ? '🏆' : result.percentage >= 70 ? '🎉' : '💪'}</span>
      <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{result.isPerfect ? 'Perfect Score!' : result.percentage >= 70 ? 'Great Job!' : 'Keep Trying!'}</h1>
      <div className="card"><p className="text-5xl font-bold text-purple-600">{result.percentage}%</p><p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{result.score}/{result.totalMarks} marks</p><p className="text-sm text-green-500 font-medium mt-2">+{result.xpEarned} XP earned!</p></div>
    </div>
  );

  if (!started) return (
    <div className="max-w-xl mx-auto text-center space-y-6 animate-fadeIn">
      <div className="card">
        <span className="text-4xl">📝</span><h1 className="text-2xl font-bold mt-3" style={{ color: 'var(--text-primary)' }}>{quiz.title}</h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{quiz.questions?.length} questions • {quiz.duration} minutes</p>
        <button onClick={() => setStarted(true)} className="btn-primary mt-6 px-8">Start Quiz 🚀</button>
      </div>
    </div>
  );

  const q = quiz.questions[current];
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Question {current + 1}/{quiz.questions.length}</span>
        <span className="text-sm font-mono px-3 py-1 rounded-full bg-red-100 text-red-700">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ background: 'var(--gray-200)' }}><div className="h-2 rounded-full bg-purple-500 transition-all" style={{ width: `${((current+1)/quiz.questions.length)*100}%` }}></div></div>
      <div className="card"><h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{q.questionText}</h2></div>
      <div className="space-y-3">
        {q.options?.map((opt, idx) => {
          const selected = answers.find(a => a.questionIndex === current)?.selectedOption === idx;
          return (<button key={idx} onClick={() => selectOption(idx)} className={`w-full text-left p-4 rounded-xl border transition-all ${selected ? 'border-purple-500 bg-purple-50' : 'hover:border-purple-300'}`} style={{ borderColor: selected ? undefined : 'var(--border-color)' }}><span className="font-medium mr-2">{String.fromCharCode(65+idx)}.</span>{opt.text}</button>);
        })}
      </div>
      <button onClick={nextQuestion} className="btn-primary w-full" disabled={!answers.find(a => a.questionIndex === current)}>{current < quiz.questions.length - 1 ? 'Next →' : 'Submit Quiz ✅'}</button>
    </div>
  );
}
