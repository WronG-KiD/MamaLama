import Link from 'next/link';

export default function MerchandisePage() {
  return (
    <div className="view active">
      <section className="page-section">
        <Link href="/" className="back-home-link">← Back to home</Link>
        <div className="coming-soon-hero">
          <div className="coming-soon-emoji">🦙</div>
          <span className="coming-soon-badge">COMING SOON</span>
          <h1>Mama Lama Merch <span className="accent-text">💜</span></h1>
          <p className="coming-soon-tag">
            Wear the Sky Trail. Hug the mascot.
          </p>
          <p className="coming-soon-desc">
            Our mascot collection is on the way — soft toys, tees, stickers, water bottles, and tote bags featuring <strong>Mama Lama</strong> and the whole Sky Trail crew.
            Designed for kids who&apos;ve earned their tier badges and want to show off.
          </p>
          <ul className="coming-soon-list">
            <li>🦙 Mama Lama plush — 30cm, snuggly, machine-washable.</li>
            <li>👕 Tier-themed tees — SS, S, A, B, C, D badges on soft cotton.</li>
            <li>🎒 Sky Trail tote bag — fits puzzles, snacks, a small dragon.</li>
            <li>💧 Mascot water bottle — leak-proof, 500ml, holds glitter potions too.</li>
            <li>✨ Holographic sticker packs — for laptops, journals, helmets.</li>
          </ul>
          <div className="coming-soon-actions">
            <Link href="/" className="btn-primary">Back to the storefront →</Link>
            <Link href="/contact" className="btn-secondary">Tell us what you want made</Link>
          </div>
          <p className="coming-soon-footnote">
            Limited-edition drop — keep an eye on your inbox once you place your first order. 🦙
          </p>
        </div>
      </section>
    </div>
  );
}
