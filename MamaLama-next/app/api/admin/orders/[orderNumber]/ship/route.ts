// POST /api/admin/orders/:orderNumber/ship
// Body: { trackingNumber?: string, trackingUrl?: string }
// Marks an order as shipped.

import { NextResponse } from 'next/server';
import { verifyAdminFromRequest, isAdminConfigured } from '@/lib/firebase-admin';
import { getOrder, updateOrder } from '@/lib/orders';
import { sendShippingNotification } from '@/lib/email';

export async function POST(
  req: Request,
  { params }: { params: { orderNumber: string } }
) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
  }
  const admin = await verifyAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const order = await getOrder(params.orderNumber);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.status === 'shipped' || order.status === 'delivered') {
    return NextResponse.json({ error: 'Order already shipped' }, { status: 400 });
  }
  if (order.status !== 'paid') {
    return NextResponse.json({ error: `Cannot ship order in status: ${order.status}` }, { status: 400 });
  }

  let body: { trackingNumber?: string; trackingUrl?: string } = {};
  try { body = await req.json(); } catch { /* allow empty body */ }

  await updateOrder(params.orderNumber, {
    status: 'shipped',
    shippedAt: new Date().toISOString(),
    trackingNumber: body.trackingNumber,
    trackingUrl: body.trackingUrl
  });

  // Fire-and-forget shipping notification email
  getOrder(params.orderNumber).then(updated => {
    if (updated) sendShippingNotification(updated);
  }).catch(() => { /* swallow */ });

  return NextResponse.json({ ok: true });
}
