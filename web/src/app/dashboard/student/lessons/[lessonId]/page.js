'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function LessonDetailPage() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/lessons/${lessonId}`);
        setLesson(res.data.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchLesson();
  }, [lessonId]);

  const handleComplete = async () => {
    try {
      const res = await api.post(`/lessons/${lessonId}/complete`);
      alert(`Lesson completed! +${res.data.xpEarned} XP earned!`);
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 rounded" style={{ background: 'var(--bg-secondary)' }}></div><div className="h-64 rounded" style={{ background: 'var(--bg-secondary)' }}></div></div>;
  if (!lesson) return <p>Lesson not found</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <Link href="/dashboard/student/lessons" className="text-sm text-purple-500 hover:underline">← Back to Lessons</Link>
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full capitalize">{lesson.subject}</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Class {lesson.grade}</span>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full capitalize">{lesson.difficulty}</span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{lesson.title}</h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{lesson.description}</p>
      </div>
      {lesson.content?.videoUrl && (
        <div className="card"><video src={lesson.content.videoUrl} controls className="w-full rounded-lg"></video></div>
      )}
      {lesson.content?.textContent && (
        <div className="card prose max-w-none"><div dangerouslySetInnerHTML={{ __html: lesson.content.textContent }}></div></div>
      )}
      <div className="flex gap-3">
        <button onClick={handleComplete} className="btn-primary flex items-center gap-2">✅ Mark as Completed (+{lesson.xpReward} XP)</button>
        <Link href={`/dashboard/student/doubts/ask?lessonId=${lessonId}`} className="btn-secondary">❓ Ask a Doubt</Link>
      </div>
    </div>
  );
}
