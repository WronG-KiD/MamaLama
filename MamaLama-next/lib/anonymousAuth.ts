'use client';

// Silent anonymous Firebase Auth. Used by the Sky Trail system so each
// browser session gets a stable UID we can scope Firestore data to.
//
// No sign-up forms, no friction. The user never sees this happening.
// If they later want cross-device sync, we can add an "upgrade to email"
// flow that uses Firebase Auth's anonymous→email linking.

import {
  signInAnonymously,
  onAuthStateChanged,
  type User,
  type Auth
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';

let cachedUid: string | null = null;
let signInPromise: Promise<string | null> | null = null;

/**
 * Returns a Firebase UID. If the user isn't signed in yet, signs them in
 * anonymously first. Returns null if Firebase isn't configured.
 *
 * Safe to call from anywhere on the client — it deduplicates concurrent calls.
 */
export async function getOrCreateAnonymousUid(): Promise<string | null> {
  if (!isFirebaseConfigured()) return null;
  if (cachedUid) return cachedUid;
  if (signInPromise) return signInPromise;

  signInPromise = (async () => {
    try {
      const auth = getFirebaseAuth();
      // If already signed in (returning visit), use that
      const existing = await waitForAuth(auth);
      if (existing?.uid) {
        cachedUid = existing.uid;
        return cachedUid;
      }
      // Otherwise sign in anonymously
      const cred = await signInAnonymously(auth);
      cachedUid = cred.user.uid;
      return cachedUid;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[anonymousAuth] sign-in failed:', err);
      return null;
    } finally {
      signInPromise = null;
    }
  })();

  return signInPromise;
}

/**
 * Helper: wait for the FIRST auth state callback so we can tell whether
 * the user is already signed in or not. Resolves with the User (or null).
 */
function waitForAuth(auth: Auth): Promise<User | null> {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

/**
 * Subscribe to auth state changes. Returns an unsubscribe function.
 * Useful if a component wants to react when the UID becomes available.
 */
export function onAnonymousAuthChange(
  callback: (uid: string | null) => void
): () => void {
  if (!isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, (user) => {
    cachedUid = user?.uid ?? null;
    callback(cachedUid);
  });
}

export function getCachedUid(): string | null {
  return cachedUid;
}
