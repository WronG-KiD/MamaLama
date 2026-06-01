'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/StoreContext';
import { LEGENDS, type Legend } from '@/lib/legends';
import type { Tier } from '@/types';

interface Row {
  rank: number;
  name: string;
  title: string;        // tier title or earned title
  tier: Tier;
  puzzle: string;       // most recent / best puzzle
  emoji: string;
  xp: number;
  isYou: boolean;       // highlight the user's active profile
}

const TIER_LABEL: Record<Tier, string> = {
  SS: 'Galaxy Brain',
  S:  'Prophet of Puzzles',
  A:  'Master at Work',
  B:  'Puzzle Pro',
  C:  'Clever Cadet',
  D:  'Tiny Thinker'
};

function rankMedal(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

function rankRowClass(rank: number, isYou: boolean): string {
  let cls = '';
  if (rank === 1) cls = 'top';
  else if (rank === 2) cls = 'top-2';
  else if (rank === 3) cls = 'top-3';
  if (isYou) cls += ' you';
  return cls.trim();
}

export default function LeaderboardPage() {
  const { store, ready } = useStore();

  const ranked = useMemo<Row[]>(() => {
    // Merge fictional legends with real user profiles
    const rows: Omit<Row, 'rank' | 'isYou'>[] = [];

    // Real profiles (from localStorage)
    if (ready) {
      for (const p of store.profiles) {
        const bestSolve = p.solves.length > 0
          ? p.solves[p.solves.length - 1].productName
          : '—';
        rows.push({
          name: p.name,
          title: TIER_LABEL[p.tier as Tier] || p.tier,
          tier: p.tier as Tier,
          puzzle: bestSolve,
          emoji: p.avatar,
          xp: p.xp
        });
      }
    }

    // Fictional legends as seed data
    for (const l of LEGENDS) {
      rows.push({
        name: l.name,
        title: l.title,
        tier: l.tier,
        puzzle: l.puzzle,
        emoji: l.emoji,
        xp: l.xp
      });
    }

    // Sort by XP descending
    rows.sort((a, b) => b.xp - a.xp);

    // Assign ranks + mark "you" rows
    const activeId = store.activeProfileId;
    const activeName = store.profiles.find(p => p.id === activeId)?.name;

    return rows.map((row, i) => ({
      ...row,
      rank: i + 1,
      isYou: !!(activeName && row.name === activeName && row.xp === store.profiles.find(p => p.name === activeName)?.xp)
    }));
  }, [store, ready]);

  const yourRank = ranked.find(r => r.isYou)?.rank;

  return (
    <div className="view active">
      <section className="page-section">
        <Link href="/" className="back-home-link">← Back to home</Link>
        <div className="page-header">
          <h1>🏆 Sky Trail Leaderboard</h1>
          <p>This week&apos;s brainiest Llamas. Ranked by total XP earned from solves.</p>
        </div>

        {yourRank !== undefined && (
          <div className="info-card" style={{ maxWidth: 760, textAlign: 'center', background: 'linear-gradient(135deg, #ffe4f1, #c8b8ff)' }}>
            <h3 style={{ margin: '0 0 4px' }}>
              {yourRank <= 10 ? '🎉 You\'re in the Top 10!' : `Your current rank: ${rankMedal(yourRank)}`}
            </h3>
            <p style={{ margin: 0, color: 'var(--text-soft)' }}>
              {yourRank <= 10
                ? 'Keep climbing — the Galactic Maze Master awaits.'
                : `Log more solves on the ${yourRank <= 30 ? 'A' : 'B'} tier and beyond to climb the trail.`}
            </p>
          </div>
        )}

        {ranked.length === 0 && (
          <div className="info-card" style={{ textAlign: 'center' }}>
            <h2>No champions yet</h2>
            <p>Create a Sky Trail profile and log your first solve to appear here.</p>
            <Link href="/trail" className="btn-primary" style={{ marginTop: 12 }}>Start your Sky Trail →</Link>
          </div>
        )}

        {ranked.length > 0 && (
          <div className="leaderboard-list" style={{ maxWidth: 880 }}>
            {ranked.slice(0, 50).map(row => (
              <div key={`${row.name}-${row.rank}`} className={`leader-row ${rankRowClass(row.rank, row.isYou)}`}>
                <div className="leader-rank">{rankMedal(row.rank)}</div>
                <div className="leader-avatar">{row.emoji}</div>
                <div className="leader-info">
                  <div className="leader-name">
                    {row.name}
                    {row.isYou && (
                      <span style={{
                        marginLeft: 8, fontSize: 11, fontWeight: 700,
                        background: 'var(--pop-hot-pink)', color: 'white',
                        padding: '2px 8px', borderRadius: 10
                      }}>YOU</span>
                    )}
                  </div>
                  <div className="leader-title">{row.title}</div>
                </div>
                <div className="leader-puzzle">
                  <strong>{row.xp} XP</strong>
                  {row.puzzle && row.puzzle !== '—' && (
                    <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>last: {row.puzzle}</div>
                  )}
                </div>
                <div className={`leader-tier ${row.tier.toLowerCase()}`}>{row.tier}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
