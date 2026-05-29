'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/StoreContext';
import { priceToNumber } from '@/lib/products';
import type { RazorpayOptions } from '@/components/RazorpayScript';

type Step = 1 | 2;

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const EMPTY_SHIPPING: ShippingForm = {
  firstName: '', lastName: '', email: '', phone: '',
  address: '', city: '', state: '', zip: '', country: 'India'
};

function isEmail(s: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
function isPhone(s: string) { return /^[+]?[0-9\s\-()]{8,}$/.test(s); }

export default function CheckoutPage() {
  const { store, ready, clearCart } = useStore();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [shipping, setShipping] = useState<ShippingForm>(EMPTY_SHIPPING);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({});
  const [processing, setProcessing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Redirect to /cart if it's empty (only after hydration)
  useEffect(() => {
    if (ready && store.cart.length === 0) router.replace('/cart');
  }, [ready, store.cart.length, router]);

  const subtotal = store.cart.reduce((s, i) => s + priceToNumber(i.price) * i.qty, 0);
  const shippingFee = subtotal === 0 ? 0 : (subtotal >= 40 ? 0 : 5.99);
  const tax = subtotal * 0.08;
  const total = subtotal + shippingFee + tax;

  function validateShipping(): boolean {
    const next: Partial<Record<keyof ShippingForm, string>> = {};
    if (!shipping.firstName.trim()) next.firstName = 'Required';
    if (!shipping.lastName.trim()) next.lastName = 'Required';
    if (!isEmail(shipping.email)) next.email = 'Valid email please';
    if (!isPhone(shipping.phone)) next.phone = 'Valid phone please';
    if (!shipping.address.trim()) next.address = 'Required';
    if (!shipping.city.trim()) next.city = 'Required';
    if (!shipping.state.trim()) next.state = 'Required';
    if (!shipping.zip.trim()) next.zip = 'Required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function update<K extends keyof ShippingForm>(field: K, value: string) {
    setShipping(s => ({ ...s, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  }

  async function payNow() {
    setServerError(null);
    setProcessing(true);

    try {
      // 1) Ask our server to mint a Razorpay order
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: store.cart, shipping })
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'Failed to create order');
        setProcessing(false);
        return;
      }

      // 2) Open the Razorpay Checkout modal
      if (typeof window === 'undefined' || !window.Razorpay) {
        setServerError('Razorpay checkout not loaded — refresh and try again');
        setProcessing(false);
        return;
      }

      const options: RazorpayOptions = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'MamaLama',
        description: `${store.cart.length} item${store.cart.length === 1 ? '' : 's'}`,
        order_id: data.orderId,
        image: '/logo.png',
        prefill: {
          name: `${shipping.firstName} ${shipping.lastName}`.trim(),
          email: shipping.email,
          contact: shipping.phone
        },
        notes: {
          ship_to: `${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zip}`
        },
        theme: { color: '#8b5cf6' },
        handler: async (resp) => {
          // 3) Verify the signature on the server
          const vr = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resp)
          });
          const v = await vr.json();
          if (!vr.ok || !v.verified) {
            setServerError(v.error || 'Payment verification failed');
            setProcessing(false);
            return;
          }
          // 4) Clear the cart and go to success page
          clearCart();
          const params = new URLSearchParams({
            order: v.orderNumber,
            payment: v.razorpayPaymentId,
            total: data.breakdown.total.toFixed(2)
          });
          router.push(`/success?${params.toString()}`);
        },
        modal: {
          ondismiss: () => setProcessing(false)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
      setProcessing(false);
    }
  }

  if (!ready) {
    return (
      <div className="view view-checkout active">
        <section className="page-section"><h1>Checkout 💳</h1></section>
      </div>
    );
  }

  return (
    <div className="view view-checkout active">
      <section className="page-section">
        <Link href="/cart" className="back-home-link">← Back to Cart</Link>
        <div className="page-header"><h1>Checkout 💳</h1></div>

        <div className="checkout-layout">
          <div>
            <div className="checkout-stepper">
              <div className={`step-dot ${step === 1 ? 'active' : 'complete'}`} data-step="1">Shipping</div>
              <div className="step-connector"></div>
              <div className={`step-dot ${step === 2 ? 'active' : ''}`} data-step="2">Review &amp; Pay</div>
            </div>

            {step === 1 && (
              <div className="checkout-card">
                <h3>Shipping address</h3>
                <div className={`form-row two-col`}>
                  <div>
                    <label>First name</label>
                    <input value={shipping.firstName} onChange={e => update('firstName', e.target.value)} />
                    {errors.firstName && <small className="error-msg" style={{ display: 'block' }}>{errors.firstName}</small>}
                  </div>
                  <div>
                    <label>Last name</label>
                    <input value={shipping.lastName} onChange={e => update('lastName', e.target.value)} />
                    {errors.lastName && <small className="error-msg" style={{ display: 'block' }}>{errors.lastName}</small>}
                  </div>
                </div>
                <div className={`form-row two-col`}>
                  <div>
                    <label>Email</label>
                    <input type="email" value={shipping.email} onChange={e => update('email', e.target.value)} />
                    {errors.email && <small className="error-msg" style={{ display: 'block' }}>{errors.email}</small>}
                  </div>
                  <div>
                    <label>Phone (for delivery updates)</label>
                    <input type="tel" value={shipping.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 98765 43210" />
                    {errors.phone && <small className="error-msg" style={{ display: 'block' }}>{errors.phone}</small>}
                  </div>
                </div>
                <div className={`form-row`}>
                  <label>Address</label>
                  <input value={shipping.address} onChange={e => update('address', e.target.value)} />
                  {errors.address && <small className="error-msg" style={{ display: 'block' }}>{errors.address}</small>}
                </div>
                <div className={`form-row two-col`}>
                  <div>
                    <label>City</label>
                    <input value={shipping.city} onChange={e => update('city', e.target.value)} />
                    {errors.city && <small className="error-msg" style={{ display: 'block' }}>{errors.city}</small>}
                  </div>
                  <div>
                    <label>State</label>
                    <input value={shipping.state} onChange={e => update('state', e.target.value)} />
                    {errors.state && <small className="error-msg" style={{ display: 'block' }}>{errors.state}</small>}
                  </div>
                </div>
                <div className={`form-row two-col`}>
                  <div>
                    <label>PIN / ZIP</label>
                    <input value={shipping.zip} onChange={e => update('zip', e.target.value)} />
                    {errors.zip && <small className="error-msg" style={{ display: 'block' }}>{errors.zip}</small>}
                  </div>
                  <div>
                    <label>Country</label>
                    <select value={shipping.country} onChange={e => update('country', e.target.value)}>
                      <option>India</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                    </select>
                  </div>
                </div>
                <div className="checkout-actions">
                  <span></span>
                  <button
                    className="btn-primary"
                    onClick={() => { if (validateShipping()) setStep(2); }}
                  >Continue to Review →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-card">
                <h3>Review &amp; place order</h3>

                <div className="review-block">
                  <h4>Shipping to</h4>
                  <div className="review-item">
                    {shipping.firstName} {shipping.lastName}<br />
                    {shipping.address}<br />
                    {shipping.city}, {shipping.state} {shipping.zip}<br />
                    {shipping.country}<br />
                    📧 {shipping.email} · 📞 {shipping.phone}
                  </div>
                  <button className="edit-link" onClick={() => setStep(1)}>Edit</button>
                </div>

                <div className="review-block">
                  <h4>Payment</h4>
                  <div className="review-item">
                    Pay securely via Razorpay — UPI, cards, netbanking, wallets, EMI.
                  </div>
                </div>

                <div className="review-block">
                  <h4>Items</h4>
                  {store.cart.map(i => (
                    <div key={i.cartId} className="review-item">
                      {i.emoji} {i.name} × {i.qty} — ${(priceToNumber(i.price) * i.qty).toFixed(2)}
                    </div>
                  ))}
                </div>

                {serverError && (
                  <div style={{
                    background: '#ffe8e8', color: '#b91c1c', padding: '12px 14px',
                    borderRadius: 12, marginBottom: 12, fontSize: 14
                  }}>
                    ⚠️ {serverError}
                  </div>
                )}

                <div className="checkout-actions">
                  <button className="btn-secondary" onClick={() => setStep(1)} disabled={processing}>
                    ← Back
                  </button>
                  <button
                    className="btn-primary"
                    onClick={payNow}
                    disabled={processing}
                  >
                    {processing ? 'Opening Razorpay…' : `Pay $${total.toFixed(2)} ✨`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="mini-summary">
            <h3>Order Summary</h3>
            {store.cart.map(i => (
              <div key={i.cartId} className="mini-item">
                <span className="mini-emoji">{i.emoji}</span>
                <span className="mini-name">{i.name} <small>×{i.qty}</small></span>
                <span className="mini-price">${(priceToNumber(i.price) * i.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shippingFee === 0 ? 'Free' : '$' + shippingFee.toFixed(2)}</span></div>
            <div className="summary-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </aside>
        </div>
      </section>
    </div>
  );
}
