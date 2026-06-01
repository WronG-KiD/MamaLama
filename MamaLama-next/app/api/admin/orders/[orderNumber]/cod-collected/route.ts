// POST /api/admin/orders/:orderNumber/cod-collected
// Admin marks the cash collected on a COD order.

import { NextResponse } from 'next/server';
import { verifyAdminFromRequest, isAdminConfigured } from '@/lib/firebase-admin';
import { getOrder, updateOrder } from '@/lib/orders';

export async function POST(
  req: Request,
  { params }: { params: { orderNumber: string } }
) {
  if (!isAdminConfigured()) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
  const admin = await verifyAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const order = await getOrder(params.orderNumber);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.paymentMode !== 'cod') return NextResponse.json({ error: 'Not a COD order' }, { status: 400 });
  if (order.codCollected) return NextResponse.json({ error: 'Already marked collected' }, { status: 400 });

  await updateOrder(params.orderNumber, {
    codCollected: true,
    codCollectedAt: new Date().toISOString(),
    status: 'delivered',
    deliveredAt: new Date().toISOString()
  });

  return NextResponse.json({ ok: true });
}
