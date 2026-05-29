'use client';

import Link from 'next/link';
import { useStore } from '@/lib/StoreContext';
import { priceToNumber } from '@/lib/products';

export default function CartPage() {
  const { store, ready, setCartQty, removeFromCart, toggleWishlist } = useStore();

  if (!ready) {
    return (
      <div className="view view-cart active">
        <section className="page-section"><h1>Cart 🛒</h1></section>
      </div>
    );
  }

  const cart = store.cart;
  const isEmpty = cart.length === 0;
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + priceToNumber(i.price) * i.qty, 0);
  const shipping = subtotal === 0 ? 0 : (subtotal >= 40 ? 0 : 5.99);
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="view view-cart active">
      <section className="page-section">
        <Link href="/" className="back-home-link">← Back to Home</Link>
        <div className="page-header">
          <h1>Your Cart 🛒</h1>
          <p>{isEmpty ? '0 items in your cart' : `${totalQty} ${totalQty === 1 ? 'item' : 'items'} in your cart`}</p>
        </div>

        {!isEmpty && (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map(item => {
                const tierLc = (item.tier || '').toLowerCase();
                const lineTotal = (priceToNumber(item.price) * item.qty).toFixed(2);
                return (
                  <div key={item.cartId} className="cart-item">
                    <div className={`cart-item-banner ${tierLc}`}>
                      <span>{item.emoji}</span>
                      {item.tier && <span className="mini-tier">{item.tier}</span>}
                    </div>
                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <div className="meta">{item.meta}</div>
                      <div className="cart-item-actions">
                        <button className="remove-btn" onClick={() => removeFromCart(item.cartId)}>✕ Remove</button>
                        <button onClick={() => { toggleWishlist(item); removeFromCart(item.cartId); }}>♡ Save for later</button>
                      </div>
                    </div>
                    <div className="qty-control">
                      <button onClick={() => setCartQty(item.cartId, item.qty - 1)}>−</button>
                      <span className="qty">{item.qty}</span>
                      <button onClick={() => setCartQty(item.cartId, item.qty + 1)}>+</button>
                    </div>
                    <div className="cart-item-price">${lineTotal}</div>
                  </div>
                );
              })}
            </div>

            <aside className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></div>
              <div className="summary-row"><span>Estimated tax</span><span>${tax.toFixed(2)}</span></div>
              <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
              <Link href="/checkout" className="btn-primary checkout-btn">Checkout →</Link>
              <p className="trust-note">🔒 Secure checkout · 🚚 Free shipping over $40 · ↩️ 30-day returns</p>
              <Link href="/" className="continue-shopping">← Continue shopping</Link>
            </aside>
          </div>
        )}

        {isEmpty && (
          <div className="empty-state visible">
            <div className="empty-emoji">🛒</div>
            <h2>Your cart is empty!</h2>
            <p>Tap any tier banner on the home page to start your Sky Trail adventure.</p>
            <Link href="/" className="btn-primary">Shop Puzzles →</Link>
          </div>
        )}
      </section>
    </div>
  );
}
