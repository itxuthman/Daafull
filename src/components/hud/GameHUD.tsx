/**
 * Metro Dash 3D - In-Game HUD Overlay
 * Displays live score, coins, distance, active power-up duration bars, and responsive touch controls.
 */

import React from 'react';
import { 
  Coins, 
  Gauge, 
  MapPin, 
  Pause, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown 
} from 'lucide-react';
import { GameEngine } from '../../game/GameEngine';
import { useGameStore } from '../../store/gameStore';
import { PowerUpType } from '../../types/game';

interface GameHUDProps {
  engine: GameEngine | null;
}

const POWERUP_ICONS: Record<PowerUpType, { label: string; color: string }> = {
  hoverboard: { label: 'HOVERBOARD', color: 'bg-emerald-500' },
  magnet: { label: 'MAGNET', color: 'bg-red-500' },
  jetpack: { label: 'JETPACK', color: 'bg-sky-500' },
  sneakers: { label: 'SNEAKERS', color: 'bg-amber-500' },
  multiplier: { label: '2X SCORE', color: 'bg-purple-500' },
  shield: { label: 'SHIELD', color: 'bg-cyan-500' },
  speed: { label: 'HYPER DASH', color: 'bg-yellow-400' }
};

export const GameHUD: React.FC<GameHUDProps> = ({ engine }) => {
  const score = useGameStore(state => state.score);
  const coins = useGameStore(state => state.coins);
  const distance = useGameStore(state => state.distance);
  const currentSpeed = useGameStore(state => state.currentSpeed);
  const activePowerUps = useGameStore(state => state.activePowerUps);
  const shieldActive = useGameStore(state => state.shieldActive);
  const pauseGame = useGameStore(state => state.pauseGame);

  const activeEntries = Object.entries(activePowerUps).filter(([_, p]) => p && p.remaining > 0);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-20">
      {/* Top Header Strip: Stats, Coins & Pause */}
      <header className="flex items-start justify-between w-full">
        {/* Left: Score & Distance */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">SCORE</span>
            <span className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white tabular-nums drop-shadow-md">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700/60 backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span className="tabular-nums font-display">{distance}m</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700/60 backdrop-blur-sm">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span className="tabular-nums font-display">{currentSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* Right: Coins Collected & Pause Button */}
        <div className="flex items-center gap-3">
          {/* Active Shield Icon */}
          {shieldActive && (
            <div className="flex items-center gap-1.5 bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold tracking-wider">SHIELD ON</span>
            </div>
          )}

          {/* Current Run Coins */}
          <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-500/50 px-3.5 py-1.5 rounded-lg backdrop-blur-sm">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-display font-bold text-amber-300 text-lg tabular-nums">
              {coins}
            </span>
          </div>

          {/* Pause Button */}
          <button
            onClick={pauseGame}
            aria-label="Pause Game"
            className="pointer-events-auto p-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-600 transition-all cursor-pointer shadow-md"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Middle-Right: Active Power-Up Timers */}
      {activeEntries.length > 0 && (
        <aside className="self-end flex flex-col gap-2 my-auto">
          {activeEntries.map(([key, pw]) => {
            if (!pw) return null;
            const meta = POWERUP_ICONS[key as PowerUpType] || { label: key, color: 'bg-emerald-500' };
            const percent = Math.max(0, Math.min(100, (pw.remaining / pw.duration) * 100));

            return (
              <div
                key={key}
                className="w-36 bg-slate-900/90 border border-slate-700/80 rounded-lg p-2 backdrop-blur-sm flex flex-col gap-1 shadow-lg"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span className="tracking-wide">{meta.label}</span>
                  <span className="tabular-nums font-mono text-slate-400">
                    {Math.ceil(pw.remaining)}s
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${meta.color}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </aside>
      )}

      {/* Bottom Area: Touch Controls for Mobile Devices */}
      <footer className="w-full flex items-end justify-between pb-2 md:hidden">
        {/* Left/Right Lane buttons */}
        <div className="pointer-events-auto flex gap-2">
          <button
            onClick={() => engine?.moveLeft()}
            aria-label="Move Left"
            className="w-14 h-14 rounded-2xl bg-slate-900/85 active:bg-sky-600 text-white border border-slate-700/80 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>
          <button
            onClick={() => engine?.moveRight()}
            aria-label="Move Right"
            className="w-14 h-14 rounded-2xl bg-slate-900/85 active:bg-sky-600 text-white border border-slate-700/80 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>

        {/* Jump & Slide buttons */}
        <div className="pointer-events-auto flex gap-2">
          <button
            onClick={() => engine?.slide()}
            aria-label="Slide"
            className="w-14 h-14 rounded-2xl bg-slate-900/85 active:bg-amber-600 text-white border border-slate-700/80 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <ArrowDown className="w-7 h-7" />
          </button>
          <button
            onClick={() => engine?.jump()}
            aria-label="Jump"
            className="w-14 h-14 rounded-2xl bg-sky-600 active:bg-sky-500 text-white border border-sky-400 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <ArrowUp className="w-7 h-7" />
          </button>
        </div>
      </footer>
    </div>
  );
};
