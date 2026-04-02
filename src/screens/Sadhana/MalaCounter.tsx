import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { AnimatePresence } from 'motion/react';
import { useStore, MantraPreset } from '../../lib/store';

interface MalaCounterProps {
  activePreset: MantraPreset;
  targetCount: number;
  onComplete: () => void;
}

export function MalaCounter({ activePreset, targetCount, onComplete }: MalaCounterProps) {
  const { addXP, addSession, user, chantChallenges, updateChantChallengeProgress } = useStore();
  const [count, setCount] = useState(0);
  const hapticEnabled = user?.hapticsEnabled ?? true;

  const handleTap = () => {
    if (count < targetCount) {
      setCount(prev => prev + 1);
      if (hapticEnabled && navigator.vibrate) navigator.vibrate(50);

      if (count + 1 === targetCount) {
        addXP(targetCount * 2);
        addSession('mala', { count: targetCount });

        // Update challenges
        chantChallenges.filter(c => !c.completed).forEach(c => {
          updateChantChallengeProgress(c.id, targetCount);
        });

        if (hapticEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
    }
  };

  const resetMala = () => {
    setCount(0);
  };

  return (
    <>
      <div className="mb-8 text-center px-4">
        <p className="text-sm text-orange-500 font-medium mb-1 uppercase tracking-wider">{activePreset?.name}</p>
        <p className="text-xl md:text-2xl font-serif text-slate-200 italic">"{activePreset?.mantra}"</p>
      </div>

      <motion.div
        className="w-64 h-64 relative mb-8"
        onClick={handleTap}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <CircularProgressbar
          value={(count / targetCount) * 100}
          strokeWidth={4}
          styles={buildStyles({
            pathColor: '#f97316',
            trailColor: '#1e293b',
            strokeLinecap: 'round',
          })}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
          <span className="text-6xl font-bold text-white">{count}</span>
          <span className="text-slate-400 mt-2">/ {targetCount}</span>
        </div>
        <div className="absolute inset-0 rounded-full active:bg-orange-500/10 transition-colors duration-75" />

        {/* Bead Ripple Animation */}
        <AnimatePresence>
          {count > 0 && count < targetCount && (
            <motion.div
              key={count}
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-4 border-orange-500 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {count >= targetCount ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Sadhana Complete</h3>
          <p className="text-slate-400 mb-6">+{targetCount * 2} XP earned</p>
          <button onClick={() => { resetMala(); onComplete(); }} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
            Return
          </button>
        </motion.div>
      ) : (
        <p className="text-slate-500 animate-pulse">Tap the circle to count</p>
      )}
    </>
  );
}
