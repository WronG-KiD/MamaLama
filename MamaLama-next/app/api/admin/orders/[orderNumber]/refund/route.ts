// POST /api/admin/orders/:orderNumber/refund
// Issues a refund through Razorpay for the payment id stored on the order,
// then marks the order refunded.

import { NextResponse } from 'next/server';
import { verifyAdminFromRequest, isAdminConfigured } from '@/lib/firebase-admin';
import { getOrder, updateOrder } from '@/lib/orders';
import { razorpay, isRazorpayConfigured } from '@/lib/razorpay';

export async function POST(
  req: Request,
  { params }: { params: { orderNumber: string } }
) {
  if (!isAdminConfigured()) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
  if (!isRazorpayConfigured()) return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 });
  const admin = await verifyAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const order = await getOrder(params.orderNumber);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (!order.razorpayPaymentId) {
    return NextResponse.json({ error: 'No payment id on this order' }, { status: 400 });
  }
  if (order.status === 'refunded') {
    return NextResponse.json({ error: 'Already refunded' }, { status: 400 });
  }

  try {
    // Full refund (Razorpay's default if no amount is passed)
    await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: order.amountPaise
    } as { amount: number });

    await updateOrder(params.orderNumber, {
      status: 'refunded',
      refundedAt: new Date().toISOString()
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Refund failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
