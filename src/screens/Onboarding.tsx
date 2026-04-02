import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Flame } from 'lucide-react';

export function Onboarding() {
  const { updateUser } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [sankalp, setSankalp] = useState('');

  const handleNext = () => {
    if (step === 0 && name.trim()) setStep(1);
    else if (step === 1 && sankalp.trim()) setStep(2);
    else if (step === 2) {
      updateUser({ name, sankalp, onboardingCompleted: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm space-y-8 text-center z-10"
          >
            <div className="flex justify-center mb-8">
              <Flame size={48} className="text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, Seeker.</h1>
            <p className="text-slate-400">By what name shall we call you on this journey?</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:border-orange-500 transition-colors"
              autoFocus
            />
            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl py-3 font-medium transition-colors"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm space-y-8 text-center z-10"
          >
            <h1 className="text-3xl font-bold tracking-tight">Your Sankalp</h1>
            <p className="text-slate-400">What is your intention for this sadhana? (e.g., Inner peace, discipline, strength)</p>
            <textarea
              value={sankalp}
              onChange={(e) => setSankalp(e.target.value)}
              placeholder="I commit to..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:border-orange-500 transition-colors min-h-[120px] resize-none"
              autoFocus
            />
            <button
              onClick={handleNext}
              disabled={!sankalp.trim()}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl py-3 font-medium transition-colors"
            >
              Set Intention
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-sm space-y-8 text-center z-10"
          >
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur-xl opacity-50 rounded-full animate-pulse" />
                <Flame size={64} className="text-orange-500 relative z-10" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Your Journey Begins</h1>
            <p className="text-slate-400">May Hanuman grant you the strength to fulfill your sankalp, {name}.</p>
            <button
              onClick={handleNext}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-xl py-3 font-medium transition-colors mt-8"
            >
              Begin Sadhana
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
