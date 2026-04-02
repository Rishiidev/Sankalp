import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { useStore } from '../../lib/store';

interface FocusTimerProps {
  durationMinutes: number;
  onComplete: () => void;
}

export function FocusTimer({ durationMinutes, onComplete }: FocusTimerProps) {
  const { addXP, addSession, user } = useStore();
  const [focusTime, setFocusTime] = useState(durationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const hapticEnabled = user?.hapticsEnabled ?? true;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime(prev => prev - 1);
      }, 1000);
    } else if (focusTime === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      addXP(durationMinutes * 10); // Fix: uses prop durationMinutes, always correct
      addSession('focus', { durationMinutes });
      if (hapticEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, focusTime, addXP, durationMinutes, hapticEnabled, addSession]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="w-48 h-48 rounded-full border-4 border-orange-500/30 flex items-center justify-center relative overflow-hidden mb-12">
        <div className={`absolute inset-0 bg-orange-500/10 ${isTimerRunning ? 'animate-pulse' : ''}`} />
        <div className="relative z-10 text-4xl font-bold font-mono text-orange-500">
          {formatTime(focusTime)}
        </div>
      </div>

      {focusTime === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Session Complete</h3>
          <p className="text-slate-400 mb-6">+{durationMinutes * 10} XP earned</p>
          <button onClick={onComplete} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
            Return
          </button>
        </motion.div>
      ) : (
        <div className="flex space-x-4">
          <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="bg-orange-600 hover:bg-orange-500 text-white rounded-xl px-8 py-3 font-medium transition-colors">
            {isTimerRunning ? 'Pause' : 'Resume'}
          </button>
          <button onClick={() => { setIsTimerRunning(false); onComplete(); }} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
            End
          </button>
        </div>
      )}
    </>
  );
}
