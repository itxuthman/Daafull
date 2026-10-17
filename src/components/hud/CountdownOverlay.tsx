/**
 * Metro Dash 3D - Countdown Overlay (3, 2, 1, DASH!)
 * High-energy arcade launch countdown with whistle audio and smooth entrance animation.
 */

import React, { useEffect, useState } from 'react';
import { soundEngine } from '../../audio/SoundEngine';
import { GameEngine } from '../../game/GameEngine';
import { useGameStore } from '../../store/gameStore';

interface CountdownOverlayProps {
  engine: GameEngine | null;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ engine }) => {
  const [count, setCount] = useState<number | string>(3);
  const beginPlaying = useGameStore(state => state.beginPlaying);

  useEffect(() => {
    // Reset engine run physics
    if (engine) {
      engine.resetRun();
    }

    soundEngine.playWhistle();

    const t1 = setTimeout(() => {
      setCount(2);
      soundEngine.playWhistle();
    }, 800);

    const t2 = setTimeout(() => {
      setCount(1);
      soundEngine.playWhistle();
    }, 1600);

    const t3 = setTimeout(() => {
      setCount('DASH!');
      soundEngine.playPowerUp();
    }, 2400);

    const t4 = setTimeout(() => {
      beginPlaying();
    }, 3100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 pointer-events-none select-none">
      <div className="flex flex-col items-center animate-bounce">
        <span className="font-display text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 drop-shadow-[0_10px_25px_rgba(245,158,11,0.6)]">
          {count}
        </span>
        <span className="text-sm font-semibold tracking-widest uppercase text-slate-300 mt-2">
          INSPECTOR IS ON YOUR HEELS!
        </span>
      </div>
    </div>
  );
};
