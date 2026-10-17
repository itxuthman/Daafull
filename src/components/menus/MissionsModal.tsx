/**
 * Metro Dash 3D - Missions Modal
 * Active challenges, progress tracking, and coin rewards.
 */

import React from 'react';
import { X, Award, CheckCircle2, Gift, Coins } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface MissionsModalProps {
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({ onClose }) => {
  const missions = useGameStore(state => state.missions);
  const claimMission = useGameStore(state => state.claimMission);
  const totalCoins = useGameStore(state => state.totalCoins);

  return (
    <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              DAILY MISSIONS
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete sprint challenges on the subway tracks for coin rewards
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

        {/* Mission List */}
        <div className="p-6 flex flex-col gap-3.5 overflow-y-auto">
          {missions.map(m => {
            const progressPercent = Math.min(100, (m.current / m.target) * 100);

            return (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/70 hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-bold text-white">
                      {m.title}
                    </h3>
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      +{m.reward}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1">
                    {m.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>PROGRESS</span>
                      <span>
                        {Math.min(m.current, m.target).toLocaleString()} / {m.target.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/70 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {m.claimed ? (
                    <div className="px-4 py-2 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>CLAIMED</span>
                    </div>
                  ) : m.completed ? (
                    <button
                      onClick={() => claimMission(m.id)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Gift className="w-4 h-4" />
                      <span>CLAIM REWARD</span>
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-slate-800/80 text-slate-400 border border-slate-700/60 rounded-xl text-xs font-semibold text-center">
                      IN PROGRESS
                    </div>
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
