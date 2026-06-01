import Link from 'next/link';

export default function CodeChefsPage() {
  return (
    <div className="view active">
      <section className="page-section">
        <Link href="/" className="back-home-link">← Back to home</Link>
        <div className="coming-soon-hero">
          <div className="coming-soon-emoji">👨‍🍳</div>
          <span className="coming-soon-badge">COMING SOON</span>
          <h1>Code Chefs <span className="accent-text">🧑‍💻</span></h1>
          <p className="coming-soon-tag">
            Where little coders cook up big ideas.
          </p>
          <p className="coming-soon-desc">
            We&apos;re brewing up <strong>coding-based projects</strong> designed for kids ages 6–12 — visual block coding kits, robot puzzles, story-driven Python challenges, and beginner-friendly app-builder boxes.
            Each Code Chef kit pairs a physical box with a story arc and a digital companion that grows with your child.
          </p>
          <ul className="coming-soon-list">
            <li>🧩 Visual block coding for ages 6–8 — drag, drop, debug, dance.</li>
            <li>🤖 Hands-on robot kits that teach loops, conditionals, sequences.</li>
            <li>📖 Story-mode Python adventures with hidden mini-bosses.</li>
            <li>🎮 App-builder boxes — kids ship their own playable mini-game.</li>
            <li>🏆 Earn special <strong>Code Chef tier badges</strong> on your Sky Trail.</li>
          </ul>
          <div className="coming-soon-actions">
            <Link href="/trail" className="btn-primary">Start a Sky Trail anyway →</Link>
            <Link href="/contact" className="btn-secondary">Notify me at launch</Link>
          </div>
          <p className="coming-soon-footnote">
            Expected drop: <strong>Q3 2026</strong>. Curious mamas can drop us a note via Contact and we&apos;ll send a first-look invitation. 🦙
          </p>
        </div>
      </section>
    </div>
  );
}
