// POST /api/verify-payment
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Returns: { verified: true, orderNumber } | { verified: false, error }
//
// After Razorpay Checkout succeeds it calls our handler with these three values.
// We re-compute the HMAC of `order_id|payment_id` using our secret and compare.
// This proves the success message wasn't forged client-side.

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { RAZORPAY_KEY_SECRET, isRazorpayConfigured } from '@/lib/razorpay';
import { isAdminConfigured } from '@/lib/firebase-admin';
import { getOrder, getOrderByRazorpayOrderId, updateOrder } from '@/lib/orders';
import { sendOrderConfirmation } from '@/lib/email';

export async function POST(req: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { verified: false, error: 'Razorpay not configured' },
      { status: 500 }
    );
  }

  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ verified: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { verified: false, error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const expectedSig = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  // Constant-time comparison to avoid timing attacks
  const a = Buffer.from(expectedSig);
  const b = Buffer.from(razorpay_signature);
  const verified =
    a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!verified) {
    return NextResponse.json(
      { verified: false, error: 'Signature mismatch' },
      { status: 400 }
    );
  }

  // Find the Firestore order we created earlier and flip it to "paid".
  // If Firestore isn't configured, we still verify the signature successfully
  // and return a fallback order number so the success page works.
  let orderNumber = 'ML-' + Math.floor(100000 + Math.random() * 900000);

  if (isAdminConfigured()) {
    try {
      const existing = await getOrderByRazorpayOrderId(razorpay_order_id);
      if (existing) {
        orderNumber = existing.orderNumber;
        await updateOrder(orderNumber, {
          status: 'paid',
          razorpayPaymentId: razorpay_payment_id,
          paidAt: new Date().toISOString()
        });
        // Re-read the updated doc and fire-and-forget the confirmation email.
        // Don't await — email shouldn't block the success redirect.
        getOrder(orderNumber).then(updated => {
          if (updated) sendOrderConfirmation(updated);
        }).catch(() => { /* swallow */ });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[verify-payment] Firestore update failed:', err);
    }
  }

  return NextResponse.json({
    verified: true,
    orderNumber,
    razorpayPaymentId: razorpay_payment_id,
    razorpayOrderId: razorpay_order_id
  });
}
