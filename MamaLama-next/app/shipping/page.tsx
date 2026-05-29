import Link from 'next/link';

const TILES = [
  { e: '🚚', t: 'Fast shipping',     d: 'Ships in 1–2 business days.' },
  { e: '🎁', t: 'Free over $40',     d: 'Standard shipping on us.' },
  { e: '↩️', t: '30-day returns',    d: 'Send it back, full refund.' }
];

const RATES = [
  { method: 'Standard (US)',       eta: '3–5 business days',  cost: '$5.99 — FREE over $40' },
  { method: 'Express (US)',        eta: 'Overnight by 2pm',   cost: '$14.99' },
  { method: 'Canada',              eta: '5–10 business days', cost: '$12.99' },
  { method: 'International',       eta: '7–14 business days', cost: '$24.99' }
];

export default function ShippingPage() {
  return (
    <div className="view view-shipping active">
      <section className="page-section">
        <Link href="/" className="back-home-link">← Back to home</Link>
        <h1>Shipping &amp; Returns 📦</h1>

        <div className="shipping-grid">
          {TILES.map(t => (
            <div key={t.t} className="shipping-tile">
              <div className="shipping-emoji">{t.e}</div>
              <h3>{t.t}</h3>
              <p>{t.d}</p>
            </div>
          ))}
        </div>

        <div className="info-card">
          <h2>Shipping rates</h2>
          <table className="shipping-table">
            <thead><tr><th>Method</th><th>ETA</th><th>Cost</th></tr></thead>
            <tbody>
              {RATES.map(r => (
                <tr key={r.method}>
                  <td>{r.method}</td>
                  <td>{r.eta}</td>
                  <td>{r.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-card">
          <h2>Returns &amp; refunds</h2>
          <p>
            We offer a no-questions-asked 30-day return window. Drop us a note at
            <strong> returns@mamalama.shop </strong> with your order number, and we&apos;ll send
            a prepaid label.
          </p>
          <p>
            Refunds land in 3–5 business days on your original payment method once we receive
            the return. Damaged items? We replace them, no return needed.
          </p>
        </div>
      </section>
    </div>
  );
}
