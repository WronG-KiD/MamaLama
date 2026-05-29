import Link from 'next/link';

const VALUES = [
  { e: '🌱', t: 'Made to Last',  d: 'Heirloom-quality materials. The kind your kids hand down.' },
  { e: '🧠', t: 'Brain First',   d: 'Every product is vetted by educators. Play that grows minds.' },
  { e: '💜', t: 'Family Owned',  d: 'One mama, one teacher, one studio. No corporate parent.' },
  { e: '🎨', t: "Art You'll Frame", d: "Original illustrations from working children's book artists." },
  { e: '🏝️', t: 'Slow & Cozy',   d: 'No 12 launches a year. Small batches, done with care.' },
  { e: '✨', t: 'Gamified Growth', d: 'Sky Trail turns progress into something to feel proud of.' }
];

export default function AboutPage() {
  return (
    <div className="view view-about active">
      <section className="page-section">
        <Link href="/" className="back-home-link">← Back to home</Link>
        <h1>About MamaLama 🦙</h1>

        <div className="info-card">
          <h2>The story</h2>
          <p>
            MamaLama started on a kitchen table in Portland — a mama, a teacher, and a stack of
            puzzle prototypes that the kids couldn&apos;t put down. What began as a side project for
            our own little ones grew into a small studio making puzzles, toys and books we&apos;d be
            proud to gift.
          </p>
          <p>
            Every product is designed to grow with your child — chunky pieces for tiny fingers,
            mythical mind-benders for galaxy brains. We test everything ourselves. If our kids
            don&apos;t love it, it doesn&apos;t ship.
          </p>
        </div>

        <h2 className="section-title">What we care about</h2>
        <div className="values-grid">
          {VALUES.map(v => (
            <div key={v.t} className="value-tile">
              <div className="value-emoji">{v.e}</div>
              <h3>{v.t}</h3>
              <p>{v.d}</p>
            </div>
          ))}
        </div>

        <h2 className="section-title">Meet the founder</h2>
        <div className="founder-card">
          <div className="founder-avatar">🦙</div>
          <div>
            <h3>Lila Marquez</h3>
            <p className="founder-role">Founder, Mama, Chief Puzzle Officer</p>
            <p>
              Former kindergarten teacher turned toy designer. Lives in Portland with two kids,
              one llama-loving husband, and far too many half-built prototypes on the kitchen table.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
