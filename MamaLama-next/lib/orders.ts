// Firestore order document helpers. Server-only (uses Admin SDK).
//
// Schema (collection: "orders")
// {
//   orderNumber: "ML-123456",               // user-facing, doc id
//   razorpayOrderId: "order_xxx",
//   razorpayPaymentId: "pay_xxx" | null,
//   status: "pending" | "paid" | "shipped" | "delivered" | "refunded" | "failed",
//   items: CartItem[],
//   shipping: { firstName, lastName, email, phone, address, city, state, zip, country },
//   subtotal, shippingFee, tax, total,        // numbers (in display currency)
//   amountPaise,                              // what Razorpay actually charged
//   currency: "INR",
//   createdAt, paidAt, shippedAt, refundedAt, // ISO strings
//   webhookEvents: [{ event, payload, at }],  // append-only audit trail
//   trackingNumber, trackingUrl               // set when marked shipped
// }

import { getDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { CartItem } from '@/types';

export type OrderStatus =
  | 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'failed';

export type PaymentMode = 'prepaid' | 'cod';

export interface OrderShipping {
  firstName: string; lastName: string; email: string; phone: string;
  address: string; city: string; state: string; zip: string; country: string;
}

export interface OrderDoc {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  status: OrderStatus;
  items: CartItem[];
  shipping: OrderShipping;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;              // full order total (product cost the customer owes us in total)
  amountPaise: number;         // what Razorpay actually charged at checkout (₹100 for COD, full for prepaid)
  currency: string;
  paymentMode: PaymentMode;    // 'prepaid' (full upfront) or 'cod' (₹100 fee + cash on delivery)
  codFee?: number;             // for cod: the non-refundable fee paid online (₹100)
  codAmount?: number;          // for cod: cash to collect on delivery (= total - codFee... no, = total — the prepay is a separate non-refundable fee on TOP)
  codCollected?: boolean;      // true once delivery agent confirms cash received
  codCollectedAt?: string;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  refundedAt?: string;
  failedAt?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  webhookEvents?: Array<{ event: string; at: string; payload?: unknown }>;
}

const COLLECTION = 'orders';

function generateOrderNumber(): string {
  return 'ML-' + Math.floor(100000 + Math.random() * 900000);
}

// Create or get a unique order number that isn't taken in Firestore
async function makeUniqueOrderNumber(): Promise<string> {
  const db = getDb();
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateOrderNumber();
    const snap = await db.collection(COLLECTION).doc(candidate).get();
    if (!snap.exists) return candidate;
  }
  // Fallback — timestamp suffix to guarantee uniqueness
  return 'ML-' + Date.now().toString().slice(-8);
}

export async function createOrder(input: Omit<OrderDoc, 'orderNumber' | 'createdAt'>): Promise<OrderDoc> {
  const db = getDb();
  const orderNumber = await makeUniqueOrderNumber();
  const createdAt = new Date().toISOString();
  const doc: OrderDoc = { ...input, orderNumber, createdAt };
  await db.collection(COLLECTION).doc(orderNumber).set(doc);
  return doc;
}

export async function getOrder(orderNumber: string): Promise<OrderDoc | null> {
  const snap = await getDb().collection(COLLECTION).doc(orderNumber).get();
  return snap.exists ? (snap.data() as OrderDoc) : null;
}

export async function getOrderByRazorpayOrderId(razorpayOrderId: string): Promise<OrderDoc | null> {
  const snap = await getDb().collection(COLLECTION)
    .where('razorpayOrderId', '==', razorpayOrderId)
    .limit(1).get();
  return snap.empty ? null : (snap.docs[0].data() as OrderDoc);
}

export async function listOrders(opts?: { limit?: number; status?: OrderStatus }): Promise<OrderDoc[]> {
  let q: FirebaseFirestore.Query = getDb().collection(COLLECTION).orderBy('createdAt', 'desc');
  if (opts?.status) q = q.where('status', '==', opts.status);
  q = q.limit(opts?.limit ?? 100);
  const snap = await q.get();
  return snap.docs.map(d => d.data() as OrderDoc);
}

export async function updateOrder(
  orderNumber: string,
  patch: Partial<OrderDoc>
): Promise<void> {
  await getDb().collection(COLLECTION).doc(orderNumber).update(patch);
}

// Append a webhook event to the order's audit trail
export async function appendWebhookEvent(
  orderNumber: string,
  evt: { event: string; payload?: unknown }
): Promise<void> {
  await getDb().collection(COLLECTION).doc(orderNumber).update({
    webhookEvents: FieldValue.arrayUnion({ ...evt, at: new Date().toISOString() })
  });
}
