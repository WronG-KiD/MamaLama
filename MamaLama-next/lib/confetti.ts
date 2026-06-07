'use client';

import confetti from 'canvas-confetti';

// MamaLama brand-colored confetti bursts.
// Used on order success, tier promotion, big wins.

const BRAND_COLORS = ['#ff3b8b', '#8b5cf6', '#ffd93d', '#10b981', '#ff6fa8', '#76b8ff'];

export function celebratoryBurst(): void {
  const end = Date.now() + 1200;
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors: BRAND_COLORS
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors: BRAND_COLORS
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  // Big centre burst at the start
  confetti({
    particleCount: 130,
    spread: 80,
    origin: { y: 0.55 },
    colors: BRAND_COLORS,
    startVelocity: 45,
    scalar: 1.1
  });
}

export function tierPromotionBurst(): void {
  // Bigger, slower, more "star burst" feeling
  const defaults = {
    spread: 360,
    ticks: 80,
    gravity: 0.6,
    decay: 0.94,
    startVelocity: 35,
    colors: BRAND_COLORS,
    shapes: ['star' as const, 'circle' as const]
  };
  confetti({ ...defaults, particleCount: 60, scalar: 1.2 });
  setTimeout(() => confetti({ ...defaults, particleCount: 50, scalar: 0.9 }), 200);
  setTimeout(() => confetti({ ...defaults, particleCount: 40, scalar: 0.7 }), 400);
}
