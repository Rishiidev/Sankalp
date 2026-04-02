import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { Flame, Calendar, Award, BookOpen, CheckCircle2, Bell, PlayCircle, FileText, ChevronRight, X, Quote, Wind, Edit3, PartyPopper, Heart, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { courseBlueprint, CourseDay, CourseLesson } from '../data/lessons';
import { DAILY_QUOTES } from '../data/quotes';

export function Home() {
  const { user, level, course, completeCourseDay, addSession, addXP, toggleFavoriteQuote } = useStore();
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Request notification permission on first load if not granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const scheduleReminder = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Hanuman Sadhana', {
        body: 'Time for your daily sadhana. Keep your streak alive!',
        icon: '/pwa-192x192.png'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Hanuman Sadhana', {
            body: 'Reminders enabled. Time for your daily sadhana!',
            icon: '/pwa-192x192.png'
          });
        }
      });
    }
  };

  const { greeting, dailyQuote } = useMemo(() => {
    const hour = new Date().getHours();
    let greet = 'Good evening';
    if (hour < 12) greet = 'Good morning';
    else if (hour < 18) greet = 'Good afternoon';

    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const quote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

    return { greeting: greet, dailyQuote: quote };
  }, []);

  if (!user) return null;

  const isFavorite = user.favoriteQuotes?.some(q => q.text === dailyQuote.text) || false;

  const handleShareQuote = async () => {
    const shareText = `"${dailyQuote.text}" — ${dailyQuote.source}\n\nVia Hanuman Sadhana App`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Inspiration',
          text: shareText,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setToastMessage('Quote copied to clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Find current day based on completed course days
  const currentDayNum = Math.min(course.length + 1, courseBlueprint.length);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(currentDayNum);

  useEffect(() => {
    setSelectedDayNum(currentDayNum);
  }, [currentDayNum]);

  const displayDayData = courseBlueprint.find(d => d.day === selectedDayNum) || courseBlueprint[courseBlueprint.length - 1];
  
  const isDisplayDayCompleted = course.some(c => c.day === selectedDayNum);
  const isDisplayDayLocked = selectedDayNum > currentDayNum;

  const isTodayCompleted = course.some(c => {
    if (c.day !== currentDayNum) return false;
    // Check if completed today
    const completedDate = new Date(c.completedAt).toDateString();
    const today = new Date().toDateString();
    return completedDate === today;
  });

  const courseProgressPercent = (course.length / courseBlueprint.length) * 100;
  const isCourseFullyCompleted = course.length >= courseBlueprint.length;

  const handleQuickAction = async (type: string, data: any, message: string) => {
    await addSession(type, data);
    await addXP(10);
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="p-6 space-y-8 pb-32 h-full overflow-y-auto relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-medium flex items-center"
          >
            <CheckCircle2 size={20} className="mr-2" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="pt-8 flex justify-between items-start">
        <div>
          <motion.p 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-orange-500 font-medium tracking-wide text-sm mb-1 uppercase"
          >
            Jai Shri Ram
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight text-white"
          >
            {greeting}, <br/><span className="text-slate-300">{user.name}</span>.
          </motion.h1>
        </div>
        <button onClick={scheduleReminder} className="p-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full text-slate-400 hover:text-orange-500 hover:bg-slate-800 transition-all shadow-lg">
          <Bell size={20} />
        </button>
      </header>

      {/* Daily Inspiration */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-r from-slate-900 to-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden"
      >
        <Quote className="absolute top-4 right-4 text-slate-800/50 rotate-180" size={48} />
        <p className="text-slate-300 text-sm leading-relaxed italic relative z-10 mb-4">
          "{dailyQuote.text}"
        </p>
        <div className="flex items-center justify-between relative z-10">
          <p className="text-xs text-orange-500/80 font-semibold tracking-wider uppercase">
            — {dailyQuote.source}
          </p>
          <div className="flex space-x-3">
            <button 
              onClick={() => toggleFavoriteQuote(dailyQuote)}
              className={`p-2 rounded-full transition-colors ${isFavorite ? 'bg-orange-500/20 text-orange-500' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}
            >
              <Heart size={16} className={isFavorite ? 'fill-orange-500' : ''} />
            </button>
            <button 
              onClick={handleShareQuote}
              className="p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-orange-900/20 border border-orange-500/30 rounded-3xl p-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
        <p className="text-xs text-orange-400 uppercase tracking-wider font-bold mb-2 relative z-10">Your Sankalp</p>
        <p className="text-lg font-medium text-slate-100 italic relative z-10 leading-relaxed">"{user.sankalp}"</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          key={`streak-${user.streak}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative overflow-hidden bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:bg-slate-800/50 transition-colors"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-orange-500/20" />
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-3 text-orange-500 group-hover:scale-110 transition-transform">
            <Flame size={24} />
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">{user.streak}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Day Streak</span>
        </motion.div>

        <motion.div 
          key={`level-${level}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative overflow-hidden bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:bg-slate-800/50 transition-colors"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20" />
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 text-blue-500 group-hover:scale-110 transition-transform">
            <Award size={24} />
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">{level}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Current Level</span>
        </motion.div>
      </div>

      {/* Course Progress or Celebration */}
      {isCourseFullyCompleted ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-900/40 to-slate-950 border border-orange-500/30 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
          
          <div className="flex items-center justify-center mb-6 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.5)]">
              <PartyPopper size={32} className="text-white" />
            </div>
          </div>
          
          <div className="text-center relative z-10 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Aarambh Sadhana Complete!</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              You have successfully completed the 7-day foundational course. Your dedication is inspiring. 
              The journey doesn't end here; it has just begun.
            </p>
          </div>

          <div className="relative z-10">
            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-4 text-center">Daily Maintenance Practices</h3>
            <div className="space-y-3">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mr-4 text-orange-500">
                  <PlayCircle size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">108 Ram Naam Japa</h4>
                  <p className="text-xs text-slate-400">Daily chanting practice</p>
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4 text-blue-500">
                  <Wind size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">5-Min Silent Focus</h4>
                  <p className="text-xs text-slate-400">Center your mind</p>
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-4 text-purple-500">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Read 1 Chapter</h4>
                  <p className="text-xs text-slate-400">Ramayana or Gita</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
          
          {/* Mini Progress Bar */}
          <div className="mb-6 relative z-10">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Course Progress</span>
              <span className="text-xs text-orange-500 font-bold">{course.length} / {courseBlueprint.length} Days</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${courseProgressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center mb-6 relative z-10 pt-2 border-t border-slate-800/50">
            <div className="flex space-x-2 overflow-x-auto pb-4 w-full hide-scrollbar">
              {courseBlueprint.map((d) => {
                const isCompleted = course.some(c => c.day === d.day);
                const isCurrent = d.day === currentDayNum;
                const isLocked = d.day > currentDayNum;
                const isSelected = d.day === selectedDayNum;

                return (
                  <button
                    key={d.day}
                    onClick={() => setSelectedDayNum(d.day)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all ${
                      isSelected 
                        ? 'bg-orange-500/20 border-orange-500 text-orange-400' 
                        : isLocked
                          ? 'bg-slate-900/50 border-slate-800 text-slate-600'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider mb-1">Day</span>
                    <span className="text-xl font-bold">{d.day}</span>
                    {isCompleted && <CheckCircle2 size={12} className="text-green-500 mt-1" />}
                    {isCurrent && !isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center mb-2 relative z-10">
            <div className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mr-3">
              Day {displayDayData.day}
            </div>
            <h2 className="text-xl font-bold">{displayDayData.title}</h2>
          </div>
          <p className="text-slate-400 text-sm mb-6 relative z-10">{displayDayData.theme}</p>
          
          <div className="space-y-4 mb-8 relative z-10">
            {displayDayData.lessons.map((lesson, idx) => {
              const isExpanded = selectedLesson?.id === lesson.id;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (idx * 0.1), duration: 0.5 }}
                  key={lesson.id} 
                  className={`bg-slate-900/80 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-500 ${isExpanded ? 'border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.15)]' : 'border-slate-800 hover:border-slate-700'}`}
                >
                  <button
                    onClick={() => setSelectedLesson(isExpanded ? null : lesson)}
                    className={`w-full p-5 flex items-center justify-between text-left transition-colors ${isExpanded ? 'bg-orange-500/5' : 'hover:bg-slate-800/50'}`}
                  >
                    <div className="flex items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0 transition-all duration-300 ${isExpanded ? 'bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-slate-800'}`}>
                        {lesson.format === 'practice' ? (
                          <PlayCircle size={20} className={isExpanded ? 'text-orange-400' : 'text-slate-400'} />
                        ) : (
                          <FileText size={20} className={isExpanded ? 'text-orange-400' : 'text-slate-400'} />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-semibold text-lg transition-colors ${isExpanded ? 'text-orange-400' : 'text-slate-200'}`}>
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1 flex items-center font-medium">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${lesson.format === 'practice' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                          {lesson.format === 'practice' ? 'Guided Practice' : 'Reading'} <span className="mx-2 opacity-50">•</span> {lesson.duration}
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.3, type: "spring" }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-orange-500/10' : 'bg-slate-800/50'}`}
                    >
                      <ChevronRight size={18} className={isExpanded ? 'text-orange-500' : 'text-slate-400'} />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="border-t border-orange-500/20"
                      >
                        <div className="p-6 bg-gradient-to-b from-orange-500/5 to-transparent">
                          <div className="bg-slate-950/50 rounded-xl p-4 mb-6 border border-slate-800/50">
                            <p className="text-orange-200/80 text-sm italic leading-relaxed">
                              {lesson.description}
                            </p>
                          </div>
                          <div className="prose prose-invert prose-orange max-w-none">
                            <p className="text-slate-300 leading-loose whitespace-pre-wrap text-base font-medium tracking-wide">
                              {lesson.content}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {!isDisplayDayCompleted && !isDisplayDayLocked ? (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => completeCourseDay(displayDayData.day)}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl py-5 font-bold transition-all relative z-10 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] border border-orange-400/30 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
              <CheckCircle2 className="mr-3 relative z-10" size={24} />
              <span className="text-lg relative z-10 tracking-wide">Complete Day {displayDayData.day}</span>
            </motion.button>
          ) : isDisplayDayCompleted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 text-green-400 rounded-2xl py-5 font-bold flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
            >
              <CheckCircle2 className="mr-3" size={24} />
              <span className="text-lg tracking-wide">Day {displayDayData.day} Completed</span>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-slate-800/50 border border-slate-700/50 text-slate-500 rounded-2xl py-5 font-bold flex items-center justify-center relative z-10"
            >
              <span className="text-lg tracking-wide">Complete previous days to unlock</span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Modals removed in favor of inline expansion */}
    </div>
  );
}

