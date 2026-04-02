import React, { useState } from 'react';
import { StoreProvider, useStore } from './lib/store';
import { Layout } from './components/Layout';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Sadhana } from './screens/Sadhana';
import { Progress } from './screens/Progress';
import { Profile } from './screens/Profile';
import { HanumanChalisa } from './screens/HanumanChalisa';
import { AnimatePresence, motion } from 'motion/react';

function AppContent() {
  const { user, loading } = useStore();
  const [currentTab, setCurrentTab] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user?.onboardingCompleted) {
    return <Onboarding />;
  }

  return (
    <Layout currentTab={currentTab} setTab={setCurrentTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {currentTab === 'home' && <Home />}
          {currentTab === 'sadhana' && <Sadhana onOpenChalisa={() => setCurrentTab('chalisa')} />}
          {currentTab === 'progress' && <Progress />}
          {currentTab === 'profile' && <Profile />}
          {currentTab === 'chalisa' && <HanumanChalisa onBack={() => setCurrentTab('sadhana')} />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
