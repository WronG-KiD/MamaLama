'use client';

import { useStore } from '@/lib/StoreContext';

const TIER_LABELS: Record<string, string> = {
  D: 'Tiny Thinker', C: 'Clever Cadet', B: 'Puzzle Pro',
  A: 'Master at Work', S: 'Prophet of Puzzles', SS: 'Galaxy Brain'
};

export function WelcomeBubble() {
  const { store, ready } = useStore();
  const active = ready ? store.profiles.find(p => p.id === store.activeProfileId) : null;

  if (active) {
    return (
      <div className="hero-welcome-bubble" id="welcomeBubble">
        Welcome back, <strong>{active.name}</strong>! {active.avatar}
        <br />
        <small style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 500 }}>
          {active.tier} Tier · {TIER_LABELS[active.tier] || ''} · {active.xp} XP
        </small>
      </div>
    );
  }

  return (
    <div className="hero-welcome-bubble" id="welcomeBubble">
      Hi friend! Ready to play and learn? 🌟
    </div>
  );
}
