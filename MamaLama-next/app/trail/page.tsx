'use client';

import Link from 'next/link';

export default function TrailPage() {
  return (
    <div className="view view-trail active">
      <section className="page-section">
        <Link href="/" className="back-home-link">← Back to home</Link>
        <h1>My Sky Trail 🌈</h1>
        <p className="subtitle">
          Profiles, badges, XP and leaderboard climbing — being ported from the original prototype.
        </p>
        <div className="info-card">
          <h3>Coming up next</h3>
          <p>
            The full Sky Trail dashboard (profiles, badge gallery, log-a-solve, tier progression)
            is moving over from the old single-file build. It will live here.
          </p>
        </div>
      </section>
    </div>
  );
}
