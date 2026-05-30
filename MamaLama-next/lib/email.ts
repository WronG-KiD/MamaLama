// Transactional emails via Resend. Server-only.
//
// All sends are best-effort — if Resend isn't configured or the request fails,
// we log and move on rather than blocking the order flow. The order is still
// persisted in Firestore and visible in the admin panel.
//
// To enable: set RESEND_API_KEY and RESEND_FROM in .env.local / Vercel env.
//   RESEND_API_KEY=re_xxxxx
//   RESEND_FROM="MamaLama <orders@mamalama.shop>"   (must be a verified sender)
// During Resend's free tier you can use "onboarding@resend.dev" as RESEND_FROM
// to send emails to any address without verifying your own domain first.

import { Resend } from 'resend';
import type { OrderDoc } from './orders';

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM || 'MamaLama <onboarding@resend.dev>';

let client: Resend | null = null;

export function isEmailConfigured(): boolean {
  return !!apiKey;
}

function getClient(): Resend | null {
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

// Small util — wrap any value in escaped HTML so untrusted strings can't break the template
function esc(s: string | number | undefined | null): string {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inrFmt(amount: number): string {
  return '₹' + amount.toFixed(2);
}

// Shared layout for all transactional emails
function layout(title: string, preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f7f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#2b2147;">
  <span style="display:none;font-size:1px;color:#f7f3ff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f3ff;padding:30px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:white;border-radius:18px;overflow:hidden;box-shadow:0 12px 32px rgba(139,92,246,0.15);">
        <tr><td style="background:linear-gradient(135deg,#8b5cf6,#ff6fa8);padding:24px;text-align:center;color:white;">
          <h1 style="margin:0;font-size:28px;font-weight:700;">MamaLama 🦙</h1>
          <p style="margin:6px 0 0;opacity:0.92;font-size:14px;">Puzzles &amp; toys for curious kids</p>
        </td></tr>
        <tr><td style="padding:28px 28px 8px;">${body}</td></tr>
        <tr><td style="padding:18px 28px 28px;color:#6b5a8f;font-size:12px;line-height:1.5;text-align:center;border-top:1px solid #f0eaff;">
          Questions? Reply to this email or write us at <a href="mailto:hello@mamalama.shop" style="color:#8b5cf6;">hello@mamalama.shop</a>.<br/>
          © ${new Date().getFullYear()} MamaLama · A mama, a teacher, a friend 💜
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendOrderConfirmation(order: OrderDoc): Promise<void> {
  const r = getClient();
  if (!r) {
    console.warn('[email] Resend not configured (RESEND_API_KEY missing). Skipping confirmation.');
    return;
  }
  const to = order.shipping.email;
  if (!to) {
    console.warn('[email] Order has no shipping.email. Skipping confirmation. order:', order.orderNumber);
    return;
  }
  console.log('[email] sendOrderConfirmation → to:', to, 'order:', order.orderNumber, 'from:', fromAddress);

  const itemsHtml = order.items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px dashed #e8dfff;font-size:14px;">
        <span style="display:inline-block;width:28px;text-align:center;">${esc(i.emoji)}</span>
        ${esc(i.name)} <span style="color:#6b5a8f;">× ${i.qty}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px dashed #e8dfff;text-align:right;font-weight:600;">${inrFmt(Number(i.price.replace(/[^0-9.]/g, '')) * i.qty)}</td>
    </tr>
  `).join('');

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#2b2147;">Thanks for your order, ${esc(order.shipping.firstName)}! 🎉</h2>
    <p style="margin:0 0 16px;color:#6b5a8f;font-size:15px;line-height:1.55;">
      We're packing up your puzzles with care. Here's your receipt — keep this email handy for tracking.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0;background:#faf6ff;border-radius:12px;padding:14px 16px;font-size:13px;">
      <tr><td style="color:#6b5a8f;">Order number</td><td style="text-align:right;font-weight:600;">${esc(order.orderNumber)}</td></tr>
      <tr><td style="color:#6b5a8f;padding-top:6px;">Placed</td><td style="text-align:right;padding-top:6px;">${esc(new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }))}</td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${itemsHtml}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;font-size:14px;">
      <tr><td style="padding:4px 0;color:#6b5a8f;">Subtotal</td><td style="text-align:right;padding:4px 0;">${inrFmt(order.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;color:#6b5a8f;">Shipping</td><td style="text-align:right;padding:4px 0;">${order.shippingFee === 0 ? 'FREE' : inrFmt(order.shippingFee)}</td></tr>
      <tr><td style="padding:4px 0;color:#6b5a8f;">Tax</td><td style="text-align:right;padding:4px 0;">${inrFmt(order.tax)}</td></tr>
      <tr><td style="padding:10px 0 4px;border-top:2px dashed #e8dfff;font-weight:700;">Total paid</td><td style="text-align:right;padding:10px 0 4px;border-top:2px dashed #e8dfff;font-weight:700;color:#ff3b8b;font-size:18px;">${inrFmt(order.total)}</td></tr>
    </table>
    <h3 style="margin:24px 0 6px;font-size:15px;color:#2b2147;">Shipping to</h3>
    <p style="margin:0;color:#6b5a8f;font-size:14px;line-height:1.6;">
      ${esc(order.shipping.firstName)} ${esc(order.shipping.lastName)}<br/>
      ${esc(order.shipping.address)}<br/>
      ${esc(order.shipping.city)}, ${esc(order.shipping.state)} ${esc(order.shipping.zip)}<br/>
      ${esc(order.shipping.country)}
    </p>
    <p style="margin:18px 0 0;font-size:14px;color:#6b5a8f;">
      We'll send a shipping notification with tracking as soon as your order leaves the studio (usually within 1–2 business days).
    </p>`;

  try {
    const result = await r.emails.send({
      from: fromAddress,
      to,
      subject: `Order confirmed · ${order.orderNumber} 🦙`,
      html: layout(`Order ${order.orderNumber}`, `Thanks for your MamaLama order — total ${inrFmt(order.total)}`, body)
    });
    console.log('[email] sendOrderConfirmation OK →', result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[email] sendOrderConfirmation failed:', err);
  }
}

export async function sendShippingNotification(order: OrderDoc): Promise<void> {
  const r = getClient();
  if (!r) {
    console.warn('[email] Resend not configured. Skipping shipping notification.');
    return;
  }
  const to = order.shipping.email;
  if (!to) {
    console.warn('[email] Order has no shipping.email. Skipping shipping notification. order:', order.orderNumber);
    return;
  }
  console.log('[email] sendShippingNotification → to:', to, 'order:', order.orderNumber);

  const trackingBlock = order.trackingNumber
    ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;background:#e9f7ff;border-radius:12px;padding:14px 16px;font-size:14px;">
        <tr><td style="color:#6b5a8f;">Tracking number</td><td style="text-align:right;font-weight:600;">${esc(order.trackingNumber)}</td></tr>
        ${order.trackingUrl ? `<tr><td colspan="2" style="padding-top:8px;text-align:center;"><a href="${esc(order.trackingUrl)}" style="display:inline-block;background:#8b5cf6;color:white;padding:10px 18px;border-radius:20px;text-decoration:none;font-weight:600;font-size:14px;">Track package →</a></td></tr>` : ''}
      </table>`
    : '';

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#2b2147;">Your order is on its way! 📦</h2>
    <p style="margin:0 0 12px;color:#6b5a8f;font-size:15px;line-height:1.55;">
      Order <strong>${esc(order.orderNumber)}</strong> just left our studio. Expected arrival in 3–5 business days.
    </p>
    ${trackingBlock}
    <p style="margin:18px 0 0;font-size:14px;color:#6b5a8f;">
      As soon as your package is delivered, your little Llama can start solving — and you can come back to MamaLama and log the solve in their Sky Trail.
    </p>`;

  try {
    const result = await r.emails.send({
      from: fromAddress,
      to,
      subject: `Shipped · ${order.orderNumber} 📦`,
      html: layout(`Shipped ${order.orderNumber}`, `Your MamaLama order is on its way`, body)
    });
    console.log('[email] sendShippingNotification OK →', result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[email] sendShippingNotification failed:', err);
  }
}
