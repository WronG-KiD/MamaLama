// GET /api/admin/orders
// Returns the most recent orders. Protected by admin email check.
//
// Headers: Authorization: Bearer <firebase-id-token>

import { NextResponse } from 'next/server';
import { verifyAdminFromRequest, isAdminConfigured } from '@/lib/firebase-admin';
import { listOrders } from '@/lib/orders';
import type { OrderStatus } from '@/lib/orders';

export async function GET(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
  }
  const admin = await verifyAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get('status') as OrderStatus | null;
  const limit = Number(url.searchParams.get('limit')) || 100;

  try {
    const orders = await listOrders({
      limit,
      status: status || undefined
    });
    return NextResponse.json({ orders });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to list orders';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
