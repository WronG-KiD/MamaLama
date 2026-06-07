'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { celebratoryBurst } from '@/lib/confetti';

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get('order') || '—';
  const paymentId = params.get('payment') || '';
  const totalStr = params.get('total') || '0.00';

  // 🎉 Fire confetti the moment the success page mounts (real order placed)
  useEffect(() => {
    if (orderNumber !== '—') {
      // Slight delay so the page paints first
      const t = setTimeout(() => celebratoryBurst(), 220);
      return () => clearTimeout(t);
    }
  }, [orderNumber]);

  const today = new Date();
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const eta1 = new Date(today.getTime() + 3 * 86400000);
  const eta2 = new Date(today.getTime() + 6 * 86400000);

  return (
    <div className="view view-success active">
      <section className="page-section">
        <div className="success-hero">
          <div className="big-check">✓</div>
          <h1>Order placed!</h1>
          <p>
            Order <strong>#{orderNumber}</strong>{' '}
            {paymentId && <>· Payment <code style={{ fontSize: 12 }}>{paymentId}</code></>}
            <br />
            A confirmation email is on its way.
          </p>
          <div className="success-actions">
            <Link href="/trail" className="btn-primary">See my Sky Trail →</Link>
            <Link href="/" className="btn-secondary">Keep shopping</Link>
          </div>
        </div>
        <div className="success-details">
          <div className="success-detail-card">
            <strong>Estimated arrival</strong>
            <span>{fmt(eta1)} – {fmt(eta2)}</span>
          </div>
          <div className="success-detail-card">
            <strong>Confirmation</strong>
            <span>Sent to your inbox</span>
          </div>
          <div className="success-detail-card">
            <strong>Total charged</strong>
            <span>${totalStr}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="view view-success active">
        <section className="page-section"><h1>Loading…</h1></section>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
