'use client';

import { useEffect, useRef, useState } from 'react';
import type { Tier } from '@/types';

interface Champion {
  rank: number;
  name: string;
  title: string;
  tier: Tier;
  emoji: string;
  xp: number;
  puzzle?: string;
  isYou?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  champions: Champion[];   // ranked array (top first), we'll show top 10
  durationMs?: number;     // how long each slide stays before auto-advance
}

const TIER_GRADIENT: Record<Tier, string> = {
  SS: 'linear-gradient(180deg, #ff6fa8, #b8a4ff 50%, #76b8ff)',
  S:  'linear-gradient(180deg, #fff4c2, #ffe27a 50%, #ffb800)',
  A:  'linear-gradient(180deg, #ffd1d1, #ff8888 50%, #ef4444)',
  B:  'linear-gradient(180deg, #c5f0de, #4ad9a3 50%, #10b981)',
  C:  'linear-gradient(180deg, #cfe4ff, #76b8ff 50%, #3b82f6)',
  D:  'linear-gradient(180deg, #ffe4f1, #ffaad6 50%, #f472b6)'
};

const CROWN: Record<number, string> = { 1: '👑', 2: '🥈', 3: '🥉' };

export default function LeaderboardStoryModal({
  open,
  onClose,
  champions,
  durationMs = 5000
}: Props) {
  const top = champions.slice(0, 10);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const fillRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Reset to first slide whenever the modal opens
  useEffect(() => {
    if (open) {
      setIdx(0);
      setPaused(false);
    }
  }, [open]);

  // Auto-advance
  useEffect(() => {
    if (!open || paused || top.length === 0) return;
    timerRef.current = window.setTimeout(() => {
      if (idx >= top.length - 1) onClose();
      else setIdx(i => i + 1);
    }, durationMs);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [open, idx, paused, top.length, durationMs, onClose]);

  // Drive the progress-bar fill widths
  useEffect(() => {
    if (!open) return;
    fillRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i < idx) {
        el.style.transition = 'none';
        el.style.width = '100%';
      } else if (i === idx) {
        el.style.transition = 'none';
        el.style.width = '0%';
        // next frame, animate it
        requestAnimationFrame(() => {
          if (!el) return;
          el.style.transition = paused ? 'none' : `width ${durationMs}ms linear`;
          el.style.width = '100%';
        });
      } else {
        el.style.transition = 'none';
        el.style.width = '0%';
      }
    });
  }, [idx, paused, open, durationMs]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1));
      else if (e.key === 'ArrowRight') setIdx(i => Math.min(top.length - 1, i + 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, top.length, onClose]);

  if (!open || top.length === 0) return null;

  const c = top[idx];

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="lb-story-container"
        style={{ background: TIER_GRADIENT[c.tier] }}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Progress bars at top */}
        <div className="lb-story-progress">
          {top.map((_, i) => (
            <div key={i} className="bar">
              <div ref={(el) => { fillRefs.current[i] = el; }} className="fill" />
            </div>
          ))}
        </div>

        {/* Close */}
        <button className="lb-story-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Rank badge */}
        <div className="lb-story-rank-badge">
          {CROWN[c.rank] || `#${c.rank}`} · Rank {c.rank} of {top.length}
        </div>

        {/* Body */}
        <div className="lb-story-body">
          <div className="lb-story-crown">{c.rank === 1 ? '👑' : c.rank === 2 ? '🥈' : c.rank === 3 ? '🥉' : '⭐'}</div>
          <div className="lb-story-avatar">{c.emoji}</div>
          <div className="lb-story-name">{c.name}{c.isYou ? ' (You!)' : ''}</div>
          <div className="lb-story-title">{c.title}</div>

          <div className="lb-story-xp-pill">
            ⭐ <strong>{c.xp.toLocaleString()} XP</strong>
          </div>

          {c.puzzle && (
            <div className="lb-story-conquest">
              <small>Most recent solve</small>
              <strong>{c.puzzle}</strong>
            </div>
          )}

          <div className="lb-story-tier-display">
            <span className="mini-badge" style={{ background: 'rgba(255,255,255,0.95)', color: '#2b2147' }}>
              {c.tier}
            </span>
            <span>{c.tier} Tier</span>
          </div>
        </div>

        {/* Tap zones for navigation */}
        <div
          className="lb-story-tap left"
          onClick={() => setIdx(i => Math.max(0, i - 1))}
          aria-label="Previous"
        />
        <div
          className="lb-story-tap right"
          onClick={() => {
            if (idx >= top.length - 1) onClose();
            else setIdx(i => i + 1);
          }}
          aria-label="Next"
        />
      </div>
    </div>
  );
}
