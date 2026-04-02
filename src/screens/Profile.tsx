import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { motion } from 'motion/react';
import { User, Edit2, Book, Plus, Search, Download, Smile, Palette, Target, Heart, Quote } from 'lucide-react';
import { format } from 'date-fns';

const MOODS = [
  { id: 'calm', emoji: '😌', label: 'Calm' },
  { id: 'energetic', emoji: '⚡️', label: 'Energetic' },
  { id: 'neutral', emoji: '😐', label: 'Neutral' },
  { id: 'low', emoji: '😔', label: 'Low' },
  { id: 'frustrated', emoji: '😠', label: 'Frustrated' },
];

export function Profile() {
  const { user, updateUser, journal, addJournalEntry, toggleFavoriteQuote } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editSankalp, setEditSankalp] = useState(user?.sankalp || '');
  const [editGoals, setEditGoals] = useState({
    malas: user?.dailyGoals?.malas || 1,
    focusMinutes: user?.dailyGoals?.focusMinutes || 10,
    breatheSessions: user?.dailyGoals?.breatheSessions || 1,
  });
  const [newEntry, setNewEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return null;

  const handleSaveProfile = () => {
    updateUser({ name: editName, sankalp: editSankalp, dailyGoals: editGoals });
    setIsEditing(false);
  };

  const handleSaveEntry = async () => {
    if (newEntry.trim()) {
      await addJournalEntry(newEntry, selectedMood);
      setNewEntry('');
      setSelectedMood('');
      setIsAddingEntry(false);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ user, journal }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sadhana_export_${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredJournal = journal.filter(entry => 
    entry.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (entry.mood && entry.mood.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-8 pb-32">
      <header className="pt-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <Edit2 size={18} />
        </button>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mr-4">
            <User size={32} className="text-orange-500" />
          </div>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white w-full mb-2"
              />
            ) : (
              <h2 className="text-2xl font-bold">{user.name}</h2>
            )}
            <p className="text-sm text-slate-400">Joined {format(new Date(), 'MMM yyyy')}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm text-slate-400 uppercase tracking-wider font-medium mb-2">Your Sankalp</h3>
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editSankalp}
                onChange={(e) => setEditSankalp(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded p-3 text-white w-full min-h-[80px] resize-none"
              />
              <button 
                onClick={handleSaveProfile}
                className="w-full bg-orange-600 text-white rounded-lg py-2 font-medium"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <p className="text-slate-200 italic border-l-2 border-orange-500 pl-4 py-1">
              "{user.sankalp}"
            </p>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800">
          <h3 className="text-sm text-slate-400 uppercase tracking-wider font-medium mb-3 flex items-center">
            <Palette size={16} className="mr-2" /> Theme
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => updateUser({ theme: 'midnight' })}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                (!user.theme || user.theme === 'midnight') ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Midnight
            </button>
            <button
              onClick={() => updateUser({ theme: 'dawn' })}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                user.theme === 'dawn' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Dawn
            </button>
            <button
              onClick={() => updateUser({ theme: 'temple' })}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                user.theme === 'temple' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Temple
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800">
          <h3 className="text-sm text-slate-400 uppercase tracking-wider font-medium mb-3 flex items-center">
            <Target size={16} className="mr-2" /> Daily Goals
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Malas per day</label>
                <input
                  type="number"
                  min="1"
                  value={editGoals.malas}
                  onChange={(e) => setEditGoals({ ...editGoals, malas: parseInt(e.target.value) || 1 })}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Focus Minutes per day</label>
                <input
                  type="number"
                  min="1"
                  value={editGoals.focusMinutes}
                  onChange={(e) => setEditGoals({ ...editGoals, focusMinutes: parseInt(e.target.value) || 1 })}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Breathe Sessions per day</label>
                <input
                  type="number"
                  min="1"
                  value={editGoals.breatheSessions}
                  onChange={(e) => setEditGoals({ ...editGoals, breatheSessions: parseInt(e.target.value) || 1 })}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white w-full"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-800/50 rounded-xl p-3">
                <div className="text-2xl font-bold text-orange-500">{user.dailyGoals?.malas || 1}</div>
                <div className="text-xs text-slate-400 mt-1">Malas</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3">
                <div className="text-2xl font-bold text-orange-500">{user.dailyGoals?.focusMinutes || 10}</div>
                <div className="text-xs text-slate-400 mt-1">Focus Min</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3">
                <div className="text-2xl font-bold text-orange-500">{user.dailyGoals?.breatheSessions || 1}</div>
                <div className="text-xs text-slate-400 mt-1">Breathe</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Favorite Quotes Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Heart className="mr-2 text-orange-500" size={20} />
          Favorite Quotes
        </h2>
        {(!user.favoriteQuotes || user.favoriteQuotes.length === 0) ? (
          <p className="text-slate-500 text-center py-8 bg-slate-900 border border-slate-800 rounded-2xl">
            No favorite quotes yet. Heart a quote on the Home screen to save it here.
          </p>
        ) : (
          <div className="space-y-3">
            {user.favoriteQuotes.map((quote, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                <Quote className="absolute top-4 right-4 text-slate-800/50 rotate-180" size={32} />
                <p className="text-slate-300 text-sm leading-relaxed italic relative z-10 mb-3">
                  "{quote.text}"
                </p>
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-xs text-orange-500/80 font-semibold tracking-wider uppercase">
                    — {quote.source}
                  </p>
                  <button 
                    onClick={() => toggleFavoriteQuote(quote)}
                    className="p-2 bg-slate-800/50 rounded-full text-orange-500 hover:bg-slate-800 transition-colors"
                  >
                    <Heart size={14} className="fill-orange-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <Book className="mr-2 text-orange-500" size={20} />
            Journal
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={handleExportData}
              className="p-2 bg-slate-800 text-slate-300 rounded-full hover:bg-slate-700 transition-colors"
              title="Export Data"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={() => setIsAddingEntry(!isAddingEntry)}
              className="p-2 bg-orange-600/20 text-orange-500 rounded-full hover:bg-orange-600/30 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {isAddingEntry && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
          >
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="Reflect on your day..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white min-h-[100px] resize-none focus:outline-none focus:border-orange-500"
              autoFocus
            />
            
            <div>
              <p className="text-sm text-slate-400 mb-2 flex items-center">
                <Smile size={16} className="mr-1" /> How are you feeling?
              </p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id === selectedMood ? '' : mood.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedMood === mood.id 
                        ? 'bg-orange-500/20 text-orange-500 border border-orange-500/50' 
                        : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'
                    }`}
                  >
                    {mood.emoji} {mood.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button 
                onClick={() => {
                  setIsAddingEntry(false);
                  setSelectedMood('');
                }}
                className="px-4 py-2 text-slate-400 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEntry}
                disabled={!newEntry.trim()}
                className="px-4 py-2 bg-orange-600 disabled:bg-slate-700 text-white rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </motion.div>
        )}

        {journal.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search journal entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500"
            />
          </div>
        )}

        <div className="space-y-3">
          {filteredJournal.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              {journal.length === 0 ? "No journal entries yet." : "No entries match your search."}
            </p>
          ) : (
            filteredJournal.map((entry) => (
              <div key={entry.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs text-orange-500 font-medium">
                    {format(new Date(entry.date), 'MMM d, yyyy • h:mm a')}
                  </p>
                  {entry.mood && (
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md flex items-center">
                      {MOODS.find(m => m.id === entry.mood)?.emoji} {MOODS.find(m => m.id === entry.mood)?.label}
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
