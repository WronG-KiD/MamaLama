'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'failed';

interface OrderRow {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  status: OrderStatus;
  total: number;
  currency: string;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  refundedAt?: string;
  shipping: { firstName: string; lastName: string; email: string; city: string };
  items: Array<{ name: string; qty: number; emoji: string }>;
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: '#fbbf24',
  paid: '#10b981',
  shipped: '#3b82f6',
  delivered: '#8b5cf6',
  refunded: '#6b7280',
  failed: '#ef4444'
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Watch auth state
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setChecking(false);
      return;
    }
    const unsub = onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) { setOrdersError(data.error || 'Failed to load orders'); return; }
      setOrders(data.orders || []);
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => { if (user) loadOrders(); }, [user, loadOrders]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    } catch (err) {
      const code = err instanceof Error ? err.message : 'Login failed';
      setLoginError(code);
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() { await signOut(getFirebaseAuth()); }

  async function markShipped(orderNumber: string) {
    if (!user) return;
    const tracking = window.prompt('Tracking number (optional):') || '';
    setActionMsg('Marking shipped…');
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/orders/${orderNumber}/ship`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: tracking })
      });
      const data = await res.json();
      if (!res.ok) { setActionMsg('❌ ' + (data.error || 'Failed')); return; }
      setActionMsg('✓ Shipped ' + orderNumber);
      loadOrders();
    } catch (err) {
      setActionMsg('❌ ' + (err instanceof Error ? err.message : 'Network error'));
    }
  }

  async function refundOrder(orderNumber: string) {
    if (!user) return;
    if (!window.confirm(`Refund order ${orderNumber}? This issues a full refund via Razorpay.`)) return;
    setActionMsg('Refunding…');
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/orders/${orderNumber}/refund`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) { setActionMsg('❌ ' + (data.error || 'Failed')); return; }
      setActionMsg('✓ Refunded ' + orderNumber);
      loadOrders();
    } catch (err) {
      setActionMsg('❌ ' + (err instanceof Error ? err.message : 'Network error'));
    }
  }

  if (!isFirebaseConfigured()) {
    return (
      <div className="view active">
        <section className="page-section">
          <Link href="/" className="back-home-link">← Back to home</Link>
          <h1>Admin</h1>
          <div className="info-card">
            <h2>Firebase not configured</h2>
            <p>
              Add Firebase env vars to <code>.env.local</code> and restart the dev server.
              See the README for setup steps.
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="view active">
        <section className="page-section"><h1>Loading…</h1></section>
      </div>
    );
  }

  // ----- LOGIN VIEW -----
  if (!user) {
    return (
      <div className="view active">
        <section className="page-section">
          <Link href="/" className="back-home-link">← Back to home</Link>
          <div className="page-header"><h1>Admin login 🔐</h1></div>
          <div className="info-card" style={{ maxWidth: 460 }}>
            <form onSubmit={handleLogin}>
              <div className="form-row">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-row">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {loginError && (
                <div style={{
                  background: '#ffe8e8', color: '#b91c1c', padding: '10px 14px',
                  borderRadius: 12, marginBottom: 12, fontSize: 13
                }}>⚠️ {loginError}</div>
              )}
              <button type="submit" className="btn-primary" disabled={loggingIn}>
                {loggingIn ? 'Signing in…' : 'Sign in →'}
              </button>
            </form>
            <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-soft)' }}>
              Only the admin email(s) configured in <code>ADMIN_EMAILS</code> (or the default
              owner email) can view orders.
            </p>
          </div>
        </section>
      </div>
    );
  }

  // ----- DASHBOARD VIEW -----
  return (
    <div className="view active">
      <section className="page-section">
        <Link href="/" className="back-home-link">← Back to store</Link>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ marginBottom: 4 }}>Orders 📦</h1>
            <p>Signed in as <strong>{user.email}</strong></p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={loadOrders} disabled={loadingOrders}>
              {loadingOrders ? 'Loading…' : '↻ Refresh'}
            </button>
            <button className="btn-secondary" onClick={handleLogout}>Sign out</button>
          </div>
        </div>

        {actionMsg && (
          <div style={{
            background: '#f3eaff', color: 'var(--text-dark)', padding: '10px 16px',
            borderRadius: 12, marginBottom: 12, fontSize: 14
          }}>{actionMsg}</div>
        )}

        {ordersError && (
          <div style={{
            background: '#ffe8e8', color: '#b91c1c', padding: '12px 14px',
            borderRadius: 12, marginBottom: 12
          }}>⚠️ {ordersError}</div>
        )}

        {!loadingOrders && orders.length === 0 && !ordersError && (
          <div className="info-card">
            <h2>No orders yet</h2>
            <p>Once customers start placing orders they&apos;ll show up here in real time.</p>
          </div>
        )}

        {orders.length > 0 && (
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: 18, boxShadow: '0 14px 34px rgba(139, 92, 246, 0.15)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, var(--pop-purple), var(--pop-pink))', color: 'white' }}>
                  <th style={th}>Order</th>
                  <th style={th}>Status</th>
                  <th style={th}>Customer</th>
                  <th style={th}>Items</th>
                  <th style={{ ...th, textAlign: 'right' }}>Total</th>
                  <th style={th}>Placed</th>
                  <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.orderNumber} style={{ borderBottom: '1px solid #f0eaff' }}>
                    <td style={td}>
                      <strong>{o.orderNumber}</strong>
                      {o.razorpayPaymentId && (
                        <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>{o.razorpayPaymentId}</div>
                      )}
                    </td>
                    <td style={td}>
                      <span style={{
                        background: STATUS_COLOR[o.status],
                        color: 'white', padding: '3px 10px', borderRadius: 12,
                        fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3
                      }}>{o.status}</span>
                    </td>
                    <td style={td}>
                      {o.shipping.firstName} {o.shipping.lastName}
                      <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                        {o.shipping.email} · {o.shipping.city}
                      </div>
                    </td>
                    <td style={td}>
                      {o.items.slice(0, 3).map((it, i) => (
                        <span key={i} title={`${it.name} × ${it.qty}`} style={{ marginRight: 4 }}>
                          {it.emoji}×{it.qty}
                        </span>
                      ))}
                      {o.items.length > 3 && <span> +{o.items.length - 3}</span>}
                    </td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>
                      ₹{o.total.toFixed(2)}
                    </td>
                    <td style={{ ...td, fontSize: 12, color: 'var(--text-soft)' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      <br />
                      {new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {o.status === 'paid' && (
                        <button className="btn-secondary" style={btnSm} onClick={() => markShipped(o.orderNumber)}>
                          Ship
                        </button>
                      )}
                      {(o.status === 'paid' || o.status === 'shipped') && (
                        <button className="btn-secondary" style={{ ...btnSm, marginLeft: 6, color: '#ef4444', borderColor: '#fecaca' }} onClick={() => refundOrder(o.orderNumber)}>
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 14px',
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.5
};
const td: React.CSSProperties = {
  padding: '14px',
  verticalAlign: 'top'
};
const btnSm: React.CSSProperties = {
  fontSize: 12,
  padding: '6px 12px'
};
