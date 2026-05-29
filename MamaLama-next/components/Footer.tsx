import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="island-footer">
      <div className="island-content">
        <h3>Welcome to the Island! 🏝️</h3>
        <p>Mama Lama has landed. Come say hello — we&apos;d love to hear from you.</p>
        <div className="footer-links">
          <Link href="/about">About MamaLama</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">Help &amp; FAQ</Link>
          <Link href="/shipping">Shipping &amp; Returns</Link>
          <Link href="/faq">Privacy</Link>
        </div>
        <div className="footer-copy">
          © 2026 MamaLama · A mama, a teacher, a friend 💜
        </div>
      </div>
    </footer>
  );
}
