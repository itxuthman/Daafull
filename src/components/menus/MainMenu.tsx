/**
 * Metro Dash 3D - Main Menu Screen
 * Displays 3D character in idle showcase with ergonomic bottom dock for shop, missions, and runners.
 */

import React, { useState } from 'react';
import { 
  Play, 
  Users, 
  ShoppingBag, 
  Award, 
  Trophy, 
  Settings as SettingsIcon, 
  Coins, 
  Volume2, 
  VolumeX, 
  Zap 
} from 'lucide-react';
import { CHARACTERS, useGameStore } from '../../store/gameStore';
import { AchievementsModal } from './AchievementsModal';
import { CharacterSelectModal } from './CharacterSelectModal';
import { MissionsModal } from './MissionsModal';
import { SettingsModal } from './SettingsModal';
import { ShopModal } from './ShopModal';

export const MainMenu: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'none' | 'characters' | 'shop' | 'missions' | 'achievements' | 'settings'>('none');
  
  const highScore = useGameStore(state => state.highScore);
  const totalCoins = useGameStore(state => state.totalCoins);
  const selectedCharacterId = useGameStore(state => state.selectedCharacterId);
  const startCountdown = useGameStore(state => state.startCountdown);
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const setSoundEnabled = useGameStore(state => state.setSoundEnabled);
  const missions = useGameStore(state => state.missions);

  const selectedChar = CHARACTERS.find(c => c.id === selectedCharacterId) || CHARACTERS[0];
  const claimableMissions = missions.filter(m => m.completed && !m.claimed).length;

  return (
    <>
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-20 select-none">
        {/* Top Header: Game Title & Banked Coins */}
        <header className="flex items-start justify-between w-full max-w-5xl mx-auto pointer-events-auto">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
              METRO DASH <span className="text-sky-400">3D</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mt-0.5">
              ENDLESS RAILWAY RUNNER
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Banked Coins */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/40 px-3.5 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-display font-bold text-amber-300 text-base md:text-lg tabular-nums">
                {totalCoins.toLocaleString()}
              </span>
            </div>

            {/* Quick Mute Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
              className="p-2 rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-sky-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </button>
          </div>
        </header>

        {/* Center-Top: Best Score & Character Info */}
        <div className="self-center flex flex-col items-center gap-2 pointer-events-auto mt-4">
          <div className="bg-slate-900/80 border border-slate-700/70 px-4 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-2 shadow-md">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400 font-medium">BEST SCORE:</span>
            <span className="font-display font-bold text-white text-base tabular-nums">
              {highScore.toLocaleString()}
            </span>
          </div>

          <div className="text-center">
            <span className="text-xs text-sky-400 font-semibold tracking-wider uppercase">
              {selectedChar.title}
            </span>
            <p className="text-sm font-bold text-white drop-shadow">
              {selectedChar.name}
            </p>
          </div>
        </div>

        {/* Center: Big Animated START RUN Button */}
        <div className="self-center pointer-events-auto flex flex-col items-center gap-3 my-auto">
          <button
            onClick={startCountdown}
            className="group relative px-10 py-5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-display font-extrabold text-2xl md:text-3xl tracking-wider rounded-2xl shadow-[0_10px_35px_rgba(2,132,199,0.5)] hover:shadow-[0_15px_45px_rgba(2,132,199,0.7)] active:scale-95 transition-all cursor-pointer flex items-center gap-3 border border-sky-300/40"
          >
            <Play className="w-8 h-8 fill-white group-hover:scale-110 transition-transform" />
            <span>START RUN</span>
          </button>
          <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
            PRESS SPACE OR TAP TO DASH
          </span>
        </div>

        {/* Ergonomic Bottom Navigation Dock (SKILL.md Directive: Unified Bottom Control Dock) */}
        <footer className="w-full max-w-2xl mx-auto pointer-events-auto">
          <nav className="bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 flex items-center justify-around shadow-2xl backdrop-blur-md">
            <button
              onClick={() => setActiveModal('characters')}
              className="flex-1 py-2 px-1 flex flex-col items-center gap-1 text-slate-300 hover:text-sky-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
            >
              <Users className="w-5 h-5 text-sky-400" />
              <span className="text-[11px] font-semibold whitespace-nowrap">Runners</span>
            </button>

            <button
              onClick={() => setActiveModal('shop')}
              className="flex-1 py-2 px-1 flex flex-col items-center gap-1 text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span className="text-[11px] font-semibold whitespace-nowrap">Upgrades</span>
            </button>

            <button
              onClick={() => setActiveModal('missions')}
              className="relative flex-1 py-2 px-1 flex flex-col items-center gap-1 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
            >
              <Award className="w-5 h-5 text-emerald-400" />
              <span className="text-[11px] font-semibold whitespace-nowrap">Missions</span>
              {claimableMissions > 0 && (
                <span className="absolute top-1.5 right-4 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              )}
            </button>

            <button
              onClick={() => setActiveModal('achievements')}
              className="flex-1 py-2 px-1 flex flex-col items-center gap-1 text-slate-300 hover:text-purple-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
            >
              <Trophy className="w-5 h-5 text-purple-400" />
              <span className="text-[11px] font-semibold whitespace-nowrap">Trophies</span>
            </button>

            <button
              onClick={() => setActiveModal('settings')}
              className="flex-1 py-2 px-1 flex flex-col items-center gap-1 text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
            >
              <SettingsIcon className="w-5 h-5 text-slate-400" />
              <span className="text-[11px] font-semibold whitespace-nowrap">Settings</span>
            </button>
          </nav>
        </footer>
      </div>

      {/* Modals */}
      {activeModal === 'characters' && <CharacterSelectModal onClose={() => setActiveModal('none')} />}
      {activeModal === 'shop' && <ShopModal onClose={() => setActiveModal('none')} />}
      {activeModal === 'missions' && <MissionsModal onClose={() => setActiveModal('none')} />}
      {activeModal === 'achievements' && <AchievementsModal onClose={() => setActiveModal('none')} />}
      {activeModal === 'settings' && <SettingsModal onClose={() => setActiveModal('none')} />}
    </>
  );
};
