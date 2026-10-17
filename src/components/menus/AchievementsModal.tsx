/**
 * Metro Dash 3D - Achievements Modal
 * Career milestones, trophies, and runner badges.
 */

import React from 'react';
import { X, Trophy, CheckCircle2, Lock } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface AchievementsModalProps {
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose }) => {
  const achievements = useGameStore(state => state.achievements);

  return (
    <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              TROPHIES & AWARDS
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Subway milestones and athletic honors
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

        {/* Achievements Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          {achievements.map(a => {
            const progressPct = Math.min(100, (a.progress / a.target) * 100);

            return (
              <div
                key={a.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  a.unlocked
                    ? 'bg-purple-950/30 border-purple-500/40'
                    : 'bg-slate-800/40 border-slate-700/60 opacity-80'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    a.unlocked ? 'bg-purple-900/60 border border-purple-500/50' : 'bg-slate-800 border border-slate-700'
                  }`}
                >
                  {a.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-white truncate">
                      {a.title}
                    </h3>
                    {a.unlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 ml-1" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {a.description}
                  </p>

                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>{a.unlocked ? 'UNLOCKED' : 'PROGRESS'}</span>
                      <span>
                        {Math.min(a.progress, a.target)} / {a.target}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${a.unlocked ? 'bg-purple-400' : 'bg-slate-500'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
