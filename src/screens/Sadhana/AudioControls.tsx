import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Play, Pause, Repeat, Upload } from 'lucide-react';
import { useStore } from '../../lib/store';

const DEFAULT_AUDIO_TRACKS = [
  { id: '1', name: 'Distant Chants', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: '2', name: 'Gentle Rain', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: '3', name: 'Forest Ambiance', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export function AudioControls() {
  const { customTracks, addCustomTrack } = useStore();

  const allTracks = useMemo(
    () => [...DEFAULT_AUDIO_TRACKS, ...customTracks],
    [customTracks]
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLooping, setIsLooping] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState(allTracks[0]);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showAudioControls, setShowAudioControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  // If selected track was removed, revert to default
  useEffect(() => {
    if (!allTracks.find(t => t.id === selectedTrack.id)) {
      setSelectedTrack(allTracks[0]);
    }
  }, [allTracks, selectedTrack.id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = ''; // Fix: release old audio resource
    }

    audioRef.current = new Audio(selectedTrack.url);
    audioRef.current.loop = isLooping;
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const updateProgress = () => setAudioProgress(audio.currentTime);
    const updateDuration = () => setAudioDuration(audio.duration);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);

    if (isPlayingRef.current) {
      audio.play().catch(() => {/* autoplay may be blocked */});
    }

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.pause();
      audio.src = ''; // Fix: cleanup on unmount
    };
  }, [selectedTrack]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = isLooping;
  }, [isLooping]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    const next = !isPlaying;
    setIsPlaying(next);
    isPlayingRef.current = next;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioProgress(time);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
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
  );
}
