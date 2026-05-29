# MamaLama — Next.js storefront

The production rebuild of MamaLama. Migrated from the single-file HTML prototype
in `../MamaLama` into a real Next.js 14 app, ready for Razorpay, Firestore,
and admin tooling.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **React 18**
- **Razorpay** (Phase 3.2) — Indian payment processing
- **Firebase / Firestore** (Phase 3.3) — orders, customers, inventory
- **Firebase Auth** (Phase 3.3) — admin login
- **Resend** (Phase 3.4) — transactional email

## Run it locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

> First time only: copy `.env.example` to `.env.local`. You don't need to fill
> anything in to run the storefront — Razorpay/Firebase keys are only required
> for Phase 3.2+.

## Project layout

```
MamaLama-next/
├── app/
│   ├── layout.tsx            ← Root shell: <Header/>, <main/>, <Footer/>
│   ├── globals.css           ← Ported from index.html (zero visual changes)
│   ├── page.tsx              ← Homepage (hero slider + tier banners + leaderboard)
│   ├── cart/page.tsx
│   ├── wishlist/page.tsx
│   ├── trail/page.tsx        ← Sky Trail (stub — full port in 3.1.5)
│   ├── about/page.tsx
│   ├── faq/page.tsx
│   ├── contact/page.tsx
│   ├── shipping/page.tsx
│   ├── checkout/page.tsx     ← Stub — real Razorpay in 3.2
│   └── success/page.tsx
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Decorations.tsx       ← Sparkles, balloon mascot, welcome bubble
│   ├── HeroSlider.tsx        ← 2-slide auto-advancing carousel
│   ├── TierBanners.tsx       ← Flip-card tier grid
│   └── CategoryNav.tsx
├── lib/
│   ├── products.ts           ← TIER_PRODUCTS, titles, XP thresholds
│   ├── tierBanners.ts        ← 6 tier banner copy/data
│   ├── store.ts              ← Pure functions over Store state
│   └── StoreContext.tsx      ← React context + localStorage persistence
├── types/index.ts            ← Product, CartItem, Profile, Order, Address, …
└── public/                   ← Drop brand assets here (see below)
```

## Brand assets

Copy these from `../MamaLama/` into `public/`:

- `logo.png`
- `cart-icon.png`
- `wishlist-heart.png`
- `mascot-body.png`
- `mascot-arm.png`
- `balloonairtrans.png`
- `favicon.ico` (if you have one)

The components reference them as `/logo.png` etc., so any file at `public/logo.png`
will be served at the root.

## Roadmap

- [x] **Phase 3.1** — Scaffold + port storefront shell
  - [x] Next.js + TypeScript boilerplate
  - [x] CSS lifted into globals.css unchanged
  - [x] Header / Footer / Decorations
  - [x] StoreProvider with localStorage persistence
  - [x] Home, Cart, Wishlist, About, FAQ, Contact, Shipping, Checkout, Success routes
  - [ ] Port full Sky Trail dashboard (3.1.5)
  - [ ] Product story modal (3.1.6)
- [x] **Phase 3.2** — Real Razorpay
  - [x] `/api/create-order` route
  - [x] `/api/verify-payment` route
  - [x] `/api/razorpay-webhook` route
  - [x] Razorpay Checkout modal on /checkout
  - [ ] Test mode end-to-end → live mode flip (your turn — see "Razorpay setup" below)
- [x] **Phase 3.3** — Firestore + admin
  - [x] Firestore schema for orders (`lib/orders.ts`)
  - [x] Persist pending → paid orders via API routes
  - [x] Webhook updates Firestore on capture / refund / failure
  - [x] Protected `/admin` page with Firebase Auth login
  - [x] Mark shipped + refund through Razorpay
  - [ ] Connect to a real Firebase project (your turn — see "Firebase setup" below)
- [x] **Phase 3.4** — Polish & deploy
  - [x] Order confirmation emails (Resend) — `lib/email.ts`
  - [x] Shipping notifications — fired from admin Ship button
  - [ ] Deploy to Vercel + connect domain (your turn — see "Deploy" below)
  - [ ] Razorpay live keys, real money

## Razorpay setup (Phase 3.2)

The API routes and checkout modal are already wired up. You just need to plug in keys.

### 1. Install the SDK

```bash
npm install
```

(The new `razorpay` dep is already in `package.json`.)

### 2. Add test keys to `.env.local`

In your [Razorpay Dashboard](https://dashboard.razorpay.com/app/website-app-settings/api-keys),
click **Generate Test Key**. Copy the Key ID and Key Secret, then create `.env.local`:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET
RAZORPAY_WEBHOOK_SECRET=any_strong_random_string_for_now
```

> The `NEXT_PUBLIC_` prefix exposes the Key ID to the browser (it's safe — it's a public id).
> The Key Secret stays server-only.

### 3. Test the flow end-to-end

Restart the dev server (`npm run dev`), add something to the cart, go to `/checkout`,
fill in the shipping form, and hit **Pay**. Razorpay's modal opens.

Use a **test card** (any of these from Razorpay docs):

| Card | Number | CVV | Expiry | OTP |
|---|---|---|---|---|
| Success (Visa) | `4111 1111 1111 1111` | any 3 digits | any future date | `1234` |
| Failure | `5104 0600 0000 0008` | any | any future | — |

Or test UPI: success VPA `success@razorpay`, failure VPA `failure@razorpay`.

After successful payment you land on `/success` with the order number in the URL.

### 4. Set up webhooks (for production)

In the Razorpay Dashboard → **Settings → Webhooks → Add Webhook**:

- URL: `https://your-domain.com/api/razorpay-webhook` (use [ngrok](https://ngrok.com/) for local testing)
- Secret: same string as `RAZORPAY_WEBHOOK_SECRET` in `.env.local`
- Events: `payment.captured`, `payment.failed`, `payment.authorized`, `refund.processed`, `order.paid`

### 5. Flip Razorpay to live mode

When you're ready for real money:

1. Complete KYC in the Razorpay dashboard (you said this is done ✅)
2. Generate a **Live Key Pair** in the dashboard
3. Update `.env.local` (or your Vercel env vars) with `rzp_live_…` instead of `rzp_test_…`
4. Deploy

That's it. No code changes between test and live.

## Firebase setup (Phase 3.3)

Orders persist to Firestore once Firebase is configured. The `/admin` page lets
you sign in (with Firebase Auth) and manage orders. Both are optional — if
Firebase env vars are missing, checkout still works but orders aren't saved.

### 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project**
2. Name it something like `mamalama-prod`. Disable Google Analytics if you don't need it.
3. Once created, click the **Web icon** (`</>`) in the project overview → **Register app** with nickname `mamalama-web` → copy the `firebaseConfig` object that appears

### 2. Enable Firestore

1. In the left sidebar → **Build → Firestore Database** → **Create database**
2. Choose **Production mode** (we use server-side Admin SDK, which bypasses rules anyway)
3. Pick a region close to your users (`asia-south1` for India)

### 3. Enable Authentication

1. **Build → Authentication** → **Get started**
2. **Sign-in method** tab → enable **Email/Password**
3. **Users** tab → **Add user** → enter your admin email (`rawselavigne@gmail.com`) + a password. **Save these credentials** — they're how you'll log into `/admin`.

### 4. Generate a service account key (for server-side access)

1. Click the ⚙️ gear → **Project settings** → **Service accounts** tab
2. Click **Generate new private key** → confirm. A JSON file downloads.
3. Open that file. You need two values:
   - `client_email` → looks like `firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com`
   - `private_key` → a long multi-line string starting with `-----BEGIN PRIVATE KEY-----`

### 5. Add Firebase env vars to `.env.local`

From the `firebaseConfig` object (step 1) and the service account JSON (step 4):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza…
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE…\n-----END PRIVATE KEY-----\n"

# Optional — comma-separated list of admin emails. Defaults to rawselavigne@gmail.com
ADMIN_EMAILS=rawselavigne@gmail.com
```

> **Important about the private key**: paste it inside double quotes, and keep
> the literal `\n` escape sequences (don't replace them with real newlines).
> The server code converts `\n` back to real newlines at runtime.

### 6. Install + restart

```bash
npm install
npm run dev
```

### 7. Try it

1. Add a puzzle to cart → checkout → pay with test card `4111 1111 1111 1111`
2. Watch the terminal for `[razorpay-webhook]` lines (Razorpay test mode doesn't usually call webhooks unless you set them up; the in-app verify-payment path persists the order regardless)
3. Visit `http://localhost:3000/admin`
4. Sign in with the email/password you set in step 3
5. You should see your order with status `paid` — click **Ship** to mark it shipped, or **Refund** to issue a full Razorpay refund

## Email setup (Phase 3.4 — Resend)

Order confirmation + shipping notification emails go out via [Resend](https://resend.com).
Send is best-effort — if Resend isn't configured, orders still work, customers just don't
get email.

### 1. Sign up for Resend

Go to [resend.com](https://resend.com) and create an account (free tier: 3,000 emails/month).

### 2. Get an API key

Dashboard → **API Keys** → **Create API Key** → name it `mamalama-prod` → permission
`Sending access` → copy the key (starts with `re_…`).

### 3. (Optional but recommended) Verify your sending domain

Dashboard → **Domains** → **Add Domain** → enter `mamalama.shop` (or whatever your real
domain is) → Resend gives you DNS records to add (SPF + DKIM). Add them at your registrar.

Until your domain is verified, you can use Resend's shared sender `onboarding@resend.dev`
to send to **any address** — perfect for testing.

### 4. Add to `.env.local` (and Vercel env later)

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM="MamaLama <onboarding@resend.dev>"
```

After your domain is verified, change `RESEND_FROM` to your real sender, e.g.:
```
RESEND_FROM="MamaLama <orders@mamalama.shop>"
```

### 5. Test

Restart dev server → place a test order that goes to PAID → check the email inbox you
used as the customer email. Confirmation should arrive within seconds.

Mark the order **Ship** from `/admin` → shipping notification email goes out.

## Deploy to Vercel

The whole app deploys to Vercel with zero config.

### 1. Push to GitHub

```bash
cd MamaLama-next
git init
git add .
git commit -m "MamaLama storefront — phase 3.4"
gh repo create mamalama-next --private --source=. --remote=origin --push
```

(Or create the repo manually on github.com and push.)

### 2. Import to Vercel

Go to [vercel.com/new](https://vercel.com/new) → sign in with GitHub → **Import** the
`mamalama-next` repo. Vercel auto-detects Next.js. **Don't deploy yet** — first add the
env vars.

### 3. Copy env vars

In the Vercel project import screen, expand **Environment Variables**. Add every line
from your `.env.local` (Razorpay, Firebase, Firebase Admin, Resend). For
`FIREBASE_ADMIN_PRIVATE_KEY`, keep the literal `\n` escapes — Vercel handles them.

### 4. Deploy

Click **Deploy**. First build takes ~2 min. You'll get a URL like
`mamalama-next-abc123.vercel.app`.

### 5. Configure Razorpay webhook to your Vercel URL

In the Razorpay dashboard → **Settings → Webhooks → Add Webhook**:
- URL: `https://your-vercel-url.vercel.app/api/razorpay-webhook`
- Secret: same value as `RAZORPAY_WEBHOOK_SECRET` in your env
- Events: `payment.captured`, `payment.failed`, `payment.authorized`, `refund.processed`, `order.paid`

This way real Razorpay events on the live site update Firestore + trigger emails.

### 6. (Optional) Connect your custom domain

In Vercel project → **Settings → Domains** → **Add** `mamalama.shop`. Vercel gives you a
DNS record to add at your registrar. Once propagated, your site lives at your real domain.

### 7. Flip Razorpay to live mode

When you're ready to take real payments:
1. Complete KYC in the Razorpay dashboard (you said this is done ✅)
2. Generate a **Live Key Pair** in the dashboard
3. In Vercel → Project Settings → Environment Variables, update `RAZORPAY_KEY_ID`,
   `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` from `rzp_test_…` to `rzp_live_…`
4. Redeploy (Vercel button) — that's it.

## Notes

- The original prototype lives at `../MamaLama/index.html` and stays untouched as a reference.
- All product data is currently hard-coded in `lib/products.ts`. In Phase 3.3 we move it to Firestore.
- Prices are currently labelled in `$` for UI continuity with the prototype, but `/api/create-order` charges them as INR (₹14.99 → 1499 paise). If you want a real FX conversion, update `USD_TO_INR` in `app/api/create-order/route.ts`.
- The cart/wishlist persists in `localStorage` under the key `mamalama_store_v1` — same key as the prototype, so existing carts carry over.
- `/api/create-order` **recomputes prices server-side** against `lib/products.ts` — a tampered client can't pay ₹1 for a ₹4999 puzzle.
- `/api/verify-payment` does a **constant-time HMAC comparison** to avoid signature timing attacks.
