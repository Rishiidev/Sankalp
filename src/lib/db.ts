import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SadhanaDB extends DBSchema {
  user: {
    key: string;
    value: {
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
    };
  };
  journal: {
    key: string;
    value: {
      id: string;
      date: string;
      text: string;
      mood?: string;
    };
    indexes: { 'by-date': string };
  };
  course: {
    key: number;
    value: {
      day: number;
      completed: boolean;
      completedAt?: string;
    };
  };
  sessions: {
    key: string;
    value: {
      id: string;
      date: string;
      type: string; // Changed from 'mala' | 'focus' | 'breathe' to string to support custom
      count?: number;
      durationMinutes?: number;
      customTypeName?: string;
    };
    indexes: { 'by-date': string };
  };
  customAudio: {
    key: string;
    value: {
      id: string;
      name: string;
      blob: Blob;
    };
  };
  mantraPresets: {
    key: string;
    value: {
      id: string;
      name: string;
      mantra: string;
      target: number;
    };
  };
  customSessionTypes: {
    key: string;
    value: {
      id: string;
      name: string;
      icon?: string;
      color?: string;
    };
  };
  chantChallenges: {
    key: string;
    value: {
      id: string;
      name: string;
      target: number;
      progress: number;
      deadline?: string;
      completed: boolean;
    };
  };
  customMeditations: {
    key: string;
    value: {
      id: string;
      name: string;
      duration: number;
      blob: Blob;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<SadhanaDB>>;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<SadhanaDB>('sadhana-db', 6, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('user', { keyPath: 'id' });
          const journalStore = db.createObjectStore('journal', { keyPath: 'id' });
          journalStore.createIndex('by-date', 'date');
          db.createObjectStore('course', { keyPath: 'day' });
        }
        if (oldVersion < 2) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('by-date', 'date');
        }
        if (oldVersion < 3) {
          db.createObjectStore('customAudio', { keyPath: 'id' });
        }
        if (oldVersion < 4) {
          db.createObjectStore('mantraPresets', { keyPath: 'id' });
        }
        if (oldVersion < 5) {
          db.createObjectStore('customSessionTypes', { keyPath: 'id' });
          db.createObjectStore('chantChallenges', { keyPath: 'id' });
        }
        if (oldVersion < 6) {
          db.createObjectStore('customMeditations', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function getUser() {
  const db = await initDB();
  return db.get('user', 'main');
}

export async function saveUser(user: any) {
  const db = await initDB();
  await db.put('user', { ...user, id: 'main' });
}

export async function getJournalEntries() {
  const db = await initDB();
  return db.getAllFromIndex('journal', 'by-date');
}

export async function saveJournalEntry(entry: { id: string; date: string; text: string; mood?: string }) {
  const db = await initDB();
  await db.put('journal', entry);
}

export async function getCourseProgress() {
  const db = await initDB();
  return db.getAll('course');
}

export async function saveCourseProgress(day: number, completed: boolean) {
  const db = await initDB();
  await db.put('course', { day, completed, completedAt: new Date().toISOString() });
}

export async function getSessions() {
  const db = await initDB();
  return db.getAllFromIndex('sessions', 'by-date');
}

export async function saveSession(session: any) {
  const db = await initDB();
  await db.put('sessions', session);
}

export async function getCustomAudio() {
  const db = await initDB();
  return db.getAll('customAudio');
}

export async function saveCustomAudio(audio: { id: string; name: string; blob: Blob }) {
  const db = await initDB();
  await db.put('customAudio', audio);
}

export async function deleteCustomAudio(id: string) {
  const db = await initDB();
  await db.delete('customAudio', id);
}

export async function getMantraPresets() {
  const db = await initDB();
  return db.getAll('mantraPresets');
}

export async function saveMantraPreset(preset: { id: string; name: string; mantra: string; target: number }) {
  const db = await initDB();
  await db.put('mantraPresets', preset);
}

export async function deleteMantraPreset(id: string) {
  const db = await initDB();
  await db.delete('mantraPresets', id);
}

export async function getCustomSessionTypes() {
  const db = await initDB();
  return db.getAll('customSessionTypes');
}

export async function saveCustomSessionType(type: { id: string; name: string; icon?: string; color?: string }) {
  const db = await initDB();
  await db.put('customSessionTypes', type);
}

export async function deleteCustomSessionType(id: string) {
  const db = await initDB();
  await db.delete('customSessionTypes', id);
}

export async function getChantChallenges() {
  const db = await initDB();
  return db.getAll('chantChallenges');
}

export async function saveChantChallenge(challenge: { id: string; name: string; target: number; progress: number; deadline?: string; completed: boolean }) {
  const db = await initDB();
  await db.put('chantChallenges', challenge);
}

export async function deleteChantChallenge(id: string) {
  const db = await initDB();
  await db.delete('chantChallenges', id);
}

export async function getCustomMeditations() {
  const db = await initDB();
  return db.getAll('customMeditations');
}

export async function saveCustomMeditation(meditation: { id: string; name: string; duration: number; blob: Blob }) {
  const db = await initDB();
  await db.put('customMeditations', meditation);
}

export async function deleteCustomMeditation(id: string) {
  const db = await initDB();
  await db.delete('customMeditations', id);
}
