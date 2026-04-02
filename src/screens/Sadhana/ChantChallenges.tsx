import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, X, Edit2, Trash2, CheckCircle2, Upload as UploadIcon } from 'lucide-react';
import { useStore, ChantChallenge } from '../../lib/store';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export function ChantChallenges() {
  const {
    chantChallenges,
    addChantChallenge,
    updateChantChallengeProgress,
    editChantChallengeProgress,
    editChantChallengeDeadline,
    removeChantChallenge,
  } = useStore();

  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const [newChallengeName, setNewChallengeName] = useState('');
  const [newChallengeTarget, setNewChallengeTarget] = useState(1000);
  const [newChallengeDeadline, setNewChallengeDeadline] = useState('');
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  const [editChallengeProgress, setEditChallengeProgress] = useState(0);
  const [editingChallengeDeadlineId, setEditingChallengeDeadlineId] = useState<string | null>(null);
  const [editChallengeDeadline, setEditChallengeDeadline] = useState('');

  // Confirm dialog state
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false, id: '', name: '',
  });

  const handleCreateChallenge = async () => {
    if (newChallengeName.trim() && newChallengeTarget > 0) {
      await addChantChallenge({
        name: newChallengeName,
        target: newChallengeTarget,
        deadline: newChallengeDeadline || undefined,
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
        await navigator.share({ title: 'My Chant Challenge', text: shareText });
      } catch (err) {
        /* Share failed or was cancelled — no action needed */
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Progress copied to clipboard!');
    }
  };

  return (
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
                      {challenge.progress} / {challenge.target} chants
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
                      <UploadIcon size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ isOpen: true, id: challenge.id, name: challenge.name })}
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

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Challenge"
        message={`Are you sure you want to delete "${confirmDelete.name}"? This cannot be undone.`}
        onConfirm={() => {
          removeChantChallenge(confirmDelete.id);
          setConfirmDelete({ isOpen: false, id: '', name: '' });
        }}
        onCancel={() => setConfirmDelete({ isOpen: false, id: '', name: '' })}
      />
    </motion.div>
  );
}
