/**
 * Metro Dash 3D - Game Canvas & Input Controller
 * Mounts Three.js WebGL canvas inside an isolated container with touch gestures & keyboard handlers.
 */

import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../../game/GameEngine';
import { useGameStore } from '../../store/gameStore';

interface GameCanvasProps {
  onEngineReady?: (engine: GameEngine) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onEngineReady }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Touch swipe state
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize 3D Engine once
    const engine = new GameEngine(mountRef.current);
    engineRef.current = engine;
    if (onEngineReady) onEngineReady(engine);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useGameStore.getState();
      
      // Escape or P to Pause
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (state.gameState === 'playing') state.pauseGame();
        else if (state.gameState === 'paused') state.resumeGame();
        return;
      }

      if (state.gameState !== 'playing') return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        engine.moveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        engine.moveRight();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        e.preventDefault();
        engine.jump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        engine.slide();
      } else if (e.key === 'b' || e.key === 'B' || e.key === 'h' || e.key === 'H') {
        // Deploy Hoverboard
        e.preventDefault();
        engine.deployHoverboard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Sync selected character changes with 3D model
  const selectedCharId = useGameStore(state => state.selectedCharacterId);
  const theme = useGameStore(state => state.environmentTheme);
  const graphicsQuality = useGameStore(state => state.graphicsQuality);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.spawnSelectedPlayer();
    }
  }, [selectedCharId]);

  // Touch Swipe & Double Tap Handlers for Mobile
  const lastTapTime = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    // Check double tap to deploy hoverboard (Subway Surfers signature control!)
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      engineRef.current?.deployHoverboard();
      lastTapTime.current = 0;
    } else {
      lastTapTime.current = now;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current || !engineRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    touchStartPos.current = null;

    const minSwipeDist = 28;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal Swipe
      if (dx < -minSwipeDist) {
        engineRef.current.moveLeft();
      } else if (dx > minSwipeDist) {
        engineRef.current.moveRight();
      }
    } else {
      // Vertical Swipe
      if (dy < -minSwipeDist) {
        engineRef.current.jump();
      } else if (dy > minSwipeDist) {
        engineRef.current.slide();
      }
    }
  };

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  );
};
