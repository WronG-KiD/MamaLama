'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/StoreContext';
import { LEGENDS } from '@/lib/legends';
import { fetchPublicLeaderboard, type PublicLeaderboardEntry } from '@/lib/firestoreProfiles';
import LeaderboardStoryModal from '@/components/LeaderboardStoryModal';
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
  const [storyOpen, setStoryOpen] = useState(false);
  const [globalEntries, setGlobalEntries] = useState<PublicLeaderboardEntry[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(true);

  // Pull the global public leaderboard from Firestore
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await fetchPublicLeaderboard(50);
      if (!cancelled) {
        setGlobalEntries(entries);
        setLoadingGlobal(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const ranked = useMemo<Row[]>(() => {
    // Merge sources:
    //   1. Real cross-user profiles from Firestore (globalEntries)
    //   2. Your own profiles (in case they haven't synced yet, or Firebase isn't configured)
    //   3. Fictional legends (always shown to seed the board)
    // Deduplicate by profile id so the same kid doesn't appear twice.

    const rows: Omit<Row, 'rank' | 'isYou'>[] = [];
    const seenIds = new Set<string>();
    const myProfileIds = ready ? new Set(store.profiles.map(p => p.id)) : new Set<string>();
    const activeId = store.activeProfileId;

    // 1) Global Firestore entries (other people's profiles)
    for (const e of globalEntries) {
      if (seenIds.has(e.profileId)) continue;
      seenIds.add(e.profileId);
      rows.push({
        name: e.name,
        title: TIER_LABEL[e.tier] || e.tier,
        tier: e.tier,
        puzzle: '—',
        emoji: e.avatar,
        xp: e.xp,
        _profileId: e.profileId
      } as Omit<Row, 'rank' | 'isYou'> & { _profileId?: string });
    }

    // 2) My own local profiles — usually these are already in globalEntries
    //    after sync, but add any missing ones
    if (ready) {
      for (const p of store.profiles) {
        if (seenIds.has(p.id)) continue;
        seenIds.add(p.id);
        const bestSolve = p.solves.length > 0
          ? p.solves[p.solves.length - 1].productName
          : '—';
        rows.push({
          name: p.name,
          title: TIER_LABEL[p.tier as Tier] || p.tier,
          tier: p.tier as Tier,
          puzzle: bestSolve,
          emoji: p.avatar,
          xp: p.xp,
          _profileId: p.id
        } as Omit<Row, 'rank' | 'isYou'> & { _profileId?: string });
      }
    }

    // 3) Fictional legends (seed)
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

    rows.sort((a, b) => b.xp - a.xp);

    return rows.map((row, i) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileId = (row as any)._profileId as string | undefined;
      const isYou = !!(profileId && myProfileIds.has(profileId) && profileId === activeId);
      return { ...row, rank: i + 1, isYou };
    });
  }, [store, ready, globalEntries]);

  const yourRank = ranked.find(r => r.isYou)?.rank;

  return (
    <div className="view active">
      <section className="page-section">
        <Link href="/" className="back-home-link">← Back to home</Link>
        <div className="page-header">
          <h1>🏆 Sky Trail Leaderboard</h1>
          <p>This week&apos;s brainiest Llamas. Ranked by total XP earned from solves.</p>
          {ranked.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <button className="btn-primary" onClick={() => setStoryOpen(true)}>
                ▶ Watch Top 10 Stories
              </button>
            </div>
          )}
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

      <LeaderboardStoryModal
        open={storyOpen}
        onClose={() => setStoryOpen(false)}
        champions={ranked.slice(0, 10).map(r => ({
          rank: r.rank,
          name: r.name,
          title: r.title,
          tier: r.tier,
          emoji: r.emoji,
          xp: r.xp,
          puzzle: r.puzzle,
          isYou: r.isYou
        }))}
      />
    </div>
  );
}
