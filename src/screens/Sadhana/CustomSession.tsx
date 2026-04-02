import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { useStore } from '../../lib/store';

interface CustomSessionProps {
  typeId: string;
  typeName: string;
  durationMinutes: number;
  onComplete: () => void;
}

export function CustomSession({ typeId, typeName, durationMinutes, onComplete }: CustomSessionProps) {
  const { addXP, addSession, user } = useStore();
  const [focusTime, setFocusTime] = useState(durationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const hapticEnabled = user?.hapticsEnabled ?? true;
  const totalSeconds = durationMinutes * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime(prev => prev - 1);
      }, 1000);
    } else if (focusTime === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      addXP(durationMinutes * 10);
      addSession(typeId, { durationMinutes, customTypeName: typeName });
      if (hapticEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, focusTime, addXP, durationMinutes, hapticEnabled, addSession, typeId, typeName]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="mb-8 text-center px-4">
        <p className="text-sm text-orange-500 font-medium mb-1 uppercase tracking-wider">Custom Session</p>
        <h2 className="text-2xl font-bold text-white">{typeName}</h2>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
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
