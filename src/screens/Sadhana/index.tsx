import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, MantraPreset } from '../../lib/store';
import { Play, Pause, RotateCcw, Volume2, Upload, Wind, Plus, X, Trash2, Edit2, Book, Heart, Music, Star, Sun, Moon, Vibrate, VibrateOff } from 'lucide-react';
import { ConfirmDialog } from '../../components/ConfirmDialog';

// Sub-components
import { AudioControls } from './AudioControls';
import { MalaCounter } from './MalaCounter';
import { FocusTimer } from './FocusTimer';
import { BreathingGuide, BREATHING_PATTERNS } from './BreathingGuide';
import { CustomSession } from './CustomSession';
import { MeditationPlayer } from './MeditationPlayer';
import { ChantChallenges } from './ChantChallenges';

const ICON_LIBRARY = [
  { name: 'Book', component: Book },
  { name: 'Heart', component: Heart },
  { name: 'Music', component: Music },
  { name: 'Star', component: Star },
  { name: 'Sun', component: Sun },
  { name: 'Moon', component: Moon },
];

const GUIDED_MEDITATIONS = [
  { id: 'gm1', name: 'Strength and Courage', duration: 5, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'gm2', name: 'Devotion and Surrender', duration: 10, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'gm3', name: 'Inner Peace', duration: 8, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

interface Props {
  onOpenChalisa?: () => void;
}

export function Sadhana({ onOpenChalisa }: Props) {
  const {
    customTracks, addCustomTrack,
    mantraPresets, addMantraPreset, editMantraPreset, removeMantraPreset,
    user, updateUser,
    customSessionTypes, addCustomSessionType, editCustomSessionType, removeCustomSessionType,
    customMeditations, addCustomMeditation, removeCustomMeditation,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'practices' | 'meditations' | 'challenges'>('practices');
  const [mode, setMode] = useState<'select' | 'mala' | 'focus' | 'breathe' | 'custom' | 'meditation'>('select');
  const hapticEnabled = user?.hapticsEnabled ?? true;

  // Audio Library
  const [showAudioLibrary, setShowAudioLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [targetCount, setTargetCount] = useState(108);

  useEffect(() => {
    if (activePreset) setTargetCount(activePreset.target);
  }, [activePreset]);

  // Focus Timer
  const [focusDurationMinutes, setFocusDurationMinutes] = useState(5);
  const [customFocusDuration, setCustomFocusDuration] = useState<string>('');

  // Breathing State
  const [selectedPatternId, setSelectedPatternId] = useState('box');
  const [targetCycles, setTargetCycles] = useState(10);
  const activePattern = BREATHING_PATTERNS.find(p => p.id === selectedPatternId) || BREATHING_PATTERNS[0];

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

  // Meditation State
  const allMeditations = useMemo(
    () => [...GUIDED_MEDITATIONS, ...customMeditations],
    [customMeditations]
  );
  const [selectedMeditation, setSelectedMeditation] = useState(allMeditations[0] || GUIDED_MEDITATIONS[0]);
  const [isUploadingMeditation, setIsUploadingMeditation] = useState(false);
  const [newMeditationName, setNewMeditationName] = useState('');
  const [newMeditationDuration, setNewMeditationDuration] = useState(5);
  const meditationFileInputRef = useRef<HTMLInputElement>(null);

  // Confirm dialog
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; action: () => void; name: string }>({
    isOpen: false, action: () => {}, name: '',
  });

  // Handlers
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await addCustomTrack(file.name, file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreatePreset = async () => {
    if (newPresetName.trim() && newPresetMantra.trim() && newPresetTarget > 0) {
      await addMantraPreset({ name: newPresetName, mantra: newPresetMantra, target: newPresetTarget });
      setIsCreatingPreset(false);
      setNewPresetName('');
      setNewPresetMantra('');
      setNewPresetTarget(108);
    }
  };

  const handleEditPreset = async () => {
    if (editingPresetId && editPresetName.trim() && editPresetMantra.trim() && editPresetTarget > 0) {
      await editMantraPreset(editingPresetId, { name: editPresetName, mantra: editPresetMantra, target: editPresetTarget });
      setEditingPresetId(null);
    }
  };

  const handleCreateCustomType = async () => {
    if (newCustomName.trim()) {
      await addCustomSessionType({ name: newCustomName, icon: newCustomIcon, color: newCustomColor });
      setIsCreatingCustom(false);
      setNewCustomName('');
      setNewCustomIcon('Book');
      setNewCustomColor('#f97316');
    }
  };

  const handleEditCustomType = async () => {
    if (editingCustomTypeId && editCustomName.trim()) {
      await editCustomSessionType(editingCustomTypeId, { name: editCustomName, icon: editCustomIcon, color: editCustomColor });
      setEditingCustomTypeId(null);
    }
  };

  const handleMeditationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!newMeditationName.trim()) {
      alert('Please enter a meditation name before selecting a file.');
      if (meditationFileInputRef.current) meditationFileInputRef.current.value = '';
      return;
    }
    if (file && newMeditationDuration > 0) {
      await addCustomMeditation(newMeditationName, newMeditationDuration, file);
      if (meditationFileInputRef.current) meditationFileInputRef.current.value = '';
      setIsUploadingMeditation(false);
      setNewMeditationName('');
      setNewMeditationDuration(5);
    }
  };

  const requestDelete = (name: string, action: () => void) => {
    setConfirmDelete({ isOpen: true, action, name });
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
        {/* ===== PRACTICES TAB ===== */}
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

            {/* Digital Mala */}
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
                              onClick={() => requestDelete(preset.name, () => {
                                removeMantraPreset(preset.id);
                                if (selectedPresetId === preset.id) setSelectedPresetId('default');
                              })}
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
                onClick={() => { setMode('mala'); }}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-xl py-4 font-bold text-lg transition-colors"
              >
                Start Chanting
              </button>
            </div>

            {/* Focus Mode */}
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
                      finalMins = 5;
                    }
                  }
                  setFocusDurationMinutes(finalMins);
                  setMode('focus');
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-4 font-bold text-lg transition-colors"
              >
                Start Timer
              </button>
            </div>

            {/* Pranayama */}
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
                onClick={() => { setMode('breathe'); }}
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
                                onClick={() => requestDelete(type.name, () => {
                                  removeCustomSessionType(type.id);
                                  if (selectedCustomTypeId === type.id) setSelectedCustomTypeId('');
                                })}
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
                        onClick={() => { setMode('custom'); }}
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

        {/* ===== MEDITATIONS TAB ===== */}
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
                          onClick={() => requestDelete(meditation.name, () => removeCustomMeditation(meditation.id))}
                          className="w-10 h-10 text-slate-500 hover:text-red-400 flex items-center justify-center transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedMeditation(meditation);
                          setMode('meditation');
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

        {/* ===== CHALLENGES TAB ===== */}
        {mode === 'select' && activeTab === 'challenges' && (
          <ChantChallenges />
        )}

        {/* ===== ACTIVE SESSION MODES ===== */}
        {mode !== 'select' && (
          <motion.div
            key="active-session"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-between relative py-4"
          >
            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[300px]">
              {mode === 'mala' && (
                <MalaCounter
                  activePreset={activePreset}
                  targetCount={targetCount}
                  onComplete={() => setMode('select')}
                />
              )}

              {mode === 'focus' && (
                <FocusTimer
                  durationMinutes={focusDurationMinutes}
                  onComplete={() => setMode('select')}
                />
              )}

              {mode === 'custom' && (
                <CustomSession
                  typeId={selectedCustomTypeId}
                  typeName={customSessionTypes.find(t => t.id === selectedCustomTypeId)?.name || 'Session'}
                  durationMinutes={customSessionDuration}
                  onComplete={() => setMode('select')}
                />
              )}

              {mode === 'meditation' && (
                <MeditationPlayer
                  meditation={selectedMeditation}
                  onComplete={() => setMode('select')}
                />
              )}

              {mode === 'breathe' && (
                <BreathingGuide
                  patternId={selectedPatternId}
                  targetCycles={targetCycles}
                  onComplete={() => setMode('select')}
                />
              )}
            </div>

            {/* Bottom Audio Controls */}
            <AudioControls />
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Item"
        message={`Are you sure you want to delete "${confirmDelete.name}"? This cannot be undone.`}
        onConfirm={() => {
          confirmDelete.action();
          setConfirmDelete({ isOpen: false, action: () => {}, name: '' });
        }}
        onCancel={() => setConfirmDelete({ isOpen: false, action: () => {}, name: '' })}
      />
    </div>
  );
}
