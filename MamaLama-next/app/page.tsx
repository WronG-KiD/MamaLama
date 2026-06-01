import Link from 'next/link';
import CategoryNav from '@/components/CategoryNav';
import HeroSlider from '@/components/HeroSlider';
import TierBanners from '@/components/TierBanners';
import { LEGENDS } from '@/lib/legends';

function rankMedal(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export default function HomePage() {
  // Top 3 by XP for the homepage teaser
  const top3 = [...LEGENDS].sort((a, b) => b.xp - a.xp).slice(0, 3);

  return (
    <>
      <CategoryNav />
      <div className="view view-home active">
        <HeroSlider />
        <TierBanners />

        <section className="sky-trail-section">
          <h2>Climb Your Sky Trail 🌈</h2>
          <p className="subtitle">Every little Llama earns titles, unlocks rewards, and reaches for the Cloud Castle.</p>
          <div className="tier-ladder">
            {[
              { c: 'd', l: 'D', t: 'Tiny Thinker',       a: 'Ages 2–3' },
              { c: 'c', l: 'C', t: 'Clever Cadet',       a: 'Ages 3–5' },
              { c: 'b', l: 'B', t: 'Puzzle Pro',         a: 'Ages 4–6' },
              { c: 'a', l: 'A', t: 'Master at Work',     a: 'Ages 6–8' },
              { c: 's', l: 'S', t: 'Prophet of Puzzles', a: 'Legend' }
            ].map(s => (
              <div key={s.l} className={`tier-step ${s.c}`}>
                <div className="step-circle">{s.l}</div>
                <div className="tier-label"><strong>{s.t}</strong>{s.a}</div>
              </div>
            ))}
          </div>
          <div className="trail-cta">
            <Link href="/trail" className="btn-primary">Discover My Trail ✨</Link>
          </div>
        </section>

        {/* Compact leaderboard teaser — top 3 only, full board lives at /leaderboard */}
        <section className="leaderboard-section">
          <div className="leaderboard-header">
            <h2>🏆 This Week&apos;s Top 3 Champions</h2>
            <p>Top XP earners on the Sky Trail. Climb the ranks!</p>
          </div>
          <div className="leaderboard-list" style={{ maxWidth: 760, margin: '0 auto' }}>
            {top3.map((l, idx) => {
              const rank = idx + 1;
              const rowClass = rank === 1 ? 'top' : rank === 2 ? 'top-2' : 'top-3';
              return (
                <div key={l.name} className={`leader-row ${rowClass}`}>
                  <div className="leader-rank">{rankMedal(rank)}</div>
                  <div className="leader-avatar">{l.emoji}</div>
                  <div className="leader-info">
                    <div className="leader-name">{l.name}</div>
                    <div className="leader-title">{l.title}</div>
                  </div>
                  <div className="leader-puzzle"><strong>{l.xp} XP</strong></div>
                  <div className={`leader-tier ${l.tier.toLowerCase()}`}>{l.tier}</div>
                </div>
              );
            })}
          </div>
          <div className="trail-cta" style={{ marginTop: 24 }}>
            <Link href="/leaderboard" className="btn-primary">See full leaderboard →</Link>
          </div>
        </section>
      </div>
    </>
  );
}
