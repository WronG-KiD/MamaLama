// Server-side Razorpay client. Only import this from API routes (never from client components).

import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  // Don't throw at module-load — let route handlers return a clean 500
  // eslint-disable-next-line no-console
  console.warn('[razorpay] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET env vars');
}

export const razorpay = new Razorpay({
  key_id: keyId || 'missing',
  key_secret: keySecret || 'missing'
});

export const RAZORPAY_KEY_ID = keyId || '';
export const RAZORPAY_KEY_SECRET = keySecret || '';
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

export function isRazorpayConfigured(): boolean {
  return !!(keyId && keySecret);
}
