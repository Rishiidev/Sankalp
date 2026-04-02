import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUser, saveUser, getJournalEntries, saveJournalEntry, getCourseProgress, saveCourseProgress, getSessions, saveSession, getCustomAudio, saveCustomAudio, deleteCustomAudio, getMantraPresets, saveMantraPreset, deleteMantraPreset, getCustomSessionTypes, saveCustomSessionType, deleteCustomSessionType, getChantChallenges, saveChantChallenge, deleteChantChallenge, getCustomMeditations, saveCustomMeditation, deleteCustomMeditation } from './db';
import { differenceInDays, startOfDay } from 'date-fns';

export type UserLevel = 'Balak' | 'Sevak' | 'Veer' | 'Bhakt' | 'Mahaveer';

export interface UserData {
  id: string;
  name: string;
  sankalp: string;
  xp: number;
  streak: number;
  lastActiveDate: string;
  createdAt: string;
  onboardingCompleted: boolean;
  theme?: 'midnight' | 'dawn' | 'temple';
  hapticsEnabled?: boolean;
  dailyGoals?: {
    malas?: number;
    focusMinutes?: number;
    breatheSessions?: number;
  };
  favoriteQuotes?: { text: string; source: string }[];
}

export interface CustomTrack {
  id: string;
  name: string;
  url: string;
}

export interface MantraPreset {
  id: string;
  name: string;
  mantra: string;
  target: number;
}

export interface CustomSessionType {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface ChantChallenge {
  id: string;
  name: string;
  target: number;
  progress: number;
  deadline?: string;
  completed: boolean;
  completedAt?: string;
}

export interface CustomMeditation {
  id: string;
  name: string;
  duration: number;
  url: string;
}

interface StoreContextType {
  user: UserData | null;
  loading: boolean;
  updateUser: (data: Partial<UserData>) => Promise<void>;
  toggleFavoriteQuote: (quote: { text: string; source: string }) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  level: UserLevel;
  nextLevelXP: number;
  progressPercentage: number;
  journal: any[];
  addJournalEntry: (text: string, mood?: string) => Promise<void>;
  course: any[];
  completeCourseDay: (day: number) => Promise<void>;
  sessions: any[];
  addSession: (type: string, data: { count?: number; durationMinutes?: number; customTypeName?: string }) => Promise<void>;
  customTracks: CustomTrack[];
  addCustomTrack: (name: string, blob: Blob) => Promise<void>;
  removeCustomTrack: (id: string) => Promise<void>;
  mantraPresets: MantraPreset[];
  addMantraPreset: (preset: Omit<MantraPreset, 'id'>) => Promise<void>;
  editMantraPreset: (id: string, preset: Partial<MantraPreset>) => Promise<void>;
  removeMantraPreset: (id: string) => Promise<void>;
  customSessionTypes: CustomSessionType[];
  addCustomSessionType: (type: Omit<CustomSessionType, 'id'>) => Promise<void>;
  editCustomSessionType: (id: string, type: Partial<CustomSessionType>) => Promise<void>;
  removeCustomSessionType: (id: string) => Promise<void>;
  chantChallenges: ChantChallenge[];
  addChantChallenge: (challenge: Omit<ChantChallenge, 'id' | 'progress' | 'completed'>) => Promise<void>;
  updateChantChallengeProgress: (id: string, amount: number) => Promise<void>;
  editChantChallengeProgress: (id: string, newProgress: number) => Promise<void>;
  editChantChallengeDeadline: (id: string, newDeadline: string) => Promise<void>;
  removeChantChallenge: (id: string) => Promise<void>;
  customMeditations: CustomMeditation[];
  addCustomMeditation: (name: string, duration: number, blob: Blob) => Promise<void>;
  removeCustomMeditation: (id: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function getLevelInfo(xp: number): { level: UserLevel; nextXP: number; progress: number } {
  if (xp < 100) return { level: 'Balak', nextXP: 100, progress: (xp / 100) * 100 };
  if (xp < 300) return { level: 'Sevak', nextXP: 300, progress: ((xp - 100) / 200) * 100 };
  if (xp < 600) return { level: 'Veer', nextXP: 600, progress: ((xp - 300) / 300) * 100 };
  if (xp < 1000) return { level: 'Bhakt', nextXP: 1000, progress: ((xp - 600) / 400) * 100 };
  return { level: 'Mahaveer', nextXP: 1000, progress: 100 };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [journal, setJournal] = useState<any[]>([]);
  const [course, setCourse] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [customTracks, setCustomTracks] = useState<CustomTrack[]>([]);
  const [mantraPresets, setMantraPresets] = useState<MantraPreset[]>([]);
  const [customSessionTypes, setCustomSessionTypes] = useState<CustomSessionType[]>([]);
  const [chantChallenges, setChantChallenges] = useState<ChantChallenge[]>([]);
  const [customMeditations, setCustomMeditations] = useState<CustomMeditation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const userData = await getUser();
      if (userData) {
        // Check streak
        const today = startOfDay(new Date());
        const lastActive = startOfDay(new Date(userData.lastActiveDate));
        const diff = differenceInDays(today, lastActive);
        
        let newStreak = userData.streak;
        if (diff === 1) {
          // Streak continues, but we don't increment until they do a task today
        } else if (diff > 1) {
          newStreak = 0; // Streak broken
        }

        const updatedUser = { ...userData, streak: newStreak, lastActiveDate: new Date().toISOString(), createdAt: userData.createdAt || userData.lastActiveDate };
        if (diff > 0) {
          await saveUser(updatedUser);
        }
        setUser(updatedUser);
        if (updatedUser.theme) {
          document.documentElement.className = updatedUser.theme === 'midnight' ? '' : `theme-${updatedUser.theme}`;
        }
      } else {
        const newUser: UserData = {
          id: 'main',
          name: '',
          sankalp: '',
          xp: 0,
          streak: 0,
          lastActiveDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          onboardingCompleted: false,
          theme: 'midnight',
          hapticsEnabled: true,
          dailyGoals: {
            malas: 1,
            focusMinutes: 10,
            breatheSessions: 1,
          }
        };
        await saveUser(newUser);
        setUser(newUser);
      }

      const journalData = await getJournalEntries();
      setJournal(journalData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      const courseData = await getCourseProgress();
      setCourse(courseData);

      const sessionsData = await getSessions();
      setSessions(sessionsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      const customAudioData = await getCustomAudio();
      setCustomTracks(customAudioData.map(a => ({
        id: a.id,
        name: a.name,
        url: URL.createObjectURL(a.blob)
      })));

      const presetsData = await getMantraPresets();
      if (presetsData.length === 0) {
        const defaultPreset = {
          id: 'default',
          name: 'Hanuman Chalisa / Ram Naam',
          mantra: 'Sri Ram Jai Ram Jai Jai Ram',
          target: 108
        };
        await saveMantraPreset(defaultPreset);
        setMantraPresets([defaultPreset]);
      } else {
        setMantraPresets(presetsData);
      }

      const customTypesData = await getCustomSessionTypes();
      setCustomSessionTypes(customTypesData);

      const challengesData = await getChantChallenges();
      setChantChallenges(challengesData);

      const customMeditationsData = await getCustomMeditations();
      setCustomMeditations(customMeditationsData.map(m => ({
        id: m.id,
        name: m.name,
        duration: m.duration,
        url: URL.createObjectURL(m.blob)
      })));

      setLoading(false);
    }
    loadData();
  }, []);

  const updateUser = async (data: Partial<UserData>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    await saveUser(updated);
    setUser(updated);
    if (data.theme) {
      document.documentElement.className = data.theme === 'midnight' ? '' : `theme-${data.theme}`;
    }
  };

  const toggleFavoriteQuote = async (quote: { text: string; source: string }) => {
    if (!user) return;
    const currentFavorites = user.favoriteQuotes || [];
    const isFavorite = currentFavorites.some(q => q.text === quote.text);
    
    let newFavorites;
    if (isFavorite) {
      newFavorites = currentFavorites.filter(q => q.text !== quote.text);
    } else {
      newFavorites = [...currentFavorites, quote];
    }
    
    await updateUser({ favoriteQuotes: newFavorites });
  };

  const addXP = async (amount: number) => {
    if (!user) return;
    const today = startOfDay(new Date());
    const lastActive = startOfDay(new Date(user.lastActiveDate));
    const diff = differenceInDays(today, lastActive);
    
    let newStreak = user.streak;
    if (diff > 0) {
      newStreak += 1;
    } else if (newStreak === 0) {
      newStreak = 1;
    }

    const updated = { 
      ...user, 
      xp: user.xp + amount, 
      streak: newStreak,
      lastActiveDate: new Date().toISOString() 
    };
    await saveUser(updated);
    setUser(updated);
  };

  const addJournalEntry = async (text: string, mood?: string) => {
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      text,
      mood,
    };
    await saveJournalEntry(entry);
    setJournal([entry, ...journal]);
  };

  const completeCourseDay = async (day: number) => {
    await saveCourseProgress(day, true);
    setCourse([...course.filter(c => c.day !== day), { day, completed: true, completedAt: new Date().toISOString() }]);
    await addXP(100); // 100 XP for completing daily lesson
  };

  const addSession = async (type: string, data: { count?: number; durationMinutes?: number; customTypeName?: string }) => {
    const session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type,
      ...data
    };
    await saveSession(session);
    setSessions([session, ...sessions]);
  };

  const addCustomTrack = async (name: string, blob: Blob) => {
    const id = `custom_${Date.now()}`;
    await saveCustomAudio({ id, name, blob });
    setCustomTracks([...customTracks, { id, name, url: URL.createObjectURL(blob) }]);
  };

  const removeCustomTrack = async (id: string) => {
    const track = customTracks.find(t => t.id === id);
    if (track) URL.revokeObjectURL(track.url);
    await deleteCustomAudio(id);
    setCustomTracks(customTracks.filter(t => t.id !== id));
  };

  const addMantraPreset = async (preset: Omit<MantraPreset, 'id'>) => {
    const newPreset = { ...preset, id: `preset_${Date.now()}` };
    await saveMantraPreset(newPreset);
    setMantraPresets([...mantraPresets, newPreset]);
  };

  const editMantraPreset = async (id: string, preset: Partial<MantraPreset>) => {
    const existing = mantraPresets.find(p => p.id === id);
    if (!existing) return;
    const updated = { ...existing, ...preset };
    await saveMantraPreset(updated);
    setMantraPresets(mantraPresets.map(p => p.id === id ? updated : p));
  };

  const removeMantraPreset = async (id: string) => {
    await deleteMantraPreset(id);
    setMantraPresets(mantraPresets.filter(p => p.id !== id));
  };

  const addCustomSessionType = async (type: Omit<CustomSessionType, 'id'>) => {
    const newType = { ...type, id: `custom_type_${Date.now()}` };
    await saveCustomSessionType(newType);
    setCustomSessionTypes([...customSessionTypes, newType]);
  };

  const editCustomSessionType = async (id: string, type: Partial<CustomSessionType>) => {
    const existing = customSessionTypes.find(t => t.id === id);
    if (!existing) return;
    const updated = { ...existing, ...type };
    await saveCustomSessionType(updated);
    setCustomSessionTypes(customSessionTypes.map(t => t.id === id ? updated : t));
  };

  const removeCustomSessionType = async (id: string) => {
    await deleteCustomSessionType(id);
    setCustomSessionTypes(customSessionTypes.filter(t => t.id !== id));
  };

  const addChantChallenge = async (challenge: Omit<ChantChallenge, 'id' | 'progress' | 'completed'>) => {
    const newChallenge = { ...challenge, id: `challenge_${Date.now()}`, progress: 0, completed: false };
    await saveChantChallenge(newChallenge);
    setChantChallenges([...chantChallenges, newChallenge]);
  };

  const updateChantChallengeProgress = async (id: string, amount: number) => {
    const challenge = chantChallenges.find(c => c.id === id);
    if (!challenge) return;

    const newProgress = Math.min(challenge.target, challenge.progress + amount);
    const completed = newProgress >= challenge.target;
    const updatedChallenge = { 
      ...challenge, 
      progress: newProgress, 
      completed,
      completedAt: completed && !challenge.completed ? new Date().toISOString() : challenge.completedAt
    };

    await saveChantChallenge(updatedChallenge);
    setChantChallenges(chantChallenges.map(c => c.id === id ? updatedChallenge : c));
    
    if (completed && !challenge.completed) {
      await addXP(500);
    }
  };

  const editChantChallengeProgress = async (id: string, newProgress: number) => {
    const challenge = chantChallenges.find(c => c.id === id);
    if (!challenge) return;

    const validProgress = Math.max(0, Math.min(challenge.target, newProgress));
    const completed = validProgress >= challenge.target;
    const updatedChallenge = { 
      ...challenge, 
      progress: validProgress, 
      completed,
      completedAt: completed && !challenge.completed ? new Date().toISOString() : challenge.completedAt
    };

    await saveChantChallenge(updatedChallenge);
    setChantChallenges(chantChallenges.map(c => c.id === id ? updatedChallenge : c));
    
    if (completed && !challenge.completed) {
      await addXP(500);
    }
  };

  const editChantChallengeDeadline = async (id: string, newDeadline: string) => {
    const challenge = chantChallenges.find(c => c.id === id);
    if (!challenge) return;

    const updatedChallenge = { 
      ...challenge, 
      deadline: newDeadline || undefined
    };

    await saveChantChallenge(updatedChallenge);
    setChantChallenges(chantChallenges.map(c => c.id === id ? updatedChallenge : c));
  };

  const removeChantChallenge = async (id: string) => {
    await deleteChantChallenge(id);
    setChantChallenges(chantChallenges.filter(c => c.id !== id));
  };

  const addCustomMeditation = async (name: string, duration: number, blob: Blob) => {
    const id = `custom_meditation_${Date.now()}`;
    await saveCustomMeditation({ id, name, duration, blob });
    setCustomMeditations([...customMeditations, { id, name, duration, url: URL.createObjectURL(blob) }]);
  };

  const removeCustomMeditation = async (id: string) => {
    const meditation = customMeditations.find(m => m.id === id);
    if (meditation) URL.revokeObjectURL(meditation.url);
    await deleteCustomMeditation(id);
    setCustomMeditations(customMeditations.filter(m => m.id !== id));
  };

  const levelInfo = user ? getLevelInfo(user.xp) : { level: 'Balak' as UserLevel, nextXP: 100, progress: 0 };

  return (
    <StoreContext.Provider value={{
      user,
      loading,
      updateUser,
      toggleFavoriteQuote,
      addXP,
      level: levelInfo.level,
      nextLevelXP: levelInfo.nextXP,
      progressPercentage: levelInfo.progress,
      journal,
      addJournalEntry,
      course,
      completeCourseDay,
      sessions,
      addSession,
      customTracks,
      addCustomTrack,
      removeCustomTrack,
      mantraPresets,
      addMantraPreset,
      editMantraPreset,
      removeMantraPreset,
      customSessionTypes,
      addCustomSessionType,
      editCustomSessionType,
      removeCustomSessionType,
      chantChallenges,
      addChantChallenge,
      updateChantChallengeProgress,
      editChantChallengeProgress,
      editChantChallengeDeadline,
      removeChantChallenge,
      customMeditations,
      addCustomMeditation,
      removeCustomMeditation
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
