// Server-only Firebase Admin SDK. Used in API routes for:
//   - writing/reading orders in Firestore (bypasses security rules)
//   - verifying ID tokens sent from the /admin page
//
// Requires a service account from the Firebase Console:
//   Project settings → Service accounts → Generate new private key
// The JSON file gives you `client_email` and `private_key`.

import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
// The private key in .env.local has escaped \n — convert back to real newlines
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

let app: App | null = null;
let db: Firestore | null = null;
let adminAuth: Auth | null = null;

export function isAdminConfigured(): boolean {
  return !!(projectId && clientEmail && privateKey);
}

function getAdminApp(): App {
  if (!isAdminConfigured()) {
    throw new Error(
      'Firebase Admin not configured. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID, ' +
      'FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in .env.local'
    );
  }
  if (!app) {
    const existing = getApps()[0];
    app = existing ?? initializeApp({
      credential: cert({
        projectId: projectId!,
        clientEmail: clientEmail!,
        privateKey: privateKey!
      })
    });
  }
  return app;
}

export function getDb(): Firestore {
  if (!db) db = getFirestore(getAdminApp());
  return db;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) adminAuth = getAuth(getAdminApp());
  return adminAuth;
}

// Comma-separated list of admin emails. We accept either ADMIN_EMAILS (comma list)
// or fall back to a single default for convenience.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'rawselavigne@gmail.com')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Verify a Firebase ID token from an Authorization: Bearer <token> header.
// Returns the decoded token if valid AND the email is in the admin list, else null.
export async function verifyAdminFromRequest(req: Request): Promise<{ uid: string; email: string } | null> {
  const authHeader = req.headers.get('authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(match[1]);
    if (!decoded.email || !isAdminEmail(decoded.email)) return null;
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}
