/**
 * Metro Dash 3D - Settings Modal
 * Audio volume sliders, graphics fidelity toggles, theme switcher, and controls reference.
 */

import React from 'react';
import { 
  X, 
  Volume2, 
  Music, 
  Monitor, 
  Sun, 
  Moon, 
  Sunset, 
  RotateCcw, 
  Keyboard,
  Smartphone
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { EnvironmentTheme } from '../../types/game';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const musicEnabled = useGameStore(state => state.musicEnabled);
  const soundVolume = useGameStore(state => state.soundVolume);
  const musicVolume = useGameStore(state => state.musicVolume);
  const vibrationEnabled = useGameStore(state => state.vibrationEnabled);
  const graphicsQuality = useGameStore(state => state.graphicsQuality);
  const environmentTheme = useGameStore(state => state.environmentTheme);

  const setSoundEnabled = useGameStore(state => state.setSoundEnabled);
  const setMusicEnabled = useGameStore(state => state.setMusicEnabled);
  const setSoundVolume = useGameStore(state => state.setSoundVolume);
  const setMusicVolume = useGameStore(state => state.setMusicVolume);
  const setVibrationEnabled = useGameStore(state => state.setVibrationEnabled);
  const setGraphicsQuality = useGameStore(state => state.setGraphicsQuality);
  const setTheme = useGameStore(state => state.setTheme);
  const resetProgress = useGameStore(state => state.resetProgress);

  return (
    <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              GAME SETTINGS
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize audio, visual atmosphere, and controls
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Settings Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Audio Controls */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              AUDIO & MUSIC
            </h3>

            {/* Sound FX */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-sky-400" />
                <span className="text-sm font-semibold text-slate-200">Sound Effects</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundEnabled ? soundVolume : 0}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setSoundVolume(val);
                    if (!soundEnabled && val > 0) setSoundEnabled(true);
                  }}
                  className="w-24 md:w-32 accent-sky-400 cursor-pointer"
                />
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    soundEnabled
                      ? 'bg-sky-600/30 text-sky-300 border-sky-500/50'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {soundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Music */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-semibold text-slate-200">Background Music</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicEnabled ? musicVolume : 0}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setMusicVolume(val);
                    if (!musicEnabled && val > 0) setMusicEnabled(true);
                  }}
                  className="w-24 md:w-32 accent-amber-400 cursor-pointer"
                />
                <button
                  onClick={() => setMusicEnabled(!musicEnabled)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    musicEnabled
                      ? 'bg-amber-600/30 text-amber-300 border-amber-500/50'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {musicEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Haptic Vibration */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-sm font-semibold text-slate-200">Haptic Vibration</span>
                  <p className="text-[11px] text-slate-400">Tactile pulses for collisions, power-ups, and near-misses</p>
                </div>
              </div>
              <button
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer shrink-0 ${
                  vibrationEnabled
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {vibrationEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </section>

          {/* Graphics Fidelity */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              GRAPHICS & ENVIRONMENT
            </h3>

            {/* Quality Mode */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-sm font-semibold text-slate-200">Quality Preset</span>
                  <p className="text-[11px] text-slate-400">High enables real-time soft shadows</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-700">
                <button
                  onClick={() => setGraphicsQuality('high')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    graphicsQuality === 'high' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  High
                </button>
                <button
                  onClick={() => setGraphicsQuality('low')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    graphicsQuality === 'low' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Smooth
                </button>
              </div>
            </div>

            {/* Environment Themes */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-200">Subway Atmosphere</span>
              <div className="flex items-center gap-2">
                {[
                  { id: 'metro', label: 'Downtown', icon: Sun },
                  { id: 'neon', label: 'Neon Night', icon: Moon },
                  { id: 'sunset', label: 'Sunset Yard', icon: Sunset },
                ].map(item => {
                  const Icon = item.icon;
                  const isCur = environmentTheme === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTheme(item.id as EnvironmentTheme)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isCur
                          ? 'bg-sky-600 text-white border-sky-400'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Controls Cheat Sheet */}
          <section className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-sky-400" />
              <span>CONTROLS CHEAT SHEET</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400">Change Lanes:</span>
                <span className="font-mono font-bold text-white">A / D or ← / →</span>
              </div>
              <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400">Jump / Leap:</span>
                <span className="font-mono font-bold text-white">W / Space / ↑</span>
              </div>
              <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400">Slide Under:</span>
                <span className="font-mono font-bold text-white">S / ↓</span>
              </div>
              <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400">Mobile Swipes:</span>
                <span className="font-mono font-bold text-white">Swipe 4-Way</span>
              </div>
            </div>
          </section>

          {/* Reset Save Data */}
          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => {
                if (window.confirm('Reset all saved high scores, coins, and unlocks?')) {
                  resetProgress();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Game Progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
