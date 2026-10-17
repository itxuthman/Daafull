/**
 * Metro Dash 3D - Character Selection Modal
 * Browse, unlock, and select stylized 3D runners with distinct abilities and color palettes.
 */

import React from 'react';
import { X, Lock, Check, Sparkles, Coins } from 'lucide-react';
import { CHARACTERS, useGameStore } from '../../store/gameStore';

interface CharacterSelectModalProps {
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({ onClose }) => {
  const selectedCharacterId = useGameStore(state => state.selectedCharacterId);
  const unlockedCharacters = useGameStore(state => state.unlockedCharacters);
  const totalCoins = useGameStore(state => state.totalCoins);
  const selectCharacter = useGameStore(state => state.selectCharacter);
  const unlockCharacter = useGameStore(state => state.unlockCharacter);

  return (
    <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              SELECT RUNNER
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Unlock distinct subway athletes with passive abilities
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

        {/* Character Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          {CHARACTERS.map(char => {
            const isUnlocked = unlockedCharacters.includes(char.id);
            const isSelected = selectedCharacterId === char.id;
            const canAfford = totalCoins >= char.cost;

            return (
              <div
                key={char.id}
                className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-950/40 border-sky-500 shadow-[0_0_20px_rgba(2,132,199,0.25)]'
                    : isUnlocked
                    ? 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                    : 'bg-slate-900/60 border-slate-800 opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
                        {char.title}
                      </span>
                      <h3 className="font-display text-xl font-bold text-white mt-0.5">
                        {char.name}
                      </h3>
                    </div>

                    {/* Outfit Color Swatches */}
                    <div className="flex items-center gap-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full ring-1 ring-white/20"
                        style={{ backgroundColor: char.colors.jacket }}
                        title="Jacket color"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full ring-1 ring-white/20"
                        style={{ backgroundColor: char.colors.shoes }}
                        title="Sneakers color"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {char.description}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-500/20 px-2.5 py-1 rounded-md">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{char.specialty}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  {isSelected ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                      <Check className="w-4 h-4" />
                      <span>SELECTED</span>
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => selectCharacter(char.id)}
                      className="w-full py-2 px-4 rounded-xl bg-slate-700 hover:bg-sky-600 text-white font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                    >
                      SELECT
                    </button>
                  ) : (
                    <button
                      onClick={() => unlockCharacter(char.id)}
                      disabled={!canAfford}
                      className={`w-full py-2 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>UNLOCK · {char.cost.toLocaleString()} COINS</span>
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
