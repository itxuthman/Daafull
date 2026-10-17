/**
 * Metro Dash 3D - Main Application Entry
 * Orchestrates 3D GameCanvas, HUD, Countdowns, and Menu Modals.
 */

import React, { useState } from 'react';
import { GameCanvas } from './components/game/GameCanvas';
import { GameHUD } from './components/hud/GameHUD';
import { CountdownOverlay } from './components/hud/CountdownOverlay';
import { MainMenu } from './components/menus/MainMenu';
import { PauseModal } from './components/menus/PauseModal';
import { GameOverModal } from './components/menus/GameOverModal';
import { SpeedLines } from './components/effects/SpeedLines';
import { GameEngine } from './game/GameEngine';
import { useGameStore } from './store/gameStore';

export default function App() {
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const gameState = useGameStore(state => state.gameState);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Viewport */}
      <GameCanvas onEngineReady={setEngine} />

      {/* Speed Lines VFX */}
      <SpeedLines />

      {/* State-driven Overlays */}
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'countdown' && <CountdownOverlay engine={engine} />}
      {gameState === 'playing' && <GameHUD engine={engine} />}
      {gameState === 'paused' && (
        <>
          <GameHUD engine={engine} />
          <PauseModal />
        </>
      )}
      {gameState === 'gameover' && <GameOverModal />}
    </main>
  );
}
