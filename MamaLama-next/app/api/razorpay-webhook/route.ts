// POST /api/razorpay-webhook
//
// Razorpay calls this from its servers on lifecycle events (payment.captured,
// payment.failed, refund.processed, etc). We verify the signature header using
// the shared webhook secret you configure in the Razorpay dashboard, then
// persist the event.
//
// Configure in Razorpay dashboard:
//   Settings → Webhooks → Add Webhook
//   URL: https://your-domain.com/api/razorpay-webhook
//   Secret: same value as RAZORPAY_WEBHOOK_SECRET in your .env.local
//   Events: payment.authorized, payment.captured, payment.failed,
//           refund.created, refund.processed, order.paid
//
// Phase 3.3 will persist these events to Firestore and trigger emails.

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { RAZORPAY_WEBHOOK_SECRET } from '@/lib/razorpay';
import { isAdminConfigured } from '@/lib/firebase-admin';
import { getOrderByRazorpayOrderId, updateOrder, appendWebhookEvent } from '@/lib/orders';
import type { OrderStatus } from '@/lib/orders';

export async function POST(req: Request) {
  if (!RAZORPAY_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
  }

  // We must verify against the *raw* body bytes, not a re-serialized JSON object.
  const rawBody = await req.text();

  const expectedSig = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  const a = Buffer.from(expectedSig);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Signature mismatch' }, { status: 400 });
  }

  let event: { event?: string; payload?: Record<string, unknown> } = {};
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // eslint-disable-next-line no-console
  console.log('[razorpay-webhook]', event.event);

  // Extract razorpay_order_id from the payload — its location varies by event type
  type Payload = {
    payment?: { entity?: { order_id?: string; id?: string } };
    refund?: { entity?: { payment_id?: string } };
    order?: { entity?: { id?: string } };
  };
  const payload = (event.payload || {}) as Payload;
  const rzpOrderId =
    payload.payment?.entity?.order_id ||
    payload.order?.entity?.id ||
    undefined;

  if (isAdminConfigured() && rzpOrderId) {
    try {
      const existing = await getOrderByRazorpayOrderId(rzpOrderId);
      if (existing) {
        const now = new Date().toISOString();
        let statusPatch: Partial<{ status: OrderStatus; paidAt: string; refundedAt: string; failedAt: string; razorpayPaymentId: string }> = {};
        switch (event.event) {
          case 'payment.captured':
            statusPatch = { status: 'paid', paidAt: now };
            if (payload.payment?.entity?.id) statusPatch.razorpayPaymentId = payload.payment.entity.id;
            break;
          case 'payment.failed':
            statusPatch = { status: 'failed', failedAt: now };
            break;
          case 'refund.processed':
          case 'refund.created':
            statusPatch = { status: 'refunded', refundedAt: now };
            break;
        }
        if (Object.keys(statusPatch).length > 0) {
          await updateOrder(existing.orderNumber, statusPatch);
        }
        await appendWebhookEvent(existing.orderNumber, {
          event: event.event || 'unknown',
          payload: event.payload
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[razorpay-webhook] Firestore update failed:', err);
      // Still 200 — Razorpay will retry if we 4xx/5xx, and we'd rather log+move on
    }
  }

  return NextResponse.json({ received: true });
}
