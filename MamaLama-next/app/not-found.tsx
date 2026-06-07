import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="view active">
      <section className="page-section">
        <div className="notfound-hero">
          <div className="notfound-emoji">🎈</div>
          <div className="notfound-code">404</div>
          <h1>Looks like Mama Lama took the long way home</h1>
          <p>
            We can&apos;t find that page anywhere in the sky. Maybe a puzzle piece blew away — or maybe the link was old. Either way, let&apos;s get you back to the clouds.
          </p>
          <div className="notfound-actions">
            <Link href="/" className="btn-primary">🦙 Take me home</Link>
            <Link href="/leaderboard" className="btn-secondary">See the leaderboard</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
