import React, { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Zap, Target, BookOpen, BarChart3, Calendar, Filter, Clock, Wind, PlayCircle, FileText, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { format, subDays, isSameDay, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { courseBlueprint, CourseDay, CourseLesson } from '../data/lessons';

export function Progress() {
  const { user, level, nextLevelXP, progressPercentage, course, sessions, customSessionTypes } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'history'>('overview');
  const [historyFilterType, setHistoryFilterType] = useState<string>('all');
  const [historyDateRange, setHistoryDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const [selectedDayData, setSelectedDayData] = useState<CourseDay | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);

  const { last30Days, activityMap, focusData, malaData, todayStats } = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 30 }).map((_, i) => format(subDays(today, 29 - i), 'yyyy-MM-dd'));
    
    const actMap: Record<string, number> = {};
    sessions.forEach(s => {
      const d = format(new Date(s.date), 'yyyy-MM-dd');
      actMap[d] = (actMap[d] || 0) + 1;
    });
    course.forEach(c => {
      if (c.completedAt) {
        const d = format(new Date(c.completedAt), 'yyyy-MM-dd');
        actMap[d] = (actMap[d] || 0) + 1;
      }
    });

    const fData = days.map(dateStr => {
      const mins = sessions
        .filter(s => s.type === 'focus' && format(new Date(s.date), 'yyyy-MM-dd') === dateStr)
        .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
      return { date: format(new Date(dateStr), 'MMM dd'), minutes: mins };
    });

    const mData = days.map(dateStr => {
      const count = sessions
        .filter(s => s.type === 'mala' && format(new Date(s.date), 'yyyy-MM-dd') === dateStr)
        .reduce((acc, s) => acc + (s.count || 0), 0);
      return { date: format(new Date(dateStr), 'MMM dd'), count: count };
    });

    const todaySessions = sessions.filter(s => isSameDay(new Date(s.date), today));
    const tStats = {
      malas: todaySessions.filter(s => s.type === 'mala').reduce((acc, s) => acc + (s.count || 0), 0),
      focusMinutes: todaySessions.filter(s => s.type === 'focus').reduce((acc, s) => acc + (s.durationMinutes || 0), 0),
      breatheSessions: todaySessions.filter(s => s.type === 'breathe').length,
    };

    return { last30Days: days, activityMap: actMap, focusData: fData, malaData: mData, todayStats: tStats };
  }, [sessions, course]);

  const filteredHistory = useMemo(() => {
    let filtered = sessions;
    
    if (historyFilterType !== 'all') {
      filtered = filtered.filter(s => s.type === historyFilterType);
    }

    const today = new Date();
    if (historyDateRange === 'today') {
      filtered = filtered.filter(s => isSameDay(new Date(s.date), today));
    } else if (historyDateRange === 'week') {
      filtered = filtered.filter(s => isWithinInterval(new Date(s.date), { start: startOfWeek(today), end: endOfWeek(today) }));
    } else if (historyDateRange === 'month') {
      filtered = filtered.filter(s => isWithinInterval(new Date(s.date), { start: startOfMonth(today), end: endOfMonth(today) }));
    }

    return filtered;
  }, [sessions, historyFilterType, historyDateRange]);

  if (!user) return null;

  return (
    <div className="p-6 space-y-6 pb-32 h-full overflow-y-auto">
      <header className="pt-8">
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
        <p className="text-slate-400 mt-2">Track your spiritual growth.</p>
      </header>

      <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'insights' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
        >
          Insights
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'history' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
        >
          History
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-sm text-slate-400 uppercase tracking-wider font-medium mb-1">Current Level</p>
                  <h2 className="text-3xl font-bold text-orange-500">{level}</h2>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{user.xp}</p>
                  <p className="text-xs text-slate-500">/ {nextLevelXP} XP</p>
                </div>
              </div>
              
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-xl shadow-black/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:bg-slate-800/60 hover:border-yellow-500/30 transition-all duration-500">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-yellow-500/30 transition-all duration-500" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-yellow-600/20 transition-all duration-500" />
                
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 border border-yellow-500/20 flex items-center justify-center mb-4 text-yellow-500 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-inner">
                  <Zap size={28} strokeWidth={2.5} />
                </div>
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tight mb-1">{user.streak}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Day Streak</span>
              </div>
              <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-xl shadow-black/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:bg-slate-800/60 hover:border-blue-500/30 transition-all duration-500">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/30 transition-all duration-500" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/20 transition-all duration-500" />
                
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-500 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
                  <Target size={28} strokeWidth={2.5} />
                </div>
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tight mb-1">{course.length}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Days Completed</span>
              </div>
            </div>

            {/* Daily Goals */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4">Today's Goals</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Malas</span>
                    <span className="text-slate-400">{todayStats.malas} / {user.dailyGoals?.malas || 1}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${Math.min(100, (todayStats.malas / (user.dailyGoals?.malas || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Focus Time</span>
                    <span className="text-slate-400">{todayStats.focusMinutes} / {user.dailyGoals?.focusMinutes || 10} min</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, (todayStats.focusMinutes / (user.dailyGoals?.focusMinutes || 10)) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Breathe Sessions</span>
                    <span className="text-slate-400">{todayStats.breatheSessions} / {user.dailyGoals?.breatheSessions || 1}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${Math.min(100, (todayStats.breatheSessions / (user.dailyGoals?.breatheSessions || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center mb-6">
                <BookOpen className="text-orange-500 mr-3" size={24} />
                <h2 className="text-xl font-semibold">Hanuman Aarambh Sadhana</h2>
              </div>
              
              <div className="space-y-4">
                {courseBlueprint.map((dayData) => {
                  const day = dayData.day;
                  const isCompleted = course.some(c => c.day === day);
                  const isNext = !isCompleted && (day === 1 || course.some(c => c.day === day - 1));
                  const isLocked = !isCompleted && !isNext;
                  
                  return (
                    <button 
                      key={day}
                      onClick={() => {
                        if (!isLocked) {
                          setSelectedDayData(dayData);
                        }
                      }}
                      className={`w-full flex items-center p-4 rounded-xl border text-left transition-colors ${
                        isCompleted 
                          ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' 
                          : isNext 
                            ? 'bg-orange-900/20 border-orange-500/30 hover:bg-orange-900/30' 
                            : 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 shrink-0 ${
                        isCompleted ? 'bg-green-500/20 text-green-500' : isNext ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {day}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${isCompleted ? 'text-slate-300' : isNext ? 'text-white' : 'text-slate-500'}`}>
                          Day {day}: {dayData.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {isCompleted ? 'Completed' : isNext ? 'Ready to start' : 'Locked'}
                        </p>
                      </div>
                      {!isLocked && <ChevronRight size={18} className="text-slate-600 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Activity Heatmap */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center mb-4">
                <Calendar className="text-orange-500 mr-2" size={20} />
                <h2 className="text-lg font-semibold">Activity Heatmap</h2>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {last30Days.map(date => {
                  const count = activityMap[date] || 0;
                  let bg = 'bg-slate-800';
                  if (count === 1) bg = 'bg-orange-900/50';
                  if (count === 2) bg = 'bg-orange-700/70';
                  if (count >= 3) bg = 'bg-orange-500';
                  
                  return (
                    <div 
                      key={date} 
                      className={`w-6 h-6 rounded-sm ${bg} transition-colors`}
                      title={`${date}: ${count} activities`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between items-center mt-4 text-xs text-slate-500">
                <span>30 Days Ago</span>
                <div className="flex items-center space-x-1">
                  <span className="mr-1">Less</span>
                  <div className="w-3 h-3 rounded-sm bg-slate-800" />
                  <div className="w-3 h-3 rounded-sm bg-orange-900/50" />
                  <div className="w-3 h-3 rounded-sm bg-orange-700/70" />
                  <div className="w-3 h-3 rounded-sm bg-orange-500" />
                  <span className="ml-1">More</span>
                </div>
                <span>Today</span>
              </div>
            </div>

            {/* Focus Time Tracker */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center mb-6">
                <BarChart3 className="text-orange-500 mr-2" size={20} />
                <h2 className="text-lg font-semibold">Focus Time (Last 30 Days)</h2>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={focusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickMargin={10} minTickGap={20} />
                    <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `${val}m`} width={35} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#f97316' }}
                      cursor={{ fill: '#1e293b' }}
                    />
                    <Bar dataKey="minutes" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mala Count History */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center mb-6">
                <Target className="text-orange-500 mr-2" size={20} />
                <h2 className="text-lg font-semibold">Mala Chants (Last 30 Days)</h2>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={malaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickMargin={10} minTickGap={20} />
                    <YAxis stroke="#64748b" fontSize={10} width={35} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#f97316' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} dot={{ fill: '#0f172a', stroke: '#f97316', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#f97316' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 shrink-0">
                <Filter size={14} className="text-slate-400 mr-2" />
                <select 
                  value={historyFilterType}
                  onChange={(e) => setHistoryFilterType(e.target.value)}
                  className="bg-transparent text-sm text-white focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="mala">Mala</option>
                  <option value="focus">Focus</option>
                  <option value="breathe">Breathe</option>
                  <option value="meditation">Guided Meditation</option>
                  {customSessionTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 shrink-0">
                <Calendar size={14} className="text-slate-400 mr-2" />
                <select 
                  value={historyDateRange}
                  onChange={(e) => setHistoryDateRange(e.target.value as any)}
                  className="bg-transparent text-sm text-white focus:outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No sessions found for the selected filters.
                </div>
              ) : (
                filteredHistory.map(session => {
                  let icon = <Target size={16} className="text-orange-500" />;
                  let title = 'Mala Session';
                  let detail = `${session.count} chants`;
                  
                  if (session.type === 'focus') {
                    icon = <Clock size={16} className="text-blue-500" />;
                    title = 'Focus Session';
                    detail = `${session.durationMinutes} min`;
                  } else if (session.type === 'breathe') {
                    icon = <Wind size={16} className="text-teal-500" />;
                    title = 'Breathe Session';
                    detail = 'Completed';
                  } else if (session.type !== 'mala') {
                    const cType = customSessionTypes.find(t => t.id === session.type);
                    title = cType ? cType.name : session.customTypeName || 'Custom Session';
                    detail = session.durationMinutes ? `${session.durationMinutes} min` : 'Completed';
                  }

                  return (
                    <div key={session.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mr-4">
                          {icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-200">{title}</h4>
                          <p className="text-xs text-slate-500">{format(new Date(session.date), 'MMM d, yyyy • h:mm a')}</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-slate-300">
                        {detail}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dedicated Day Screen Overlay */}
      <AnimatePresence>
        {selectedDayData && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-slate-950 overflow-y-auto flex flex-col"
          >
            <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-4 flex items-center">
              <button 
                onClick={() => {
                  setSelectedDayData(null);
                  setSelectedLesson(null);
                }}
                className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft size={24} className="text-slate-300" />
              </button>
              <div>
                <span className="text-xs text-orange-500 font-bold uppercase tracking-wider">Day {selectedDayData.day}</span>
                <h2 className="text-xl font-bold">{selectedDayData.title}</h2>
              </div>
            </div>
            
            <div className="p-6 pb-24 flex-1 max-w-3xl mx-auto w-full">
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Theme of the Day</h3>
                <p className="text-slate-300 leading-relaxed">{selectedDayData.theme}</p>
              </div>

              <h3 className="text-xl font-bold mb-4">Lessons & Practices</h3>
              <div className="space-y-4 mb-8">
                {selectedDayData.lessons.map((lesson, idx) => {
                  const isExpanded = selectedLesson?.id === lesson.id;
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (idx * 0.1), duration: 0.5 }}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
