/**
 * Metro Dash 3D - Pause Screen Modal
 * Clean overlay allowing resume, run restart, audio control, and return to main menu.
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const PauseModal: React.FC = () => {
  const resumeGame = useGameStore(state => state.resumeGame);
  const startCountdown = useGameStore(state => state.startCountdown);
  const returnToMenu = useGameStore(state => state.returnToMenu);
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const setSoundEnabled = useGameStore(state => state.setSoundEnabled);

  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-5 text-center animate-in fade-in zoom-in-95 duration-150">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-white tracking-tight">
            GAME PAUSED
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Catch your breath before returning to the rails
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={resumeGame}
            className="w-full py-3.5 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-display font-bold text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>RESUME RUN</span>
          </button>

          <button
            onClick={startCountdown}
            className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART</span>
          </button>

          <button
            onClick={returnToMenu}
            className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>

        {/* Quick Audio Mute Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer pt-2"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-sky-400" />
              <span>Sound is ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-500" />
              <span>Sound is MUTED</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
