/**
 * Metro Dash 3D - Mobile Vibration / Haptic Feedback System
 * Uses the Web Navigator Vibration API to provide subtle tactile sensory feedback.
 */

import { useGameStore } from '../store/gameStore';

export type HapticType = 'collision' | 'shield_break' | 'powerup' | 'near_miss';

const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  // Fatal crash: intense, jarring impact pattern
  collision: [120, 50, 220],
  // Shield absorption: crisp double impact
  shield_break: [70, 40, 90],
  // Power-up activation: uplifting pulse
  powerup: [40, 30, 65],
  // Near-miss event: sharp subtle adrenaline pulse
  near_miss: [35]
};

/**
 * Triggers vibration feedback on supported mobile devices
 */
export function triggerHaptic(type: HapticType): void {
  try {
    const isEnabled = useGameStore.getState().vibrationEnabled;
    if (!isEnabled) return;

    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(HAPTIC_PATTERNS[type]);
    }
  } catch {
    // Gracefully ignore any vibration exceptions on restricted browsers
  }
}
