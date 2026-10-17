/**
 * Metro Dash 3D - Game Over Modal
 * Post-run statistics, high-score fanfare with confetti, mission updates, and replay CTA.
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  Home, 
  Trophy, 
  Coins, 
  MapPin, 
  Gauge, 
  Sparkles 
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const GameOverModal: React.FC = () => {
  const lastRunStats = useGameStore(state => state.lastRunStats);
  const highScore = useGameStore(state => state.highScore);
  const totalCoins = useGameStore(state => state.totalCoins);
  const startCountdown = useGameStore(state => state.startCountdown);
  const returnToMenu = useGameStore(state => state.returnToMenu);

  const isNewHighScore = lastRunStats && lastRunStats.score >= highScore && lastRunStats.score > 0;

  useEffect(() => {
    if (isNewHighScore) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  }, [isNewHighScore]);

  if (!lastRunStats) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div>
          {isNewHighScore ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wider uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>NEW BEST RECORD!</span>
            </div>
          ) : (
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              RUN TERMINATED
            </span>
          )}

          <h2 className="font-display text-4xl font-extrabold text-white tracking-tight">
            CAUGHT BY INSPECTOR!
          </h2>
        </div>

        {/* Big Score Display */}
        <div className="w-full py-4 px-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            FINAL SCORE
          </span>
          <span className="font-display text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 tabular-nums mt-1">
            {lastRunStats.score.toLocaleString()}
          </span>

          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>High Score:</span>
            <span className="font-mono font-bold text-white tabular-nums">
              {highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2 text-xs">
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col items-center">
            <Coins className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-400">Coins</span>
            <span className="font-display font-bold text-white text-base tabular-nums">
              +{lastRunStats.coins}
            </span>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col items-center">
            <MapPin className="w-4 h-4 text-sky-400 mb-1" />
            <span className="text-[10px] text-slate-400">Distance</span>
            <span className="font-display font-bold text-white text-base tabular-nums">
              {lastRunStats.distance}m
            </span>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col items-center">
            <Gauge className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[10px] text-slate-400">Top Speed</span>
            <span className="font-display font-bold text-white text-base tabular-nums">
              {lastRunStats.maxSpeed}k
            </span>
          </div>
        </div>

        {/* Banked Coins Total */}
        <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <span>Total Banked:</span>
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-amber-300 font-mono">
            {totalCoins.toLocaleString()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={startCountdown}
            className="w-full py-4 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-display font-bold text-lg tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={returnToMenu}
            className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
