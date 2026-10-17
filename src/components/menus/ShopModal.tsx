/**
 * Metro Dash 3D - Shop & Upgrades Modal
 * Upgrade power-up durations and unlock advantages using earned subway coins.
 */

import React from 'react';
import { X, ArrowUpCircle, Coins, Sparkles, Check } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { PowerUpType } from '../../types/game';

interface ShopModalProps {
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ onClose }) => {
  const totalCoins = useGameStore(state => state.totalCoins);
  const upgrades = useGameStore(state => state.upgrades);
  const upgradePowerUp = useGameStore(state => state.upgradePowerUp);

  const upgradeList = Object.values(upgrades);

  return (
    <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              POWER-UP UPGRADES
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanently boost the duration and efficiency of track power-ups
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-amber-500/30">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-display font-bold text-amber-300 text-sm tabular-nums">
                {totalCoins.toLocaleString()}
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Upgrade Cards List */}
        <div className="p-6 flex flex-col gap-3.5 overflow-y-auto">
          {upgradeList.map(item => {
            const isMax = item.level >= item.maxLevel;
            const cost = Math.round(item.baseCost * Math.pow(item.costMultiplier, item.level - 1));
            const canAfford = totalCoins >= cost && !isMax;
            const currentDuration = item.baseDuration + (item.level - 1) * item.durationPerLevel;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/70 hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-white">
                      {item.name}
                    </h3>
                    <span className="text-[11px] font-mono text-sky-400 font-semibold px-2 py-0.5 bg-sky-950/60 rounded border border-sky-800/50">
                      {currentDuration}s Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1">
                    {item.description}
                  </p>

                  {/* Level Bars */}
                  <div className="flex items-center gap-1.5 mt-2.5">
                    {Array.from({ length: item.maxLevel }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 flex-1 rounded-full ${
                          idx < item.level ? 'bg-amber-400' : 'bg-slate-700'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-mono text-slate-400 ml-2">
                      LVL {item.level}/{item.maxLevel}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isMax ? (
                    <div className="px-4 py-2 bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>MAX LEVEL</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => upgradePowerUp(item.id)}
                      disabled={!canAfford}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      <span>UPGRADE · {cost.toLocaleString()} COINS</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
