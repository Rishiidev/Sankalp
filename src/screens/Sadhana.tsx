import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, MantraPreset, ChantChallenge } from '../lib/store';
import { Play, Pause, RotateCcw, CheckCircle2, Volume2, VolumeX, Repeat, Vibrate, VibrateOff, Upload, Wind, Plus, X, Trash2, Edit2, Book, Heart, Music, Star, Sun, Moon } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ICON_LIBRARY = [
  { name: 'Book', component: Book },
  { name: 'Heart', component: Heart },
  { name: 'Music', component: Music },
  { name: 'Star', component: Star },
  { name: 'Sun', component: Sun },
  { name: 'Moon', component: Moon },
];

type BreathPhaseType = 'inhale' | 'hold1' | 'exhale' | 'hold2';

interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  phases: { phase: BreathPhaseType; duration: number; instruction: string }[];
}

const BREATHING_PATTERNS: BreathingPattern[] = [
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

const DEFAULT_AUDIO_TRACKS = [
  { id: '1', name: 'Distant Chants', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: '2', name: 'Gentle Rain', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: '3', name: 'Forest Ambiance', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

interface Props {
  onOpenChalisa?: () => void;
}

export function Sadhana({ onOpenChalisa }: Props) {
  const { addXP, addSession, customTracks, addCustomTrack, mantraPresets, addMantraPreset, editMantraPreset, removeMantraPreset, user, updateUser, customSessionTypes, addCustomSessionType, editCustomSessionType, removeCustomSessionType, chantChallenges, addChantChallenge, updateChantChallengeProgress, editChantChallengeProgress, editChantChallengeDeadline, removeChantChallenge, customMeditations, addCustomMeditation, removeCustomMeditation } = useStore();
  const [activeTab, setActiveTab] = useState<'practices' | 'meditations' | 'challenges'>('practices');
  const [mode, setMode] = useState<'select' | 'mala' | 'focus' | 'breathe' | 'custom' | 'meditation'>('select');
  const [targetCount, setTargetCount] = useState(108);
  const [count, setCount] = useState(0);
  const hapticEnabled = user?.hapticsEnabled ?? true;
  
  const [showAudioLibrary, setShowAudioLibrary] = useState(false);
  const [showAudioControls, setShowAudioControls] = useState(false);

  // Mantra State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('default');
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetMantra, setNewPresetMantra] = useState('');
  const [newPresetTarget, setNewPresetTarget] = useState(108);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editPresetName, setEditPresetName] = useState('');
  const [editPresetMantra, setEditPresetMantra] = useState('');
  const [editPresetTarget, setEditPresetTarget] = useState(108);

  const activePreset = mantraPresets.find(p => p.id === selectedPresetId) || mantraPresets[0];

  useEffect(() => {
    if (activePreset) {
      setTargetCount(activePreset.target);
    }
  }, [activePreset]);
  
  // Audio State
  const allTracks = [...DEFAULT_AUDIO_TRACKS, ...customTracks];
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLooping, setIsLooping] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState(allTracks[0]);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus Timer
  const [focusDurationMinutes, setFocusDurationMinutes] = useState(5);
  const [customFocusDuration, setCustomFocusDuration] = useState<string>('');
  const [focusTime, setFocusTime] = useState(5 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Breathing State
  const [selectedPatternId, setSelectedPatternId] = useState('box');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [breathPhaseTime, setBreathPhaseTime] = useState(4);
  const [breatheCycles, setBreatheCycles] = useState(0);
  const [targetCycles, setTargetCycles] = useState(10);

  // Custom Session State
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomIcon, setNewCustomIcon] = useState('Book');
  const [newCustomColor, setNewCustomColor] = useState('#f97316');
  const [selectedCustomTypeId, setSelectedCustomTypeId] = useState<string>('');
  const [customSessionDuration, setCustomSessionDuration] = useState(15);
  const [editingCustomTypeId, setEditingCustomTypeId] = useState<string | null>(null);
  const [editCustomName, setEditCustomName] = useState('');
  const [editCustomIcon, setEditCustomIcon] = useState('Book');
  const [editCustomColor, setEditCustomColor] = useState('#f97316');

  // Chant Challenge State
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const [newChallengeName, setNewChallengeName] = useState('');
  const [newChallengeTarget, setNewChallengeTarget] = useState(1000);
  const [newChallengeDeadline, setNewChallengeDeadline] = useState('');
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  const [editChallengeProgress, setEditChallengeProgress] = useState(0);
  const [editingChallengeDeadlineId, setEditingChallengeDeadlineId] = useState<string | null>(null);
  const [editChallengeDeadline, setEditChallengeDeadline] = useState('');

  // Guided Meditation State
  const GUIDED_MEDITATIONS = [
    { id: 'gm1', name: 'Strength and Courage', duration: 5, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 'gm2', name: 'Devotion and Surrender', duration: 10, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 'gm3', name: 'Inner Peace', duration: 8, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  ];
  const allMeditations = [...GUIDED_MEDITATIONS, ...customMeditations];
  const [selectedMeditation, setSelectedMeditation] = useState(allMeditations[0] || GUIDED_MEDITATIONS[0]);
  const [isUploadingMeditation, setIsUploadingMeditation] = useState(false);
  const [newMeditationName, setNewMeditationName] = useState('');
  const [newMeditationDuration, setNewMeditationDuration] = useState(5);
  const meditationFileInputRef = useRef<HTMLInputElement>(null);

  const activePattern = BREATHING_PATTERNS.find(p => p.id === selectedPatternId) || BREATHING_PATTERNS[0];
  const activePhase = activePattern.phases[currentPhaseIndex] || activePattern.phases[0];

  useEffect(() => {
    // If selected track is no longer in the list (e.g. deleted), revert to default
    if (!allTracks.find(t => t.id === selectedTrack.id)) {
      setSelectedTrack(allTracks[0]);
    }
  }, [customTracks]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    audioRef.current = new Audio(selectedTrack.url);
    audioRef.current.loop = isLooping;
    audioRef.current.volume = volume;
    
    const audio = audioRef.current;
    
    const updateProgress = () => setAudioProgress(audio.currentTime);
    const updateDuration = () => setAudioDuration(audio.duration);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);

    if (isPlaying) {
      audio.play().catch(e => console.log("Audio play failed", e));
    }

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.pause();
    };
  }, [selectedTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  // Focus Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((mode === 'focus' || mode === 'custom' || mode === 'meditation') && isTimerRunning && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime(prev => prev - 1);
      }, 1000);
    } else if (mode === 'focus' && focusTime === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      addXP(focusDurationMinutes * 10); // 10 XP per minute of focus
      addSession('focus', { durationMinutes: focusDurationMinutes });
      if (hapticEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } else if (mode === 'custom' && focusTime === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      addXP(customSessionDuration * 10);
      const customType = customSessionTypes.find(t => t.id === selectedCustomTypeId);
      addSession(selectedCustomTypeId, { durationMinutes: customSessionDuration, customTypeName: customType?.name });
      if (hapticEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } else if (mode === 'meditation' && focusTime === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Handled by audio onEnded, but fallback here just in case
      if (hapticEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
    return () => clearInterval(interval);
  }, [mode, isTimerRunning, focusTime, addXP, focusDurationMinutes, hapticEnabled, addSession, customSessionDuration, customSessionTypes, selectedCustomTypeId]);

  // Breathing logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === 'breathe' && isTimerRunning && breatheCycles < targetCycles) {
      interval = setInterval(() => {
        setBreathPhaseTime(prev => {
          if (prev <= 1) {
            // Transition to next phase
            if (hapticEnabled && navigator.vibrate) navigator.vibrate(30);
            
            const nextIdx = (currentPhaseIndex + 1) % activePattern.phases.length;
            setCurrentPhaseIndex(nextIdx);
            if (nextIdx === 0) {
              setBreatheCycles(c => c + 1);
            }
            return activePattern.phases[nextIdx].duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (mode === 'breathe' && breatheCycles >= targetCycles && isTimerRunning) {
      setIsTimerRunning(false);
      addXP(20); // 20 XP for breathing exercise
      addSession('breathe', { count: targetCycles });
      if (hapticEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
    return () => clearInterval(interval);
  }, [mode, isTimerRunning, breatheCycles, targetCycles, currentPhaseIndex, activePattern, addXP, hapticEnabled, addSession]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioProgress(time);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await addCustomTrack(file.name, file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreatePreset = async () => {
    if (newPresetName.trim() && newPresetMantra.trim() && newPresetTarget > 0) {
      await addMantraPreset({
        name: newPresetName,
        mantra: newPresetMantra,
        target: newPresetTarget
      });
      setIsCreatingPreset(false);
      setNewPresetName('');
      setNewPresetMantra('');
      setNewPresetTarget(108);
    }
  };

  const handleEditPreset = async () => {
    if (editingPresetId && editPresetName.trim() && editPresetMantra.trim() && editPresetTarget > 0) {
      await editMantraPreset(editingPresetId, {
        name: editPresetName,
        mantra: editPresetMantra,
        target: editPresetTarget
      });
      setEditingPresetId(null);
    }
  };

  const handleCreateCustomType = async () => {
    if (newCustomName.trim()) {
      await addCustomSessionType({
        name: newCustomName,
        icon: newCustomIcon,
        color: newCustomColor
      });
      setIsCreatingCustom(false);
      setNewCustomName('');
      setNewCustomIcon('Book');
      setNewCustomColor('#f97316');
    }
  };

  const handleEditCustomType = async () => {
    if (editingCustomTypeId && editCustomName.trim()) {
      await editCustomSessionType(editingCustomTypeId, {
        name: editCustomName,
        icon: editCustomIcon,
        color: editCustomColor
      });
      setEditingCustomTypeId(null);
    }
  };

  const handleCreateChallenge = async () => {
    if (newChallengeName.trim() && newChallengeTarget > 0) {
      await addChantChallenge({
        name: newChallengeName,
        target: newChallengeTarget,
        deadline: newChallengeDeadline || undefined
      });
      setIsCreatingChallenge(false);
      setNewChallengeName('');
      setNewChallengeTarget(1000);
      setNewChallengeDeadline('');
    }
  };

  const handleEditChallengeProgress = async (id: string) => {
    if (editChallengeProgress >= 0) {
      await editChantChallengeProgress(id, editChallengeProgress);
      setEditingChallengeId(null);
    }
  };

  const handleEditChallengeDeadline = async (id: string) => {
    await editChantChallengeDeadline(id, editChallengeDeadline);
    setEditingChallengeDeadlineId(null);
  };

  const handleShareChallenge = async (challenge: ChantChallenge) => {
    const shareText = `I've chanted ${challenge.progress} / ${challenge.target} mantras for my "${challenge.name}" challenge on Hanuman Sadhana! 🙏`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Chant Challenge',
          text: shareText,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Progress copied to clipboard!');
    }
  };

  const handleMeditationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && newMeditationName.trim() && newMeditationDuration > 0) {
      await addCustomMeditation(newMeditationName, newMeditationDuration, file);
      if (meditationFileInputRef.current) meditationFileInputRef.current.value = '';
      setIsUploadingMeditation(false);
      setNewMeditationName('');
      setNewMeditationDuration(5);
    }
  };

  const handleTap = () => {
    if (count < targetCount) {
      setCount(prev => prev + 1);
      if (hapticEnabled && navigator.vibrate) navigator.vibrate(50);
      
      if (count + 1 === targetCount) {
        addXP(targetCount * 2); // 2 XP per chant
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

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 h-full flex flex-col pb-32 overflow-y-auto">
      <header className="pt-8 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sadhana</h1>
          <p className="text-slate-400 mt-2">Focus your mind, chant with devotion.</p>
        </div>
        <button 
          onClick={() => updateUser({ hapticsEnabled: !hapticEnabled })}
          className={`p-2 rounded-full transition-colors ${hapticEnabled ? 'bg-orange-500/20 text-orange-500' : 'bg-slate-800 text-slate-500'}`}
          title={hapticEnabled ? "Haptics On" : "Haptics Off"}
        >
          {hapticEnabled ? <Vibrate size={20} /> : <VibrateOff size={20} />}
        </button>
      </header>

      {mode === 'select' && (
        <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 mb-6 shrink-0">
          <button
            onClick={() => setActiveTab('practices')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'practices' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
          >
            Practices
          </button>
          <button
            onClick={() => setActiveTab('meditations')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'meditations' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
          >
            Meditations
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'challenges' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
          >
            Challenges
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {mode === 'select' && activeTab === 'practices' && (
          <motion.div 
            key="select-practices"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col space-y-6"
          >
            {/* Hanuman Chalisa Quick Link */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <h2 className="text-xl font-bold mb-2 relative z-10">Shri Hanuman Chalisa</h2>
              <p className="text-orange-100 text-sm mb-4 relative z-10">Read the full 40 verses and dohas.</p>
              <button 
                onClick={onOpenChalisa}
                className="bg-white text-orange-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors relative z-10"
              >
                Read Now
              </button>
            </div>

            {/* Audio Upload Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <button 
                onClick={() => setShowAudioLibrary(!showAudioLibrary)}
                className="w-full flex items-center justify-between text-lg font-semibold"
              >
                <span className="flex items-center">
                  <Volume2 className="mr-2 text-orange-500" size={20} />
                  Audio Library
                </span>
                <span className="text-slate-400 text-sm font-normal">
                  {showAudioLibrary ? 'Hide' : 'Manage'}
                </span>
              </button>
              
              <AnimatePresence>
                {showAudioLibrary && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <p className="text-sm text-slate-400">Add your own chants or ambient sounds.</p>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center"
                      >
                        <Upload size={16} className="mr-2" />
                        Upload MP3
                      </button>
                      <input 
                        type="file" 
                        accept="audio/*" 
                        ref={fileInputRef} 
                        onChange={handleAudioUpload} 
                        className="hidden" 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Digital Mala</h2>
              
              {isCreatingPreset || editingPresetId ? (
                <div className="bg-slate-800 rounded-2xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">{editingPresetId ? 'Edit Mantra Preset' : 'New Mantra Preset'}</h3>
                    <button onClick={() => { setIsCreatingPreset(false); setEditingPresetId(null); }} className="text-slate-400 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Preset Name (e.g., Shiva Mantra)" 
                      value={editingPresetId ? editPresetName : newPresetName}
                      onChange={(e) => editingPresetId ? setEditPresetName(e.target.value) : setNewPresetName(e.target.value)}
                      className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-700 focus:border-orange-500 focus:outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="Mantra Text (e.g., Om Namah Shivaya)" 
                      value={editingPresetId ? editPresetMantra : newPresetMantra}
                      onChange={(e) => editingPresetId ? setEditPresetMantra(e.target.value) : setNewPresetMantra(e.target.value)}
                      className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-700 focus:border-orange-500 focus:outline-none"
                    />
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-slate-400">Target:</span>
                      <input 
                        type="number" 
                        min="1"
                        value={editingPresetId ? editPresetTarget : newPresetTarget}
                        onChange={(e) => editingPresetId ? setEditPresetTarget(parseInt(e.target.value) || 108) : setNewPresetTarget(parseInt(e.target.value) || 108)}
                        className="w-24 bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-700 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={editingPresetId ? handleEditPreset : handleCreatePreset}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-lg py-2 font-medium transition-colors mt-2"
                    >
                      {editingPresetId ? 'Save Changes' : 'Save Preset'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-slate-400">Select Mantra</label>
                    <button 
                      onClick={() => setIsCreatingPreset(true)}
                      className="text-xs text-orange-500 hover:text-orange-400 flex items-center"
                    >
                      <Plus size={14} className="mr-1" /> New
                    </button>
                  </div>
                  <div className="space-y-2">
                    {mantraPresets.map(preset => (
                      <div key={preset.id} className={`flex items-center justify-between bg-slate-800 rounded-xl p-3 border ${selectedPresetId === preset.id ? 'border-orange-500' : 'border-transparent'}`}>
                        <button 
                          onClick={() => setSelectedPresetId(preset.id)}
                          className="flex-1 flex items-center text-left text-white"
                        >
                          <span className="font-medium">{preset.name}</span>
                          <span className="ml-2 text-sm text-slate-400">({preset.target})</span>
                        </button>
                        {preset.id !== 'default' && (
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                setEditingPresetId(preset.id);
                                setEditPresetName(preset.name);
                                setEditPresetMantra(preset.mantra);
                                setEditPresetTarget(preset.target);
                              }}
                              className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                removeMantraPreset(preset.id);
                                if (selectedPresetId === preset.id) setSelectedPresetId('default');
                              }}
                              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setMode('mala'); resetMala(); }}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-xl py-4 font-bold text-lg transition-colors"
              >
                Start Chanting
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Focus Mode</h2>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[5, 10, 15, 20].map(mins => (
                  <button
                    key={mins}
                    onClick={() => {
                      setFocusDurationMinutes(mins);
                      setCustomFocusDuration('');
                    }}
                    className={`py-2 rounded-xl font-medium text-sm transition-colors ${
                      focusDurationMinutes === mins && customFocusDuration === ''
                        ? 'bg-orange-600 text-white' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
              <div className="mb-6">
                <input 
                  type="number" 
                  min="1" 
                  max="120" 
                  value={customFocusDuration}
                  onChange={(e) => {
                    setCustomFocusDuration(e.target.value);
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val > 0 && val <= 120) {
                      setFocusDurationMinutes(val);
                    }
                  }}
                  placeholder="Custom duration (1-120 mins)"
                  className="bg-slate-800 text-slate-200 rounded-xl px-4 py-3 w-full border border-slate-700 focus:outline-none focus:border-orange-500 text-center"
                />
              </div>
              <button
                onClick={() => { 
                  let finalMins = focusDurationMinutes;
                  if (customFocusDuration) {
                    const val = parseInt(customFocusDuration);
                    if (!isNaN(val) && val > 0 && val <= 120) {
                      finalMins = val;
                    } else {
                      finalMins = 5; // fallback
                    }
                  }
                  setFocusDurationMinutes(finalMins);
                  setMode('focus'); 
                  setFocusTime(finalMins * 60); 
                  setIsTimerRunning(true); 
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-4 font-bold text-lg transition-colors"
              >
                Start Timer
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-center flex items-center justify-center">
                <Wind className="mr-2 text-orange-500" /> Pranayama
              </h2>
              <p className="text-center text-slate-400 text-sm mb-4">Select a breathing pattern to calm the mind.</p>
              
              <div className="space-y-4 mb-6">
                <select 
                  value={selectedPatternId}
                  onChange={(e) => setSelectedPatternId(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500"
                >
                  {BREATHING_PATTERNS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                
                <div className="text-center text-sm text-slate-400">
                  {activePattern.description}
                </div>

                <div className="flex items-center justify-between bg-slate-800 rounded-xl p-3">
                  <span className="text-sm text-slate-300 ml-2">Cycles</span>
                  <div className="flex space-x-2">
                    {[5, 10, 20].map(c => (
                      <button
                        key={c}
                        onClick={() => setTargetCycles(c)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          targetCycles === c ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => { 
                  setMode('breathe'); 
                  setBreatheCycles(0);
                  setCurrentPhaseIndex(0);
                  setBreathPhaseTime(activePattern.phases[0].duration);
                  setIsTimerRunning(true); 
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-4 font-bold text-lg transition-colors"
              >
                Start Breathing
              </button>
            </div>

            {/* Custom Sessions */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Custom Sessions</h2>
              
              {isCreatingCustom || editingCustomTypeId ? (
                <div className="bg-slate-800 rounded-2xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">{editingCustomTypeId ? 'Edit Custom Type' : 'New Custom Type'}</h3>
                    <button onClick={() => { setIsCreatingCustom(false); setEditingCustomTypeId(null); }} className="text-slate-400 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Session Name (e.g., Reading)" 
                      value={editingCustomTypeId ? editCustomName : newCustomName}
                      onChange={(e) => editingCustomTypeId ? setEditCustomName(e.target.value) : setNewCustomName(e.target.value)}
                      className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-700 focus:border-orange-500 focus:outline-none"
                    />
                    
                    <div>
                      <span className="text-sm text-slate-400 mb-2 block">Icon:</span>
                      <div className="flex flex-wrap gap-2">
                        {ICON_LIBRARY.map(icon => {
                          const IconComp = icon.component;
                          const isSelected = editingCustomTypeId ? editCustomIcon === icon.name : newCustomIcon === icon.name;
                          return (
                            <button
                              key={icon.name}
                              onClick={() => editingCustomTypeId ? setEditCustomIcon(icon.name) : setNewCustomIcon(icon.name)}
                              className={`p-2 rounded-lg border ${isSelected ? 'border-orange-500 bg-orange-500/20' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}
                            >
                              <IconComp size={20} className={isSelected ? 'text-orange-500' : 'text-slate-400'} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-slate-400">Color:</span>
                      <input 
                        type="color" 
                        value={editingCustomTypeId ? editCustomColor : newCustomColor}
                        onChange={(e) => editingCustomTypeId ? setEditCustomColor(e.target.value) : setNewCustomColor(e.target.value)}
                        className="w-10 h-10 rounded border-none bg-transparent cursor-pointer"
                      />
                    </div>
                    <button 
                      onClick={editingCustomTypeId ? handleEditCustomType : handleCreateCustomType}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-lg py-2 font-medium transition-colors mt-2"
                    >
                      {editingCustomTypeId ? 'Save Changes' : 'Save Type'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-slate-400">Select Type</label>
                    <button 
                      onClick={() => setIsCreatingCustom(true)}
                      className="text-xs text-orange-500 hover:text-orange-400 flex items-center"
                    >
                      <Plus size={14} className="mr-1" /> New
                    </button>
                  </div>
                  {customSessionTypes.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {customSessionTypes.map(type => {
                        const IconComponent = ICON_LIBRARY.find(i => i.name === type.icon)?.component || Book;
                        return (
                          <div key={type.id} className={`flex items-center justify-between bg-slate-800 rounded-xl p-3 border ${selectedCustomTypeId === type.id ? 'border-orange-500' : 'border-transparent'}`}>
                            <button 
                              onClick={() => setSelectedCustomTypeId(type.id)}
                              className="flex-1 flex items-center text-left text-white"
                            >
                              <IconComponent size={20} className="mr-3" style={{ color: type.color || '#f97316' }} />
                              <span className="font-medium">{type.name}</span>
                            </button>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  setEditingCustomTypeId(type.id);
                                  setEditCustomName(type.name);
                                  setEditCustomIcon(type.icon || 'Book');
                                  setEditCustomColor(type.color || '#f97316');
                                }}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => {
                                  removeCustomSessionType(type.id);
                                  if (selectedCustomTypeId === type.id) setSelectedCustomTypeId('');
                                }}
                                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 mb-4 italic">No custom types created yet.</p>
                  )}

                  {selectedCustomTypeId && (
                    <>
                      <div className="flex items-center justify-between bg-slate-800 rounded-xl p-3 mb-4">
                        <span className="text-sm text-slate-300 ml-2">Duration (min)</span>
                        <input 
                          type="number" 
                          min="1"
                          value={customSessionDuration}
                          onChange={(e) => setCustomSessionDuration(parseInt(e.target.value) || 15)}
                          className="w-20 bg-slate-900 text-white rounded-lg px-3 py-1 border border-slate-700 focus:border-orange-500 focus:outline-none text-center"
                        />
                      </div>
                      <button
                        onClick={() => { 
                          setMode('custom'); 
                          setFocusTime(customSessionDuration * 60); 
                          setIsTimerRunning(true); 
                        }}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-4 font-bold text-lg transition-colors"
                      >
                        Start Custom Session
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {mode === 'select' && activeTab === 'meditations' && (
          <motion.div 
            key="select-meditations"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col space-y-6"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Guided Meditations</h2>
                <button 
                  onClick={() => setIsUploadingMeditation(!isUploadingMeditation)}
                  className="text-sm text-orange-500 hover:text-orange-400 flex items-center"
                >
                  <Upload size={16} className="mr-1" /> Upload
                </button>
              </div>

              <AnimatePresence>
                {isUploadingMeditation && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                    exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-slate-800 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Upload Meditation</h3>
                        <button onClick={() => setIsUploadingMeditation(false)} className="text-slate-400 hover:text-white">
                          <X size={20} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Meditation Name" 
                          value={newMeditationName}
                          onChange={(e) => setNewMeditationName(e.target.value)}
                          className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-700 focus:border-orange-500 focus:outline-none"
                        />
                        <div className="flex items-center justify-between bg-slate-900 rounded-lg px-3 py-2 border border-slate-700">
                          <span className="text-sm text-slate-400">Duration (min):</span>
                          <input 
                            type="number" 
                            min="1"
                            value={newMeditationDuration}
                            onChange={(e) => setNewMeditationDuration(parseInt(e.target.value) || 5)}
                            className="w-24 bg-transparent text-white text-right focus:outline-none"
                          />
                        </div>
                        <input 
                          type="file" 
                          accept="audio/mp3,audio/wav" 
                          ref={meditationFileInputRef}
                          className="hidden"
                          onChange={handleMeditationUpload}
                        />
                        <button 
                          onClick={() => meditationFileInputRef.current?.click()}
                          className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-2 font-medium transition-colors mt-2 flex items-center justify-center"
                        >
                          <Upload size={16} className="mr-2" /> Select Audio File
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {allMeditations.map(meditation => (
                  <div key={meditation.id} className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{meditation.name}</h3>
                      <p className="text-sm text-slate-400">{meditation.duration} min</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {meditation.id.startsWith('custom_') && (
                        <button 
                          onClick={() => removeCustomMeditation(meditation.id)}
                          className="w-10 h-10 text-slate-500 hover:text-red-400 flex items-center justify-center transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedMeditation(meditation);
                          setMode('meditation');
                          setFocusTime(meditation.duration * 60);
                          setIsTimerRunning(true);
                        }}
                        className="w-12 h-12 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors"
                      >
                        <Play size={24} className="ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'select' && activeTab === 'challenges' && (
          <motion.div 
            key="select-challenges"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col space-y-6"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Chant Challenges</h2>
                <button 
                  onClick={() => setIsCreatingChallenge(true)}
                  className="text-sm text-orange-500 hover:text-orange-400 flex items-center"
                >
                  <Plus size={16} className="mr-1" /> New
                </button>
              </div>

              {isCreatingChallenge && (
                <div className="bg-slate-800 rounded-2xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">New Challenge</h3>
                    <button onClick={() => setIsCreatingChallenge(false)} className="text-slate-400 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Challenge Name (e.g., 10k Mantras)" 
                      value={newChallengeName}
                      onChange={(e) => setNewChallengeName(e.target.value)}
                      className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-700 focus:border-orange-500 focus:outline-none"
                    />
                    <div className="flex items-center justify-between bg-slate-900 rounded-lg px-3 py-2 border border-slate-700">
                      <span className="text-sm text-slate-400">Target Chants:</span>
                      <input 
                        type="number" 
                        min="1"
                        value={newChallengeTarget}
                        onChange={(e) => setNewChallengeTarget(parseInt(e.target.value) || 1000)}
                        className="w-24 bg-transparent text-white text-right focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between bg-slate-900 rounded-lg px-3 py-2 border border-slate-700">
                      <span className="text-sm text-slate-400">Deadline (Optional):</span>
                      <input 
                        type="date" 
                        value={newChallengeDeadline}
                        onChange={(e) => setNewChallengeDeadline(e.target.value)}
                        className="bg-transparent text-white text-right focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={handleCreateChallenge}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-lg py-2 font-medium transition-colors mt-2"
                    >
                      Start Challenge
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {chantChallenges.length > 0 ? (
                  chantChallenges.map(challenge => (
                    <div key={challenge.id} className="bg-slate-800 rounded-2xl p-4 relative overflow-hidden">
                      {challenge.completed && (
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg z-10">
                          COMPLETED
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div>
                          <h3 className="font-semibold text-white flex items-center">
                            {challenge.name}
                            {challenge.completed && <CheckCircle2 size={16} className="text-green-500 ml-2" />}
                          </h3>
                          <p className="text-xs text-slate-400">
                            Started {new Date(challenge.startDate).toLocaleDateString()}
                            {challenge.deadline && ` • Ends ${new Date(challenge.deadline).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setEditingChallengeDeadlineId(challenge.id);
                              setEditChallengeDeadline(challenge.deadline || '');
                            }}
                            className="text-slate-500 hover:text-white"
                            title="Edit Deadline"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleShareChallenge(challenge)}
                            className="text-slate-500 hover:text-blue-400"
                            title="Share Progress"
                          >
                            <Upload size={16} />
                          </button>
                          <button 
                            onClick={() => removeChantChallenge(challenge.id)}
                            className="text-slate-500 hover:text-red-400"
                            title="Delete Challenge"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {editingChallengeDeadlineId === challenge.id && (
                        <div className="mt-2 flex items-center space-x-2 bg-slate-900 p-2 rounded-lg relative z-10">
                          <input 
                            type="date" 
                            value={editChallengeDeadline}
                            onChange={(e) => setEditChallengeDeadline(e.target.value)}
                            className="flex-1 bg-slate-800 text-white rounded px-2 py-1 border border-slate-700 focus:outline-none text-sm"
                          />
                          <button 
                            onClick={() => handleEditChallengeDeadline(challenge.id)}
                            className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingChallengeDeadlineId(null)}
                            className="text-slate-400 hover:text-white px-2 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      <div className="mt-4 relative z-10">
                        {editingChallengeId === challenge.id ? (
                          <div className="flex items-center space-x-2 mb-2">
                            <input 
                              type="number" 
                              value={editChallengeProgress}
                              onChange={(e) => setEditChallengeProgress(parseInt(e.target.value) || 0)}
                              className="w-24 bg-slate-900 text-white rounded px-2 py-1 border border-slate-700 focus:outline-none"
                            />
                            <span className="text-slate-400">/ {challenge.target}</span>
                            <button 
                              onClick={() => handleEditChallengeProgress(challenge.id)}
                              className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingChallengeId(null)}
                              className="text-slate-400 hover:text-white px-2"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-between text-sm mb-1 cursor-pointer" onClick={() => { setEditingChallengeId(challenge.id); setEditChallengeProgress(challenge.progress); }}>
                            <span className="text-orange-400 font-medium hover:underline" title="Click to edit progress">{challenge.progress}</span>
                            <span className="text-slate-400">/ {challenge.target}</span>
                          </div>
                        )}
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${challenge.completed ? 'bg-green-500' : 'bg-orange-500'}`}
                            style={{ width: `${Math.min(100, (challenge.progress / challenge.target) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center italic py-4">No active challenges. Start one to track your long-term chanting goals!</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {mode !== 'select' && (
          <motion.div 
            key="active-session"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-between relative py-4"
          >
            {/* Main Interaction Area */}
            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[300px]">

        {mode === 'mala' && (
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
                      <button onClick={() => { resetMala(); setMode('select'); }} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
                        Return
                      </button>
                    </motion.div>
                  ) : (
                    <p className="text-slate-500 animate-pulse">Tap the circle to count</p>
                  )}
                </>
              )}

              {mode === 'focus' && (
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
                      <p className="text-slate-400 mb-6">+{focusDurationMinutes * 10} XP earned</p>
                      <button onClick={() => setMode('select')} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
                        Return
                      </button>
                    </motion.div>
                  ) : (
                    <div className="flex space-x-4">
                      <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="bg-orange-600 hover:bg-orange-500 text-white rounded-xl px-8 py-3 font-medium transition-colors">
                        {isTimerRunning ? 'Pause' : 'Resume'}
                      </button>
                      <button onClick={() => { setIsTimerRunning(false); setMode('select'); }} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
                        End
                      </button>
                    </div>
                  )}
                </>
              )}

              {mode === 'custom' && (
                <>
                  <div className="mb-8 text-center px-4">
                    <p className="text-sm text-orange-500 font-medium mb-1 uppercase tracking-wider">Custom Session</p>
                    <h2 className="text-2xl font-bold text-white">
                      {customSessionTypes.find(t => t.id === selectedCustomTypeId)?.name || 'Session'}
                    </h2>
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
                          strokeDasharray: `${((customSessionDuration * 60 - focusTime) / (customSessionDuration * 60)) * 754} 1000` 
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
                      <p className="text-slate-400 mb-6">+{customSessionDuration * 10} XP earned</p>
                      <button onClick={() => setMode('select')} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
                        Return
                      </button>
                    </motion.div>
                  ) : (
                    <div className="flex space-x-4">
                      <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="bg-orange-600 hover:bg-orange-500 text-white rounded-xl px-8 py-3 font-medium transition-colors">
                        {isTimerRunning ? 'Pause' : 'Resume'}
                      </button>
                      <button onClick={() => { setIsTimerRunning(false); setMode('select'); }} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
                        End
                      </button>
                    </div>
                  )}
                </>
              )}

              {mode === 'meditation' && (
                <>
                  <div className="mb-8 text-center px-4">
                    <p className="text-sm text-orange-500 font-medium mb-1 uppercase tracking-wider">Guided Meditation</p>
                    <h2 className="text-2xl font-bold text-white">{selectedMeditation.name}</h2>
                  </div>
                  
                  <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                    <motion.div
                      animate={{
                        scale: isTimerRunning ? [1, 1.05, 1] : 1,
                        opacity: isTimerRunning ? [0.5, 0.8, 0.5] : 0.5,
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl"
                    />
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
                          strokeDasharray: `${((selectedMeditation.duration * 60 - focusTime) / (selectedMeditation.duration * 60)) * 754} 1000` 
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
                      <h3 className="text-2xl font-bold mb-2">Meditation Complete</h3>
                      <p className="text-slate-400 mb-6">+{selectedMeditation.duration * 5} XP earned</p>
                      <button onClick={() => setMode('select')} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
                        Return
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <audio 
                        src={selectedMeditation.url} 
                        autoPlay={isTimerRunning}
                        onEnded={() => {
                          setFocusTime(0);
                          setIsTimerRunning(false);
                          addXP(selectedMeditation.duration * 5);
                          addSession('meditation', { durationMinutes: selectedMeditation.duration, customTypeName: 'Guided Meditation' });
                        }}
                        controls
                        className="w-full max-w-xs mb-8"
                      />

                      <div className="flex space-x-4">
                        <button onClick={() => { 
                          setIsTimerRunning(false); 
                          addSession('meditation', { durationMinutes: Math.ceil((selectedMeditation.duration * 60 - focusTime) / 60), customTypeName: 'Guided Meditation' });
                          setMode('select'); 
                        }} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
                          End Early
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {mode === 'breathe' && (
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
                      <button onClick={() => setMode('select')} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
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
                        <button onClick={() => { setIsTimerRunning(false); setMode('select'); }} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
                          End
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Audio Controls */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setShowAudioControls(!showAudioControls)}
                  className="flex items-center text-slate-300 hover:text-white transition-colors"
                >
                  <Volume2 className="mr-2 text-orange-500" size={18} />
                  <span className="text-sm font-medium">Audio Controls</span>
                </button>
                <div className="flex space-x-2">
                  <button onClick={() => setIsLooping(!isLooping)} className={`p-2 rounded-full ${isLooping ? 'bg-orange-500/20 text-orange-500' : 'bg-slate-800 text-slate-400'}`}>
                    <Repeat size={18} />
                  </button>
                  <button onClick={toggleAudio} className="p-2 bg-orange-600 rounded-full text-white">
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showAudioControls && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex flex-col space-y-4 pt-2 border-t border-slate-800"
                  >
                    <select 
                      value={selectedTrack.id}
                      onChange={(e) => {
                        const track = allTracks.find(t => t.id === e.target.value);
                        if (track) setSelectedTrack(track);
                      }}
                      className="bg-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-orange-500 w-full"
                    >
                      <optgroup label="Default">
                        {DEFAULT_AUDIO_TRACKS.map(track => (
                          <option key={track.id} value={track.id}>{track.name}</option>
                        ))}
                      </optgroup>
                      {customTracks.length > 0 && (
                        <optgroup label="My Uploads">
                          {customTracks.map(track => (
                            <option key={track.id} value={track.id}>{track.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>

                    {/* Audio Progress Bar */}
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span className="w-8 text-right">{formatTime(audioProgress)}</span>
                      <input 
                        type="range" 
                        min="0" 
                        max={audioDuration || 100} 
                        step="0.1"
                        value={audioProgress}
                        onChange={handleSeek}
                        className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                      <span className="w-8">{formatTime(audioDuration || 0)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setVolume(v => Math.max(0, v - 0.1))} className="text-slate-400">
                        <VolumeX size={16} />
                      </button>
                      <input 
                        type="range" 
                        min="0" max="1" step="0.05" 
                        value={volume} 
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                      <button onClick={() => setVolume(v => Math.min(1, v + 0.1))} className="text-slate-400">
                        <Volume2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
