import Link from 'next/link';
import CategoryNav from '@/components/CategoryNav';
import HeroSlider from '@/components/HeroSlider';
import TierBanners from '@/components/TierBanners';

const LEGENDS = [
  { rank: 1,  name: 'Aarav', title: 'Prophet of Puzzles',  tier: 'S', puzzle: 'Galactic Maze Master', emoji: '👦🏽' },
  { rank: 2,  name: 'Maya',  title: 'Galaxy Brain',        tier: 'S', puzzle: 'Cosmic Logic Cube',    emoji: '👧🏼' },
  { rank: 3,  name: 'Liam',  title: 'Sage of Solutions',   tier: 'S', puzzle: 'Atlas of Riddles',     emoji: '🧒🏻' },
  { rank: 4,  name: 'Zara',  title: 'Llama Legend',        tier: 'S', puzzle: 'Mystery Mountain',     emoji: '👧🏽' },
  { rank: 5,  name: 'Noah',  title: 'Brain Boss',          tier: 'A', puzzle: 'Space Explorer Puzzle',emoji: '👦🏻' },
  { rank: 6,  name: 'Aisha', title: 'Puzzle Prodigy',      tier: 'A', puzzle: 'Dragon Quest 100',     emoji: '👧🏿' },
  { rank: 7,  name: 'Diego', title: 'Mind Maestro',        tier: 'A', puzzle: 'Ocean Depths',         emoji: '🧒🏽' },
  { rank: 8,  name: 'Ella',  title: 'Logic Legend',        tier: 'A', puzzle: 'Forest Friends 80',    emoji: '👧🏻' },
  { rank: 9,  name: 'Kai',   title: 'Master at Work',      tier: 'A', puzzle: 'Pyramid Path',         emoji: '👦🏿' },
  { rank: 10, name: 'Priya', title: 'Brain Buddy Supreme', tier: 'B', puzzle: 'Rainbow Logic Cubes',  emoji: '👧🏽' }
];

function rankRowClass(rank: number) {
  if (rank === 1) return 'top';
  if (rank === 2) return 'top-2';
  if (rank === 3) return 'top-3';
  return '';
}

function rankMedal(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export default function HomePage() {
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

        <section className="leaderboard-section">
          <div className="leaderboard-header">
            <h2>🏆 Sky Trail Leaderboard</h2>
            <p>This week&apos;s brainiest Llamas. Could your little one be next?</p>
          </div>
          <div className="leaderboard-list">
            {LEGENDS.map(l => (
              <div key={l.rank} className={`leader-row ${rankRowClass(l.rank)}`}>
                <div className="leader-rank">{rankMedal(l.rank)}</div>
                <div className="leader-avatar">{l.emoji}</div>
                <div className="leader-info">
                  <div className="leader-name">{l.name}</div>
                  <div className="leader-title">{l.title}</div>
                </div>
                <div className="leader-puzzle">solved <strong>{l.puzzle}</strong></div>
                <div className={`leader-tier ${l.tier.toLowerCase()}`}>{l.tier}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
