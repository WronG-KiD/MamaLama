'use client';

import Script from 'next/script';

// Loads the Razorpay Checkout script globally. Mount this in app/layout.tsx
// so it's available on every page (cart, checkout, etc) without re-fetching.
export default function RazorpayScript() {
  return (
    <Script
      src="https://checkout.razorpay.com/v1/checkout.js"
      strategy="afterInteractive"
    />
  );
}

// Minimal type for window.Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void; on: (e: string, cb: (resp: unknown) => void) => void };
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  image?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}
