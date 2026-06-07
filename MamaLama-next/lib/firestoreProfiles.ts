'use client';

// Sky Trail profile sync to Firestore.
//
// Schema:
//   /users/{uid}/profiles/{profileId}   ← private profile data
//   /leaderboard/{profileId}            ← denormalized public snapshot for global leaderboard
//
// Writes go to BOTH locations (the leaderboard one only contains safe public fields).

import {
  getFirestore,
  doc, setDoc, deleteDoc, getDocs, collection, query, orderBy, limit,
  serverTimestamp,
  type Firestore
} from 'firebase/firestore';
import { getFirebaseApp, isFirebaseConfigured } from './firebase';
import type { Profile, Tier } from '@/types';

let db: Firestore | null = null;
function getDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
}

// ============ Private profile writes ============

export async function upsertProfileFirestore(uid: string, profile: Profile): Promise<void> {
  if (!isFirebaseConfigured() || !uid) return;
  try {
    await setDoc(
      doc(getDb(), 'users', uid, 'profiles', profile.id),
      {
        id: profile.id,
        name: profile.name,
        age: profile.age,
        avatar: profile.avatar,
        xp: profile.xp,
        tier: profile.tier,
        badges: profile.badges,
        solves: profile.solves,
        createdAt: profile.createdAt,
        updatedAt: Date.now()
      },
      { merge: true }
    );
    // Mirror a safe subset to the public leaderboard
    await upsertLeaderboardEntry(uid, profile);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[firestoreProfiles] upsertProfile failed:', err);
  }
}

export async function deleteProfileFirestore(uid: string, profileId: string): Promise<void> {
  if (!isFirebaseConfigured() || !uid) return;
  try {
    await deleteDoc(doc(getDb(), 'users', uid, 'profiles', profileId));
    // Remove from public leaderboard too
    await deleteDoc(doc(getDb(), 'leaderboard', profileId));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[firestoreProfiles] deleteProfile failed:', err);
  }
}

/**
 * Pull all profiles for this UID. Called on app load to hydrate from Firestore.
 * Falls back to localStorage if Firestore is unreachable.
 */
export async function listProfilesFirestore(uid: string): Promise<Profile[]> {
  if (!isFirebaseConfigured() || !uid) return [];
  try {
    const snap = await getDocs(collection(getDb(), 'users', uid, 'profiles'));
    return snap.docs.map(d => d.data() as Profile);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[firestoreProfiles] listProfiles failed:', err);
    return [];
  }
}

// ============ Public leaderboard ============

export interface PublicLeaderboardEntry {
  profileId: string;
  parentUid: string;       // for security-rule write check; not displayed
  name: string;
  avatar: string;
  tier: Tier;
  xp: number;
  solvesCount: number;
  updatedAt: number;
}

async function upsertLeaderboardEntry(uid: string, profile: Profile): Promise<void> {
  await setDoc(
    doc(getDb(), 'leaderboard', profile.id),
    {
      profileId: profile.id,
      parentUid: uid,
      name: profile.name,
      avatar: profile.avatar,
      tier: profile.tier,
      xp: profile.xp,
      solvesCount: profile.solves.length,
      updatedAt: Date.now(),
      updatedAtServer: serverTimestamp()
    },
    { merge: true }
  );
}

/**
 * Read the global public leaderboard, top N by XP.
 * Anyone can call this (it's a public-read collection).
 */
export async function fetchPublicLeaderboard(maxEntries = 50): Promise<PublicLeaderboardEntry[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const q = query(
      collection(getDb(), 'leaderboard'),
      orderBy('xp', 'desc'),
      limit(maxEntries)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as PublicLeaderboardEntry);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[firestoreProfiles] fetchPublicLeaderboard failed:', err);
    return [];
  }
}
