/**
 * Metro Dash 3D - Speed Lines VFX Overlay
 * Radial motion streaks during jetpack flight, hyper speed boost, and high velocity sprints.
 */

import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const SpeedLines: React.FC = () => {
  const activePowerUps = useGameStore(state => state.activePowerUps);
  const currentSpeed = useGameStore(state => state.currentSpeed);
  const gameState = useGameStore(state => state.gameState);

  if (gameState !== 'playing') return null;

  const isHyper = !!activePowerUps.speed || !!activePowerUps.jetpack || currentSpeed > 75;
  if (!isHyper) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-70">
      {/* Dynamic Streaks */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(56,189,248,0.18)_100%)]" />
      
      {/* Vertical Speed Line Strips */}
      <div className="absolute inset-x-0 inset-y-0 flex justify-between px-6 pointer-events-none">
        <div className="w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent speed-line opacity-50" />
        <div className="w-1 h-full bg-gradient-to-b from-transparent via-sky-300 to-transparent speed-line opacity-70 [animation-delay:0.1s]" />
        <div className="w-0.5 h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent speed-line opacity-40 [animation-delay:0.2s]" />
        <div className="w-1 h-full bg-gradient-to-b from-transparent via-cyan-300 to-transparent speed-line opacity-60 [animation-delay:0.15s]" />
      </div>
    </div>
  );
};
