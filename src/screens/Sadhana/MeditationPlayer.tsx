import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { useStore } from '../../lib/store';

interface MeditationInfo {
  id: string;
  name: string;
  duration: number;
  url: string;
}

interface MeditationPlayerProps {
  meditation: MeditationInfo;
  onComplete: () => void;
}

export function MeditationPlayer({ meditation, onComplete }: MeditationPlayerProps) {
  const { addXP, addSession, user } = useStore();
  const [focusTime, setFocusTime] = useState(meditation.duration * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [sessionLogged, setSessionLogged] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hapticEnabled = user?.hapticsEnabled ?? true;
  const totalSeconds = meditation.duration * 60;

  // Manage audio element lifecycle
  useEffect(() => {
    const audio = new Audio(meditation.url);
    audio.loop = true;
    audioRef.current = audio;
    audio.play().catch(() => {/* autoplay may be blocked */});

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [meditation.url]);

  // Sync audio play/pause with timer state
  useEffect(() => {
    if (!audioRef.current) return;
    if (isTimerRunning) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isTimerRunning]);

  // Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime(prev => prev - 1);
      }, 1000);
    } else if (focusTime === 0 && isTimerRunning && !sessionLogged) {
      setIsTimerRunning(false);
      setSessionLogged(true);
      addXP(meditation.duration * 5);
      addSession('meditation', { durationMinutes: meditation.duration, customTypeName: 'Guided Meditation' });
      if (hapticEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, focusTime, addXP, meditation.duration, hapticEnabled, addSession, sessionLogged]);

  const handleEndEarly = () => {
    if (sessionLogged) return;
    setIsTimerRunning(false);
    setSessionLogged(true);
    const elapsedMinutes = Math.ceil((totalSeconds - focusTime) / 60);
    // No XP for ending early — only log partial session
    addSession('meditation', { durationMinutes: elapsedMinutes, customTypeName: 'Guided Meditation' });
    onComplete();
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="mb-8 text-center px-4">
        <p className="text-sm text-orange-500 font-medium mb-1 uppercase tracking-wider">Guided Meditation</p>
        <h2 className="text-2xl font-bold text-white">{meditation.name}</h2>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <motion.div
          animate={{
            scale: isTimerRunning ? [1, 1.05, 1] : 1,
            opacity: isTimerRunning ? [0.5, 0.8, 0.5] : 0.5,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl"
        />
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            className="stroke-slate-800"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            className="stroke-orange-500"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: "0 1000" }}
            animate={{
              strokeDasharray: `${((totalSeconds - focusTime) / totalSeconds) * 754} 1000`
            }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        <div className="text-center z-10">
          <div className="text-5xl font-bold text-white mb-2">
            {formatTime(focusTime)}
          </div>
          <p className="text-slate-400">Remaining</p>
        </div>
      </div>

      {focusTime === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Meditation Complete</h3>
          <p className="text-slate-400 mb-6">+{meditation.duration * 5} XP earned</p>
          <button onClick={onComplete} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
            Return
          </button>
        </motion.div>
      ) : (
        <div className="flex space-x-4">
          <button
            onClick={() => setIsTimerRunning(prev => !prev)}
            className="bg-orange-600 hover:bg-orange-500 text-white rounded-xl px-8 py-3 font-medium transition-colors"
          >
            {isTimerRunning ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={handleEndEarly}
            className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors"
          >
            End Early
          </button>
        </div>
      )}
    </>
  );
}
