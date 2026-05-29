// POST /api/create-order
// Body: { items: CartItem[], shipping: Address }
// Returns: { orderId, amount, currency, key }
//
// Mints a Razorpay order on the server (never trust the client for prices).
// We recompute the cart total here against our own product catalogue so a
// tampered client cannot pay ₹1 for a ₹4999 puzzle.

import { NextResponse } from 'next/server';
import { razorpay, isRazorpayConfigured, RAZORPAY_KEY_ID } from '@/lib/razorpay';
import { TIER_PRODUCTS, priceToNumber } from '@/lib/products';
import { isAdminConfigured } from '@/lib/firebase-admin';
import { createOrder } from '@/lib/orders';
import type { CartItem } from '@/types';
import type { OrderShipping } from '@/lib/orders';

// Convert our USD display prices to INR paise for Razorpay.
// MamaLama prices are currently in USD ($14.99 etc). We treat them as the
// rupee price for the Indian market — adjust this constant if you want a real
// FX conversion. Razorpay charges in paise (1 INR = 100 paise).
const USD_TO_INR = 1; // i.e. "$14.99" → ₹14.99 → 1499 paise
const SHIPPING_FREE_THRESHOLD = 40;
const SHIPPING_FEE = 5.99;
const TAX_RATE = 0.08;

function findProductPrice(tier: string | undefined, name: string): number | null {
  if (!tier) return null;
  const tierProducts = TIER_PRODUCTS[tier as keyof typeof TIER_PRODUCTS];
  if (!tierProducts) return null;
  const product = tierProducts.find(p => p.name === name);
  return product ? priceToNumber(product.price) : null;
}

export async function POST(req: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: 'Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local' },
      { status: 500 }
    );
  }

  let body: { items?: CartItem[]; shipping?: Record<string, string> } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const items = body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  // Recompute every line item against the server's catalogue
  let subtotal = 0;
  for (const item of items) {
    const realPrice = findProductPrice(item.tier, item.name);
    if (realPrice === null) {
      return NextResponse.json(
        { error: `Unknown product: ${item.name}` },
        { status: 400 }
      );
    }
    if (!item.qty || item.qty < 1) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }
    subtotal += realPrice * item.qty;
  }

  const shippingFee = subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shippingFee + tax;

  // Convert to paise (Razorpay's smallest unit for INR)
  const amountPaise = Math.round(total * USD_TO_INR * 100);

  // Short receipt id — Razorpay caps at 40 chars
  const receipt = 'ML-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e4);

  try {
    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: {
        customer_email: body.shipping?.email || '',
        customer_name: `${body.shipping?.firstName || ''} ${body.shipping?.lastName || ''}`.trim(),
        item_count: String(items.reduce((s, i) => s + i.qty, 0))
      }
    });

    // Persist a pending order to Firestore (if Firebase is configured).
    // We do this BEFORE the user pays so we have a record even if the user
    // abandons checkout — those rows are useful "abandoned cart" data.
    let orderNumber: string | null = null;
    if (isAdminConfigured()) {
      try {
        const shippingDoc: OrderShipping = {
          firstName: body.shipping?.firstName || '',
          lastName:  body.shipping?.lastName  || '',
          email:     body.shipping?.email     || '',
          phone:     body.shipping?.phone     || '',
          address:   body.shipping?.address   || '',
          city:      body.shipping?.city      || '',
          state:     body.shipping?.state     || '',
          zip:       body.shipping?.zip       || '',
          country:   body.shipping?.country   || ''
        };
        const saved = await createOrder({
          razorpayOrderId: rzpOrder.id,
          razorpayPaymentId: null,
          status: 'pending',
          items,
          shipping: shippingDoc,
          subtotal: Number(subtotal.toFixed(2)),
          shippingFee: Number(shippingFee.toFixed(2)),
          tax: Number(tax.toFixed(2)),
          total: Number(total.toFixed(2)),
          amountPaise,
          currency: 'INR'
        });
        orderNumber = saved.orderNumber;
      } catch (err) {
        // Don't block payment if Firestore is misconfigured — log and continue.
        // eslint-disable-next-line no-console
        console.warn('[create-order] Firestore persist failed:', err);
      }
    }

    return NextResponse.json({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      receipt: rzpOrder.receipt,
      key: RAZORPAY_KEY_ID,
      orderNumber, // null if Firestore isn't configured yet
      breakdown: {
        subtotal: Number(subtotal.toFixed(2)),
        shipping: Number(shippingFee.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2))
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create Razorpay order';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
