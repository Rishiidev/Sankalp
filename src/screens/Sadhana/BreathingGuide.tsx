import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { useStore } from '../../lib/store';

type BreathPhaseType = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  phases: { phase: BreathPhaseType; duration: number; instruction: string }[];
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing (4-4-4-4)',
    description: 'Balances energy, calms the nervous system.',
    phases: [
      { phase: 'inhale', duration: 4, instruction: 'Inhale' },
      { phase: 'hold1', duration: 4, instruction: 'Hold' },
      { phase: 'exhale', duration: 4, instruction: 'Exhale' },
      { phase: 'hold2', duration: 4, instruction: 'Hold' }
    ]
  },
  {
    id: 'relax',
    name: 'Relaxing (4-7-8)',
    description: 'Promotes deep relaxation and sleep.',
    phases: [
      { phase: 'inhale', duration: 4, instruction: 'Inhale' },
      { phase: 'hold1', duration: 7, instruction: 'Hold' },
      { phase: 'exhale', duration: 8, instruction: 'Exhale' }
    ]
  },
  {
    id: 'equal',
    name: 'Equal Breathing (5-5)',
    description: 'Improves focus and reduces stress.',
    phases: [
      { phase: 'inhale', duration: 5, instruction: 'Inhale' },
      { phase: 'exhale', duration: 5, instruction: 'Exhale' }
    ]
  }
];

interface BreathingGuideProps {
  patternId: string;
  targetCycles: number;
  onComplete: () => void;
}

export function BreathingGuide({ patternId, targetCycles, onComplete }: BreathingGuideProps) {
  const { addXP, addSession, user } = useStore();
  const hapticEnabled = user?.hapticsEnabled ?? true;

  const activePattern = BREATHING_PATTERNS.find(p => p.id === patternId) || BREATHING_PATTERNS[0];

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [breathPhaseTime, setBreathPhaseTime] = useState(activePattern.phases[0].duration);
  const [breatheCycles, setBreatheCycles] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const activePhase = activePattern.phases[currentPhaseIndex] || activePattern.phases[0];

  // Fix: use refs to avoid stale closure in setInterval
  const phaseIndexRef = React.useRef(currentPhaseIndex);
  phaseIndexRef.current = currentPhaseIndex;
  const cyclesRef = React.useRef(breatheCycles);
  cyclesRef.current = breatheCycles;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && breatheCycles < targetCycles) {
      interval = setInterval(() => {
        setBreathPhaseTime(prev => {
          if (prev <= 1) {
            if (hapticEnabled && navigator.vibrate) navigator.vibrate(30);

            const nextIdx = (phaseIndexRef.current + 1) % activePattern.phases.length;
            setCurrentPhaseIndex(nextIdx);
            if (nextIdx === 0) {
              setBreatheCycles(c => c + 1);
            }
            return activePattern.phases[nextIdx].duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (breatheCycles >= targetCycles && isTimerRunning) {
      setIsTimerRunning(false);
      addXP(20);
      addSession('breathe', { count: targetCycles });
      if (hapticEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, breatheCycles, targetCycles, activePattern, addXP, hapticEnabled, addSession]);

  return (
    <>
      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        <motion.div
          className="absolute inset-0 rounded-full bg-orange-500/20 border-2 border-orange-500/50"
          animate={{
            scale: activePhase.phase === 'inhale' || activePhase.phase === 'hold1' ? 1.5 : 1
          }}
          transition={{
            duration: activePhase.duration,
            ease: "easeInOut"
          }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <h3 className="text-3xl font-bold text-orange-500 mb-2">{activePhase.instruction}</h3>
          <span className="text-4xl font-mono text-white">{breathPhaseTime}</span>
        </div>
      </div>

      {breatheCycles >= targetCycles ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Session Complete</h3>
          <p className="text-slate-400 mb-6">+20 XP earned</p>
          <button onClick={onComplete} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
            Return
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center space-y-6">
          <p className="text-slate-400">Cycle {breatheCycles + 1} of {targetCycles}</p>
          <div className="flex space-x-4">
            <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="bg-orange-600 hover:bg-orange-500 text-white rounded-xl px-8 py-3 font-medium transition-colors">
              {isTimerRunning ? 'Pause' : 'Resume'}
            </button>
            <button onClick={() => { setIsTimerRunning(false); onComplete(); }} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
              End
            </button>
          </div>
        </div>
      )}
    </>
  );
}
